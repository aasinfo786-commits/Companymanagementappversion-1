const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Fix the import paths - since your script is in the server directory and models are in server/models
const Company = require('./models/Company');
const Location = require('./models/Location').default; // Access the default export
const financialYearModel = require('./models/financialYearModel');
const User = require('./models/User');

// Default values
const DEFAULT_COMPANY_ID = '99';
const DEFAULT_COMPANY_NAME = 'Default Company';
const DEFAULT_LOCATION_ID = '99';
const DEFAULT_FINANCIAL_YEAR_ID = '99';
const DEFAULT_USERNAME = 'AAS';
const DEFAULT_PASSWORD = 'abc@123'; // Updated password

// Connect to MongoDB - updated to remove deprecated options
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/companies_management');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Create default company
const createDefaultCompany = async () => {
  try {
    // Check if company already exists
    const existingCompany = await Company.findOne({ companyId: DEFAULT_COMPANY_ID });
    
    if (existingCompany) {
      console.log(`Company with ID ${DEFAULT_COMPANY_ID} already exists. Skipping creation.`);
      return existingCompany;
    }
    
    const company = new Company({
      companyId: DEFAULT_COMPANY_ID,
      companyName: DEFAULT_COMPANY_NAME,
      address1: 'Default Address 1',
      address2: 'Default Address 2',
      provinceCode: '01',
      phone1: '1234567890',
      phone2: '0987654321',
      nationalTaxNumber: '1234567890123',
      strn: '1234567890123',
      fbrToken: 'default_fbr_token',
      createdBy: 'system',
      updatedBy: 'system',
      isActive: true,
    });
    
    await company.save();
    console.log(`Default company created with ID: ${company.companyId}`);
    return company;
  } catch (error) {
    console.error('Error creating default company:', error);
    throw error;
  }
};

// Create default location
const createDefaultLocation = async (companyId) => {
  try {
    // Check if location already exists
    const existingLocation = await Location.findOne({ 
      companyId, 
      locationId: DEFAULT_LOCATION_ID 
    });
    
    if (existingLocation) {
      console.log(`Location with ID ${DEFAULT_LOCATION_ID} for company ${companyId} already exists. Skipping creation.`);
      return existingLocation;
    }
    
    const location = new Location({
      locationId: DEFAULT_LOCATION_ID,
      locationName: 'Default Location',
      address: 'Default Location Address',
      phone: '1234567890',
      character: 'DL',
      companyId,
      createdBy: 'system',
      updatedBy: 'system',
      isActive: true,
      isDefault: true,
      isHO: true,
    });
    
    await location.save();
    console.log(`Default location created with ID: ${location.locationId} for company ${companyId}`);
    return location;
  } catch (error) {
    console.error('Error creating default location:', error);
    throw error;
  }
};

// Create default financial year
const createDefaultFinancialYear = async (companyId) => {
  try {
    // Check if financial year already exists
    const existingFinancialYear = await financialYearModel.findOne({ 
      companyId, 
      yearId: DEFAULT_FINANCIAL_YEAR_ID 
    });
    
    if (existingFinancialYear) {
      console.log(`Financial year with ID ${DEFAULT_FINANCIAL_YEAR_ID} for company ${companyId} already exists. Skipping creation.`);
      return existingFinancialYear;
    }
    
    // Set default financial year dates (current year)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const startDate = new Date(currentYear, 3, 1); // April 1st of current year
    const endDate = new Date(currentYear + 1, 2, 31); // March 31st of next year
    
    const financialYear = new financialYearModel({
      yearId: DEFAULT_FINANCIAL_YEAR_ID,
      title: `Financial Year ${currentYear}-${currentYear + 1}`,
      companyId,
      isDefault: true,
      isActive: true,
      startDate,
      endDate,
      createdBy: 'system',
      updatedBy: 'system',
    });
    
    await financialYear.save();
    console.log(`Default financial year created with ID: ${financialYear.yearId} for company ${companyId}`);
    return financialYear;
  } catch (error) {
    console.error('Error creating default financial year:', error);
    throw error;
  }
};

// Create default user
const createDefaultUser = async (companyId, locationId, financialYearId) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username: DEFAULT_USERNAME });
    
    if (existingUser) {
      console.log(`User with username ${DEFAULT_USERNAME} already exists. Skipping creation.`);
      return existingUser;
    }
    
    // Remove the explicit hashing here since the pre-save hook in the model will handle it
    const user = new User({
      username: DEFAULT_USERNAME,
      userFullName: 'Default Admin User',
      role: 'admin',
      password: DEFAULT_PASSWORD, // Use the plain password here
      isAllowed: true,
      companyId,
      locationId,
      financialYearId,
    });
    
    await user.save();
    console.log(`Default user created with username: ${user.username}`);
    return user;
  } catch (error) {
    console.error('Error creating default user:', error);
    throw error;
  }
};

// Main function to create all default records
const createDefaults = async () => {
  try {
    console.log('Starting creation of default records...');
    
    // Create default company
    const company = await createDefaultCompany();
    
    // Create default location
    const location = await createDefaultLocation(company.companyId);
    
    // Create default financial year
    const financialYear = await createDefaultFinancialYear(company.companyId);
    
    // Create default user
    const user = await createDefaultUser(
      company.companyId, 
      location.locationId, 
      financialYear.yearId
    );
    
    console.log('\n✅ All default records created successfully!');
    console.log('Default credentials:');
    console.log(`- Company ID: ${company.companyId}`);
    console.log(`- Company Name: ${company.companyName}`);
    console.log(`- Location ID: ${location.locationId}`);
    console.log(`- Financial Year ID: ${financialYear.yearId}`);
    console.log(`- Username: ${user.username}`);
    console.log(`- Password: ${DEFAULT_PASSWORD}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating default records:', error);
    process.exit(1);
  }
};

// Run the script
const runScript = async () => {
  await connectDB();
  await createDefaults();
};

runScript();