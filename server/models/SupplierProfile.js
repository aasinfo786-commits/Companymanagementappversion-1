// models/SupplierProfile.js
const mongoose = require('mongoose');
const supplierProfileSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
  },
  creditorAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'CreditorAccount'
  },
  accountLevel4Id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'AccountLevel4'
  },
  code: {
    type: String,
    required: true
  },
  subcode: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  contactPerson: {
    type: String,
    default: ''
  },
  mobileNumber: {
    type: String,
    default: ''
  },
  ntn: {
    type: String,
    default: ''
  },
  strn: {
    type: String,
    default: ''
  },
  cnic: {
    type: String,
    default: ''
  },
  province: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create a compound index to ensure uniqueness per company
supplierProfileSchema.index({ companyId: 1, code: 1, subcode: 1 }, { unique: true });

module.exports = mongoose.model('SupplierProfile', supplierProfileSchema);