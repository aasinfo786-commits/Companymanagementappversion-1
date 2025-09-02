// routes/provinceRoutes.js
const express = require('express');
const router = express.Router();
const {
  createProvince,
  getProvincesByCompany,
  updateProvince,
  deleteProvince,
  toggleProvinceStatus
} = require('../controllers/provinceController');

// Create a new province
router.post('/', createProvince);

// Get all provinces for a company
router.get('/:companyId', getProvincesByCompany);

// Update a province
router.put('/:id', updateProvince);

// Delete a province
router.delete('/:id', deleteProvince);

// Toggle province status
router.patch('/status/:id', toggleProvinceStatus);

module.exports = router;