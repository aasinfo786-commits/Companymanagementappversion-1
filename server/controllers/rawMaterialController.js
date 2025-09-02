const RawMaterial = require('../models/RawMaterial');
let Account; // Will be loaded conditionally
try {
  Account = require('../models/AccountLevel3');
} catch (err) {
  console.warn('Account model not found, titles will not be fetched');
}
const rawMaterialController = {
  // Get all default raw materials for a company
  getDefaultRawMaterials: async (req, res) => {
    try {
      const { companyId } = req.params;
      
      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: 'Company ID is required',
          data: null
        });
      }
      
      const defaultRawMaterials = await RawMaterial.find({ companyId })
        .sort({ isDefault: -1, isActive: -1, code: 1 })
        .lean();
      
      // If Account model is available, fetch level 3 accounts to get titles
      if (Account && defaultRawMaterials.length > 0) {
        try {
          const level3Ids = defaultRawMaterials.map(rm => rm.level3Id);
          const level3Accounts = await Account.find({ _id: { $in: level3Ids } }).lean();
          
          // Map titles to raw materials
          const rawMaterialsWithTitles = defaultRawMaterials.map(rm => {
            const level3Account = level3Accounts.find(acc => acc._id.toString() === rm.level3Id.toString());
            return {
              ...rm,
              title: level3Account ? level3Account.title : 'Unknown Title'
            };
          });
          
          return res.status(200).json({
            success: true,
            message: rawMaterialsWithTitles.length > 0 
              ? 'Default raw materials retrieved successfully' 
              : 'No default raw materials found',
            data: rawMaterialsWithTitles
          });
        } catch (accountErr) {
          console.error('Error fetching account titles:', accountErr);
          // If fetching accounts fails, return raw materials without titles
          return res.status(200).json({
            success: true,
            message: 'Default raw materials retrieved (without titles)',
            data: defaultRawMaterials.map(rm => ({ ...rm, title: 'Unknown Title' }))
          });
        }
      }
      
      // If Account model is not available, return raw materials without titles
      return res.status(200).json({
        success: true,
        message: defaultRawMaterials.length > 0 
          ? 'Default raw materials retrieved successfully' 
          : 'No default raw materials found',
        data: defaultRawMaterials.map(rm => ({ ...rm, title: 'Unknown Title' }))
      });
    } catch (err) {
      console.error('Error in getDefaultRawMaterials:', err);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        data: null
      });
    }
  },
  
  // Add a new default raw material
  addDefaultRawMaterial: async (req, res) => {
    try {
      const requiredFields = [
        'companyId', 'level1Id', 'level2Id', 'level3Id',
        'level1Code', 'level2Code', 'level3Code', 'code',
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
      
      const { companyId, level3Id, createdBy, updatedBy } = req.body;
      
      // Check if already exists
      const existingRawMaterial = await RawMaterial.findOne({ companyId, level3Id });
      if (existingRawMaterial) {
        return res.status(409).json({
          success: false,
          error: 'This account is already set as a default raw material',
          data: null
        });
      }
      
      const newRawMaterial = new RawMaterial({
        ...req.body,
        isActive: true,
        isDefault: false,
        createdAt: Date.now(), // Explicitly set createdAt
        updatedAt: Date.now()  // Explicitly set updatedAt
      });
      
      await newRawMaterial.save();
      
      return res.status(201).json({
        success: true,
        message: 'Default raw material added successfully',
        data: newRawMaterial
      });
    } catch (err) {
      console.error('Error in addDefaultRawMaterial:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to add default raw material',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        data: null
      });
    }
  },
  
  // Update a default raw material
  updateDefaultRawMaterial: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        level1Id, 
        level2Id, 
        level3Id,
        level1Code,
        level2Code,
        level3Code,
        code,
        updatedBy
      } = req.body;
      
      // Validate required fields
      if (!updatedBy) {
        return res.status(400).json({
          success: false,
          error: 'Missing updatedBy field'
        });
      }
      
      if (!level1Id || !level2Id || !level3Id || !level1Code || !level2Code || !level3Code || !code) {
        return res.status(400).json({
          success: false,
          error: 'All account level fields and code are required for update',
          data: null
        });
      }
      
      // Check if another raw material with the same level3Id already exists
      const existingRawMaterial = await RawMaterial.findOne({ 
        level3Id, 
        companyId: req.body.companyId,
        _id: { $ne: id }
      });
      
      if (existingRawMaterial) {
        return res.status(409).json({
          success: false,
          error: 'Another raw material with this account already exists',
          data: null
        });
      }
      
      // Update fields with user tracking - explicitly exclude createdAt
      const updateData = { 
        updatedBy,
        updatedAt: Date.now(),  // Only update updatedAt, not createdAt
        level1Id, 
        level2Id, 
        level3Id, 
        level1Code, 
        level2Code, 
        level3Code, 
        code
      };
      
      // Update the raw material - use findOneAndUpdate to avoid pre-save hook issues
      const updatedRawMaterial = await RawMaterial.findOneAndUpdate(
        { _id: id },
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!updatedRawMaterial) {
        return res.status(404).json({
          success: false,
          error: 'Default raw material not found',
          data: null
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Default raw material updated successfully',
        data: updatedRawMaterial
      });
    } catch (err) {
      console.error('Error in updateDefaultRawMaterial:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to update default raw material',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        data: null
      });
    }
  },
  
  // Delete a default raw material
  deleteDefaultRawMaterial: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedRawMaterial = await RawMaterial.findByIdAndDelete(id);
      
      if (!deletedRawMaterial) {
        return res.status(404).json({
          success: false,
          error: 'Default raw material not found',
          data: null
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Default raw material deleted successfully',
        data: deletedRawMaterial
      });
    } catch (err) {
      console.error('Error in deleteDefaultRawMaterial:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete default raw material',
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
      const rawMaterial = await RawMaterial.findOneAndUpdate(
        { _id: id },
        { 
          isActive, 
          updatedBy,
          updatedAt: Date.now()  // Only update updatedAt, not createdAt
        },
        { new: true, runValidators: true }
      );
      
      if (!rawMaterial) {
        return res.status(404).json({
          success: false,
          error: 'Default raw material not found',
          data: null
        });
      }
      
      return res.status(200).json({
        success: true,
        message: `Default raw material ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: rawMaterial
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
      const rawMaterial = await RawMaterial.findOneAndUpdate(
        { _id: id },
        { 
          isDefault, 
          updatedBy,
          updatedAt: Date.now()  // Only update updatedAt, not createdAt
        },
        { new: true, runValidators: true }
      );
      
      if (!rawMaterial) {
        return res.status(404).json({
          success: false,
          error: 'Default raw material not found',
          data: null
        });
      }
      
      // If setting as default, ensure no other is default
      if (isDefault) {
        await RawMaterial.updateMany(
          { companyId: rawMaterial.companyId, _id: { $ne: rawMaterial._id } },
          { isDefault: false }
        );
      }
      
      return res.status(200).json({
        success: true,
        message: `Default raw material ${isDefault ? 'set as default' : 'removed as default'} successfully`,
        data: rawMaterial
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
module.exports = rawMaterialController;