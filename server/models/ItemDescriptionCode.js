// models/ItemDescriptionCode.js
const mongoose = require('mongoose');
const ItemDescriptionCodeSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: [true, 'Company ID is required'],
    trim: true
  },
  hsCode: {
    type: String,
    required: [true, 'HS Code is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique HS codes per company
ItemDescriptionCodeSchema.index({ companyId: 1, hsCode: 1 }, { unique: true });

// Text index for search functionality
ItemDescriptionCodeSchema.index({ description: 'text' });

// Auto-update updatedAt before each save
ItemDescriptionCodeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const ItemDescriptionCode = mongoose.model('ItemDescriptionCode', ItemDescriptionCodeSchema);
module.exports = ItemDescriptionCode;