// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  req.flash('error_msg', 'Please log in to view that resource');
  res.redirect('/users/login');
}

// Middleware to check if user is an admin
function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
  }
  req.flash('error_msg', 'Admin access required');
  res.redirect('/');
}

// Middleware to check if user is part of the calendar
const Calendar = require('../models/Calendar');

async function isUserPartOfCalendar(req, res, next) {
  try {
      const calendar = await Calendar.findById(req.params.calendarId);
      if (!calendar) {
          return res.status(404).json({ message: 'Calendar not found' });
      }
      const isMember = calendar.users.some(user => user.user_id.equals(req.user._id));
      if (!isMember) {
          req.flash('error_msg', 'Not authorized to access this calendar');
          return res.redirect('/');
      }
      next();
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  ensureAuthenticated,
  ensureAdmin,
  isUserPartOfCalendar
};
