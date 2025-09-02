const express = require('express');
const router = express.Router();
const {
  getDebtorAccounts,
  getSubAccounts,
  getProvinces,
  getCities,
  getSalesPersons,
  getCustomerProfiles,
  createCustomerProfile,
  updateCustomerProfile,
  getCustomerProfileByAccount,
  checkExistingProfile
} = require('../controllers/customerProfileController');

// Base path: /api/customer-profile

// Account Reference Routes
router.get('/debtor-accounts/:companyId', getDebtorAccounts);
router.get('/sub-accounts/:companyId', getSubAccounts);

// Location Reference Routes
router.get('/provinces/:companyId', getProvinces);
router.get('/cities/:companyId', getCities);

// Sales Reference Routes
router.get('/sales-persons/:companyId', getSalesPersons);

// Check if profile exists
router.get('/check-existing', checkExistingProfile);

// Profile Management Routes
router.get('/profiles/:companyId', getCustomerProfiles); // Get all profiles for company
router.get('/:companyId/:debtorAccountId/:subAccountId', getCustomerProfileByAccount); // Get specific profile
router.post('/', createCustomerProfile); // Create new profile
router.put('/:id', updateCustomerProfile); // Update existing profile

// Legacy route for backward compatibility
router.post('/default-debtor-account', createCustomerProfile);

module.exports = router;