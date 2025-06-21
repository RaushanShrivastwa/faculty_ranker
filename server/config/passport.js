// config/passport.js
require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// List of admin emails
const adminEmails = [
  'admin@example.com',
  'manager@yourdomain.com'
];

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  `${process.env.BACKEND_URL}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Ensure we got an email
      if (!profile.emails || !profile.emails.length) {
        return done(new Error('No email found in Google profile'));
      }

      const email = profile.emails[0].value;
      const role  = adminEmails.includes(email) ? 'admin' : 'user';

      // Find or create
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          username: profile.displayName,
          email,
          phno: '',
          password: '',           // will generate below if needed
          provider: 'google',
          role,
          verified: true
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
);

// We remove serializeUser / deserializeUser entirely—no sessions!
module.exports = passport;
