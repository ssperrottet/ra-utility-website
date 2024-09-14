// In your routes file, add a route to search users
const express = require('express');
const User = require('../models/User'); // Assuming you have a User model
const router = express.Router();

// Route to search users by name for autocomplete
router.get('/search', async (req, res) => {
    const searchTerm = req.query.q; // Get the search term from the query string
    try {
        // Find users where their name matches the search term
        const users = await User.find({
            name: { $regex: new RegExp(searchTerm, 'i') } // Case-insensitive search
        }).select('name _id'); // Only return the name and ID

        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
