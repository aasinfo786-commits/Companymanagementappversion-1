const express = require('express');
const router = express.Router();
const creditorAccountController = require('../controllers/creditorAccountController');

// Default creditors routes
router.get('/defaults/creditors/:companyId', creditorAccountController.getDefaultCreditors);
router.post('/defaults/creditors', creditorAccountController.addDefaultCreditor);
router.put('/defaults/creditors/:id', creditorAccountController.updateDefaultCreditor);
router.delete('/defaults/creditors/:id', creditorAccountController.deleteDefaultCreditor);
router.patch('/defaults/creditors/:id/active', creditorAccountController.toggleActive);
router.patch('/defaults/creditors/:id/default', creditorAccountController.toggleDefault);

module.exports = router;