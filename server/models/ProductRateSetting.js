const mongoose = require('mongoose');

const productRateSchema = new mongoose.Schema({
  companyId: { 
    type: String, 
    required: true,
    index: true
  },
  finishedGood: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinishedGoods',
    required: true,
    index: true
  },
  accountLevel4: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountLevel4',
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
  rate: {
    type: Number,
    required: true,
    min: 0
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
  }
}, { 
  timestamps: true, // Automatically adds createdAt and updatedAt
  // Compound index to ensure unique rate per account and date
  indexes: [
    {
      unique: true,
      fields: ['companyId', 'accountLevel4', 'applicableDate']
    }
  ]
});

// Add virtual for formatted date
productRateSchema.virtual('formattedDate').get(function() {
  return this.applicableDate.toISOString().split('T')[0];
});

// Add virtual for account details
productRateSchema.virtual('accountDetails', {
  ref: 'AccountLevel4',
  localField: 'accountLevel4',
  foreignField: '_id',
  justOne: true
});

// Add virtual for finished good details
productRateSchema.virtual('finishedGoodDetails', {
  ref: 'FinishedGoods',
  localField: 'finishedGood',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included in toJSON output
productRateSchema.set('toJSON', { virtuals: true });
productRateSchema.set('toObject', { virtuals: true });

const ProductRate = mongoose.model('ProductRateSetting', productRateSchema);

module.exports = ProductRate;