const CashVoucher = require('../models/CashVoucher');
const AccountLevel3 = require('../models/AccountLevel3');
const AccountLevel4 = require('../models/AccountLevel4');
const CashAccount = require('../models/CashAccount');
const GovtTaxAccount = require('../models/GovtTaxAccount');
const mongoose = require('mongoose');

// Counter model for auto-incrementing voucher numbers
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', counterSchema);

// Helper function to extract display number from full voucher number
function getDisplayVoucherNumber(fullNumber) {
  if (!fullNumber) return '';
  const parts = fullNumber.split('-');
  return `${parts[0]}-${parts[parts.length - 1]}`;
}

// Get the current voucher number without incrementing
async function getCurrentVoucherNumber(companyId, locationId, financialYearId, voucherType) {
  const typePrefix = voucherType === 'receipt' ? 'CR' : 'CP';
  const counterId = `${typePrefix}-${companyId.toString().padStart(2, '0')}${locationId.toString().padStart(2, '0')}${financialYearId.toString().padStart(2, '0')}`;

  try {
    const counter = await Counter.findById(counterId);
    return counter ? counter.seq : 0;
  } catch (error) {
    console.error('Error in getCurrentVoucherNumber:', error);
    throw error;
  }
}

// Generate next voucher number with counter
async function getNextVoucherNumber(companyId, locationId, financialYearId, voucherType) {
  const typePrefix = voucherType === 'receipt' ? 'CR' : 'CP';
  const counterId = `${typePrefix}-${companyId.toString().padStart(2, '0')}${locationId.toString().padStart(2, '0')}${financialYearId.toString().padStart(2, '0')}`;

  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: counterId },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const fullNumber = `${counterId}-${counter.seq.toString().padStart(4, '0')}`;
    const displayNumber = getDisplayVoucherNumber(fullNumber);
    
    return {
      fullNumber,
      displayNumber
    };
  } catch (error) {
    console.error('Error in getNextVoucherNumber:', error);
    throw error;
  }
}

