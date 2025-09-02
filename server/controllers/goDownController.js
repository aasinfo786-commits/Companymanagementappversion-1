const GoDown = require('../models/goDown');

// Create a new godown
const createGodown = async (req, res) => {
  try {
    const { companyId, code, name, alphabet, createdBy } = req.body;
    
    // Validate required fields
    if (!companyId || code === undefined || code === null || !name || !alphabet) {
      return res.status(400).json({ 
        error: 'companyId, code, name, and alphabet are required.' 
      });
    }
    
    // Convert code to number if it's a string
    const codeNum = typeof code === 'string' ? parseInt(code, 10) : code;
    
    // Validate that code is a positive number
    if (isNaN(codeNum) || !Number.isInteger(codeNum) || codeNum <= 0) {
      return res.status(400).json({ 
        error: 'Code must be a positive integer.' 
      });
    }
    
    // Check if godown with same code already exists for this company
    const existingCode = await GoDown.findOne({ companyId, code: codeNum });
    if (existingCode) {
      return res.status(409).json({ 
        error: 'A godown with this code already exists for this company.' 
      });
    }
    
    // Check if godown with same name already exists for this company
    const existingName = await GoDown.findOne({ companyId, name });
    if (existingName) {
      return res.status(409).json({ 
        error: 'A godown with this name already exists for this company.' 
      });
    }
    
    // Check if godown with same alphabet already exists for this company
    const existingAlphabet = await GoDown.findOne({ companyId, alphabet });
    if (existingAlphabet) {
      return res.status(409).json({ 
        error: 'A godown with this alphabet already exists for this company.' 
      });
    }
    
    const godown = new GoDown({ 
      companyId, 
      code: codeNum, 
      name, 
      alphabet,
      createdBy
    });
    
    await godown.save();
    res.status(201).json(godown);
  } catch (err) {
    if (err.name === 'ValidationError') {
      // Extract validation error messages
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Get all godowns for a company
const getGodownsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).json({ 
        error: 'companyId is required in URL params.' 
      });
    }
    const godowns = await GoDown.find({ companyId }).sort({ code: 1 });
    res.status(200).json(godowns);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Update a godown
const updateGodown = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, alphabet, updatedBy } = req.body;
    
    // Validate required fields
    if (code === undefined || code === null || !name || !alphabet) {
      return res.status(400).json({ 
        error: 'code, name, and alphabet are required.' 
      });
    }
    
    // Convert code to number if it's a string
    const codeNum = typeof code === 'string' ? parseInt(code, 10) : code;
    
    // Validate that code is a positive number
    if (isNaN(codeNum) || !Number.isInteger(codeNum) || codeNum <= 0) {
      return res.status(400).json({ 
        error: 'Code must be a positive integer.' 
      });
    }
    
    // Check if another godown with the same code exists (excluding current godown)
    const existingCode = await GoDown.findOne({
      _id: { $ne: id },
      companyId: req.body.companyId,
      code: codeNum
    });
    if (existingCode) {
      return res.status(409).json({ 
        error: 'Another godown with this code already exists for this company.' 
      });
    }
    
    // Check if another godown with the same name exists (excluding current godown)
    const existingName = await GoDown.findOne({
      _id: { $ne: id },
      companyId: req.body.companyId,
      name
    });
    if (existingName) {
      return res.status(409).json({ 
        error: 'Another godown with this name already exists for this company.' 
      });
    }
    
    // Check if another godown with the same alphabet exists (excluding current godown)
    const existingAlphabet = await GoDown.findOne({
      _id: { $ne: id },
      companyId: req.body.companyId,
      alphabet
    });
    if (existingAlphabet) {
      return res.status(409).json({ 
        error: 'Another godown with this alphabet already exists for this company.' 
      });
    }
    
    const updated = await GoDown.findByIdAndUpdate(
      id,
      { 
        code: codeNum, 
        name, 
        alphabet,
        updatedBy
      },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Godown not found.' });
    }
    
    res.status(200).json(updated);
  } catch (err) {
    if (err.name === 'ValidationError') {
      // Extract validation error messages
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Delete a godown
const deleteGodown = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await GoDown.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Godown not found.' });
    }
    res.status(200).json({ 
      message: 'Godown deleted successfully',
      deletedGodown: deleted 
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

module.exports = {
  createGodown,
  getGodownsByCompany,
  updateGodown,
  deleteGodown,
};