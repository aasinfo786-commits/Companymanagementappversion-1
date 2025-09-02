const SalesVoucher = require('../models/SalesVoucher');
const DebtorAccount = require('../models/DebtorAccount');
const AccountLevel4 = require('../models/AccountLevel4');
const AccountLevel3 = require('../models/AccountLevel3'); 
const FinishedGoods = require('../models/FinishedGoods');
const ParentCenter = require('../models/ParentCenter');
const ChildCenter = require('../models/ChildCenter');
const GoDown = require('../models/goDown');
const UnitMeasurement = require('../models/UnitMeasurement');
const TaxRate = require('../models/TaxRateSetting');
const Discount = require('../models/DiscountSetting');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// Initialize ItemProfile model properly
let ItemProfile;
try {
  // First try to get the existing model if it's already registered
  ItemProfile = mongoose.model('ItemProfile');
} catch (e) {
  // If not, require it directly
  try {
    ItemProfile = require('../models/ItemProfile');
    console.log('ItemProfile model loaded successfully');
  } catch (err) {
    console.error('Failed to load ItemProfile model:', err);
    // Fallback mock for development
    if (process.env.NODE_ENV === 'development') {
      ItemProfile = {
        findOne: () => Promise.resolve({ hsCodeValue: 'TESTCODE' })
      };
      console.warn('Using mock ItemProfile model for development');
    }
  }
}

// Helper function to validate sales voucher data
const validateSalesVoucherData = async (companyId, data) => {
  const {
    goDownId,
    invoiceType,
    debtorAccountId,
    subAccountId,
    parentCenterId,
    childCenterId,
    items
  } = data;

  // Validate required fields
  if (!goDownId || !invoiceType || !debtorAccountId || !subAccountId) {
    throw new Error('GoDown, invoice type, debtor account, and sub account are required');
  }

  // Validate items
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('At least one item is required');
  }

  // Get all necessary details
  const [
    goDown,
    debtorAccount,
    subAccount,
    parentCenterDetails,
    childCenterDetails
  ] = await Promise.all([
    GoDown.findOne({ _id: goDownId, companyId }),
    DebtorAccount.findOne({ _id: debtorAccountId, companyId }),
    AccountLevel4.findOne({ _id: subAccountId, companyId }),
    parentCenterId ? ParentCenter.findOne({ _id: parentCenterId, companyId }) : Promise.resolve(null),
    childCenterId ? ChildCenter.findOne({ _id: childCenterId, companyId, parentCenterId }) : Promise.resolve(null)
  ]);

  // Validate references
  if (!goDown) throw new Error('Invalid GoDown selected');
  if (!debtorAccount || !subAccount) throw new Error('Invalid debtor account or sub account');
  if (parentCenterId && !parentCenterDetails) throw new Error('Invalid parent center');
  if (childCenterId && !childCenterDetails) throw new Error('Invalid child center for selected parent center');

  return {
    goDown,
    debtorAccount,
    subAccount,
    parentCenterDetails,
    childCenterDetails
  };
};

// Helper function to calculate totals
const calculateTotals = (items) => {
  return {
    totalAmount: items.reduce((sum, item) => sum + (item.amount || 0), 0),
    discountAmount: items.reduce((sum, item) => sum + (item.discount || 0), 0),
    taxAmount: items.reduce((sum, item) => sum + (item.tax || 0), 0),
    netAmountBeforeTax: items.reduce((sum, item) => sum + (item.netAmountBeforeTax || 0), 0),
    netAmount: items.reduce((sum, item) => sum + (item.netAmount || 0), 0)
  };
};

// Helper function to generate accounting entries
const generateAccountingEntries = (items, subAccount, netAmount) => {
  const accountingEntries = [];
  
  // Debit entry for debtor account
  accountingEntries.push({
    debit: netAmount,
    credit: 0
  });

  // Combine all discount entries from all items
  const combinedDiscounts = {};
  items.forEach(item => {
    if (item.discountBreakdown && item.discountBreakdown.length > 0) {
      item.discountBreakdown.forEach(discount => {
        if (!combinedDiscounts[discount.discountTypeId]) {
          combinedDiscounts[discount.discountTypeId] = {
            value: 0,
            type: discount.type,
            rate: discount.rate
          };
        }
        combinedDiscounts[discount.discountTypeId].value += discount.value;
      });
    }
  });

  // Add combined discount entries
  Object.entries(combinedDiscounts).forEach(([discountTypeId, discount]) => {
    accountingEntries.push({
      debit: discount.value,
      credit: 0
    });
  });

  // Combine all tax entries from all items
  const combinedTaxes = {};
  items.forEach(item => {
    if (item.taxBreakdown && item.taxBreakdown.length > 0) {
      item.taxBreakdown.forEach(tax => {
        if (!combinedTaxes[tax.taxTypeId]) {
          combinedTaxes[tax.taxTypeId] = {
            value: 0,
            rate: tax.rate,
            type: tax.type
          };
        }
        combinedTaxes[tax.taxTypeId].value += tax.value;
      });
    }
  });

  // Add combined tax entries
  Object.entries(combinedTaxes).forEach(([taxTypeId, tax]) => {
    accountingEntries.push({
      debit: 0,
      credit: tax.value
    });
  });

  // Credit entries for each product
  items.forEach(item => {
    accountingEntries.push({
      debit: 0,
      credit: item.amount || 0
    });
  });

  return accountingEntries;
};

// Helper function to generate invoice number if not provided
const generateInvoiceNumber = async (companyId, invoiceType, invoiceDate, invoiceNumber) => {
  if (invoiceNumber) return invoiceNumber;
  
  const now = new Date(invoiceDate ? new Date(invoiceDate) : new Date());
  const year = now.getFullYear().toString();
  const prefix = invoiceType.charAt(0).toUpperCase();
  
  // Find all invoices for this year and prefix to get the highest sequence number
  const vouchers = await SalesVoucher.find(
    { 
      companyId,
      invoiceNumber: { $regex: `^${prefix}${year}` } 
    },
    'invoiceNumber'
  ).lean();
  
  let maxSeq = 0;
  for (const voucher of vouchers) {
    // Extract the last 4 digits (sequence number) from the invoice number
    const seqStr = voucher.invoiceNumber.slice(-4);
    const seq = parseInt(seqStr, 10);
    if (!isNaN(seq) && seq > maxSeq) {
      maxSeq = seq;
    }
  }
  
  const nextSeq = maxSeq + 1;
  return `${prefix}${year}${nextSeq.toString().padStart(4, '0')}`;
};

