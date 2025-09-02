const mongoose = require('mongoose');
const Discount = require('../models/DiscountSetting');
const FinishedGoods = require('../models/FinishedGoods');
const AccountLevel4 = require('../models/AccountLevel4');
const DebtorAccount = require('../models/DebtorAccount');

// Update getFilteredDiscounts to include accountLevel4
const getFilteredDiscounts = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { debtorAccountId, debtorAccountLevel4Id, finishedGoodId } = req.body;
    if (!debtorAccountId || !debtorAccountLevel4Id || !finishedGoodId) {
      return res.status(400).json({ 
        error: 'Debtor account ID, account level 4 ID, and finished good ID are required' 
      });
    }
    // Validate all IDs belong to the company
    const [debtorAccount, accountLevel4, finishedGood] = await Promise.all([
      DebtorAccount.findOne({ _id: debtorAccountId, companyId }),
      AccountLevel4.findOne({ _id: debtorAccountLevel4Id, companyId }),
      FinishedGoods.findOne({ _id: finishedGoodId, companyId })
    ]);
    if (!debtorAccount || !accountLevel4 || !finishedGood) {
      return res.status(400).json({ 
        error: 'One or more IDs are invalid or belong to another company' 
      });
    }
    const discounts = await Discount.find({
      companyId,
      debtorAccount: debtorAccountId,
      debtorAccountLevel4: debtorAccountLevel4Id,
      finishedGood: finishedGoodId
    })
    .populate('debtorAccount', 'code title')
    .populate('debtorAccountLevel4', 'subcode title fullcode')
    .populate('accountLevel4', 'subcode title fullcode')
    .populate('finishedGood', 'code title')
    .sort({ applicableDate: 1 });
    res.json(discounts.map(d => d.toObject()));
  } catch (err) {
    console.error('Error fetching filtered discounts:', err);
    res.status(500).json({ error: 'Failed to fetch discounts', details: err.message });
  }
};

