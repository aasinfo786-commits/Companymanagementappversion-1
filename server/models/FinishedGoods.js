const mongoose = require("mongoose");

const FinishedGoodsSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    trim: true
  },
  level1Id: {
    type: String,
    required: true,
    trim: true
  },
  level2Id: {
    type: String,
    required: true,
    trim: true
  },
  level3Id: {
    type: String,
    required: true,
    trim: true
  },
  level1Code: {
    type: String,
    trim: true
  },
  level2Code: {
    type: String,
    trim: true
  },
  level3Code: {
    type: String,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true
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
    required: true,
    trim: true
  },
  updatedBy: {
    type: String,
    required: true,
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
});
// Virtual field for title - derived from level3 account
FinishedGoodsSchema.virtual('title').get(function() {
  // This will be populated by the controller when needed
  return '';
});
// Ensure only one default finished good per company
FinishedGoodsSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { companyId: this.companyId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});
// Set toJSON and toObject options to include virtuals
FinishedGoodsSchema.set('toJSON', { virtuals: true });
FinishedGoodsSchema.set('toObject', { virtuals: true });

const FinishedGoods = mongoose.model('FinishedGoods', FinishedGoodsSchema);
module.exports = FinishedGoods;