// controllers/customerProfileController.js
const CustomerProfile = require('../models/CustomerProfile');
const DebtorAccount = require('../models/DebtorAccount');
const AccountLevel4 = require('../models/AccountLevel4');
const Province = require('../models/Provinces');
const City = require('../models/Cities');
const SalesPerson = require('../models/SalesPerson');
const AccountLevel3 = require('../models/AccountLevel3'); // Import AccountLevel3 model

// Get debtor accounts
exports.getDebtorAccounts = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Fetch debtor accounts
    const accounts = await DebtorAccount.find({ companyId, isActive: true })
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
    console.error('Error in getDebtorAccounts:', err);
    res.status(500).json({ 
      error: 'Failed to fetch debtor accounts',
      details: err.message 
    });
  }
};

// Get sub-accounts
exports.getSubAccounts = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Parent account code is required' });
    }
    
    // Fetch sub-accounts with explicit field selection
    const subAccounts = await AccountLevel4.find({ 
      companyId,
      code
    })
    .sort({ subcode: 1 })
    .lean();
    
    // Process sub-accounts to ensure title is available
    const processedSubAccounts = subAccounts.map(subAccount => {
      // Try different possible field names for the title
      let title = subAccount.title || subAccount.description || subAccount.name || subAccount.accountName;
      
      // If still no title, use the subcode as a fallback
      if (!title) {
        title = `Sub-Account ${subAccount.subcode}`;
      }
      
      return {
        _id: subAccount._id.toString(),
        subcode: subAccount.subcode || '',
        title: title,
        fullcode: subAccount.fullcode || ''
      };
    });
    
    res.json(processedSubAccounts);
  } catch (err) {
    console.error('Error in getSubAccounts:', err);
    res.status(500).json({ 
      error: 'Failed to fetch sub-accounts',
      details: err.message 
    });
  }
};

// Check if a customer profile exists for the given company, debtor account, and sub-account
exports.checkExistingProfile = async (req, res) => {
  try {
    const { companyId, debtorAccountId, subAccountId } = req.query;
    
    if (!companyId || !debtorAccountId || !subAccountId) {
      return res.status(400).json({ 
        error: 'Company ID, debtor account ID and sub-account ID are required' 
      });
    }
    
    // Find existing profile
    const existingProfile = await CustomerProfile.findOne({
      companyId,
      debtorAccountId,
      subAccountId
    }).lean();
    
    if (existingProfile) {
      // Fetch related data
      let province, city, salesPerson;
      
      if (existingProfile.province) {
        province = await Province.findOne({ 
          companyId, 
          code: existingProfile.province 
        }).lean();
      }
      
      if (existingProfile.city) {
        city = await City.findOne({ 
          companyId, 
          code: existingProfile.city 
        }).lean();
      }
      
      if (existingProfile.salesPerson) {
        salesPerson = await SalesPerson.findOne({ 
          companyId, 
          code: existingProfile.salesPerson 
        }).lean();
      }
      
      // Enhance the profile with related data
      const enhancedProfile = {
        ...existingProfile,
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
        } : null,
        salesPerson: salesPerson ? {
          _id: salesPerson._id.toString(),
          code: salesPerson.code,
          name: salesPerson.name
        } : null
      };
      
      return res.json({
        exists: true,
        profile: enhancedProfile
      });
    } else {
      return res.json({
        exists: false
      });
    }
  } catch (err) {
    console.error('Error checking existing profile:', err);
    res.status(500).json({ 
      error: 'Failed to check existing profile',
      details: err.message
    });
  }
};

// Get all customer profiles for a company
exports.getCustomerProfiles = async (req, res) => {
  try {
    const { companyId } = req.params;
    const profiles = await CustomerProfile.find({ companyId })
      .sort({ createdAt: -1 })
      .lean();
    
    // Enhance each profile with related data
    const enhancedProfiles = await Promise.all(profiles.map(async (profile) => {
      let province, city, salesPerson;
      
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
      
      if (profile.salesPerson) {
        salesPerson = await SalesPerson.findOne({ 
          companyId, 
          code: profile.salesPerson 
        }).lean();
      }
      
      return {
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
        } : null,
        salesPerson: salesPerson ? {
          _id: salesPerson._id.toString(),
          code: salesPerson.code,
          name: salesPerson.name
        } : null
      };
    }));
    
    res.json(enhancedProfiles);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch customer profiles',
      details: err.message 
    });
  }
};

