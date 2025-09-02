// routes/supplierProfile.js
const express = require('express');
const router = express.Router();
const supplierProfileController = require('../controllers/supplierProfileController');

// Creditor accounts
router.get('/creditor-accounts/:companyId', supplierProfileController.getCreditorAccounts);
router.get('/default-creditor-account/:companyId', supplierProfileController.getDefaultCreditorAccount);

// Account level 4s
router.get('/account-level4s/:companyId', supplierProfileController.getAccountLevel4s);

// Provinces and cities
router.get('/provinces/:companyId', supplierProfileController.getProvinces);
router.get('/cities/:companyId', supplierProfileController.getCities);

// Supplier profiles
router.post('/', supplierProfileController.createSupplierProfile);
router.put('/:id', supplierProfileController.updateSupplierProfile);
router.get('/all/:companyId', supplierProfileController.getAllSupplierProfiles);
router.get('/:id', supplierProfileController.getSupplierProfile);
router.get('/by-account/:companyId/:creditorAccountId/:accountLevel4Id', supplierProfileController.getSupplierProfileByAccount);

module.exports = router;