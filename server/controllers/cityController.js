// controller/CityController.js
const City = require('../models/Cities');
const mongoose = require('mongoose');

// Create a new city
const createCity = async (req, res) => {
  try {
    const { companyId, provinceId, code, title, status } = req.body;
    if (!companyId || !provinceId || !code || !title) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    // Check if code already exists for this company
    const existingCode = await City.findOne({ companyId, code });
    if (existingCode) {
      return res.status(400).json({ error: 'City code already exists for this company.' });
    }
    const city = new City({ 
      companyId, 
      provinceId,
      code, 
      title, 
      status: status !== undefined ? status : true 
    });
    
    await city.save();
    res.status(201).json(city);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all cities for a company
const getCitiesByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required in URL params.' });
    }
    const cities = await City.find({ companyId }).sort({ code: 1 });
    res.status(200).json(cities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a city
const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    const updated = await City.findByIdAndUpdate(
      id,
      { title, status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'City not found.' });
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a city
const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, get the city to be deleted to access its code and companyId
    const city = await City.findById(id);
    if (!city) {
      return res.status(404).json({ error: 'City not found.' });
    }
    
    const cityCode = city.code;
    const companyId = city.companyId;
    const provinceId = city.provinceId;
    console.log(`Found city: ${cityCode} in company: ${companyId}, province: ${provinceId}`);
    
    // Check other models that might reference the city
    const modelNames = [
      'User', 'AccountLevel1', 'AccountLevel2', 'AccountLevel3', 'AccountLevel4',
      'BankAccount', 'CashAccount', 'DebtorAccount', 'CreditorAccount',
      'CashVoucher', 'ChildCenter', 'CustomerProfile', 'SupplierProfile', 'DiscountRate',
      'DiscountSetting', 'financialYearModel', 'FinishedGoods', 'goDown',
      'GovtTaxAccount', 'ItemDescriptionCode', 'ItemProfile', 'ParentCenter',
      'ProductRateSetting', 'RawMaterial', 'SalesPerson', 'SalesVoucher',
      'SroSchedule', 'TaxRateSetting', 'UnitMeasurement', 'Location'
    ];
    
    const references = [];
    
    for (const modelName of modelNames) {
      try {
        const Model = mongoose.model(modelName);
        
        // Check for records with BOTH the specific companyId AND cityCode (using cityCode field)
        const cityCodeCount = await Model.countDocuments({ 
          companyId: companyId,
          cityCode: cityCode
        });
        
        if (cityCodeCount > 0) {
          references.push({ 
            model: modelName, 
            count: cityCodeCount, 
            field: 'companyId AND cityCode' 
          });
          console.log(`Found ${cityCodeCount} references in ${modelName} for both companyId ${companyId} and cityCode ${cityCode}`);
        }
        
        // Check for records with BOTH the specific companyId AND city (using city field)
        const cityCount = await Model.countDocuments({ 
          companyId: companyId,
          city: cityCode
        });
        
        if (cityCount > 0) {
          references.push({ 
            model: modelName, 
            count: cityCount, 
            field: 'companyId AND city' 
          });
          console.log(`Found ${cityCount} references in ${modelName} for both companyId ${companyId} and city ${cityCode}`);
        }
        
        // Also check for records with provinceId (since cities are linked to provinces)
        const provinceCount = await Model.countDocuments({ 
          companyId: companyId,
          provinceId: provinceId
        });
        
        if (provinceCount > 0) {
          references.push({ 
            model: modelName, 
            count: provinceCount, 
            field: 'companyId AND provinceId' 
          });
          console.log(`Found ${provinceCount} references in ${modelName} for both companyId ${companyId} and provinceId ${provinceId}`);
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
        message: `Cannot delete city. Found references in: ${referenceDetails}.`,
        details: {
          cityCode,
          companyId,
          provinceId,
          references: references,
          actionRequired: "Please remove all references to this city before deleting."
        }
      });
    }
    
    // If no references, proceed with deletion
    console.log('No references found, proceeding with deletion');
    const deleted = await City.findByIdAndDelete(id);
    
    res.status(200).json({ 
      success: true,
      message: 'City deleted successfully',
      deletedId: deleted._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle city status
const toggleCityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await City.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'City not found.' });
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCity,
  getCitiesByCompany,
  updateCity,
  deleteCity,
  toggleCityStatus
};