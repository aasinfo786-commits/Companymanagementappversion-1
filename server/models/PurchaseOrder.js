const mongoose = require('mongoose');
// Sub-schema for PO items
const poItemSchema = new mongoose.Schema({
  rawMaterialId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'RawMaterial'
  },
  rawMaterialCode: {
    type: String,
    required: true
  },
  rawMaterialLevel4Id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'AccountLevel4'
  },
  rawMaterialLevel4Code: {
    type: String,
    required: true
  },
  exclRate: {  // Changed from single rate to exclRate
    type: Number,
    required: true,
    min: 0
  },
  inclRate: {  // Added inclRate
    type: Number,
    required: true,
    min: 0
  },
  uom: {
    type: String,
    required: true,
    enum: ['kg', '40kg', '25kg', '20kg', '37.324kg', '1000kg', 'nos']
  },
  uomFactor: {  // New field for UOM factor
    type: String,
    required: true
  },
  bagRate: {  // Added bagRate
    type: Number,
    default: 0,
    min: 0
  },
  bagType: {  // Added bagType
    type: String,
    enum: ['pp bag a', 'pp bag b', 'jute bag', 'jute a', 'jute b', 'jute c', 'jute d', '']
  },
  paymentMode: {  // Updated with specific enum values
    type: String,
    enum: ['Cash', 'Cheque', 'Bank Transfer', 'DD', 'PO', '']
  },
  paymentTerm: {
    type: String
  },
  freightChargeBy: {  // Updated with specific enum values
    type: String,
    enum: ['Mill', 'Ex-Mill', '']
  },
  qualityParameters: {
    type: String
  },
  creditDays: {
    type: Number,
    default: 0,
    min: 0
  },
  bagsCriteria: {
    type: String,
    enum: ['our', 'party'],
    default: 'our'
  }
}, { _id: false });

// Main purchase order schema
const purchaseOrderSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    index: true
  },
  poNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  poDate: {
    type: Date,
    required: true,
    index: true
  },
  isCancelled: {
    type: Boolean,
    default: false,
    index: true
  },
  creditorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'CreditorAccount',
    index: true
  },
  creditorCode: {
    type: String,
    required: true
  },
  creditorLevel4Id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'AccountLevel4'
  },
  creditorLevel4Code: {
    type: String,
    required: true
  },
  brokerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BrokerAccount'
  },
  brokerCode: {
    type: String
  },
  brokerLevel4Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountLevel4'
  },
  brokerLevel4Code: {
    type: String
  },
  commissionType: {
    type: String,
    enum: ['weight', 'value', 'other'],
    default: 'weight'
  },
  commissionValue: {
    type: Number,
    default: 0,
    min: 0
  },
  items: {
    type: [poItemSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one item must be provided'
    }
  },
  totalType: {
    type: String,
    enum: ['bags', 'weight', 'truck'],
    default: 'bags'
  },
  totalBags: {
    type: Number,
    default: 0,
    min: 0
  },
  totalWeight: {
    type: Number,
    default: 0,
    min: 0
  },
  totalTruck: {
    type: Number,
    default: 0,
    min: 0
  },
  receivedBags: {
    type: Number,
    default: 0,
    min: 0
  },
  receivedWeight: {
    type: Number,
    default: 0,
    min: 0
  },
  receivedTruck: {
    type: Number,
    default: 0,
    min: 0
  },
  balanceBags: {
    type: Number,
    default: 0,
    min: 0
  },
  balanceWeight: {
    type: Number,
    default: 0,
    min: 0
  },
  balanceTruck: {
    type: Number,
    default: 0,
    min: 0
  },
  minQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  maxQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  remarks: {
    type: String
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

// Compound index for company and PO number
purchaseOrderSchema.index({ companyId: 1, poNumber: 1 }, { unique: true });

// Virtuals for populated data
purchaseOrderSchema.virtual('creditorDetails', {
  ref: 'CreditorAccount',
  localField: 'creditorId',
  foreignField: '_id',
  justOne: true
});

purchaseOrderSchema.virtual('creditorLevel4Details', {
  ref: 'AccountLevel4',
  localField: 'creditorLevel4Id',
  foreignField: '_id',
  justOne: true
});

purchaseOrderSchema.virtual('brokerDetails', {
  ref: 'BrokerAccount',
  localField: 'brokerId',
  foreignField: '_id',
  justOne: true
});

purchaseOrderSchema.virtual('brokerLevel4Details', {
  ref: 'AccountLevel4',
  localField: 'brokerLevel4Id',
  foreignField: '_id',
  justOne: true
});

purchaseOrderSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: 'username',
  justOne: true
});

// Virtual for item details
purchaseOrderSchema.virtual('itemDetails', {
  ref: 'RawMaterial',
  localField: 'items.rawMaterialId',
  foreignField: '_id'
});

// Method to populate all related data
purchaseOrderSchema.statics.populateAll = function(purchaseOrder) {
  return this.populate([
    { path: 'creditorDetails' },
    { path: 'creditorLevel4Details' },
    { path: 'brokerDetails' },
    { path: 'brokerLevel4Details' },
    { path: 'items.rawMaterialId', model: 'RawMaterial' },
    { path: 'items.rawMaterialLevel4Id', model: 'AccountLevel4' },
    { path: 'userDetails' }
  ]);
};

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
module.exports = PurchaseOrder;