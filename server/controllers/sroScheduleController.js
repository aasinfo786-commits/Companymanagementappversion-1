// controllers/sroScheduleController.js
const { v4: uuidv4 } = require('uuid');
const SroSchedule = require('../models/SroSchedule');

// Create a new SRO item
const createSroItem = async (req, res) => {
  try {
    const { companyId, sroItemId, description, createdBy } = req.body;
    
    if (!companyId || !sroItemId || !description || !createdBy) {
      return res.status(400).json({ 
        error: 'companyId, sroItemId, description, and createdBy are required.' 
      });
    }
    
    // Check if SRO item with same ID already exists for this company
    const existingItem = await SroSchedule.findOne({ companyId, sroItemId });
    if (existingItem) {
      return res.status(409).json({ 
        error: 'An SRO item with this ID already exists for this company.' 
      });
    }
    
    const sroItem = new SroSchedule({
      id: uuidv4(),
      companyId,
      sroItemId,
      description,
      createdBy,
      updatedBy: createdBy
    });
    
    await sroItem.save();
    res.status(201).json(sroItem);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Get all SRO items for a company
const getSroItemsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).json({ 
        error: 'companyId is required in URL params.' 
      });
    }
    const sroItems = await SroSchedule.find({ companyId }).sort({ sroItemId: 1 });
    res.status(200).json(sroItems);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Update an SRO item
const updateSroItem = async (req, res) => {
  try {
    const { id } = req.params; // This is the _id
    const { description, updatedBy } = req.body;
    
    if (!description || !updatedBy) {
      return res.status(400).json({ 
        error: 'description and updatedBy are required.' 
      });
    }
    
    const updated = await SroSchedule.findByIdAndUpdate(
      id, // Use _id directly
      { description, updatedBy },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'SRO item not found.' });
    }
    
    res.status(200).json(updated);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Delete an SRO item
const deleteSroItem = async (req, res) => {
  try {
    const { id } = req.params; // This is the _id
    const deleted = await SroSchedule.findByIdAndDelete(id); // Use _id directly
    
    if (!deleted) {
      return res.status(404).json({ error: 'SRO item not found.' });
    }
    
    res.status(200).json({ 
      message: 'SRO item deleted successfully',
      deletedItem: deleted 
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Search SRO items
const searchSroItems = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { query } = req.query;
    
    if (!companyId || !query) {
      return res.status(400).json({ 
        error: 'companyId and search query are required.' 
      });
    }
    
    const results = await SroSchedule.find(
      { 
        companyId,
        $text: { $search: query } 
      },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });
    
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

module.exports = {
  createSroItem,
  getSroItemsByCompany,
  updateSroItem,
  deleteSroItem,
  searchSroItems
};