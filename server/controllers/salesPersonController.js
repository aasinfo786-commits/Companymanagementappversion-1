// controller/salesPersonController.js
const SalesPerson = require('../models/SalesPerson');

const createSalesPerson = async (req, res) => {
  try {
    const { companyId, code, name, status, createdBy } = req.body;
    
    if (!companyId || !code || !name || !createdBy) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    
    const existingCode = await SalesPerson.findOne({ companyId, code });
    if (existingCode) {
      return res.status(400).json({ error: 'Sales person code already exists for this company.' });
    }
    
    const salesPerson = new SalesPerson({ 
      companyId, 
      code, 
      name, 
      status: status !== undefined ? status : true,
      createdBy,
      updatedBy: createdBy
    });
    
    await salesPerson.save();
    res.status(201).json(salesPerson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSalesPersonsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required in URL params.' });
    }
    const salesPersons = await SalesPerson.find({ companyId }).sort({ code: 1 });
    res.status(200).json(salesPersons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateSalesPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, updatedBy } = req.body;
    
    if (!name || !updatedBy) {
      return res.status(400).json({ error: 'Name and updatedBy are required.' });
    }
    
    const updated = await SalesPerson.findByIdAndUpdate(
      id,
      { name, status, updatedBy },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Sales person not found.' });
    }
    
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteSalesPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SalesPerson.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Sales person not found.' });
    }
    
    res.status(200).json({ message: 'Sales person deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const toggleSalesPersonStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, updatedBy } = req.body;
    
    if (updatedBy === undefined) {
      return res.status(400).json({ error: 'updatedBy is required.' });
    }
    
    const updated = await SalesPerson.findByIdAndUpdate(
      id,
      { status, updatedBy },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Sales person not found.' });
    }
    
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSalesPerson,
  getSalesPersonsByCompany,
  updateSalesPerson,
  deleteSalesPerson,
  toggleSalesPersonStatus
};