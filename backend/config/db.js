const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://vrishankraina:vrishank@cluster0.2wttn.mongodb.net/facultyranker', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit on failure
  }
};

module.exports = connectDB;
