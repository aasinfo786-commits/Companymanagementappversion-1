// routes/salesPersonRoutes.js
const express = require('express');
const router = express.Router();
const {
  createSalesPerson,
  getSalesPersonsByCompany,
  updateSalesPerson,
  deleteSalesPerson,
  toggleSalesPersonStatus
} = require('../controllers/salesPersonController');

router.post('/', createSalesPerson);
router.get('/:companyId', getSalesPersonsByCompany);
router.put('/:id', updateSalesPerson);
router.delete('/:id', deleteSalesPerson);
router.patch('/status/:id', toggleSalesPersonStatus);

module.exports = router;