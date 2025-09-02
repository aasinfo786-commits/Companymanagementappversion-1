const CreditorAccount = require('../models/CreditorAccount');
let Account; // Will be loaded conditionally
try {
  Account = require('../models/AccountLevel3');
} catch (err) {
  console.warn('Account model not found, titles will not be fetched');
}

// Get all default creditors for a company
const getDefaultCreditors = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required',
        data: null
      });
    }
    
    const defaultCreditors = await CreditorAccount.find({ companyId })
      .sort({ isDefault: -1, isActive: -1, code: 1 })
      .lean();
    
    // If Account model is available, fetch level 3 accounts to get titles
    if (Account && defaultCreditors.length > 0) {
      try {
        const level3Ids = defaultCreditors.map(ca => ca.level3Id);
        const level3Accounts = await Account.find({ _id: { $in: level3Ids } }).lean();
        
        // Map titles to creditor accounts
        const creditorAccountsWithTitles = defaultCreditors.map(ca => {
          const level3Account = level3Accounts.find(acc => acc._id.toString() === ca.level3Id.toString());
          return {
            ...ca,
            title: level3Account ? level3Account.title : 'Unknown Title'
          };
        });
        
        return res.status(200).json({
          success: true,
          message: creditorAccountsWithTitles.length > 0 
            ? 'Default creditors retrieved successfully' 
            : 'No default creditors found',
          data: creditorAccountsWithTitles
        });
      } catch (accountErr) {
        console.error('Error fetching account titles:', accountErr);
        // If fetching accounts fails, return creditor accounts without titles
        return res.status(200).json({
          success: true,
          message: 'Default creditors retrieved (without titles)',
          data: defaultCreditors.map(ca => ({ ...ca, title: 'Unknown Title' }))
        });
      }
    }
    
    // If Account model is not available, return creditor accounts without titles
    return res.status(200).json({
      success: true,
      message: defaultCreditors.length > 0 
        ? 'Default creditors retrieved successfully' 
        : 'No default creditors found',
      data: defaultCreditors.map(ca => ({ ...ca, title: 'Unknown Title' }))
    });
  } catch (err) {
    console.error('Error in getDefaultCreditors:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      data: null
    });
  }
};

// Add a new default creditor
const addDefaultCreditor = async (req, res) => {
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
    const existingCreditor = await CreditorAccount.findOne({ companyId, level3Id });
    if (existingCreditor) {
      return res.status(409).json({
        success: false,
        error: 'This account is already set as a default creditor',
        data: null
      });
    }
    
    // If Account model is available, get the title for the new creditor account
    let title = 'Unknown Title';
    if (Account) {
      try {
        const level3Account = await Account.findById(level3Id).lean();
        if (level3Account) {
          title = level3Account.title;
        }
      } catch (accountErr) {
        console.error('Error fetching account title:', accountErr);
      }
    }
    
    const newCreditor = new CreditorAccount({
      ...req.body,
      title, // Add the title field
      isActive: true,
      isDefault: false,
      createdAt: Date.now(), // Explicitly set createdAt
      updatedAt: Date.now()  // Explicitly set updatedAt
    });
    
    await newCreditor.save();
    
    return res.status(201).json({
      success: true,
      message: 'Default creditor added successfully',
      data: newCreditor
    });
  } catch (err) {
    console.error('Error in addDefaultCreditor:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to add default creditor',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      data: null
    });
  }
};

// Update a default creditor
const updateDefaultCreditor = async (req, res) => {
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
    
    // Find the existing creditor account
    const existingCreditor = await CreditorAccount.findById(id);
    if (!existingCreditor) {
      return res.status(404).json({
        success: false,
        error: 'Default creditor not found'
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
    
    // If level3Id is being updated and Account model is available, get the new title
    if (level3Id !== undefined && Account) {
      try {
        const level3Account = await Account.findById(level3Id).lean();
        if (level3Account) {
          updateData.title = level3Account.title;
        }
      } catch (accountErr) {
        console.error('Error fetching account title:', accountErr);
      }
    }
    
    // Update the creditor account - use findOneAndUpdate to avoid pre-save hook issues
    const updatedCreditor = await CreditorAccount.findOneAndUpdate(
      { _id: id },
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Default creditor updated successfully',
      data: updatedCreditor
    });
  } catch (err) {
    console.error('Error updating default creditor:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update default creditor',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Delete a default creditor
const deleteDefaultCreditor = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCreditor = await CreditorAccount.findByIdAndDelete(id);
    
    if (!deletedCreditor) {
      return res.status(404).json({
        success: false,
        error: 'Default creditor not found',
        data: null
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Default creditor deleted successfully',
      data: deletedCreditor
    });
  } catch (err) {
    console.error('Error in deleteDefaultCreditor:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete default creditor',
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
    const creditor = await CreditorAccount.findOneAndUpdate(
      { _id: id },
      { 
        isActive, 
        updatedBy,
        updatedAt: Date.now()  // Only update updatedAt, not createdAt
      },
      { new: true, runValidators: true }
    );
    
    if (!creditor) {
      return res.status(404).json({
        success: false,
        error: 'Default creditor not found',
        data: null
      });
    }
    
    return res.status(200).json({
      success: true,
      message: `Default creditor ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: creditor
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
    const creditor = await CreditorAccount.findOneAndUpdate(
      { _id: id },
      { 
        isDefault, 
        updatedBy,
        updatedAt: Date.now()  // Only update updatedAt, not createdAt
      },
      { new: true, runValidators: true }
    );
    
    if (!creditor) {
      return res.status(404).json({
        success: false,
        error: 'Default creditor not found',
        data: null
      });
    }
    
    // If setting as default, ensure no other is default
    if (isDefault) {
      await CreditorAccount.updateMany(
        { companyId: creditor.companyId, _id: { $ne: creditor._id } },
        { isDefault: false }
      );
    }
    
    return res.status(200).json({
      success: true,
      message: `Default creditor ${isDefault ? 'set as default' : 'removed as default'} successfully`,
      data: creditor
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
  getDefaultCreditors,
  addDefaultCreditor,
  updateDefaultCreditor,
  deleteDefaultCreditor,
  toggleActive,
  toggleDefault
};