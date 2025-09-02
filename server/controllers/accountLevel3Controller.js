const AccountLevel3 = require('../models/AccountLevel3');
const AccountLevel1 = require('../models/AccountLevel1');
const AccountLevel2 = require('../models/AccountLevel2');
const jwt = require('jsonwebtoken');

// Helper function to get username from token
const getUsernameFromToken = (req) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return 'unknown';
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token and extract the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Return the username from the decoded token
    return decoded.username || 'unknown';
  } catch (error) {
    console.error('Error extracting username from token:', error);
    return 'unknown';
  }
};

// Create Level 3 account
exports.createAccountLevel3 = async (req, res) => {
  try {
    const { companyId, level1Id, level2Id, parentLevel1Code, parentLevel2Code, code, title, balance } = req.body;
    
    // Validate required fields
    const requiredFields = ['companyId', 'level1Id', 'level2Id', 'parentLevel1Code', 'parentLevel2Code', 'code', 'title'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Validate code formats
    if (!/^\d{2}$/.test(parentLevel1Code) || !/^\d{2}$/.test(parentLevel2Code) || !/^\d{3}$/.test(code)) {
      return res.status(400).json({
        success: false,
        error: "Invalid code format. Parent codes must be 2 digits, Level3 code must be 3 digits"
      });
    }
    
    // Validate balance is numeric
    if (isNaN(balance)) {
      return res.status(400).json({
        success: false,
        error: "Balance must be a number"
      });
    }
    
    // Check if parent accounts exist and match the provided codes
    const parentLevel1 = await AccountLevel1.findOne({ _id: level1Id, companyId, code: parentLevel1Code });
    if (!parentLevel1) {
      return res.status(404).json({
        success: false,
        error: "Parent Level1 account not found or code mismatch"
      });
    }
    
    const parentLevel2 = await AccountLevel2.findOne({ 
      _id: level2Id, 
      companyId, 
      level1Id,
      code: parentLevel2Code 
    });
    if (!parentLevel2) {
      return res.status(404).json({
        success: false,
        error: "Parent Level2 account not found or code mismatch"
      });
    }
    
    // Check for duplicate code in the same hierarchy
    const existingAccount = await AccountLevel3.findOne({ 
      companyId, 
      parentLevel1Code, 
      parentLevel2Code, 
      code 
    });
    
    if (existingAccount) {
      return res.status(409).json({
        success: false,
        error: "Account code already exists in this hierarchy"
      });
    }
    
    // Get username from token
    const username = getUsernameFromToken(req);
    
    // Create new account
    const newAccount = await AccountLevel3.create({
      companyId,
      level1Id,
      level2Id,
      parentLevel1Code,
      parentLevel2Code,
      code,
      title,
      balance: parseFloat(balance),
      createdBy: username,
      updatedBy: username
    });
    
    res.status(201).json({
      success: true,
      data: newAccount
    });
  } catch (err) {
    console.error("Error creating Level3 account:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get all Level 3 accounts for a company and hierarchy
exports.getLevel3Accounts = async (req, res) => {
  try {
    const { companyId, level1Id, level2Id } = req.params;
    
    // Validate parameters
    if (!companyId || !level1Id || !level2Id) {
      return res.status(400).json({
        success: false,
        error: "Company ID, Level1 ID and Level2 ID are required"
      });
    }
    
    // Get accounts with populated parent details
    const accounts = await AccountLevel3.find({ companyId, level1Id, level2Id })
      .populate('level1Details', 'code description')
      .populate('level2Details', 'code title');
    
    res.json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (err) {
    console.error("Error fetching Level3 accounts:", err);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve accounts",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get Level 3 account by ID
exports.getAccountLevel3 = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await AccountLevel3.findById(id)
      .populate('level1Details', 'code description')
      .populate('level2Details', 'code title');
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: "Account not found"
      });
    }
    
    res.json({
      success: true,
      data: account
    });
  } catch (err) {
    console.error("Error fetching Level3 account:", err);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve account",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update Level 3 account
exports.updateAccountLevel3 = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, level1Id, level2Id, parentLevel1Code, parentLevel2Code, code, title, balance } = req.body;
    
    // Validate required fields
    const requiredFields = ['companyId', 'level1Id', 'level2Id', 'parentLevel1Code', 'parentLevel2Code', 'code', 'title', 'balance'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Check if account exists
    const existingAccount = await AccountLevel3.findById(id);
    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        error: "Account not found"
      });
    }
    
    // Verify parent accounts exist and codes match
    const parentLevel1 = await AccountLevel1.findOne({ 
      _id: level1Id, 
      companyId, 
      code: parentLevel1Code 
    });
    if (!parentLevel1) {
      return res.status(404).json({
        success: false,
        error: "Parent Level1 account not found or code mismatch"
      });
    }
    
    const parentLevel2 = await AccountLevel2.findOne({ 
      _id: level2Id, 
      companyId, 
      level1Id,
      code: parentLevel2Code 
    });
    if (!parentLevel2) {
      return res.status(404).json({
        success: false,
        error: "Parent Level2 account not found or code mismatch"
      });
    }
    
    // Check for duplicate code if code is being changed
    if (code !== existingAccount.code) {
      const duplicate = await AccountLevel3.findOne({ 
        companyId, 
        parentLevel1Code, 
        parentLevel2Code, 
        code 
      });
      
      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: "Account code already exists in this hierarchy"
        });
      }
    }
    
    // Get username from token
    const username = getUsernameFromToken(req);
    
    // Update account
    const updatedAccount = await AccountLevel3.findOneAndUpdate(
      { _id: id },
      { 
        $set: {
          companyId,
          level1Id,
          level2Id,
          parentLevel1Code,
          parentLevel2Code,
          code,
          title,
          balance: parseFloat(balance),
          updatedBy: username,
          updatedAt: new Date() // Manually set updatedAt only when we want it to change
        }
      },
      { 
        new: true,
        timestamps: false // Disable automatic timestamp updates
      }
    ).populate('level1Details', 'code description')
     .populate('level2Details', 'code title');
    
    res.json({
      success: true,
      data: updatedAccount
    });
  } catch (err) {
    console.error("Error updating Level3 account:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update account",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Delete Level 3 account
exports.deleteAccountLevel3 = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the Level 3 account exists
    const account = await AccountLevel3.findById(id);
    if (!account) {
      return res.status(404).json({
        success: false,
        error: "Account not found"
      });
    }
    
    // Check if there are any child accounts in Level 4
    try {
      const AccountLevel4 = require('../models/AccountLevel4');
      const childAccounts = await AccountLevel4.find({ 
        level3Id: id,
        companyId: account.companyId,
        level1Id: account.level1Id,
        level2Id: account.level2Id
      });
      
      if (childAccounts.length > 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Cannot delete this account. It has child accounts in Level 4. Please delete the child accounts first.',
          childCount: childAccounts.length,
          hasChildren: true
        });
      }
    } catch (err) {
      // If AccountLevel4 model doesn't exist, we'll continue with deletion
      console.log("AccountLevel4 model not found, continuing with deletion");
    }
    
    // If no child accounts exist, proceed with deletion
    const deleted = await AccountLevel3.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Account not found"
      });
    }
    
    res.json({
      success: true,
      data: {
        id: deleted._id,
        fullCode: deleted.fullCode,
        message: "Account deleted successfully"
      }
    });
  } catch (err) {
    console.error("Error deleting Level3 account:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete account",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};