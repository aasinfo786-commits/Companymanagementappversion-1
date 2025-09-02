const mongoose = require('mongoose');
const RawMaterialSchema = new mongoose.Schema({
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
// Ensure only one default raw material per company
RawMaterialSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { companyId: this.companyId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});
const RawMaterial = mongoose.model('RawMaterial', RawMaterialSchema);
module.exports = RawMaterial;