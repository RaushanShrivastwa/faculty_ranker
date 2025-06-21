// controllers/authController.js
require('dotenv').config();
const bcrypt  = require('bcrypt');
const crypto  = require('crypto');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const Analytics = require('../models/Analytics');
const { sendOTPEmail, sendPasswordEmail } = require('../services/emailService');

const tempSignups = {};
const OTP_COOLDOWN_MS = 15 * 60 * 1000;

// Helper
function isVitapEmail(email) {
  return email.endsWith('@vitapstudent.ac.in');
}

exports.requestOTP = async (req, res) => {
  const { name, email, phno, password } = req.body;
  if (!name || !email || !password || !phno) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (!isVitapEmail(email)) {
    return res.status(403).json({ message: 'Only vitapstudent.ac.in emails allowed.' });
  }

  try {
    const exists = await User.findOne({ $or: [{ email }, { phno }] });
    if (exists) {
      return res.status(400).json({
        message: exists.email === email
          ? 'Email already registered'
          : 'Phone number already registered'
      });
    }

    const pending = tempSignups[email];
    if (pending && Date.now() - pending.lastSentAt < OTP_COOLDOWN_MS) {
      const mins = Math.ceil((OTP_COOLDOWN_MS - (Date.now() - pending.lastSentAt)) / 60000);
      return res.status(429).json({ message: `Please wait ${mins} more minute(s).` });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    tempSignups[email] = { name, email, phno, password, otp, lastSentAt: Date.now() };
    await sendOTPEmail(email, otp);
    console.log(`OTP for ${email}: ${otp}`);
    return res.status(200).json({ message: 'OTP sent. Verify to complete signup.' });
  } catch (err) {
    console.error('OTP request error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const pending = tempSignups[email];
  if (!pending) return res.status(400).json({ message: 'No pending signup for this email' });
  if (pending.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  try {
    const hash = await bcrypt.hash(pending.password, 10);
    const user = await User.create({
      username: pending.name,
      email: pending.email,
      phno: pending.phno,
      password: hash,
      provider: 'local',
      role: 'user',
      verified: true
    });
    delete tempSignups[email];

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    return res.status(201).json({ message: 'Signup successful', token });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  if (!isVitapEmail(email)) {
    return res.status(403).json({ message: 'Only vitapstudent.ac.in emails allowed.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !user.verified) {
      return res.status(400).json({ message: 'Invalid credentials or not verified' });
    }
    if (user.banned) {
      return res.status(403).json({ message: 'Your account has been banned.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    await new Analytics({ userId: user._id, actions: ['logged_in'] }).save();
    return res.json({ message: 'Sign-in successful', token });
  } catch (err) {
    console.error('Sign-in error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.googleCallback = async (req, res) => {
  const user = req.user;

  // Enforce VIT-AP email
  if (!isVitapEmail(user.email)) {
    return res.redirect(`${process.env.FRONTEND_URL}/403`);
  }
  // Enforce ban status
  if (user.banned) {
    return res.redirect(`${process.env.FRONTEND_URL}/banned?reason=Your%20account%20is%20banned`);
  }

  // If no local password yet, generate & email one
  if (!user.password) {
    const randPwd = crypto.randomBytes(5).toString('hex');
    user.password = await bcrypt.hash(randPwd, 10);
    await user.save();
    try {
      await sendPasswordEmail(user.email, randPwd);
    } catch (e) {
      console.error('Error sending password email:', e);
    }
  }

  // Sign JWT
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Redirect based on role
  if (user.role === 'admin') {
    return res.redirect(
      `${process.env.FRONTEND_URL}/users?token=${token}`
    );
  } else {
    return res.redirect(
      `${process.env.FRONTEND_URL}/facultyList?token=${token}`
    );
  }
};


exports.logout = (req, res) => {
  // Stateless JWT—nothing to clear server‐side
  res.json({ message: 'Logged out' });
};
