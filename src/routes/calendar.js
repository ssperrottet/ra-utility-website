// In your calendarRoutes.js or appropriate route file
const express = require('express');
const multer = require('multer');
const upload = multer();
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
router.get('/:calendarId', upload.none(), ensureAuthenticated, isUserPartOfCalendar, getCalendarById);

// Route to get the calendar for editing
router.get('/edit/:calendarId', async (req, res) => {
    try {
        const calendar = await Calendar.findById(req.params.calendarId)
            .populate('users.user_id', 'name email')
            .populate('days.assigned_users.user_id', 'name email');

        if (!calendar) {
            return res.status(404).render('error', { message: 'Calendar not found' });
        }

        res.render('calendars/editCalendar', { calendar, title: `Edit ${calendar.name}` });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Server error' });
    }
});

// Route to handle the update of the calendar
router.post('/edit/:calendarId', upload.none(), updateCalendar);

// Route to handle the creation of a new calendar
router.post('/create', ensureAuthenticated, createCalendar);

// Route to handle updating a calendar
router.put('/:calendarId', ensureAuthenticated, isUserPartOfCalendar, updateCalendar);

module.exports = router;
