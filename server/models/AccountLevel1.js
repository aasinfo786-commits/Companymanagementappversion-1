const mongoose = require('mongoose');
const accountLevel1Schema = new mongoose.Schema({
  companyId: { type: String, required: true },
  code: {
    type: String,
    required: true,
    validate: {
      validator: v => /^\d{2}$/.test(v), // Ensures 2 digits
      message: props => `${props.value} is not valid. Must be 2 digits.`,
    },
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 50 // Added validation for max 50 characters
  },
  createdBy: { type: String, required: true },
  updatedBy: { type: String, required: true },
}, { timestamps: true });

// Ensure unique combination of companyId and code
accountLevel1Schema.index({ companyId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('AccountLevel1', accountLevel1Schema);