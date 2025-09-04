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
  ItemProfile = mongoose.model('ItemProfile');
} catch (e) {
  try {
    ItemProfile = require('../models/ItemProfile');
    console.log('ItemProfile model loaded successfully');
  } catch (err) {
    console.error('Failed to load ItemProfile model:', err);
    if (process.env.NODE_ENV === 'development') {
      ItemProfile = {
        findOne: () => Promise.resolve({ hsCodeValue: 'TESTCODE' })
      };
      console.warn('Using mock ItemProfile model for development');
    }
  }
}

// Helper function to get HS Code for an item
const getHSCodeForItem = async (companyId, finishedGoodId, accountLevel4Id) => {
  if (!finishedGoodId || !accountLevel4Id) return '';
  
  try {
    console.log('Looking up HS Code for:', {
      finishedGood: finishedGoodId,
      accountLevel4: accountLevel4Id
    });
    
    const finishedGoodObjId = new ObjectId(finishedGoodId);
    const accountLevel4ObjId = new ObjectId(accountLevel4Id);
    
    const itemProfile = await ItemProfile.findOne({
      companyId,
      finishedGood: finishedGoodObjId,
      accountLevel4: accountLevel4ObjId
    }).select('hsCodeValue').lean();
    
    if (itemProfile && itemProfile.hsCodeValue) {
      console.log(`Found HS Code "${itemProfile.hsCodeValue}"`);
      return itemProfile.hsCodeValue;
    } else {
      console.log(`No HS Code found in ItemProfile`);
      return '';
    }
  } catch (err) {
    console.error('HS Code lookup error:', {
      error: err.message,
      stack: err.stack
    });
    return '';
  }
};

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

  if (!goDownId || !invoiceType || !debtorAccountId || !subAccountId) {
    throw new Error('GoDown, invoice type, debtor account, and sub account are required');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('At least one item is required');
  }

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
  
  accountingEntries.push({
    debit: netAmount,
    credit: 0
  });
  
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
  
  Object.entries(combinedDiscounts).forEach(([discountTypeId, discount]) => {
    accountingEntries.push({
      debit: discount.value,
      credit: 0
    });
  });
  
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
  
  Object.entries(combinedTaxes).forEach(([taxTypeId, tax]) => {
    accountingEntries.push({
      debit: 0,
      credit: tax.value
    });
  });
  
  items.forEach(item => {
    accountingEntries.push({
      debit: 0,
      credit: item.amount || 0
    });
  });
  
  return accountingEntries;
};

// Helper function to generate invoice number
const generateInvoiceNumber = async (companyId, invoiceType, invoiceDate, invoiceNumber) => {
  if (invoiceNumber) return invoiceNumber;
  
  const now = new Date(invoiceDate ? new Date(invoiceDate) : new Date());
  const year = now.getFullYear().toString();
  const prefix = invoiceType.charAt(0).toUpperCase();
  
  const vouchers = await SalesVoucher.find(
    { 
      companyId,
      invoiceNumber: { $regex: `^${prefix}${year}` } 
    },
    'invoiceNumber'
  ).lean();
  
  let maxSeq = 0;
  for (const voucher of vouchers) {
    const seqStr = voucher.invoiceNumber.slice(-4);
    const seq = parseInt(seqStr, 10);
    if (!isNaN(seq) && seq > maxSeq) {
      maxSeq = seq;
    }
  }
  
  const nextSeq = maxSeq + 1;
  return `${prefix}${year}${nextSeq.toString().padStart(4, '0')}`;
};

