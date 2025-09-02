const AccountLevel4 = require('../models/AccountLevel4');
const AccountLevel1 = require('../models/AccountLevel1');
const AccountLevel2 = require('../models/AccountLevel2');
const AccountLevel3 = require('../models/AccountLevel3');
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
// Create Level 4 account
exports.createAccountLevel4 = async (req, res) => {
  try {
    const { companyId, level1Id, level2Id, level3Id, parentLevel1Code, parentLevel2Code, parentLevel3Code, subcode, title, balance } = req.body;
    const requiredFields = ['companyId', 'level1Id', 'level2Id', 'level3Id', 'parentLevel1Code', 'parentLevel2Code', 'parentLevel3Code', 'subcode', 'title'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    if (!/^\d{5}$/.test(subcode)) {
      return res.status(400).json({
        success: false,
        error: "Invalid subcode format. It must be a 5-digit number."
      });
    }
    
    if (isNaN(balance)) {
      return res.status(400).json({
        success: false,
        error: "Balance must be a number"
      });
    }
    
    const parentLevel1 = await AccountLevel1.findOne({ _id: level1Id, companyId, code: parentLevel1Code });
    if (!parentLevel1) {
      return res.status(404).json({ success: false, error: "Parent Level1 not found or code mismatch" });
    }
    
    const parentLevel2 = await AccountLevel2.findOne({ _id: level2Id, companyId, level1Id, code: parentLevel2Code });
    if (!parentLevel2) {
      return res.status(404).json({ success: false, error: "Parent Level2 not found or code mismatch" });
    }
    
    const parentLevel3 = await AccountLevel3.findOne({ _id: level3Id, companyId, level1Id, level2Id, code: parentLevel3Code });
    if (!parentLevel3) {
      return res.status(404).json({ success: false, error: "Parent Level3 not found or code mismatch" });
    }
    
    const fullcode = parentLevel1Code + parentLevel2Code + parentLevel3Code + subcode;
    const code = parentLevel1Code + parentLevel2Code + parentLevel3Code; // New code field
    
    // Check for duplicate fullcode within the same company
    const existingByFullcode = await AccountLevel4.findOne({ companyId, fullcode });
    if (existingByFullcode) {
      return res.status(409).json({ 
        success: false, 
        error: "Account with this fullcode already exists in this company" 
      });
    }
    
    // Check for duplicate subcode in hierarchy
    const existingAccount = await AccountLevel4.findOne({
      companyId,
      level1Id,
      level2Id,
      level3Id,
      subcode
    });
    
    if (existingAccount) {
      return res.status(409).json({ success: false, error: "Subcode already exists in this hierarchy" });
    }
    
    // Get username from token
    const username = getUsernameFromToken(req);
    
    const newAccount = await AccountLevel4.create({
      companyId,
      level1Id,
      level2Id,
      level3Id,
      parentLevel1Code,
      parentLevel2Code,
      parentLevel3Code,
      subcode,
      fullcode,
      code, // Include the new code field
      title,
      balance: parseFloat(balance),
      createdBy: username,
      updatedBy: username
    });
    
    res.status(201).json({ success: true, data: newAccount });
  } catch (err) {
    console.error("Error creating Level4 account:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// Get all Level 4 accounts
exports.getLevel4Accounts = async (req, res) => {
  try {
    const { companyId, level1Id, level2Id, level3Id } = req.params;
    
    if (!companyId || !level1Id || !level2Id || !level3Id) {
      return res.status(400).json({
        success: false,
        error: "Company ID, Level1 ID, Level2 ID, and Level3 ID are required"
      });
    }
    
    const accounts = await AccountLevel4.find({ companyId, level1Id, level2Id, level3Id })
      .populate('level1Id', 'code description')
      .populate('level2Id', 'code title')
      .populate('level3Id', 'code title')
      .sort('fullcode')
      .select('code fullcode subcode title balance createdBy updatedBy createdAt updatedAt'); // Added user tracking fields
    
    res.json({ success: true, count: accounts.length, data: accounts });
  } catch (err) {
    console.error("Error fetching Level4 accounts:", err);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve accounts",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// Get Level 4 account by ID
exports.getAccountLevel4 = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await AccountLevel4.findById(id)
      .populate('level1Id', 'code description')
      .populate('level2Id', 'code title')
      .populate('level3Id', 'code title')
      .select('subcode code fullcode title balance createdBy updatedBy createdAt updatedAt'); // Include user tracking fields
    
    if (!account) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }
    
    res.json({ success: true, data: account });
  } catch (err) {
    console.error("Error fetching Level4 account:", err);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve account",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// Update Level 4 account
exports.updateAccountLevel4 = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, level1Id, level2Id, level3Id, parentLevel1Code, parentLevel2Code, parentLevel3Code, subcode, title, balance } = req.body;
    
    const requiredFields = ['companyId', 'level1Id', 'level2Id', 'level3Id', 'parentLevel1Code', 'parentLevel2Code', 'parentLevel3Code', 'subcode', 'title', 'balance'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    const existingAccount = await AccountLevel4.findById(id);
    if (!existingAccount) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }
    
    const parentLevel1 = await AccountLevel1.findOne({ _id: level1Id, companyId, code: parentLevel1Code });
    const parentLevel2 = await AccountLevel2.findOne({ _id: level2Id, companyId, level1Id, code: parentLevel2Code });
    const parentLevel3 = await AccountLevel3.findOne({ _id: level3Id, companyId, level1Id, level2Id, code: parentLevel3Code });
    
    if (!parentLevel1 || !parentLevel2 || !parentLevel3) {
      return res.status(404).json({ success: false, error: "One or more parent levels not found or code mismatch" });
    }
    
    // Generate new codes
    const newFullcode = parentLevel1Code + parentLevel2Code + parentLevel3Code + subcode;
    const newCode = parentLevel1Code + parentLevel2Code + parentLevel3Code; // New code field
    
    // Check if subcode is being changed
    if (subcode !== existingAccount.subcode || 
        parentLevel1Code !== existingAccount.parentLevel1Code ||
        parentLevel2Code !== existingAccount.parentLevel2Code ||
        parentLevel3Code !== existingAccount.parentLevel3Code) {
      
      // Check for duplicate fullcode within the same company
      const duplicateFullcode = await AccountLevel4.findOne({ 
        companyId, 
        fullcode: newFullcode, 
        _id: { $ne: id } 
      });
      if (duplicateFullcode) {
        return res.status(409).json({ 
          success: false, 
          error: "Account with this fullcode already exists in this company" 
        });
      }
      
      // Check for duplicate subcode in hierarchy
      const duplicateSubcode = await AccountLevel4.findOne({
        companyId,
        level1Id,
        level2Id,
        level3Id,
        subcode,
        _id: { $ne: id }
      });
      
      if (duplicateSubcode) {
        return res.status(409).json({ success: false, error: "Subcode already exists in this hierarchy" });
      }
    }
    
    // Get username from token
    const username = getUsernameFromToken(req);
    
    const updatedAccount = await AccountLevel4.findByIdAndUpdate(
      id,
      {
        companyId,
        level1Id,
        level2Id,
        level3Id,
        parentLevel1Code,
        parentLevel2Code,
        parentLevel3Code,
        subcode,
        fullcode: newFullcode,
        code: newCode, // Update the code field
        title,
        balance: parseFloat(balance),
        updatedBy: username,
        updatedAt: new Date() // Manually set updatedAt only when we want it to change
      },
      { 
        new: true,
        runValidators: true,
        timestamps: false // Disable automatic timestamp updates
      }
    ).populate('level1Id', 'code description')
     .populate('level2Id', 'code title')
     .populate('level3Id', 'code title')
     .select('code fullcode title balance createdBy updatedBy createdAt updatedAt'); // Include user tracking fields
    
    res.json({ success: true, data: updatedAccount });
  } catch (err) {
    console.error("Error updating Level4 account:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update account",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// Delete Level 4 account
exports.deleteAccountLevel4 = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await AccountLevel4.findById(id);
    
    if (!account) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }
    
    await AccountLevel4.findByIdAndDelete(id);
    
    res.json({
      success: true,
      data: {
        id: account._id,
        subcode: account.subcode,
        fullcode: account.fullcode,
        code: account.code, // Include code in the response
        message: "Account deleted successfully"
      }
    });
  } catch (err) {
    console.error("Error deleting Level4 account:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete account",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// Get account by fullcode
exports.getAccountByFullcode = async (req, res) => {
  try {
    const { fullcode } = req.params;
    const account = await AccountLevel4.findOne({ fullcode })
      .populate('level1Id', 'code description')
      .populate('level2Id', 'code title')
      .populate('level3Id', 'code title')
      .select('code fullcode title balance createdBy updatedBy createdAt updatedAt'); // Include user tracking fields
    
    if (!account) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }
    
    res.json({ success: true, data: account });
  } catch (err) {
    console.error("Error fetching account by fullcode:", err);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve account",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// New endpoint to get accounts by parent code (code field)
exports.getAccountsByParentCode = async (req, res) => {
  try {
    const { code } = req.params;
    const accounts = await AccountLevel4.find({ code })
      .populate('level1Id', 'code description')
      .populate('level2Id', 'code title')
      .populate('level3Id', 'code title')
      .select('code fullcode title balance createdBy updatedBy createdAt updatedAt'); // Include user tracking fields
    
    res.json({ success: true, count: accounts.length, data: accounts });
  } catch (err) {
    console.error("Error fetching accounts by parent code:", err);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve accounts",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};