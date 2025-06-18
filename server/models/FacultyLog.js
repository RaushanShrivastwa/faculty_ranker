const mongoose = require('mongoose');

const FacultyLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facultyName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['add'],
    default: 'add'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FacultyLog', FacultyLogSchema);