// Updated getAllVouchers function with enhanced filtering and navigation counts
exports.getAllVouchers = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { 
      type, 
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Base query
    const query = { companyId: companyId };

    // Add type filter if provided
    if (type && ['receipt', 'payment'].includes(type)) {
      query.voucherType = type;
    }

    // Add search filter if provided
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { voucherNumber: searchRegex },
        { description: searchRegex },
        { 'entries.accountTitle': searchRegex },
        { 'entries.subAccountTitle': searchRegex },
        { 'entries.level3Title': searchRegex },
        { 'entries.level4Title': searchRegex },
        { 'entries.parentCenterCode': searchRegex }, // Add new field
        { 'entries.childCenterCode': searchRegex }   // Add new field
      ];
    }

    // Get total count for pagination
    const total = await CashVoucher.countDocuments(query);

    // Get counts for each voucher type for navigation
    const receiptCount = await CashVoucher.countDocuments({ 
      companyId,
      voucherType: 'receipt'
    });
    const paymentCount = await CashVoucher.countDocuments({ 
      companyId,
      voucherType: 'payment'
    });

    // Get paginated results
    let vouchers = [];
    try {
      vouchers = await CashVoucher.find(query)
        .sort({ voucherDate: -1, voucherNumber: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean();
    } catch (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    // Format the response
    const formattedVouchers = vouchers.map(voucher => {
      // Ensure entries exists and is an array
      const entries = Array.isArray(voucher.entries) ? voucher.entries : [];
      
      return {
        ...voucher,
        id: voucher._id,
        _id: undefined, // Remove MongoDB _id if not needed
        voucherNumber: getDisplayVoucherNumber(voucher.voucherNumber),
        voucherDate: formatDateForDisplay(voucher.voucherDate),
        totalAmount: voucher.amount || 0,
        summary: {
          debitTotal: entries
            .filter(e => e.type === 'debit')
            .reduce((sum, e) => sum + (e.amount || 0), 0),
          creditTotal: entries
            .filter(e => e.type === 'credit')
            .reduce((sum, e) => sum + (e.amount || 0), 0),
          mainAccount: entries.find(e => e.isGrossAmount)?.accountTitle || 
                      entries.find(e => e.type === 'credit')?.accountTitle || '',
          cashAccount: entries.find(e => 
            e.type === (voucher.voucherType === 'receipt' ? 'debit' : 'credit')
          )?.accountTitle || ''
        }
      };
    });

    res.json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      vouchers: formattedVouchers,
      counts: {
        receipt: receiptCount,
        payment: paymentCount,
        all: receiptCount + paymentCount
      }
    });

  } catch (error) {
    console.error('Error getting all vouchers:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get vouchers',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Updated getVouchers function with enhanced filtering
exports.getVouchers = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { 
      locationId,
      financialYearId,
      voucherType,
      page = 1, 
      limit = 20 
    } = req.query;

    const query = { companyId };
    
    if (locationId) {
      query.locationId = locationId;
    }
    
    if (financialYearId) {
      query.financialYearId = financialYearId;
    }

    if (voucherType) {
      query.voucherType = voucherType;
    }

    // Get counts for navigation
    const receiptCount = await CashVoucher.countDocuments({ 
      companyId,
      locationId,
      financialYearId,
      voucherType: 'receipt'
    });
    const paymentCount = await CashVoucher.countDocuments({ 
      companyId,
      locationId,
      financialYearId,
      voucherType: 'payment'
    });

    const vouchers = await CashVoucher.find(query)
      .sort({ voucherDate: -1, voucherNumber: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Format voucher numbers for display
    const formattedVouchers = vouchers.map(voucher => ({
      ...voucher,
      id: voucher._id,
      voucherNumber: getDisplayVoucherNumber(voucher.voucherNumber),
      voucherDate: formatDateForDisplay(voucher.voucherDate),
      entries: Array.isArray(voucher.entries) ? voucher.entries.map(entry => ({
        ...entry,
        formattedAmount: formatCurrency(entry.amount || 0)
      })) : []
    }));

    const total = await CashVoucher.countDocuments(query);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      vouchers: formattedVouchers,
      counts: {
        receipt: receiptCount,
        payment: paymentCount,
        all: receiptCount + paymentCount
      }
    });
  } catch (error) {
    console.error('Error getting vouchers:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get vouchers',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to format date for display
function formatDateForDisplay(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

// Get voucher details by ID
exports.getVoucherDetails = async (req, res) => {
  try {
    const { companyId, voucherId } = req.params;

    // First try to find by voucherNumber if it looks like a voucher number
    if (/^[CP|CR]/.test(voucherId)) {
      const voucher = await CashVoucher.findOne({
        voucherNumber: voucherId,
        companyId
      }).lean();

      if (voucher) {
        return formatAndSendVoucher(res, voucher);
      }
    }

    // Then try as ObjectId if it's a valid format
    if (mongoose.Types.ObjectId.isValid(voucherId)) {
      const voucher = await CashVoucher.findOne({
        _id: voucherId,
        companyId
      }).lean();

      if (voucher) {
        return formatAndSendVoucher(res, voucher);
      }
    }

    return res.status(404).json({ error: 'Voucher not found' });

  } catch (error) {
    console.error('Error getting voucher details:', error);
    res.status(500).json({ 
      error: 'Failed to get voucher details',
      details: error.message 
    });
  }
};

// Helper function to format and send voucher response
// Update formatAndSendVoucher helper function to include codes
function formatAndSendVoucher(res, voucher) {
  const entries = Array.isArray(voucher.entries) ? voucher.entries : [];
  
  const formattedVoucher = {
    ...voucher,
    id: voucher._id,
    voucherNumber: getDisplayVoucherNumber(voucher.voucherNumber),
    voucherDate: formatDateForDisplay(voucher.voucherDate),
    entries: entries.map(entry => ({
      ...entry,
      formattedAmount: formatCurrency(entry.amount || 0),
      isTax: entry.isTaxAccount || false,
      parentCenterCode: entry.parentCenterCode, // Include in response
      childCenterCode: entry.childCenterCode    // Include in response
    })),
    totals: {
      debit: entries
        .filter(e => e.type === 'debit')
        .reduce((sum, e) => sum + (e.amount || 0), 0),
      credit: entries
        .filter(e => e.type === 'credit')
        .reduce((sum, e) => sum + (e.amount || 0), 0)
    }
  };

  return res.json(formattedVoucher);
}


// Format currency for display
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 2
  }).format(amount);
}

// Get AccountLevel3 options for debit portion (filtered by CashAccount)
exports.getDebitAccountLevel3Options = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const cashAccounts = await CashAccount.find({ companyId })
      .distinct('level3Id')
      .lean();

    const accounts = await AccountLevel3.find({
      companyId,
      _id: { $in: cashAccounts }
    })
    .select('_id code title parentLevel1Code parentLevel2Code')
    .sort({ code: 1 })
    .lean();

    const options = accounts.map(account => ({
      value: account._id,
      label: `${account.parentLevel1Code}${account.parentLevel2Code}${account.code} - ${account.title}`,
      code: `${account.parentLevel1Code}${account.parentLevel2Code}${account.code}`,
      title: account.title
    }));

    res.json(options);
  } catch (error) {
    console.error('Error getting Debit AccountLevel3 options:', error);
    res.status(500).json({ error: 'Failed to get Debit AccountLevel3 options' });
  }
};

