const Faculty = require('../models/Faculty');
const FacultyLog = require('../models/FacultyLog');

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

exports.getFacultyDetails = async (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).json({ error: "Missing 'name' parameter" });

  try {
    const faculty = await Faculty.findOne({
      name: { $regex: '^' + name + '$', $options: 'i' }
    });

    if (!faculty) return res.status(404).json({ error: "Faculty not found" });
    res.json(faculty);
  } catch (err) {
    console.error("Error fetching faculty:", err);
    res.status(500).json({ error: "Internal server error" });
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
