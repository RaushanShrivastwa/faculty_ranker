// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getAllUsers, toggleBanStatus } = require('../controllers/userController');

// GET all users
router.get('/', getAllUsers);

// PUT to toggle ban
router.put('/ban/:username', toggleBanStatus);

module.exports = router;
