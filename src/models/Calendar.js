// models/Calendar.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const calendarSchema = new Schema({
  name: { type: String, required: true },  // Calendar name
  description: {type: String, required: false },
  users: [
    {
      user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to User model
      role: { type: String, default: 'base' }  // moderator // owner 
    }
  ],
  days: [
    {
      date: { type: Date, required: true },  // Date for the day
      assigned_users: [
        {
          user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to User model
          //role: { type: String, default: 'participant' }  // Optional: role for the day
        }
      ]
    }
  ],
  createdAt: { type: Date, default: Date.now },  // Timestamp for when the calendar was created
  updatedAt: { type: Date, default: Date.now }   // Timestamp for last update
});

// Pre-save hook to update the updatedAt timestamp before each save operation
calendarSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Calendar', calendarSchema);