const prepareVoucherData = async (companyId, data, references) => {
  const {
    goDownId,
    invoiceType,
    invoiceNumber,
    invoiceDate,
    fbrInvoiceNumber,
    poNumber,
    poDate,
    ogpNumber,
    ogpDate,
    dcNumber,
    dcDate,
    vehicleNumber,
    remarks,
    customerAddress,
    debtorAccountId,
    subAccountId,
    parentCenterId,
    childCenterId,
    items,
    customerProfile
  } = data;

  const {
    goDown,
    debtorAccount,
    subAccount,
    parentCenterDetails,
    childCenterDetails
  } = references;

  const totals = calculateTotals(items);
  const accountingEntries = generateAccountingEntries(items, subAccount, totals.netAmount);

  // Get HS Code for each item
  const itemsWithHSCode = await Promise.all(items.map(async (item) => {
    let hsCode = item.hsCode || '';
    
    // Only try to lookup if we have the required IDs and model is available
    if (!hsCode && item.finishedGoodId && item.accountLevel4Id && ItemProfile && typeof ItemProfile.findOne === 'function') {
      try {
        console.log('Looking up HS Code for:', {
          product: item.productName,
          finishedGood: item.finishedGoodId,
          accountLevel4: item.accountLevel4Id
        });
        // Convert string IDs to ObjectId
        const finishedGoodObjId = new ObjectId(item.finishedGoodId);
        const accountLevel4ObjId = new ObjectId(item.accountLevel4Id);
        const itemProfile = await ItemProfile.findOne({
          companyId,
          finishedGood: finishedGoodObjId,
          accountLevel4: accountLevel4ObjId
        }).select('hsCodeValue').lean();
        if (itemProfile && itemProfile.hsCodeValue) {
          hsCode = itemProfile.hsCodeValue;
          console.log(`Found HS Code "${hsCode}" for ${item.productName}`);
        } else {
          console.log(`No HS Code found in ItemProfile for ${item.productName}`);
        }
      } catch (err) {
        console.error('HS Code lookup error:', {
          error: err.message,
          product: item.productName,
          stack: err.stack
        });
      }
    } else if (!ItemProfile || typeof ItemProfile.findOne !== 'function') {
      console.warn('ItemProfile model not available for HS Code lookup');
    }
    
    // Fallback to subAccount's HS Code if still empty
    if (!hsCode && subAccount.hsCode) {
      hsCode = subAccount.hsCode;
      console.log(`Using subAccount HS Code "${hsCode}" for ${item.productName}`);
    }
    
    return {
      ...item,
      hsCode: hsCode || '' // Ensure we always have a string
    };
  }));

  return {
    companyId,
    goDownId,
    goDownCode: goDown.code,
    goDownAlphabet: goDown.alphabet,
    invoiceType,
    invoiceNumber,
    invoiceDate: new Date(invoiceDate),
    fbrInvoiceNumber,
    customerAddress: customerAddress || '',  
    poNumber,
    poDate,
    ogpNumber,
    ogpDate,
    dcNumber,
    dcDate,
    vehicleNumber,
    remarks,
    debtorAccount: debtorAccountId,
    subAccount: subAccountId,
    subAccountFullCode: subAccount.fullcode,
    parentCenterId: parentCenterDetails?._id,
    parentCenterCode: parentCenterDetails?.parentCode,
    childCenterId: childCenterDetails?._id,
    childCenterCode: childCenterDetails?.childCode,
    centerCode: childCenterDetails ? `${parentCenterDetails.parentCode}.${childCenterDetails.childCode}` : null,
    finishedGoodId: items[0]?.finishedGoodId || null,
    finishedGoodCode: items[0]?.finishedGoodCode || null,
    accountLevel4Id: items[0]?.accountLevel4Id || null,
    accountLevel4FullCode: subAccount.fullcode,
    items: itemsWithHSCode.map(item => ({
      productId: item.productId || '',
      subAccountFullCode: subAccount.fullcode,
      productCode: (item.productName || '').substring(0, 12),
      quantity: item.quantity,
      rate: item.rate,
      discount: item.discount || 0,
      amount: item.amount || 0,
      tax: item.tax || 0,
      netAmount: item.netAmount || 0,
      unitMeasurementId: item.unitMeasurementId || '',
      unitMeasurementCode: item.unitMeasurementCode || '',
      discountBreakdown: item.discountBreakdown || [],
      taxBreakdown: item.taxBreakdown || [],
      rateInfo: item.rateInfo || null,
      finishedGoodId: item.finishedGoodId || null,
      finishedGoodCode: item.finishedGoodCode || null,
      accountLevel4Id: item.accountLevel4Id || null,
      hsCode: item.hsCode || '' // Ensured to be a string
    })),
    totalAmount: totals.totalAmount,
    taxAmount: totals.taxAmount,
    discountAmount: totals.discountAmount,
    netAmount: totals.netAmount,
    netAmountBeforeTax: totals.netAmountBeforeTax,
    accountingEntries,
    customerProfile: customerProfile || null
  };
};

const getSubAccountDetails = async (req, res) => {
  try {
    const { companyId, subAccountId } = req.params;
    
    // First get the sub account details
    const subAccount = await AccountLevel4.findOne({
      _id: subAccountId,
      companyId
    });
    
    if (!subAccount) {
      return res.status(404).json({ error: 'Sub account not found' });
    }
    
    // Get tax rates associated with this account level 4
    const taxRates = await TaxRate.find({
      companyId,
      accountLevel4Id: subAccountId,
      isActive: true
    }).sort({ applicableDate: -1 }).limit(1);
    
    // Get discount rates associated with this account level 4
    const discountRates = await Discount.find({
      companyId,
      accountLevel4: subAccountId,
      isActive: true
    }).sort({ applicableDate: -1 }).limit(1);
    
    // Format discounts - take the most recent active discount rates
    const discounts = discountRates.length > 0 
      ? discountRates[0].discountRates.map(d => ({
          type: d.type,
          rate: d.rate,
          isEditable: d.isEditable || false,
          discountTypeId: d.discountTypeId
        }))
      : [];
    
    // Format taxes - take the most recent active tax rates
    const taxes = taxRates.length > 0 
      ? taxRates[0].taxRates.map(t => ({
          type: t.type,
          rate: t.registeredValue, // Using registered value as default
          isEditable: t.isEditable || false,
          taxTypeId: t.taxTypeId,
          registeredValue: t.registeredValue,
          unregisteredValue: t.unregisteredValue
        }))
      : [];
    
    res.json({
      discounts,
      taxes,
      subAccountDetails: {
        code: subAccount.code,
        subcode: subAccount.subcode,
        fullcode: subAccount.fullcode,
        hsCode: subAccount.hsCode || '' // Include HS Code in response
      }
    });
  } catch (err) {
    console.error('Error fetching sub-account details:', err);
    res.status(500).json({
      error: 'Failed to fetch sub-account details',
      details: err.message
    });
  }
};

