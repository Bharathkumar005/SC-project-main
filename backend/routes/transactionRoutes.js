const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const Bill = require('../models/Bill');

const DAILY_TRANSFER_LIMIT = 10000;
const MIN_TRANSFER_AMOUNT = 1;
const MAX_TRANSFER_AMOUNT = 50000;

// Transfer funds without transaction
router.post('/transfer', auth, async (req, res) => {
    try {
        const { fromAccountId, toAccountNumber, amount, description } = req.body;

        const transferAmount = parseFloat(amount);

        if (transferAmount <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than zero' });
        }

        const fromAccount = await Account.findOne({ 
            _id: fromAccountId,
            userId: req.user.id 
        });

        if (!fromAccount) {
            return res.status(404).json({ message: 'Source account not found' });
        }

        if (fromAccount.balance < transferAmount) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        const toAccount = await Account.findOne({ accountNumber: toAccountNumber });
        if (!toAccount) {
            return res.status(404).json({ message: 'Destination account not found' });
        }

        // Update account balances
        fromAccount.balance -= transferAmount;
        toAccount.balance += transferAmount;

        await fromAccount.save();
        await toAccount.save();

        // Create transaction record
        const transaction = new Transaction({
            fromAccount: fromAccountId,
            toAccount: toAccount._id,
            amount: transferAmount,
            type: 'TRANSFER',
            description,
            status: 'COMPLETED'
        });

        await transaction.save();

        // Get user details for better notifications
        const fromUser = await User.findById(req.user.id);
        const toUser = await User.findById(toAccount.userId);

        res.json({
            message: 'Transfer successful',
            transaction,
            details: {
                fromAccount: {
                    number: fromAccount.accountNumber,
                    newBalance: fromAccount.balance,
                    holderName: `${fromUser.firstName} ${fromUser.lastName}`
                },
                toAccount: {
                    number: toAccount.accountNumber,
                    newBalance: toAccount.balance,
                    holderName: toUser ? `${toUser.firstName} ${toUser.lastName}` : 'Unknown'
                },
                amount: transferAmount
            }
        });

    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({ message: 'Transfer failed. Please try again.', error: error.message });
    }
});

// Get transaction history
router.get('/history/:accountId', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [
                { fromAccount: req.params.accountId },
                { toAccount: req.params.accountId }
            ]
        }).sort({ date: -1 }).lean();

        // Populate user details
        for (let transaction of transactions) {
            const fromAccount = await Account.findById(transaction.fromAccount);
            const toAccount = await Account.findById(transaction.toAccount);

            if (fromAccount && toAccount) {
                const fromUser = await User.findById(fromAccount.userId);
                const toUser = await User.findById(toAccount.userId);

                transaction.fromUserName = fromUser ? `${fromUser.firstName} ${fromUser.lastName}` : 'Unknown';
                transaction.toUserName = toUser ? `${toUser.firstName} ${toUser.lastName}` : 'Unknown';
            } else {
                transaction.fromUserName = 'Unknown';
                transaction.toUserName = 'Unknown';
            }
        }

        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Pay a bill
router.post('/pay-bill', auth, async (req, res) => {
    try {
        const { accountId, amount, description } = req.body;

        const account = await Account.findOne({ _id: accountId, userId: req.user.id });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        if (account.balance < amount) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        account.balance -= amount;
        await account.save();

        const transaction = new Transaction({
            fromAccount: accountId,
            toAccount: null, // No specific account for bill payments
            amount,
            type: 'BILL_PAYMENT',
            description,
            status: 'COMPLETED'
        });

        await transaction.save();

        res.json({ message: 'Bill paid successfully', transaction });
    } catch (error) {
        console.error('Bill payment error:', error);
        res.status(500).json({ message: 'Error paying bill', error: error.message });
    }
});

// Schedule a future transaction
router.post('/schedule-transaction', auth, async (req, res) => {
    try {
        const { fromAccountId, toAccountId, amount, description, date } = req.body;

        const transaction = new Transaction({
            fromAccount: fromAccountId,
            toAccount: toAccountId,
            amount,
            type: 'TRANSFER',
            description,
            status: 'SCHEDULED',
            date: new Date(date)
        });

        await transaction.save();

        res.json({ message: 'Transaction scheduled successfully', transaction });
    } catch (error) {
        console.error('Scheduling error:', error);
        res.status(500).json({ message: 'Error scheduling transaction', error: error.message });
    }
});

// Set up recurring payments
router.post('/recurring-payment', auth, async (req, res) => {
    try {
        const { fromAccountId, toAccountId, amount, description, interval } = req.body;

        const transaction = new Transaction({
            fromAccount: fromAccountId,
            toAccount: toAccountId,
            amount,
            type: 'RECURRING_PAYMENT',
            description,
            status: 'ACTIVE',
            interval // e.g., 'monthly', 'weekly'
        });

        await transaction.save();

        res.json({ message: 'Recurring payment set up successfully', transaction });
    } catch (error) {
        console.error('Recurring payment error:', error);
        res.status(500).json({ message: 'Error setting up recurring payment', error: error.message });
    }
});

// UPI Payment
router.post('/upi-payment', auth, async (req, res) => {
    try {
        const { billId, upiPin } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const bill = await Bill.findById(billId);
        if (!bill || bill.userId.toString() !== user._id.toString()) {
            return res.status(404).json({ message: 'Bill not found or does not belong to user' });
        }

        // Direct comparison of UPI PIN
        if (upiPin !== user.upiPin) {
            return res.status(400).json({ success: false, message: 'Incorrect UPI PIN' });
        }

        const account = await Account.findOne({ userId: req.user.id, accountType: 'SAVINGS' });
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        if (account.balance < bill.amount) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        account.balance -= bill.amount;
        await account.save();

        bill.status = 'PAID';
        await bill.save();

        res.json({ success: true, message: 'Payment successful' });
    } catch (error) {
        console.error('UPI payment error:', error);
        res.status(500).json({ message: 'Payment failed', error: error.message });
    }
});

module.exports = router; 