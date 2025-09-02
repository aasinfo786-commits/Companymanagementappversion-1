const express = require('express');
const router = express.Router();
const {
  createAccountLevel3,
  getLevel3Accounts,
  getAccountLevel3,
  updateAccountLevel3,
  deleteAccountLevel3
} = require('../controllers/accountLevel3Controller');

// Create a new Level 3 account
router.post('/', createAccountLevel3);

// Get all Level 3 accounts for a specific hierarchy
router.get('/:companyId/:level1Id/:level2Id', getLevel3Accounts);

// Get a single Level 3 account by ID
router.get('/:id', getAccountLevel3);

// Update a Level 3 account
router.put('/:id', updateAccountLevel3);

// Delete a Level 3 account
router.delete('/:id', deleteAccountLevel3);

module.exports = router;