const updateSalesVoucher = async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const updateData = req.body;
    const existingVoucher = await SalesVoucher.findOne({ _id: id, companyId });
    if (!existingVoucher) return res.status(404).json({ error: 'Sales voucher not found' });

    // Check if subaccount is being changed
    const isSubAccountChanged = updateData.subAccount && 
      updateData.subAccount.toString() !== existingVoucher.subAccount.toString();

    // Validate data
    const references = await validateSalesVoucherData(companyId, updateData);

    // Get discount and tax rates for the new sub-account if changed
    let discountRates = [];
    let taxRates = [];
    
    if (isSubAccountChanged) {
      const discountResponse = await Discount.findOne({
        companyId,
        accountLevel4: updateData.subAccount,
        isActive: true
      }).sort({ applicableDate: -1 });
      
      const taxResponse = await TaxRate.findOne({
        companyId,
        accountLevel4Id: updateData.subAccount,
        isActive: true
      }).sort({ applicableDate: -1 });
      
      discountRates = discountResponse?.discountRates || [];
      taxRates = taxResponse?.taxRates || [];
    }

    // Prepare voucher data
    let voucherData = await prepareVoucherData(companyId, updateData, references);

    // If subaccount changed, update discounts and taxes
    if (isSubAccountChanged) {
      voucherData.items = voucherData.items.map(item => {
        // Apply new discounts
        const discountBreakdown = discountRates.map(discount => ({
          type: discount.type,
          rate: discount.rate,
          value: discount.type === 'percentage' 
            ? item.amount * (discount.rate / 100)
            : discount.type === 'quantity' 
              ? item.quantity * discount.rate
              : discount.rate,
          isEditable: discount.isEditable || false,
          discountTypeId: discount._id || discount.discountTypeId
        }));
        
        // Apply new taxes
        const taxBreakdown = taxRates.map(tax => ({
          type: tax.type,
          rate: tax.registeredValue, // Default to registered
          value: tax.type === 'quantity' 
            ? item.quantity * tax.rate 
            : item.amount * (tax.rate / 100),
          taxTypeId: tax._id,
          registeredValue: tax.registeredValue,
          unregisteredValue: tax.unregisteredValue
        }));
        
        const totalDiscount = discountBreakdown.reduce((sum, d) => sum + d.value, 0);
        const totalTax = taxBreakdown.reduce((sum, t) => sum + t.value, 0);
        
        return {
          ...item,
          discountBreakdown,
          taxBreakdown,
          discount: totalDiscount,
          tax: totalTax,
          netAmountBeforeTax: item.amount - totalDiscount,
          netAmount: (item.amount - totalDiscount) + totalTax
        };
      });
      
      // Recalculate totals
      const totals = calculateTotals(voucherData.items);
      voucherData = {
        ...voucherData,
        ...totals,
        accountingEntries: generateAccountingEntries(voucherData.items, references.subAccount, totals.netAmount)
      };
    }

    Object.assign(existingVoucher, voucherData);
    const updatedVoucher = await existingVoucher.save();
    res.json({
      message: 'Sales voucher updated successfully',
      voucher: updatedVoucher
    });
  } catch (err) {
    console.error('Error updating sales voucher:', err);
    res.status(500).json({ error: err.message || 'Failed to update sales voucher' });
  }
};

