const express = require('express');
const router = express.Router();
const salesVoucherController = require('../controllers/salesVoucherController');
const SalesVoucher = require('../models/SalesVoucher');
const AccountLevel4 = require('../models/AccountLevel4');

// Base path: /api/sales-vouchers
// Get all sales vouchers
router.get('/:companyId/all', async (req, res) => {
  try {
    console.log('Routes: Getting all sales vouchers for company:', req.params.companyId);
    
    const vouchers = await SalesVoucher.find({ companyId: req.params.companyId })
      .populate({
        path: 'debtorAccount',
        select: 'code title',
        model: 'DebtorAccount'
      })
      .populate({
        path: 'subAccount',
        select: 'subcode title fullcode',
        model: 'AccountLevel4'
      })
      .populate({
        path: 'accountLevel4Id',
        select: 'fullcode title',
        model: 'AccountLevel4'
      })
      .populate({
        path: 'finishedGoodId',
        select: 'code title',
        model: 'FinishedGoods'
      })
      .populate({
        path: 'unitMeasurementId',
        select: 'code title',
        model: 'UnitMeasurement'
      })
      .populate({
        path: 'parentCenterId',
        select: 'parentCode title',
        model: 'ParentCenter'
      })
      .populate({
        path: 'childCenterId',
        select: 'childCode title',
        model: 'ChildCenter'
      })
      .sort({ invoiceDate: -1, createdAt: -1 });
    
    console.log('Routes: Retrieved', vouchers.length, 'vouchers');
    
    // Process vouchers to add product names and subaccount titles based on full codes
    const processedVouchers = await Promise.all(vouchers.map(async (voucher) => {
      const voucherObj = voucher.toObject();
      
      // Get all unique product codes from items
      const productCodes = [...new Set(
        voucherObj.items.map(item => item.productCode).filter(Boolean)
      )];
      
      // Get all unique subAccountFullCodes from items
      const subAccountFullCodes = [...new Set(
        voucherObj.items.map(item => item.subAccountFullCode).filter(Boolean)
      )];
      
      console.log('Routes: Processing voucher with product codes:', productCodes);
      console.log('Routes: Processing voucher with subAccountFullCodes:', subAccountFullCodes);
      
      // Fetch AccountLevel4 records for these product codes
      const products = await AccountLevel4.find({
        fullcode: { $in: productCodes }
      }).select('fullcode title').lean();
      
      // Fetch AccountLevel4 records for these subAccountFullCodes
      const subAccounts = await AccountLevel4.find({
        fullcode: { $in: subAccountFullCodes }
      }).select('fullcode title').lean();
      
      // Create a map of productCode to title
      const productMap = products.reduce((map, product) => {
        map[product.fullcode] = product.title;
        return map;
      }, {});
      
      // Create a map of subAccountFullCode to title
      const subAccountMap = subAccounts.reduce((map, subAccount) => {
        map[subAccount.fullcode] = subAccount.title;
        return map;
      }, {});
      
      console.log('Routes: Product map created with keys:', Object.keys(productMap));
      console.log('Routes: SubAccount map created with keys:', Object.keys(subAccountMap));
      
      // Update items with product names and subaccount titles
      voucherObj.items = voucherObj.items.map(item => ({
        ...item,
        productName: productMap[item.productCode] || 'N/A',
        subAccountTitle: subAccountMap[item.subAccountFullCode] || 'N/A'
      }));
      
      return voucherObj;
    }));
    
    res.json(processedVouchers);
  } catch (err) {
    console.error('Routes: Error fetching sales vouchers:', err);
    res.status(500).json({ error: 'Failed to fetch sales vouchers' });
  }
});

