const express = require('express');
const router = express.Router();
const {
  getFilteredDiscounts,
  saveDiscounts,
  getCurrentDiscounts,
  deleteDiscount
} = require('../controllers/discountRateSettingController');

// Base path: /api/product-discounts

// Get filtered discounts based on all three IDs
router.post('/:companyId/filtered', getFilteredDiscounts);

// Save multiple discounts (create/update)
router.put('/:companyId', saveDiscounts);

// Get current active discounts
router.post('/:companyId/current', getCurrentDiscounts);

// Delete a specific discount
router.delete('/:id', deleteDiscount);

module.exports = router;