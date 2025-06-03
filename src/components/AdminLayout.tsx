import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard';
import Leads from '../pages/Leads';
import People from '../pages/People';
import Reports from '../pages/Reports';

const AdminLayout: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const { authState } = useAuth();
  
  const getPageComponent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'leads':
        return <Leads />;
      case 'management':
        return <People />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };
  
  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Dashboard';
      case 'leads':
        return 'Lead Management';
      case 'management':
        return 'User Management';
      case 'reports':
        return 'Reports & Analytics';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      
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
            {getPageComponent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;