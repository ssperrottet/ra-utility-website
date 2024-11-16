const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

const { ensureAuthenticated, ensureAdmin } = require('./middleware/auth');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todo');
const homeRoutes = require('./routes/home');
const adminRoutes = require('./routes/admin');
const calendarRoutes = require('./routes/calendar'); 
const userRoutes = require('./routes/users'); 

// Initialize express app
const app = express();

// Passport Config
require('./config/passportConfig')(passport);

// MongoDB Config
const db = process.env.MONGO_URI;
console.log(db);
// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB Connection Error:', err));

// Body parser Middleware
app.use(express.urlencoded({ extended: false }));

// Express Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.json());
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session(undefined));

// Connect flash for flash messages
app.use(flash());

// Global Variables for flash messages and user
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user; 
  next();
});

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views')); // Adjust this path based on your structure
app.use(expressLayouts);
app.set('layout', 'layout');

// Static Files Middleware
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/', homeRoutes);       // Home page route
app.use('/users', authRoutes);  // User authentication routes
app.use('/todos', ensureAuthenticated, todoRoutes); // To-do list routes (protected)
app.use('/admin', ensureAuthenticated, ensureAdmin, adminRoutes); // Admin routes (protected)
app.use('/calendars', ensureAuthenticated, calendarRoutes); // Calendar routes (protected)
app.use('/users', ensureAuthenticated, userRoutes);

// Error Handling Middleware
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
	title: 'Error',
    error: err,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}\nConnect to web app through http://localhost:${PORT}`));
