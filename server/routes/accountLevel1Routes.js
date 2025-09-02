const express = require('express');
const router = express.Router();
const accountLevel1Controller = require('../controllers/accountLevel1Controller');

// Routes
router.get('/:companyId', accountLevel1Controller.getAccountsByCompany);
router.post('/', accountLevel1Controller.createAccountLevel1);
router.put('/:id', accountLevel1Controller.updateAccountLevel1);
router.delete('/:id', accountLevel1Controller.deleteAccountLevel1);

module.exports = router;
