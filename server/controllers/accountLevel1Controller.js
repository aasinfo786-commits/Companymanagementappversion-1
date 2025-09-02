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

// Create a new Level 1 account
const createAccountLevel1 = async (req, res) => {
  try {
    const { companyId, code, description } = req.body;
    if (!companyId || !code || !description) {
      return res.status(400).json({ error: 'companyId, code, and description are required.' });
    }
    
    // Check if code already exists for this company
    const existingAccount = await AccountLevel1.findOne({ companyId, code });
    if (existingAccount) {
      return res.status(400).json({ error: 'Code already exists. Please enter a new code.' });
    }
    
    // Get username from token
    const username = getUsernameFromToken(req);
    
    const account = new AccountLevel1({ 
      companyId, 
      code, 
      description,
      createdBy: username,
      updatedBy: username
    });
    
    await account.save();
    res.status(201).json(account);
  } catch (err) {
    // Handle MongoDB duplicate key error (11000)
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Code already exists. Please enter a new code.' });
    }
    res.status(500).json({ error: err.message });
  }
};

// Get all Level 1 accounts for a company
const getAccountsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required in URL params.' });
    }
    const accounts = await AccountLevel1.find({ companyId });
    res.status(200).json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a Level 1 account
const updateAccountLevel1 = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, description } = req.body;
    if (!code || !description) {
      return res.status(400).json({ error: 'code and description are required.' });
    }
    
    // First, get the current account to access its companyId
    const currentAccount = await AccountLevel1.findById(id);
    if (!currentAccount) {
      return res.status(404).json({ error: 'Account not found.' });
    }
    
    // Check if code already exists for another account in the same company
    const existingAccount = await AccountLevel1.findOne({ 
      _id: { $ne: id }, // Exclude the current account being updated
      companyId: currentAccount.companyId, // Only check within the same company
      code 
    });
    
    if (existingAccount) {
      return res.status(400).json({ error: 'Code already exists. Please enter a new code.' });
    }
    
    // Get username from token
    const username = getUsernameFromToken(req);
    
    // Use findOneAndUpdate with timestamps: false to prevent automatic timestamp updates
    const updated = await AccountLevel1.findOneAndUpdate(
      { _id: id },
      { 
        $set: {
          code, 
          description,
          updatedBy: username,
          updatedAt: new Date() // Manually set updatedAt only when we want it to change
        }
      },
      { 
        new: true,
        timestamps: false // Disable automatic timestamp updates
      }
    );
    
    res.status(200).json(updated);
  } catch (err) {
    // Handle MongoDB duplicate key error (11000)
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Code already exists. Please enter a new code.' });
    }
    res.status(500).json({ error: err.message });
  }
};

// Delete a Level 1 account
const deleteAccountLevel1 = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, check if the Level 1 account exists
    const account = await AccountLevel1.findById(id);
    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }
    
    // Check if there are any child accounts in Level 2
    const childAccounts = await AccountLevel2.find({ level1Id: id });
    
    if (childAccounts.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete this account. It has child accounts in Level 2. Please delete the child accounts first.',
        childCount: childAccounts.length
      });
    }
    
    // If no child accounts exist, proceed with deletion
    const deleted = await AccountLevel1.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Account not found.' });
    }
    
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createAccountLevel1,
  getAccountsByCompany,
  updateAccountLevel1,
  deleteAccountLevel1,
};