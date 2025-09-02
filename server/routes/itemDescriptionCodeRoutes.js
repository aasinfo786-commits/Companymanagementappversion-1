const express = require('express');
const router = express.Router();
const itemDescriptionCodeController = require('../controllers/itemDescriptionCodeController');

// Routes
router.get('/:companyId', itemDescriptionCodeController.getItemDescriptionCodesByCompany);
router.post('/', itemDescriptionCodeController.createItemDescriptionCode);
router.put('/:id', itemDescriptionCodeController.updateItemDescriptionCode);
router.delete('/:id', itemDescriptionCodeController.deleteItemDescriptionCode);
router.get('/search/:companyId', itemDescriptionCodeController.searchItemDescriptionCodes);

module.exports = router;
