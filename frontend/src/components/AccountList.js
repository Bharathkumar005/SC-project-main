import React from 'react';

const AccountList = ({ accounts, onSelectAccount }) => {
    return (
        <div className="account-list">
            <h2>Your Accounts</h2>
            <div className="accounts">
                {accounts.map(account => (
                    <div 
                        key={account._id} 
                        className="account-card"
                        onClick={() => onSelectAccount(account)}
                    >
                        <h3>{account.accountType}</h3>
                        <p>Account Number: {account.accountNumber}</p>
                        <p>Balance: ${account.balance.toFixed(2)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AccountList; 