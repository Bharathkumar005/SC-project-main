const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['PENDING', 'PAID', 'OVERDUE'], default: 'PENDING' },
    description: { type: String },
    type: { type: String, enum: ['Electricity', 'Mobile Recharge', 'Credit Card', 'Loan EMI', 'Insurance', 'Other'], required: true },
    paymentMethod: { type: String, enum: ['UPI', 'NetBanking', 'Credit Card', 'Debit Card'], required: true }
});

module.exports = mongoose.model('Bill', billSchema); 