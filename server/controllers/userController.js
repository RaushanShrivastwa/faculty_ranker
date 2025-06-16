// server/controllers/userController.js
const User = require('../models/User'); // Capital 'U' to indicate it's a model

// 🔁 Toggle ban status
const toggleBanStatus = async (req, res) => {
  const { _id } = req.params;
  const { banned } = req.body;

  try {
    // ✅ Correct: use _id from params instead of email
    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.banned = banned; // update field
    await user.save();    // save to DB
    console.log("✅ Updated User:", user);
    res.json(user);       // send back updated user
  } catch (err) {
    console.error('❌ Error toggling ban:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 🧾 Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all from DB
    console.log("🔍 getAllUsers returned:", users.length, "users");
    res.json(users);
  } catch (err) {
    console.error('❌ Failed to get users:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { toggleBanStatus, getAllUsers };