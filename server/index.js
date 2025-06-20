require('dotenv').config(); // Load environment variables first

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('./config/passport');
const { jwtAuth } = require('./middleware/jwtAuth');
const authRoutes = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// ✅ Handle CORS preflight and headers BEFORE anything else
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // or '*' for open access
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Preflight success
  }

  next();
});

// ✅ CORS middleware (can be left with '*' if preflight is handled above)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true // only needed if using cookies (optional)
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
let isConnected = false;

const connectDb = async () => {
  if (isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw new Error('Failed to connect to MongoDB');
  }
};

// ✅ Ensure DB connection for each request
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDb();
    } catch (error) {
      return res.status(500).json({ message: 'Database connection failed', error: error.message });
    }
  }
  next();
});

// ✅ Session & Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'session-secret',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use('/', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/users', userRoutes);

// ✅ Authenticated route example
app.get('/api/dashboard', jwtAuth, async (req, res) => {
  try {
    const User = require('./models/User');
    const Log = require('./models/Log');
    const user = await User.findById(req.user.id).select('-password');
    const logs = await Log.find({ userId: req.user.id }).sort({ timestamp: -1 });
    res.json({ user, logs });
  } catch (error) {
    console.error('Error in /api/dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Health check route (optional)
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// ✅ Export app for serverless
module.exports = app;
