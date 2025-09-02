const Company = require("../models/Company");
const mongoose = require('mongoose'); // Add this import

// @desc   Add a new company
// @route  POST /api/companies
// @access Public (add auth later)
exports.addCompany = async (req, res) => {
  try {
    const {
      companyId,
      companyName,
      address1,
      address2,
      province, // This comes as "code - title" from the form
      phone1,
      phone2,
      nationalTaxNumber,
      strn,
      fbrToken,
      createdBy,
      updatedBy,
      isActive,
    } = req.body;
    
    // Validate required fields
    if (!companyId || !companyName || !createdBy || !province) {
      return res.status(400).json({ 
        error: "Required fields are missing.",
        required: ["companyId", "companyName", "createdBy", "province"]
      });
    }
    
    // Extract province code from the "code - title" format
    const provinceCode = province.split(' - ')[0];
    if (!provinceCode) {
      return res.status(400).json({ error: "Invalid province format." });
    }
    
    // Check for duplicate companyId
    const existingCompany = await Company.findOne({ companyId });
    if (existingCompany) {
      return res.status(409).json({ error: "Company ID already exists." });
    }
    
    // Create new company with all fields
    const newCompany = new Company({
      companyId,
      companyName,
      address1,
      address2,
      provinceCode, // Store only the code
      phone1,
      phone2,
      nationalTaxNumber,
      strn,
      fbrToken,
      createdBy,
      updatedBy: updatedBy || createdBy, // Set updatedBy to createdBy if not provided
      isActive,
    });
    
    const savedCompany = await newCompany.save();
    
    res.status(201).json({ 
      message: "Company created successfully", 
      data: savedCompany 
    });
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc   Get all companies
// @route  GET /api/companies
// @access Public
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().select('-__v');
    res.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc   Get single company by _id
// @route  GET /api/companies/:id
// @access Public
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).select('-__v');
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.status(200).json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc   Get single company by companyId
// @route  GET /api/companies/company/:companyId
// @access Public
exports.getCompanyByCompanyId = async (req, res) => {
  try {
    const company = await Company.findOne({ companyId: req.params.companyId }).select('-__v');
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.status(200).json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc   Update a company
// @route  PUT /api/companies/:id
// @access Public
exports.updateCompany = async (req, res) => {
  try {
    // Handle province code extraction if province is being updated
    if (req.body.province) {
      const provinceCode = req.body.province.split(' - ')[0];
      if (!provinceCode) {
        return res.status(400).json({ error: "Invalid province format." });
      }
      req.body.provinceCode = provinceCode;
      delete req.body.province; // Remove the combined field
    }
    
    // Always update the updatedBy field when updating
    if (req.body.updatedBy) {
      req.body.updatedBy = req.body.updatedBy;
    } else {
      // If updatedBy is not provided, get the existing value
      const existingCompany = await Company.findById(req.params.id);
      if (existingCompany) {
        req.body.updatedBy = existingCompany.updatedBy;
      }
    }
    
    // Update the company
    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }
    
    res.status(200).json({ 
      message: "Company updated successfully", 
      data: updatedCompany 
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Failed to update company" });
  }
};


// @desc   Delete a company by _id
// @route  DELETE /api/companies/:id
// @access Public
exports.deleteCompany = async (req, res) => {
  try {
    // First, get the company to be deleted to access its companyId
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    
    const companyId = company.companyId;
    
    // Check if companyId is referenced in other models
    // Use model names instead of requiring directly
    const modelNames = [
      'Location',
      'AccountLevel1',
      'AccountLevel2',
      'AccountLevel3',
      'AccountLevel4',
      'BankAccount',
      'CashAccount',
      'DebtorAccount',
      'CreditorAccount',
      'CashVoucher',
      'ChildCenter',
      'Cities',
      'CustomerProfile',
      'DiscountRate',
      'DiscountSetting',
      'financialYearModel',
      'FinishedGoods',
      'goDown',
      'GovtTaxAccount',
      'ItemDescriptionCode',
      'ItemProfile',
      'ParentCenter',
      'ProductRateSetting',
      'Provinces',
      'RawMaterial',
      'SalesPerson',
      'SalesVoucher',
      'SroSchedule',
      'TaxRateSetting',
      'UnitMeasurement',
      'User'
    ];
    
    const references = [];
    let referenceCheckError = false;
    
    for (const modelName of modelNames) {
      try {
        // Get the model from mongoose registry
        const model = mongoose.model(modelName);
        
        // Check if model has countDocuments method
        if (typeof model.countDocuments === 'function') {
          const count = await model.countDocuments({ companyId });
          if (count > 0) {
            references.push({ model: modelName, count });
          }
        } else {
          console.warn(`Model ${modelName} does not have countDocuments method`);
        }
      } catch (error) {
        console.error(`Error checking references in ${modelName}:`, error);
        referenceCheckError = true;
      }
    }
    
    // If there was an error during reference checking, don't delete
    if (referenceCheckError) {
      return res.status(500).json({ 
        message: "Error occurred while checking references. Cannot delete company safely.",
        error: "Please contact support."
      });
    }
    
    // If there are references, return an error with details
    if (references.length > 0) {
      const referenceDetails = references
        .map(ref => `${ref.model} (${ref.count} records)`)
        .join(', ');
      
      return res.status(400).json({ 
        message: "Cannot delete company. It is referenced in other models.",
        references: referenceDetails,
        error: "Please remove all references to this company before deleting."
      });
    }
    
    // If no references, proceed with deletion
    const deleted = await Company.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete company" });
  }
}