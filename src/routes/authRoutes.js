const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const app = express();
const {registerUser,loginUser,forgotPassword,resetPassword} = require('../controllers/authController');
const { addIncomeController, updateIncomeController, deleteIncomeController,fetchIncomeData,fetchIncomeDetails,fetchTotalIncome,fetchIncomeCount,getMaxIncome,getMinIncome,} = require('../controllers/incomeController');
const { addExpenseController, updateExpenseController, deleteExpenseController,fetchExpenseData,fetchExpenseDetails,fetchTotalExpense,fetchExpenseCount,getMaxExpense,getMinExpense} = require('../controllers/expenseController');

router.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

router.use(bodyParser.json());

// Authentication middleware
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Registration route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// Forget password route
router.post('/forget', forgotPassword);

// Reset password route
router.post('/resetpass', resetPassword);

router.get('/login', (req, res) => {
  res.render('login'); // Assumes login.ejs is in the views directory
});

router.get('/register', (req, res) => {
  res.render('register'); // Assumes login.ejs is in the views directory

});

router.get('/forget', (req, res) => {
  res.render('forget'); // Assumes login.ejs is in the views directory

});

router.get('/resetpass', (req, res) => {
  res.render('resetpass'); // Assumes login.ejs is in the views directory

});

// Dashboard route (protected by authentication middleware)
router.get('/dashboard', requireLogin, async (req, res) => {
  try {
    const user = req.session.user;
    const totalIncome = await fetchTotalIncome(user.userId);
    const incomeCount = await fetchIncomeCount(user.userId);
    const maxIncome = await getMaxIncome(user.userId);
    const minIncome = await getMinIncome(user.userId);
    
    const totalExpense = await fetchTotalExpense(user.userId);
    const expenseCount = await fetchExpenseCount(user.userId);
    const maxExpense = await getMaxExpense(user.userId);
    const minExpense = await getMinExpense(user.userId);
   

    res.render('dashboard', { user, totalIncome, totalExpense,incomeCount,expenseCount,maxIncome,minIncome,maxExpense,minExpense });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Log uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1); // Exit the process due to the unhandled exception
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      res.status(500).json({
        message: 'Internal Server Error',
      });
    } else {
      res.redirect('/login');
    }
  });
});
// Existing code...

// Income route
router.get('/income', requireLogin, async (req, res) => {
  try {
    const incomeData = await fetchIncomeData(req.session.user.userId);
    const user = req.session.user;
   
    res.render('income', { user: req.session.user, incomeData,user }); // Pass incomeData to the template
  } catch (error) {
    console.error('Error fetching income data:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


router.get('/add_income', requireLogin, (req, res) => {
  // Render the income view
  const user = req.session.user;
  
  res.render('add_income', { user: req.session.user ,user});
});
// Add new income
router.post('/income/add', requireLogin, addIncomeController);

// Update income

router.get('/edit_income/:incomeId', requireLogin, async (req, res) => {
  try {
    const incomeId = req.params.incomeId;
    const incomeDetails = await fetchIncomeDetails(incomeId);
    const user = req.session.user;
   
    res.render('edit_income', {  user: req.session.user,  income: incomeDetails,user });
  } catch (error) {
    console.error('Error fetching income details:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message
    });
  }
});

router.post('/update/:incomeId', requireLogin, updateIncomeController);


// Delete income
router.delete('/income/delete/:incomeId', requireLogin, deleteIncomeController);



// router.get('/expanse', requireLogin, (req, res) => {
//   res.render('expanse', { user: req.session.user });
// });



// Expense route

router.get('/expanse', requireLogin, async (req, res) => {
  try {
    const user = req.session.user;
   
    const expenseData = await fetchExpenseData(req.session.user.userId);
    res.render('expense', { user: req.session.user, expenseData ,user}); // Pass incomeData to the template
  } catch (error) {
    console.error('Error fetching expanse data:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


router.get('/add_expense', requireLogin, (req, res) => {
  // Render the income view
  const user = req.session.user;


  res.render('add_expense', { user: req.session.user,user });
});
// Add new income
router.post('/expense/add', requireLogin, addExpenseController);

// Update income

router.get('/edit_expense/:expenseId', requireLogin, async (req, res) => {
  try {
    const expenseId = req.params.expenseId;
    const expenseDetails = await fetchExpenseDetails(expenseId);
    const user = req.session.user;
    
    res.render('edit_expense', {  user: req.session.user, expense: expenseDetails,user  });
  } catch (error) {
    console.error('Error fetching income details:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message
    });
  }
});


router.post('/update_expense/:expenseId', requireLogin, updateExpenseController);


// Delete income
router.delete('/expense/delete/:expenseId', requireLogin, deleteExpenseController);







module.exports = router;
