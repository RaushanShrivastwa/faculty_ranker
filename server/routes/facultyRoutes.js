// routes/facultyRoutes.js
const express = require('express');
const router = express.Router();
const { jwtAuth, requireAdmin } = require('../middleware/jwtAuth');
const {
  searchFaculty,
  getPaginatedFaculty,
  addFaculty,
  getUnverifiedFaculty,
  verifyFaculty,
  deleteFaculty,
  getFacultyDetails,   // by ID
  rateFaculty,
  checkIfUserRated
} = require('../controllers/facultyController');
const { uploadMiddleware, uploadImage } = require('../controllers/imageController');
const cors = require('cors'); // Import cors
const { corsOptions } = require('../config/cors'); // Ensure you have this file and export corsOptions from it

// ----- Public / general -----
router.get('/all', getPaginatedFaculty);
router.get('/search', searchFaculty);

// **Static unverified route** must be before `/:id`
router.get('/unverified', jwtAuth, requireAdmin, getUnverifiedFaculty);

// Get one by ID
router.get('/:id', getFacultyDetails);

// ----- Authenticated -----
router.post('/', jwtAuth, addFaculty);

// Image Upload Routes
// Handle preflight OPTIONS request specifically for the /upload route
router.options('/upload', cors(corsOptions));
// Handle the POST request for /upload
router.post(
  '/upload',
  cors(corsOptions), // Also apply CORS to the POST request itself
  jwtAuth,           // Ensure user is authenticated
  uploadMiddleware,  // Multer middleware to handle file upload
  uploadImage        // Controller function to process the uploaded image
);

// Faculty Rating Routes
router.post('/rate/:id', jwtAuth, rateFaculty);
router.get('/hasRated/:id', jwtAuth, checkIfUserRated);

// ----- Admin-only -----
router.put('/verify/:id', jwtAuth, requireAdmin, verifyFaculty);
router.delete('/:id', jwtAuth, requireAdmin, deleteFaculty);

module.exports = router;