// Get AccountLevel3 options for credit portion (all accounts)
exports.getCreditAccountLevel3Options = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const accounts = await AccountLevel3.find({ companyId })
      .select('_id code title parentLevel1Code parentLevel2Code')
      .sort({ code: 1 })
      .lean();

    const options = accounts.map(account => ({
      value: account._id,
      label: `${account.parentLevel1Code}${account.parentLevel2Code}${account.code} - ${account.title}`,
      code: `${account.parentLevel1Code}${account.parentLevel2Code}${account.code}`,
      title: account.title
    }));

    res.json(options);
  } catch (error) {
    console.error('Error getting Credit AccountLevel3 options:', error);
    res.status(500).json({ error: 'Failed to get Credit AccountLevel3 options' });
  }
};

// Get AccountLevel4 options for debit portion (filtered by cash account level 3)
exports.getDebitAccountLevel4Options = async (req, res) => {
  try {
    const { companyId, level3Id } = req.params;
    
    // Verify the level3Id is from a cash account
    const isCashAccount = await CashAccount.exists({ 
      companyId, 
      level3Id 
    });

    if (!isCashAccount) {
      return res.status(400).json({ 
        error: 'Selected account is not a cash account' 
      });
    }

    const accounts = await AccountLevel4.find({ 
      companyId,
      level3Id
    })
    .select('_id subcode title code')
    .sort({ subcode: 1 })
    .lean();

    const options = accounts.map(account => ({
      value: account._id,
      label: `${account.subcode} - ${account.title}`,
      code: account.subcode,
      title: account.title
    }));

    res.json(options);
  } catch (error) {
    console.error('Error getting Debit AccountLevel4 options:', error);
    res.status(500).json({ error: 'Failed to get Debit AccountLevel4 options' });
  }
};

// Get AccountLevel4 options for credit portion (filtered by selected account level 3)
exports.getCreditAccountLevel4Options = async (req, res) => {
  try {
    const { companyId, level3Id } = req.params;
    
    const accounts = await AccountLevel4.find({ 
      companyId,
      level3Id
    })
    .select('_id subcode title code')
    .sort({ subcode: 1 })
    .lean();

    const options = accounts.map(account => ({
      value: account._id,
      label: `${account.subcode} - ${account.title}`,
      code: account.subcode,
      title: account.title
    }));

    res.json(options);
  } catch (error) {
    console.error('Error getting Credit AccountLevel4 options:', error);
    res.status(500).json({ error: 'Failed to get Credit AccountLevel4 options' });
  }
};

// Get additional charges/deductions account options (Level 3)
exports.getAdditionalChargesLevel3Options = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Get distinct level3Ids from active GovtTaxAccounts
    const level3Ids = await GovtTaxAccount.find({ 
      companyId,
      isActive: true 
    }).distinct('level3Id');

    // Get the full level3 account details
    const accounts = await AccountLevel3.find({
      _id: { $in: level3Ids }
    })
    .select('_id code title parentLevel1Code parentLevel2Code')
    .sort({ code: 1 })
    .lean();

    // Get all GovtTaxAccounts to map parentLevel3Code and level3Title
    const taxAccounts = await GovtTaxAccount.find({
      companyId,
      isActive: true
    })
    .select('level3Id parentLevel3Code level3Title')
    .lean();

    const options = accounts.map(account => {
      // Find matching tax account to get parentLevel3Code and level3Title
      const taxAccount = taxAccounts.find(ta => ta.level3Id.toString() === account._id.toString());
      
      return {
        value: account._id,
        label: `${taxAccount?.parentLevel3Code || ''} - ${taxAccount?.level3Title || account.title}`,
        code: `${account.parentLevel1Code}${account.parentLevel2Code}${account.code}`,
        title: taxAccount?.level3Title || account.title,
        parentLevel3Code: taxAccount?.parentLevel3Code || '',
        level3Title: taxAccount?.level3Title || account.title
      };
    });

    res.json(options);
  } catch (error) {
    console.error('Error getting Additional Charges Level3 options:', error);
    res.status(500).json({ error: 'Failed to get Additional Charges Level3 options' });
  }
};

