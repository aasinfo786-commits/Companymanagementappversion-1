// 📁 controllers/financialYearController.js
const FinancialYear = require("../models/financialYearModel");
const mongoose = require("mongoose");

// Helper function for comprehensive date validation
const validateFinancialYearDates = (startDate, endDate, isUpdate = false) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start) || isNaN(end)) {
    return { valid: false, error: "Invalid date format" };
  }
  const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  if (endDateOnly <= startDateOnly) {
    return { valid: false, error: "End date must be after start date" };
  }
  const minDuration = 30 * 24 * 60 * 60 * 1000;
  if ((endDateOnly - startDateOnly) < minDuration) {
    return { valid: false, error: "Financial year must be at least 30 days" };
  }
  return { valid: true };
};

// @desc   Create a new financial year
// @route  POST /api/financial-years
// @access Public
exports.createFinancialYear = async (req, res) => {
  try {
    const { yearId, title, startDate, endDate, createdBy, companyId } = req.body;
    const requiredFields = { yearId, title, startDate, endDate, createdBy, companyId };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    
    const dateValidation = validateFinancialYearDates(startDate, endDate);
    if (!dateValidation.valid) {
      return res.status(400).json({ error: dateValidation.error });
    }
    
    // Check if yearId already exists for this company
    const existingYear = await FinancialYear.findOne({ yearId, companyId });
    if (existingYear) {
      return res.status(409).json({ 
        error: "Year ID already exists for this company",
        conflictingId: existingYear._id
      });
    }
    
    // Create date objects with UTC to avoid timezone issues
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Set time to noon UTC to avoid timezone conversion issues
    start.setUTCHours(12, 0, 0, 0);
    end.setUTCHours(12, 0, 0, 0);
    
    const financialYear = new FinancialYear({
      ...req.body,
      startDate: start,
      endDate: end
    });
    
    await financialYear.save();
    res.status(201).json({
      success: true,
      message: "Financial year created successfully",
      data: financialYear,
      period: financialYear.period
    });
  } catch (error) {
    console.error("Error creating financial year:", error);
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({
      error: error.message || "Failed to create financial year",
      details: error.errors || undefined
    });
  }
};

// @desc   Get the next year ID for a company
// @route  GET /api/financial-years/next-year-id/:companyId
// @access Public
exports.getNextYearId = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }
    
    // Find all financial years for this company
    const companyYears = await FinancialYear.find({ companyId });
    
    if (companyYears.length === 0) {
      return res.json({ nextYearId: "01" });
    }
    
    // Extract all yearIds and convert to numbers
    const yearIds = companyYears
      .map(year => parseInt(year.yearId, 10))
      .filter(id => !isNaN(id));
    
    // Find the maximum yearId
    const maxId = yearIds.length > 0 ? Math.max(...yearIds) : 0;
    const nextId = maxId + 1;
    
    // Format with leading zero if needed
    const nextYearId = nextId < 10 ? `0${nextId}` : `${nextId}`;
    
    res.json({ nextYearId });
  } catch (error) {
    console.error("Error getting next year ID:", error);
    res.status(500).json({ 
      error: "Failed to get next year ID",
      details: error.message
    });
  }
};

// @desc   Update financial year
// @route  PUT /api/financial-years/:id
// @access Public
exports.updateFinancialYear = async (req, res) => {
  try {
    const { id } = req.params;
    const { yearId, startDate, endDate, companyId } = req.body;
    
    const existingYear = await FinancialYear.findById(id);
    if (!existingYear) {
      return res.status(404).json({ error: "Financial year not found" });
    }
    
    if (yearId && yearId !== existingYear.yearId) {
      const duplicateYear = await FinancialYear.findOne({ 
        yearId, 
        companyId: companyId || existingYear.companyId,
        _id: { $ne: id }
      });
      if (duplicateYear) {
        return res.status(409).json({ 
          error: "Year ID already exists for this company",
          conflictingId: duplicateYear._id
        });
      }
    }
    
    const effectiveStartDate = startDate || existingYear.startDate;
    const effectiveEndDate = endDate || existingYear.endDate;
    
    const dateValidation = validateFinancialYearDates(effectiveStartDate, effectiveEndDate, true);
    if (!dateValidation.valid) {
      return res.status(400).json({ error: dateValidation.error });
    }
    
    // Create update object, preserving the original createdBy
    const updateData = { 
      ...req.body,
      createdBy: existingYear.createdBy // Preserve original createdBy
    };
    
    // Handle date updates with UTC to avoid timezone issues
    if (startDate) {
      const start = new Date(startDate);
      start.setUTCHours(12, 0, 0, 0);
      updateData.startDate = start;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setUTCHours(12, 0, 0, 0);
      updateData.endDate = end;
    }
    
    const updatedYear = await FinancialYear.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true, context: 'query' }
    );
    
    res.json({
      success: true,
      message: "Financial year updated successfully",
      data: updatedYear,
      period: updatedYear.period
    });
  } catch (error) {
    console.error("Error updating financial year:", error);
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({
      error: error.message || "Failed to update financial year",
      details: error.errors || undefined
    });
  }
};

