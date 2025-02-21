import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionHistory = ({ accountId, refresh }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `http://localhost:5000/api/transactions/history/${accountId}`,
                    {
                        headers: {
                            'x-auth-token': token
                        }
                    }
                );
                setTransactions(response.data);
                setError('');
            } catch (error) {
                console.error('Error fetching transactions:', error);
                setError('Failed to load transactions');
            } finally {
                setLoading(false);
            }
        };

        if (accountId) {
            fetchTransactions();
        }
    }, [accountId, refresh]);

    if (loading) return <div>Loading transactions...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="transaction-history">
            <h3>Transaction History</h3>
            <div className="transactions">
                {transactions.length === 0 ? (
                    <p>No transactions found</p>
                ) : (
                    transactions.map(transaction => (
                        <div key={transaction._id} className="transaction-item">
                            <p>From: {transaction.fromUserName}</p>
                            <p>To: {transaction.toUserName}</p>
                            <p>Amount: ${transaction.amount}</p>
                            <p>Date: {new Date(transaction.date).toLocaleDateString()}</p>
                            <p>Status: {transaction.status}</p>
                            {transaction.description && <p>Note: {transaction.description}</p>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TransactionHistory; 