// Get additional charges/deductions account options (Level 4)
exports.getAdditionalChargesLevel4Options = async (req, res) => {
  try {
    const { companyId, level3Id } = req.params;
    
    // Get all active GovtTaxAccounts for this level3Id
    const taxAccounts = await GovtTaxAccount.find({ 
      companyId,
      level3Id,
      isActive: true 
    })
    .select('_id level4Id level4Subcode level4Title rate parentLevel3Code level3Title')
    .populate('level4Id', 'subcode title')
    .sort({ level4Subcode: 1 })
    .lean();

    const options = taxAccounts.map(account => ({
      value: account._id, // Store the GovtTaxAccount _id for reference
      accountId: account.level4Id?._id, // Store the actual AccountLevel4 _id
      label: `${account.level4Subcode} - ${account.level4Title}`,
      code: account.level4Subcode,
      title: account.level4Title,
      rate: account.rate,
      parentLevel3Code: account.parentLevel3Code,
      level3Title: account.level3Title,
      level4Subcode: account.level4Subcode,
      isTaxAccount: true, // Flag to identify this as a tax account
      taxAccountId: account._id // Store the tax account ID
    }));

    res.json(options);
  } catch (error) {
    console.error('Error getting Additional Charges Level4 options:', error);
    res.status(500).json({ error: 'Failed to get Additional Charges Level4 options' });
  }
};

exports.createVoucher = async (req, res) => {
  try {
    const { 
      companyId, 
      locationId, 
      financialYearId,
      voucherType, 
      voucherDate, 
      description, 
      entries 
    } = req.body;

    // Validation
    if (!companyId || !locationId || !financialYearId) {
      return res.status(400).json({ error: 'Company, Location and Financial Year are required' });
    }

    if (!voucherType || !['receipt', 'payment'].includes(voucherType)) {
      return res.status(400).json({ error: 'Voucher type must be either "receipt" or "payment"' });
    }

    if (!entries || entries.length < 1) {
      return res.status(400).json({ error: 'At least one entry is required' });
    }

    // Validate parent/child codes in entries
for (const entry of entries) {
  // Only undefined/null is considered error, empty string is acceptable
  if (entry.parentCenterCode === undefined || entry.parentCenterCode === null) {
    return res.status(400).json({ 
      error: 'Parent center code is required for all entries',
      entry: entry
    });
  }

  if (entry.level4Id && (entry.childCenterCode === undefined || entry.childCenterCode === null)) {
    return res.status(400).json({ 
      error: 'Child center code is required when child center is selected',
      entry: entry
    });
  }
}

    // Compute total amount based on entries
    const totalAmount = entries
      .filter(e => e.type === 'credit')
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    if (totalAmount <= 0) {
      return res.status(400).json({ error: 'Total credit amount must be greater than 0' });
    }

    // Get next voucher number
    const { fullNumber, displayNumber } = await getNextVoucherNumber(
      companyId, locationId, financialYearId, voucherType
    );

    // Prepare entries with the new code fields
    const processedEntries = entries.map(entry => ({
      level3Id: entry.level3Id,
      level4Id: entry.level4Id,
      parentCenterCode: entry.parentCenterCode, // New field
      childCenterCode: entry.childCenterCode || null, // New field
      amount: parseFloat(entry.amount),
      type: entry.type,
      description: entry.description || description,
      accountTitle: entry.accountTitle,
      subAccountTitle: entry.subAccountTitle,
      accountCode: entry.accountCode,
      subAccountCode: entry.subAccountCode,
      level3Title: entry.level3Title,
      level4Title: entry.level4Title,
      rate: entry.rate,
      isTaxAccount: entry.isTaxAccount || false,
      taxAccountId: entry.taxAccountId,
      parentLevel3Code: entry.parentLevel3Code,
      level4Subcode: entry.level4Subcode,
      isGrossAmount: entry.isGrossAmount || false
    }));

    // Save voucher
    const voucher = new CashVoucher({
      companyId,
      locationId,
      financialYearId,
      voucherType,
      voucherDate: new Date(voucherDate),
      voucherNumber: fullNumber,
      description,
      amount: totalAmount,
      entries: processedEntries
    });

    await voucher.save();

    res.status(201).json({
      success: true,
      message: `Voucher ${displayNumber} created successfully`,
      voucher: {
        ...voucher.toObject(),
        voucherNumber: displayNumber
      }
    });

  } catch (error) {
    console.error('Error creating voucher:', error);
    res.status(500).json({ 
      error: 'Failed to create voucher',
      details: error.message 
    });
  }
};

