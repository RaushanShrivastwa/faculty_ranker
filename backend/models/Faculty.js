const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  id: String,
  name: String,
  image_url: String,
  attendance_rating: Number,
  correction_rating: Number,
  teaching_rating: Number,
  num_teaching_ratings: Number,
  num_correction_ratings: Number,
  num_attendance_ratings: Number,
  verification: Boolean
});

module.exports = mongoose.model('Faculty', FacultySchema, 'vitfacultydata');
