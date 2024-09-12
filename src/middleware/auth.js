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
  
  module.exports = {
    ensureAuthenticated,
    ensureAdmin
  };
  