// Get next voucher number (preview only - doesn't increment)
exports.getNextVoucherNumber = async (req, res) => {
  try {
    const { companyId, locationId, financialYearId, voucherType } = req.params;
    
    if (!companyId || !locationId || !financialYearId) {
      return res.status(400).json({ 
        error: 'Company ID, Location ID and Financial Year ID are required' 
      });
    }

    if (!voucherType || !['receipt', 'payment'].includes(voucherType)) {
      return res.status(400).json({ 
        error: 'Voucher type must be either "receipt" or "payment"' 
      });
    }

    // Get current number without incrementing
    const currentSeq = await getCurrentVoucherNumber(companyId, locationId, financialYearId, voucherType);
    const typePrefix = voucherType === 'receipt' ? 'CR' : 'CP';
    const counterId = `${typePrefix}-${companyId.toString().padStart(2, '0')}${locationId.toString().padStart(2, '0')}${financialYearId.toString().padStart(2, '0')}`;
    
    // Return the next number that would be used (current + 1) but don't save it
    const nextFullNumber = `${counterId}-${(currentSeq + 1).toString().padStart(4, '0')}`;
    const nextDisplayNumber = getDisplayVoucherNumber(nextFullNumber);
    
    res.json({ 
      nextNumber: nextDisplayNumber
    });
  } catch (error) {
    console.error('Error getting next voucher number:', error);
    res.status(500).json({ 
      error: 'Failed to get next voucher number',
      details: error.message 
    });
  }
};

// Get single voucher
exports.getVoucher = async (req, res) => {
  try {
    const { companyId, voucherNumber } = req.params;
    
    // Search using full voucher number format or display format
    const voucher = await CashVoucher.findOne({ 
      companyId, 
      $or: [
        { voucherNumber: new RegExp(voucherNumber, 'i') },
        { voucherNumber: new RegExp(`${voucherNumber}$`) }
      ]
    }).lean();

    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    // Return voucher with display number format
    res.json({
      ...voucher,
      voucherNumber: getDisplayVoucherNumber(voucher.voucherNumber)
    });
  } catch (error) {
    console.error('Error getting voucher:', error);
    res.status(500).json({ error: 'Failed to get voucher' });
  }
};

// Update voucher
exports.updateVoucher = async (req, res) => {
  try {
    const { companyId, voucherId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.voucherNumber;
    delete updateData.companyId;

    const voucher = await CashVoucher.findOneAndUpdate(
      { _id: voucherId, companyId },
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    res.json({
      ...voucher,
      voucherNumber: getDisplayVoucherNumber(voucher.voucherNumber)
    });
  } catch (error) {
    console.error('Error updating voucher:', error);
    res.status(500).json({ error: 'Failed to update voucher' });
  }
};

// Delete voucher
exports.deleteVoucher = async (req, res) => {
  try {
    const { companyId, voucherId } = req.params;

    const voucher = await CashVoucher.findOneAndDelete({ 
      _id: voucherId, 
      companyId 
    });

    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    res.json({ 
      success: true, 
      message: 'Voucher deleted successfully',
      voucherNumber: getDisplayVoucherNumber(voucher.voucherNumber)
    });
  } catch (error) {
    console.error('Error deleting voucher:', error);
    res.status(500).json({ error: 'Failed to delete voucher' });
  }
};