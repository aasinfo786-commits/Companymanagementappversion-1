const UnitMeasurement = require('../models/UnitMeasurement');
const mongoose = require('mongoose');

// Create a new unit of measurement
const createUnit = async (req, res) => {
  try {
    const { companyId, code, title, createdBy } = req.body;
    
    if (!companyId || !code || !title || !createdBy) {
      return res.status(400).json({ 
        error: 'companyId, code, title, and createdBy are required.' 
      });
    }
    
    // Check if unit with same code already exists for this company
    const existingCode = await UnitMeasurement.findOne({ companyId, code });
    if (existingCode) {
      return res.status(409).json({ 
        error: 'A unit with this code already exists for this company.' 
      });
    }
    
    // Check if unit with same title already exists for this company
    const existingTitle = await UnitMeasurement.findOne({ companyId, title });
    if (existingTitle) {
      return res.status(409).json({ 
        error: 'A unit with this title already exists for this company.' 
      });
    }
    
    const unit = new UnitMeasurement({ 
      companyId, 
      code, 
      title,
      createdBy,
      updatedBy: createdBy
    });
    
    await unit.save();
    res.status(201).json(unit);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Get all units of measurement for a company
const getUnitsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).json({ 
        error: 'companyId is required in URL params.' 
      });
    }
    const units = await UnitMeasurement.find({ companyId }).sort({ code: 1 });
    res.status(200).json(units);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Update a unit of measurement
const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, title, updatedBy } = req.body;
    
    if (!code || !title || !updatedBy) {
      return res.status(400).json({ 
        error: 'code, title, and updatedBy are required.' 
      });
    }
    
    // Check if another unit with the same code exists (excluding current unit)
    const existingCode = await UnitMeasurement.findOne({
      _id: { $ne: id },
      companyId: req.body.companyId,
      code
    });
    if (existingCode) {
      return res.status(409).json({ 
        error: 'Another unit with this code already exists for this company.' 
      });
    }
    
    // Check if another unit with the same title exists (excluding current unit)
    const existingTitle = await UnitMeasurement.findOne({
      _id: { $ne: id },
      companyId: req.body.companyId,
      title
    });
    if (existingTitle) {
      return res.status(409).json({ 
        error: 'Another unit with this title already exists for this company.' 
      });
    }
    
    const updated = await UnitMeasurement.findByIdAndUpdate(
      id,
      { code, title, updatedBy },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Unit not found.' });
    }
    
    res.status(200).json(updated);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Delete a unit of measurement
const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, get the unit to be deleted to access its code and companyId
    const unit = await UnitMeasurement.findById(id);
    if (!unit) {
      return res.status(404).json({ error: 'Unit not found.' });
    }
    
    const unitCode = unit.code;
    const companyId = unit.companyId;
    console.log(`Found unit: ${unitCode} in company: ${companyId}`);
    
    // Check for references in specific models with specific field names
    const references = [];
    
    // Check SalesVoucher model for unitMeasurementCode field (top level)
    try {
      const SalesVoucher = mongoose.model('SalesVoucher');
      const salesVoucherCount = await SalesVoucher.countDocuments({ 
        companyId: companyId,
        unitMeasurementCode: unitCode
      });
      
      if (salesVoucherCount > 0) {
        references.push({ 
          model: 'SalesVoucher', 
          count: salesVoucherCount, 
          field: 'unitMeasurementCode (top level)' 
        });
        console.log(`Found ${salesVoucherCount} references in SalesVoucher for top-level unitMeasurementCode ${unitCode}`);
      }
    } catch (error) {
      console.error('Error checking SalesVoucher model for top-level unitMeasurementCode:', error.message);
    }
    
    // Check SalesVoucher model for unitMeasurementCode field in items array
    try {
      const SalesVoucher = mongoose.model('SalesVoucher');
      const salesVoucherItemsCount = await SalesVoucher.countDocuments({ 
        companyId: companyId,
        'items.unitMeasurementCode': unitCode
      });
      
      if (salesVoucherItemsCount > 0) {
        references.push({ 
          model: 'SalesVoucher', 
          count: salesVoucherItemsCount, 
          field: 'items.unitMeasurementCode' 
        });
        console.log(`Found ${salesVoucherItemsCount} references in SalesVoucher items for unitMeasurementCode ${unitCode}`);
      }
    } catch (error) {
      console.error('Error checking SalesVoucher model for items.unitMeasurementCode:', error.message);
    }
    
    // Check ItemProfile model for unitCode field
    try {
      const ItemProfile = mongoose.model('ItemProfile');
      const itemProfileCount = await ItemProfile.countDocuments({ 
        companyId: companyId,
        unitCode: unitCode
      });
      
      if (itemProfileCount > 0) {
        references.push({ 
          model: 'ItemProfile', 
          count: itemProfileCount, 
          field: 'unitCode' 
        });
        console.log(`Found ${itemProfileCount} references in ItemProfile for unitCode ${unitCode}`);
      }
    } catch (error) {
      console.error('Error checking ItemProfile model:', error.message);
    }
    
    // If there are references, return an error with details
    if (references.length > 0) {
      // Format reference details for the error message
      const referenceDetails = references.map(ref => 
        `${ref.model} model: ${ref.count} records with ${ref.field}`
      ).join(', ');
      
      console.log(`References found: ${referenceDetails}`);
      return res.status(400).json({ 
        success: false,
        message: `Cannot delete unit. Found references in: ${referenceDetails}.`,
        details: {
          unitCode,
          companyId,
          references: references,
          actionRequired: "Please remove all references to this unit before deleting."
        }
      });
    }
    
    // If no references, proceed with deletion
    console.log('No references found, proceeding with deletion');
    const deleted = await UnitMeasurement.findByIdAndDelete(id);
    
    res.status(200).json({ 
      success: true,
      message: 'Unit deleted successfully',
      deletedUnit: deleted 
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Export all functions
module.exports = {
  createUnit,
  getUnitsByCompany,
  updateUnit,
  deleteUnit,
};