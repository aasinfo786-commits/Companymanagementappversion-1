const express = require('express');
const router = express.Router();
const {
  getFinishedGoods,
  getAccountLevel4,
  getUnitMeasurements,
  createItemProfile,
  updateItemProfile,
  getItemProfile,
  getItemProfiles,
  checkExistingProfile,
    getHSCodeForItem

} = require('../controllers/itemProfileController');

// Base path: /api/item-profile

// Finished Goods Reference Routes
router.get('/finished-goods/:companyId', getFinishedGoods);

// Account Reference Routes
router.get('/:companyId/account-level4', getAccountLevel4);

// Measurement Reference Routes
router.get('/unit-measurements/:companyId', getUnitMeasurements);

// Check if profile exists
router.get('/check-existing', checkExistingProfile);

// Profile Management Routes
router.get('/:companyId/profile/:finishedGoodId', getItemProfiles);
router.get('/:companyId/profile/:finishedGoodId/:profileId', getItemProfile);
router.post('/', createItemProfile);
router.put('/:id', updateItemProfile);
router.get('/:companyId/hs-code', getHSCodeForItem);
module.exports = router;