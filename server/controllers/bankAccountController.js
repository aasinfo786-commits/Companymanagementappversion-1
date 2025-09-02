const BankAccount = require('../models/BankAccount');
// Helper function to get account titles by IDs
const getAccountTitles = async (companyId, level1Id, level2Id, level3Id) => {
  try {
    // In a real implementation, you would fetch these from your account models
    // For now, we'll return empty strings and let the frontend handle the titles
    return {
      level1Title: '',
      level2Title: '',
      level3Title: ''
    };
  } catch (err) {
    console.error('Error fetching account titles:', err);
    return {
      level1Title: '',
      level2Title: '',
      level3Title: ''
    };
  }
};
// Get default banks for a company
const getDefaultBanks = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }
    
    const defaultBanks = await BankAccount.find({ companyId })
      .sort({ createdAt: -1 });
    
    // We don't need to populate titles here as the frontend will handle it
    res.json(defaultBanks);
  } catch (err) {
    console.error('Error fetching default banks:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch default banks',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// Add a new default bank
const addDefaultBank = async (req, res) => {
  try {
    const { 
      companyId, 
      level1Id, 
      level2Id, 
      level3Id,
      level1Code,
      level2Code,
      level3Code,
      code,
      isActive = true,
      isDefault = false,
      createdBy,
      updatedBy
    } = req.body;
    
    // Validate required fields
    if (!companyId || !level1Id || !level2Id || !level3Id || !code || !createdBy || !updatedBy) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Create new default bank with user tracking
    const newDefaultBank = new BankAccount({
      companyId,
      level1Id,
      level2Id,
      level3Id,
      level1Code,
      level2Code,
      level3Code,
      code,
      isActive,
      isDefault,
      createdBy,
      updatedBy,
      createdAt: Date.now(), // Explicitly set createdAt
      updatedAt: Date.now()  // Explicitly set updatedAt
    });
    
    await newDefaultBank.save();
    
    res.status(201).json({
      success: true,
      message: 'Default bank added successfully',
      data: newDefaultBank
    });
  } catch (err) {
    console.error('Error adding default bank:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to add default bank',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// Update a default bank
const updateDefaultBank = async (req, res) => {
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
    
    // Find the existing bank
    const existingBank = await BankAccount.findById(id);
    if (!existingBank) {
      return res.status(404).json({
        success: false,
        error: 'Default bank not found'
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
    
    // Update the bank - use findOneAndUpdate to avoid pre-save hook issues
    const updatedBank = await BankAccount.findOneAndUpdate(
      { _id: id },
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Default bank updated successfully',
      data: updatedBank
    });
  } catch (err) {
    console.error('Error updating default bank:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update default bank',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// Delete a default bank
const deleteDefaultBank = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedBank = await BankAccount.findByIdAndDelete(id);
    if (!deletedBank) {
      return res.status(404).json({
        success: false,
        error: 'Default bank not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Default bank deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting default bank:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete default bank',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
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
    const bank = await BankAccount.findOneAndUpdate(
      { _id: id },
      { 
        isActive, 
        updatedBy,
        updatedAt: Date.now()  // Only update updatedAt, not createdAt
      },
      { new: true, runValidators: true }
    );
    
    if (!bank) {
      return res.status(404).json({
        success: false,
        error: 'Default bank not found'
      });
    }
    
    res.json({
      success: true,
      message: `Default bank ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: bank
    });
  } catch (err) {
    console.error('Error toggling active status:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle active status',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
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
    const bank = await BankAccount.findOneAndUpdate(
      { _id: id },
      { 
        isDefault, 
        updatedBy,
        updatedAt: Date.now()  // Only update updatedAt, not createdAt
      },
      { new: true, runValidators: true }
    );
    
    if (!bank) {
      return res.status(404).json({
        success: false,
        error: 'Default bank not found'
      });
    }
    
    res.json({
      success: true,
      message: `Default bank ${isDefault ? 'set as default' : 'removed as default'} successfully`,
      data: bank
    });
  } catch (err) {
    console.error('Error toggling default status:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle default status',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
module.exports = {
  getDefaultBanks,
  addDefaultBank,
  updateDefaultBank,
  deleteDefaultBank,
  toggleActive,
  toggleDefault
};