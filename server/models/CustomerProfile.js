// models/CustomerProfile.js
const mongoose = require('mongoose');

const customerProfileSchema = new mongoose.Schema({
  companyId: { 
    type: String, 
    required: true,
    index: true
  },
  
  // Account references (now with both IDs and codes)
  debtorAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DebtorAccount',
    index: true
  },
  subAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountLevel4',
    index: true
  },
  code: { 
    type: String, 
    index: true,
    default: '' 
  },
  subcode: { 
    type: String, 
    index: true,
    default: '' 
  },
  
  // Customer information (all optional)
  address: { 
    type: String,
    default: '' 
  },
  phoneNumber: { 
    type: String,
    default: '' 
  },
  contactPerson: { 
    type: String,
    default: '' 
  },
  mobileNumber: { 
    type: String,
    default: '' 
  },
  
  // Customer Type
  customerType: {
    type: String,
    enum: ['registered', 'un-registered', 'retailer', 'distributer', 'exempt'],
    default: ''
  },
  
  // Tax information (all optional)
  ntn: { 
    type: String,
    default: '' 
  },
  strn: { 
    type: String,
    default: '' 
  },
  cnic: { 
    type: String,
    default: ''
  },
  
  // Financial information (all optional)
  rateChoice: { 
    type: Number, 
    min: 0,
    default: 0 
  },
  creditLimit: { 
    type: Number, 
    min: 0,
    default: 0 
  },
  creditDays: { 
    type: Number, 
    min: 0,
    default: 0 
  },
  
  // Location information (all optional)
  province: { 
    type: String,
    default: '' 
  },
  city: { 
    type: String,
    default: '' 
  },
  salesPerson: { 
    type: String,
    default: '' 
  },
  
  // User tracking fields
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
  autoIndex: true,
  // Convert null/undefined to appropriate defaults when converting to object/JSON
  toObject: {
    transform: function(doc, ret) {
      Object.keys(ret).forEach(key => {
        if (ret[key] === null || ret[key] === undefined) {
          ret[key] = (customerProfileSchema.paths[key]?.instance === 'Number') ? 0 : '';
        }
      });
      return ret;
    }
  },
  toJSON: {
    transform: function(doc, ret) {
      Object.keys(ret).forEach(key => {
        if (ret[key] === null || ret[key] === undefined) {
          ret[key] = (customerProfileSchema.paths[key]?.instance === 'Number') ? 0 : '';
        }
      });
      return ret;
    }
  }
});

// Middleware to convert null/undefined values to appropriate defaults before saving
customerProfileSchema.pre('save', function(next) {
  const schemaPaths = customerProfileSchema.paths;
  
  Object.keys(schemaPaths).forEach(path => {
    if (this[path] === null || this[path] === undefined) {
      this[path] = (schemaPaths[path].instance === 'Number') ? 0 : '';
    }
  });
  
  next();
});

// Middleware to populate code and subcode from references if not provided
customerProfileSchema.pre('save', async function(next) {
  if (this.debtorAccountId && !this.code) {
    const debtorAccount = await mongoose.model('DebtorAccount').findById(this.debtorAccountId);
    if (debtorAccount) {
      this.code = debtorAccount.code;
    }
  }
  
  if (this.subAccountId && !this.subcode) {
    const subAccount = await mongoose.model('AccountLevel4').findById(this.subAccountId);
    if (subAccount) {
      this.subcode = subAccount.subcode;
    }
  }
  
  next();
});

// Updated compound index
customerProfileSchema.index(
  { 
    companyId: 1,
    debtorAccountId: 1,
    subAccountId: 1
  }, 
  { 
    unique: true
  }
);

const CustomerProfile = mongoose.model('CustomerProfile', customerProfileSchema);

module.exports = CustomerProfile;