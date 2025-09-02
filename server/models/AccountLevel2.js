const mongoose = require('mongoose');
const accountLevel2Schema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true
  },
  level1Id: {
    type: String,
    required: true
  },
  parentCode: {
    type: String,
    required: true // Stores the Level 1 'code'
  },
  code: {
    type: String,
    required: true,
    match: /^\d{2}$/  // Only 2-digit codes allowed
  },
  title: {
    type: String,
    required: true,
    maxlength: 50 // Added validation for max 50 characters
  },
  createdBy: { type: String, required: true },
  updatedBy: { type: String, required: true },
}, { timestamps: true });

// Ensure unique combination of companyId, level1Id, and code
accountLevel2Schema.index({ companyId: 1, level1Id: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('AccountLevel2', accountLevel2Schema);