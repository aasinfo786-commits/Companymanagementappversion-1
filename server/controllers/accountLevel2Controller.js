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

// Create Level 2 account
exports.createAccountLevel2 = async (req, res) => {
  try {
    const { companyId, level1Id, code, title } = req.body;
    if (!companyId || !level1Id || !code || !title) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    // Check if code already exists for this company and level1
    const existing = await AccountLevel2.findOne({ companyId, level1Id, code });
    if (existing) {
      return res.status(400).json({ error: "Code already exists for this Level 1 account" });
    }
    
    const parent = await AccountLevel1.findById(level1Id);
    if (!parent) {
      return res.status(404).json({ error: "Parent Level 1 account not found" });
    }
    
    const parentCode = parent.code;
    const username = getUsernameFromToken(req);
    
    const account = await AccountLevel2.create({
      companyId,
      level1Id,
      parentCode,
      code,
      title,
      createdBy: username,
      updatedBy: username
    });
    
    res.status(201).json(account);
  } catch (err) {
    console.error(err);
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ error: "Code already exists for this Level 1 account" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Get all Level 2 accounts
exports.getLevel2Accounts = async (req, res) => {
  try {
    const { companyId, level1Id } = req.params;
    if (!companyId || !level1Id) {
      return res.status(400).json({ error: "Company ID and Level 1 ID are required" });
    }
    const accounts = await AccountLevel2.find({ companyId, level1Id });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
};

// Update Level 2 account
exports.updateAccountLevel2 = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, level1Id, code, title } = req.body;
    
    // First, get the current account to access its companyId and level1Id
    const currentAccount = await AccountLevel2.findById(id);
    if (!currentAccount) {
      return res.status(404).json({ error: "Account not found" });
    }
    
    // Check if the code already exists for another account in the same company and level1
    const existingAccount = await AccountLevel2.findOne({
      companyId: currentAccount.companyId,
      level1Id: currentAccount.level1Id,
      code,
      _id: { $ne: id } // Exclude the current account being updated
    });
    
    if (existingAccount) {
      return res.status(400).json({ error: "Code already exists for this Level 1 account" });
    }
    
    const parent = await AccountLevel1.findById(level1Id);
    if (!parent) {
      return res.status(404).json({ error: "Parent Level 1 account not found" });
    }
    
    const parentCode = parent.code;
    const username = getUsernameFromToken(req);
    
    // Use findOneAndUpdate with timestamps: false to prevent automatic timestamp updates
    const updated = await AccountLevel2.findOneAndUpdate(
      { _id: id },
      { 
        $set: {
          companyId,
          level1Id,
          parentCode,
          code,
          title,
          updatedBy: username,
          updatedAt: new Date() // Manually set updatedAt only when we want it to change
        }
      },
      { 
        new: true,
        timestamps: false // Disable automatic timestamp updates
      }
    );
    
    if (!updated) return res.status(404).json({ error: "Account not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ error: "Code already exists for this Level 1 account" });
    }
    res.status(500).json({ error: "Failed to update account" });
  }
};

// Delete Level 2 account
exports.deleteAccountLevel2 = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, check if the Level 2 account exists
    const account = await AccountLevel2.findById(id);
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    
    // Check if there are any child accounts in Level 3
    const childAccounts = await AccountLevel3.find({ level2Id: id });
    
    if (childAccounts.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete this account. It has child accounts in Level 3. Please delete the child accounts first.',
        childCount: childAccounts.length
      });
    }
    
    // If no child accounts exist, proceed with deletion
    const deleted = await AccountLevel2.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Account not found" });
    }
    
    res.status(200).json({ 
      success: true,
      message: "Account deleted successfully",
      data: {
        id: deleted._id,
        fullCode: deleted.parentCode + deleted.code
      }
    });
  } catch (err) {
    console.error("Error deleting Level2 account:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
};