const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Account = require('../models/Account'); // Import Account model

const TOKEN_EXPIRATION = '24h';  // JWT token expiration time

// Generate a random account number
const generateAccountNumber = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
};

// Register route
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phoneNumber, accountNumber, upiPin } = req.body;
        
        // Validate account number length
        if (accountNumber.length !== 16) {
            return res.status(400).json({ message: 'Account number must be exactly 16 digits' });
        }

        // Check if user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check if account number is unique
        const existingAccount = await Account.findOne({ accountNumber });
        if (existingAccount) {
            return res.status(400).json({ message: 'Account number already exists' });
        }

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password, // Will be hashed by pre-save middleware
            phoneNumber,
            upiPin // Store UPI PIN directly
        });

        await newUser.save();

        // Create an account for the user
        const account = new Account({
            userId: newUser._id,
            accountNumber,
            accountType: 'SAVINGS', // Default account type
            balance: 1000, // Initial balance
            isActive: true
        });

        await account.save();

        // Create and return JWT token
        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: TOKEN_EXPIRATION }
        );

        res.status(201).json({ token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: TOKEN_EXPIRATION
        });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 