const mongoose = require('mongoose');
const AccountLevel4Schema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true
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
  level3Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountLevel3',
    required: true
  },
  parentLevel1Code: {
    type: String,
    required: true
  },
  parentLevel2Code: {
    type: String,
    required: true
  },
  parentLevel3Code: {
    type: String,
    required: true
  },
  subcode: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{5}$/.test(v);
      },
      message: props => `${props.value} is not a valid 5-digit code!`
    }
  },
  fullcode: {
    type: String,
    required: true
    // Removed the unique constraint here
  },
  code: {  // New field containing only parent codes
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50 // Updated to match frontend validation
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  createdBy: { type: String, required: true },
  updatedBy: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure fullcode uniqueness within the same company
AccountLevel4Schema.index(
  { companyId: 1, fullcode: 1 },
  { unique: true }
);

// Compound index to ensure code uniqueness within the same company and parent levels
AccountLevel4Schema.index(
  { companyId: 1, level1Id: 1, level2Id: 1, level3Id: 1, subcode: 1 },
  { unique: true }
);

// Update the updatedAt field before saving and generate fullcode and code
AccountLevel4Schema.pre('save', function (next) {
  this.updatedAt = Date.now();
  
  // Generate fullcode by concatenating all codes including subcode
  if (this.isNew || this.isModified('parentLevel1Code') || this.isModified('parentLevel2Code') || 
      this.isModified('parentLevel3Code') || this.isModified('subcode')) {
    this.fullcode = this.parentLevel1Code + this.parentLevel2Code + this.parentLevel3Code + this.subcode;
    
    // Generate code with only parent codes (without subcode)
    this.code = this.parentLevel1Code + this.parentLevel2Code + this.parentLevel3Code;
  }
  
  next();
});

// Static method to generate the parent codes combination
AccountLevel4Schema.statics.generateParentCode = function(parentLevel1Code, parentLevel2Code, parentLevel3Code) {
  return parentLevel1Code + parentLevel2Code + parentLevel3Code;
};

module.exports = mongoose.model('AccountLevel4', AccountLevel4Schema);