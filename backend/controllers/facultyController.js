const Faculty = require('../models/Faculty');

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
    console.error(" Error fetching faculty:", err);
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
    console.error(' Pagination fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch paginated faculty' });
  }
};
