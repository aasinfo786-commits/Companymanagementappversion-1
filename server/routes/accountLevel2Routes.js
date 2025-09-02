const express = require('express');
const router = express.Router();
const {
  createAccountLevel2,
  getLevel2Accounts,
  updateAccountLevel2,
  deleteAccountLevel2
} = require('../controllers/accountLevel2Controller');

// POST: Create new Level 2 account
router.post('/', createAccountLevel2);

// GET: Get all Level 2 accounts for a company and Level 1
router.get('/:companyId/:level1Id', getLevel2Accounts);

// PUT: Update Level 2 account by ID
router.put('/:id', updateAccountLevel2);

// DELETE: Delete Level 2 account by ID
router.delete('/:id', deleteAccountLevel2);

module.exports = router;
