require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const passport = require('./config/passport');
const cors = require('cors');

const { jwtAuth } = require('./middleware/jwtAuth');

const authRoutes = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

const allowedOrigins = [
    'http://localhost:3000',
    'https://your-frontend-service-name.code.run',
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB error:', err));

app.use(session({
    secret: process.env.SESSION_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/users', userRoutes);

app.get('/api/dashboard', jwtAuth, async (req, res) => {
    try {
        const User = require('./models/User');
        const Log = require('./models/Log');
        const user = await User.findById(req.user.id).select('-password');
        const logs = await Log.find({ userId: req.user.id }).sort({ timestamp: -1 });
        res.json({ user, logs });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
app.use(express.static(clientBuildPath));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);
