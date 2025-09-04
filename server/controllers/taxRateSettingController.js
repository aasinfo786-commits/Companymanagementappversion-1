const mongoose = require('mongoose');
const TaxRate = require('../models/TaxRateSetting');
const FinishedGoods = require('../models/FinishedGoods');
const RawMaterial = require('../models/RawMaterial');
const AccountLevel4 = require('../models/AccountLevel4');
const User = require('../models/User'); // Import User model

// Helper function to validate references and get item type
const validateReferences = async (companyId, itemId, itemType, accountLevel4Id) => {
  let item;
  
  // Determine item type if not provided
  if (!itemType) {
    // Try to find in finished goods first
    item = await FinishedGoods.findOne({ _id: itemId, companyId });
    if (item) {
      itemType = 'finishedGood';
    } else {
      // If not found, try raw materials
      item = await RawMaterial.findOne({ _id: itemId, companyId });
      if (item) {
        itemType = 'rawMaterial';
      }
    }
  } else {
    // If item type is provided, get the specific item
    item = itemType === 'finishedGood' 
      ? await FinishedGoods.findOne({ _id: itemId, companyId })
      : await RawMaterial.findOne({ _id: itemId, companyId });
  }
  
  const account = await AccountLevel4.findOne({ _id: accountLevel4Id, companyId });
  
  if (!item || !account) {
    throw new Error('Referenced item or account not found');
  }
  
  return { item, account, itemType };
};

const formatTaxRateResponse = async (taxRate, includeItemType = true, includeAccountLevel = true) => {
  const result = {
    ...taxRate,
    id: taxRate._id,
    isExempted: taxRate.isExempted || false, // Ensure this is included
    createdBy: taxRate.createdBy,
    updatedBy: taxRate.updatedBy,
    createdAt: taxRate.createdAt,
    updatedAt: taxRate.updatedAt,
    taxRates: taxRate.taxRates.map(rate => ({
      ...rate,
      taxTypeId: rate.taxTypeId._id || rate.taxTypeId,
      registeredValue: rate.registeredValue,
      unregisteredValue: rate.unregisteredValue
    }))
  };
  
  // Populate item details if needed
  if (includeItemType) {
    let itemDetails;
    try {
      // Try to determine item type by checking if it exists in finished goods or raw materials
      itemDetails = await FinishedGoods.findById(taxRate.itemId);
      if (itemDetails) {
        result.itemType = 'finishedGood';
        result.itemTitle = itemDetails.title;
      } else {
        itemDetails = await RawMaterial.findById(taxRate.itemId);
        if (itemDetails) {
          result.itemType = 'rawMaterial';
          result.itemTitle = itemDetails.title;
        }
      }
    } catch (err) {
      console.error('Error populating item details:', err);
    }
  }
  
  // Populate account details if needed
  if (includeAccountLevel) {
    try {
      const accountDetails = await AccountLevel4.findById(taxRate.accountLevel4Id);
      if (accountDetails) {
        result.accountTitle = accountDetails.title;
      }
    } catch (err) {
      console.error('Error populating account details:', err);
    }
  }
  
  return result;
};

exports.getFilteredTaxRates = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { itemId, itemType, accountLevel4Id } = req.body;
    
    // Validate input
    if (!itemId || !accountLevel4Id) {
      return res.status(400).json({ error: 'Item ID and Account Level 4 ID must be provided' });
    }
    
    // Validate references
    await validateReferences(companyId, itemId, itemType, accountLevel4Id);
    
    // Query tax rates
    const taxRates = await TaxRate.find({
      companyId,
      itemId,
      accountLevel4Id
    })
    .populate('createdBy', 'username firstName lastName')
    .populate('updatedBy', 'username firstName lastName')
    .sort({ applicableDate: 1 })
    .lean();
    
    // Format tax rates to match frontend expectations
    const mappedTaxRates = await Promise.all(
      taxRates.map(taxRate => formatTaxRateResponse(taxRate))
    );
    
    res.json(mappedTaxRates);
  } catch (err) {
    console.error('Error fetching filtered tax rates:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to fetch tax rates'
    });
  }
};

