// routes/authRoutes.js
const router   = require('express').Router();
const passport = require('passport');
const authCtrl = require('../controllers/authController');
const { jwtAuth } = require('../middleware/jwtAuth');

// Request OTP for signup
router.post('/request-otp', authCtrl.requestOTP);

// Verify OTP and create account
router.post('/verify-otp', authCtrl.verifyOTP);

// Local signin
router.post('/signin', authCtrl.signIn);

// Google OAuth (stateless, JWT-based)
router.get(
  '/google',
  passport.authenticate('google', {
    scope:   ['profile','email'],
    session: false
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/',
    session:        false
  }),
  authCtrl.googleCallback
);

// Logout (JWT protected)
router.post('/logout', jwtAuth, authCtrl.logout);

module.exports = router;
