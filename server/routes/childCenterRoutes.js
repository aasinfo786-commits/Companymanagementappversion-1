const express = require('express');
const router = express.Router();
const childCenterController = require('../controllers/childCenterController');

// Add this new route
router.get('/last-code', childCenterController.getLastChildCode);
router.get('/check-code', childCenterController.checkChildCodeExists);

// Keep your existing routes
router.get('/company/:companyId', childCenterController.getChildCenters);
router.post('/', childCenterController.createChildCenter);
router.put('/:id', childCenterController.updateChildCenter);
router.delete('/:id', childCenterController.deleteChildCenter);
router.patch('/:id/active', childCenterController.toggleActiveStatus);

module.exports = router;