// server/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const passport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const jwtAuth = require('./middleware/jwtAuth');
const facultyRoutes = require('./routes/facultyRoutes'); // ✅ Faculty route integration
const userRoutes = require('./routes/userRoutes'); 

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// ✅ Session & Passport Setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'session-secret',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// ✅ Authentication Routes
app.use(authRoutes);

// ✅ Faculty API Routes (e.g. /api/faculty/search, /api/faculty/all)
app.use('/api/faculty', facultyRoutes);
app.use('/api/users', userRoutes); 


// ✅ Example Protected Route
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

// ✅ Serve React frontend
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
