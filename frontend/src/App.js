import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Billing from './components/Billing';
import './App.css';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    const handleLogin = (token) => {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <div className="app">
                <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
                <div className="container">
                    <Routes>
                        <Route 
                            path="/login" 
                            element={
                                isAuthenticated ? 
                                <Navigate to="/dashboard" /> : 
                                <Login onLogin={handleLogin} />
                            } 
                        />
                        <Route 
                            path="/register" 
                            element={
                                isAuthenticated ? 
                                <Navigate to="/dashboard" /> : 
                                <Register />
                            } 
                        />
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedRoute isAuthenticated={isAuthenticated}>
                                    <Dashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/billing" 
                            element={
                                <ProtectedRoute isAuthenticated={isAuthenticated}>
                                    <Billing />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/" 
                            element={
                                isAuthenticated ? 
                                <Navigate to="/dashboard" /> : 
                                <Navigate to="/login" />
                            } 
                        />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App; 