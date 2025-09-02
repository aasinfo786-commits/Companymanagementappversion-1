const express = require('express');
const router = express.Router();
const goDownController = require('../controllers/goDownController');

// Routes
router.get('/:companyId', goDownController.getGodownsByCompany);
router.post('/', goDownController.createGodown);
router.put('/:id', goDownController.updateGodown);
router.delete('/:id', goDownController.deleteGodown);

module.exports = router;