// Search invoice by number (updated to support partial invoice numbers)
router.get('/:companyId/search', async (req, res) => {
  try {
    const { invoiceNumber } = req.query;
    console.log('Routes: Searching invoice with number:', invoiceNumber);
    
    if (!invoiceNumber) {
      return res.status(400).json({ error: 'Invoice number is required' });
    }
    
    let invoice;
    
    // Check if invoiceNumber is all digits (partial search)
    if (/^\d+$/.test(invoiceNumber)) {
      // Pad the input to 4 digits with leading zeros
      let lastFour = invoiceNumber.slice(-4);
      if (lastFour.length < 4) {
        lastFour = lastFour.padStart(4, '0');
      }
      
      // Search for invoices ending with these digits
      const condition = { 
        companyId: req.params.companyId,
        invoiceNumber: { $regex: lastFour + '$' }
      };
      
      const invoices = await SalesVoucher.find(condition)
        .populate({
          path: 'debtorAccount',
          select: 'code title',
          model: 'DebtorAccount'
        })
        .populate({
          path: 'subAccount',
          select: 'subcode title fullcode',
          model: 'AccountLevel4'
        })
        .populate({
          path: 'accountLevel4Id',
          select: 'fullcode title',
          model: 'AccountLevel4'
        })
        .populate({
          path: 'finishedGoodId',
          select: 'code title',
          model: 'FinishedGoods'
        })
        .populate({
          path: 'unitMeasurementId',
          select: 'code title',
          model: 'UnitMeasurement'
        })
        .populate({
          path: 'parentCenterId',
          select: 'parentCode title',
          model: 'ParentCenter'
        })
        .populate({
          path: 'childCenterId',
          select: 'childCode title',
          model: 'ChildCenter'
        });
      
      if (invoices.length === 0) {
        console.log('Routes: No invoice found with these last digits');
        return res.status(404).json({ error: 'No invoice found with these last digits' });
      } else if (invoices.length > 1) {
        console.log('Routes: Multiple invoices found with these last digits');
        return res.status(400).json({ error: 'Multiple invoices found with these last digits. Please enter more digits or the complete invoice number.' });
      } else {
        invoice = invoices[0];
      }
    } else {
      // Full invoice number search
      invoice = await SalesVoucher.findOne({
        companyId: req.params.companyId,
        invoiceNumber
      })
      .populate({
        path: 'debtorAccount',
        select: 'code title',
        model: 'DebtorAccount'
      })
      .populate({
        path: 'subAccount',
        select: 'subcode title fullcode',
        model: 'AccountLevel4'
      })
      .populate({
        path: 'accountLevel4Id',
        select: 'fullcode title',
        model: 'AccountLevel4'
      })
      .populate({
        path: 'finishedGoodId',
        select: 'code title',
        model: 'FinishedGoods'
      })
      .populate({
        path: 'unitMeasurementId',
        select: 'code title',
        model: 'UnitMeasurement'
      })
      .populate({
        path: 'parentCenterId',
        select: 'parentCode title',
        model: 'ParentCenter'
      })
      .populate({
        path: 'childCenterId',
        select: 'childCode title',
        model: 'ChildCenter'
      });
      
      if (!invoice) {
        console.log('Routes: Invoice not found');
        return res.status(404).json({ error: 'Invoice not found' });
      }
    }
    
    // Process the invoice to add product names and subaccount titles
    const invoiceObj = invoice.toObject();
    
    // Get all unique product codes from items
    const productCodes = [...new Set(
      invoiceObj.items.map(item => item.productCode).filter(Boolean)
    )];
    
    // Get all unique subAccountFullCodes from items
    const subAccountFullCodes = [...new Set(
      invoiceObj.items.map(item => item.subAccountFullCode).filter(Boolean)
    )];
    
    console.log('Routes: Processing invoice with product codes:', productCodes);
    console.log('Routes: Processing invoice with subAccountFullCodes:', subAccountFullCodes);
    
    // Fetch AccountLevel4 records for these product codes
    const products = await AccountLevel4.find({
      fullcode: { $in: productCodes }
    }).select('fullcode title').lean();
    
    // Fetch AccountLevel4 records for these subAccountFullCodes
    const subAccounts = await AccountLevel4.find({
      fullcode: { $in: subAccountFullCodes }
    }).select('fullcode title').lean();
    
    // Create a map of productCode to title
    const productMap = products.reduce((map, product) => {
      map[product.fullcode] = product.title;
      return map;
    }, {});
    
    // Create a map of subAccountFullCode to title
    const subAccountMap = subAccounts.reduce((map, subAccount) => {
      map[subAccount.fullcode] = subAccount.title;
      return map;
    }, {});
    
    console.log('Routes: Product map created with keys:', Object.keys(productMap));
    console.log('Routes: SubAccount map created with keys:', Object.keys(subAccountMap));
    
    // Update items with product names and subaccount titles
    invoiceObj.items = invoiceObj.items.map(item => ({
      ...item,
      productName: productMap[item.productCode] || 'N/A',
      subAccountTitle: subAccountMap[item.subAccountFullCode] || 'N/A'
    }));
    
    res.json(invoiceObj);
  } catch (err) {
    console.error('Routes: Error searching invoice:', err);
    res.status(500).json({ error: 'Failed to search invoice' });
  }
});

