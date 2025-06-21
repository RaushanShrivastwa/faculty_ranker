// config/passport.js
require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Emails that should get the 'admin' role
const adminEmails = [
  'admin@example.com',
  'manager@yourdomain.com'
];

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Ensure we have an email
        if (!profile.emails || profile.emails.length === 0) {
          return done(new Error('No email found in Google profile'));
        }

        const email = profile.emails[0].value;
        const role = adminEmails.includes(email) ? 'admin' : 'user';

        // Find existing user or create a new one
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            username: profile.displayName,
            email: email,
            phno: '',
            password: '',
            provider: 'google',
            role: role,
            verified: true
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// We are stateless—no serializeUser/deserializeUser calls here

module.exports = passport;
