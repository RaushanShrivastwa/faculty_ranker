const Faculty = require('../models/Faculty');
const FacultyLog = require('../models/FacultyLog');
const { sendRejectionEmail } = require('../services/emailService');


exports.searchFaculty = async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  try {
    const results = await Faculty.find({
      name: { $regex: query, $options: 'i' },
      verification: true
    }).limit(10);

    res.json(results.map(fac => ({
      name: fac.name,
      image_url: fac.image_url
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};

// controllers/facultyController.js
exports.getFacultyDetails = async (req, res) => {
  try {
    // Pull the ID from the URL, not from query
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ error: 'Faculty not found' });
    res.json(faculty);
  } catch (err) {
    console.error('Error fetching faculty by ID:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPaginatedFaculty = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  // Read limit from query parameters, with a default of 20 (or your desired default)
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    // You might also want to add search functionality here if the pagination endpoint
    // is also used for the main faculty list with search.
    // Assuming you only want verified faculty for the general list:
    const query = { verification: true };
    const searchTerm = req.query.search; // Assuming 'search' is the query parameter for search term

    if (searchTerm) {
      // Add search criteria if a search term is present
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { department: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    const total = await Faculty.countDocuments(query); // Use the combined query for total count
    const faculty = await Faculty.find(query) // Use the combined query for finding faculty
      .skip(skip)
      .limit(limit);

    res.json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalFaculty: total,
      faculty
    });
  } catch (err) {
    console.error('Pagination fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch paginated faculty' });
  }
};

//Add Faculty
exports.addFaculty = async (req, res) => {
  const {
    name,
    bio,
    rating,
    image,
    correction_rating,
    attendance_rating
  } = req.body;

  if (!name || !rating || !correction_rating || !attendance_rating) {
    return res.status(400).json({ error: 'All ratings and name are required' });
  }

  try {
    // ✅ Rate limit: max 3 adds per day per user
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const addedToday = await FacultyLog.countDocuments({
      user: req.user.id,
      action: 'add',
      timestamp: { $gte: startOfDay }
    });

    if (addedToday >= 3) {
      return res.status(429).json({ error: 'Daily limit reached: Max 3 faculties per day.' });
    }

    // ✅ Check for duplicate name
    const existing = await Faculty.findOne({
      name: { $regex: `^${name}$`, $options: 'i' }
    });

    if (existing) {
      return res.status(409).json({ error: 'Faculty already added' });
    }

    // ✅ Save new faculty
    const newFaculty = new Faculty({
      name,
      bio,
      image_url: image || '',
      teaching_rating: parseFloat(rating),
      correction_rating: parseFloat(correction_rating),
      attendance_rating: parseFloat(attendance_rating),
      num_teaching_ratings: 1,
      num_correction_ratings: 1,
      num_attendance_ratings: 1,
      verification: false
    });

    await newFaculty.save();

    // ✅ Log the action
    await FacultyLog.create({
      user: req.user.id,
      facultyName: name,
      action: 'add'
    });

    res.status(201).json({ message: 'Faculty added successfully' });
  } catch (err) {
    console.error('Error adding faculty:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Get all unverified faculties
exports.getUnverifiedFaculty = async (req, res) => {
  try {
    const unverifiedFaculties = await Faculty.find({ verification: false });

    const facultyLogs = await FacultyLog.find({
      facultyName: { $in: unverifiedFaculties.map(f => f.name) },
      action: 'add'
    }).populate('user', 'username email'); // ✅ Use 'username' from your schema

    const logMap = {};
    facultyLogs.forEach(log => {
      if (log.user) {
        logMap[log.facultyName.toLowerCase()] = log.user;
      }
    });

    const data = unverifiedFaculties.map(fac => ({
      ...fac.toObject(),
      addedBy: logMap[fac.name.toLowerCase()] || null
    }));

    res.json(data);
  } catch (err) {
    console.error('Error fetching unverified faculty:', err);
    res.status(500).json({ error: 'Failed to fetch unverified faculty' });
  }
};

// Verify a faculty by ID
exports.verifyFaculty = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Faculty.findByIdAndUpdate(
      id,
      { verification: true },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    res.json({ message: 'Faculty verified', faculty: updated });
  } catch (err) {
    console.error('Error verifying faculty:', err);
    res.status(500).json({ error: 'Failed to verify faculty' });
  }
};

// Delete a faculty by ID
exports.deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

    // 🔍 Find the most recent log of type 'add' for this faculty
    const log = await FacultyLog.findOne({
      facultyName: faculty.name,
      action: 'add'
    }).sort({ timestamp: -1 }).populate('user');

    // 📧 If log found, and the user exists, send rejection email
    if (log?.user?.email) {
      await sendRejectionEmail(log.user.email, faculty.name);
    }

    // ❌ Delete the faculty
    await Faculty.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Faculty deleted and user notified (if applicable).' });
  } catch (err) {
    console.error('Error in deleteFaculty:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// controllers/facultyController.js
exports.rateFaculty = async (req, res) => {
  const { teaching, correction, attendance } = req.body;
  const userId = req.user.id;
  const facultyId = req.params.id;

  try {
    // 1) Fetch faculty
    const f = await Faculty.findById(facultyId);
    if (!f) return res.status(404).json({ error: 'Faculty not found' });

    // 2) Prevent double-rating
    const already = await FacultyLog.findOne({
      user: userId,
      facultyName: f.name,
      action: 'rate'
    });
    if (already) return res.status(400).json({ error: 'You have already rated' });

    // Helper: recalc average correctly
    const recalc = (oldAvg, oldCount, newRating) => {
      const totalSoFar = (oldAvg || 0) * (oldCount || 0);
      const newTotal   = totalSoFar + newRating;
      const newCount   = (oldCount || 0) + 1;
      const newAvg     = newTotal / newCount;
      return { newAvg, newCount };
    };

    // 3) Update teaching
    let { newAvg, newCount } = recalc(f.teaching_rating, f.num_teaching_ratings, teaching);
    f.teaching_rating      = newAvg;
    f.num_teaching_ratings = newCount;

    // 4) Update correction
    ({ newAvg, newCount } = recalc(f.correction_rating, f.num_correction_ratings, correction));
    f.correction_rating      = newAvg;
    f.num_correction_ratings = newCount;

    // 5) Update attendance
    ({ newAvg, newCount } = recalc(f.attendance_rating, f.num_attendance_ratings, attendance));
    f.attendance_rating      = newAvg;
    f.num_attendance_ratings = newCount;

    // 6) Save faculty
    await f.save();

    // 7) Log the action
    await FacultyLog.create({
      user: userId,
      facultyName: f.name,
      action: 'rate'
    });

    // 8) Return new averages
    return res.json({
      teaching:   f.teaching_rating.toFixed(2),
      correction: f.correction_rating.toFixed(2),
      attendance: f.attendance_rating.toFixed(2)
    });
  } catch (err) {
    console.error('Rate error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// controllers/faculty.js
const jwt        = require('jsonwebtoken');
exports.checkIfUserRated = async (req, res) => {
  try {
    // 1) Extract & verify token
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;
    if (!token) {
      return res.status(401).json({ message: 'Missing or invalid token' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized: bad token' });
    }
    const userId = payload.id || payload._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: no user in token' });
    }

    // 2) Load faculty to get its display name
    const faculty = await Faculty.findById(req.params.id).lean();
    if (!faculty) {
      return res.status(404).json({ hasRated: false });
    }
    const targetName = faculty.name.trim().toLowerCase();

    // 3) Fetch **all** “rate” logs for this user
    const logs = await FacultyLog.find({
      user:   userId,
      action: 'rate'
    }).lean();

    // 4) Do a case‐insensitive, trimmed comparison in JS
    const hasRated = logs.some(log => {
      if (!log.facultyName) return false;
      return log.facultyName.trim().toLowerCase() === targetName;
    });

    // 5) Return the result
    return res.json({ hasRated });
  } catch (err) {
    console.error('[checkIfUserRated] error:', err);
    return res
      .status(500)
      .json({ message: 'Failed to check rating history' });
  }
};
