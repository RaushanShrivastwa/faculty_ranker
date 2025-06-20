// routes/facultyRoutes.js
const express = require('express');
const router = express.Router();
const cors = require('cors'); // <-- Make sure cors is imported here
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
// 1) Preflight for upload must respond with CORS headers:
router.options(
  '/upload',
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// 2) Then the actual upload POST — also wrapped with CORS:
router.post(
  '/upload',
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }),
  jwtAuth,
  uploadMiddleware,  // multer
  uploadImage        // your controller
);

// Faculty Rating Routes
router.post('/rate/:id', jwtAuth, rateFaculty);
router.get('/hasRated/:id', jwtAuth, checkIfUserRated);

// ----- Admin-only -----
router.put('/verify/:id', jwtAuth, requireAdmin, verifyFaculty);
router.delete('/:id', jwtAuth, requireAdmin, deleteFaculty);

module.exports = router;
