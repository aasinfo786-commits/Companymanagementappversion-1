const mongoose = require('mongoose');

// Sub-schema for individual discount rates
const discountRateSchema = new mongoose.Schema({
  discountTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['percentage', 'quantity', 'flat'],
    default: 'percentage'
  },
  isEditable: {  // Add this field
    type: Boolean,
    default: false
  }
}, { _id: false });

// Main discount schema
const discountSchema = new mongoose.Schema({
  companyId: { 
    type: String, 
    required: true,
    index: true
  },
  debtorAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DebtorAccount',
    required: true,
    index: true
  },
  debtorAccountLevel4: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountLevel4',
    required: true,
    index: true
  },
  accountLevel4: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountLevel4',
    required: true,
    index: true
  },
  finishedGood: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinishedGoods',
    required: true,
    index: true
  },
  productCode: {
    type: String,
    required: true,
    index: true
  },
  accountCode: {
    type: String,
    required: true,
    index: true
  },
  subCode: {
    type: String,
    required: true,
    index: true
  },
  discountRates: {
    type: [discountRateSchema],
    required: true
  },
  applicableDate: {
    type: Date,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdBy: {
    type: String, // Changed from ObjectId to String
    required: true
  },
  updatedBy: {
    type: String, // Changed from ObjectId to String
    required: true
  },
  createdAt: { // Explicitly defined instead of using timestamps
    type: Date,
    default: Date.now,
    required: true
  },
  updatedAt: { // Explicitly defined instead of using timestamps
    type: Date,
    default: Date.now,
    required: true
  }
}, { 
  timestamps: false // Disabled automatic timestamps since we're defining them explicitly
});

// Update compound unique index
discountSchema.index(
  { 
    companyId: 1, 
    debtorAccount: 1,
    debtorAccountLevel4: 1,
    accountLevel4: 1,
    finishedGood: 1,
    applicableDate: 1 
  }, 
  { unique: true }
);

// Virtual for formatted date
discountSchema.virtual('formattedDate').get(function () {
  return this.applicableDate.toISOString().split('T')[0];
});

// Virtual for account details
discountSchema.virtual('accountDetails', {
  ref: 'AccountLevel4',
  localField: 'accountLevel4',
  foreignField: '_id',
  justOne: true
});

// Virtual for finished good details
discountSchema.virtual('finishedGoodDetails', {
  ref: 'FinishedGoods',
  localField: 'finishedGood',
  foreignField: '_id',
  justOne: true
});

// Virtual for debtor account details
discountSchema.virtual('debtorAccountDetails', {
  ref: 'DebtorAccount',
  localField: 'debtorAccount',
  foreignField: '_id',
  justOne: true
});

// Pre-save hook to update updatedAt
discountSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Enable virtuals in JSON and object outputs
discountSchema.set('toJSON', { virtuals: true });
discountSchema.set('toObject', { virtuals: true });

const Discount = mongoose.model('DiscountSetting', discountSchema);

module.exports = Discount;