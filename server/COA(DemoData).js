const mongoose = require('mongoose');
const AccountLevel1 = require('./models/AccountLevel1');
const AccountLevel2 = require('./models/AccountLevel2');
const AccountLevel3 = require('./models/AccountLevel3');
const AccountLevel4 = require('./models/AccountLevel4');

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

// Company ID for demo data
const COMPANY_ID = '01';
const CREATED_BY = 'demo_script';
const UPDATED_BY = 'demo_script';

// Demo data for Level 1 (Account Categories)
const level1Data = [
  { code: '01', description: 'Assets' },
  { code: '02', description: 'Liabilities' },
  { code: '03', description: 'Equity' },
  { code: '04', description: 'Revenue' },
  { code: '05', description: 'Expenses' },
  { code: '06', description: 'Cost of Goods Sold' },
  { code: '07', description: 'Other Income' },
  { code: '08', description: 'Other Expenses' }
];

// Demo data for Level 2 (Account Groups)
const level2Data = [
  // Assets
  { parentCode: '01', code: '01', title: 'Current Assets' },
  { parentCode: '01', code: '02', title: 'Non-Current Assets' },
  
  // Liabilities
  { parentCode: '02', code: '01', title: 'Current Liabilities' },
  { parentCode: '02', code: '02', title: 'Non-Current Liabilities' },
  
  // Equity
  { parentCode: '03', code: '01', title: 'Share Capital' },
  { parentCode: '03', code: '02', title: 'Retained Earnings' },
  
  // Revenue
  { parentCode: '04', code: '01', title: 'Sales Revenue' },
  { parentCode: '04', code: '02', title: 'Service Revenue' },
  
  // Expenses
  { parentCode: '05', code: '01', title: 'Operating Expenses' },
  { parentCode: '05', code: '02', title: 'Administrative Expenses' },
  
  // Cost of Goods Sold
  { parentCode: '06', code: '01', title: 'Direct Materials' },
  { parentCode: '06', code: '02', title: 'Direct Labor' },
  
  // Other Income
  { parentCode: '07', code: '01', title: 'Interest Income' },
  { parentCode: '07', code: '02', title: 'Dividend Income' },
  
  // Other Expenses
  { parentCode: '08', code: '01', title: 'Interest Expense' },
  { parentCode: '08', code: '02', title: 'Depreciation Expense' }
];

