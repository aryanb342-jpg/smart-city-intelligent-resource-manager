import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ResourcePage from './pages/ResourcePage';
import { Layout } from './components/Layout';
import { AuthContext } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { token } = useContext(AuthContext);
    if (!token) return <Navigate to="/login" replace />;
    return <Layout>{children}</Layout>;
};

const App = () => {
    return (
        <Routes>
            <Route path="/login" element={<Auth />} />
            
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
            
            <Route path="/electricity" element={
                <ProtectedRoute>
                    <ResourcePage title="Electricity" type="electricity" unit="kWh" />
                </ProtectedRoute>
            } />

            <Route path="/water" element={
                <ProtectedRoute>
                    <ResourcePage title="Water" type="water" unit="Liters" />
                </ProtectedRoute>
            } />

            <Route path="/wifi" element={
                <ProtectedRoute>
                    <ResourcePage title="WiFi" type="wifi" unit="GB" />
                </ProtectedRoute>
            } />

            <Route path="/waste" element={
                <ProtectedRoute>
                    <ResourcePage title="Waste" type="waste" unit="kg" />
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default App;
