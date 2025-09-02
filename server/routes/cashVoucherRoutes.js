const express = require('express');
const router = express.Router();
const cashVoucherController = require('../controllers/cashVoucherController');

// Account Level Options
router.get('/debit/level3-options/:companyId', cashVoucherController.getDebitAccountLevel3Options);
router.get('/debit/level4-options/:companyId/:level3Id', cashVoucherController.getDebitAccountLevel4Options);

router.get('/credit/level3-options/:companyId', cashVoucherController.getCreditAccountLevel3Options);
router.get('/credit/level4-options/:companyId/:level3Id', cashVoucherController.getCreditAccountLevel4Options);

router.get('/additional/level3-options/:companyId', cashVoucherController.getAdditionalChargesLevel3Options);
router.get('/additional/level4-options/:companyId/:level3Id', cashVoucherController.getAdditionalChargesLevel4Options);

// Voucher Number Generation
router.get('/next-number/:companyId/:locationId/:financialYearId/:voucherType', 
  cashVoucherController.getNextVoucherNumber
);

// Voucher CRUD Operations
router.post('/', cashVoucherController.createVoucher);
router.get('/details/:companyId/:voucherId', cashVoucherController.getVoucherDetails); // Changed path
router.get('/all/:companyId', cashVoucherController.getAllVouchers);
router.put('/:companyId/:voucherId', cashVoucherController.updateVoucher);
router.delete('/:companyId/:voucherId', cashVoucherController.deleteVoucher);

// Get paginated vouchers
router.get('/list/:companyId', cashVoucherController.getVouchers);

module.exports = router;