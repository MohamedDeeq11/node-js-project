// index.js
const express = require('express');
const path = require('path');
const authRoutes = require('./src/routes/authRoutes'); // Update the path
const app = express();
const session = require('express-session');
const fileUpload = require('express-fileupload');
const ejs = require('ejs');
const bodyParser = require('body-parser'); 

const port = 3000;
app.use(bodyParser.urlencoded({ extended: true })); // Add this line
app.use(bodyParser.json()); // Add this line
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
// Serve static files (like views)
app.use(express.static(path.join(__dirname, 'views')));

app.use(express.static(path.join(__dirname,'public')));



// Configure session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

// Use the authentication routes
app.use('/', authRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
