const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const auth = require('../middleware/auth');

const accountTypes = ['SAVINGS', 'CHECKING', 'INVESTMENT'];  // Add/modify account types
const minimumBalance = {
    SAVINGS: 100,
    CHECKING: 0,
    INVESTMENT: 1000
};

// Generate a random account number
const generateAccountNumber = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
};

// Create new account
router.post('/', auth, async (req, res) => {
    try {
        const { accountType } = req.body;
        
        // Validate account type
        if (!['SAVINGS', 'CHECKING', 'INVESTMENT'].includes(accountType)) {
            return res.status(400).json({ message: 'Invalid account type' });
        }

        // Create new account with generated account number and initial balance
        const account = new Account({
            userId: req.user.id,
            accountNumber: generateAccountNumber(),
            accountType,
            balance: 1000, // Set initial balance to 1000
            isActive: true
        });

        await account.save();
        res.status(201).json(account);
    } catch (error) {
        console.error('Account creation error:', error);
        res.status(500).json({ message: 'Error creating account', error: error.message });
    }
});

// Get all accounts for a user
router.get('/', auth, async (req, res) => {
    try {
        const accounts = await Account.find({ userId: req.user.id });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get account balance
router.get('/:accountId/balance', auth, async (req, res) => {
    try {
        const account = await Account.findOne({ 
            _id: req.params.accountId,
            userId: req.user.id 
        });
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.json({ balance: account.balance });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 