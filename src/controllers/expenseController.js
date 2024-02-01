const express = require('express');
const app = express();
const { addExpense, updateExpense, deleteExpense,fetchExpenseData,fetchExpenseDetails,fetchTotalExpense,fetchExpenseCount,getMaxExpense,getMinExpense,fetchExpenseBetweenDates} = require('../providers/expenseProvider');

const addExpenseController = async (req, res) => {
    const { expense_amount, expense_description, expense_date } = req.body;
    const userId = req.session.user.userId;
  
    try {
      const expenseId = await addExpense(expense_amount, expense_description, userId, expense_date);
      res.redirect('/expanse');
    } catch (error) {
      console.error('Error adding expense:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  };
  

  const updateExpenseController = async (req, res) => {
    const { expense_amount, expense_description, expense_date } = req.body;
    const userId = req.session.user.userId;
    const expenseId = req.params.expenseId;

    try {
        // Fetch expense details before updating
        const existingExpenseDetails = await fetchExpenseDetails(expenseId);

        // Check if the user has permission to update this expense
        if (existingExpenseDetails.user_id !== userId) {
            return res.status(403).json({ message: 'Permission denied. You are not authorized to update this expense.' });
        }

        // Perform the update
        await updateExpense(expenseId, expense_amount, expense_description, userId, expense_date);
        
        // Redirect the user back to the expense page
        res.redirect('/expanse');
    } catch (error) {
        console.error('Error updating expense:', error);
        if (error.message === 'Expense not found') {
            res.status(404).json({ message: 'Expense not found' });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};



  

const deleteExpenseController = async (req, res) => {
  const expenseId = req.params.expenseId;

  try {
    await deleteExpense(expenseId);
    res.json({ message: 'expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


module.exports = {
  addExpenseController,
  updateExpenseController,
  deleteExpenseController,
  fetchExpenseData,
  fetchExpenseDetails,
  fetchTotalExpense,
  fetchExpenseCount,
  getMaxExpense,
  getMinExpense,
  fetchExpenseBetweenDates
};
