const mongoose = require('mongoose');
// Sub-schema for tax rate entries
const taxRateEntrySchema = new mongoose.Schema({
  taxTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'GovtTaxAccount'
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'formula','quantity'],
    default: 'percentage'
  },
  isEditable: {
    type: Boolean,
    default: false
  },
  transactionType: {
    type: String,
    enum: ['sale', 'purchase','none'],
    default: 'sale'
  },
  registeredValue: {
    type: Number,
    required: true,
    min: 0
  },
  unregisteredValue: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });
// Main tax rate setting schema
const taxRateSettingSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    index: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  accountLevel4Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountLevel4',
    required: true,
    index: true
  },
  itemCode: {
    type: String,
    required: true
  },
  accountCode: {
    type: String,
    required: true
  },
  taxRates: {
    type: [taxRateEntrySchema],
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one tax rate must be provided'
    }
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
    isExempted: { // Add this field
    type: Boolean,
    default: false
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
// Compound index for unique tax rate settings
taxRateSettingSchema.index({
  companyId: 1,
  itemId: 1,
  accountLevel4Id: 1,
  applicableDate: 1
}, { unique: true });
// Virtuals for populated data
taxRateSettingSchema.virtual('itemDetails', {
  ref: function() {
    return this.itemType === 'finishedGood' ? 'FinishedGoods' : 'RawMaterial';
  },
  localField: 'itemId',
  foreignField: '_id',
  justOne: true
});
taxRateSettingSchema.virtual('accountDetails', {
  ref: 'AccountLevel4',
  localField: 'accountLevel4Id',
  foreignField: '_id',
  justOne: true
});
// Pre-save hook to set codes
taxRateSettingSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Determine item type and get item details
      let item;
      let itemType;
      
      // Try to find in finished goods first
      item = await mongoose.model('FinishedGoods').findById(this.itemId);
      if (item) {
        itemType = 'finishedGood';
      } else {
        // If not found, try raw materials
        item = await mongoose.model('RawMaterial').findById(this.itemId);
        if (item) {
          itemType = 'rawMaterial';
        }
      }
      
      // Get account details
      const account = await mongoose.model('AccountLevel4').findById(this.accountLevel4Id);
      
      if (item) {
        this.itemCode = item.code;
      }
      if (account) {
        this.accountCode = account.fullcode || account.subcode;
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});
// Fixed: Changed model name from 'TaxRate' to 'TaxRateSetting'
const TaxRateSetting = mongoose.model('TaxRateSetting', taxRateSettingSchema);
module.exports = TaxRateSetting;