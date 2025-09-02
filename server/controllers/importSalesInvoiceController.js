const xlsx = require('xlsx');
const SalesVoucher = require('../models/SalesVoucher');
const ParentCenter = require('../models/ParentCenter');
const ChildCenter = require('../models/ChildCenter');
const DebtorAccount = require('../models/DebtorAccount');
const AccountLevel4 = require('../models/AccountLevel4');
const FinishedGoods = require('../models/FinishedGoods');

exports.processSalesInvoiceExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No Excel file uploaded' });
    }
    
    const { companyId, createdBy, updatedBy } = req.body;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Missing company ID' });
    }
    
    // Read the Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    if (!data || data.length === 0) {
      return res.status(400).json({ error: 'No data found in the Excel file' });
    }
    
    // Debug log all column names in the Excel file
    console.log('Excel columns:', Object.keys(data[0]));
    
    // Create a normalized column map (lowercase, trimmed)
    const columnMap = {};
    for (const key in data[0]) {
      columnMap[key.trim().toLowerCase()] = key;
    }
    console.log('Normalized column map:', columnMap);
    
    // Define possible column names for each field
    const columnOptions = {
      partyCode: ['partyCode', 'party code', 'PartyCode', 'PARTY CODE'],
      partySubCode: ['partySubCode', 'party sub code', 'PartySubCode', 'PARTY SUB CODE'],
      remarks: ['remarks', 'Remarks', 'REMARKS'],
      date: ['Date', 'date', 'DATE'],
      vehicleNumber: ['Vehicle No', 'vehicle no', 'VehicleNo', 'VEHICLE NO'],
      quantity: ['Qty', 'qty', 'Quantity', 'quantity', 'QTY', 'QUANTITY'],
      rate: ['Rate', 'rate', 'RATE', 'Price', 'price', 'PRICE'],
      amount: ['Amount', 'amount', 'AMOUNT', 'Total', 'total', 'TOTAL', 'Value', 'value', 'VALUE'],
      farmCode: ['farmCode', 'farm code', 'FarmCode', 'FARM CODE'],
      farmSubCode: ['farmSubCode', 'farm sub code', 'FarmSubCode', 'FARM SUB CODE'],
      itemCode: ['itemCode', 'item code', 'ItemCode', 'ITEM CODE'],
      itemSubCode: ['itemSubCode', 'item sub code', 'ItemSubCode', 'ITEM SUB CODE']
    };
    
    // Find the actual column names for each field
    const actualColumns = {};
    for (const [field, options] of Object.entries(columnOptions)) {
      for (const option of options) {
        if (columnMap[option.toLowerCase()]) {
          actualColumns[field] = columnMap[option.toLowerCase()];
          console.log(`Found column for ${field}: ${actualColumns[field]}`);
          break;
        }
      }
      
      // If no match found, log an error
      if (!actualColumns[field]) {
        console.error(`Column not found for field: ${field}`);
      }
    }
    
    // Check if all required columns were found
    const requiredFields = ['partyCode', 'partySubCode', 'remarks', 'date', 'vehicleNumber', 'quantity', 'rate', 'amount', 'farmCode', 'farmSubCode', 'itemCode', 'itemSubCode'];
    const missingFields = requiredFields.filter(field => !actualColumns[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Required columns not found: ${missingFields.join(', ')}`,
        availableColumns: Object.keys(data[0]),
        expectedColumns: requiredFields.map(field => columnOptions[field][0])
      });
    }
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    let skippedCount = 0;
    const skipped = [];
    const createdInvoices = [];
    
    // Group rows by the last part of remarks (after the last "-")
    const groupedRows = {};
    
    for (const row of data) {
      try {
        // Extract the last part of remarks after the last "-"
        const remarks = row[actualColumns.remarks] ? String(row[actualColumns.remarks]).trim() : '';
        const lastDashIndex = remarks.lastIndexOf('-');
        const groupKey = lastDashIndex !== -1 ? remarks.substring(lastDashIndex + 1).trim() : remarks;
        
        if (!groupKey) {
          skippedCount++;
          if (skipped.length < 100) {
            skipped.push({
              row,
              reason: 'Empty remarks or no group identifier found'
            });
          }
          continue;
        }
        
        if (!groupedRows[groupKey]) {
          groupedRows[groupKey] = [];
        }
        
        groupedRows[groupKey].push(row);
      } catch (err) {
        errorCount++;
        errors.push(`Error processing row ${JSON.stringify(row)}: ${err.message}`);
      }
    }
    
    // Get the current year and month for invoice numbering
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    // Find the last invoice number for this company in the current month
    let lastInvoiceNumber = 0;
    try {
      const lastInvoice = await SalesVoucher.findOne({
        companyId,
        invoiceNumber: new RegExp(`^S${year}${month}`)
      }).sort({ invoiceNumber: -1 });
      
      if (lastInvoice) {
        // Extract the sequence number from the invoice number (last 4 digits)
        const sequence = lastInvoice.invoiceNumber.substring(8);
        lastInvoiceNumber = parseInt(sequence, 10) || 0;
      }
    } catch (err) {
      console.error('Error finding last invoice number:', err);
    }
    
    // Process each group
    for (const [groupKey, rows] of Object.entries(groupedRows)) {
      try {
        // Generate new invoice number
        lastInvoiceNumber++;
        const invoiceNumber = `S${year}${month}${lastInvoiceNumber.toString().padStart(4, '0')}`;
        
        // Use the first row to get common invoice data
        const firstRow = rows[0];
        
        // Parse date - handle DD/MM/YYYY format
        let invoiceDate;
        const dateStr = String(firstRow[actualColumns.date]).trim();
        
        // Try to parse the date in DD/MM/YYYY format
        if (dateStr && dateStr.includes('/')) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS
            const year = parseInt(parts[2], 10);
            
            // Check if the date is valid
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
              invoiceDate = new Date(year, month, day);
              
              // If the date is invalid, fall back to current date
              if (isNaN(invoiceDate.getTime())) {
                invoiceDate = new Date();
              }
            } else {
              invoiceDate = new Date();
            }
          } else {
            invoiceDate = new Date();
          }
        } else {
          // Try to parse as a regular date string
          invoiceDate = new Date(dateStr);
          
          // If that fails, use current date
          if (isNaN(invoiceDate.getTime())) {
            invoiceDate = new Date();
          }
        }
        
        // Extract party code and subcode
        const partyCode = String(firstRow[actualColumns.partyCode]).trim();
        const partySubCode = String(firstRow[actualColumns.partySubCode]).trim();
        
        // Form subAccountFullCode (first 7 digits of partyCode + last 5 digits of partySubCode)
        const subAccountFullCode = partyCode.substring(0, 7) + partySubCode.substring(partySubCode.length - 5);
        
        // Find DebtorAccount by code only (no subcode check)
        const debtorAccount = await DebtorAccount.findOne({ 
          companyId, 
          code: partyCode
        });
        
        if (!debtorAccount) {
          skippedCount++;
          if (skipped.length < 100) {
            skipped.push({
              row: firstRow,
              reason: `Debtor Account with code ${partyCode} not found`
            });
          }
          continue;
        }
        
        // Find AccountLevel4 by fullcode (using partyCode and partySubCode)
        const accountLevel4 = await AccountLevel4.findOne({ 
          companyId, 
          fullcode: subAccountFullCode
        });
        
        if (!accountLevel4) {
          skippedCount++;
          if (skipped.length < 100) {
            skipped.push({
              row: firstRow,
              reason: `Account Level 4 with fullcode ${subAccountFullCode} not found`
            });
          }
          continue;
        }
        
        // Extract farm code and subcode
        const farmCode = String(firstRow[actualColumns.farmCode]).trim();
        const farmSubCode = String(firstRow[actualColumns.farmSubCode]).trim();
        
        // Find ParentCenter
        const parentCenter = await ParentCenter.findOne({ 
          companyId, 
          parentCode: farmCode 
        });
        
        if (!parentCenter) {
          skippedCount++;
          if (skipped.length < 100) {
            skipped.push({
              row: firstRow,
              reason: `Parent Center with code ${farmCode} not found`
            });
          }
          continue;
        }
        
        // Find ChildCenter
        const childCenter = await ChildCenter.findOne({ 
          companyId, 
          parentCenterId: parentCenter._id,
          childCode: farmSubCode 
        });
        
        if (!childCenter) {
          skippedCount++;
          if (skipped.length < 100) {
            skipped.push({
              row: firstRow,
              reason: `Child Center with code ${farmSubCode} not found`
            });
          }
          continue;
        }
        
        // Prepare items array
        const items = [];
        let totalAmount = 0;
        
        // Concatenate vehicle numbers if they have the same group key
        const vehicleNumbers = [];
        
        for (const row of rows) {
          try {
            // Debug log the raw values
            console.log('Raw values:', {
              qty: row[actualColumns.quantity],
              rate: row[actualColumns.rate],
              amount: row[actualColumns.amount],
              types: {
                qty: typeof row[actualColumns.quantity],
                rate: typeof row[actualColumns.rate],
                amount: typeof row[actualColumns.amount]
              }
            });
            
            // Parse numeric values with comprehensive handling
            let quantity = 0;
            let rate = 0;
            let amount = 0;
            
            // Handle quantity
            if (row[actualColumns.quantity] !== undefined && row[actualColumns.quantity] !== null) {
              if (typeof row[actualColumns.quantity] === 'number') {
                quantity = row[actualColumns.quantity];
              } else {
                // Remove any non-numeric characters except decimal point and minus
                const qtyStr = String(row[actualColumns.quantity]).replace(/[^\d.-]/g, '');
                quantity = parseFloat(qtyStr) || 0;
              }
            }
            
            // Handle rate
            if (row[actualColumns.rate] !== undefined && row[actualColumns.rate] !== null) {
              if (typeof row[actualColumns.rate] === 'number') {
                rate = row[actualColumns.rate];
              } else {
                // Remove any non-numeric characters except decimal point and minus
                const rateStr = String(row[actualColumns.rate]).replace(/[^\d.-]/g, '');
                rate = parseFloat(rateStr) || 0;
              }
            }
            
            // Handle amount
            if (row[actualColumns.amount] !== undefined && row[actualColumns.amount] !== null) {
              if (typeof row[actualColumns.amount] === 'number') {
                amount = row[actualColumns.amount];
              } else {
                // Remove any non-numeric characters except decimal point and minus
                const amtStr = String(row[actualColumns.amount]).replace(/[^\d.-]/g, '');
                amount = parseFloat(amtStr) || 0;
              }
            }
            
            // Debug log the parsed values
            console.log('Parsed values:', {
              quantity,
              rate,
              amount
            });
            
            // Collect vehicle number
            const vehicleNumber = String(row[actualColumns.vehicleNumber]).trim();
            if (vehicleNumber && !vehicleNumbers.includes(vehicleNumber)) {
              vehicleNumbers.push(vehicleNumber);
            }
            
            // Extract item code and subcode
            const itemCode = String(row[actualColumns.itemCode]).trim();
            const itemSubCode = String(row[actualColumns.itemSubCode]).trim();
            
            // Form productCode (first 7 digits of itemCode + last 5 digits of itemSubCode)
            const productCode = itemCode.substring(0, 7) + itemSubCode.substring(itemSubCode.length - 5);
            
            // Find AccountLevel4 for the item
            const itemAccountLevel4 = await AccountLevel4.findOne({ 
              companyId, 
              fullcode: productCode
            });
            
            // Find FinishedGoods by code
            const finishedGood = await FinishedGoods.findOne({ 
              companyId, 
              code: itemCode
            });
            
            // Create the item object with explicit number values
            const item = {
              productId: itemAccountLevel4 ? itemAccountLevel4._id : null,
              subAccountFullCode,
              productCode,
              quantity: Number(quantity),
              rate: Number(rate),
              amount: Number(amount),
              discount: 0,
              tax: 0,
              netAmount: Number(amount),
              unitMeasurementId: null,
              unitMeasurementCode: null,
              discountBreakdown: [],
              taxBreakdown: [],
              rateInfo: {
                applicableDate: invoiceDate,
                isActive: true,
                isFallbackRate: false
              },
              hsCode: null
            };
            
            // Debug log the item object
            console.log('Item object:', item);
            
            items.push(item);
            totalAmount += Number(amount);
          } catch (err) {
            errorCount++;
            errors.push(`Error processing item in group ${groupKey}: ${err.message}`);
          }
        }
        
        // Concatenate vehicle numbers with "-"
        const concatenatedVehicleNumber = vehicleNumbers.join('-');
        
        // Find FinishedGoods for the invoice (using the first item's item code)
        const firstItemCode = String(firstRow[actualColumns.itemCode]).trim();
        const finishedGood = await FinishedGoods.findOne({ 
          companyId, 
          code: firstItemCode
        });
        
        // Create the SalesVoucher document
        const newInvoice = new SalesVoucher({
          companyId,
          goDownId: "DEFAULT",
          goDownCode: "DEFAULT",
          goDownAlphabet: "D",
          invoiceType: "Sale Invoice",
          invoiceNumber,
          invoiceDate,
          vehicleNumber: concatenatedVehicleNumber, // Use concatenated vehicle number
          remarks: String(firstRow[actualColumns.remarks]).trim(),
          debtorAccount: debtorAccount._id,
          subAccount: accountLevel4._id,
          subAccountFullCode,
          parentCenterId: parentCenter._id,
          parentCenterCode: farmCode,
          childCenterId: childCenter._id,
          childCenterCode: farmSubCode,
          centerCode: `${farmCode}-${farmSubCode}`,
          finishedGoodId: finishedGood ? finishedGood._id : null,
          finishedGoodCode: finishedGood ? finishedGood.code : null,
          accountLevel4Id: accountLevel4._id,
          accountLevel4FullCode: subAccountFullCode,
          unitMeasurementId: null,
          unitMeasurementCode: null,
          items: items,
          totalAmount: Number(totalAmount),
          taxAmount: 0,
          discountAmount: 0,
          netAmount: Number(totalAmount),
          netAmountBeforeTax: Number(totalAmount),
          accountingEntries: [
            {
              debit: Number(totalAmount),
              credit: 0
            },
            {
              debit: 0,
              credit: Number(totalAmount)
            }
          ],
          customerProfile: {
            customerType: 'registered'
          },
          createdBy,
          updatedBy
        });
        
        // Debug log the invoice object before saving
        console.log('Invoice object before save:', {
          invoiceNumber: newInvoice.invoiceNumber,
          vehicleNumber: newInvoice.vehicleNumber,
          totalAmount: newInvoice.totalAmount,
          items: newInvoice.items.map(item => ({
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount
          }))
        });
        
        await newInvoice.save();
        successCount++;
        
        // Collect created invoice details (limit to 100 to avoid memory issues)
        if (createdInvoices.length < 100) {
          createdInvoices.push({
            invoiceNumber: newInvoice.invoiceNumber,
            invoiceDate: newInvoice.invoiceDate,
            vehicleNumber: newInvoice.vehicleNumber,
            items: newInvoice.items,
            totalAmount: newInvoice.totalAmount
          });
        }
      } catch (err) {
        errorCount++;
        errors.push(`Error processing group ${groupKey}: ${err.message}`);
      }
    }
    
    // Prepare response message
    let message = `Processing completed. `;
    message += `${successCount} invoices created successfully. `;
    
    if (skippedCount > 0) {
      message += `${skippedCount} groups were skipped due to missing data or errors. `;
    }
    
    if (errorCount > 0) {
      message += `${errorCount} groups had errors and were not processed.`;
    }
    
    res.status(200).json({ 
      message,
      successCount,
      skippedCount,
      errorCount,
      invoices: createdInvoices.length > 0 ? createdInvoices : undefined,
      skipped: skipped.length > 0 ? skipped : undefined,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error processing Excel file:', error);
    res.status(500).json({ error: error.message || 'Failed to process Excel file' });
  }
};