exports.saveTaxRates = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { itemId, itemType, accountLevel4Id, taxRates, username } = req.body;
    
    // Validate input
    if (!Array.isArray(taxRates)) {
      return res.status(400).json({ error: 'Tax rates must be an array' });
    }
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    // Validate and get references
    const { item, account, itemType: determinedItemType } = await validateReferences(companyId, itemId, itemType, accountLevel4Id);
    
    // Get existing tax rates for this combination
    const existingTaxRates = await TaxRate.find({
      companyId,
      itemId,
      accountLevel4Id
    });
    
    // Prepare bulk operations
    const bulkOps = taxRates.map(taxRate => {
      const { id, applicableDate, isActive, isExempted, taxRates: rates } = taxRate;
      const filter = id ? { _id: new mongoose.Types.ObjectId(id) } : {
        companyId,
        itemId,
        accountLevel4Id,
        applicableDate: new Date(applicableDate)
      };
      
      // Prepare update data
      const updateData = {
        $set: {
          companyId,
          itemId,
          accountLevel4Id,
          itemCode: item.code,
          accountCode: account.fullcode || account.subcode,
          applicableDate: new Date(applicableDate),
          isActive,
          isExempted: isExempted || false, // Ensure this is properly set
          updatedBy: user.username,
          taxRates: rates.map(rate => ({
            taxTypeId: rate.taxTypeId,
            title: rate.title,
            type: rate.type || 'percentage',
            isEditable: rate.isEditable || false,
            transactionType: rate.transactionType || 'sale',
            registeredValue: parseFloat(rate.registeredValue) || 0,
            unregisteredValue: parseFloat(rate.unregisteredValue) || 0
          }))
        }
      };
      
      // Only set on insert for new documents
      if (!id) {
        updateData.$setOnInsert = {
          createdBy: user.username,
        };
      }
      
      return {
        updateOne: {
          filter,
          update: updateData,
          upsert: true
        }
      };
    });
    
    // Execute bulk operations
    await TaxRate.bulkWrite(bulkOps);
    
    // Return updated tax rates
    const updatedTaxRates = await TaxRate.find({
      companyId,
      itemId,
      accountLevel4Id
    })
    .populate('createdBy', 'username firstName lastName')
    .populate('updatedBy', 'username firstName lastName')
    .sort({ applicableDate: 1 })
    .lean();
    
    // Format tax rates to match frontend expectations
    const mappedTaxRates = await Promise.all(
      updatedTaxRates.map(taxRate => formatTaxRateResponse(taxRate))
    );
    
    res.json({
      message: 'Tax rates saved successfully',
      taxRates: mappedTaxRates
    });
  } catch (err) {
    console.error('Error saving tax rates:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to save tax rates'
    });
  }
};

exports.getCurrentTaxRates = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { itemId, itemType, accountLevel4Id } = req.body;
    
    // Validate input
    if (!itemId || !accountLevel4Id) {
      return res.status(400).json({ error: 'Item ID and Account Level 4 ID must be provided' });
    }
    
    // Get current active tax rates (most recent before or equal to today)
    const currentTaxRates = await TaxRate.findOne({
      companyId,
      itemId,
      accountLevel4Id,
      isActive: true,
      applicableDate: { $lte: new Date() }
    })
    .populate('createdBy', 'username firstName lastName')
    .populate('updatedBy', 'username firstName lastName')
    .sort({ applicableDate: -1 })
    .lean();
    
    if (!currentTaxRates) {
      return res.status(404).json({ error: 'No active tax rates found' });
    }
    
    // Format tax rates to match frontend expectations
    const mappedTaxRates = await formatTaxRateResponse(currentTaxRates);
    
    res.json(mappedTaxRates);
  } catch (err) {
    console.error('Error fetching current tax rates:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to fetch current tax rates'
    });
  }
};

exports.deleteTaxRate = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the tax rate first to get the details before deletion
    const taxRate = await TaxRate.findById(id)
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');
    
    if (!taxRate) {
      return res.status(404).json({ error: 'Tax rate not found' });
    }
    
    // Delete the tax rate
    await TaxRate.findByIdAndDelete(id);
    
    // Format the response
    const deletedTaxRate = await formatTaxRateResponse(taxRate.toObject(), false, false);
    
    res.json({
      message: 'Tax rate deleted successfully',
      deletedTaxRate
    });
  } catch (err) {
    console.error('Error deleting tax rate:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to delete tax rate'
    });
  }
};

