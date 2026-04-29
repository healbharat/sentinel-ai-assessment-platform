import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading Sentinel Secure...</div>; // Or a spinner
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};
