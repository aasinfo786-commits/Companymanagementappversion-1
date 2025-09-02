const express = require('express');
const router = express.Router();
const sroScheduleController = require('../controllers/sroScheduleController');

// Routes
router.get('/:companyId', sroScheduleController.getSroItemsByCompany);
router.post('/', sroScheduleController.createSroItem);
router.put('/:id', sroScheduleController.updateSroItem);
router.delete('/:id', sroScheduleController.deleteSroItem);
router.get('/search/:companyId', sroScheduleController.searchSroItems);

module.exports = router;