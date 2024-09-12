const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
require('dotenv').config();

// Initialize express app
const app = express();

// Passport Config
require('./config/passportConfig')(passport);

// MongoDB Config
const db = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
	.connect(db)
	.then(() => console.log('MongoDB Connected'))
	.catch((err) => console.log('MongoDB Connection Error:', err));

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views')); // Adjust this path based on your structure

app.use(expressLayouts);
app.set('layout', 'layout');

// Bodyparser Middleware
app.use(express.urlencoded({ extended: false }));

// Express Session Middleware
app.use(
	session({
		secret: process.env.SESSION_SECRET || 'secret',
		resave: true,
		saveUninitialized: true,
	})
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash for flash messages
app.use(flash());

// Global Variables for flash messages and user
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user; // Make the user available in all views
	next();
});

app.use((req, res, next) => {
	const publicRoutes = ['/', '/users/login', '/users/register'];
	if (publicRoutes.includes(req.path) || req.isAuthenticated()) {
		return next();
	}
	req.flash('error_msg', 'Please log in to view that resource');
	res.redirect('/users/login');
});

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/users', require('./routes/authRoutes'));
app.use('/todos', require('./routes/todo'));
app.use('/', require('./routes/home'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
