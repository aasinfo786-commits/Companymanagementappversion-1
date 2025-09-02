const mongoose = require('mongoose');
// Fix the import paths - since your script is in the server directory and models are in server/models
const Company = require('./models/Company');
const Location = require('./models/Location').default; // Access the default export
const financialYearModel = require('./models/financialYearModel');
const User = require('./models/User');

// Default values (must match the creation script)
const DEFAULT_COMPANY_ID = '99';
const DEFAULT_LOCATION_ID = '99';
const DEFAULT_FINANCIAL_YEAR_ID = '99';
const DEFAULT_USERNAME = 'AAS';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/companies_management');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Delete default user
const deleteDefaultUser = async () => {
  try {
    const result = await User.deleteOne({ username: DEFAULT_USERNAME });
    
    if (result.deletedCount > 0) {
      console.log(`✅ Deleted default user: ${DEFAULT_USERNAME}`);
    } else {
      console.log(`ℹ️ Default user not found: ${DEFAULT_USERNAME}`);
    }
    return result;
  } catch (error) {
    console.error('Error deleting default user:', error);
    throw error;
  }
};

// Delete default financial year
const deleteDefaultFinancialYear = async () => {
  try {
    const result = await financialYearModel.deleteOne({ 
      companyId: DEFAULT_COMPANY_ID,
      yearId: DEFAULT_FINANCIAL_YEAR_ID 
    });
    
    if (result.deletedCount > 0) {
      console.log(`✅ Deleted default financial year: ${DEFAULT_FINANCIAL_YEAR_ID}`);
    } else {
      console.log(`ℹ️ Default financial year not found: ${DEFAULT_FINANCIAL_YEAR_ID}`);
    }
    return result;
  } catch (error) {
    console.error('Error deleting default financial year:', error);
    throw error;
  }
};

// Delete default location
const deleteDefaultLocation = async () => {
  try {
    const result = await Location.deleteOne({ 
      companyId: DEFAULT_COMPANY_ID,
      locationId: DEFAULT_LOCATION_ID 
    });
    
    if (result.deletedCount > 0) {
      console.log(`✅ Deleted default location: ${DEFAULT_LOCATION_ID}`);
    } else {
      console.log(`ℹ️ Default location not found: ${DEFAULT_LOCATION_ID}`);
    }
    return result;
  } catch (error) {
    console.error('Error deleting default location:', error);
    throw error;
  }
};

// Delete default company
const deleteDefaultCompany = async () => {
  try {
    const result = await Company.deleteOne({ companyId: DEFAULT_COMPANY_ID });
    
    if (result.deletedCount > 0) {
      console.log(`✅ Deleted default company: ${DEFAULT_COMPANY_ID}`);
    } else {
      console.log(`ℹ️ Default company not found: ${DEFAULT_COMPANY_ID}`);
    }
    return result;
  } catch (error) {
    console.error('Error deleting default company:', error);
    throw error;
  }
};

// Main function to delete all default records
const deleteDefaults = async () => {
  try {
    console.log('🗑️ Starting deletion of default developer records...\n');
    
    // Delete in reverse order of creation to avoid dependency issues
    await deleteDefaultUser();
    await deleteDefaultFinancialYear();
    await deleteDefaultLocation();
    await deleteDefaultCompany();
    
    console.log('\n✅ All default developer records deleted successfully!');
    console.log('Deleted records:');
    console.log(`- User: ${DEFAULT_USERNAME}`);
    console.log(`- Financial Year: ${DEFAULT_FINANCIAL_YEAR_ID}`);
    console.log(`- Location: ${DEFAULT_LOCATION_ID}`);
    console.log(`- Company: ${DEFAULT_COMPANY_ID}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error deleting default records:', error);
    process.exit(1);
  }
};

// Run the script
const runScript = async () => {
  await connectDB();
  await deleteDefaults();
};

runScript();