// Create a new sales voucher (updated to use helpers)
const createSalesVoucher = async (req, res) => {
  try {
    const { companyId } = req.params;
    const createData = req.body;

    // Validate data and get references
    const references = await validateSalesVoucherData(companyId, createData);

    // Generate invoice number if not provided
    const finalInvoiceNumber = await generateInvoiceNumber(
      companyId,
      createData.invoiceType,
      createData.invoiceDate,
      createData.invoiceNumber
    );

    // Prepare voucher data
    const voucherData = await prepareVoucherData(companyId, {
      ...createData,
      invoiceNumber: finalInvoiceNumber
    }, references);

    // Create new voucher
    const newVoucher = new SalesVoucher(voucherData);
    await newVoucher.save();

    res.status(201).json({
      message: 'Sales voucher created successfully',
      voucher: newVoucher
    });
  } catch (err) {
    console.error('Error creating sales voucher:', err);
    res.status(500).json({
      error: err.message || 'Failed to create sales voucher',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Update the getSalesVouchers function to include titles
const getSalesVouchers = async (req, res) => {
  try {
    console.log('Backend: getSalesVouchers called with params:', req.params, 'query:', req.query);
    const { companyId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const vouchers = await SalesVoucher.find({ companyId })
      .sort({ invoiceDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    console.log('Backend: Retrieved vouchers count:', vouchers.length);
    
    const count = await SalesVoucher.countDocuments({ companyId });
    console.log('Backend: Total vouchers count for company:', count);
    
    // Collect all unique codes for each type
    const debtorAccountIds = [...new Set(vouchers.map(v => v.debtorAccount).filter(Boolean))];
    const subAccountFullCodes = [...new Set(vouchers.map(v => v.subAccountFullCode).filter(Boolean))];
    const finishedGoodCodes = [...new Set(vouchers.map(v => v.finishedGoodCode).filter(Boolean))];
    const accountLevel4FullCodes = [...new Set(vouchers.map(v => v.accountLevel4FullCode).filter(Boolean))];
    
    // Collect all item product codes
    const itemProductCodes = [...new Set(
      vouchers.flatMap(v => v.items.map(item => item.productCode).filter(Boolean))
    )];
    
    // Collect all item subAccountFullCodes
    const itemSubAccountFullCodes = [...new Set(
      vouchers.flatMap(v => v.items.map(item => item.subAccountFullCode).filter(Boolean))
    )];
    
    console.log('Backend: Collected codes for lookup:', {
      debtorAccountIds: debtorAccountIds.length,
      subAccountFullCodes: subAccountFullCodes.length,
      finishedGoodCodes: finishedGoodCodes.length,
      accountLevel4FullCodes: accountLevel4FullCodes.length,
      itemProductCodes: itemProductCodes.length,
      itemSubAccountFullCodes: itemSubAccountFullCodes.length
    });
    
    // Log the actual codes for debugging
    console.log('Backend: Account Level 4 full codes:', accountLevel4FullCodes);
    console.log('Backend: Item product codes:', itemProductCodes);
    console.log('Backend: Item subAccountFullCodes:', itemSubAccountFullCodes);
    
    // Fetch titles in batch using codes
    const [
      debtorAccounts,
      subAccounts,
      finishedGoods,
      accountLevel4s,
      itemProducts,
      itemSubAccounts
    ] = await Promise.all([
      DebtorAccount.find({ _id: { $in: debtorAccountIds } }).select('_id title').lean(),
      AccountLevel4.find({ fullcode: { $in: subAccountFullCodes } }).select('fullcode title').lean(),
      FinishedGoods.find({ code: { $in: finishedGoodCodes } }).select('code title').lean(),
      AccountLevel4.find({ fullcode: { $in: accountLevel4FullCodes } }).select('fullcode title').lean(),
      AccountLevel4.find({ fullcode: { $in: itemProductCodes } }).select('fullcode title').lean(),
      AccountLevel4.find({ fullcode: { $in: itemSubAccountFullCodes } }).select('fullcode title').lean()
    ]);
    
    console.log('Backend: Fetched titles:', {
      debtorAccounts: debtorAccounts.length,
      subAccounts: subAccounts.length,
      finishedGoods: finishedGoods.length,
      accountLevel4s: accountLevel4s.length,
      itemProducts: itemProducts.length,
      itemSubAccounts: itemSubAccounts.length
    });
    
    // Log the fetched AccountLevel4 records for debugging
    console.log('Backend: Fetched AccountLevel4 records:');
    accountLevel4s.forEach(al4 => {
      console.log(`- Full Code: ${al4.fullcode}, Title: ${al4.title}`);
    });
    
    // Log the fetched item products for debugging
    console.log('Backend: Fetched item products:');
    itemProducts.forEach(product => {
      console.log(`- Full Code: ${product.fullcode}, Title: ${product.title}`);
    });
    
    // Log the fetched item subaccounts for debugging
    console.log('Backend: Fetched item subaccounts:');
    itemSubAccounts.forEach(subAccount => {
      console.log(`- Full Code: ${subAccount.fullcode}, Title: ${subAccount.title}`);
    });
    
    // Create maps for quick lookup using codes
    const debtorAccountMap = debtorAccounts.reduce((map, da) => {
      map[da._id] = da.title;
      return map;
    }, {});
    
    const subAccountMap = subAccounts.reduce((map, sa) => {
      map[sa.fullcode] = sa.title;
      return map;
    }, {});
    
    const finishedGoodMap = finishedGoods.reduce((map, fg) => {
      map[fg.code] = fg.title;
      return map;
    }, {});
    
    const accountLevel4Map = accountLevel4s.reduce((map, al4) => {
      map[al4.fullcode] = al4.title;
      return map;
    }, {});
    
    const itemProductMap = itemProducts.reduce((map, product) => {
      map[product.fullcode] = product.title;
      return map;
    }, {});
    
    const itemSubAccountMap = itemSubAccounts.reduce((map, subAccount) => {
      map[subAccount.fullcode] = subAccount.title;
      return map;
    }, {});
    
    // Log the created maps for debugging
    console.log('Backend: Account Level 4 map keys:', Object.keys(accountLevel4Map));
    console.log('Backend: Item product map keys:', Object.keys(itemProductMap));
    console.log('Backend: Item subAccount map keys:', Object.keys(itemSubAccountMap));
    
    // Map titles to each voucher
    const vouchersWithTitles = vouchers.map(voucher => {
      // Log voucher details for debugging
      console.log('Backend: Processing voucher:', {
        id: voucher._id,
        debtorAccount: voucher.debtorAccount,
        subAccountFullCode: voucher.subAccountFullCode,
        finishedGoodCode: voucher.finishedGoodCode,
        accountLevel4FullCode: voucher.accountLevel4FullCode
      });
      
      return {
        ...voucher,
        debtorAccountTitle: debtorAccountMap[voucher.debtorAccount] || 'N/A',
        subAccountTitle: subAccountMap[voucher.subAccountFullCode] || 'N/A',
        finishedGoodTitle: finishedGoodMap[voucher.finishedGoodCode] || 'N/A',
        accountLevel4Title: accountLevel4Map[voucher.accountLevel4FullCode] || 'N/A',
        items: voucher.items.map(item => {
          // Log item details for debugging
          console.log('Backend: Processing item:', {
            id: item._id,
            productCode: item.productCode,
            subAccountFullCode: item.subAccountFullCode,
            productName: itemProductMap[item.productCode],
            subAccountTitle: itemSubAccountMap[item.subAccountFullCode]
          });
          
          return {
            ...item,
            productName: itemProductMap[item.productCode] || 'N/A', // Use productCode and itemProductMap
            subAccountTitle: itemSubAccountMap[item.subAccountFullCode] || 'N/A' // Use subAccountFullCode and itemSubAccountMap
          };
        })
      };
    });
    
    console.log('Backend: Prepared response with vouchers:', vouchersWithTitles.length, 'items');
    
    res.json({
      vouchers: vouchersWithTitles,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Backend: Error fetching sales vouchers:', err);
    res.status(500).json({
      error: 'Failed to fetch sales vouchers',
      details: err.message
    });
  }
};

// Helper function to add titles to a voucher
const addTitlesToVoucher = async (voucher) => {
  console.log('Backend: Found voucher with items count:', voucher.items.length);
  
  // Log the voucher codes for debugging
  console.log('Backend: Voucher codes:', {
    subAccountFullCode: voucher.subAccountFullCode,
    finishedGoodCode: voucher.finishedGoodCode,
    accountLevel4FullCode: voucher.accountLevel4FullCode
  });
  
  // Log the item product codes and subAccountFullCodes for debugging
  console.log('Backend: Item product codes:', voucher.items.map(item => item.productCode));
  console.log('Backend: Item subAccountFullCodes:', voucher.items.map(item => item.subAccountFullCode));
  
  // Fetch titles from related models
  const [
    debtorAccount,
    subAccount,
    finishedGood,
    accountLevel4
  ] = await Promise.all([
    DebtorAccount.findById(voucher.debtorAccount).select('title').lean(),
    AccountLevel4.findOne({ fullcode: voucher.subAccountFullCode }).select('title').lean(),
    FinishedGoods.findOne({ code: voucher.finishedGoodCode }).select('title').lean(),
    AccountLevel4.findOne({ fullcode: voucher.accountLevel4FullCode }).select('title').lean()
  ]);
  
  console.log('Backend: Fetched related titles:', {
    debtorAccount: debtorAccount?.title || 'Not found',
    subAccount: subAccount?.title || 'Not found',
    finishedGood: finishedGood?.title || 'Not found',
    accountLevel4: accountLevel4?.title || 'Not found'
  });
  
  // Create a map for product titles (for items) using productCode
  const itemProductCodes = voucher.items.map(item => item.productCode).filter(Boolean);
  const itemProducts = await AccountLevel4.find({ 
    fullcode: { $in: itemProductCodes } 
  }).select('fullcode title').lean();
  
  // Create a map for subAccount titles (for items) using subAccountFullCode
  const itemSubAccountFullCodes = voucher.items.map(item => item.subAccountFullCode).filter(Boolean);
  const itemSubAccounts = await AccountLevel4.find({ 
    fullcode: { $in: itemSubAccountFullCodes } 
  }).select('fullcode title').lean();
  
  console.log('Backend: Fetched product titles count:', itemProducts.length);
  console.log('Backend: Fetched subAccount titles count:', itemSubAccounts.length);
  
  // Log the fetched item products for debugging
  console.log('Backend: Fetched item products:');
  itemProducts.forEach(product => {
    console.log(`- Full Code: ${product.fullcode}, Title: ${product.title}`);
  });
  
  // Log the fetched item subaccounts for debugging
  console.log('Backend: Fetched item subaccounts:');
  itemSubAccounts.forEach(subAccount => {
    console.log(`- Full Code: ${subAccount.fullcode}, Title: ${subAccount.title}`);
  });
  
  const itemProductMap = itemProducts.reduce((map, product) => {
    map[product.fullcode] = product.title;
    return map;
  }, {});
  
  const itemSubAccountMap = itemSubAccounts.reduce((map, subAccount) => {
    map[subAccount.fullcode] = subAccount.title;
    return map;
  }, {});
  
  // Log the created maps for debugging
  console.log('Backend: Item product map keys:', Object.keys(itemProductMap));
  console.log('Backend: Item subAccount map keys:', Object.keys(itemSubAccountMap));
  
  // Add titles to the voucher object
  const voucherWithTitles = {
    ...voucher.toObject(),
    debtorAccountTitle: debtorAccount?.title || 'N/A',
    subAccountTitle: subAccount?.title || 'N/A',
    finishedGoodTitle: finishedGood?.title || 'N/A',
    accountLevel4Title: accountLevel4?.title || 'N/A',
    items: voucher.items.map(item => ({
      ...item,
      productName: itemProductMap[item.productCode] || 'N/A', // Use productCode and itemProductMap
      subAccountTitle: itemSubAccountMap[item.subAccountFullCode] || 'N/A' // Use subAccountFullCode and itemSubAccountMap
    }))
  };
  
  console.log('Backend: Prepared response with voucher items:', voucherWithTitles.items.length);
  
  return voucherWithTitles;
};

// Update the getSalesVoucher function to include titles and support partial invoice numbers
const getSalesVoucher = async (req, res) => {
  try {
    console.log('Backend: getSalesVoucher called with id:', req.params.id);
    const { id } = req.params;
    let voucher;

    // Check if id is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      voucher = await SalesVoucher.findById(id);
      if (!voucher) {
        console.log('Backend: Sales voucher not found with id:', id);
        return res.status(404).json({ error: 'Sales voucher not found' });
      }
    } else {
      // Process as invoice number string
      const input = id;

      // Check if input is all digits
      if (/^\d+$/.test(input)) {
        let lastFour = input.slice(-4);
        if (lastFour.length < 4) {
          lastFour = lastFour.padStart(4, '0');
        }
        const condition = { invoiceNumber: { $regex: lastFour + '$' } };
        const vouchers = await SalesVoucher.find(condition).limit(2);
        
        if (vouchers.length === 0) {
          return res.status(404).json({ error: 'No invoice found with these last digits.' });
        } else if (vouchers.length > 1) {
          return res.status(400).json({ error: 'Multiple invoices found with these last digits. Please enter more digits or the complete invoice number.' });
        } else {
          voucher = vouchers[0];
        }
      } else if (/^[A-Za-z]\d{8}$/.test(input)) {
        voucher = await SalesVoucher.findOne({ invoiceNumber: input });
        if (!voucher) {
          return res.status(404).json({ error: 'Sales voucher not found' });
        }
      } else {
        return res.status(400).json({ error: 'Invalid invoice number format. Please enter a complete invoice number (e.g., S20250001) or the last digits (e.g., 1, 01, 001, 0001).' });
      }
    }

    // Add titles to the voucher
    const voucherWithTitles = await addTitlesToVoucher(voucher);
    res.json(voucherWithTitles);
  } catch (err) {
    console.error('Backend: Error fetching sales voucher:', err);
    res.status(500).json({
      error: 'Failed to fetch sales voucher',
      details: err.message
    });
  }
};

// Get debtor accounts for a company - Modified to properly match combined codes
const getDebtorAccounts = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Get debtor accounts
    const debtorAccounts = await DebtorAccount.find({ companyId, isActive: true })
      .select('_id code')
      .sort({ code: 1 });
    
    // Get all AccountLevel3 records for this company
    const accountLevel3Records = await AccountLevel3.find({ companyId })
      .select('parentLevel1Code parentLevel2Code code title');
    
    // Create a map of combined code to title from AccountLevel3
    const codeToTitleMap = {};
    accountLevel3Records.forEach(record => {
      // Combine the three separate codes to match the format in DebtorAccount
      const combinedCode = record.parentLevel1Code + record.parentLevel2Code + record.code;
      codeToTitleMap[combinedCode] = record.title;
    });
    
    // Map debtor accounts with titles from AccountLevel3
    const result = debtorAccounts.map(account => {
      const accountLevel3Title = codeToTitleMap[account.code] || '';
      // Print statement for debtor account
      console.log(`Debtor Account: Code - ${account.code}, Title - ${accountLevel3Title}`);
      
      return {
        _id: account._id.toString(),
        code: account.code,
        title: accountLevel3Title // Include the title in the response
      };
    });
    
    res.json(result);
  } catch (err) {
    console.error('Error fetching debtor accounts:', err);
    res.status(500).json({
      error: 'Failed to fetch debtor accounts',
      details: err.message
    });
  }
};

// Get sub accounts for a debtor account
const getSubAccounts = async (req, res) => {
  try {
    const { companyId, debtorAccountId } = req.params;
    
    const debtorAccount = await DebtorAccount.findOne({
      _id: debtorAccountId,
      companyId
    });
    if (!debtorAccount) {
      return res.status(404).json({ error: 'Debtor account not found' });
    }
    
    const subAccounts = await AccountLevel4.find({
      companyId,
      code: debtorAccount.code
    })
    .select('_id subcode fullcode title') // Add title to the selection
    .sort({ subcode: 1 });
    
    res.json(subAccounts.map(subAccount => ({
      _id: subAccount._id.toString(),
      subcode: subAccount.subcode,
      fullcode: subAccount.fullcode,
      title: subAccount.title || '' // Include the title in the response
    })));
  } catch (err) {
    console.error('Error fetching sub accounts:', err);
    res.status(500).json({
      error: 'Failed to fetch sub accounts',
      details: err.message
    });
  }
};

// Get parent centers for a company
const getParentCenters = async (req, res) => {
  try {
    const { companyId } = req.params;
    const parentCenters = await ParentCenter.find({ companyId, isActive: true })
      .select('_id parentCode')
      .sort({ parentCode: 1 });
    
    res.json(parentCenters.map(center => ({
      _id: center._id.toString(),
      parentCode: center.parentCode
    })));
  } catch (err) {
    console.error('Error fetching parent centers:', err);
    res.status(500).json({
      error: 'Failed to fetch parent centers',
      details: err.message
    });
  }
};

// Get child centers for a parent center
const getChildCenters = async (req, res) => {
  try {
    const { companyId, parentCenterId } = req.params;
    
    const childCenters = await ChildCenter.find({
      companyId,
      parentCenterId,
      isActive: true
    })
    .select('_id childCode parentCode')
    .sort({ childCode: 1 });
    
    res.json(childCenters.map(center => ({
      _id: center._id.toString(),
      childCode: center.childCode,
      parentCode: center.parentCode,
      fullCode: `${center.parentCode}.${center.childCode}`
    })));
  } catch (err) {
    console.error('Error fetching child centers:', err);
    res.status(500).json({
      error: 'Failed to fetch child centers',
      details: err.message
    });
  }
};

// Get finished goods for a company - Enhanced with detailed logging
const getFinishedGoods = async (req, res) => {
  try {
    const { companyId } = req.params;
    console.log(`Fetching finished goods for company: ${companyId}`);
    
    // Get finished goods
    const finishedGoods = await FinishedGoods.find({ companyId })
      .select('_id code')
      .sort({ code: 1 });
    
    console.log(`Found ${finishedGoods.length} finished goods records`);
    if (finishedGoods.length === 0) {
      console.log('No finished goods found for this company');
      return res.json([]);
    }
    
    // Log each finished good for debugging
    finishedGoods.forEach(good => {
      console.log(`Finished Good: Code - ${good.code}`);
    });
    
    // Get all AccountLevel3 records for this company
    const accountLevel3Records = await AccountLevel3.find({ companyId })
      .select('parentLevel1Code parentLevel2Code code title');
    
    console.log(`Found ${accountLevel3Records.length} AccountLevel3 records`);
    
    // Create a map of combined code to title from AccountLevel3
    const codeToTitleMap = {};
    accountLevel3Records.forEach(record => {
      // Combine the three separate codes to match the format in FinishedGoods
      const combinedCode = record.parentLevel1Code + record.parentLevel2Code + record.code;
      codeToTitleMap[combinedCode] = record.title;
      console.log(`AccountLevel3 mapping: ${combinedCode} -> ${record.title}`);
    });
    
    // Map finished goods with titles from AccountLevel3
    const result = finishedGoods.map(good => {
      const accountLevel3Title = codeToTitleMap[good.code] || '';
      // Print statement for finished goods account
      console.log(`Finished Goods Account: Code - ${good.code}, Title - ${accountLevel3Title}`);
      
      return {
        _id: good._id.toString(),
        code: good.code,
        title: accountLevel3Title // Include the title in the response
      };
    });
    
    console.log(`Returning ${result.length} finished goods records`);
    res.json(result);
  } catch (err) {
    console.error('Error fetching finished goods:', err);
    res.status(500).json({
      error: 'Failed to fetch finished goods',
      details: err.message
    });
  }
};

// Get account level 4 for a finished good
const getAccountLevel4ForFinishedGood = async (req, res) => {
  try {
    const { companyId, finishedGoodCode } = req.params;
    
    const finishedGood = await FinishedGoods.findOne({
      code: finishedGoodCode,
      companyId
    });
    if (!finishedGood) {
      return res.status(404).json({ error: 'Finished good not found' });
    }
    
    const accountLevel4s = await AccountLevel4.find({
      companyId,
      code: finishedGood.code
    })
    .select('_id subcode fullcode title') // Add title to the selection
    .sort({ subcode: 1 });
    
    res.json(accountLevel4s.map(account => ({
      _id: account._id.toString(),
      subcode: account.subcode,
      fullcode: account.fullcode,
      title: account.title || '' // Include the title in the response
    })));
  } catch (err) {
    console.error('Error fetching account level 4:', err);
    res.status(500).json({
      error: 'Failed to fetch account level 4',
      details: err.message
    });
  }
};

// Get default debtor account for a company
const getDefaultDebtorAccount = async (req, res) => {
  try {
    const { companyId } = req.params;
    const debtorAccount = await DebtorAccount.findOne({
      companyId,
      isDefault: true
    });
    if (!debtorAccount) {
      return res.status(404).json({ 
        error: 'No default debtor account found',
        defaultDebtorAccountId: null
      });
    }
    res.json({
      defaultDebtorAccountId: debtorAccount._id.toString()
    });
  } catch (err) {
    console.error('Error fetching default debtor account:', err);
    res.status(500).json({
      error: 'Failed to fetch default debtor account',
      details: err.message
    });
  }
};

// Get unit measurements for a company
const getUnitMeasurements = async (req, res) => {
  try {
    const { companyId } = req.params;
    const unitMeasurements = await UnitMeasurement.find({ companyId })
      .select('_id code')
      .sort({ code: 1 });
    
    res.json(unitMeasurements.map(unit => ({
      _id: unit._id.toString(),
      code: unit.code
    })));
  } catch (err) {
    console.error('Error fetching unit measurements:', err);
    res.status(500).json({
      error: 'Failed to fetch unit measurements',
      details: err.message
    });
  }
};

const deleteSalesVoucher = async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const deletedVoucher = await SalesVoucher.findOneAndDelete({ 
      _id: id, 
      companyId 
    });
    if (!deletedVoucher) {
      return res.status(404).json({ error: 'Sales voucher not found' });
    }
    res.json({ 
      message: 'Sales voucher deleted successfully',
      deletedVoucher 
    });
  } catch (err) {
    console.error('Error deleting sales voucher:', err);
    res.status(500).json({ 
      error: 'Failed to delete sales voucher',
      details: err.message 
    });
  }
};

const deleteSalesVoucherItem = async (req, res) => {
  try {
    const { companyId, itemId } = req.params;
    // Find the voucher containing the item
    const voucher = await SalesVoucher.findOne({
      'items._id': itemId,
      companyId
    });
    if (!voucher) {
      return res.status(404).json({ error: 'Item not found' });
    }
    // Remove the item from the items array
    voucher.items = voucher.items.filter(item => item._id.toString() !== itemId);
    // If no items left, delete the entire voucher
    if (voucher.items.length === 0) {
      await SalesVoucher.deleteOne({ _id: voucher._id });
      return res.json({
        message: 'Voucher deleted successfully as it had no remaining items',
        deletedVoucher: true
      });
    }
    // Recalculate totals if items remain
    voucher.totalAmount = voucher.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    voucher.discountAmount = voucher.items.reduce((sum, item) => 
      sum + (item.discountBreakdown?.reduce((dSum, d) => dSum + (d.value || 0), 0) || 0), 0);
    voucher.taxAmount = voucher.items.reduce((sum, item) => 
      sum + (item.taxBreakdown?.reduce((tSum, t) => tSum + (t.value || 0), 0) || 0), 0);
    voucher.netAmount = voucher.items.reduce((sum, item) => sum + (item.netAmount || 0), 0);
    voucher.netAmountBeforeTax = voucher.items.reduce((sum, item) => sum + (item.netAmountBeforeTax || 0), 0);
    // Save the updated voucher
    const updatedVoucher = await voucher.save();
    res.json({
      message: 'Item deleted successfully',
      voucher: updatedVoucher,
      deletedVoucher: false
    });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

// Get latest invoice number for a given type/year (month removed)
const getLatestInvoiceNumber = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { invoiceType, year } = req.query; // Removed month parameter
    
    if (!companyId || !invoiceType || !year) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const prefix = invoiceType.charAt(0).toUpperCase() + year;
    
    // Find all invoices for this year and prefix to get the highest sequence number
    const vouchers = await SalesVoucher.find(
      { 
        companyId,
        invoiceNumber: { $regex: `^${prefix}` } 
      },
      'invoiceNumber'
    ).lean();
    
    let maxSeq = 0;
    for (const voucher of vouchers) {
      // Extract the last 4 digits (sequence number) from the invoice number
      const seqStr = voucher.invoiceNumber.slice(-4);
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
    
    const nextSeq = maxSeq + 1;
    res.json({ nextSeq });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get latest invoice number', details: err.message });
  }
};

const postSalesVoucher = async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const voucher = await SalesVoucher.findOne({ _id: id, companyId });
    
    if (!voucher) {
      return res.status(404).json({ error: 'Sales voucher not found' });
    }
    
    voucher.isPosted = true;
    await voucher.save();
    
    res.json({ 
      message: 'Invoice posted successfully', 
      voucher: voucher 
    });
  } catch (err) {
    console.error('Error posting invoice:', err);
    res.status(500).json({ 
      error: 'Failed to post invoice',
      details: err.message 
    });
  }
};

const getSalesChecklistReport = async (req, res) => {
  try {
    const { companyId } = req.params;
    const {
      fromDate,
      toDate,
      debtorAccountId,
      subAccountId,
      finishedGoodId,
      itemId,
      parentCenterId,
      childCenterId
    } = req.query;
    
    console.log('Report query parameters:', {
      companyId,
      fromDate,
      toDate,
      debtorAccountId,
      subAccountId,
      finishedGoodId,
      itemId,
      parentCenterId,
      childCenterId
    });
    
    // Build match criteria
    const matchCriteria = { companyId };
    
    if (fromDate && toDate) {
      // Set the start date to beginning of day
      const startDate = new Date(fromDate);
      startDate.setHours(0, 0, 0, 0);
      
      // Set the end date to end of day
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      
      matchCriteria.invoiceDate = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    // FIXED: Don't convert to ObjectId since they're stored as strings in the schema
    if (debtorAccountId && debtorAccountId !== 'undefined') {
      matchCriteria.debtorAccount = debtorAccountId;
    }
    if (subAccountId && subAccountId !== 'undefined') {
      matchCriteria.subAccount = subAccountId;
    }
    if (parentCenterId && parentCenterId !== 'undefined') {
      matchCriteria.parentCenterId = parentCenterId;
    }
    if (childCenterId && childCenterId !== 'undefined') {
      matchCriteria.childCenterId = childCenterId;
    }
    if (finishedGoodId && finishedGoodId !== 'undefined') {
      matchCriteria.finishedGoodId = finishedGoodId;
    }
    
    console.log('Final match criteria:', JSON.stringify(matchCriteria, null, 2));
    
    // Test query to check if any data exists
    const testResults = await SalesVoucher.find(matchCriteria);
    console.log('Test query results count:', testResults.length);
    
    if (testResults.length === 0) {
      console.log('No matching documents found');
      return res.json([]);
    }
    
    // Build the aggregation pipeline step by step
    let pipeline = [{ $match: matchCriteria }];
    
    // Execute pipeline step by step to debug
    let debugResults = await SalesVoucher.aggregate(pipeline);
    console.log('After initial match, result count:', debugResults.length);
    
    // Add unwind
    pipeline.push({ $unwind: '$items' });
    debugResults = await SalesVoucher.aggregate(pipeline);
    console.log('After unwind, result count:', debugResults.length);
    
    // Log the structure of the first result after unwind
    if (debugResults.length > 0) {
      console.log('First result after unwind:', JSON.stringify(debugResults[0], null, 2));
    }
    
    // Add item-level filters if itemId is provided
    if (itemId && itemId !== 'undefined') {
      const itemFilter = { 'items.productId': itemId };
      console.log('Adding item filter:', JSON.stringify(itemFilter, null, 2));
      
      pipeline.push({ $match: itemFilter });
      debugResults = await SalesVoucher.aggregate(pipeline);
      console.log('After item filter, result count:', debugResults.length);
      
      // Log the structure of the first result after item filter
      if (debugResults.length > 0) {
        console.log('First result after item filter:', JSON.stringify(debugResults[0], null, 2));
      }
    }
    
    // Add lookup stages one by one with debugging
    const stages = [
      {
        name: 'debtorAccount lookup',
        stage: {
          $lookup: {
            from: 'debtoraccounts',
            // FIXED: Convert string to ObjectId for lookup
            let: { debtorAccountIdStr: '$debtorAccount' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', { $toObjectId: '$$debtorAccountIdStr' }]
                  }
                }
              }
            ],
            as: 'debtorAccountInfo'
          }
        }
      },
      {
        name: 'debtorAccount unwind',
        stage: { $unwind: { path: '$debtorAccountInfo', preserveNullAndEmptyArrays: true } }
      },
      {
        name: 'subAccount lookup',
        stage: {
          $lookup: {
            from: 'accountlevel4s',
            // FIXED: Convert string to ObjectId for lookup
            let: { subAccountIdStr: '$subAccount' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', { $toObjectId: '$$subAccountIdStr' }]
                  }
                }
              }
            ],
            as: 'subAccountInfo'
          }
        }
      },
      {
        name: 'subAccount unwind',
        stage: { $unwind: { path: '$subAccountInfo', preserveNullAndEmptyArrays: true } }
      },
      // NEW: Lookup AccountLevel3 for debtor title
      {
        name: 'debtorAccountLevel3 lookup',
        stage: {
          $lookup: {
            from: 'accountlevel3s',
            let: { debtorCode: '$debtorAccountInfo.code' },
            pipeline: [
              {
                $addFields: {
                  combinedCode: { $concat: ['$parentLevel1Code', '$parentLevel2Code', '$code'] }
                }
              },
              {
                $match: {
                  $expr: {
                    $eq: ['$combinedCode', '$$debtorCode']
                  }
                }
              }
            ],
            as: 'debtorAccountLevel3'
          }
        }
      },
      {
        name: 'debtorAccountLevel3 unwind',
        stage: { $unwind: { path: '$debtorAccountLevel3', preserveNullAndEmptyArrays: true } }
      }
    ];
    
    // Only add finished goods lookup if finishedGoodId is provided
    if (finishedGoodId && finishedGoodId !== 'undefined') {
      stages.push(
        {
          name: 'finishedGood lookup',
          stage: {
            $lookup: {
              from: 'finishedgoods',
              // FIXED: Convert string to ObjectId for lookup
              let: { finishedGoodIdStr: '$finishedGoodId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', { $toObjectId: '$$finishedGoodIdStr' }]
                    }
                  }
                }
              ],
              as: 'finishedGoodInfo'
            }
          }
        },
        {
          name: 'finishedGood unwind',
          stage: { $unwind: { path: '$finishedGoodInfo', preserveNullAndEmptyArrays: true } }
        },
        // NEW: Lookup AccountLevel3 for finished good title
        {
          name: 'finishedGoodAccountLevel3 lookup',
          stage: {
            $lookup: {
              from: 'accountlevel3s',
              let: { finishedGoodCode: '$finishedGoodInfo.code' },
              pipeline: [
                {
                  $addFields: {
                    combinedCode: { $concat: ['$parentLevel1Code', '$parentLevel2Code', '$code'] }
                  }
                },
                {
                  $match: {
                    $expr: {
                      $eq: ['$combinedCode', '$$finishedGoodCode']
                    }
                  }
                }
              ],
              as: 'finishedGoodAccountLevel3'
            }
          }
        },
        {
          name: 'finishedGoodAccountLevel3 unwind',
          stage: { $unwind: { path: '$finishedGoodAccountLevel3', preserveNullAndEmptyArrays: true } }
        }
      );
    }
    
    // Add item lookups
    stages.push(
      {
        name: 'itemInfo lookup',
        stage: {
          $lookup: {
            from: 'accountlevel4s',
            let: { productIdStr: '$items.productId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', { $toObjectId: '$$productIdStr' }]
                  }
                }
              }
            ],
            as: 'itemInfo'
          }
        }
      },
      {
        name: 'itemInfo unwind',
        stage: { $unwind: { path: '$itemInfo', preserveNullAndEmptyArrays: true } }
      },
      {
        name: 'unitMeasurement lookup',
        stage: {
          $lookup: {
            from: 'unitmeasurements',
            let: { unitMeasurementIdStr: '$items.unitMeasurementId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', { $toObjectId: '$$unitMeasurementIdStr' }]
                  }
                }
              }
            ],
            as: 'unitMeasurementInfo'
          }
        }
      },
      {
        name: 'unitMeasurement unwind',
        stage: { $unwind: { path: '$unitMeasurementInfo', preserveNullAndEmptyArrays: true } }
      }
    );
    
    // Add center lookups
    stages.push(
      {
        name: 'parentCenter lookup',
        stage: {
          $lookup: {
            from: 'parentcenters',
            // FIXED: Convert string to ObjectId for lookup
            let: { parentCenterIdStr: '$parentCenterId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', { $toObjectId: '$$parentCenterIdStr' }]
                  }
                }
              }
            ],
            as: 'parentCenterInfo'
          }
        }
      },
      {
        name: 'parentCenter unwind',
        stage: { $unwind: { path: '$parentCenterInfo', preserveNullAndEmptyArrays: true } }
      },
      {
        name: 'childCenter lookup',
        stage: {
          $lookup: {
            from: 'childcenters',
            // FIXED: Convert string to ObjectId for lookup
            let: { childCenterIdStr: '$childCenterId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', { $toObjectId: '$$childCenterIdStr' }]
                  }
                }
              }
            ],
            as: 'childCenterInfo'
          }
        }
      },
      {
        name: 'childCenter unwind',
        stage: { $unwind: { path: '$childCenterInfo', preserveNullAndEmptyArrays: true } }
      }
    );
    
    // Execute each stage and log the results
    for (const stageInfo of stages) {
      pipeline.push(stageInfo.stage);
      debugResults = await SalesVoucher.aggregate(pipeline);
      console.log(`After ${stageInfo.name}, result count:`, debugResults.length);
      
      if (debugResults.length > 0) {
        console.log(`First result after ${stageInfo.name}:`, JSON.stringify(debugResults[0], null, 2));
      }
    }
    
    // Add project stage
    pipeline.push({
      $project: {
        invNo: '$invoiceNumber',
        fbrInvoiceNumber: '$fbrInvoiceNumber',
        invDate: '$invoiceDate',
        debtorCode: '$debtorAccountInfo.code',
        subAccountCode: '$subAccountInfo.subcode',
        debtorAccountTitle: '$debtorAccountLevel3.title', // Changed from debtorAccountInfo.title
        subAccountTitle: '$subAccountInfo.title',
        subAccountFullCode: '$subAccountInfo.fullcode', // This is the debtor subaccountfullcode
        additionalInfo: '$customerAddress',
        remarks: '$remarks', // This is the remarks field
        vhn: '$vehicleNumber', // This is the vehicle number
        accountlevel4code: '$itemInfo.fullcode', // Changed from itemCode to accountlevel4code
        itemSubCode: '$itemInfo.subcode',
        finishedGoodTitle: '$finishedGoodAccountLevel3.title', // Changed from finishedGoodInfo.title
        level4title: '$itemInfo.title', // Changed from itemTitle to level4title
        unitOfMeasurement: '$unitMeasurementInfo.code',
        qty: '$items.quantity',
        rate: '$items.rate',
        amount: '$items.amount',
        parentCode: '$parentCenterInfo.parentCode',
        childCode: '$childCenterInfo.childCode',
        parentTitle: '$parentCenterInfo.title',
        childTitle: '$childCenterInfo.title'
      }
    });
    
    console.log('Final pipeline:', JSON.stringify(pipeline, null, 2));
    
    const result = await SalesVoucher.aggregate(pipeline);
    console.log('Final result length:', result.length);
    
    // Log the first result if any
    if (result.length > 0) {
      console.log('First result:', JSON.stringify(result[0], null, 2));
    }
    
    // Add cache control headers to prevent 304 responses
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.json(result);
  } catch (err) {
    console.error('Error generating sales checklist report:', err);
    res.status(500).json({ error: 'Failed to generate report', details: err.message });
  }
};

