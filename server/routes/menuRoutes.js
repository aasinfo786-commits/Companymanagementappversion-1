// 📁 server/routes/menuRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMenus, addMenu } = require('../controllers/menuController');

// Protect routes with authMiddleware
router.get('/', authMiddleware, getMenus);
router.post('/', authMiddleware, addMenu);

module.exports = router;
