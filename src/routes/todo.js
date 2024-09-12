const express = require('express');
const router = express.Router();
const ToDo = require('../models/ToDo'); // Import your ToDo model

// Home page route to display the to-do list
router.get('/', async (req, res) => {
	try {
		// Fetch to-do items for the logged-in user
		const todos = await ToDo.find({ user: req.user.id });
		res.render('todo', {
			title: 'To-Do List',
			user: req.user,
			todos, // Pass the to-do items to the view
			success_msg: req.flash('success_msg'),
			error_msg: req.flash('error_msg'),
		});
	} catch (err) {
		console.error('Error fetching to-do items:', err);
		req.flash('error_msg', 'An error occurred while fetching to-do items.');
		res.redirect('/');
	}
});

// Add a new to-do item
router.post('/add', async (req, res) => {
	const { title } = req.body;
	try {
		const newTodo = new ToDo({
			title,
			user: req.user.id, // Associate with the logged-in user
		});
		await newTodo.save();
		req.flash('success_msg', 'Task added successfully.');
		res.redirect('/todos');
	} catch (err) {
		console.error('Error adding task:', err);
		req.flash('error_msg', 'Failed to add task.');
		res.redirect('/todos');
	}
});

// Update a to-do item
router.post('/update/:id', async (req, res) => {
	const { id } = req.params;
	const { title } = req.body;

	try {
		// Find and update the to-do item
		await ToDo.findByIdAndUpdate(id, { title });
		req.flash('success_msg', 'To-Do item updated successfully.');
		res.redirect('/');
	} catch (err) {
		console.error('Error updating to-do item:', err);
		req.flash('error_msg', 'An error occurred while updating the to-do item.');
		res.redirect('/');
	}
});

// Delete a to-do item
router.get('/delete/:id', async (req, res) => {
	try {
		await ToDo.findByIdAndDelete(req.params.id);
		req.flash('success_msg', 'Task deleted successfully.');
		res.redirect('/todos');
	} catch (err) {
		console.error('Error deleting task:', err);
		req.flash('error_msg', 'Failed to delete task.');
		res.redirect('/todos');
	}
});

module.exports = router;
