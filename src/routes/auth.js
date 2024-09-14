const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { login, logout } = require('../controllers/authController');

// Show login page
router.get('/login', (req, res) => {
	res.render('login', { title: 'Login' });
});

// Handle login form submission
router.post('/login', login);

// Show registration page
router.get('/register', (req, res) => {
	res.render('register', { title: 'Register' });
});

// Handle registration form submission
router.post('/register', async (req, res) => {
	const { name, email, password } = req.body;

	try {
		// Check if the email already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			req.flash('error_msg', 'Email already registered.');
			return res.redirect('/users/register');
		}

		// Create and save new user
		const newUser = new User({ name, email, password });
		await newUser.save();
		req.flash('success_msg', 'Registration successful. Please log in.');
		res.redirect('/users/login');
	} catch (err) {
		console.error('Error during registration:', err);
		req.flash('error_msg', 'An error occurred during registration.');
		res.redirect('/users/register');
	}
});

// Show home page (after login)
router.get('/', (req, res) => {
	res.render('home', { user: req.user, title: 'Home' });
});

// Logout route
router.get('/logout', (req, res) => {
	req.logout((err) => {
		if (err) {
			console.error('Error during logout:', err);
		}
		req.flash('success_msg', 'You have been logged out.');
		res.redirect('/users/login');
	});
});

module.exports = router;