// Helper function to check if an item is exempted
const checkItemExemption = async (companyId, accountLevel4Id, itemId) => {
  try {
    const taxRateSetting = await TaxRate.findOne({
      companyId,
      accountLevel4Id,
      itemId,
      isActive: true
    }).sort({ applicableDate: -1 });
    
    return taxRateSetting ? taxRateSetting.isExempted : false;
  } catch (err) {
    console.error('Error checking item exemption:', err);
    return false;
  }
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
  
  // Process items without storing HS Code
  const processedItems = await Promise.all(items.map(async (item) => {
    // Check if the item is exempted
    const isExempted = item.accountLevel4Id && item.finishedGoodId 
      ? await checkItemExemption(companyId, item.accountLevel4Id, item.finishedGoodId)
      : false;
    
    return {
      ...item,
      isExempted: isExempted
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
    finishedGoodId: processedItems[0]?.finishedGoodId || null,
    finishedGoodCode: processedItems[0]?.finishedGoodCode || null,
    accountLevel4Id: processedItems[0]?.accountLevel4Id || null,
    accountLevel4FullCode: subAccount.fullcode,
    items: processedItems.map(item => ({
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
      isExempted: item.isExempted || false
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

// Helper function to add titles and HS Code to a voucher
const addTitlesToVoucher = async (voucher) => {
  console.log('Backend: Found voucher with items count:', voucher.items.length);
  
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
  
  const itemProductMap = itemProducts.reduce((map, product) => {
    map[product.fullcode] = product.title;
    return map;
  }, {});
  
  const itemSubAccountMap = itemSubAccounts.reduce((map, subAccount) => {
    map[subAccount.fullcode] = subAccount.title;
    return map;
  }, {});
  
  // Get unique (finishedGoodId, accountLevel4Id) pairs from the items
  const itemKeys = voucher.items.map(item => ({
    finishedGoodId: item.finishedGoodId,
    accountLevel4Id: item.accountLevel4Id
  }));

  const uniqueKeys = [...new Map(itemKeys.map(key => [`${key.finishedGoodId}-${key.accountLevel4Id}`, key])).values()];

  const hsCodeMap = {};
  await Promise.all(uniqueKeys.map(async (key) => {
    hsCodeMap[`${key.finishedGoodId}-${key.accountLevel4Id}`] = await getHSCodeForItem(
      voucher.companyId,
      key.finishedGoodId,
      key.accountLevel4Id
    );
  }));

  // Use stored exemption status
  const itemsWithHSCode = voucher.items.map(item => ({
    ...item.toObject(),
    isExempted: item.isExempted || false,
    hsCode: hsCodeMap[`${item.finishedGoodId}-${item.accountLevel4Id}`] || ''
  }));
  
  // Add titles to the voucher object
  const voucherWithTitles = {
    ...voucher.toObject(),
    debtorAccountTitle: debtorAccount?.title || 'N/A',
    subAccountTitle: subAccount?.title || 'N/A',
    finishedGoodTitle: finishedGood?.title || 'N/A',
    accountLevel4Title: accountLevel4?.title || 'N/A',
    items: itemsWithHSCode.map(item => ({
      ...item,
      productName: itemProductMap[item.productCode] || 'N/A',
      subAccountTitle: itemSubAccountMap[item.subAccountFullCode] || 'N/A'
    }))
  };
  
  console.log('Backend: Prepared response with voucher items:', voucherWithTitles.items.length);
  
  return voucherWithTitles;
};

// Update the getSalesVouchers function to include titles and HS Codes
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
    
    // Collect all unique (finishedGoodId, accountLevel4Id) pairs for HS Code lookup
    const allItemKeys = vouchers.flatMap(voucher => 
      voucher.items.map(item => ({
        finishedGoodId: item.finishedGoodId,
        accountLevel4Id: item.accountLevel4Id,
        companyId: voucher.companyId
      }))
    );
    
    const uniqueItemKeys = [...new Map(
      allItemKeys.map(key => [`${key.finishedGoodId}-${key.accountLevel4Id}`, key])
    ).values()];
    
    const hsCodeMap = {};
    await Promise.all(uniqueItemKeys.map(async (key) => {
      hsCodeMap[`${key.finishedGoodId}-${key.accountLevel4Id}`] = await getHSCodeForItem(
        key.companyId,
        key.finishedGoodId,
        key.accountLevel4Id
      );
    }));
    
    // Map titles and HS Codes to each voucher
    const vouchersWithTitles = vouchers.map(voucher => {
      return {
        ...voucher,
        debtorAccountTitle: debtorAccountMap[voucher.debtorAccount] || 'N/A',
        subAccountTitle: subAccountMap[voucher.subAccountFullCode] || 'N/A',
        finishedGoodTitle: finishedGoodMap[voucher.finishedGoodCode] || 'N/A',
        accountLevel4Title: accountLevel4Map[voucher.accountLevel4FullCode] || 'N/A',
        items: voucher.items.map(item => {
          return {
            ...item,
            productName: itemProductMap[item.productCode] || 'N/A',
            subAccountTitle: itemSubAccountMap[item.subAccountFullCode] || 'N/A',
            hsCode: hsCodeMap[`${item.finishedGoodId}-${item.accountLevel4Id}`] || ''
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

// Update the getSalesVoucher function to include titles and HS Codes
const getSalesVoucher = async (req, res) => {
  try {
    console.log('Backend: getSalesVoucher called with id:', req.params.id);
    const { id } = req.params;
    let voucher;
    
    if (mongoose.Types.ObjectId.isValid(id)) {
      voucher = await SalesVoucher.findById(id);
      if (!voucher) {
        console.log('Backend: Sales voucher not found with id:', id);
        return res.status(404).json({ error: 'Sales voucher not found' });
      }
    } else {
      const input = id;
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
    
    // Add titles and HS Code to the voucher
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

// Update getSalesChecklistReport to include HS Code lookup
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
    
    const matchCriteria = { companyId };
    
    if (fromDate && toDate) {
      const startDate = new Date(fromDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      matchCriteria.invoiceDate = {
        $gte: startDate,
        $lte: endDate
      };
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
    if (finishedGoodId && finishedGoodId !== 'undefined') {
      matchCriteria.finishedGoodId = finishedGoodId;
    }
    
    console.log('Final match criteria:', JSON.stringify(matchCriteria, null, 2));
    
    const testResults = await SalesVoucher.find(matchCriteria);
    console.log('Test query results count:', testResults.length);
    
    if (testResults.length === 0) {
      console.log('No matching documents found');
      return res.json([]);
    }
    
    let pipeline = [{ $match: matchCriteria }];
    
    let debugResults = await SalesVoucher.aggregate(pipeline);
    console.log('After initial match, result count:', debugResults.length);
    
    pipeline.push({ $unwind: '$items' });
    debugResults = await SalesVoucher.aggregate(pipeline);
    console.log('After unwind, result count:', debugResults.length);
    
    if (itemId && itemId !== 'undefined') {
      const itemFilter = { 'items.productId': itemId };
      console.log('Adding item filter:', JSON.stringify(itemFilter, null, 2));
      
      pipeline.push({ $match: itemFilter });
      debugResults = await SalesVoucher.aggregate(pipeline);
      console.log('After item filter, result count:', debugResults.length);
    }
    
    const stages = [
      {
        name: 'debtorAccount lookup',
        stage: {
          $lookup: {
            from: 'debtoraccounts',
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
    
    if (finishedGoodId && finishedGoodId !== 'undefined') {
      stages.push(
        {
          name: 'finishedGood lookup',
          stage: {
            $lookup: {
              from: 'finishedgoods',
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
      },
      // New stage for HS Code lookup
      {
        name: 'hsCode lookup',
        stage: {
          $lookup: {
            from: 'itemprofiles',
            let: {
              companyIdObj: { $toObjectId: companyId },
              finishedGoodIdStr: '$finishedGoodId',
              accountLevel4IdStr: '$items.accountLevel4Id'
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$companyId', '$$companyIdObj'] },
                      { $eq: ['$finishedGood', { $toObjectId: '$$finishedGoodIdStr' }] },
                      { $eq: ['$accountLevel4', { $toObjectId: '$$accountLevel4IdStr' }] }
                    ]
                  }
                }
              },
              { $project: { hsCodeValue: 1 } }
            ],
            as: 'itemProfile'
          }
        }
      },
      {
        name: 'itemProfile unwind',
        stage: { $unwind: { path: '$itemProfile', preserveNullAndEmptyArrays: true } }
      }
    );
    
    stages.push(
      {
        name: 'parentCenter lookup',
        stage: {
          $lookup: {
            from: 'parentcenters',
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
    
    for (const stageInfo of stages) {
      pipeline.push(stageInfo.stage);
      debugResults = await SalesVoucher.aggregate(pipeline);
      console.log(`After ${stageInfo.name}, result count:`, debugResults.length);
    }
    
    pipeline.push({
      $project: {
        invNo: '$invoiceNumber',
        fbrInvoiceNumber: '$fbrInvoiceNumber',
        invDate: '$invoiceDate',
        debtorCode: '$debtorAccountInfo.code',
        subAccountCode: '$subAccountInfo.subcode',
        debtorAccountTitle: '$debtorAccountLevel3.title',
        subAccountTitle: '$subAccountInfo.title',
        subAccountFullCode: '$subAccountInfo.fullcode',
        additionalInfo: '$customerAddress',
        remarks: '$remarks',
        vhn: '$vehicleNumber',
        accountlevel4code: '$itemInfo.fullcode',
        itemSubCode: '$itemInfo.subcode',
        finishedGoodTitle: '$finishedGoodAccountLevel3.title',
        level4title: '$itemInfo.title',
        unitOfMeasurement: '$unitMeasurementInfo.code',
        qty: '$items.quantity',
        rate: '$items.rate',
        amount: '$items.amount',
        parentCode: '$parentCenterInfo.parentCode',
        childCode: '$childCenterInfo.childCode',
        parentTitle: '$parentCenterInfo.title',
        childTitle: '$childCenterInfo.title',
        isExempted: '$items.isExempted',
        hsCode: '$itemProfile.hsCodeValue' // Add HS Code to projection
      }
    });
    
    console.log('Final pipeline:', JSON.stringify(pipeline, null, 2));
    
    const result = await SalesVoucher.aggregate(pipeline);
    console.log('Final result length:', result.length);
    
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.json(result);
  } catch (err) {
    console.error('Error generating sales checklist report:', err);
    res.status(500).json({ error: 'Failed to generate report', details: err.message });
  }
};

// Keep all other functions unchanged
const getSubAccountDetails = async (req, res) => {
  try {
    const { companyId, subAccountId } = req.params;
    
    const subAccount = await AccountLevel4.findOne({
      _id: subAccountId,
      companyId
    });
    
    if (!subAccount) {
      return res.status(404).json({ error: 'Sub account not found' });
    }
    
    const taxRates = await TaxRate.find({
      companyId,
      accountLevel4Id: subAccountId,
      isActive: true
    }).sort({ applicableDate: -1 }).limit(1);
    
    const discountRates = await Discount.find({
      companyId,
      accountLevel4: subAccountId,
      isActive: true
    }).sort({ applicableDate: -1 }).limit(1);
    
    const discounts = discountRates.length > 0 
      ? discountRates[0].discountRates.map(d => ({
          type: d.type,
          rate: d.rate,
          isEditable: d.isEditable || false,
          discountTypeId: d.discountTypeId
        }))
      : [];
    
    const taxes = taxRates.length > 0 
      ? taxRates[0].taxRates.map(t => ({
          type: t.type,
          rate: t.registeredValue,
          isEditable: t.isEditable || false,
          taxTypeId: t.taxTypeId,
          registeredValue: t.registeredValue,
          unregisteredValue: t.unregisteredValue
        }))
      : [];
    
    const isExempted = taxRates.length > 0 ? taxRates[0].isExempted : false;
    
    res.json({
      discounts,
      taxes,
      isExempted,
      subAccountDetails: {
        code: subAccount.code,
        subcode: subAccount.subcode,
        fullcode: subAccount.fullcode,
        hsCode: subAccount.hsCode || ''
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
    
    const isSubAccountChanged = updateData.subAccount && 
      updateData.subAccount.toString() !== existingVoucher.subAccount.toString();
    
    const references = await validateSalesVoucherData(companyId, updateData);
    
    let discountRates = [];
    let taxRates = [];
    let isExempted = false;
    
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
      isExempted = taxResponse?.isExempted || false;
    }
    
    let voucherData = await prepareVoucherData(companyId, updateData, references);
    
    if (isSubAccountChanged) {
      voucherData.items = voucherData.items.map(item => {
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
        
        let taxBreakdown = [];
        let totalTax = 0;
        
        if (!isExempted) {
          taxBreakdown = taxRates.map(tax => ({
            type: tax.type,
            rate: tax.registeredValue,
            value: tax.type === 'quantity' 
              ? item.quantity * tax.rate 
              : item.amount * (tax.rate / 100),
            taxTypeId: tax._id,
            registeredValue: tax.registeredValue,
            unregisteredValue: tax.unregisteredValue
          }));
          
          totalTax = taxBreakdown.reduce((sum, t) => sum + t.value, 0);
        }
        
        const totalDiscount = discountBreakdown.reduce((sum, d) => sum + d.value, 0);
        
        return {
          ...item,
          discountBreakdown,
          taxBreakdown,
          discount: totalDiscount,
          tax: totalTax,
          isExempted: isExempted,
          netAmountBeforeTax: item.amount - totalDiscount,
          netAmount: (item.amount - totalDiscount) + totalTax
        };
      });
      
      const totals = calculateTotals(voucherData.items);
      voucherData = {
        ...voucherData,
        ...totals,
        accountingEntries: generateAccountingEntries(voucherData.items, references.subAccount, totals.netAmount)
      };
    }
    
    Object.assign(existingVoucher, voucherData);
    const updatedVoucher = await existingVoucher.save();
    
    // Add titles and HS Code to the response
    const voucherWithTitles = await addTitlesToVoucher(updatedVoucher);
    
    res.json({
      message: 'Sales voucher updated successfully',
      voucher: voucherWithTitles
    });
  } catch (err) {
    console.error('Error updating sales voucher:', err);
    res.status(500).json({ error: err.message || 'Failed to update sales voucher' });
  }
};

const createSalesVoucher = async (req, res) => {
  try {
    const { companyId } = req.params;
    const createData = req.body;
    
    const references = await validateSalesVoucherData(companyId, createData);
    
    const finalInvoiceNumber = await generateInvoiceNumber(
      companyId,
      createData.invoiceType,
      createData.invoiceDate,
      createData.invoiceNumber
    );
    
    const voucherData = await prepareVoucherData(companyId, {
      ...createData,
      invoiceNumber: finalInvoiceNumber
    }, references);
    
    const newVoucher = new SalesVoucher(voucherData);
    await newVoucher.save();
    
    // Add titles and HS Code to the response
    const voucherWithTitles = await addTitlesToVoucher(newVoucher);
    
    res.status(201).json({
      message: 'Sales voucher created successfully',
      voucher: voucherWithTitles
    });
  } catch (err) {
    console.error('Error creating sales voucher:', err);
    res.status(500).json({
      error: err.message || 'Failed to create sales voucher',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Keep all other functions unchanged (getDebtorAccounts, getSubAccounts, etc.)
const getDebtorAccounts = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const debtorAccounts = await DebtorAccount.find({ companyId, isActive: true })
      .select('_id code')
      .sort({ code: 1 });
    
    const accountLevel3Records = await AccountLevel3.find({ companyId })
      .select('parentLevel1Code parentLevel2Code code title');
    
    const codeToTitleMap = {};
    accountLevel3Records.forEach(record => {
      const combinedCode = record.parentLevel1Code + record.parentLevel2Code + record.code;
      codeToTitleMap[combinedCode] = record.title;
    });
    
    const result = debtorAccounts.map(account => {
      const accountLevel3Title = codeToTitleMap[account.code] || '';
      console.log(`Debtor Account: Code - ${account.code}, Title - ${accountLevel3Title}`);
      
      return {
        _id: account._id.toString(),
        code: account.code,
        title: accountLevel3Title
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
    .select('_id subcode fullcode title')
    .sort({ subcode: 1 });
    
    res.json(subAccounts.map(subAccount => ({
      _id: subAccount._id.toString(),
      subcode: subAccount.subcode,
      fullcode: subAccount.fullcode,
      title: subAccount.title || ''
    })));
  } catch (err) {
    console.error('Error fetching sub accounts:', err);
    res.status(500).json({
      error: 'Failed to fetch sub accounts',
      details: err.message
    });
  }
};

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

const getFinishedGoods = async (req, res) => {
  try {
    const { companyId } = req.params;
    console.log(`Fetching finished goods for company: ${companyId}`);
    
    const finishedGoods = await FinishedGoods.find({ companyId })
      .select('_id code')
      .sort({ code: 1 });
    
    console.log(`Found ${finishedGoods.length} finished goods records`);
    if (finishedGoods.length === 0) {
      console.log('No finished goods found for this company');
      return res.json([]);
    }
    
    finishedGoods.forEach(good => {
      console.log(`Finished Good: Code - ${good.code}`);
    });
    
    const accountLevel3Records = await AccountLevel3.find({ companyId })
      .select('parentLevel1Code parentLevel2Code code title');
    
    console.log(`Found ${accountLevel3Records.length} AccountLevel3 records`);
    
    const codeToTitleMap = {};
    accountLevel3Records.forEach(record => {
      const combinedCode = record.parentLevel1Code + record.parentLevel2Code + record.code;
      codeToTitleMap[combinedCode] = record.title;
      console.log(`AccountLevel3 mapping: ${combinedCode} -> ${record.title}`);
    });
    
    const result = finishedGoods.map(good => {
      const accountLevel3Title = codeToTitleMap[good.code] || '';
      console.log(`Finished Goods Account: Code - ${good.code}, Title - ${accountLevel3Title}`);
      
      return {
        _id: good._id.toString(),
        code: good.code,
        title: accountLevel3Title
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
    .select('_id subcode fullcode title')
    .sort({ subcode: 1 });
    
    res.json(accountLevel4s.map(account => ({
      _id: account._id.toString(),
      subcode: account.subcode,
      fullcode: account.fullcode,
      title: account.title || ''
    })));
  } catch (err) {
    console.error('Error fetching account level 4:', err);
    res.status(500).json({
      error: 'Failed to fetch account level 4',
      details: err.message
    });
  }
};

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
    const voucher = await SalesVoucher.findOne({
      'items._id': itemId,
      companyId
    });
    if (!voucher) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    voucher.items = voucher.items.filter(item => item._id.toString() !== itemId);
    
    if (voucher.items.length === 0) {
      await SalesVoucher.deleteOne({ _id: voucher._id });
      return res.json({
        message: 'Voucher deleted successfully as it had no remaining items',
        deletedVoucher: true
      });
    }
    
    voucher.totalAmount = voucher.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    voucher.discountAmount = voucher.items.reduce((sum, item) => 
      sum + (item.discountBreakdown?.reduce((dSum, d) => dSum + (d.value || 0), 0) || 0), 0);
    voucher.taxAmount = voucher.items.reduce((sum, item) => 
      sum + (item.taxBreakdown?.reduce((tSum, t) => tSum + (t.value || 0), 0) || 0), 0);
    voucher.netAmount = voucher.items.reduce((sum, item) => sum + (item.netAmount || 0), 0);
    voucher.netAmountBeforeTax = voucher.items.reduce((sum, item) => sum + (item.netAmountBeforeTax || 0), 0);
    
    const updatedVoucher = await voucher.save();
    
    // Add titles and HS Code to the response
    const voucherWithTitles = await addTitlesToVoucher(updatedVoucher);
    
    res.json({
      message: 'Item deleted successfully',
      voucher: voucherWithTitles,
      deletedVoucher: false
    });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

const getLatestInvoiceNumber = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { invoiceType, year } = req.query;
    
    if (!companyId || !invoiceType || !year) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const prefix = invoiceType.charAt(0).toUpperCase() + year;
    
    const vouchers = await SalesVoucher.find(
      { 
        companyId,
        invoiceNumber: { $regex: `^${prefix}` } 
      },
      'invoiceNumber'
    ).lean();
    
    let maxSeq = 0;
    for (const voucher of vouchers) {
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
    const { fbrInvoiceNumber } = req.body;
    
    const voucher = await SalesVoucher.findOne({ _id: id, companyId });
    
    if (!voucher) {
      return res.status(404).json({ error: 'Sales voucher not found' });
    }
    
    voucher.isPosted = true;
    
    if (fbrInvoiceNumber) {
      voucher.fbrInvoiceNumber = fbrInvoiceNumber;
    }
    
    await voucher.save();
    
    // Add titles and HS Code to the response
    const voucherWithTitles = await addTitlesToVoucher(voucher);
    
    res.json({ 
      message: 'Invoice posted successfully', 
      voucher: voucherWithTitles
    });
  } catch (err) {
    console.error('Error posting invoice:', err);
    res.status(500).json({ 
      error: 'Failed to post invoice',
      details: err.message 
    });
  }
};

const updateFbrInvoiceNumber = async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const { fbrInvoiceNumber } = req.body;
    
    if (!fbrInvoiceNumber) {
      return res.status(400).json({ error: 'FBR invoice number is required' });
    }
    
    const voucher = await SalesVoucher.findOne({ _id: id, companyId });
    
    if (!voucher) {
      return res.status(404).json({ error: 'Sales voucher not found' });
    }
    
    voucher.fbrInvoiceNumber = fbrInvoiceNumber;
    voucher.isPosted = true;
    
    await voucher.save();
    
    // Add titles and HS Code to the response
    const voucherWithTitles = await addTitlesToVoucher(voucher);
    
    res.json({ 
      message: 'FBR invoice number updated successfully', 
      voucher: voucherWithTitles
    });
  } catch (err) {
    console.error('Error updating FBR invoice number:', err);
    res.status(500).json({ 
      error: 'Failed to update FBR invoice number',
      details: err.message 
    });
  }
};

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
    
    const pipeline = [
      { $match: matchCriteria },
      { $unwind: '$items' },
      ...(itemId && itemId !== 'undefined'
        ? [{ $match: { 'items.productId': itemId } }]
        : []),
      ...(finishedGoodId && finishedGoodId !== 'undefined'
        ? [{ $match: { finishedGoodId } }]
        : []),
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
      {
        $group: {
          _id: {
            debtorAccountId: '$debtorAccount',
            debtorAccountTitle: '$debtorAccountInfo.title',
            finishedGoodId: '$finishedGoodId',
            finishedGoodTitle: '$finishedGoodInfo.title',
            isExempted: '$items.isExempted'
          },
          totalQuantity: { $sum: '$items.quantity' },
          totalAmount: { $sum: '$items.amount' },
          count: { $sum: 1 }
        }
      },
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
              isExempted: '$_id.isExempted',
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
  updateFbrInvoiceNumber,
  getSalesChecklistReport,
  getSalesSummaryReport
};