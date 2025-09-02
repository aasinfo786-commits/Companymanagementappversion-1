import mongoose from 'mongoose';
import ItemProfile from '../models/ItemProfile.js';
import FinishedGoods from '../models/FinishedGoods.js';
import AccountLevel4 from '../models/AccountLevel4.js';
import UnitMeasurement from '../models/UnitMeasurement.js';
import ItemDescriptionCode from '../models/ItemDescriptionCode.js';
import AccountLevel1 from '../models/AccountLevel1.js';
import AccountLevel2 from '../models/AccountLevel2.js';
import AccountLevel3 from '../models/AccountLevel3.js';

// Helper function to get account titles by IDs
const getAccountTitles = async (level1Id, level2Id, level3Id) => {
  try {
    const [level1, level2, level3] = await Promise.all([
      AccountLevel1.findById(level1Id).select('description').lean(),
      AccountLevel2.findById(level2Id).select('title').lean(),
      AccountLevel3.findById(level3Id).select('title').lean()
    ]);
    
    return {
      level1Title: level1?.description || '',
      level2Title: level2?.title || '',
      level3Title: level3?.title || ''
    };
  } catch (err) {
    console.error('Error fetching account titles:', err);
    return {
      level1Title: '',
      level2Title: '',
      level3Title: ''
    };
  }
};

// Get all finished goods for a company - Updated to use AccountLevel3 titles
export const getFinishedGoods = async (req, res) => {
  try {
    const { companyId } = req.params;
    console.log(`[ITEM-PROFILE] Fetching finished goods for company: ${companyId}`);
    
    // Get finished goods
    const finishedGoods = await FinishedGoods.find({ companyId })
      .sort({ code: 1 })
      .select('code _id level1Id level2Id level3Id level1Code level2Code level3Code isActive isDefault title');
    
    console.log(`[ITEM-PROFILE] Found ${finishedGoods.length} finished goods records`);
    
    if (finishedGoods.length === 0) {
      console.log('[ITEM-PROFILE] No finished goods found for this company');
      return res.json([]);
    }
    
    // Log each finished good for debugging
    finishedGoods.forEach(good => {
      console.log(`[ITEM-PROFILE] Finished Good: Code - ${good.code}, Title - ${good.title}`);
    });
    
    // Get all AccountLevel3 records for this company
    const accountLevel3Records = await AccountLevel3.find({ companyId })
      .select('parentLevel1Code parentLevel2Code code title');
    
    console.log(`[ITEM-PROFILE] Found ${accountLevel3Records.length} AccountLevel3 records`);
    
    // Create a map of combined code to title from AccountLevel3
    const codeToTitleMap = {};
    accountLevel3Records.forEach(record => {
      // Combine the three separate codes to match the format in FinishedGoods
      const combinedCode = record.parentLevel1Code + record.parentLevel2Code + record.code;
      codeToTitleMap[combinedCode] = record.title;
      console.log(`[ITEM-PROFILE] AccountLevel3 mapping: ${combinedCode} -> ${record.title}`);
    });
    
    // Fetch titles for each finished good and update with AccountLevel3 titles
    const finishedGoodsWithTitles = await Promise.all(
      finishedGoods.map(async (fg) => {
        // Get the combined code from FinishedGoods
        const combinedCode = fg.level1Code + fg.level2Code + fg.level3Code;
        
        // Get the title from AccountLevel3 if available, otherwise use existing title
        const accountLevel3Title = codeToTitleMap[combinedCode] || fg.title;
        
        // Log the mapping
        console.log(`[ITEM-PROFILE] Finished Goods Account: Code - ${fg.code}, Title - ${accountLevel3Title}`);
        
        // Get additional account titles using IDs
        const titles = await getAccountTitles(fg.level1Id, fg.level2Id, fg.level3Id);
        
        return {
          ...fg.toObject(),
          title: accountLevel3Title, // Use AccountLevel3 title as the main title
          level3Title: accountLevel3Title, // Also update level3Title
          ...titles
        };
      })
    );
    
    console.log(`[ITEM-PROFILE] Returning ${finishedGoodsWithTitles.length} finished goods records`);
    res.json(finishedGoodsWithTitles);
  } catch (err) {
    console.error('[ITEM-PROFILE] Error fetching finished goods:', err);
    res.status(500).json({ 
      error: 'Failed to fetch finished goods',
      details: err.message 
    });
  }
};

