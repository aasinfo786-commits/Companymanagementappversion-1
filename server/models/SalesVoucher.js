const mongoose = require('mongoose');
const discountBreakdownSchema = new mongoose.Schema({
  type: String,
  rate: Number,
  value: Number,
  isEdited: Boolean,
  originalValue: Number,
  discountTypeId: String
});
const taxBreakdownSchema = new mongoose.Schema({
  rate: Number,
  value: Number,
  isEdited: Boolean,
  originalValue: Number,
  taxTypeId: String,
  transactionType: String,
  registeredValue: Number,
  unregisteredValue: Number
});
const accountingEntrySchema = new mongoose.Schema({
  debit: Number,
  credit: Number
});
const salesVoucherSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true
  },
  goDownId: {
    type: String,
    required: true
  },
  goDownCode: {
    type: String,
    required: true
  },
  goDownAlphabet: {
    type: String
  },
  invoiceType: {
    type: String,
    required: true,
    enum: ['Sale Invoice','Tax Invoice', 'Retail Invoice', 'Export Invoice', 'Proforma Invoice']
  },
  invoiceNumber: {
    type: String,
    required: true  
  },
  invoiceDate: {
    type: Date,
    required: true
  },
  fbrInvoiceNumber: String,
  customerAddress: String,
  poNumber: String,
  poDate: Date,
  ogpNumber: String,
  ogpDate: Date,
  dcNumber: String,
  dcDate: Date,
  vehicleNumber: String,
  remarks: String,
  debtorAccount: {
    type: String,
    required: true
  },
  subAccount: {
    type: String,
    required: true
  },
  subAccountFullCode: {
    type: String
  },
  parentCenterId: String,
  parentCenterCode: String,
  childCenterId: String,
  childCenterCode: String,
  centerCode: String,
  finishedGoodId: String,
  finishedGoodCode: String,
  accountLevel4Id: String,
  accountLevel4FullCode: String,
  unitMeasurementId: String,
  unitMeasurementCode: String,
  items: [{
    productId: String,
    subAccountFullCode: String,
    productCode: String,
    quantity: Number,
    rate: Number,
    discount: Number,
    amount: Number,
    tax: Number,
    netAmount: Number,
    unitMeasurementId: String,
    unitMeasurementCode: String,
    discountBreakdown: [discountBreakdownSchema],
    taxBreakdown: [taxBreakdownSchema],
    rateInfo: {
      applicableDate: Date,
      isActive: Boolean,
      isFallbackRate: Boolean
    },
    hsCode: String // Added HS Code for each item
  }],
  totalAmount: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    default: 0
  },
  netAmountBeforeTax: {
    type: Number,
    default: 0
  },
  accountingEntries: [accountingEntrySchema],
  customerProfile: {
    customerType: String // 'registered' or 'un-registered'
  },
  isPosted: { // Added field to track posting status
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });
const SalesVoucher = mongoose.model('SalesVoucher', salesVoucherSchema);
module.exports = SalesVoucher;