const express = require('express');
const router = express.Router();
const { jwtAuth } = require('../middleware/jwtAuth');

const {
  searchFaculty,
  getFacultyDetails,
  getPaginatedFaculty,
  addFaculty
} = require('../controllers/facultyController');

router.get('/all', getPaginatedFaculty);
router.get('/search', searchFaculty);
router.get('/', getFacultyDetails); 

router.post('/', jwtAuth, addFaculty);


module.exports = router;
