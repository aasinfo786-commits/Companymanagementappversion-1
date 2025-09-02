const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  userFullName: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  userPicture: {
    type: String
  },
  isAllowed: {
    type: Boolean,
    default: true
  },
  companyId: {
    type: String,
    trim: true,
    required: false,
  },
  locationId: {
    type: String,
    trim: true,
    required: false,
  },
  financialYearId: {
    type: String,
    trim: true,
    required: false,
  },
  // Updated field for menu permissions with detailed access rights
  accessibleMenus: [{
    menuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      required: true
    },
    permissions: {
      view: {
        type: Boolean,
        default: true
      },
      add: {
        type: Boolean,
        default: false
      },
      edit: {
        type: Boolean,
        default: false
      },
      delete: {
        type: Boolean,
        default: false
      }
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    console.log('🔐 Pre-save hook triggered: hashing password...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ Password hashed successfully.');
    next();
  } catch (error) {
    console.error('❌ Error hashing password:', error.message);
    next(error);
  }
});

// Method to check if user has specific permission for a menu
userSchema.methods.hasMenuPermission = function(menuId, permission) {
  const menuAccess = this.accessibleMenus.find(access => 
    access.menuId.toString() === menuId.toString()
  );
  
  if (!menuAccess) return false;
  
  // For view permission, we check if the menu is accessible
  if (permission === 'view') {
    return true; // If menu is in accessibleMenus, view is granted by default
  }
  
  // For other permissions, check the specific flag
  return menuAccess.permissions[permission] === true;
};

// Method to get all permissions for a specific menu
userSchema.methods.getMenuPermissions = function(menuId) {
  const menuAccess = this.accessibleMenus.find(access => 
    access.menuId.toString() === menuId.toString()
  );
  
  if (!menuAccess) return null;
  
  return {
    view: true, // Always true if menu is accessible
    add: menuAccess.permissions.add,
    edit: menuAccess.permissions.edit,
    delete: menuAccess.permissions.delete
  };
};

module.exports = mongoose.model('User', userSchema);