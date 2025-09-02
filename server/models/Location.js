import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  locationId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{2}$/.test(v); // Ensure 2-digit format
      },
      message: props => `${props.value} is not a valid location ID (must be 2 digits)`
    }
  },
  locationName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  character: { type: String },
  companyId: { type: String, required: true },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    required: false
  },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  isHO: { type: Boolean, default: false },
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// ✅ Ensure uniqueness of locationId per company
locationSchema.index({ companyId: 1, locationId: 1 }, { unique: true });

// Static method to generate the next locationId for a company
locationSchema.statics.generateLocationId = async function(companyId) {
  const count = await this.countDocuments({ companyId });
  return String(count + 1).padStart(2, '0');
};

// Pre-save hook to generate locationId if not manually provided
locationSchema.pre('save', async function(next) {
  if (!this.isNew || this.locationId) return next();
  try {
    this.locationId = await this.constructor.generateLocationId(this.companyId);
    next();
  } catch (err) {
    next(err);
  }
});

// Virtual field for formatted timestamps
locationSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt ? this.createdAt.toLocaleString() : 'Not set';
});

locationSchema.virtual('formattedUpdatedAt').get(function() {
  return this.updatedAt ? this.updatedAt.toLocaleString() : 'Not set';
});

// Ensure virtual fields are included in JSON output
locationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model("Location", locationSchema);