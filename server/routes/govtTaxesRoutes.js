const express = require('express');
const router = express.Router();
const govtTaxesController = require('../controllers/govtTaxesController');

// Base path: /api/defaults/govt_taxes

// Get all government tax accounts for a company
router.get('/:companyId', govtTaxesController.getDefaultTaxes);

// Add new government tax account
router.post('/', govtTaxesController.addDefaultTax);

// Update government tax account
router.put('/:id', govtTaxesController.updateDefaultTax);

// Delete government tax account
router.delete('/:id', govtTaxesController.deleteDefaultTax);

// Toggle active status
router.patch('/:id/active', govtTaxesController.toggleActive);

// Toggle default status
router.patch('/:id/default', govtTaxesController.toggleDefault);

module.exports = router;