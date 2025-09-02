import mongoose from 'mongoose';
import ProductRate from '../models/ProductRateSetting.js';
import FinishedGoods from '../models/FinishedGoods.js';
import AccountLevel4 from '../models/AccountLevel4.js';

// Get rates for multiple account level 4 items
export const getRatesForAccounts = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { accountIds } = req.body;
    
    if (!Array.isArray(accountIds) || accountIds.length === 0) {
      return res.status(400).json({ 
        error: 'Account IDs array is required' 
      });
    }
    
    // Validate all account IDs belong to the company
    const accountsCount = await AccountLevel4.countDocuments({
      _id: { $in: accountIds },
      companyId
    });
    
    if (accountsCount !== accountIds.length) {
      return res.status(400).json({ 
        error: 'One or more account IDs are invalid or belong to another company'
      });
    }
    
    const rates = await ProductRate.find({
      companyId,
      accountLevel4: { $in: accountIds }
    }).sort({ applicableDate: 1 });
    
    res.json(rates);
  } catch (err) {
    console.error('Error fetching product rates:', err);
    res.status(500).json({ 
      error: 'Failed to fetch product rates',
      details: err.message 
    });
  }
};

// Get rates for specific dates for an account level 4 item
export const getRatesForAccountAndDates = async (req, res) => {
  try {
    const { companyId, accountId } = req.params;
    const { dates } = req.body;
    
    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ 
        error: 'Dates array is required' 
      });
    }
    
    // Validate account belongs to company
    const account = await AccountLevel4.findOne({
      _id: accountId,
      companyId
    });
    
    if (!account) {
      return res.status(404).json({ 
        error: 'Account not found or belongs to another company'
      });
    }
    
    // Get the maximum date from the provided dates (most recent date)
    const maxDate = new Date(Math.max(...dates.map(date => new Date(date))));
    
    // Find all rates that are <= the max date
    const rates = await ProductRate.find({
      companyId,
      accountLevel4: accountId,
      applicableDate: { $lte: maxDate }
    }).sort({ applicableDate: -1 }); // Sort by date descending to get most recent first
    
    res.json(rates);
  } catch (err) {
    console.error('Error fetching product rates for dates:', err);
    res.status(500).json({ 
      error: 'Failed to fetch product rates',
      details: err.message 
    });
  }
};

// Get all rates for an account level 4 item
export const getRateForAccountAndDate = async (req, res) => {
  try {
    const { companyId, accountId } = req.params;
    
    // Validate account belongs to company
    const account = await AccountLevel4.findOne({
      _id: accountId,
      companyId
    });
    
    if (!account) {
      return res.status(404).json({ 
        error: 'Account not found or belongs to another company' 
      });
    }
    
    // Find all rates for this account, sorted by date
    const rates = await ProductRate.find({
      companyId,
      accountLevel4: accountId
    })
    .populate('finishedGood', 'code title')
    .populate('accountLevel4', 'subcode title fullcode')
    .sort({ applicableDate: 1 });
    
    if (!rates || rates.length === 0) {
      return res.status(404).json({ 
        error: 'No rates found for this account' 
      });
    }
    
    res.json(rates);
  } catch (err) {
    console.error('Error fetching product rates:', err);
    res.status(500).json({ 
      error: 'Failed to fetch product rates',
      details: err.message 
    });
  }
};

