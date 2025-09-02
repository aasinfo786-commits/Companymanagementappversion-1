// controller/provinceController.js
const Province = require('../models/Provinces');
const mongoose = require('mongoose');

// Create a new province
const createProvince = async (req, res) => {
  try {
    const { companyId, code, title, rateDiff, rateChoice, status } = req.body;
    if (!companyId || !code || !title || rateDiff === undefined || rateChoice === undefined) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    // Check if code already exists for this company
    const existingCode = await Province.findOne({ companyId, code });
    if (existingCode) {
      return res.status(400).json({ error: 'Province code already exists for this company.' });
    }
    const province = new Province({ 
      companyId, 
      code, 
      title, 
      rateDiff, 
      rateChoice, 
      status: status !== undefined ? status : true 
    });
    
    await province.save();
    res.status(201).json(province);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all provinces for a company
const getProvincesByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required in URL params.' });
    }
    const provinces = await Province.find({ companyId }).sort({ code: 1 });
    res.status(200).json(provinces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a province
const updateProvince = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, rateDiff, rateChoice, status } = req.body;
    if (!title || rateDiff === undefined || rateChoice === undefined) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const updated = await Province.findByIdAndUpdate(
      id,
      { title, rateDiff, rateChoice, status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Province not found.' });
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a province
const deleteProvince = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, get the province to be deleted to access its code and companyId
    const province = await Province.findById(id);
    if (!province) {
      return res.status(404).json({ error: 'Province not found.' });
    }
    
    const provinceCode = province.code;
    const companyId = province.companyId;
    console.log(`Found province: ${provinceCode} in company: ${companyId}`);
    
    // Check other models that might reference the province
    const modelNames = [
      'User', 'AccountLevel1', 'AccountLevel2', 'AccountLevel3', 'AccountLevel4',
      'BankAccount', 'CashAccount', 'DebtorAccount', 'CreditorAccount',
      'CashVoucher', 'ChildCenter', 'CustomerProfile', 'DiscountRate',
      'DiscountSetting', 'financialYearModel', 'FinishedGoods', 'goDown',
      'GovtTaxAccount', 'ItemDescriptionCode', 'ItemProfile', 'ParentCenter',
      'ProductRateSetting', 'RawMaterial', 'SalesPerson', 'SalesVoucher',
      'SroSchedule', 'TaxRateSetting', 'UnitMeasurement', 'Location', 'Company','Cities'
    ];
    
    const references = [];
    
    for (const modelName of modelNames) {
      try {
        const Model = mongoose.model(modelName);
        
        // Check for records with BOTH the specific companyId AND provinceCode
        const provinceCodeCount = await Model.countDocuments({ 
          companyId: companyId,
          provinceCode: provinceCode
        });
        
        if (provinceCodeCount > 0) {
          references.push({ 
            model: modelName, 
            count: provinceCodeCount, 
            field: 'companyId AND provinceCode' 
          });
          console.log(`Found ${provinceCodeCount} references in ${modelName} for both companyId ${companyId} and provinceCode ${provinceCode}`);
        }
        
        // Check for records with BOTH the specific companyId AND provinceId
        const provinceIdCount = await Model.countDocuments({ 
          companyId: companyId,
          provinceId: provinceCode
        });
        
        if (provinceIdCount > 0) {
          references.push({ 
            model: modelName, 
            count: provinceIdCount, 
            field: 'companyId AND provinceId' 
          });
          console.log(`Found ${provinceIdCount} references in ${modelName} for both companyId ${companyId} and provinceId ${provinceCode}`);
        }
      } catch (error) {
        console.error(`Error checking ${modelName}:`, error.message);
      }
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
        message: `Cannot delete province. Found references in: ${referenceDetails}.`,
        details: {
          provinceCode,
          companyId,
          references: references,
          actionRequired: "Please remove all references to this province before deleting."
        }
      });
    }
    
    // If no references, proceed with deletion
    console.log('No references found, proceeding with deletion');
    const deleted = await Province.findByIdAndDelete(id);
    
    res.status(200).json({ 
      success: true,
      message: 'Province deleted successfully',
      deletedId: deleted._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle province status
const toggleProvinceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Province.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Province not found.' });
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createProvince,
  getProvincesByCompany,
  updateProvince,
  deleteProvince,
  toggleProvinceStatus
};