const mongoose = require('mongoose');
const PurchaseOrder = require('../models/PurchaseOrder');
const Creditor = require('../models/CreditorAccount');
const Broker = require('../models/BrokerAccount');
const RawMaterial = require('../models/RawMaterial');
const AccountLevel4 = require('../models/AccountLevel4');
const User = require('../models/User');

// Helper function to get the next PO number
exports.getNextPONumber = async (req, res) => {
  try {
    const { companyId, year } = req.params;
    
    // Find the highest PO number for this company and year
    const latestPO = await PurchaseOrder.findOne({
      companyId,
      poNumber: new RegExp(`^${year}-`)
    }).sort({ poNumber: -1 });
    
    let nextNumber = 1;
    if (latestPO) {
      // Extract the numeric part from the PO number (e.g., "2025-00001" -> 1)
      const parts = latestPO.poNumber.split('-');
      if (parts.length === 2) {
        nextNumber = parseInt(parts[1]) + 1;
      }
    }
    
    // Format with leading zeros (e.g., 1 -> 00001)
    const formattedNumber = nextNumber.toString().padStart(5, '0');
    const poNumber = `${year}-${formattedNumber}`;
    
    res.json({ poNumber });
  } catch (err) {
    console.error('Error generating PO number:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to generate PO number'
    });
  }
};

// Helper function to validate references
const validateReferences = async (companyId, creditorId, creditorLevel4Id, brokerId, brokerLevel4Id, items) => {
  // Validate creditor
  const creditor = await Creditor.findOne({ _id: creditorId, companyId });
  if (!creditor) {
    throw new Error('Creditor not found');
  }
  
  // Validate creditor level 4
  const creditorLevel4 = await AccountLevel4.findOne({ 
    _id: creditorLevel4Id, 
    companyId,
    level1Id: creditor.level1Id,
    level2Id: creditor.level2Id,
    level3Id: creditor.level3Id
  });
  if (!creditorLevel4) {
    throw new Error('Creditor level 4 not found');
  }
  
  // Validate broker if provided
  let broker = null;
  let brokerLevel4 = null;
  if (brokerId) {
    broker = await Broker.findOne({ _id: brokerId, companyId });
    if (!broker) {
      throw new Error('Broker not found');
    }
    
    if (brokerLevel4Id) {
      brokerLevel4 = await AccountLevel4.findOne({ 
        _id: brokerLevel4Id, 
        companyId,
        level1Id: broker.level1Id,
        level2Id: broker.level2Id,
        level3Id: broker.level3Id
      });
      if (!brokerLevel4) {
        throw new Error('Broker level 4 not found');
      }
    }
  }
  
  // Validate raw materials
  const validatedItems = [];
  for (const item of items) {
    const rawMaterial = await RawMaterial.findOne({ _id: item.rawMaterialId, companyId });
    if (!rawMaterial) {
      throw new Error(`Raw material not found: ${item.rawMaterialId}`);
    }
    
    const rawMaterialLevel4 = await AccountLevel4.findOne({ 
      _id: item.rawMaterialLevel4Id, 
      companyId,
      level1Id: rawMaterial.level1Id,
      level2Id: rawMaterial.level2Id,
      level3Id: rawMaterial.level3Id
    });
    if (!rawMaterialLevel4) {
      throw new Error(`Raw material level 4 not found: ${item.rawMaterialLevel4Id}`);
    }
    
    // Validate payment mode, freight charge by, and bag type values
    const validPaymentModes = ['Cash', 'Cheque', 'Bank Transfer', 'DD', 'PO', ''];
    const validFreightChargeBy = ['Mill', 'Ex-Mill', ''];
    const validBagTypes = ['pp bag a', 'pp bag b', 'jute bag', 'jute a', 'jute b', 'jute c', 'jute d', ''];
    
    if (item.paymentMode && !validPaymentModes.includes(item.paymentMode)) {
      throw new Error(`Invalid payment mode: ${item.paymentMode}`);
    }
    
    if (item.freightChargeBy && !validFreightChargeBy.includes(item.freightChargeBy)) {
      throw new Error(`Invalid freight charge by: ${item.freightChargeBy}`);
    }
    
    if (item.bagType && !validBagTypes.includes(item.bagType)) {
      throw new Error(`Invalid bag type: ${item.bagType}`);
    }
    
    validatedItems.push({
      ...item,
      rawMaterial,
      rawMaterialLevel4
    });
  }
  
  return {
    creditor,
    creditorLevel4,
    broker,
    brokerLevel4,
    validatedItems
  };
};

