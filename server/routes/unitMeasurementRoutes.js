const express = require('express');
const router = express.Router();
const unitMeasurementController = require('../controllers/unitMeasurementController');

// Routes
router.get('/:companyId', unitMeasurementController.getUnitsByCompany);
router.post('/', unitMeasurementController.createUnit);
router.put('/:id', unitMeasurementController.updateUnit);
router.delete('/:id', unitMeasurementController.deleteUnit);

module.exports = router;