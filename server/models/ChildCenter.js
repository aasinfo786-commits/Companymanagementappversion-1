const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const childCenterSchema = new Schema({
  companyId: {
    type: String,
    required: true
  },
  parentCenterId: {
    type: Schema.Types.ObjectId,
    ref: 'ParentCenter',
    required: true
  },
  parentCode: {
    type: String,
    required: true
  },
  childCode: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50 // Updated to match frontend requirement
  },
  startDate: {
    type: Date,
    required: true
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
  timestamps: true // This will automatically add createdAt and updatedAt fields
});

// Create a compound unique index on parentCenterId and childCode to ensure uniqueness within each parent center
childCenterSchema.index({ parentCenterId: 1, childCode: 1 }, { unique: true });

// Remove the unique index on companyId and childCode to allow the same child code in different parent centers
// childCenterSchema.index({ companyId: 1, childCode: 1 }, { unique: true }); // This line is removed

module.exports = mongoose.model('ChildCenter', childCenterSchema);