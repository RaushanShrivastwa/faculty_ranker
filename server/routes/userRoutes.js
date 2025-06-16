// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getAllUsers, toggleBanStatus } = require('../controllers/userController');
const { jwtAuth, requireAdmin } = require('../middleware/jwtAuth');

// 🔍 GET all users (admin-only)
router.get('/', jwtAuth, requireAdmin, getAllUsers);

// 🚫 PUT to ban/unban (admin-only)
router.put('/ban/:_id', jwtAuth, requireAdmin, toggleBanStatus);

module.exports = router;