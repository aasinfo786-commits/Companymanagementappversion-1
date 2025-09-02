const express = require('express');
const router = express.Router();
const debtorAccountController = require('../controllers/debtorAccountController');

// Default debtors routes
router.get('/defaults/debtors/:companyId', debtorAccountController.getDefaultDebtors);
router.post('/defaults/debtors', debtorAccountController.addDefaultDebtor);
router.put('/defaults/debtors/:id', debtorAccountController.updateDefaultDebtor);
router.delete('/defaults/debtors/:id', debtorAccountController.deleteDefaultDebtor);
router.patch('/defaults/debtors/:id/active', debtorAccountController.toggleActive);
router.patch('/defaults/debtors/:id/default', debtorAccountController.toggleDefault);

module.exports = router;