// Get account level 4 accounts based on finished good
export const getAccountLevel4 = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { finishedGoodCode } = req.query;
    
    if (!finishedGoodCode) {
      return res.status(400).json({ error: 'Finished good code is required' });
    }
    
    const finishedGood = await FinishedGoods.findOne({ 
      companyId,
      code: finishedGoodCode
    });
    
    if (!finishedGood) {
      return res.status(404).json({ error: 'Finished good not found' });
    }
    
    // Get account titles
    const titles = await getAccountTitles(finishedGood.level1Id, finishedGood.level2Id, finishedGood.level3Id);
    
    // Build filter based on codes
    const filter = { 
      companyId,
      parentLevel1Code: finishedGood.level1Code,
      parentLevel2Code: finishedGood.level2Code
    };
    
    // Only add level3 if exists
    if (finishedGood.level3Code && finishedGood.level3Code.trim() !== '') {
      filter.parentLevel3Code = finishedGood.level3Code;
    }
    
    const accounts = await AccountLevel4.find(filter)
      .sort({ fullcode: 1 })
      .select('subcode title _id fullcode parentLevel1Code parentLevel2Code parentLevel3Code');
    
    res.json({
      accounts,
      finishedGoodDetails: {
        code: finishedGood.code,
        title: titles.level3Title, // Use level3 title as the main title
        hierarchy: {
          level1: titles.level1Title,
          level1Code: finishedGood.level1Code,
          level2: titles.level2Title,
          level2Code: finishedGood.level2Code,
          level3: titles.level3Title || finishedGood.level3Code || 'N/A',
          level3Code: finishedGood.level3Code
        }
      }
    });
  } catch (err) {
    console.error('Error fetching account level 4:', err);
    res.status(500).json({ 
      error: 'Failed to fetch account level 4',
      details: err.message 
    });
  }
};

// Get all unit measurements for a company
export const getUnitMeasurements = async (req, res) => {
  try {
    const { companyId } = req.params;
    const units = await UnitMeasurement.find({ companyId })
      .sort({ title: 1 })
      .select('title _id code symbol');
    
    res.json(units);
  } catch (err) {
    console.error('Error fetching unit measurements:', err);
    res.status(500).json({ 
      error: 'Failed to fetch unit measurements',
      details: err.message 
    });
  }
};

// Check if an item profile exists for the given company, finished good, and account level 4
export const checkExistingProfile = async (req, res) => {
  try {
    const { companyId, finishedGoodId, accountLevel4Id } = req.query;
    
    if (!companyId || !finishedGoodId || !accountLevel4Id) {
      return res.status(400).json({ 
        error: 'Company ID, finished good ID and account level 4 ID are required' 
      });
    }
    
    // Find existing profile
    const existingProfile = await ItemProfile.findOne({
      companyId,
      finishedGood: finishedGoodId,
      accountLevel4: accountLevel4Id
    })
    .populate('finishedGood', 'code level1Code level2Code level3Code')
    .populate('accountLevel4', 'subcode title fullcode parentLevel1Code parentLevel2Code parentLevel3Code')
    .populate('unitMeasurement', 'title code symbol')
    .populate('hsCode', 'hsCode description');
    
    if (existingProfile) {
      return res.json({
        exists: true,
        profile: existingProfile
      });
    } else {
      return res.json({
        exists: false
      });
    }
  } catch (err) {
    console.error('Error checking existing profile:', err);
    res.status(500).json({ 
      error: 'Failed to check existing profile',
      details: err.message
    });
  }
};

