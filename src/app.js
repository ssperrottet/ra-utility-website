const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const { ensureAuthenticated, ensureAdmin } = require('./middleware/auth');
const { sessionConfig, passportConfig } = require('./config/middlewareConfig');

// Load environment variables
dotenv.config();

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

// MongoDB Configuration
const db = process.env.MONGO_URI;
mongoose
  .connect(db)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB Connection Error:', err));

// Middleware Setup
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session(sessionConfig)); // Session setup
app.use(passport.initialize());
app.use(passport.session());
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
app.set('views', path.join(__dirname, '../views'));
app.use(require('express-ejs-layouts'));
app.set('layout', 'layout');

// Static Files Middleware
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/', homeRoutes); // Public routes
app.use('/users', authRoutes); // Authentication routes
app.use('/todos', ensureAuthenticated, todoRoutes); // Protected to-do routes
app.use('/admin', ensureAuthenticated, ensureAdmin, adminRoutes); // Admin-only routes
app.use('/calendars', ensureAuthenticated, calendarRoutes); // Calendar routes
app.use('/users', ensureAuthenticated, userRoutes); // User management routes

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
