// controllers/supplierProfileController.js
const SupplierProfile = require('../models/SupplierProfile');
const CreditorAccount = require('../models/CreditorAccount');
const AccountLevel4 = require('../models/AccountLevel4');
const Province = require('../models/Provinces');
const City = require('../models/Cities');
const AccountLevel3 = require('../models/AccountLevel3');

// Helper function for error responses
const errorResponse = (res, statusCode, message, error = null) => {
  const response = { error: message };
  if (error && process.env.NODE_ENV === 'development') {
    response.details = error.message;
    response.stack = error.stack;
  }
  return res.status(statusCode).json(response);
};

// Get creditor accounts
exports.getCreditorAccounts = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return errorResponse(res, 400, 'Company ID is required');
    }
    
    // Fetch creditor accounts
    const accounts = await CreditorAccount.find({ 
      companyId, 
      isActive: true 
    })
    .sort({ code: 1 })
    .lean();
    
    // Get all unique level3Ids from the accounts
    const level3Ids = [...new Set(accounts.map(account => account.level3Id))];
    
    // Fetch all level3 accounts for these IDs
    const level3Accounts = await AccountLevel3.find({ 
      _id: { $in: level3Ids } 
    }).lean();
    
    // Create a map of level3Id to title for quick lookup
    const level3TitleMap = {};
    level3Accounts.forEach(level3 => {
      level3TitleMap[level3._id.toString()] = level3.title;
    });
    
    // Process accounts to include title from level3
    const processedAccounts = accounts.map(account => {
      // Get title from level3 account
      const title = level3TitleMap[account.level3Id.toString()] || `Account ${account.code}`;
      
      return {
        _id: account._id.toString(),
        code: account.code || '',
        title: title,
        isDefault: account.isDefault || false
      };
    });
    
    res.json(processedAccounts);
  } catch (err) {
    errorResponse(res, 500, 'Failed to fetch creditor accounts', err);
  }
};

// Get default creditor account
exports.getDefaultCreditorAccount = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return errorResponse(res, 400, 'Company ID is required');
    }
    
    const account = await CreditorAccount.findOne({ 
      companyId,
      isActive: true,
      isDefault: true 
    }).lean();
    
    if (!account) {
      return errorResponse(res, 404, 'No default creditor account found');
    }
    
    // Get the title from AccountLevel3
    const level3Account = await AccountLevel3.findById(account.level3Id).lean();
    const title = level3Account ? level3Account.title : `Account ${account.code}`;
    
    res.json({ 
      defaultCreditorAccountId: account._id.toString(),
      code: account.code,
      title: title
    });
  } catch (err) {
    errorResponse(res, 500, 'Failed to fetch default creditor account', err);
  }
};

// Get account level 4s
exports.getAccountLevel4s = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { code } = req.query;
    
    if (!companyId) return errorResponse(res, 400, 'Company ID is required');
    if (!code) return errorResponse(res, 400, 'Parent account code is required');
    
    const accountLevel4s = await AccountLevel4.find({ 
      companyId,
      code
    })
    .sort({ subcode: 1 })
    .lean();
    
    const formattedAccounts = accountLevel4s.map(accountLevel4 => ({
      _id: accountLevel4._id.toString(),
      subcode: accountLevel4.subcode,
      title: accountLevel4.title,
      fullcode: accountLevel4.fullcode
    }));
    
    res.json(formattedAccounts);
  } catch (err) {
    errorResponse(res, 500, 'Failed to fetch account level 4s', err);
  }
};

// Get provinces
exports.getProvinces = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return errorResponse(res, 400, 'Company ID is required');
    }
    
    const provinces = await Province.find({ companyId })
      .sort({ code: 1 })
      .lean();
    
    const formattedProvinces = provinces.map(({ _id, code, title }) => ({
      _id: _id.toString(),
      code,
      title
    }));
    
    res.json(formattedProvinces);
  } catch (err) {
    errorResponse(res, 500, 'Failed to fetch provinces', err);
  }
};

