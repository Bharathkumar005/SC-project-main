import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NotificationService from '../utils/NotificationService';

const TransferForm = ({ accounts, onTransferComplete }) => {
    const [formData, setFormData] = useState({
        fromAccountId: '',
        toAccountNumber: '',
        amount: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        NotificationService.requestPermission();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/transactions/transfer',
                formData,
                {
                    headers: {
                        'x-auth-token': token
                    }
                }
            );
            
            NotificationService.showTransactionNotification(
                'sent',
                formData.amount,
                formData.fromAccountId,
                formData.toAccountNumber
            );

            onTransferComplete();
            setFormData({ fromAccountId: '', toAccountNumber: '', amount: '', description: '' });
        } catch (error) {
            console.error('Transfer failed:', error);
            setError(error.response?.data?.message || 'Transfer failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="transfer-form">
            <h3>Make a Transfer</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <select
                    value={formData.fromAccountId}
                    onChange={(e) => setFormData({...formData, fromAccountId: e.target.value})}
                    required
                >
                    <option value="">Select source account</option>
                    {accounts.map(account => (
                        <option key={account._id} value={account._id}>
                            {account.accountNumber} ({account.accountType})
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Destination Account Number"
                    required
                    value={formData.toAccountNumber}
                    onChange={(e) => setFormData({...formData, toAccountNumber: e.target.value})}
                />
                <input
                    type="number"
                    placeholder="Amount"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Transfer'}
                </button>
            </form>
        </div>
    );
};

export default TransferForm; 