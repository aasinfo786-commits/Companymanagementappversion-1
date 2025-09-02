const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');

// Ensure upload directory exists
const uploadDir = path.resolve(__dirname, '../../public/uploads/profile-pictures');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`✅ Upload directory created at: ${uploadDir}`);
}

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Max 5MB
});

// Middleware to handle multer errors gracefully
const handleUpload = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large (max 5MB)'
        : err.message || 'File upload error';
      return res.status(400).json({ success: false, message });
    } else if (err) {
      return res.status(500).json({ success: false, message: err.message || 'Unexpected error during file upload' });
    }
    next();
  });
};

// Routes
router.get('/', authMiddleware, userController.getAllUsers);
router.get('/:id', authMiddleware, userController.getUserById);

router.post(
  '/',
  authMiddleware,
  handleUpload(upload.single('userPicture')),
  userController.createUser
);

router.put(
  '/:id',
  authMiddleware,
  handleUpload(upload.single('userPicture')),
  userController.updateUser
);

router.delete('/:id', authMiddleware, userController.deleteUser);

router.put('/:id/password', authMiddleware, userController.changePassword);

module.exports = router;
