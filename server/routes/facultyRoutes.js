// routes/facultyRoutes.js
const express = require('express');
const router  = express.Router();
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
router.get('/all',    getPaginatedFaculty);
router.get('/search', searchFaculty);

// **Static unverified route** must be before `/:id`
router.get('/unverified', jwtAuth, requireAdmin, getUnverifiedFaculty);

// Get one by ID
router.get('/:id', getFacultyDetails);

// ----- Authenticated -----
router.post('/', jwtAuth, addFaculty);
router.post('/upload', jwtAuth, uploadMiddleware, uploadImage);
router.post('/rate/:id', jwtAuth, rateFaculty);
router.get('/hasRated/:id', jwtAuth, checkIfUserRated);

// ----- Admin-only -----
router.put('/verify/:id', jwtAuth, requireAdmin, verifyFaculty);
router.delete('/:id', jwtAuth, requireAdmin, deleteFaculty);

module.exports = router;
