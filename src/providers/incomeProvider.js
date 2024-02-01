const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'expanse_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const fetchIncomeData = async (userId) => {
    const connection = await pool.getConnection();
  
    try {
      const [rows] = await connection.execute('SELECT income.*, users.username FROM income JOIN users ON income.user_id = users.id WHERE income.user_id = ?', [userId]);
      return rows;
    } finally {
      connection.release();
    }
};

const addIncome = async (income_amount, income_description, user_id, income_date) => {
    const connection = await pool.getConnection();
  
    try {
      const [rows] = await connection.execute(
        'INSERT INTO income (income_amount, income_description, user_id, income_date) VALUES (?, ?, ?, ?)',
        [income_amount, income_description, user_id, income_date]
      );
  
      return rows.insertId;
    } finally {
      connection.release();
    }
};

const updateIncome = async (incomeId, amount, description, userId, date) => {
  const connection = await pool.getConnection();

  try {
    await connection.execute(
      'UPDATE income SET income_amount = ?, income_description = ?, user_id = ?, income_date = ? WHERE id = ?',
      [amount, description, userId, date, incomeId]
    );
  } finally {
    connection.release();
  }
};

const deleteIncome = async (incomeId) => {
  const connection = await pool.getConnection();

  try {
    await connection.execute('DELETE FROM income WHERE id = ?', [incomeId]);
  } finally {
    connection.release();
  }
};

const fetchIncomeDetails = async (incomeId) => {
    const connection = await pool.getConnection();
  
    try {
      const [rows] = await connection.execute('SELECT * FROM income WHERE id = ?', [incomeId]);
  
      if (rows.length === 0) {
        throw new Error('Income not found');
      }
  
      return rows[0];
    } finally {
      connection.release();
    }
};
const fetchTotalIncome = async (userId) => {
    const connection = await pool.getConnection();
  
    try {
      const [rows] = await connection.execute('SELECT SUM(income_amount) as totalIncome FROM income WHERE user_id = ?', [userId]);
      return rows[0].totalIncome || 0;
    } finally {
      connection.release();
    }
  };
  const fetchIncomeCount = async (userId) => {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.execute('SELECT COUNT(*) AS incomeCount FROM income WHERE user_id = ?', [userId]);
        return rows[0].incomeCount;
    } finally {
        connection.release();
    }
};

const getMaxIncome = async (userId) => {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.execute('SELECT MAX(income_amount) AS maxIncome FROM income WHERE user_id = ?', [userId]);
        return rows[0].maxIncome || 0;
    } finally {
        connection.release();
    }
};

const getMinIncome = async (userId) => {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.execute('SELECT MIN(income_amount) AS minIncome FROM income WHERE user_id = ?', [userId]);
        return rows[0].minIncome || 0;
    } finally {
        connection.release();
    }
};




module.exports = {
  fetchIncomeDetails,
  fetchIncomeData,
  addIncome,
  updateIncome,
  deleteIncome,
  fetchTotalIncome,
  fetchIncomeCount,
  getMaxIncome,
  getMinIncome
 
};
