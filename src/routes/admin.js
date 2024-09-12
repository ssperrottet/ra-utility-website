const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import User model

// Admin dashboard
router.get('/', (req, res) => {
  res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    user: req.user
  });
});

// Manage users
router.get('/manage-users', async (req, res) => {
    try {
      // Fetch all users from the database
      const users = await User.find(); 
      res.render('admin/manage-users', {
        title: 'Manage Users',
        user: req.user,
        users: users // Pass users to the view
      });
    } catch (err) {
      console.error('Error fetching users:', err);
      req.flash('error_msg', 'An error occurred while fetching users.');
      res.redirect('/admin/dashboard');
    }
  });

module.exports = router;