// Get Sales Summary Report
const getSalesSummaryReport = async (req, res) => {
  try {
    const { companyId } = req.params;
    const {
      fromDate,
      toDate,
      debtorAccountId,
      subAccountId,
      finishedGoodId,
      itemId,
      parentCenterId,
      childCenterId
    } = req.query;
    // Match criteria (keep IDs as strings, same as checklist report)
    const matchCriteria = { companyId };
    if (fromDate && toDate) {
      const startDate = new Date(fromDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      matchCriteria.invoiceDate = { $gte: startDate, $lte: endDate };
    }
    if (debtorAccountId && debtorAccountId !== 'undefined') {
      matchCriteria.debtorAccount = debtorAccountId;
    }
    if (subAccountId && subAccountId !== 'undefined') {
      matchCriteria.subAccount = subAccountId;
    }
    if (parentCenterId && parentCenterId !== 'undefined') {
      matchCriteria.parentCenterId = parentCenterId;
    }
    if (childCenterId && childCenterId !== 'undefined') {
      matchCriteria.childCenterId = childCenterId;
    }
    // Aggregation pipeline
    const pipeline = [
      { $match: matchCriteria },
      { $unwind: '$items' },
      // Apply item-level filters
      ...(itemId && itemId !== 'undefined'
        ? [{ $match: { 'items.productId': itemId } }]
        : []),
      ...(finishedGoodId && finishedGoodId !== 'undefined'
        ? [{ $match: { finishedGoodId } }]
        : []),
      // Lookup debtor account (string → ObjectId)
      {
        $lookup: {
          from: 'debtoraccounts',
          let: { debtorAccountIdStr: '$debtorAccount' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', { $toObjectId: '$$debtorAccountIdStr' }] }
              }
            }
          ],
          as: 'debtorAccountInfo'
        }
      },
      { $unwind: { path: '$debtorAccountInfo', preserveNullAndEmptyArrays: true } },
      // Lookup finished good (string → ObjectId)
      {
        $lookup: {
          from: 'finishedgoods',
          let: { finishedGoodIdStr: '$finishedGoodId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', { $toObjectId: '$$finishedGoodIdStr' }] }
              }
            }
          ],
          as: 'finishedGoodInfo'
        }
      },
      { $unwind: { path: '$finishedGoodInfo', preserveNullAndEmptyArrays: true } },
      // Group by debtor and finished good
      {
        $group: {
          _id: {
            debtorAccountId: '$debtorAccount',
            debtorAccountTitle: '$debtorAccountInfo.title',
            finishedGoodId: '$finishedGoodId',
            finishedGoodTitle: '$finishedGoodInfo.title'
          },
          totalQuantity: { $sum: '$items.quantity' },
          totalAmount: { $sum: '$items.amount' },
          count: { $sum: 1 }
        }
      },
      // Group again for overall totals
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$totalQuantity' },
          totalAmount: { $sum: '$totalAmount' },
          totalInvoices: { $sum: '$count' },
          byDebtorAndGood: {
            $push: {
              debtorAccountId: '$_id.debtorAccountId',
              debtorAccountTitle: '$_id.debtorAccountTitle',
              finishedGoodId: '$_id.finishedGoodId',
              finishedGoodTitle: '$_id.finishedGoodTitle',
              totalQuantity: '$totalQuantity',
              totalAmount: '$totalAmount',
              count: '$count'
            }
          }
        }
      }
    ];
    const [summaryData] = await SalesVoucher.aggregate(pipeline);
    res.json(
      summaryData || {
        totalQuantity: 0,
        totalAmount: 0,
        totalInvoices: 0,
        byDebtorAndGood: []
      }
    );
  } catch (err) {
    console.error('Error generating sales summary report:', err);
    res
      .status(500)
      .json({ error: 'Failed to generate summary', details: err.message });
  }
};

module.exports = {
  createSalesVoucher,
  getSalesVouchers,
  getSalesVoucher,
  getDebtorAccounts,
  getSubAccounts,
  getParentCenters,
  getChildCenters,
  getFinishedGoods,
  getAccountLevel4ForFinishedGood,
  getDefaultDebtorAccount,
  getUnitMeasurements,
  getLatestInvoiceNumber,
  deleteSalesVoucherItem,
  deleteSalesVoucher,
  updateSalesVoucher,
  getSubAccountDetails,
  postSalesVoucher,
   getSalesChecklistReport,
  getSalesSummaryReport
};