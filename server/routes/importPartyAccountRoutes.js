const express = require('express');
const router = express.Router();
const importPartyAccountController = require('../controllers/importPartyAccountController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept Excel files only
    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      return cb(new Error('Only Excel files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Route for processing Excel file to AccountLevel4 model
router.post('/account-level4', 
  (req, res, next) => {
    upload.single('excelFile')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ error: 'Unexpected file field.' });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.status(400).json({ error: err.message });
      }
      // Everything went fine.
      next();
    });
  },
  importPartyAccountController.processAccountLevel4Excel
);

// Add a test route to verify the routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Import Party Account routes are working' });
});

// Add a route to check available endpoints
router.get('/', (req, res) => {
  res.json({
    endpoints: [
      'POST /account-level4 - Process Excel file to AccountLevel4',
      'GET /test - Test route',
      'GET / - List available endpoints'
    ]
  });
});

module.exports = router;