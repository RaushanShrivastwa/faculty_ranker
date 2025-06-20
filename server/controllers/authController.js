require('dotenv').config();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const Log = require('../models/Log');
const { sendOTPEmail, sendPasswordEmail } = require('../services/emailService');

const tempSignups = {};
const OTP_COOLDOWN_MS = 15 * 60 * 1000;

// Helper
function isVitapEmail(email) {
  return email && email.endsWith('@vitapstudent.ac.in');
}

// Generate JWT with consistent payload fields
function generateToken(user) {
  const payload = {
    id: user._id,
    role: user.role,
    email: user.email,
    banned: user.banned || false
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'jwt-secret', { expiresIn: '1h' });
}

exports.requestOTP = async (req, res) => {
  const { name, email, phno, password } = req.body;

  if (!name || !email || !password || !phno) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!isVitapEmail(email)) {
    return res.status(403).json({ message: 'Only vitapstudent.ac.in emails are allowed.' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phno }] });
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email
          ? 'Email already registered'
          : 'Phone number already registered'
      });
    }

    const existingSignup = tempSignups[email];
    if (existingSignup?.lastSentAt) {
      const timeSinceLast = Date.now() - existingSignup.lastSentAt;
      if (timeSinceLast < OTP_COOLDOWN_MS) {
        const minutesLeft = Math.ceil((OTP_COOLDOWN_MS - timeSinceLast) / 60000);
        return res.status(429).json({
          message: `Please wait ${minutesLeft} more minute(s) before requesting another OTP.`
        });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    tempSignups[email] = { name, email, phno, password, otp, lastSentAt: Date.now() };

    await sendOTPEmail(email, otp);
    console.log(`OTP for ${email}: ${otp}`);

    return res.status(200).json({ message: 'OTP sent to your email. Please verify to complete signup.' });
  } catch (error) {
    console.error('Error in OTP request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const pending = tempSignups[email];
  if (!pending) return res.status(400).json({ message: 'No pending signup found for this email' });
  if (pending.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  try {
    const hashedPassword = await bcrypt.hash(pending.password, 10);
    const user = await User.create({
      username: pending.name,
      email: pending.email,
      phno: pending.phno,
      password: hashedPassword,
      provider: 'local',
      role: 'user',
      verified: true,
      banned: false
    });
    delete tempSignups[email];

    const token = generateToken(user);
    return res.status(201).json({ message: 'User created successfully', token });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!isVitapEmail(email)) {
    return res.status(403).json({ message: 'Only vitapstudent.ac.in emails are allowed.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !user.verified) {
      return res.status(400).json({ message: 'Invalid credentials or account not verified' });
    }
    if (user.banned) {
      return res.status(403).json({ message: 'Your account has been banned. Contact admin.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    await new Analytics({ userId: user._id, actions: ['logged_in'] }).save();
    return res.json({ message: 'Sign-in successful', token });
  } catch (error) {
    console.error('Sign-in error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.googleCallback = async (req, res) => {
  let user = req.user;

  if (!isVitapEmail(user.email)) {
    return res.redirect('/403'); // Must match React route
  }

  if (user.banned) {
    return res.redirect(`/banned?reason=Your account has been banned`);
  }

  if (!user.password) {
    const randomPassword = crypto.randomBytes(5).toString('hex');
    user.password = await bcrypt.hash(randomPassword, 10);
    await user.save();
    try {
      await sendPasswordEmail(user.email, randomPassword);
    } catch (e) {
      console.error('Error sending password email:', e);
    }
  }

  const token = generateToken(user);
  // Send token to client via redirect or JSON payload
  return res.redirect(`${process.env.FRONTEND_URL}/users?token=${token}`);
};

exports.logout = (req, res) => {
  return res.json({ message: 'User logged out successfully' });
};
