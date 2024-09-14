const Calendar = require('../models/Calendar');

const getCalendarById = async (req, res) => {
	try {
		// Fetch calendar with populated user and assigned user details
		const calendar = await Calendar.findById(req.params.calendarId)
			.populate('users.user_id', 'name email') // Populate user details
			.populate('days.assigned_users.user_id', 'name email'); // Populate assigned user details

		// If calendar is not found, return 404
		if (!calendar) {
			return res.status(404).render('error', { message: 'Calendar not found' });
		}

		// Ensure the user requesting has access to the calendar
		const isUserInCalendar = calendar.users.some((user) =>
			user.user_id.equals(req.user._id)
		);
		if (!isUserInCalendar) {
			return res
				.status(403)
				.render('error', {
					message: 'You do not have access to this calendar',
				});
		}

		// Render the calendar view and pass the calendar data
		res
			.status(200)
			.render('calendars/calendar', { calendar, title: calendar.name });
	} catch (err) {
		console.error(err);
		// On server error, render an error page
		res.status(500).render('error', { message: 'Server error' });
	}
};

// Create a new calendar
const createCalendar = async (req, res) => {
	try {
		const { name, description, users } = req.body;

		// Ensure that the creator (req.user._id) is added to the calendar
		const newCalendar = new Calendar({
			name,
			description,
			users: [], // Initial empty users array
			days: [], // Initial empty days array
		});

		// Handle cases where users might be a string (comma-separated) or an array
		let userIds = [];

		if (Array.isArray(users)) {
			// If users is already an array, assign it directly
			userIds = users;
		} else if (typeof users === 'string') {
			// If users is a string, split it into an array (comma-separated)
			userIds = users.split(',').map((userId) => userId.trim());
		}

		// Add additional users if provided
		userIds.forEach((userId) => newCalendar.users.push({ user_id: userId }));

		await newCalendar.save();
		req.flash('success_msg', 'Successfully created calendar.');
		res.redirect('/calendars');
	} catch (err) {
		console.error(err);
		req.flash('error_msg', 'Error: Could not create calendar.');
		res.redirect('/calendars/create');
	}
};

// Update a specific calendar by ID
const updateCalendar = async (req, res) => {
	try {
		const { calendarId } = req.params;
		const { name, description, days, users } = req.body;

		const calendar = await Calendar.findById(calendarId);

		if (!calendar) {
			return res.status(404).json({ message: 'Calendar not found' });
		}

		// Ensure the requesting user is part of the calendar
		const isUserInCalendar = calendar.users.some((user) =>
			user.user_id.equals(req.user._id)
		);
		if (!isUserInCalendar) {
			return res
				.status(403)
				.json({
					message: 'You do not have permission to modify this calendar',
				});
		}

		// Update calendar details
		if (name) calendar.name = name;
		if (description) calendar.description = description;
		if (days) calendar.days = days;
		if (users) calendar.users = users.map((userId) => ({ user_id: userId }));

		await calendar.save();

		res.status(200).json(calendar);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};

module.exports = {
	getCalendarById,
	createCalendar,
	updateCalendar,
};
