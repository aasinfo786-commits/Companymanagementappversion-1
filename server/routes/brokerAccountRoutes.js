const express = require('express');
const router = express.Router();
const brokerAccountController = require('../controllers/brokerAccountController');

// Default broker accounts routes
router.get('/defaults/brokerAccounts/:companyId', brokerAccountController.getDefaultBrokerAccounts);
router.post('/defaults/brokerAccounts', brokerAccountController.addDefaultBrokerAccount);
router.put('/defaults/brokerAccounts/:id', brokerAccountController.updateDefaultBrokerAccount);
router.delete('/defaults/brokerAccounts/:id', brokerAccountController.deleteDefaultBrokerAccount);
router.patch('/defaults/brokerAccounts/:id/active', brokerAccountController.toggleActive);
router.patch('/defaults/brokerAccounts/:id/default', brokerAccountController.toggleDefault);

module.exports = router;