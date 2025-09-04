const express = require('express');
const router = express.Router();
const taxRateController = require('../controllers/taxRateSettingController');


// Base path: /api/tax-rates

// Get filtered tax rates
router.post('/:companyId/filtered', taxRateController.getFilteredTaxRates);

// Save all tax rates
router.put('/:companyId', taxRateController.saveTaxRates);

// Get current active tax rates
router.post('/:companyId/current', taxRateController.getCurrentTaxRates);

// Delete a specific tax rate
router.delete('/:id', taxRateController.deleteTaxRate);



module.exports = router;