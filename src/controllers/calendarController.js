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

		// Render the calendar view and pass the calendar data
		res.status(200).render('calendars/calendar', {
			calendar: calendar,
			title: calendar.name,
		});
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

const updateCalendar = async (req, res) => {
	try {
		console.log('Attempting to save days');

		const { calendarId, days, name, description } = req.body;

		// Validate input
		if (!calendarId || !days || !Array.isArray(days)) {
			return res.status(400).json({ message: 'Invalid input' });
		}

		// Find the calendar
		const calendar = await Calendar.findById(calendarId);
		if (!calendar) {
			console.log('cal not found');
			return res.status(404).json({ message: 'Calendar not found' });
		}

		// Update optional name and description fields
		if (name) calendar.name = name;
		if (description) calendar.description = description;

		// Ensure calendar.days exists as an array
		if (!calendar.days) calendar.days = [];
		console.log(days);
		// Process days and assigned users
		days.forEach((day) => {
			console.log(day);
			const existingDay = calendar.days.find(
				(d) => d.date.toISOString() === new Date(day.date).toISOString()
			);

			if (existingDay) {
				// Update existing day
				existingDay.assigned_users = day.assigned_users.map((user) => ({
					id: user.user_id,
				}));
			} else {
				// Add new day
				calendar.days.push({
					date: new Date(day.date),
					assigned_users: day.assigned_users.map((user) => ({ user_id: user.user_id })),
				});
			}
		});

		await calendar.save();

		return res.status(200).json(calendar);
		
	} catch (err) {
		console.error('Error updating calendar:', err);
		return res.status(500).json({ message: 'Server error' });
	}
};

module.exports = {
	getCalendarById,
	createCalendar,
	updateCalendar,
};
