const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const Faculty = require('../models/Faculty');

// Cloudinary config (ensure env vars are set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'faculty-images',
    format: async () => 'jpg',
    public_id: (req, file) => Date.now() + '-' + file.originalname.replace(/\s+/g, '-'),
  },
});

const uploadMiddleware = multer({ storage }).single('image');

// Upload controller
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    res.status(200).json({
      message: 'Image uploaded successfully!',
      imageUrl: req.file.path || req.file.secure_url,
      imagePublicId: req.file.filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Image upload failed.', error: error.message });
  }
};

// Faculty delete controller with Cloudinary cleanup
const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

    // If imagePublicId exists, delete from Cloudinary
    if (faculty.imagePublicId) {
      await cloudinary.uploader.destroy(faculty.imagePublicId);
    }

    await Faculty.findByIdAndDelete(req.params.id);

    res.json({ message: 'Faculty and associated image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete faculty' });
  }
};

module.exports = {
  uploadMiddleware,
  uploadImage,
  deleteFaculty
};
