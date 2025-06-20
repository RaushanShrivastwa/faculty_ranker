// server/index.js (or whatever your main Express file is named)

require('dotenv').config(); // Keep this at the very top to load environment variables

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// const path = require('path'); // No longer needed for serving static files
const session = require('express-session');
const passport = require('./config/passport'); // Assuming this path is correct relative to your server directory

// 🔑 Destructure jwtAuth (not the entire module object)
const { jwtAuth } = require('./middleware/jwtAuth'); // Assuming this path is correct relative to your server directory

const authRoutes = require('./routes/authRoutes'); // Assuming this path is correct relative to your server directory
const facultyRoutes = require('./routes/facultyRoutes'); // Assuming this path is correct relative to your server directory
const userRoutes = require('./routes/userRoutes'); // Assuming this path is correct relative to your server directory

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
// IMPORTANT: In a serverless environment, this connection attempt
// will happen on every "cold start" of the function.
// For optimal performance with Mongoose, you might want to look into
// patterns that ensure a single, shared connection across invocations
// within the same warmed-up instance. However, for a basic setup,
// this works. Vercel usually keeps instances "warm" for a period.
let isConnected; // Keep track of connection status

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
        // It's crucial to handle connection errors robustly
        // In a serverless context, if connection fails, the function might fail.
        // You might want to throw or exit if this is critical.
        throw new Error('Failed to connect to MongoDB');
    }
};

// Middleware to ensure DB connection is established before routes are hit
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

// ✅ Session & Passport Setup
// NOTE: `express-session` with default MemoryStore is NOT suitable for serverless.
// Each invocation is stateless. You MUST use a persistent session store like
// `connect-mongo` (for MongoDB), `connect-redis`, etc.
// For now, I'm keeping your setup, but be aware this will not persist sessions
// across different function invocations/cold starts.
// If you primarily use JWT for authentication (which is stateless), this might be fine.
app.use(session({
    secret: process.env.SESSION_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: true,
    // Add a store for production in serverless environments:
    // store: new MongoStore({ mongooseConnection: mongoose.connection, collection: 'sessions' })
}));
app.use(passport.initialize());
app.use(passport.session()); // This relies on `express-session`

// ✅ API Routes
app.use('/', authRoutes); // Mount auth routes
app.use('/api/faculty', facultyRoutes);
app.use('/api/users', userRoutes);

// ✅ Protected Dashboard Route
app.get('/api/dashboard', jwtAuth, async (req, res) => {
    try {
        const User = require('./models/User'); // Consider importing models once at the top
        const Log = require('./models/Log');   // rather than inside a route handler
        const user = await User.findById(req.user.id).select('-password');
        const logs = await Log.find({ userId: req.user.id }).sort({ timestamp: -1 });
        res.json({ user, logs });
    } catch (error) {
        console.error('Error in /api/dashboard:', error); // Log the actual error
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = app;
