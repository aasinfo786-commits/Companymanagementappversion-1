const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    unique: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  address1: {
    type: String,
  },
  address2: {
    type: String,
  },
  provinceCode: {  // New field for storing province code
    type: String,
    required: true,
  },
  phone1: {
    type: String,
  },
  phone2: {
    type: String,
  },
  nationalTaxNumber: {
    type: String,
  },
  strn: {
    type: String,
  },
  fbrToken: {  // New field for FBR token
    type: String,
  },
  createdBy: {
    type: String,  // stored as plain string
    required: true,
  },
  updatedBy: {
    type: String,  // stored as plain string
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { 
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

// Pre-save hook to pad companyId to 2 digits (e.g., "1" => "01")
companySchema.pre("save", function (next) {
  if (this.companyId) {
    const numericId = parseInt(this.companyId, 10);
    if (!isNaN(numericId)) {
      this.companyId = String(numericId).padStart(2, "0");
    }
  }
  next();
});

// Virtual field for formatted timestamps
companySchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt ? this.createdAt.toLocaleString() : 'Not set';
});

companySchema.virtual('formattedUpdatedAt').get(function() {
  return this.updatedAt ? this.updatedAt.toLocaleString() : 'Not set';
});

// Ensure virtual fields are included in JSON output
companySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model("Company", companySchema);