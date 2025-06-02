import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { Menu, Bell, User } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { authState } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If not authenticated, redirect to login
  if (!authState.isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }

  const toggleMobileSidebar = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar isMobileOpen={isMobileMenuOpen} toggleMobileSidebar={toggleMobileSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMobileSidebar}
                className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white lg:hidden"
              >
                <Menu size={22} />
              </button>
              <h1 className="text-lg font-semibold md:text-xl hidden sm:block">Lead Management System</h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-1.5 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white relative">
                <Bell size={20} />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              <div className="flex items-center gap-2 border-l pl-2 sm:pl-4 border-gray-200 dark:border-gray-700">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <User size={16} />
                  </div>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{authState.user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{authState.user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;