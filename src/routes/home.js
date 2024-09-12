const express = require('express');
const router = express.Router();

// Home page route
router.get('/', (req, res) => {
	res.render('home', {
		title: 'Home',
		user: req.user,
	});
});

module.exports = router;
