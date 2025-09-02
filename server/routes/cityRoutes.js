// routes/CityRoutes.js
const express = require('express');
const router = express.Router();
const {
  createCity,
  getCitiesByCompany,
  updateCity,
  deleteCity,
  toggleCityStatus
} = require('../controllers/cityController');

// Create a new city
router.post('/', createCity);

// Get all cities for a company
router.get('/:companyId', getCitiesByCompany);

// Update a city
router.put('/:id', updateCity);

// Delete a city
router.delete('/:id', deleteCity);

// Toggle city status
router.patch('/status/:id', toggleCityStatus);

module.exports = router;