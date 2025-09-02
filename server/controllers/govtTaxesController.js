const GovtTaxAccount = require('../models/GovtTaxAccount');
let AccountLevel4; // Will be loaded conditionally
try {
  AccountLevel4 = require('../models/AccountLevel4');
} catch (err) {
  console.warn('AccountLevel4 model not found, titles will not be fetched');
}
const govtTaxesController = {
  // Get all government tax accounts with hierarchical data
  getDefaultTaxes: async (req, res) => {
    try {
      const { companyId } = req.params;
      
      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: 'Company ID is required',
          data: null
        });
      }
      
      const defaultTaxes = await GovtTaxAccount.find({ companyId })
        .sort({ 
          isDefault: -1, 
          isActive: -1, 
          'parentLevel1Code': 1,
          'parentLevel2Code': 1,
          'parentLevel3Code': 1,
          'level4Subcode': 1
        })
        .lean();
      
      // If AccountLevel4 model is available, fetch level 4 accounts to get titles
      if (AccountLevel4 && defaultTaxes.length > 0) {
        try {
          const level4Ids = defaultTaxes.map(tax => tax.level4Id);
          const level4Accounts = await AccountLevel4.find({ _id: { $in: level4Ids } }).lean();
          
          // Map titles to taxes
          const taxesWithTitles = defaultTaxes.map(tax => {
            const level4Account = level4Accounts.find(acc => acc._id.toString() === tax.level4Id.toString());
            return {
              ...tax,
              level4Title: level4Account ? level4Account.title : 'Unknown Title'
            };
          });
          
          return res.status(200).json({
            success: true,
            message: taxesWithTitles.length > 0 
              ? 'Government tax accounts retrieved successfully' 
              : 'No government tax accounts found',
            data: taxesWithTitles
          });
        } catch (accountErr) {
          console.error('Error fetching account titles:', accountErr);
          // If fetching accounts fails, return taxes without titles
          return res.status(200).json({
            success: true,
            message: 'Government tax accounts retrieved (without titles)',
            data: defaultTaxes.map(tax => ({ ...tax, level4Title: 'Unknown Title' }))
          });
        }
      }
      
      // If AccountLevel4 model is not available, return taxes without titles
      return res.status(200).json({
        success: true,
        message: defaultTaxes.length > 0 
          ? 'Government tax accounts retrieved successfully' 
          : 'No government tax accounts found',
        data: defaultTaxes.map(tax => ({ ...tax, level4Title: 'Unknown Title' }))
      });
    } catch (err) {
      console.error('Error in getDefaultTaxes:', err);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        data: null
      });
    }
  },
  
  // Add a new government tax account with full hierarchy
  addDefaultTax: async (req, res) => {
    try {
      const requiredFields = [
        'companyId', 
        'level1Id', 'parentLevel1Code',
        'level2Id', 'parentLevel2Code',
        'level3Id', 'parentLevel3Code',
        'level4Id', 'level4Subcode',
        'rate',
        'createdBy', 'updatedBy' // Added these fields
      ];
      
      const missingFields = requiredFields.filter(field => !req.body[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          data: null
        });
      }
      
      const { 
        companyId, 
        level4Id,
        level4Subcode,
        rate,
        parentLevel1Code,
        parentLevel2Code,
        parentLevel3Code,
        createdBy,
        updatedBy
      } = req.body;
      
      // Validate rate is a number between 0-100
      if (isNaN(parseFloat(rate))) {
        return res.status(400).json({
          success: false,
          error: 'Rate must be a numeric value',
          data: null
        });
      }
      
      // Validate level4Subcode format
      if (!/^\d{5}$/.test(level4Subcode)) {
        return res.status(400).json({
          success: false,
          error: 'Level 4 subcode must be exactly 5 digits',
          data: null
        });
      }
      
      // Generate the codes
      const code = parentLevel1Code + parentLevel2Code + parentLevel3Code;
      const fullcode = code + level4Subcode;
      
      // Check if tax account already exists for this hierarchy
      const existingTax = await GovtTaxAccount.findOne({ 
        companyId, 
        level4Id
      });
      
      if (existingTax) {
        return res.status(409).json({
          success: false,
          error: 'Tax account with this account already exists',
          data: null
        });
      }
      
      const newTax = new GovtTaxAccount({
        ...req.body,
        code,
        fullcode,
        rate: parseFloat(rate),
        isActive: true,
        isDefault: false,
        createdAt: Date.now(), // Explicitly set createdAt
        updatedAt: Date.now()  // Explicitly set updatedAt
      });
      
      await newTax.save();
      
      // Format the response data with direct access to subcode
      const responseData = {
        _id: newTax._id,
        fullcode: newTax.fullcode,
        level4Subcode: newTax.level4Subcode,
        level4Title: 'Unknown Title', // Will be populated by frontend
        rate: newTax.rate,
        isActive: newTax.isActive,
        isDefault: newTax.isDefault
      };
      
      return res.status(201).json({
        success: true,
        message: 'Government tax account added successfully',
        data: responseData
      });
    } catch (err) {
      console.error('Error in addDefaultTax:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to add government tax account',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        data: null
      });
    }
  },
  
  // Update a government tax account
  updateDefaultTax: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        level1Id, level2Id, level3Id, level4Id,
        parentLevel1Code, parentLevel2Code, parentLevel3Code, level4Subcode,
        rate, isActive,
        updatedBy
      } = req.body;
      
      // Validate required fields
      if (!updatedBy) {
        return res.status(400).json({
          success: false,
          error: 'Missing updatedBy field'
        });
      }
      
      if (!level1Id || !level2Id || !level3Id || !level4Id || 
          !parentLevel1Code || !parentLevel2Code || !parentLevel3Code || !level4Subcode) {
        return res.status(400).json({
          success: false,
          error: 'All account level fields are required for update',
          data: null
        });
      }
      
      // Validate rate if provided
      if (rate !== undefined && isNaN(parseFloat(rate))) {
        return res.status(400).json({
          success: false,
          error: 'Rate must be a numeric value',
          data: null
        });
      }
      
      // Check if another tax with the same level4Id already exists
      const existingTax = await GovtTaxAccount.findOne({ 
        level4Id, 
        companyId: req.body.companyId,
        _id: { $ne: id }
      });
      
      if (existingTax) {
        return res.status(409).json({
          success: false,
          error: 'Another tax account with this account already exists',
          data: null
        });
      }
      
      // Generate the codes
      const code = parentLevel1Code + parentLevel2Code + parentLevel3Code;
      const fullcode = code + level4Subcode;
      
      // Update fields with user tracking - explicitly exclude createdAt
      const updateData = { 
        updatedBy,
        updatedAt: Date.now(),  // Only update updatedAt, not createdAt
        level1Id, level2Id, level3Id, level4Id,
        parentLevel1Code, parentLevel2Code, parentLevel3Code, level4Subcode,
        code, fullcode
      };
      
      if (rate !== undefined) updateData.rate = parseFloat(rate);
      if (isActive !== undefined) updateData.isActive = isActive;
      
      // Update the tax - use findOneAndUpdate to avoid pre-save hook issues
      const updatedTax = await GovtTaxAccount.findOneAndUpdate(
        { _id: id },
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!updatedTax) {
        return res.status(404).json({
          success: false,
          error: 'Government tax account not found',
          data: null
        });
      }
      
      // Format the response data
      const responseData = {
        _id: updatedTax._id,
        fullcode: updatedTax.fullcode,
        level4Subcode: updatedTax.level4Subcode,
        level4Title: 'Unknown Title', // Will be populated by frontend
        rate: updatedTax.rate,
        isActive: updatedTax.isActive,
        isDefault: updatedTax.isDefault
      };
      
      return res.status(200).json({
        success: true,
        message: 'Government tax account updated successfully',
        data: responseData
      });
    } catch (err) {
      console.error('Error in updateDefaultTax:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to update government tax account',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        data: null
      });
    }
  },
  
  // Delete a government tax account
  deleteDefaultTax: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedTax = await GovtTaxAccount.findByIdAndDelete(id);
      
      if (!deletedTax) {
        return res.status(404).json({
          success: false,
          error: 'Government tax account not found',
          data: null
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Government tax account deleted successfully',
        data: {
          _id: deletedTax._id,
          fullcode: deletedTax.fullcode
        }
      });
    } catch (err) {
      console.error('Error in deleteDefaultTax:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete government tax account',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        data: null
      });
    }
  },
  
  // Toggle active status
  toggleActive: async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive, updatedBy } = req.body;
      
      if (!updatedBy) {
        return res.status(400).json({
          success: false,
          error: 'Missing updatedBy field'
        });
      }
      
      // Use findOneAndUpdate to avoid pre-save hook issues
      const tax = await GovtTaxAccount.findOneAndUpdate(
        { _id: id },
        { 
          isActive, 
          updatedBy,
          updatedAt: Date.now()  // Only update updatedAt, not createdAt
        },
        { new: true, runValidators: true }
      );
      
      if (!tax) {
        return res.status(404).json({
          success: false,
          error: 'Government tax account not found',
          data: null
        });
      }
      
      return res.status(200).json({
        success: true,
        message: `Government tax account ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: {
          _id: tax._id,
          isActive: tax.isActive
        }
      });
    } catch (err) {
      console.error('Error in toggleActive:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to toggle active status',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        data: null
      });
    }
  },
  
  // Toggle default status
  toggleDefault: async (req, res) => {
    try {
      const { id } = req.params;
      const { isDefault, updatedBy } = req.body;
      
      if (!updatedBy) {
        return res.status(400).json({
          success: false,
          error: 'Missing updatedBy field'
        });
      }
      
      // Use findOneAndUpdate to avoid pre-save hook issues
      const tax = await GovtTaxAccount.findOneAndUpdate(
        { _id: id },
        { 
          isDefault, 
          updatedBy,
          updatedAt: Date.now()  // Only update updatedAt, not createdAt
        },
        { new: true, runValidators: true }
      );
      
      if (!tax) {
        return res.status(404).json({
          success: false,
          error: 'Government tax account not found',
          data: null
        });
      }
      
      // If setting as default, ensure no other is default
      if (isDefault) {
        await GovtTaxAccount.updateMany(
          { companyId: tax.companyId, _id: { $ne: tax._id } },
          { isDefault: false }
        );
      }
      
      return res.status(200).json({
        success: true,
        message: `Government tax account ${isDefault ? 'set as default' : 'removed as default'} successfully`,
        data: {
          _id: tax._id,
          isDefault: tax.isDefault
        }
      });
    } catch (err) {
      console.error('Error in toggleDefault:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to toggle default status',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        data: null
      });
    }
  }
};
module.exports = govtTaxesController;