require('dotenv').config(); // Load env vars at the top

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

// ✅ Proper CORS setup
const corsOptions = {
  origin: 'http://localhost:3000', // or use process.env.FRONTEND_URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.options('*', cors(corsOptions)); // handle preflight
app.use(cors(corsOptions));
// ✅ Express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB Connection (memoized)
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
    console.error('❌ MongoDB connection error:', err);
    throw new Error('Failed to connect to MongoDB');
  }
};

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDb();
    } catch (error) {
      return res.status(500).json({ message: 'DB connection failed', error: error.message });
    }
  }
  next();
});

// ✅ Session & Passport setup (optional)
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use('/', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/users', userRoutes);

// ✅ Authenticated dashboard example
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

// ✅ Health check route
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

module.exports = app;
