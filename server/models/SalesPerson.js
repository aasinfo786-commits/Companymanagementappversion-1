// models/SalesPerson.js
const mongoose = require('mongoose');
const salesPersonSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Ensure unique combination of companyId and code
salesPersonSchema.index({ companyId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('SalesPerson', salesPersonSchema);