// Get customer profile by companyId, debtorAccountId, and subAccountId
exports.getCustomerProfileByAccount = async (req, res) => {
  try {
    const { companyId, debtorAccountId, subAccountId } = req.params;
    
    // Validate parameters
    if (!companyId || !debtorAccountId || !subAccountId) {
      return res.status(400).json({ error: 'All parameters (companyId, debtorAccountId, subAccountId) are required' });
    }
    
    // Get the account references first to get their codes
    const [debtorAccount, subAccount] = await Promise.all([
      DebtorAccount.findById(debtorAccountId),
      AccountLevel4.findById(subAccountId)
    ]);
    
    if (!debtorAccount) {
      return res.status(404).json({ error: 'Debtor account not found' });
    }
    if (!subAccount) {
      return res.status(404).json({ error: 'Sub account not found' });
    }
    
    // Find the profile using the codes
    const profile = await CustomerProfile.findOne({
      companyId,
      code: debtorAccount.code,
      subcode: subAccount.subcode
    }).lean();
    
    if (!profile) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }
    
    // Fetch related data
    let province, city, salesPerson;
    
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
    
    if (profile.salesPerson) {
      salesPerson = await SalesPerson.findOne({ 
        companyId, 
        code: profile.salesPerson 
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
      } : null,
      salesPerson: salesPerson ? {
        _id: salesPerson._id.toString(),
        code: salesPerson.code,
        name: salesPerson.name
      } : null
    };
    
    res.json(enhancedProfile);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch customer profile',
      details: err.message
    });
  }
};

