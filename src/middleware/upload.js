// File upload middleware using Multer
// Handles avatar image uploads — saves to uploads/avatars/ with a unique filename
// Only allows image files (jpg, jpeg, png, gif, webp) up to 2MB

const multer = require('multer');
const path = require('path');

// Configure disk storage — where to save files and how to name them
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);  // e.g., avatar-1-1700000000000.jpg
  },
});

// File type filter — reject non-image uploads
const fileFilter = (req, file, cb) => {
  const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
  if (allowed.test(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },  // 2MB max
});

module.exports = upload;
