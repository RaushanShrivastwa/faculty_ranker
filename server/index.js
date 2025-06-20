// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const passport = require('./config/passport');
const { jwtAuth } = require('./middleware/jwtAuth');

const authRoutes    = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const userRoutes    = require('./routes/userRoutes');

const app = express();

// ─── 1) MANUAL CORS MIDDLEWARE (runs before multer/body‑parsers) ───
app.use((req, res, next) => {
  const origin = req.get('Origin') || '*';
  res.header('Access-Control-Allow-Origin',  origin);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  // short‑circuit preflight:
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ─── 2) BODY PARSERS ───
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── 3) CONNECT TO MONGO ───
let isConnected = false;
const connectDb = async () => {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log('✅ MongoDB connected');
  }
};
app.use(async (req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (err) {
    console.error('DB connection error', err);
    res.status(500).send('DB error');
  }
});

// ─── 4) AUTH INITIALIZATION ───
app.use(passport.initialize());

// ─── 5) ROUTES ───
app.use('/api/auth',    authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/users',   userRoutes);
app.get('/api/dashboard', jwtAuth, /* ... */);
app.get('/api/health', (req, res) => res.send('OK'));

// ─── 6) EXPORT ───
module.exports = app;