// Create a new purchase order
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { companyId } = req.params;
    const poData = req.body;
    
    // Validate input
    if (!poData.poNumber || !poData.poDate || !poData.creditorId || !poData.creditorLevel4Id || !poData.items || poData.items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Find user by username
    const user = await User.findOne({ username: poData.createdBy });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    // Validate references
    const {
      creditor,
      creditorLevel4,
      broker,
      brokerLevel4,
      validatedItems
    } = await validateReferences(
      companyId, 
      poData.creditorId, 
      poData.creditorLevel4Id, 
      poData.brokerId, 
      poData.brokerLevel4Id,
      poData.items
    );
    
    // Check if PO number already exists
    const existingPO = await PurchaseOrder.findOne({ companyId, poNumber: poData.poNumber });
    if (existingPO) {
      return res.status(400).json({ error: 'PO number already exists' });
    }
    
    // Create new purchase order
    const newPO = new PurchaseOrder({
      companyId,
      poNumber: poData.poNumber,
      poDate: new Date(poData.poDate),
      isCancelled: poData.isCancelled || false,
      creditorId: poData.creditorId,
      creditorCode: creditor.code,
      creditorLevel4Id: poData.creditorLevel4Id,
      creditorLevel4Code: creditorLevel4.subcode,
      brokerId: poData.brokerId,
      brokerCode: broker?.code || '',
      brokerLevel4Id: poData.brokerLevel4Id,
      brokerLevel4Code: brokerLevel4?.subcode || '',
      commissionType: poData.commissionType || 'weight',
      commissionValue: poData.commissionValue || 0,
      items: validatedItems.map(item => ({
        rawMaterialId: item.rawMaterialId,
        rawMaterialCode: item.rawMaterial.code,
        rawMaterialLevel4Id: item.rawMaterialLevel4Id,
        rawMaterialLevel4Code: item.rawMaterialLevel4.subcode,
        exclRate: item.exclRate,  // Changed from rate to exclRate
        inclRate: item.inclRate,  // Added inclRate
        uom: item.uom,
        uomFactor: item.uomFactor,
        bagRate: item.bagRate || 0,  // Added bagRate
        bagType: item.bagType || '',  // Added bagType
        paymentMode: item.paymentMode,
        paymentTerm: item.paymentTerm,
        freightChargeBy: item.freightChargeBy,
        qualityParameters: item.qualityParameters,
        creditDays: item.creditDays,
        bagsCriteria: item.bagsCriteria
      })),
      totalType: poData.totalType || 'bags',
      totalBags: poData.totalBags || 0,
      totalWeight: poData.totalWeight || 0,
      totalTruck: poData.totalTruck || 0,
      receivedBags: poData.receivedBags || 0,
      receivedWeight: poData.receivedWeight || 0,
      receivedTruck: poData.receivedTruck || 0,
      balanceBags: poData.balanceBags || 0,
      balanceWeight: poData.balanceWeight || 0,
      balanceTruck: poData.balanceTruck || 0,
      minQuantity: poData.minQuantity || 0,
      maxQuantity: poData.maxQuantity || 0,
      remarks: poData.remarks || '',
      createdBy: user.username,
      updatedBy: user.username
    });
    
    // Save purchase order
    const savedPO = await newPO.save();
    
    // Get the next PO number for the response
    const currentYear = new Date().getFullYear();
    const latestPO = await PurchaseOrder.findOne({
      companyId,
      poNumber: new RegExp(`^${currentYear}-`)
    }).sort({ poNumber: -1 });
    
    let nextNumber = 1;
    if (latestPO) {
      const parts = latestPO.poNumber.split('-');
      if (parts.length === 2) {
        nextNumber = parseInt(parts[1]) + 1;
      }
    }
    
    const formattedNumber = nextNumber.toString().padStart(5, '0');
    const nextPoNumber = `${currentYear}-${formattedNumber}`;
    
    res.status(201).json({
      message: 'Purchase order created successfully',
      purchaseOrder: savedPO,
      nextPoNumber
    });
  } catch (err) {
    console.error('Error creating purchase order:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to create purchase order'
    });
  }
};