// Get latest invoice number (updated to remove month parameter)
router.get('/:companyId/latest-invoice-number', async (req, res) => {
  try {
    const { invoiceType, year } = req.query; // Removed month parameter
    console.log('Routes: Getting latest invoice number for:', { invoiceType, year });
    
    if (!invoiceType || !year) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const prefix = invoiceType.charAt(0).toUpperCase();
    const regex = new RegExp(`^${prefix}${year}\\d{4}$`); // Updated regex to exclude month
    
    // Find all invoices for this year and prefix to get the highest sequence number
    const invoices = await SalesVoucher.find(
      { 
        companyId: req.params.companyId,
        invoiceNumber: { $regex: regex }
      },
      { invoiceNumber: 1 }
    ).lean();
    
    let maxSeq = 0;
    for (const invoice of invoices) {
      // Extract the last 4 digits (sequence number) from the invoice number
      const seqStr = invoice.invoiceNumber.slice(-4);
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
    
    const nextSeq = maxSeq + 1;
    console.log('Routes: Next sequence number:', nextSeq);
    
    res.json({ nextSeq });
  } catch (err) {
    console.error('Routes: Error fetching latest invoice number:', err);
    res.status(500).json({ error: 'Failed to fetch latest invoice number' });
  }
});

// Create a new sales voucher
router.post('/:companyId', salesVoucherController.createSalesVoucher);

// Get all sales vouchers for a company
router.get('/:companyId', salesVoucherController.getSalesVouchers);

// Get a single sales voucher (supports both ObjectId and invoice number/partial digits)
router.get('/detail/:id', salesVoucherController.getSalesVoucher);

// Get debtor accounts for a company
router.get('/:companyId/debtor-accounts', salesVoucherController.getDebtorAccounts);

// Get sub account details
router.get('/:companyId/sub-account-details/:subAccountId', salesVoucherController.getSubAccountDetails);

// Get sub accounts for a debtor account
router.get('/:companyId/sub-accounts/:debtorAccountId', salesVoucherController.getSubAccounts);

// Get parent centers for a company
router.get('/:companyId/parent-centers', salesVoucherController.getParentCenters);

// Get child centers for a parent center
router.get('/:companyId/child-centers/:parentCenterId', salesVoucherController.getChildCenters);

// Get finished goods for a company
router.get('/:companyId/finished-goods', salesVoucherController.getFinishedGoods);

// Get account level 4 for a finished good
router.get('/:companyId/account-level4/:finishedGoodCode', salesVoucherController.getAccountLevel4ForFinishedGood);

// Get default debtor account for a company
router.get('/:companyId/default-debtor-account', salesVoucherController.getDefaultDebtorAccount);

// Get unit measurements for a company
router.get('/:companyId/unit-measurements', salesVoucherController.getUnitMeasurements);

// Update an existing invoice
router.put('/:companyId/:id', salesVoucherController.updateSalesVoucher);

// Delete a sales voucher
router.delete('/:companyId/:id', salesVoucherController.deleteSalesVoucher);

// Get sub-account discounts
router.get('/:companyId/sub-account-discounts/:subAccountId', async (req, res) => {
  try {
    const { companyId, subAccountId } = req.params;
    console.log('Routes: Getting sub-account discounts for:', { companyId, subAccountId });
    
    // Fetch discounts that apply to this sub-account
    const discounts = await Discount.find({
      companyId,
      debtorAccountLevel4Id: subAccountId,
      isActive: true
    }).populate('discountRates');
    
    // Format the response
    const formattedDiscounts = discounts.flatMap(discount => 
      discount.discountRates.map(rate => ({
        ...rate.toObject(),
        title: discount.title,
        isEditable: discount.isEditable
      }))
    );
    
    console.log('Routes: Found', formattedDiscounts.length, 'discounts');
    
    res.json(formattedDiscounts);
  } catch (err) {
    console.error('Routes: Error getting sub-account discounts:', err);
    res.status(500).json({ error: err.message });
  }
});

// Post a sales voucher
router.patch('/:companyId/:id/post', salesVoucherController.postSalesVoucher);

// Get sales reports
router.get('/:companyId/sales-checklist-report', salesVoucherController.getSalesChecklistReport);
router.get('/:companyId/sales-summary-report', salesVoucherController.getSalesSummaryReport);

module.exports = router;