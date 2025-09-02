const mongoose = require('mongoose');
const GovtTaxAccountSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: [true, 'Company ID is required'],
    trim: true
  },
  level1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountLevel1',
    required: [true, 'Level 1 account reference is required']
  },
  level2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountLevel2',
    required: [true, 'Level 2 account reference is required']
  },
  level3Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountLevel3',
    required: [true, 'Level 3 account reference is required']
  },
  level4Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountLevel4',
    required: [true, 'Level 4 account reference is required']
  },
  parentLevel1Code: {
    type: String,
    required: [true, 'Parent Level 1 code is required'],
    trim: true
  },
  parentLevel2Code: {
    type: String,
    required: [true, 'Parent Level 2 code is required'],
    trim: true
  },
  parentLevel3Code: {
    type: String,
    required: [true, 'Parent Level 3 code is required'],
    trim: true
  },
  level4Subcode: {
    type: String,
    required: [true, 'Level 4 subcode is required'],
    validate: {
      validator: function(v) {
        return /^\d{5}$/.test(v);
      },
      message: props => `${props.value} is not a valid 5-digit subcode!`
    },
    trim: true
  },
  fullcode: {
    type: String,
    required: [true, 'Full account code is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Account code is required'],
    trim: true
  },
  rate: {
    type: Number,
    required: [true, 'Tax rate is required'],
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String,
    required: [true, 'Created by user is required'],
    trim: true
  },
  updatedBy: {
    type: String,
    required: [true, 'Updated by user is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  autoIndex: false
});
// Pre-save hooks
GovtTaxAccountSchema.pre('save', function(next) {
  // Generate codes
  this.code = `${this.parentLevel1Code}${this.parentLevel2Code}${this.parentLevel3Code}`;
  this.fullcode = `${this.code}${this.level4Subcode}`;
  
  next();
});
// Ensure only one default tax account per company
GovtTaxAccountSchema.pre('save', async function(next) {
  if (this.isDefault) {
    try {
      await this.constructor.updateMany(
        { companyId: this.companyId, _id: { $ne: this._id } },
        { isDefault: false }
      );
    } catch (err) {
      return next(err);
    }
  }
  next();
});
// Virtuals
GovtTaxAccountSchema.virtual('formattedRate').get(function() {
  return `${this.rate}%`;
});
// Index definitions
const indexDefinitions = [
  {
    keys: { companyId: 1, fullcode: 1 },
    options: { unique: true, name: 'company_fullcode_unique' }
  },
  {
    keys: { companyId: 1, isActive: 1 },
    options: { name: 'company_active_index' }
  },
  {
    keys: { companyId: 1, isDefault: 1 },
    options: { name: 'company_default_index' }
  },
  {
    keys: { companyId: 1, level3Id: 1 },
    options: { name: 'company_level3_index' }
  },
  {
    keys: { level3Id: 1 },
    options: { name: 'level3_index' }
  },
  {
    keys: { level4Id: 1 },
    options: { name: 'level4_index' }
  }
];
const GovtTaxAccount = mongoose.model('GovtTaxAccount', GovtTaxAccountSchema);
// Index management function
async function manageIndexes() {
  try {
    const collection = GovtTaxAccount.collection;
    
    // Get existing indexes
    const existingIndexes = await collection.indexes();
    
    // Drop all non-_id indexes
    for (const index of existingIndexes) {
      if (index.name !== '_id_') {
        await collection.dropIndex(index.name);
      }
    }
    
    // Create new indexes
    for (const { keys, options } of indexDefinitions) {
      await collection.createIndex(keys, options);
    }
    
  } catch (err) {
    throw err;
  }
}
// Setup indexes when connected
mongoose.connection.on('connected', () => {
  manageIndexes().catch(err => {});
});
module.exports = GovtTaxAccount;