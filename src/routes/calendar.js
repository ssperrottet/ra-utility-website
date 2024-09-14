// In your calendarRoutes.js or appropriate route file
const express = require('express');
const Calendar = require('../models/Calendar');
const {
    getCalendarById,
    createCalendar,
    updateCalendar,
    listCalendars // Make sure to import this if you have it
} = require('../controllers/calendarController');
const {
    ensureAuthenticated,
    isUserPartOfCalendar
} = require('../middleware/auth');
const router = express.Router();

// Route to display all calendars
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        // Fetch the calendars that the authenticated user is part of
        const calendars = await Calendar.find({ 'users.user_id': req.user._id });
        res.render('calendars/dashboard', {
            title: 'Calendars',
            user: req.user,
            calendars: calendars // Pass the calendars to the view
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to load calendars');
        res.redirect('/');
    }
});


// Route to display the 'Create Calendar' form
router.get('/create', ensureAuthenticated, (req, res) => {
    res.render('calendars/createCalendar', {
        title: 'Create Calendar',
        user: req.user
    });
});

// Route to view a specific calendar
router.get('/:calendarId', ensureAuthenticated, isUserPartOfCalendar, getCalendarById);

// Route to handle the creation of a new calendar
router.post('/create', ensureAuthenticated, createCalendar);

// Route to handle updating a calendar
router.put('/:calendarId', ensureAuthenticated, isUserPartOfCalendar, updateCalendar);

module.exports = router;
