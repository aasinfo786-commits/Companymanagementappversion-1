const DiscountRate = require('../models/DiscountRate');
let AccountLevel4; // Will be loaded conditionally
try {
  AccountLevel4 = require('../models/AccountLevel4');
} catch (err) {
  console.warn('AccountLevel4 model not found, titles will not be fetched');
}

const discountRateController = {
  // Get all discount rate accounts with hierarchical data
  getDefaultDiscounts: async (req, res) => {
    try {
      const { companyId } = req.params;
      
      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: 'Company ID is required',
          data: null
        });
      }
      
      const defaultDiscounts = await DiscountRate.find({ companyId })
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
      if (AccountLevel4 && defaultDiscounts.length > 0) {
        try {
          const level4Ids = defaultDiscounts.map(discount => discount.level4Id);
          const level4Accounts = await AccountLevel4.find({ _id: { $in: level4Ids } }).lean();
          
          // Map titles to discounts
          const discountsWithTitles = defaultDiscounts.map(discount => {
            const level4Account = level4Accounts.find(acc => acc._id.toString() === discount.level4Id.toString());
            return {
              ...discount,
              level4Title: level4Account ? level4Account.title : 'Unknown Title'
            };
          });
          
          return res.status(200).json({
            success: true,
            message: discountsWithTitles.length > 0 
              ? 'Discount rate accounts retrieved successfully' 
              : 'No discount rate accounts found',
            data: discountsWithTitles
          });
        } catch (accountErr) {
          console.error('Error fetching account titles:', accountErr);
          // If fetching accounts fails, return discounts without titles
          return res.status(200).json({
            success: true,
            message: 'Discount rate accounts retrieved (without titles)',
            data: defaultDiscounts.map(discount => ({ ...discount, level4Title: 'Unknown Title' }))
          });
        }
      }
      
      // If AccountLevel4 model is not available, return discounts without titles
      return res.status(200).json({
        success: true,
        message: defaultDiscounts.length > 0 
          ? 'Discount rate accounts retrieved successfully' 
          : 'No discount rate accounts found',
        data: defaultDiscounts.map(discount => ({ ...discount, level4Title: 'Unknown Title' }))
      });
    } catch (err) {
      console.error('Error in getDefaultDiscounts:', err);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        data: null
      });
    }
  },
  
  // Add a new discount rate account with full hierarchy
  addDefaultDiscount: async (req, res) => {
    try {
      const requiredFields = [
        'companyId', 
        'level1Id', 'parentLevel1Code',
        'level2Id', 'parentLevel2Code',
        'level3Id', 'parentLevel3Code',
        'level4Id', 'level4Subcode',
        'discountRate',
        'createdBy', 'updatedBy',
        'createdAt', 'updatedAt'
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
        discountRate,
        parentLevel1Code,
        parentLevel2Code,
        parentLevel3Code,
        createdBy,
        updatedBy,
        createdAt,
        updatedAt
      } = req.body;
      
      // Validate discountRate is a number between 0-100
      if (isNaN(parseFloat(discountRate))) {
        return res.status(400).json({
          success: false,
          error: 'Discount rate must be a numeric value',
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
      
      // Check if discount account already exists for this hierarchy
      const existingDiscount = await DiscountRate.findOne({ 
        companyId, 
        level4Id
      });
      
      if (existingDiscount) {
        return res.status(409).json({
          success: false,
          error: 'Discount account with this account already exists',
          data: null
        });
      }
      
      const newDiscount = new DiscountRate({
        companyId,
        level1Id: req.body.level1Id,
        level2Id: req.body.level2Id,
        level3Id: req.body.level3Id,
        level4Id,
        parentLevel1Code,
        parentLevel2Code,
        parentLevel3Code,
        level4Subcode,
        code,
        fullcode,
        discountRate: parseFloat(discountRate),
        isActive: true,
        isDefault: false,
        createdBy,
        updatedBy,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt)
      });
      
      await newDiscount.save();
      
      // Format the response data with direct access to subcode
      const responseData = {
        _id: newDiscount._id,
        fullcode: newDiscount.fullcode,
        level4Subcode: newDiscount.level4Subcode,
        level4Title: 'Unknown Title', // Will be populated by frontend
        discountRate: newDiscount.discountRate,
        isActive: newDiscount.isActive,
        isDefault: newDiscount.isDefault,
        createdBy: newDiscount.createdBy,
        updatedBy: newDiscount.updatedBy,
        createdAt: newDiscount.createdAt,
        updatedAt: newDiscount.updatedAt
      };
      
      return res.status(201).json({
        success: true,
        message: 'Discount rate account added successfully',
        data: responseData
      });
    } catch (err) {
      console.error('Error in addDefaultDiscount:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to add discount rate account',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        data: null
      });
    }
  },
  
  // Update a discount rate account
  updateDefaultDiscount: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        level1Id, level2Id, level3Id, level4Id,
        parentLevel1Code, parentLevel2Code, parentLevel3Code, level4Subcode,
        discountRate, isActive, level4Title,
        updatedBy, updatedAt
      } = req.body;
      
      // Validate required fields
      if (!level1Id || !level2Id || !level3Id || !level4Id || 
          !parentLevel1Code || !parentLevel2Code || !parentLevel3Code || !level4Subcode) {
        return res.status(400).json({
          success: false,
          error: 'All account level fields are required for update',
          data: null
        });
      }
      
      // Validate updatedBy is provided
      if (!updatedBy) {
        return res.status(400).json({
          success: false,
          error: 'Updated by is required',
          data: null
        });
      }
      
      // Validate discountRate if provided
      if (discountRate !== undefined && isNaN(parseFloat(discountRate))) {
        return res.status(400).json({
          success: false,
          error: 'Discount rate must be a numeric value',
          data: null
        });
      }
      
      // Check if another discount with the same level4Id already exists
      const existingDiscount = await DiscountRate.findOne({ 
        level4Id, 
        companyId: req.body.companyId,
        _id: { $ne: id }
      });
      
      if (existingDiscount) {
        return res.status(409).json({
          success: false,
          error: 'Another discount account with this account already exists',
          data: null
        });
      }
      
      // Generate the codes
      const code = parentLevel1Code + parentLevel2Code + parentLevel3Code;
      const fullcode = code + level4Subcode;
      
      const updateData = {
        level1Id, level2Id, level3Id, level4Id,
        parentLevel1Code, parentLevel2Code, parentLevel3Code, level4Subcode,
        code, fullcode,
        updatedBy,
        updatedAt: updatedAt ? new Date(updatedAt) : Date.now()
      };
      
      if (discountRate !== undefined) updateData.discountRate = parseFloat(discountRate);
      if (isActive !== undefined) updateData.isActive = isActive;
      
      const updatedDiscount = await DiscountRate.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!updatedDiscount) {
        return res.status(404).json({
          success: false,
          error: 'Discount rate account not found',
          data: null
        });
      }
      
      // Format the response data
      const responseData = {
        _id: updatedDiscount._id,
        fullcode: updatedDiscount.fullcode,
        level4Subcode: updatedDiscount.level4Subcode,
        level4Title: 'Unknown Title', // Will be populated by frontend
        discountRate: updatedDiscount.discountRate,
        isActive: updatedDiscount.isActive,
        isDefault: updatedDiscount.isDefault,
        createdBy: updatedDiscount.createdBy,
        updatedBy: updatedDiscount.updatedBy,
        createdAt: updatedDiscount.createdAt,
        updatedAt: updatedDiscount.updatedAt
      };
      
      return res.status(200).json({
        success: true,
        message: 'Discount rate account updated successfully',
        data: responseData
      });
    } catch (err) {
      console.error('Error in updateDefaultDiscount:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to update discount rate account',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        data: null
      });
    }
  },
  
  // Update title only
  updateTitle: async (req, res) => {
    try {
      const { id } = req.params;
      const { level4Title } = req.body;
      
      if (!level4Title || !level4Title.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Title is required',
          data: null
        });
      }
      
      // Since we're not storing titles anymore, this operation is not supported
      return res.status(400).json({
        success: false,
        error: 'Direct title update is not supported. Titles are derived from level 4 accounts.',
        data: null
      });
    } catch (err) {
      console.error('Error in updateTitle:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to update title',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        data: null
      });
    }
  },
  
  // Delete a discount rate account
  deleteDefaultDiscount: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedDiscount = await DiscountRate.findByIdAndDelete(id);
      
      if (!deletedDiscount) {
        return res.status(404).json({
          success: false,
          error: 'Discount rate account not found',
          data: null
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Discount rate account deleted successfully',
        data: {
          _id: deletedDiscount._id,
          fullcode: deletedDiscount.fullcode
        }
      });
    } catch (err) {
      console.error('Error in deleteDefaultDiscount:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete discount rate account',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        data: null
      });
    }
  },
  
  // Toggle active status
  toggleActive: async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive, updatedBy, updatedAt } = req.body;
      
      if (updatedBy === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Updated by is required',
          data: null
        });
      }
      
      const discount = await DiscountRate.findById(id);
      
      if (!discount) {
        return res.status(404).json({
          success: false,
          error: 'Discount rate account not found',
          data: null
        });
      }
      
      discount.isActive = isActive;
      discount.updatedBy = updatedBy;
      discount.updatedAt = updatedAt ? new Date(updatedAt) : Date.now();
      
      await discount.save();
      
      return res.status(200).json({
        success: true,
        message: `Discount rate account ${discount.isActive ? 'activated' : 'deactivated'} successfully`,
        data: {
          _id: discount._id,
          isActive: discount.isActive,
          updatedBy: discount.updatedBy,
          updatedAt: discount.updatedAt
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
      const { isDefault, updatedBy, updatedAt } = req.body;
      
      if (updatedBy === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Updated by is required',
          data: null
        });
      }
      
      const discount = await DiscountRate.findById(id);
      
      if (!discount) {
        return res.status(404).json({
          success: false,
          error: 'Discount rate account not found',
          data: null
        });
      }
      
      // If setting as default, ensure no other is default
      if (isDefault) {
        await DiscountRate.updateMany(
          { companyId: discount.companyId, _id: { $ne: discount._id } },
          { isDefault: false }
        );
      }
      
      discount.isDefault = isDefault;
      discount.updatedBy = updatedBy;
      discount.updatedAt = updatedAt ? new Date(updatedAt) : Date.now();
      
      await discount.save();
      
      return res.status(200).json({
        success: true,
        message: `Discount rate account ${discount.isDefault ? 'set as default' : 'removed as default'} successfully`,
        data: {
          _id: discount._id,
          isDefault: discount.isDefault,
          updatedBy: discount.updatedBy,
          updatedAt: discount.updatedAt
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

module.exports = discountRateController;