// Create item profile
export const createItemProfile = async (req, res) => {
  try {
    const { 
      companyId,
      finishedGoodId,
      accountLevel4Id,
      salesTaxRate,
      unitMeasurementId,
      extraTaxRate,
      furtherTaxRate,
      fedPercentage,
      hsCodeId,
      finishedGoodCode,
      level3Title,
      createdBy,
      updatedBy,
      isExempted // Add this new field
    } = req.body;
    
    // Validate required fields
    if (!companyId || !finishedGoodId || !accountLevel4Id) {
      return res.status(400).json({ 
        error: 'Company ID, finished good ID and account level 4 ID are required' 
      });
    }
    
    // Get related documents
    const [finishedGood, accountLevel4, unitMeasurement, hsCode] = await Promise.all([
      FinishedGoods.findById(finishedGoodId),
      AccountLevel4.findById(accountLevel4Id),
      unitMeasurementId ? UnitMeasurement.findById(unitMeasurementId) : Promise.resolve(null),
      hsCodeId ? ItemDescriptionCode.findById(hsCodeId) : Promise.resolve(null)
    ]);
    
    if (!finishedGood || finishedGood.companyId !== companyId) {
      return res.status(404).json({ error: 'Finished good not found' });
    }
    
    if (!accountLevel4 || accountLevel4.companyId !== companyId) {
      return res.status(404).json({ error: 'Account level 4 not found' });
    }
    
    // Verify hierarchy match
    const hierarchyValid = (
      accountLevel4.parentLevel1Code === finishedGood.level1Code &&
      accountLevel4.parentLevel2Code === finishedGood.level2Code &&
      (!finishedGood.level3Code || accountLevel4.parentLevel3Code === finishedGood.level3Code)
    );
    
    if (!hierarchyValid) {
      return res.status(400).json({
        error: 'Account hierarchy mismatch',
        details: {
          account: {
            level1: accountLevel4.parentLevel1Code,
            level2: accountLevel4.parentLevel2Code,
            level3: accountLevel4.parentLevel3Code
          },
          finishedGood: {
            level1: finishedGood.level1Code,
            level2: finishedGood.level2Code,
            level3: finishedGood.level3Code
          }
        }
      });
    }
    
    // Check if this exact combination already exists
    const existingProfile = await ItemProfile.findOne({
      companyId,
      finishedGood: finishedGoodId,
      accountLevel4: accountLevel4Id
    });
    
    if (existingProfile && !req.params.id) {
      return res.status(400).json({
        error: 'Item profile already exists',
        details: 'A profile with this finished good and account level 4 combination already exists'
      });
    }
    
    // Get account titles if not provided
    let titles = { level1Title: '', level2Title: '', level3Title: level3Title || '' };
    if (!level3Title) {
      titles = await getAccountTitles(finishedGood.level1Id, finishedGood.level2Id, finishedGood.level3Id);
    }
    
    // Create or update profile data
    const profileData = {
      companyId,
      finishedGood: finishedGoodId,
      accountLevel4: accountLevel4Id,
      productCode: finishedGoodCode || finishedGood.code,
      code: finishedGoodCode || finishedGood.code,
      title: titles.level3Title, // Store the level3 title
      level1Title: titles.level1Title,
      level2Title: titles.level2Title,
      level3Title: titles.level3Title,
      subcode: accountLevel4.subcode,
      unitMeasurement: unitMeasurementId,
      unitCode: unitMeasurement?.code || '',
      // If item is exempted, set all tax rates to 0 regardless of input
      salesTaxRate: isExempted ? 0 : (Number(salesTaxRate) || 0),
      extraTaxRate: isExempted ? 0 : (Number(extraTaxRate) || 0),
      furtherTaxRate: isExempted ? 0 : (Number(furtherTaxRate) || 0),
      fedPercentage: isExempted ? 0 : (Number(fedPercentage) || 0),
      hsCode: hsCodeId,
      hsCodeValue: hsCode?.hsCode || '',
      isExempted: isExempted || false, // Add this field
      updatedBy: updatedBy || ''
    };
    
    let itemProfile;
    
    // Check if this is an update or create operation
    if (req.params.id) {
      // Update existing profile
      itemProfile = await ItemProfile.findByIdAndUpdate(
        req.params.id,
        profileData,
        { new: true, runValidators: true }
      );
      
      if (!itemProfile) {
        return res.status(404).json({ error: 'Item profile not found' });
      }
    } else {
      // Create new profile
      profileData.createdBy = createdBy || '';
      itemProfile = await ItemProfile.create(profileData);
    }
    
    // Populate and return
    const populated = await ItemProfile.findById(itemProfile._id)
      .populate('finishedGood', 'code level1Code level2Code level3Code')
      .populate('accountLevel4', 'subcode title fullcode parentLevel1Code parentLevel2Code parentLevel3Code')
      .populate('unitMeasurement', 'title code symbol')
      .populate('hsCode', 'hsCode description');
    
    res.status(req.params.id ? 200 : 201).json({
      message: req.params.id ? 'Item profile updated successfully' : 'Item profile created successfully',
      itemProfile: populated
    });
  } catch (err) {
    console.error('Error creating/updating item profile:', err);
    res.status(500).json({ 
      error: `Failed to ${req.params.id ? 'update' : 'create'} item profile`,
      details: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
};

// Update item profile
export const updateItemProfile = async (req, res) => {
  // We'll use the same createItemProfile function for updates
  createItemProfile(req, res);
};

// Get all item profiles for a company and finished good
export const getItemProfiles = async (req, res) => {
  try {
    const { companyId, finishedGoodId } = req.params;
    const itemProfiles = await ItemProfile.find({ 
      companyId,
      finishedGood: finishedGoodId 
    })
    .populate('finishedGood', 'code level1Code level2Code level3Code')
    .populate('accountLevel4', 'subcode title fullcode parentLevel1Code parentLevel2Code parentLevel3Code')
    .populate('unitMeasurement', 'title code symbol')
    .populate('hsCode', 'hsCode description')
    .sort({ createdAt: -1 });
    
    if (!itemProfiles || itemProfiles.length === 0) {
      return res.status(404).json({ 
        error: 'No item profiles found',
        suggestion: 'Create a profile for this finished good first'
      });
    }
    
    res.json(itemProfiles);
  } catch (err) {
    console.error('Error fetching item profiles:', err);
    res.status(500).json({ 
      error: 'Failed to fetch item profiles',
      details: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
};

// Get a single item profile by ID
export const getItemProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const itemProfile = await ItemProfile.findById(id)
      .populate('finishedGood', 'code level1Code level2Code level3Code')
      .populate('accountLevel4', 'subcode title fullcode parentLevel1Code parentLevel2Code parentLevel3Code')
      .populate('unitMeasurement', 'title code symbol')
      .populate('hsCode', 'hsCode description');
    
    if (!itemProfile) {
      return res.status(404).json({ 
        error: 'Item profile not found'
      });
    }
    
    res.json(itemProfile);
  } catch (err) {
    console.error('Error fetching item profile:', err);
    res.status(500).json({ 
      error: 'Failed to fetch item profile',
      details: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
};