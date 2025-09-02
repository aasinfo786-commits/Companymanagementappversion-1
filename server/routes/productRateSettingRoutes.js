const express = require('express');
const router = express.Router();
const {
  getRatesForAccounts,
  saveRates,
  getRatesByFinishedGood,
  getCurrentRates,
  deleteRate,
  getRatesForAccountAndDates
} = require('../controllers/productRateSettingController');

// Base path: /api/product-rates

// Get rates for multiple account level 4 items
router.post('/:companyId/accounts', getRatesForAccounts);

// Save multiple rates (create/update)
router.put('/:companyId', saveRates);

// Get all rates for a specific finished good (grouped by account)
router.get('/:companyId/finished-good/:finishedGoodId', getRatesByFinishedGood);

// Get current active rates for a finished good
router.get('/:companyId/current-rates/:finishedGoodId', getCurrentRates);

// Delete a specific rate
router.delete('/rates/:id', deleteRate);// Get rates for specific dates for an account level 4 item
router.post('/:companyId/account/:accountId/dates', getRatesForAccountAndDates);

module.exports = router;