// controllers/itemDescriptionCodeController.js
const { v4: uuidv4 } = require('uuid');
const ItemDescriptionCode = require('../models/ItemDescriptionCode');

// Create a new Item Description Code
const createItemDescriptionCode = async (req, res) => {
  try {
    const { companyId, hsCode, description, createdBy } = req.body;
    
    if (!companyId || !hsCode || !description || !createdBy) {
      return res.status(400).json({ 
        error: 'companyId, hsCode, description, and createdBy are required.' 
      });
    }
    
    // Check if item with same HS Code already exists for this company
    const existingItem = await ItemDescriptionCode.findOne({ companyId, hsCode });
    if (existingItem) {
      return res.status(409).json({ 
        error: 'An item with this HS Code already exists for this company.' 
      });
    }
    
    const itemDescriptionCode = new ItemDescriptionCode({
      id: uuidv4(),
      companyId,
      hsCode,
      description,
      createdBy,
      updatedBy: createdBy
    });
    
    await itemDescriptionCode.save();
    res.status(201).json(itemDescriptionCode);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Get all Item Description Codes for a company
const getItemDescriptionCodesByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).json({ 
        error: 'companyId is required in URL params.' 
      });
    }
    const itemDescriptionCodes = await ItemDescriptionCode.find({ companyId }).sort({ hsCode: 1 });
    res.status(200).json(itemDescriptionCodes);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Update an Item Description Code
const updateItemDescriptionCode = async (req, res) => {
  try {
    const { id } = req.params; // This is the _id
    const { description, updatedBy } = req.body;
    
    if (!description || !updatedBy) {
      return res.status(400).json({ 
        error: 'description and updatedBy are required.' 
      });
    }
    
    const updated = await ItemDescriptionCode.findByIdAndUpdate(
      id, // Use _id directly
      { description, updatedBy },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Item Description Code not found.' });
    }
    
    res.status(200).json(updated);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Delete an Item Description Code
const deleteItemDescriptionCode = async (req, res) => {
  try {
    const { id } = req.params; // This is the _id
    const deleted = await ItemDescriptionCode.findByIdAndDelete(id); // Use _id directly
    
    if (!deleted) {
      return res.status(404).json({ error: 'Item Description Code not found.' });
    }
    
    res.status(200).json({ 
      message: 'Item Description Code deleted successfully',
      deletedItem: deleted 
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Search Item Description Codes
const searchItemDescriptionCodes = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { query } = req.query;
    
    if (!companyId || !query) {
      return res.status(400).json({ 
        error: 'companyId and search query are required.' 
      });
    }
    
    const results = await ItemDescriptionCode.find(
      { 
        companyId,
        $or: [
          { hsCode: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }
    ).sort({ hsCode: 1 });
    
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

module.exports = {
  createItemDescriptionCode,
  getItemDescriptionCodesByCompany,
  updateItemDescriptionCode,
  deleteItemDescriptionCode,
  searchItemDescriptionCodes
};