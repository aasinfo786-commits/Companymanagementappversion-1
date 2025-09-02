import mongoose from 'mongoose';

const itemProfileSchema = new mongoose.Schema({
  companyId: { 
    type: String, 
    required: true,
    index: true
  },
  finishedGood: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinishedGoods',
    required: true
  },
  accountLevel4: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountLevel4',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  level1Title: {
    type: String,
    default: ''
  },
  level2Title: {
    type: String,
    default: ''
  },
  level3Title: {
    type: String,
    default: ''
  },
  productCode: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  subcode: {
    type: String,
    required: true
  },
  unitMeasurement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UnitMeasurement'
  },
  unitCode: {
    type: String,
    default: ''
  },
  salesTaxRate: {
    type: Number,
    default: 0
  },
  extraTaxRate: {
    type: Number,
    default: 0
  },
  furtherTaxRate: {
    type: Number,
    default: 0
  },
  fedPercentage: {
    type: Number,
    default: 0
  },
  isExempted: {
    type: Boolean,
    default: false
  },
  hsCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ItemDescriptionCode'
  },
  hsCodeValue: {
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add unique compound index to prevent duplicates
itemProfileSchema.index(
  { companyId: 1, finishedGood: 1, accountLevel4: 1 },
  { unique: true }
);

const ItemProfile = mongoose.model('ItemProfile', itemProfileSchema);

export default ItemProfile;