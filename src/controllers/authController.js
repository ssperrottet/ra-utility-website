const passport = require('passport');

// Login controller
exports.login = (req, res, next) => {
	passport.authenticate('local', (err, user, info) => {
		if (err) return next(err); // Handle error

		if (!user) {
			// Flash a message if authentication fails
			req.flash('error_msg', info.message || 'Login failed');
			return res.redirect('/users/login');
		}

		req.logIn(user, (err) => {
			if (err) return next(err); // Handle login errors

			// Flash a success message (if necessary)
			req.flash('success_msg', 'You are successfully logged in');
			return res.redirect('/'); // Redirect on successful login
		});
	})(req, res, next);
};
