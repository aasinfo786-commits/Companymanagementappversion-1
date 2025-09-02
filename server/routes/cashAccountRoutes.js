const express = require('express');
const router = express.Router();
const cashAccountController = require('../controllers/cashAccountController');

// Default cash accounts routes
router.get('/defaults/cash/:companyId', cashAccountController.getDefaultCash);
router.post('/defaults/cash', cashAccountController.addDefaultCash);
router.put('/defaults/cash/:id', cashAccountController.updateDefaultCash);
router.delete('/defaults/cash/:id', cashAccountController.deleteDefaultCash);
router.patch('/defaults/cash/:id/active', cashAccountController.toggleActive);
router.patch('/defaults/cash/:id/default', cashAccountController.toggleDefault);

module.exports = router;