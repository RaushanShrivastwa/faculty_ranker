// server/controllers/userController.js

let users = require('../models/User');

// 🔁 Toggle ban status
const toggleBanStatus = (req, res) => {
  const { username } = req.params;
  const { banned } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.banned = banned; // ✅ set it based on client value
  console.log("Updated User:", user);
  res.json(user);        // ✅ return updated user directly
};

// 🧾 Get all users
const getAllUsers = (req, res) => {
  console.log("Fetching all users:", users);
  res.json(users);
};

module.exports = { toggleBanStatus, getAllUsers };
