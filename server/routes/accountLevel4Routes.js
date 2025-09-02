const express = require('express');
const router = express.Router();
const accountLevel4Controller = require('../controllers/accountLevel4Controller');

// Create a new Level 4 account
router.post('/', accountLevel4Controller.createAccountLevel4);

// Get all Level 4 accounts for a specific company and hierarchy
router.get('/:companyId/:level1Id/:level2Id/:level3Id', accountLevel4Controller.getLevel4Accounts);

// Get a single Level 4 account by ID
router.get('/:id', accountLevel4Controller.getAccountLevel4);

// Update a Level 4 account
router.put('/:id', accountLevel4Controller.updateAccountLevel4);

// Delete a Level 4 account
router.delete('/:id', accountLevel4Controller.deleteAccountLevel4);

module.exports = router;