// server/index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('./config/passport');
const { jwtAuth } = require('./middleware/jwtAuth');

// Routes
const authRoutes = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// === 🔒 CORS CONFIGURATION ===
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// === 📦 Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === 🔌 MongoDB Connection ===
const connectDb = async () => {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // fail fast if Mongo is unreachable
    });
  }
  return global._mongoClientPromise;
};

// Connect to DB on every request (cached)
app.use(async (req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    return res.status(500).json({ message: 'DB connection failed', error: err.message });
  }
});

// === 🔐 JWT-Based Auth ===
app.use(passport.initialize());

// === 🔗 Routes (under /api/*) ===
app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/users', userRoutes);

// === 🔐 Example Protected Route ===
app.get('/api/dashboard', jwtAuth, async (req, res) => {
  try {
    const User = require('./models/User');
    const Log = require('./models/Log');
    const user = await User.findById(req.user.id).select('-password');
    const logs = await Log.find({ userId: req.user.id }).sort({ timestamp: -1 });
    res.json({ user, logs });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// === 🩺 Health Check ===
app.get('/api/health', (req, res) => res.status(200).send('OK'));

// === 🚀 Export for Serverless (no express-session) ===
module.exports = app;
