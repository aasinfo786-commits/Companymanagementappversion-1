// 📁 middleware/checkCompanyReferences.js
const mongoose = require('mongoose');

// List all models that might reference companyId
// Make sure these match the actual model names in your codebase
const modelsToCheck = [
  'Location',
  'FinancialYear', // Note: This might be 'financialYear' in your codebase
  'AccountLevel1',
  'AccountLevel2',
  'AccountLevel3',
  'AccountLevel4',
  'BankAccount',
  'CashAccount',
  'DebtorAccount',
  'CreditorAccount',
  'RawMaterial',
  'FinishedGoods',
  'GovtTaxAccount', // Note: This was 'GovtTax' in the original but index.js imports 'GovtTaxAccount'
  'ParentCenter',
  'ChildCenter',
  'SalesPerson',
  'ItemProfile',
  'GoDown', // Note: This might be 'goDown' in your codebase
  'ProductRateSetting',
  'DiscountSetting', // Note: This was 'DiscountRateSetting' but index.js imports 'DiscountSetting'
  'DiscountRate',
  'CustomerProfile',
  'SupplierProfile',
  'CashVoucher',
  'SalesVoucher',
  'UnitMeasurement',
  'SroSchedule',
  'ItemDescriptionCode',
  'TaxRateSetting'
];

const checkCompanyReferences = async (req, res, next) => {
  try {
    const companyId = req.params.id;
    
    // First, get the company to find its companyId value
    const Company = mongoose.model('Company');
    const company = await Company.findById(companyId);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    const companyCompanyId = company.companyId; // String value like "01", "02"
    const companyObjectId = company._id; // ObjectId
    const references = {};
    
    // Check each model for references
    for (const modelName of modelsToCheck) {
      try {
        // Check if model exists
        if (!mongoose.models[modelName]) {
          console.log(`Model ${modelName} not registered, skipping...`);
          continue;
        }
        
        const Model = mongoose.model(modelName);
        let count = 0;
        
        // Try to find references using both string and ObjectId
        try {
          // First try with string companyId
          count += await Model.countDocuments({ companyId: companyCompanyId });
        } catch (err) {
          // If that fails, try with ObjectId
          try {
            count += await Model.countDocuments({ companyId: companyObjectId });
          } catch (err2) {
            console.log(`Error checking ${modelName} with companyId:`, err2.message);
          }
        }
        
        // Also check for alternative field names that might reference the company
        try {
          count += await Model.countDocuments({ 
            $or: [
              { companyId: companyCompanyId },
              { companyId: companyObjectId },
              { company: companyCompanyId },
              { company: companyObjectId }
            ]
          });
        } catch (err) {
          // Ignore errors from alternative field checks
        }
        
        if (count > 0) {
          references[modelName] = count;
        }
      } catch (err) {
        console.error(`Error checking model ${modelName}:`, err.message);
        // Continue checking other models even if one fails
      }
    }
    
    // If references exist, return error
    if (Object.keys(references).length > 0) {
      const referenceList = Object.entries(references)
        .map(([model, count]) => {
          // Format model name to be more readable
          const readableName = model.replace(/([A-Z])/g, ' $1').trim();
          return `${count} ${readableName.toLowerCase()}(s)`;
        })
        .join(', ');
      
      return res.status(400).json({
        success: false,
        message: `Cannot delete company. It is referenced in: ${referenceList}`,
        references
      });
    }
    
    // No references found, proceed with deletion
    next();
  } catch (error) {
    console.error('Error checking company references:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking company references',
      error: error.message
    });
  }
};

module.exports = checkCompanyReferences;