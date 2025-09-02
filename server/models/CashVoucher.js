const mongoose = require('mongoose');

const voucherEntrySchema = new mongoose.Schema({
  level3Id: {
    type: String,
    required: true
  },
  level4Id: {
    type: String
  },
  
  parentCenterCode: {
    type: String,
    required: true
  },
  childCenterCode: {
    type: String
  },
  amount: { 
    type: Number, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['debit', 'credit'], 
    required: true 
  },
  description: { 
    type: String 
  },
  accountTitle: {
    type: String
  },
  subAccountTitle: {
    type: String
  },
  accountCode: {
    type: String
  },
  subAccountCode: {
    type: String
  },
  level3Title: {
    type: String
  },
  level4Title: {
    type: String
  },
  rate: {
    type: Number
  },
  percentage: {
    type: Number
  },
  isTaxAccount: {
    type: Boolean,
    default: false
  },
  taxAccountId: {
    type: String
  },
  parentLevel3Code: {
    type: String
  },
  level4Subcode: {
    type: String
  }
}, { _id: false });

const cashVoucherSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true
  },
  locationId: {
    type: String,
    required: true
  },
  financialYearId: {
    type: String,
    required: true
  },
  voucherType: {
    type: String,
    enum: ['receipt', 'payment'],
    required: true
  },
  voucherDate: {
    type: Date,
    required: true
  },
  voucherNumber: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  entries: [voucherEntrySchema]
});

// Essential indexes for query performance
cashVoucherSchema.index({ companyId: 1, voucherNumber: 1 });
cashVoucherSchema.index({ companyId: 1, locationId: 1, financialYearId: 1 });
cashVoucherSchema.index({ voucherDate: -1 });

const CashVoucher = mongoose.model('CashVoucher', cashVoucherSchema);

module.exports = CashVoucher;