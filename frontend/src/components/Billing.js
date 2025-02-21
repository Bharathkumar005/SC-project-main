import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Billing = () => {
    const [bills, setBills] = useState([]);
    const [formData, setFormData] = useState({
        amount: '',
        dueDate: '',
        description: '',
        type: 'Electricity',
        paymentMethod: 'UPI'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedBill, setSelectedBill] = useState(null);
    const [upiPin, setUpiPin] = useState('');
    const [showUpiPopup, setShowUpiPopup] = useState(false);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/bills', {
                headers: {
                    'x-auth-token': token
                }
            });
            setBills(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching bills:', error);
            setError('Failed to load bills');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBill = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/bills', formData, {
                headers: {
                    'x-auth-token': token
                }
            });
            fetchBills();
            setFormData({
                amount: '',
                dueDate: '',
                description: '',
                type: 'Electricity',
                paymentMethod: 'UPI'
            });
        } catch (error) {
            console.error('Error adding bill:', error);
            setError('Failed to add bill');
        }
    };

    const handlePayNow = (billId) => {
        setSelectedBill(billId);
        setShowUpiPopup(true);
    };

    const handleUpiPayment = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/transactions/upi-payment', {
                billId: selectedBill,
                upiPin
            }, {
                headers: {
                    'x-auth-token': token
                }
            });

            if (response.data.success) {
                toast.success('Transaction is successful!');
                fetchBills();
            } else {
                toast.error('Incorrect UPI PIN');
            }
        } catch (error) {
            console.error('UPI payment error:', error);
            toast.error('Payment failed');
        } finally {
            setShowUpiPopup(false);
            setUpiPin('');
        }
    };

    if (loading) return <div>Loading bills...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="billing">
            <h2>Billing Management</h2>
            <form onSubmit={handleAddBill}>
                <input
                    type="number"
                    placeholder="Amount"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
                <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                    <option value="Electricity">Electricity</option>
                    <option value="Mobile Recharge">Mobile Recharge</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Loan EMI">Loan EMI</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Other">Other</option>
                </select>
                <button type="submit">Add Bill</button>
            </form>
            <div className="bills">
                {bills.length === 0 ? (
                    <p>No bills found</p>
                ) : (
                    bills.map(bill => (
                        <div key={bill._id} className="bill-item">
                            <p>Type: {bill.type}</p>
                            <p>Due Date: {new Date(bill.dueDate).toLocaleDateString()}</p>
                            <p>Amount: ${bill.amount}</p>
                            <p>Status: {bill.status}</p>
                            {bill.description && <p>Description: {bill.description}</p>}
                            <button onClick={() => handlePayNow(bill._id)}>Pay Now</button>
                            {selectedBill === bill._id && showUpiPopup && (
                                <div className="upi-popup">
                                    <input
                                        type="password"
                                        placeholder="Enter UPI PIN"
                                        value={upiPin}
                                        onChange={(e) => setUpiPin(e.target.value)}
                                    />
                                    <button onClick={handleUpiPayment}>Confirm Payment</button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default Billing;