const CashAccount = require('../models/CashAccount');
// Get all default cash accounts for a company
const getDefaultCash = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required',
        data: null
      });
    }
    const defaultCash = await CashAccount.find({ companyId })
      .sort({ isDefault: -1, isActive: -1, code: 1 })
      .lean();
    return res.status(200).json({
      success: true,
      message: defaultCash.length > 0 
        ? 'Default cash accounts retrieved successfully' 
        : 'No default cash accounts found',
      data: defaultCash
    });
  } catch (err) {
    console.error('Error in getDefaultCash:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      data: null
    });
  }
};
// Add a new default cash account
const addDefaultCash = async (req, res) => {
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
    const existingCash = await CashAccount.findOne({ companyId, level3Id });
    if (existingCash) {
      return res.status(409).json({
        success: false,
        error: 'This account is already set as a default cash account',
        data: null
      });
    }
    const newCash = new CashAccount({
      ...req.body,
      isActive: true,
      isDefault: false,
      createdAt: Date.now(), // Explicitly set createdAt
      updatedAt: Date.now()  // Explicitly set updatedAt
    });
    await newCash.save();
    return res.status(201).json({
      success: true,
      message: 'Default cash account added successfully',
      data: newCash
    });
  } catch (err) {
    console.error('Error in addDefaultCash:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to add default cash account',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      data: null
    });
  }
};
// Update a default cash account
const updateDefaultCash = async (req, res) => {
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
      isActive,
      isDefault,
      updatedBy
    } = req.body;
    
    // Find the existing cash account
    const existingCash = await CashAccount.findById(id);
    if (!existingCash) {
      return res.status(404).json({
        success: false,
        error: 'Default cash account not found'
      });
    }
    
    // Validate required fields
    if (!updatedBy) {
      return res.status(400).json({
        success: false,
        error: 'Missing updatedBy field'
      });
    }
    
    // Update fields with user tracking - explicitly exclude createdAt
    const updateData = { 
      updatedBy,
      updatedAt: Date.now()  // Only update updatedAt, not createdAt
    };
    
    if (level1Id !== undefined) updateData.level1Id = level1Id;
    if (level2Id !== undefined) updateData.level2Id = level2Id;
    if (level3Id !== undefined) updateData.level3Id = level3Id;
    if (level1Code !== undefined) updateData.level1Code = level1Code;
    if (level2Code !== undefined) updateData.level2Code = level2Code;
    if (level3Code !== undefined) updateData.level3Code = level3Code;
    if (code !== undefined) updateData.code = code;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isDefault !== undefined) updateData.isDefault = isDefault;
    
    // Update the cash account - use findOneAndUpdate to avoid pre-save hook issues
    const updatedCash = await CashAccount.findOneAndUpdate(
      { _id: id },
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Default cash account updated successfully',
      data: updatedCash
    });
  } catch (err) {
    console.error('Error updating default cash account:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update default cash account',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// Delete a default cash account
const deleteDefaultCash = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCash = await CashAccount.findByIdAndDelete(id);
    if (!deletedCash) {
      return res.status(404).json({
        success: false,
        error: 'Default cash account not found',
        data: null
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Default cash account deleted successfully',
      data: deletedCash
    });
  } catch (err) {
    console.error('Error in deleteDefaultCash:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete default cash account',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      data: null
    });
  }
};
// Toggle active status
const toggleActive = async (req, res) => {
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
    const cash = await CashAccount.findOneAndUpdate(
      { _id: id },
      { 
        isActive, 
        updatedBy,
        updatedAt: Date.now()  // Only update updatedAt, not createdAt
      },
      { new: true, runValidators: true }
    );
    
    if (!cash) {
      return res.status(404).json({
        success: false,
        error: 'Default cash account not found',
        data: null
      });
    }
    
    return res.status(200).json({
      success: true,
      message: `Default cash account ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: cash
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
};
// Toggle default status
const toggleDefault = async (req, res) => {
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
    const cash = await CashAccount.findOneAndUpdate(
      { _id: id },
      { 
        isDefault, 
        updatedBy,
        updatedAt: Date.now()  // Only update updatedAt, not createdAt
      },
      { new: true, runValidators: true }
    );
    
    if (!cash) {
      return res.status(404).json({
        success: false,
        error: 'Default cash account not found',
        data: null
      });
    }
    
    // If setting as default, ensure no other is default
    if (isDefault) {
      await CashAccount.updateMany(
        { companyId: cash.companyId, _id: { $ne: cash._id } },
        { isDefault: false }
      );
    }
    
    return res.status(200).json({
      success: true,
      message: `Default cash account ${isDefault ? 'set as default' : 'removed as default'} successfully`,
      data: cash
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
};
module.exports = {
  getDefaultCash,
  addDefaultCash,
  updateDefaultCash,
  deleteDefaultCash,
  toggleActive,
  toggleDefault
};