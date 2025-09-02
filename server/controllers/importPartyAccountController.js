const xlsx = require('xlsx');
const AccountLevel4 = require('../models/AccountLevel4');
const AccountLevel1 = require('../models/AccountLevel1');
const AccountLevel2 = require('../models/AccountLevel2');
const AccountLevel3 = require('../models/AccountLevel3');

exports.processAccountLevel4Excel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No Excel file uploaded' });
    }

    const { companyId, importType, createdBy, updatedBy } = req.body;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Missing company ID' });
    }
    
    if (!importType) {
      return res.status(400).json({ error: 'Missing import type' });
    }

    // Set column names based on import type
    let codeColumn, subcodeColumn, titleColumn, requiredColumnsMessage;
    
    if (importType === 'party') {
      codeColumn = 'partyCode';
      subcodeColumn = 'partySubCode';
      titleColumn = 'partyName';
      requiredColumnsMessage = 'Required columns (partyCode, partySubCode, partyName) not found in the Excel file';
    } else if (importType === 'item') {
      codeColumn = 'itemCode';
      subcodeColumn = 'itemSubCode';
      titleColumn = 'itemName';
      requiredColumnsMessage = 'Required columns (itemCode, itemSubCode, itemName) not found in the Excel file';
    } else {
      return res.status(400).json({ error: 'Invalid import type. Must be "party" or "item"' });
    }

    // Read the Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      return res.status(400).json({ error: 'No data found in the Excel file' });
    }

    // Check if the required columns exist in the Excel file
    const firstRow = data[0];
    if (!(codeColumn in firstRow) || !(subcodeColumn in firstRow) || !(titleColumn in firstRow)) {
      return res.status(400).json({ 
        error: requiredColumnsMessage 
      });
    }

    let successCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    const errors = [];
    let skippedCount = 0;
    const duplicates = [];
    const skipped = [];

    // Process each row in the Excel file
    for (const row of data) {
      try {
        // Check if the row contains any of the required columns
        const hasRequiredColumn = (codeColumn in row) || (subcodeColumn in row) || (titleColumn in row);
        
        // Skip rows that don't have any of the required columns
        if (!hasRequiredColumn) {
          continue; // Skip this row entirely
        }

        // Only get the values from the required columns
        const code = row[codeColumn] ? String(row[codeColumn]).trim() : '';
        const subcode = row[subcodeColumn] ? String(row[subcodeColumn]).trim() : '';
        const title = row[titleColumn] ? String(row[titleColumn]).trim() : '';

        // Skip rows that don't have the required data (after trimming)
        if (!code || !subcode || !title) {
          skippedCount++;
          // Collect skipped records (limit to 100 to avoid memory issues)
          if (skipped.length < 100) {
            // Create a filtered row object with only the required columns
            const filteredRow = {};
            
            if (codeColumn in row) {
              filteredRow[codeColumn] = row[codeColumn];
            }
            if (subcodeColumn in row) {
              filteredRow[subcodeColumn] = row[subcodeColumn];
            }
            if (titleColumn in row) {
              filteredRow[titleColumn] = row[titleColumn];
            }
            
            // Create missingFields object based on import type
            const missingFields = {};
            missingFields[codeColumn] = !code;
            missingFields[subcodeColumn] = !subcode;
            missingFields[titleColumn] = !title;
            
            skipped.push({
              row: filteredRow,
              reason: `Missing required data (${codeColumn}, ${subcodeColumn}, or ${titleColumn})`,
              missingFields
            });
          }
          continue;
        }

        // Validate subcode format (5 digits)
        if (!/^\d{5}$/.test(subcode)) {
          errorCount++;
          errors.push(`Invalid subcode format in row: ${JSON.stringify(row)}. Subcode must be 5 digits.`);
          continue;
        }

        // Extract parent codes from the full code
        // Assuming code format is like "0101006" where:
        // - 01 is level1Code
        // - 01 is level2Code
        // - 006 is level3Code
        const parentLevel1Code = code.substring(0, 2);
        const parentLevel2Code = code.substring(2, 4);
        const parentLevel3Code = code.substring(4, 7);

        // Find AccountLevel1 record
        const level1 = await AccountLevel1.findOne({ 
          companyId, 
          code: parentLevel1Code 
        });

        if (!level1) {
          errorCount++;
          errors.push(`Parent Level1 with code ${parentLevel1Code} not found for row: ${JSON.stringify(row)}`);
          continue;
        }

        // Find AccountLevel2 record
        const level2 = await AccountLevel2.findOne({ 
          companyId, 
          level1Id: level1._id,
          code: parentLevel2Code 
        });

        if (!level2) {
          errorCount++;
          errors.push(`Parent Level2 with code ${parentLevel2Code} not found for row: ${JSON.stringify(row)}`);
          continue;
        }

        // Find AccountLevel3 record
        const level3 = await AccountLevel3.findOne({ 
          companyId, 
          level1Id: level1._id,
          level2Id: level2._id,
          code: parentLevel3Code 
        });

        if (!level3) {
          errorCount++;
          errors.push(`Parent Level3 with code ${parentLevel3Code} not found for row: ${JSON.stringify(row)}`);
          continue;
        }

        // Check if the combination already exists in AccountLevel4
        const existingRecord = await AccountLevel4.findOne({
          companyId,
          level1Id: level1._id,
          level2Id: level2._id,
          level3Id: level3._id,
          subcode
        });

        if (existingRecord) {
          duplicateCount++;
          // Collect duplicate records (limit to 100 to avoid memory issues)
          if (duplicates.length < 100) {
            duplicates.push({
              row: {
                [codeColumn]: code,
                [subcodeColumn]: subcode,
                [titleColumn]: title
              },
              existingRecord: {
                code: existingRecord.code,
                subcode: existingRecord.subcode,
                title: existingRecord.title
              }
            });
          }
          continue;
        }

        // Create new AccountLevel4 record
        const fullcode = parentLevel1Code + parentLevel2Code + parentLevel3Code + subcode;
        
        const newRecord = new AccountLevel4({
          companyId,
          level1Id: level1._id,
          level2Id: level2._id,
          level3Id: level3._id,
          parentLevel1Code,
          parentLevel2Code,
          parentLevel3Code,
          subcode,
          fullcode,
          code: parentLevel1Code + parentLevel2Code + parentLevel3Code,
          title,
          balance: 0,
          createdBy,
          updatedBy
        });

        await newRecord.save();
        successCount++;
      } catch (err) {
        errorCount++;
        errors.push(`Error processing row ${JSON.stringify(row)}: ${err.message}`);
      }
    }

    // Prepare response message
    let message = `Processing completed. `;
    message += `${successCount} records created successfully. `;
    
    if (duplicateCount > 0) {
      message += `${duplicateCount} records already existed and were skipped. `;
    }
    
    if (skippedCount > 0) {
      message += `${skippedCount} rows were skipped due to missing required data. `;
    }
    
    if (errorCount > 0) {
      message += `${errorCount} records had errors and were not processed.`;
    }

    res.status(200).json({ 
      message,
      successCount,
      duplicateCount,
      skippedCount,
      errorCount,
      duplicates: duplicates.length > 0 ? duplicates : undefined,
      skipped: skipped.length > 0 ? skipped : undefined,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error processing Excel file:', error);
    res.status(500).json({ error: error.message || 'Failed to process Excel file' });
  }
};