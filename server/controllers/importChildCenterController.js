const xlsx = require('xlsx');
const ChildCenter = require('../models/ChildCenter');
const ParentCenter = require('../models/ParentCenter');

exports.processChildCenterExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No Excel file uploaded' });
    }
    
    const { companyId, createdBy, updatedBy } = req.body;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Missing company ID' });
    }
    
    // Set column names based on requirements
    const parentCodeColumn = 'farmCode';
    const childCodeColumn = 'farmSubCode';
    const titleColumn = 'farmTitle';
    const startDateColumn = 'startDate'; // Optional column
    
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
    if (!(parentCodeColumn in firstRow) || !(childCodeColumn in firstRow) || !(titleColumn in firstRow)) {
      return res.status(400).json({ 
        error: `Required columns (${parentCodeColumn}, ${childCodeColumn}, ${titleColumn}) not found in the Excel file` 
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
        // Get the values from the required columns
        const parentCode = row[parentCodeColumn] ? String(row[parentCodeColumn]).trim() : '';
        const childCode = row[childCodeColumn] ? String(row[childCodeColumn]).trim() : '';
        const title = row[titleColumn] ? String(row[titleColumn]).trim() : '';
        
        // Get optional startDate field
        let startDate = new Date(); // Default to today
        if (row[startDateColumn]) {
          const parsedDate = new Date(row[startDateColumn]);
          if (!isNaN(parsedDate.getTime())) {
            startDate = parsedDate;
          }
        }
        
        // Skip rows that don't have the required data (after trimming)
        if (!parentCode || !childCode || !title) {
          skippedCount++;
          // Collect skipped records (limit to 100 to avoid memory issues)
          if (skipped.length < 100) {
            // Create a filtered row object with only the required columns
            const filteredRow = {};
            
            if (parentCodeColumn in row) {
              filteredRow[parentCodeColumn] = row[parentCodeColumn];
            }
            if (childCodeColumn in row) {
              filteredRow[childCodeColumn] = row[childCodeColumn];
            }
            if (titleColumn in row) {
              filteredRow[titleColumn] = row[titleColumn];
            }
            
            // Create missingFields object
            const missingFields = {};
            missingFields[parentCodeColumn] = !parentCode;
            missingFields[childCodeColumn] = !childCode;
            missingFields[titleColumn] = !title;
            
            skipped.push({
              row: filteredRow,
              reason: `Missing required data (${parentCodeColumn}, ${childCodeColumn}, or ${titleColumn})`,
              missingFields
            });
          }
          continue;
        }
        
        // Find ParentCenter record by companyId and parentCode
        const parentCenter = await ParentCenter.findOne({ 
          companyId, 
          parentCode 
        });
        
        if (!parentCenter) {
          errorCount++;
          errors.push(`Parent Center with code ${parentCode} not found for row: ${JSON.stringify(row)}`);
          continue;
        }
        
        // Check if the combination already exists in ChildCenter
        const existingRecord = await ChildCenter.findOne({
          companyId,
          parentCenterId: parentCenter._id,
          childCode
        });
        
        if (existingRecord) {
          duplicateCount++;
          // Collect duplicate records (limit to 100 to avoid memory issues)
          if (duplicates.length < 100) {
            duplicates.push({
              row: {
                [parentCodeColumn]: parentCode,
                [childCodeColumn]: childCode,
                [titleColumn]: title
              },
              existingRecord: {
                parentCode: existingRecord.parentCode,
                childCode: existingRecord.childCode,
                title: existingRecord.title
              }
            });
          }
          continue;
        }
        
        // Create new ChildCenter record
        const newRecord = new ChildCenter({
          companyId,
          parentCenterId: parentCenter._id,
          parentCode,
          childCode,
          title,
          startDate,
          isActive: true,
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