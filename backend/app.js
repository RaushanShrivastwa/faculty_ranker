const express = require('express');
const cors = require('cors');
const facultyRoutes = require('./routes/facultyRoutes');
const connectDB = require('./config/db');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// All APIs under /api
app.use('/api/faculty', facultyRoutes);

// 📦 Serve React frontend (after build)
const buildPath = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(buildPath));

// Fallback route for React Router
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Connect to DB and start server
connectDB().then(() => {
  app.listen(5000, () => {
    console.log('🚀 Server running at http://localhost:5000');
  });
});

module.exports = app;
