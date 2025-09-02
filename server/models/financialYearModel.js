const mongoose = require("mongoose");
const financialYearSchema = new mongoose.Schema({
  yearId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    trim: true,
    required: true
  },
  companyId: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: String,
    trim: true,
    required: true
  },
  updatedBy: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted period display
financialYearSchema.virtual('period').get(function() {
  return `${this.startDate?.toISOString().split('T')[0] || ''} to ${this.endDate?.toISOString().split('T')[0] || ''}`;
});

// Keep the pre-save hook for isDefault logic
financialYearSchema.pre('save', async function(next) {
  if (this.isDefault) {
    try {
      await this.constructor.updateMany(
        { isDefault: true, companyId: this.companyId, _id: { $ne: this._id } },
        { $set: { isDefault: false } }
      );
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Update the index to be a compound index on yearId and companyId
financialYearSchema.index({ yearId: 1, companyId: 1 }, { unique: true });
financialYearSchema.index({ startDate: 1, endDate: 1 });
financialYearSchema.index({ isDefault: 1 });
financialYearSchema.index({ isActive: 1 });
financialYearSchema.index({ companyId: 1 });

const fy = mongoose.model("financialYearModel", financialYearSchema);
module.exports = fy;