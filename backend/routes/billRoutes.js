const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Bill = require('../models/Bill');

// Get user bills
router.get('/', auth, async (req, res) => {
    try {
        const bills = await Bill.find({ userId: req.user.id });
        res.json(bills);
    } catch (error) {
        console.error('Error fetching bills:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a new bill
router.post('/', auth, async (req, res) => {
    try {
        const { amount, dueDate, description, type, paymentMethod } = req.body;
        const bill = new Bill({
            userId: req.user.id,
            amount,
            dueDate,
            description,
            type,
            paymentMethod
        });
        await bill.save();
        res.status(201).json(bill);
    } catch (error) {
        console.error('Error adding bill:', error);
        res.status(500).json({ message: 'Error adding bill' });
    }
});

module.exports = router; 