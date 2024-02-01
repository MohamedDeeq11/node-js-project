// userProvider.js
const mysql = require('mysql2/promise');

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'expanse_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const addUser = async (full_name, username, email, password, user_type, profile_image) => {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.execute(
      'INSERT INTO users (full_name, username, email, password, user_type, profile_image) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, username, email, password, user_type, profile_image]
    );

    return rows.insertId;
  } finally {
    connection.release();
  }
};


const findUserByUsername = async (username) => {
  const connection = await pool.getConnection();

  try {
    // Perform the SQL query to find a user by username
    const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);

    return rows[0];
  } finally {
    connection.release(); // Release the connection back to the pool
  }
};

const findUserByEmail = async (email) => {
  const connection = await pool.getConnection();

  try {
    // Perform the SQL query to find a user by email
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

    return rows[0];
  } finally {
    connection.release(); // Release the connection back to the pool
  }
};
const updateUserPassword = async (userId, newPassword) => {
  const connection = await pool.getConnection();

  try {
    // Perform the SQL query to update the user's password
    await connection.execute('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]); // Fix: Use the correct parameter names
  } catch (error) {
    // Log the error for debugging
    console.error('Error updating password:', error);

    // Throw the error to be caught by the calling function or handle it appropriately
    throw error;
  } finally {
    connection.release(); // Release the connection back to the pool
  }
};



module.exports = {
  addUser,
  findUserByUsername,
  findUserByEmail,
  updateUserPassword,
};
