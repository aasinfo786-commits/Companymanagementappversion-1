const express = require('express');
const router = express.Router();
const discountRateController = require('../controllers/discountRateController');

// Base path: /api/defaults/discounts

// Get all discount rate accounts for a company
router.get('/:companyId', discountRateController.getDefaultDiscounts);

// Add new discount rate account
router.post('/', discountRateController.addDefaultDiscount);

// Update discount rate account (rate, active status, or title)
router.put('/:id', discountRateController.updateDefaultDiscount);

// Delete discount rate account
router.delete('/:id', discountRateController.deleteDefaultDiscount);

// Toggle active status
router.patch('/:id/active', discountRateController.toggleActive);

// Toggle default status
router.patch('/:id/default', discountRateController.toggleDefault);

module.exports = router;