// Cancel a purchase order
exports.cancelPurchaseOrder = async (req, res) => {
  try {
    const { companyId, poNumber } = req.params;
    const { updatedBy } = req.body;
    
    // Find user by username
    const user = await User.findOne({ username: updatedBy });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    // Find and update purchase order
    const updatedPO = await PurchaseOrder.findOneAndUpdate(
      { companyId, poNumber },
      { 
        isCancelled: true,
        updatedBy: user.username,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedPO) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    
    res.json({
      message: 'Purchase order cancelled successfully',
      purchaseOrder: updatedPO
    });
  } catch (err) {
    console.error('Error cancelling purchase order:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to cancel purchase order'
    });
  }
};

// Get pending purchase orders for a creditor and raw material
exports.getPendingOrders = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { creditorId, rawMaterialId } = req.query;
    
    if (!creditorId || !rawMaterialId) {
      return res.status(400).json({ error: 'Creditor ID and Raw Material ID are required' });
    }
    
    // Find pending purchase orders (not cancelled and with balance > 0)
    const pendingOrders = await PurchaseOrder.find({
      companyId,
      creditorId,
      isCancelled: false,
      $or: [
        { balanceBags: { $gt: 0 } },
        { balanceWeight: { $gt: 0 } },
        { balanceTruck: { $gt: 0 } }
      ],
      'items.rawMaterialId': rawMaterialId
    }).sort({ poDate: -1 });
    
    res.json(pendingOrders);
  } catch (err) {
    console.error('Error fetching pending orders:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to fetch pending orders'
    });
  }
};

// Get all purchase orders for a company
exports.getPurchaseOrders = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 10, creditorId, isCancelled } = req.query;
    
    // Build query
    const query = { companyId };
    if (creditorId) query.creditorId = creditorId;
    if (isCancelled !== undefined) query.isCancelled = isCancelled === 'true';
    
    // Get purchase orders with pagination
    const purchaseOrders = await PurchaseOrder.find(query)
      .sort({ poDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    // Get total count for pagination
    const count = await PurchaseOrder.countDocuments(query);
    
    res.json({
      purchaseOrders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      count
    });
  } catch (err) {
    console.error('Error fetching purchase orders:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to fetch purchase orders'
    });
  }
};

// Get a single purchase order by ID
exports.getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const purchaseOrder = await PurchaseOrder.populateAll(PurchaseOrder.findById(id));
    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    
    res.json(purchaseOrder);
  } catch (err) {
    console.error('Error fetching purchase order:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to fetch purchase order'
    });
  }
};

// Update a purchase order
exports.updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Find user by username
    const user = await User.findOne({ username: updateData.updatedBy });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    // Validate payment mode, freight charge by, and bag type values if they exist in the update
    if (updateData.items) {
      const validPaymentModes = ['Cash', 'Cheque', 'Bank Transfer', 'DD', 'PO', ''];
      const validFreightChargeBy = ['Mill', 'Ex-Mill', ''];
      const validBagTypes = ['pp bag a', 'pp bag b', 'jute bag', 'jute a', 'jute b', 'jute c', 'jute d', ''];
      
      for (const item of updateData.items) {
        if (item.paymentMode && !validPaymentModes.includes(item.paymentMode)) {
          return res.status(400).json({ error: `Invalid payment mode: ${item.paymentMode}` });
        }
        
        if (item.freightChargeBy && !validFreightChargeBy.includes(item.freightChargeBy)) {
          return res.status(400).json({ error: `Invalid freight charge by: ${item.freightChargeBy}` });
        }
        
        if (item.bagType && !validBagTypes.includes(item.bagType)) {
          return res.status(400).json({ error: `Invalid bag type: ${item.bagType}` });
        }
      }
    }
    
    // Find and update purchase order
    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        updatedBy: user.username,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedPO) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    
    res.json({
      message: 'Purchase order updated successfully',
      purchaseOrder: updatedPO
    });
  } catch (err) {
    console.error('Error updating purchase order:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to update purchase order'
    });
  }
};

// Delete a purchase order
exports.deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedPO = await PurchaseOrder.findByIdAndDelete(id);
    if (!deletedPO) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    
    res.json({
      message: 'Purchase order deleted successfully',
      purchaseOrder: deletedPO
    });
  } catch (err) {
    console.error('Error deleting purchase order:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to delete purchase order'
    });
  }
};