// Demo data for Level 3 (Account Sub-groups)
const level3Data = [
  // Current Assets
  { parentLevel1Code: '01', parentLevel2Code: '01', code: '001', title: 'Cash and Cash Equivalents', balance: 50000 },
  { parentLevel1Code: '01', parentLevel2Code: '01', code: '002', title: 'Accounts Receivable', balance: 75000 },
  { parentLevel1Code: '01', parentLevel2Code: '01', code: '003', title: 'Inventory', balance: 120000 },
  { parentLevel1Code: '01', parentLevel2Code: '01', code: '004', title: 'Prepaid Expenses', balance: 15000 },
  
  // Non-Current Assets
  { parentLevel1Code: '01', parentLevel2Code: '02', code: '001', title: 'Property, Plant and Equipment', balance: 500000 },
  { parentLevel1Code: '01', parentLevel2Code: '02', code: '002', title: 'Intangible Assets', balance: 100000 },
  { parentLevel1Code: '01', parentLevel2Code: '02', code: '003', title: 'Long-term Investments', balance: 200000 },
  
  // Current Liabilities
  { parentLevel1Code: '02', parentLevel2Code: '01', code: '001', title: 'Accounts Payable', balance: 60000 },
  { parentLevel1Code: '02', parentLevel2Code: '01', code: '002', title: 'Short-term Loans', balance: 40000 },
  { parentLevel1Code: '02', parentLevel2Code: '01', code: '003', title: 'Accrued Expenses', balance: 25000 },
  
  // Non-Current Liabilities
  { parentLevel1Code: '02', parentLevel2Code: '02', code: '001', title: 'Long-term Debt', balance: 300000 },
  { parentLevel1Code: '02', parentLevel2Code: '02', code: '002', title: 'Deferred Tax Liabilities', balance: 50000 },
  
  // Share Capital
  { parentLevel1Code: '03', parentLevel2Code: '01', code: '001', title: 'Common Stock', balance: 400000 },
  { parentLevel1Code: '03', parentLevel2Code: '01', code: '002', title: 'Additional Paid-in Capital', balance: 100000 },
  
  // Retained Earnings
  { parentLevel1Code: '03', parentLevel2Code: '02', code: '001', title: 'Beginning Retained Earnings', balance: 200000 },
  { parentLevel1Code: '03', parentLevel2Code: '02', code: '002', title: 'Current Year Earnings', balance: 80000 },
  
  // Sales Revenue
  { parentLevel1Code: '04', parentLevel2Code: '01', code: '001', title: 'Product Sales', balance: 0 },
  { parentLevel1Code: '04', parentLevel2Code: '01', code: '002', title: 'Sales Discounts', balance: 0 },
  
  // Service Revenue
  { parentLevel1Code: '04', parentLevel2Code: '02', code: '001', title: 'Consulting Services', balance: 0 },
  { parentLevel1Code: '04', parentLevel2Code: '02', code: '002', title: 'Maintenance Services', balance: 0 },
  
  // Operating Expenses
  { parentLevel1Code: '05', parentLevel2Code: '01', code: '001', title: 'Salaries and Wages', balance: 0 },
  { parentLevel1Code: '05', parentLevel2Code: '01', code: '002', title: 'Rent Expense', balance: 0 },
  { parentLevel1Code: '05', parentLevel2Code: '01', code: '003', title: 'Utilities Expense', balance: 0 },
  
  // Administrative Expenses
  { parentLevel1Code: '05', parentLevel2Code: '02', code: '001', title: 'Office Supplies', balance: 0 },
  { parentLevel1Code: '05', parentLevel2Code: '02', code: '002', title: 'Insurance Expense', balance: 0 },
  
  // Direct Materials
  { parentLevel1Code: '06', parentLevel2Code: '01', code: '001', title: 'Raw Materials', balance: 0 },
  { parentLevel1Code: '06', parentLevel2Code: '01', code: '002', title: 'Purchased Components', balance: 0 },
  
  // Direct Labor
  { parentLevel1Code: '06', parentLevel2Code: '02', code: '001', title: 'Production Wages', balance: 0 },
  { parentLevel1Code: '06', parentLevel2Code: '02', code: '002', title: 'Production Overtime', balance: 0 },
  
  // Interest Income
  { parentLevel1Code: '07', parentLevel2Code: '01', code: '001', title: 'Bank Interest', balance: 0 },
  { parentLevel1Code: '07', parentLevel2Code: '01', code: '002', title: 'Investment Interest', balance: 0 },
  
  // Dividend Income
  { parentLevel1Code: '07', parentLevel2Code: '02', code: '001', title: 'Stock Dividends', balance: 0 },
  { parentLevel1Code: '07', parentLevel2Code: '02', code: '002', title: 'Mutual Fund Dividends', balance: 0 },
  
  // Interest Expense
  { parentLevel1Code: '08', parentLevel2Code: '01', code: '001', title: 'Loan Interest', balance: 0 },
  { parentLevel1Code: '08', parentLevel2Code: '01', code: '002', title: 'Bond Interest', balance: 0 },
  
  // Depreciation Expense
  { parentLevel1Code: '08', parentLevel2Code: '02', code: '001', title: 'Building Depreciation', balance: 0 },
  { parentLevel1Code: '08', parentLevel2Code: '02', code: '002', title: 'Equipment Depreciation', balance: 0 }
];

