// src/components/layout/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';

const MainLayout = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Navbar />
      {isAuthenticated && <Sidebar />}
      <div className={`${isAuthenticated ? 'ml-64' : ''} flex-1 pt-16 overflow-auto`}>
        <main className="h-full p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;