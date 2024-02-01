const path = require('path');
const nodemailer = require('nodemailer');
const { addUser, findUserByUsername, findUserByEmail, updateUserPassword } = require('../providers/userProvider');
const express = require('express');
const app = express();
app.use(express.static(path.join(__dirname,'public')));
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mohadeeq29@gmail.com',
    pass: 'owwigmgrcwebeisk',
  },
});

const registerUser = async (req, res) => {
    const { full_name, username, email, password, password2, user_type } = req.body;
    
    if (password !== password2) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const existingUser = await findUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({ message: 'Email already taken' });
        }

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }

        const profileImage = req.files.profile_image;

        // Construct the absolute path for profileImagePath
        const profileImagePath = `public/uploads/${profileImage.name}`;

        profileImage.mv(profileImagePath, (err) => {
            if (err) {
                console.error('Error saving profile image:', err);
                return res.status(500).json({ message: 'Error saving profile image' });
            }
        });

        const userId = await addUser(full_name, username, email, password, user_type, profileImagePath);

        res.redirect('/login');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

  

  
  
  

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await findUserByEmail(email);

        // Check if the user exists and the password matches
        if (user && user.password === password) {
            // Set the user in the session, including profile image path
            req.session.user = {
                userId: user.id,
                full_name: user.full_name,
                username: user.username,
                email: user.email,
                user_type: user.user_type,
                profile_image: user.profile_image,
// Assuming the profile image path is stored in the 'profile_image' field
            };

            // Redirect to the dashboard
            res.redirect('/dashboard');
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await findUserByEmail(email);

    if (user) {
      // Generate a unique token for password reset
      const resetToken = 'generate-your-unique-token-here'; // You can use a library like 'uuid' for this

      // Store the email in the session
      req.session.resetEmail = email;

      // Send a password reset email
      const resetLink = `http://localhost:3000/resetpass?token=${resetToken}`;
      const mailOptions = {
        from: 'mohadeeq29@gmail.com',
        to: email,
        subject: 'Password Reset',
        html: `Click <a href="${resetLink}">here</a> to reset your password.`,
      };

      // Send the email using the transporter
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          res.status(500).json({ message: 'Internal Server Error' });
        } else {
          console.log('Email sent:', info.response);
          res.json({ message: 'Password reset email sent successfully' });
        }
      });
    } else {
      res.status(404).json({ message: 'Email not found' });
    }
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const resetPassword = async (req, res) => {
  const { password, password2 } = req.body;

  // Validate password match
  if (password !== password2) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    // Retrieve the email from the session
    const email = req.session.resetEmail;

    if (!email) {
      return res.status(400).json({ message: 'Email not found in session' });
    }

    // Find user by email
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's password in the database
    await updateUserPassword(user.id, password);

    console.log('Password updated successfully');

    // Redirect to the login page or dashboard after a successful password reset
    res.redirect('/login');
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
