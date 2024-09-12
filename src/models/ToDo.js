const mongoose = require('mongoose');

// Define the schema for to-do items
const ToDoSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User', // Reference to the User model
		required: true,
	},
	date: {
		type: Date,
		default: Date.now,
	},
});

// Export the model
module.exports = mongoose.model('ToDo', ToDoSchema);
