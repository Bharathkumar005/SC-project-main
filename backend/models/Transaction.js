const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    fromAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    toAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['TRANSFER', 'BILL_PAYMENT', 'DEPOSIT', 'WITHDRAWAL'], required: true },
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
    description: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema); 