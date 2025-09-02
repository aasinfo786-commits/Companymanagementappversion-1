const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');

// Base path: /api/purchase-orders

// Get next PO number
router.get('/next-number/:companyId/:year', purchaseOrderController.getNextPONumber);


// Get pending orders
router.get('/pending/:companyId', purchaseOrderController.getPendingOrders);

// Get all purchase orders
router.get('/:companyId', purchaseOrderController.getPurchaseOrders);

// Get a single purchase order
router.get('/by-id/:id', purchaseOrderController.getPurchaseOrderById);

// Create a new purchase order
router.post('/:companyId', purchaseOrderController.createPurchaseOrder);

// Cancel a purchase order
router.put('/cancel/:companyId/:poNumber', purchaseOrderController.cancelPurchaseOrder);

// Update a purchase order
router.put('/by-id/:id', purchaseOrderController.updatePurchaseOrder);

// Delete a purchase order
router.delete('/by-id/:id', purchaseOrderController.deletePurchaseOrder);

module.exports = router;