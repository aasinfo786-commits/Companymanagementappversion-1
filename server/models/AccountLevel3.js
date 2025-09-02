const mongoose = require('mongoose');
const accountLevel3Schema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    match: /^\d{2}$/ // Matches your 2-digit companyId pattern
  },
  level1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountLevel1',
    required: true
  },
  level2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountLevel2',
    required: true
  },
  parentLevel1Code: {  // Stores Level1's code (e.g. "06")
    type: String,
    required: true,
    match: /^\d{2}$/
  },
  parentLevel2Code: {  // Stores Level2's code (e.g. "02")
    type: String,
    required: true,
    match: /^\d{2}$/
  },
  code: {  // Level3's own code (e.g. "001")
    type: String,
    required: true,
    match: /^\d{3}$/
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50 // Added validation for max 50 characters
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  createdBy: { type: String, required: true },
  updatedBy: { type: String, required: true },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure unique codes within same hierarchy
accountLevel3Schema.index(
  { companyId: 1, parentLevel1Code: 1, parentLevel2Code: 1, code: 1 },
  { unique: true }
);

// Pre-save hook to generate fullCode
accountLevel3Schema.pre('save', function(next) {
  this.fullCode = this.parentLevel1Code + this.parentLevel2Code + this.code;
  next();
});

// Virtual population for parent accounts
accountLevel3Schema.virtual('level1Details', {
  ref: 'AccountLevel1',
  localField: 'level1Id',
  foreignField: '_id',
  justOne: true
});

accountLevel3Schema.virtual('level2Details', {
  ref: 'AccountLevel2',
  localField: 'level2Id',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('AccountLevel3', accountLevel3Schema);