const saveDiscounts = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { debtorAccountId, debtorAccountLevel4Id, finishedGoodId, discounts, username } = req.body;
    
    if (!debtorAccountId || !debtorAccountLevel4Id || !finishedGoodId) {
      return res.status(400).json({ 
        error: 'Debtor account ID, account level 4 ID, and finished good ID are required' 
      });
    }
    
    if (!Array.isArray(discounts)) {
      return res.status(400).json({ error: 'Discounts must be an array' });
    }
    
    if (!username) {
      return res.status(400).json({ 
        error: 'Username is required' 
      });
    }
    
    // Validate all IDs belong to the company
    const [debtorAccount, accountLevel4, finishedGood] = await Promise.all([
      DebtorAccount.findOne({ _id: debtorAccountId, companyId }),
      AccountLevel4.findOne({ _id: debtorAccountLevel4Id, companyId }),
      FinishedGoods.findOne({ _id: finishedGoodId, companyId })
    ]);
    
    if (!debtorAccount || !accountLevel4 || !finishedGood) {
      return res.status(400).json({ 
        error: 'One or more IDs are invalid or belong to another company' 
      });
    }
    
    // First delete any discounts that were removed from the frontend
    const existingDiscounts = await Discount.find({
      companyId,
      debtorAccount: debtorAccountId,
      debtorAccountLevel4: debtorAccountLevel4Id,
      finishedGood: finishedGoodId
    });
    
    const existingDiscountIds = existingDiscounts.map(d => d._id.toString());
    const currentDiscountIds = discounts.map(d => d.id).filter(Boolean);
    const discountsToDelete = existingDiscountIds.filter(id => !currentDiscountIds.includes(id));
    
    if (discountsToDelete.length > 0) {
      await Discount.deleteMany({
        _id: { $in: discountsToDelete },
        companyId
      });
    }
    
    // Prepare bulk operations
    const bulkOps = discounts.map(discount => {
      const { id, accountLevel4Id, applicableDate, isActive, discountRates, createdBy, createdAt, updatedAt } = discount;
      
      return {
        updateOne: {
          filter: {
            _id: id ? new mongoose.Types.ObjectId(id) : new mongoose.Types.ObjectId(),
            companyId,
            debtorAccount: debtorAccountId,
            debtorAccountLevel4: debtorAccountLevel4Id,
            accountLevel4: accountLevel4Id,
            finishedGood: finishedGoodId,
            applicableDate: new Date(applicableDate)
          },
          update: {
            $set: {
              companyId,
              debtorAccount: debtorAccountId,
              debtorAccountLevel4: debtorAccountLevel4Id,
              accountLevel4: accountLevel4Id,
              finishedGood: finishedGoodId,
              productCode: finishedGood.code,
              accountCode: accountLevel4.fullcode,
              subCode: accountLevel4.subcode,
              applicableDate: new Date(applicableDate),
              isActive,
              updatedBy: username, // Store username string directly
              updatedAt: new Date(),
              discountRates: Array.isArray(discountRates) ? discountRates.map(rate => ({
                discountTypeId: rate.discountTypeId,
                title: rate.title,
                rate: parseFloat(rate.rate),
                type: rate.type || 'percentage',
                isEditable: rate.isEditable || false
              })) : []
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
    
    const result = await Discount.bulkWrite(bulkOps);
    
    // Fetch the updated discounts to return to frontend
    const updatedDiscounts = await Discount.find({
      companyId,
      debtorAccount: debtorAccountId,
      debtorAccountLevel4: debtorAccountLevel4Id,
      finishedGood: finishedGoodId
    })
    .populate('accountLevel4', 'subcode title fullcode')
    .populate('debtorAccountLevel4', 'subcode title fullcode')
    .sort({ applicableDate: 1 });
    
    res.json({
      message: 'Discounts saved successfully',
      discounts: updatedDiscounts.map(d => d.toObject()),
      result: {
        deleted: discountsToDelete.length,
        upserted: result.upsertedCount,
        modified: result.modifiedCount,
        total: discounts.length
      }
    });
  } catch (err) {
    console.error('Error saving product discounts:', err);
    res.status(500).json({ 
      error: 'Failed to save product discounts',
      details: err.message
    });
  }
};

// Get current active discounts with all three IDs
const getCurrentDiscounts = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { debtorAccountId, debtorAccountLevel4Id, finishedGoodId } = req.body;
    if (!debtorAccountId || !debtorAccountLevel4Id || !finishedGoodId) {
      return res.status(400).json({ 
        error: 'Debtor account ID, account level 4 ID, and finished good ID are required' 
      });
    }
    const currentDiscounts = await Discount.aggregate([
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(companyId),
          debtorAccount: new mongoose.Types.ObjectId(debtorAccountId),
          debtorAccountLevel4: new mongoose.Types.ObjectId(debtorAccountLevel4Id),
          finishedGood: new mongoose.Types.ObjectId(finishedGoodId),
          isActive: true,
          applicableDate: { $lte: new Date() }
        }
      },
      { $sort: { applicableDate: -1 } },
      {
        $group: {
          _id: "$debtorAccountLevel4",
          discount: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$discount" }
      },
      {
        $lookup: {
          from: "accountlevel4s",
          localField: "debtorAccountLevel4",
          foreignField: "_id",
          as: "accountDetails"
        }
      },
      { $unwind: "$accountDetails" },
      {
        $lookup: {
          from: "debtoraccounts",
          localField: "debtorAccount",
          foreignField: "_id",
          as: "debtorAccountDetails"
        }
      },
      { $unwind: "$debtorAccountDetails" },
      {
        $lookup: {
          from: "finishedgoods",
          localField: "finishedGood",
          foreignField: "_id",
          as: "finishedGoodDetails"
        }
      },
      { $unwind: "$finishedGoodDetails" }
    ]);
    res.json(currentDiscounts);
  } catch (err) {
    console.error('Error fetching current discounts:', err);
    res.status(500).json({ 
      error: 'Failed to fetch current discounts',
      details: err.message 
    });
  }
};

// Delete a specific discount
const deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const discount = await Discount.findByIdAndDelete(id);
    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }
    res.json({
      message: 'Discount deleted successfully',
      deletedDiscount: discount
    });
  } catch (err) {
    console.error('Error deleting discount:', err);
    res.status(500).json({ 
      error: 'Failed to delete discount',
      details: err.message
    });
  }
};

module.exports = {
  getFilteredDiscounts,
  saveDiscounts,
  getCurrentDiscounts,
  deleteDiscount
};