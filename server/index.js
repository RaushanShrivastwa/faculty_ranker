// server/index.js (backend entrypoint)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const passport = require('./config/passport');        // Passport setup
const authRoutes = require('./routes/authRoutes');    // Auth-related routes
const jwtAuth = require('./middleware/jwtAuth');      // JWT middleware

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to Database'))
  .catch((err) => console.error('DB connection error:', err));

// Session & Passport (for OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'session-secret',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Auth routes (signup, signin, OTP, etc.)
app.use(authRoutes);

// (Optional) Protected API route example
app.get('/api/dashboard', jwtAuth, async (req, res) => {
  try {
    const User = require('./models/User');
    const Log = require('./models/Log');
    const user = await User.findById(req.user.id).select('-password');
    const logs = await Log.find({ userId: req.user.id }).sort({ timestamp: -1 });
    res.json({ user, logs });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve React frontend from the build directory
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