// Get cities
exports.getCities = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { provinceId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }
    if (!provinceId) {
      return res.status(400).json({ error: 'Province ID is required' });
    }
    
    // Find cities with matching province code
    const cities = await City.find({ 
      companyId,
      provinceId: provinceId // Match the province code, not ID
    })
    .sort({ code: 1 })
    .lean();
    
    res.json(cities.map(city => ({
      _id: city._id.toString(),
      code: city.code,
      title: city.title,
      provinceId: city.provinceId
    })));
  } catch (err) {
    console.error('Error fetching cities:', err);
    res.status(500).json({ 
      error: 'Failed to fetch cities',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get supplier profile by account IDs - ENHANCED to include related data
exports.getSupplierProfileByAccount = async (req, res) => {
  try {
    const { companyId, creditorAccountId, accountLevel4Id } = req.params;
    
    if (!companyId || !creditorAccountId || !accountLevel4Id) {
      return errorResponse(res, 400, 'All parameters (companyId, creditorAccountId, accountLevel4Id) are required');
    }
    
    // Find the profile
    const profile = await SupplierProfile.findOne({
      companyId,
      creditorAccountId,
      accountLevel4Id
    }).lean();
    
    if (!profile) {
      return errorResponse(res, 404, 'Supplier profile not found');
    }
    
    // Fetch related data
    let province, city;
    
    if (profile.province) {
      province = await Province.findOne({ 
        companyId, 
        code: profile.province 
      }).lean();
    }
    
    if (profile.city) {
      city = await City.findOne({ 
        companyId, 
        code: profile.city 
      }).lean();
    }
    
    // Enhance the profile with related data
    const enhancedProfile = {
      ...profile,
      province: province ? {
        _id: province._id.toString(),
        code: province.code,
        title: province.title
      } : null,
      city: city ? {
        _id: city._id.toString(),
        code: city.code,
        title: city.title,
        provinceId: city.provinceId
      } : null
    };
    
    res.json(enhancedProfile);
  } catch (err) {
    errorResponse(res, 500, 'Failed to fetch supplier profile', err);
  }
};

// Create or update supplier profile - UPDATED to handle code values
exports.createOrUpdateSupplierProfile = async (req, res) => {
  try {
    const { companyId, creditorAccountId, accountLevel4Id, createdBy, updatedBy, ...profileData } = req.body;
    
    // Validate input
    if (!companyId || !creditorAccountId || !accountLevel4Id) {
      return errorResponse(res, 400, 'Company ID, creditor account ID and account level 4 ID are required');
    }
    
    if (!createdBy || createdBy.trim() === '') {
      return errorResponse(res, 400, 'Created by field is required');
    }
    
    if (!updatedBy || updatedBy.trim() === '') {
      return errorResponse(res, 400, 'Updated by field is required');
    }
    
    // Validate references in parallel
    const [creditorAccount, accountLevel4, province, city] = await Promise.all([
      CreditorAccount.findById(creditorAccountId),
      AccountLevel4.findById(accountLevel4Id),
      profileData.province ? Province.findOne({ companyId, code: profileData.province }) : Promise.resolve(null),
      profileData.city ? City.findOne({ companyId, code: profileData.city }) : Promise.resolve(null)
    ]);
    
    // Validate required references
    if (!creditorAccount) return errorResponse(res, 400, 'Invalid creditor account');
    if (!accountLevel4) return errorResponse(res, 400, 'Invalid account level 4');
    
    // Validate optional references if provided
    if (profileData.province && !province) return errorResponse(res, 400, 'Invalid province');
    if (profileData.city && !city) return errorResponse(res, 400, 'Invalid city');
    
    // Validate city belongs to province if both are provided
    if (city && province && city.provinceId !== province.code) {
      return errorResponse(res, 400, 'Selected city does not belong to the selected province');
    }
    
    // Prepare profile data
    const profileFields = {
      address: profileData.address || '',
      phoneNumber: profileData.phoneNumber || '',
      contactPerson: profileData.contactPerson || '',
      mobileNumber: profileData.mobileNumber || '',
      ntn: profileData.ntn || '',
      strn: profileData.strn || '',
      cnic: profileData.cnic || '',
      province: province?.code || profileData.province || '',
      city: city?.code || profileData.city || '',
      createdBy: createdBy.trim(),
      updatedBy: updatedBy.trim()
    };
    
    let supplierProfile;
    let isNew = false;
    
    // Check if this is an update or create operation
    if (req.params.id) {
      // Update existing profile
      supplierProfile = await SupplierProfile.findByIdAndUpdate(
        req.params.id,
        profileFields,
        { new: true, runValidators: true }
      );
      
      if (!supplierProfile) {
        return errorResponse(res, 404, 'Supplier profile not found');
      }
    } else {
      // Check if this exact combination already exists
      const existingProfile = await SupplierProfile.findOne({
        companyId,
        creditorAccountId,
        accountLevel4Id
      });
      
      if (existingProfile) {
        return errorResponse(res, 400, 'A profile with this creditor account and account level 4 combination already exists');
      }
      
      // Create new profile
      isNew = true;
      supplierProfile = new SupplierProfile({
        companyId,
        creditorAccountId,
        accountLevel4Id,
        code: creditorAccount.code,
        subcode: accountLevel4.subcode,
        ...profileFields
      });
      await supplierProfile.save();
    }
    
    // Fetch related data for the response
    let responseProvince, responseCity;
    
    if (supplierProfile.province) {
      responseProvince = await Province.findOne({ 
        companyId, 
        code: supplierProfile.province 
      }).lean();
    }
    
    if (supplierProfile.city) {
      responseCity = await City.findOne({ 
        companyId, 
        code: supplierProfile.city 
      }).lean();
    }
    
    // Enhance the profile with related data
    const enhancedProfile = {
      ...supplierProfile.toObject(),
      province: responseProvince ? {
        _id: responseProvince._id.toString(),
        code: responseProvince.code,
        title: responseProvince.title
      } : null,
      city: responseCity ? {
        _id: responseCity._id.toString(),
        code: responseCity.code,
        title: responseCity.title,
        provinceId: responseCity.provinceId
      } : null
    };
    
    res.status(isNew ? 201 : 200).json({
      success: true,
      message: isNew ? 'Supplier profile created' : 'Supplier profile updated',
      profile: enhancedProfile
    });
  } catch (err) {
    if (err.code === 11000) {
      return errorResponse(res, 409, 'A similar supplier profile already exists');
    }
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return errorResponse(res, 400, 'Validation failed', { details: errors });
    }
    
    errorResponse(res, 500, 'Failed to save supplier profile', err);
  }
};

// Get all supplier profiles
exports.getAllSupplierProfiles = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return errorResponse(res, 400, 'Company ID is required');
    }
    
    const profiles = await SupplierProfile.find({ companyId })
      .sort({ contactPerson: 1 })
      .populate('creditorAccountId', 'code title')
      .populate('accountLevel4Id', 'subcode title')
      .lean();
    
    res.json(profiles);
  } catch (err) {
    errorResponse(res, 500, 'Failed to fetch supplier profiles', err);
  }
};

// Get supplier profile by ID
exports.getSupplierProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 400, 'Profile ID is required');
    }
    
    const profile = await SupplierProfile.findById(id)
      .populate('creditorAccountId', 'code title')
      .populate('accountLevel4Id', 'subcode title')
      .lean();
    
    if (!profile) {
      return errorResponse(res, 404, 'Supplier profile not found');
    }
    
    res.json(profile);
  } catch (err) {
    errorResponse(res, 500, 'Failed to fetch supplier profile', err);
  }
};

// Create supplier profile
exports.createSupplierProfile = exports.createOrUpdateSupplierProfile;

// Update supplier profile
exports.updateSupplierProfile = exports.createOrUpdateSupplierProfile;