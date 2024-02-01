const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'expanse_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const fetchExpenseData = async (userId) => {
    const connection = await pool.getConnection();
  
    try {
      const [rows] = await connection.execute('SELECT expense.*, users.username FROM expense JOIN users ON expense.user_id = users.id WHERE expense.user_id = ?', [userId]);
      return rows;
    } finally {
      connection.release();
    }
};

const addExpense = async (expense_amount, expense_description, user_id, expense_date) => {
    const connection = await pool.getConnection();
  
    try {
      const [rows] = await connection.execute(
        'INSERT INTO expense (expense_amount, expense_description, user_id, expense_date) VALUES (?, ?, ?, ?)',
        [expense_amount, expense_description, user_id, expense_date]
      );
  
      return rows.insertId;
    } finally {
      connection.release();
    }
};

const updateExpense = async (expenseId, amount, description, userId, date) => {
  const connection = await pool.getConnection();

  try {
    await connection.execute(
      'UPDATE expense SET expense_amount = ?, expense_description = ?, user_id = ?, expense_date = ? WHERE id = ?',
      [amount, description, userId, date, expenseId]
    );
  } finally {
    connection.release();
  }
};

const deleteExpense = async (expenseId) => {
  const connection = await pool.getConnection();

  try {
    await connection.execute('DELETE FROM expense WHERE id = ?', [expenseId]);
  } finally {
    connection.release();
  }
};

const fetchExpenseDetails = async (expenseId) => {
    const connection = await pool.getConnection();
  
    try {
      const [rows] = await connection.execute('SELECT * FROM expense WHERE id = ?', [expenseId]);
  
      if (rows.length === 0) {
        throw new Error('Expense not found');
      }
  
      return rows[0];
    } finally {
      connection.release();
    }
};
const fetchTotalExpense = async (userId) => {
    const connection = await pool.getConnection();
  
    try {
      const [rows] = await connection.execute('SELECT SUM(expense_amount) as totalExpense FROM expense WHERE user_id = ?', [userId]);
      return rows[0].totalExpense || 0;
    } finally {
      connection.release();
    }
  };
  const fetchExpenseCount = async (userId) => {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.execute('SELECT COUNT(*) AS expenseCount FROM expense WHERE user_id = ?', [userId]);
        return rows[0].expenseCount;
    } finally {
        connection.release();
    }
};

const getMaxExpense = async (userId) => {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.execute('SELECT MAX(expense_amount) AS maxExpense FROM expense WHERE user_id = ?', [userId]);
        return rows[0].maxExpense || 0;
    } finally {
        connection.release();
    }
};

const getMinExpense = async (userId) => {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.execute('SELECT MIN(expense_amount) AS minExpense FROM expense WHERE user_id = ?', [userId]);
        return rows[0].minExpense || 0;
    } finally {
        connection.release();
    }
};


module.exports = {

    fetchExpenseDetails,
    fetchExpenseData,
  addExpense,
  updateExpense,
  deleteExpense,
  fetchTotalExpense,
  fetchExpenseCount,
  getMaxExpense,
  getMinExpense,


};