// controllers/customerProfileController.js
const createOrUpdateCustomerProfile = async (req, res) => {
  try {
    const { companyId, debtorAccountId, subAccountId, createdBy, updatedBy, ...profileData } = req.body;
    
    // Validate only truly required fields
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }
    if (!debtorAccountId) {
      return res.status(400).json({ error: 'Debtor account ID is required' });
    }
    if (!subAccountId) {
      return res.status(400).json({ error: 'Sub-account ID is required' });
    }
    if (!profileData.customerType) {
      return res.status(400).json({ error: 'Customer type is required' });
    }
    if (!createdBy || createdBy.trim() === '') {
      return res.status(400).json({ error: 'Created by field is required' });
    }
    if (!updatedBy || updatedBy.trim() === '') {
      return res.status(400).json({ error: 'Updated by field is required' });
    }
    
    // Only validate references if they are provided (not required)
    let debtorAccount, subAccount, province, city, salesPerson;
    
    try {
      [debtorAccount, subAccount] = await Promise.all([
        DebtorAccount.findById(debtorAccountId),
        AccountLevel4.findById(subAccountId)
      ]);
      
      if (!debtorAccount) throw new Error('Invalid debtor account');
      if (!subAccount) throw new Error('Invalid sub account');
      
      // Only validate optional references if they are provided - FIXED: use findOne with code instead of findById
      if (profileData.province) {
        province = await Province.findOne({ companyId, code: profileData.province });
        if (!province) throw new Error('Invalid province');
      }
      
      if (profileData.city) {
        city = await City.findOne({ companyId, code: profileData.city });
        if (!city) throw new Error('Invalid city');
      }
      
      if (profileData.salesPerson) {
        salesPerson = await SalesPerson.findOne({ companyId, code: profileData.salesPerson });
        if (!salesPerson) throw new Error('Invalid sales person');
      }
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
    
    // Validate city belongs to province only if both are provided
    if (city && province && city.provinceId !== province.code) {
      return res.status(400).json({ error: 'Selected city does not belong to the selected province' });
    }
    
    // Convert and validate numeric fields only if provided
    const rateChoice = profileData.rateChoice ? Number(profileData.rateChoice) : 0;
    const creditLimit = profileData.creditLimit ? Number(profileData.creditLimit) : 0;
    const creditDays = profileData.creditDays ? Number(profileData.creditDays) : 0;
    
    if (profileData.rateChoice && isNaN(rateChoice)) {
      return res.status(400).json({ error: 'Invalid rate choice value' });
    }
    if (profileData.creditLimit && isNaN(creditLimit)) {
      return res.status(400).json({ error: 'Invalid credit limit value' });
    }
    if (profileData.creditDays && isNaN(creditDays)) {
      return res.status(400).json({ error: 'Invalid credit days value' });
    }
    
    // Create or update profile data with all fields optional except required ones
    const profileDataObj = {
      companyId,
      debtorAccountId,
      subAccountId,
      code: debtorAccount?.code || profileData.code || '',
      subcode: subAccount?.subcode || profileData.subcode || '',
      customerType: profileData.customerType,
      updatedBy: updatedBy.trim()
    };
    
    // Add optional fields only if they exist
    if (profileData.address !== undefined) profileDataObj.address = profileData.address || '';
    if (profileData.phoneNumber !== undefined) profileDataObj.phoneNumber = profileData.phoneNumber || '';
    if (profileData.contactPerson !== undefined) profileDataObj.contactPerson = profileData.contactPerson || '';
    if (profileData.mobileNumber !== undefined) profileDataObj.mobileNumber = profileData.mobileNumber || '';
    if (profileData.ntn !== undefined) profileDataObj.ntn = profileData.ntn || '';
    if (profileData.strn !== undefined) profileDataObj.strn = profileData.strn || '';
    if (profileData.cnic !== undefined) profileDataObj.cnic = profileData.cnic || '';
    if (profileData.rateChoice !== undefined) profileDataObj.rateChoice = rateChoice;
    if (profileData.creditLimit !== undefined) profileDataObj.creditLimit = creditLimit;
    if (profileData.creditDays !== undefined) profileDataObj.creditDays = creditDays;
    // Use the code values directly for province, city, and salesPerson
    if (profileData.province !== undefined) profileDataObj.province = profileData.province || '';
    if (profileData.city !== undefined) profileDataObj.city = profileData.city || '';
    if (profileData.salesPerson !== undefined) profileDataObj.salesPerson = profileData.salesPerson || '';
    
    let customerProfile;
    
    // Check if this is an update or create operation
    if (req.params.id) {
      // Update existing profile
      customerProfile = await CustomerProfile.findByIdAndUpdate(
        req.params.id,
        profileDataObj,
        { new: true, runValidators: true }
      );
      
      if (!customerProfile) {
        return res.status(404).json({ error: 'Customer profile not found' });
      }
    } else {
      // Check if this exact combination already exists
      const existingProfile = await CustomerProfile.findOne({
        companyId,
        debtorAccountId,
        subAccountId
      });
      
      if (existingProfile) {
        return res.status(400).json({
          error: 'Customer profile already exists',
          details: 'A profile with this debtor account and sub-account combination already exists'
        });
      }
      
      // Create new profile
      profileDataObj.createdBy = createdBy.trim();
      customerProfile = new CustomerProfile(profileDataObj);
      await customerProfile.save();
    }
    
    // Fetch related data for the response
    let responseProvince, responseCity, responseSalesPerson;
    
    if (customerProfile.province) {
      responseProvince = await Province.findOne({ 
        companyId, 
        code: customerProfile.province 
      }).lean();
    }
    
    if (customerProfile.city) {
      responseCity = await City.findOne({ 
        companyId, 
        code: customerProfile.city 
      }).lean();
    }
    
    if (customerProfile.salesPerson) {
      responseSalesPerson = await SalesPerson.findOne({ 
        companyId, 
        code: customerProfile.salesPerson 
      }).lean();
    }
    
    // Enhance the profile with related data
    const enhancedProfile = {
      ...customerProfile.toObject(),
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
      } : null,
      salesPerson: responseSalesPerson ? {
        _id: responseSalesPerson._id.toString(),
        code: responseSalesPerson.code,
        name: responseSalesPerson.name
      } : null
    };
    
    res.status(req.params.id ? 200 : 201).json({
      success: true,
      message: req.params.id ? 'Customer profile updated successfully' : 'Customer profile created successfully',
      profile: enhancedProfile
    });
  } catch (err) {
    // Handle duplicate key error specifically
    if (err.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate profile',
        message: 'A similar customer profile already exists',
        details: err.message
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        error: 'Validation failed',
        message: messages.join(', ')
      });
    }
    
    // Handle other errors
    res.status(400).json({
      error: `Failed to ${req.params.id ? 'update' : 'create'} customer profile`,
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Create customer profile
exports.createCustomerProfile = createOrUpdateCustomerProfile;

// Update customer profile
exports.updateCustomerProfile = createOrUpdateCustomerProfile;

// Get provinces
exports.getProvinces = async (req, res) => {
  try {
    const { companyId } = req.params;
    const provinces = await Province.find({ companyId, status: true })
      .sort({ code: 1 })
      .lean();
    
    res.json(provinces.map(({ _id, code, title }) => ({
      _id: _id.toString(),
      code,
      title
    })));
  } catch (err) {
    console.error('Error in getProvinces:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get cities
exports.getCities = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { provinceId } = req.query;
    
    if (!provinceId) {
      return res.status(400).json({ error: 'Province ID is required' });
    }
    
    const cities = await City.find({ 
      companyId,
      provinceId
    }).sort({ code: 1 }).lean();
    
    res.json(cities.map(city => ({
      _id: city._id.toString(),
      code: city.code,
      title: city.title,
      provinceId: city.provinceId
    })));
  } catch (err) {
    console.error('Error in getCities:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get sales persons
exports.getSalesPersons = async (req, res) => {
  try {
    const { companyId } = req.params;
    const salesPersons = await SalesPerson.find({ companyId, status: true })
      .sort({ name: 1 })
      .lean();
    
    res.json(salesPersons.map(({ _id, code, name }) => ({
      _id: _id.toString(),
      code,
      name
    })));
  } catch (err) {
    console.error('Error in getSalesPersons:', err);
    res.status(500).json({ error: err.message });
  }
};