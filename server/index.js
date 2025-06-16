require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const path     = require('path');
const session  = require('express-session');
const passport = require('./config/passport');

// 🔑 Destructure jwtAuth (not the entire module object)
const { jwtAuth }   = require('./middleware/jwtAuth');

const authRoutes    = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const userRoutes    = require('./routes/userRoutes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err));

// ✅ Session & Passport Setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'session-secret',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// ✅ API Routes
app.use('/', authRoutes);        // mount auth routes
app.use('/api/faculty', facultyRoutes);
app.use('/api/users',   userRoutes);

// ✅ Protected Dashboard Route
app.get('/api/dashboard', jwtAuth, async (req, res) => {
  try {
    const User = require('./models/User');
    const Log  = require('./models/Log');
    const user = await User.findById(req.user.id).select('-password');
    const logs = await Log.find({ userId: req.user.id }).sort({ timestamp: -1 });
    res.json({ user, logs });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Serve React frontend
const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
app.use(express.static(clientBuildPath));

// ✅ Catch-all for React Router
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => 
  console.log(`🚀 Server running on port ${PORT}`)
);