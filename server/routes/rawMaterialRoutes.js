const express = require('express');
const router = express.Router();
const rawMaterialController = require('../controllers/rawMaterialController');

// Default raw materials routes
router.get('/defaults/rawMaterials/:companyId', rawMaterialController.getDefaultRawMaterials);
router.post('/defaults/rawMaterials', rawMaterialController.addDefaultRawMaterial);
router.put('/defaults/rawMaterials/:id', rawMaterialController.updateDefaultRawMaterial);
router.delete('/defaults/rawMaterials/:id', rawMaterialController.deleteDefaultRawMaterial);
router.patch('/defaults/rawMaterials/:id/active', rawMaterialController.toggleActive);
router.patch('/defaults/rawMaterials/:id/default', rawMaterialController.toggleDefault);

module.exports = router;