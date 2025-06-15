const express = require('express');
const router = express.Router();
const {
  searchFaculty,
  getFacultyDetails,
  getPaginatedFaculty
} = require('../controllers/facultyController');

router.get('/all', getPaginatedFaculty);
router.get('/search', searchFaculty);
router.get('/', getFacultyDetails); 

module.exports = router;
