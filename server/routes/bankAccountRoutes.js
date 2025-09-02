const express = require('express');
const router = express.Router();
const bankAccountController = require('../controllers/bankAccountController');

// Default banks routes
router.get('/defaults/banks/:companyId', bankAccountController.getDefaultBanks);
router.post('/defaults/banks', bankAccountController.addDefaultBank);
router.put('/defaults/banks/:id', bankAccountController.updateDefaultBank);
router.delete('/defaults/banks/:id', bankAccountController.deleteDefaultBank);
router.patch('/defaults/banks/:id/active', bankAccountController.toggleActive);
router.patch('/defaults/banks/:id/default', bankAccountController.toggleDefault);


module.exports = router;