// Demo data for Level 4 (Detailed Accounts)
const level4Data = [
  // Cash and Cash Equivalents
  { parentLevel1Code: '01', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00001', title: 'Cash in Hand', balance: 10000 },
  { parentLevel1Code: '01', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00002', title: 'Checking Account', balance: 25000 },
  { parentLevel1Code: '01', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00003', title: 'Savings Account', balance: 15000 },
  
  // Accounts Receivable
  { parentLevel1Code: '01', parentLevel2Code: '01', parentLevel3Code: '002', subcode: '00001', title: 'Trade Receivables', balance: 50000 },
  { parentLevel1Code: '01', parentLevel2Code: '01', parentLevel3Code: '002', subcode: '00002', title: 'Notes Receivable', balance: 15000 },
  { parentLevel1Code: '01', parentLevel2Code: '01', parentLevel3Code: '002', subcode: '00003', title: 'Interest Receivable', balance: 10000 },
  
  // Inventory
  { parentLevel1Code: '01', parentLevel2Code: '01', parentLevel3Code: '003', subcode: '00001', title: 'Raw Materials Inventory', balance: 40000 },
  { parentLevel1Code: '01', parentLevel2Code: '01', parentLevel3Code: '003', subcode: '00002', title: 'Work in Progress', balance: 35000 },
  { parentLevel1Code: '01', parentLevel2Code: '01', parentLevel3Code: '003', subcode: '00003', title: 'Finished Goods', balance: 45000 },
  
  // Property, Plant and Equipment
  { parentLevel1Code: '01', parentLevel2Code: '02', parentLevel3Code: '001', subcode: '00001', title: 'Land', balance: 150000 },
  { parentLevel1Code: '01', parentLevel2Code: '02', parentLevel3Code: '001', subcode: '00002', title: 'Buildings', balance: 250000 },
  { parentLevel1Code: '01', parentLevel2Code: '02', parentLevel3Code: '001', subcode: '00003', title: 'Machinery', balance: 100000 },
  
  // Accounts Payable
  { parentLevel1Code: '02', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00001', title: 'Trade Payables', balance: 35000 },
  { parentLevel1Code: '02', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00002', title: 'Notes Payable', balance: 15000 },
  { parentLevel1Code: '02', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00003', title: 'Accrued Salaries', balance: 10000 },
  
  // Common Stock
  { parentLevel1Code: '03', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00001', title: 'Common Stock - Par Value', balance: 300000 },
  { parentLevel1Code: '03', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00002', title: 'Additional Paid-in Capital', balance: 100000 },
  
  // Product Sales
  { parentLevel1Code: '04', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00001', title: 'Product A Sales', balance: 0 },
  { parentLevel1Code: '04', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00002', title: 'Product B Sales', balance: 0 },
  { parentLevel1Code: '04', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00003', title: 'Product C Sales', balance: 0 },
  
  // Salaries and Wages
  { parentLevel1Code: '05', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00001', title: 'Executive Salaries', balance: 0 },
  { parentLevel1Code: '05', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00002', title: 'Office Staff Salaries', balance: 0 },
  { parentLevel1Code: '05', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00003', title: 'Production Wages', balance: 0 },
  
  // Raw Materials
  { parentLevel1Code: '06', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00001', title: 'Material X', balance: 0 },
  { parentLevel1Code: '06', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00002', title: 'Material Y', balance: 0 },
  { parentLevel1Code: '06', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00003', title: 'Material Z', balance: 0 },
  
  // Bank Interest
  { parentLevel1Code: '07', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00001', title: 'Savings Account Interest', balance: 0 },
  { parentLevel1Code: '07', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00002', title: 'Fixed Deposit Interest', balance: 0 },
  
  // Loan Interest
  { parentLevel1Code: '08', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00001', title: 'Term Loan Interest', balance: 0 },
  { parentLevel1Code: '08', parentLevel2Code: '01', parentLevel3Code: '001', subcode: '00002', title: 'Working Capital Loan Interest', balance: 0 },
  
  // Building Depreciation
  { parentLevel1Code: '08', parentLevel2Code: '02', parentLevel3Code: '001', subcode: '00001', title: 'Office Building Depreciation', balance: 0 },
  { parentLevel1Code: '08', parentLevel2Code: '02', parentLevel3Code: '001', subcode: '00002', title: 'Factory Building Depreciation', balance: 0 }
];

// Function to insert Level 1 data
const insertLevel1Data = async () => {
  try {
    // Clear existing data for this company
    await AccountLevel1.deleteMany({ companyId: COMPANY_ID });
    
    // Prepare data for insertion
    const level1Documents = level1Data.map(item => ({
      companyId: COMPANY_ID,
      code: item.code,
      description: item.description,
      createdBy: CREATED_BY,
      updatedBy: UPDATED_BY
    }));
    
    // Insert data
    const result = await AccountLevel1.insertMany(level1Documents);
    console.log(`✅ Inserted ${result.length} Level 1 records`);
    return result;
  } catch (error) {
    console.error('Error inserting Level 1 data:', error);
    throw error;
  }
};

// Function to insert Level 2 data
const insertLevel2Data = async (level1Records) => {
  try {
    // Clear existing data for this company
    await AccountLevel2.deleteMany({ companyId: COMPANY_ID });
    
    // Create a map for quick lookup of Level1 records
    const level1Map = new Map();
    level1Records.forEach(record => {
      level1Map.set(record.code, record._id);
    });
    
    // Prepare data for insertion
    const level2Documents = level2Data.map(item => {
      const level1Id = level1Map.get(item.parentCode);
      if (!level1Id) {
        throw new Error(`Level1 record not found for code: ${item.parentCode}`);
      }
      
      return {
        companyId: COMPANY_ID,
        level1Id: level1Id,
        parentCode: item.parentCode,
        code: item.code,
        title: item.title,
        createdBy: CREATED_BY,
        updatedBy: UPDATED_BY
      };
    });
    
    // Insert data
    const result = await AccountLevel2.insertMany(level2Documents);
    console.log(`✅ Inserted ${result.length} Level 2 records`);
    return result;
  } catch (error) {
    console.error('Error inserting Level 2 data:', error);
    throw error;
  }
};

// Function to insert Level 3 data
const insertLevel3Data = async (level1Records, level2Records) => {
  try {
    // Clear existing data for this company
    await AccountLevel3.deleteMany({ companyId: COMPANY_ID });
    
    // Create maps for quick lookup
    const level1Map = new Map();
    level1Records.forEach(record => {
      level1Map.set(record.code, record._id);
    });
    
    const level2Map = new Map();
    level2Records.forEach(record => {
      const key = `${record.parentCode}-${record.code}`;
      level2Map.set(key, record._id);
    });
    
    // Prepare data for insertion
    const level3Documents = level3Data.map(item => {
      const level1Id = level1Map.get(item.parentLevel1Code);
      if (!level1Id) {
        throw new Error(`Level1 record not found for code: ${item.parentLevel1Code}`);
      }
      
      const level2Key = `${item.parentLevel1Code}-${item.parentLevel2Code}`;
      const level2Id = level2Map.get(level2Key);
      if (!level2Id) {
        throw new Error(`Level2 record not found for parent codes: ${level2Key}`);
      }
      
      return {
        companyId: COMPANY_ID,
        level1Id: level1Id,
        level2Id: level2Id,
        parentLevel1Code: item.parentLevel1Code,
        parentLevel2Code: item.parentLevel2Code,
        code: item.code,
        title: item.title,
        balance: item.balance,
        createdBy: CREATED_BY,
        updatedBy: UPDATED_BY
      };
    });
    
    // Insert data
    const result = await AccountLevel3.insertMany(level3Documents);
    console.log(`✅ Inserted ${result.length} Level 3 records`);
    return result;
  } catch (error) {
    console.error('Error inserting Level 3 data:', error);
    throw error;
  }
};

// Function to insert Level 4 data
const insertLevel4Data = async (level1Records, level2Records, level3Records) => {
  try {
    // Clear existing data for this company
    await AccountLevel4.deleteMany({ companyId: COMPANY_ID });
    
    // Create maps for quick lookup
    const level1Map = new Map();
    level1Records.forEach(record => {
      level1Map.set(record.code, record._id);
    });
    
    const level2Map = new Map();
    level2Records.forEach(record => {
      const key = `${record.parentCode}-${record.code}`;
      level2Map.set(key, record._id);
    });
    
    const level3Map = new Map();
    level3Records.forEach(record => {
      const key = `${record.parentLevel1Code}-${record.parentLevel2Code}-${record.code}`;
      level3Map.set(key, record._id);
    });
    
    // Prepare data for insertion
    const level4Documents = level4Data.map(item => {
      const level1Id = level1Map.get(item.parentLevel1Code);
      if (!level1Id) {
        throw new Error(`Level1 record not found for code: ${item.parentLevel1Code}`);
      }
      
      const level2Key = `${item.parentLevel1Code}-${item.parentLevel2Code}`;
      const level2Id = level2Map.get(level2Key);
      if (!level2Id) {
        throw new Error(`Level2 record not found for parent codes: ${level2Key}`);
      }
      
      const level3Key = `${item.parentLevel1Code}-${item.parentLevel2Code}-${item.parentLevel3Code}`;
      const level3Id = level3Map.get(level3Key);
      if (!level3Id) {
        throw new Error(`Level3 record not found for parent codes: ${level3Key}`);
      }
      
      // Generate code and fullcode manually (since pre-save hooks don't run with insertMany)
      const code = item.parentLevel1Code + item.parentLevel2Code + item.parentLevel3Code;
      const fullcode = code + item.subcode;
      
      return {
        companyId: COMPANY_ID,
        level1Id: level1Id,
        level2Id: level2Id,
        level3Id: level3Id,
        parentLevel1Code: item.parentLevel1Code,
        parentLevel2Code: item.parentLevel2Code,
        parentLevel3Code: item.parentLevel3Code,
        subcode: item.subcode,
        code: code, // Manually generated
        fullcode: fullcode, // Manually generated
        title: item.title,
        balance: item.balance,
        createdBy: CREATED_BY,
        updatedBy: UPDATED_BY
      };
    });
    
    // Insert data
    const result = await AccountLevel4.insertMany(level4Documents);
    console.log(`✅ Inserted ${result.length} Level 4 records`);
    return result;
  } catch (error) {
    console.error('Error inserting Level 4 data:', error);
    throw error;
  }
};

// Main function to insert all COA data
const insertAllCOAData = async () => {
  try {
    console.log('🔄 Starting insertion of COA demo data...\n');
    
    // Insert Level 1 data
    const level1Records = await insertLevel1Data();
    
    // Insert Level 2 data
    const level2Records = await insertLevel2Data(level1Records);
    
    // Insert Level 3 data
    const level3Records = await insertLevel3Data(level1Records, level2Records);
    
    // Insert Level 4 data
    const level4Records = await insertLevel4Data(level1Records, level2Records, level3Records);
    
    console.log('\n✅ All COA demo data inserted successfully!');
    console.log(`Summary:`);
    console.log(`- Level 1: ${level1Records.length} records`);
    console.log(`- Level 2: ${level2Records.length} records`);
    console.log(`- Level 3: ${level3Records.length} records`);
    console.log(`- Level 4: ${level4Records.length} records`);
    console.log(`- Total: ${level1Records.length + level2Records.length + level3Records.length + level4Records.length} records`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error inserting COA demo data:', error);
    process.exit(1);
  }
};

// Run the script
const runScript = async () => {
  await connectDB();
  await insertAllCOAData();
};

runScript();