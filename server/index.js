require('dotenv').config(); // Load .env variables at the very top

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('./config/passport');
const { jwtAuth } = require('./middleware/jwtAuth');

// Routes
const authRoutes = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// === 🔒 CORS CONFIGURATION ===
const corsOptions = {
  origin: 'http://localhost:3000', // or use process.env.FRONTEND_URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// 🛡 Handle preflight first
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// === 📦 Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === 🔌 MongoDB Connection ===
let isConnected = false;

const connectDb = async () => {
  if (isConnected) {
    console.log('✅ Reusing MongoDB connection');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw new Error('MongoDB connection failed');
  }
};

app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDb();
    } catch (err) {
      return res.status(500).json({ message: 'DB connection failed', error: err.message });
    }
  }
  next();
});

// === 🧠 Session & Passport Auth ===
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-key',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// === 🔗 Routes ===
app.use('/auth', authRoutes);
app.use('/faculty', facultyRoutes);
app.use('/users', userRoutes);

// === 🔐 Protected Example Route ===
app.get('/dashboard', jwtAuth, async (req, res) => {
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
app.get('/health', (req, res) => res.status(200).send('OK'));

// === 🚀 Export for Serverless ===
module.exports = app;