export const saveRates = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { finishedGoodId, rates, deletedRateIds, username } = req.body;
    
    if (!finishedGoodId || !Array.isArray(rates) || !username) {
      return res.status(400).json({ 
        error: 'Finished good ID, rates array, and username are required' 
      });
    }
    
    // Validate finished good exists and belongs to company
    const finishedGood = await FinishedGoods.findOne({
      _id: finishedGoodId,
      companyId
    });
    
    if (!finishedGood) {
      return res.status(404).json({ 
        error: 'Finished good not found or belongs to another company'
      });
    }
    
    const accountIds = [...new Set(rates.map(rate => rate.accountLevel4Id))];
    
    // Validate all account level 4 items belong to company
    const accounts = await AccountLevel4.find({
      _id: { $in: accountIds },
      companyId
    });
    
    if (accounts.length !== accountIds.length) {
      return res.status(400).json({ 
        error: 'One or more account level 4 items are invalid or belong to another company'
      });
    }
    
    // Verify hierarchy match for all accounts
    const invalidAccounts = accounts.filter(account => 
      account.parentLevel1Code !== finishedGood.level1Code ||
      account.parentLevel2Code !== finishedGood.level2Code ||
      (finishedGood.level3Code && account.parentLevel3Code !== finishedGood.level3Code)
    );
    
    if (invalidAccounts.length > 0) {
      return res.status(400).json({
        error: 'Account hierarchy mismatch',
        details: {
          message: 'One or more accounts do not match the finished good hierarchy',
          invalidAccountIds: invalidAccounts.map(acc => acc._id)
        }
      });
    }
    
    // Delete rates that were marked for deletion
    if (deletedRateIds && deletedRateIds.length > 0) {
      await ProductRate.deleteMany({
        _id: { $in: deletedRateIds },
        companyId
      });
    }
    
    // Prepare bulk operations
    const bulkOps = rates.map(rate => {
      const { accountLevel4Id, rate: rateValue, applicableDate, isActive, createdBy, updatedBy, createdAt, updatedAt } = rate;
      const account = accounts.find(a => a._id.equals(accountLevel4Id));
      
      return {
        updateOne: {
          filter: {
            companyId,
            accountLevel4: accountLevel4Id,
            applicableDate: new Date(applicableDate)
          },
          update: {
            $set: {
              companyId,
              finishedGood: finishedGoodId,
              accountLevel4: accountLevel4Id,
              productCode: finishedGood.code,
              accountCode: account?.fullcode || '',
              rate: Number(rateValue),
              applicableDate: new Date(applicableDate),
              isActive,
              updatedBy: username, // Store username string directly
              updatedAt: new Date()  // Update timestamp
            },
            $setOnInsert: {
              createdBy: createdBy || username, // Use provided createdBy or current username
              createdAt: createdAt ? new Date(createdAt) : new Date() // Use provided createdAt or current date
            }
          },
          upsert: true
        }
      };
    });
    
    // Execute bulk operations
    const result = await ProductRate.bulkWrite(bulkOps);
    
    // Deactivate rates not included in current update
    if (result.upsertedCount + result.modifiedCount > 0) {
      await ProductRate.updateMany(
        {
          companyId,
          accountLevel4: { $in: accountIds },
          applicableDate: { 
            $nin: rates.map(r => new Date(r.applicableDate)) 
          }
        },
        { 
          $set: { 
            isActive: false,
            updatedBy: username, // Update with current username
            updatedAt: new Date()
          } 
        }
      );
    }
    
    res.json({
      message: 'Rates saved successfully',
      result: {
        upserted: result.upsertedCount,
        modified: result.modifiedCount,
        deleted: deletedRateIds?.length || 0,
        total: rates.length
      }
    });
  } catch (err) {
    console.error('Error saving product rates:', err);
    res.status(500).json({ 
      error: 'Failed to save product rates',
      details: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
};

// Get all rates for a specific finished good
export const getRatesByFinishedGood = async (req, res) => {
  try {
    const { companyId, finishedGoodId } = req.params;
    
    const finishedGood = await FinishedGoods.findOne({
      _id: finishedGoodId,
      companyId
    });
    
    if (!finishedGood) {
      return res.status(404).json({ 
        error: 'Finished good not found or belongs to another company'
      });
    }
    
    const rates = await ProductRate.find({ 
      companyId,
      finishedGood: finishedGoodId 
    })
    .populate('finishedGood', 'code title')
    .populate('accountLevel4', 'subcode title fullcode')
    .sort({ applicableDate: -1 });
    
    // Group by account
    const ratesByAccount = rates.reduce((acc, rate) => {
      const accountId = rate.accountLevel4._id.toString();
      if (!acc[accountId]) {
        acc[accountId] = {
          account: rate.accountLevel4,
          rates: []
        };
      }
      acc[accountId].rates.push(rate);
      return acc;
    }, {});
    
    res.json({
      finishedGood: {
        _id: finishedGood._id,
        code: finishedGood.code,
        title: finishedGood.title
      },
      ratesByAccount: Object.values(ratesByAccount)
    });
  } catch (err) {
    console.error('Error fetching product rates:', err);
    res.status(500).json({ 
      error: 'Failed to fetch product rates',
      details: err.message
    });
  }
};

// Get current active rates for a finished good
export const getCurrentRates = async (req, res) => {
  try {
    const { companyId, finishedGoodId } = req.params;
    
    // Get the most recent active rate for each account
    const currentRates = await ProductRate.aggregate([
      {
        $match: {
          companyId: companyId,
          finishedGood: new mongoose.Types.ObjectId(finishedGoodId),
          isActive: true,
          applicableDate: { $lte: new Date() }
        }
      },
      {
        $sort: { applicableDate: -1 }
      },
      {
        $group: {
          _id: "$accountLevel4",
          rate: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$rate" }
      },
      {
        $lookup: {
          from: "accountlevel4s",
          localField: "accountLevel4",
          foreignField: "_id",
          as: "accountDetails"
        }
      },
      {
        $unwind: "$accountDetails"
      }
    ]);
    
    res.json(currentRates);
  } catch (err) {
    console.error('Error fetching current rates:', err);
    res.status(500).json({ 
      error: 'Failed to fetch current rates',
      details: err.message 
    });
  }
};

export const deleteRate = async (req, res) => {
  try {
    const { id } = req.params;
    const rate = await ProductRate.findByIdAndDelete(id);
    
    if (!rate) {
      return res.status(404).json({ 
        error: 'Rate not found'
      });
    }
    
    res.json({
      message: 'Rate deleted successfully',
      deletedRate: rate
    });
  } catch (err) {
    console.error('Error deleting rate:', err);
    res.status(500).json({ 
      error: 'Failed to delete rate',
      details: err.message
    });
  }
};