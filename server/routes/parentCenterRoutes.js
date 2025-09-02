const express = require('express');
const router = express.Router();
const parentCenterController = require('../controllers/parentCenterController');

router.post('/', parentCenterController.createParentCenter);
router.get('/company/:companyId', parentCenterController.getParentCenters);
router.put('/:id', parentCenterController.updateParentCenter);
router.delete('/:id', parentCenterController.deleteParentCenter);
router.patch('/:id/active', parentCenterController.toggleActiveStatus);

module.exports = router;