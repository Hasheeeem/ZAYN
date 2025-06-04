import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard';
import Leads from '../pages/Leads';
import People from '../pages/People';
import Reports from '../pages/Reports';

const AdminLayout: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  const handleNavigate = (page: string) => {
    setActivePage(page);
    navigate(`/${page === 'dashboard' ? '' : page}`);
  };
  
  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Dashboard';
      case 'leads':
        return 'Lead Management';
      case 'management':
        return 'System Management';
      case 'reports':
        return 'Reports & Analytics';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />
      
      <div className="flex-1 ml-[250px]">
        <div className="bg-white/95 backdrop-blur-sm rounded-tl-3xl m-5 shadow-xl overflow-hidden">
          <header className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 flex justify-between items-center shadow-md">
            <h1 className="text-2xl font-light">{getPageTitle()}</h1>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-semibold">
                {authState.user?.name.charAt(0)}
              </div>
              <span>{authState.user?.email}</span>
            </div>
          </header>
          
          <main className="p-8 min-h-[calc(100vh-7rem)] overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/management" element={<People />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;