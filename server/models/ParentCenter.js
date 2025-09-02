const mongoose = require('mongoose');

const ParentCenterSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    trim: true
  },
  parentCode: {
    type: String,
    required: true // Ensure it's always set
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true,
    default: "System",
    trim: true
  },
  updatedBy: {
    type: String,
    required: true,
    default: "System",
    trim: true
  }
}, {
  timestamps: true
});

// ✅ Compound unique index: companyId + parentCode
ParentCenterSchema.index({ companyId: 1, parentCode: 1 }, { unique: true });

// Auto-generate parentCode per company
ParentCenterSchema.pre('validate', async function (next) {  // Change 'save' to 'validate'
  if (this.parentCode) return next();
  try {
    const lastParent = await this.constructor.findOne({ companyId: this.companyId })
      .sort({ parentCode: -1 })
      .select('parentCode')
      .lean();
    const nextNumber = lastParent && !isNaN(lastParent.parentCode)
      ? parseInt(lastParent.parentCode, 10) + 1
      : 1;
    this.parentCode = nextNumber.toString().padStart(2, '0');
    next();
  } catch (err) {
    next(new Error('Failed to generate parent code'));
  }
});

module.exports = mongoose.model('ParentCenter', ParentCenterSchema);
