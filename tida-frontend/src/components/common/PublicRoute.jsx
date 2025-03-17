// src/components/common/PublicRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : <Outlet />;
};

export default PublicRoute;