// @desc   Get all financial years
// @route  GET /api/financial-years
// @access Public
exports.getFinancialYears = async (req, res) => {
  try {
    const { companyId } = req.query;
    const filter = companyId ? { companyId } : {};
    console.log(`my compNY ID ${filter}`)
    const financialYears = await FinancialYear.find(filter)
      .sort({ startDate: -1 })
      .lean();
    const enhancedYears = financialYears.map(year => ({
      ...year,
      period: `${new Date(year.startDate).toISOString().split('T')[0]} to ${new Date(year.endDate).toISOString().split('T')[0]}`
    }));
    res.json(enhancedYears);
  } catch (error) {
    console.error("Error fetching financial years:", error);
    res.status(500).json({ 
      error: "Failed to fetch financial years",
      details: error.message
    });
  }
};

// @desc   Get financial year by ID
// @route  GET /api/financial-years/:id
// @access Public
exports.getFinancialYearById = async (req, res) => {
  try {
    const financialYear = await FinancialYear.findById(req.params.id);
    if (!financialYear) {
      return res.status(404).json({ error: "Financial year not found" });
    }
    const responseData = financialYear.toObject();
    responseData.period = `${financialYear.startDate.toISOString().split('T')[0]} to ${financialYear.endDate.toISOString().split('T')[0]}`;
    
    res.json(responseData);
  } catch (error) {
    console.error("Error fetching financial year:", error);
    res.status(500).json({ 
      error: "Failed to fetch financial year",
      details: error.message
    });
  }
};

// @desc   Delete financial year
// @route  DELETE /api/financial-years/:id
// @access Public
exports.deleteFinancialYear = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to delete financial year with ID: ${id}`);
    
    // First, get the financial year to be deleted to access its yearId and companyId
    const financialYear = await FinancialYear.findById(id);
    if (!financialYear) {
      console.log(`Financial year not found with ID: ${id}`);
      return res.status(404).json({ error: "Financial year not found" });
    }
    
    const yearId = financialYear.yearId;
    const companyId = financialYear.companyId;
    console.log(`Found financial year: ${yearId} in company: ${companyId}`);
    
    // Check other models that might reference the financial year
    const modelNames = [
      'User', // Added User model to the list
      'AccountLevel1', 'AccountLevel2', 'AccountLevel3', 'AccountLevel4',
      'BankAccount', 'CashAccount', 'DebtorAccount', 'CreditorAccount',
      'CashVoucher', 'ChildCenter', 'CustomerProfile', 'DiscountRate',
      'DiscountSetting', 'FinishedGoods', 'goDown',
      'GovtTaxAccount', 'ItemDescriptionCode', 'ItemProfile', 'ParentCenter',
      'ProductRateSetting', 'RawMaterial', 'SalesPerson', 'SalesVoucher',
      'SroSchedule', 'TaxRateSetting', 'UnitMeasurement', 'Location'
    ];
    
    const references = [];
    
    // Special check for User model since it's a common reference
    try {
      const User = mongoose.model('User');
      const userCount = await User.countDocuments({ 
        companyId: companyId,
        financialYearId: yearId
      });
      
      if (userCount > 0) {
        references.push({ 
          model: "User", 
          count: userCount, 
          field: 'companyId AND financialYearId' 
        });
        console.log(`Found ${userCount} users referencing financial year ${yearId} in company ${companyId}`);
      }
    } catch (error) {
      console.error('Error checking User model:', error.message);
    }
    
    for (const modelName of modelNames) {
      // Skip User model since we already checked it
      if (modelName === 'User') continue;
      
      try {
        const Model = mongoose.model(modelName);
        
        // Check for records with BOTH the specific companyId AND financialYearId
        const combinedCount = await Model.countDocuments({ 
          companyId: companyId,
          financialYearId: yearId
        });
        
        if (combinedCount > 0) {
          references.push({ 
            model: modelName, 
            count: combinedCount, 
            field: 'companyId AND financialYearId' 
          });
          console.log(`Found ${combinedCount} references in ${modelName} for both companyId ${companyId} and financialYearId ${yearId}`);
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
        message: `Cannot delete financial year. Found references in: ${referenceDetails}.`,
        details: {
          yearId,
          companyId,
          references: references,
          actionRequired: "Please remove all references to this financial year before deleting."
        }
      });
    }
    
    // If no references, proceed with deletion
    console.log('No references found, proceeding with deletion');
    const deletedYear = await FinancialYear.findByIdAndDelete(id);
    
    res.json({ 
      success: true,
      message: "Financial year deleted successfully",
      deletedId: deletedYear._id
    });
  } catch (error) {
    console.error("Error deleting financial year:", error);
    res.status(500).json({ 
      error: "Failed to delete financial year",
      details: error.message
    });
  }
};

// @desc   Get current/default financial year
// @route  GET /api/financial-years/current
// @access Public
exports.getCurrentFinancialYear = async (req, res) => {
  try {
    const { companyId } = req.query;
    
    let financialYear = await FinancialYear.findOne({ isDefault: true, ...(companyId && { companyId }) });
    if (!financialYear) {
      financialYear = await FinancialYear.findOne({ isActive: true, ...(companyId && { companyId }) })
        .sort({ startDate: -1 })
        .limit(1);
    }
    if (!financialYear) {
      return res.status(404).json({ error: "No financial year found" });
    }
    const responseData = financialYear.toObject();
    responseData.period = `${financialYear.startDate.toISOString().split('T')[0]} to ${financialYear.endDate.toISOString().split('T')[0]}`;
    
    res.json(responseData);
  } catch (error) {
    console.error("Error fetching current financial year:", error);
    res.status(500).json({ 
      error: "Failed to fetch current financial year",
      details: error.message
    });
  }
};