import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AccountList from './AccountList';
import TransactionHistory from './TransactionHistory';
import TransferForm from './TransferForm';

const Dashboard = () => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshTransactions, setRefreshTransactions] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/accounts', {
                headers: {
                    'x-auth-token': token
                }
            });
            setAccounts(response.data);
        } catch (error) {
            console.error('Error fetching accounts:', error);
            setError('Failed to load accounts. Please try logging in again.');
        }
    };

    const handleTransferComplete = () => {
        fetchAccounts();
        setRefreshTransactions(!refreshTransactions);
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="dashboard">
            <h1>Welcome to Virtual Bank</h1>

            <div className="dashboard-grid">
                <AccountList 
                    accounts={accounts} 
                    onSelectAccount={setSelectedAccount} 
                />
                {selectedAccount && (
                    <>
                        <TransactionHistory 
                            accountId={selectedAccount._id} 
                            refresh={refreshTransactions}
                        />
                        <TransferForm 
                            accounts={accounts}
                            onTransferComplete={handleTransferComplete}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard; 