import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import SalesSidebar from './SalesSidebar';
import { useAuth } from '../context/AuthContext';
import SalesDashboard from '../pages/sales/SalesDashboard';
import SalesLeads from '../pages/sales/SalesLeads';
import SalesCalendar from '../pages/sales/SalesCalendar';
import SalesTargets from '../pages/sales/SalesTargets';
import SalesReports from '../pages/sales/SalesReports';
import SalesProfile from '../pages/sales/SalesProfile';

const SalesLayout: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  const handleNavigate = (page: string) => {
    setActivePage(page);
    navigate(`/sales/${page === 'dashboard' ? '' : page}`);
  };
  
  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Sales Dashboard';
      case 'leads':
        return 'My Leads';
      case 'calendar':
        return 'Calendar & Tasks';
      case 'targets':
        return 'Sales Targets';
      case 'reports':
        return 'My Reports';
      case 'profile':
        return 'My Profile';
      default:
        return 'Sales Dashboard';
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <SalesSidebar activePage={activePage} onNavigate={handleNavigate} />
      
      <div className="flex-1 ml-[250px]">
        <div className="bg-white/95 backdrop-blur-sm rounded-tl-3xl m-5 shadow-xl overflow-hidden">
          <header className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-5 flex justify-between items-center shadow-md">
            <h1 className="text-2xl font-light">{getPageTitle()}</h1>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-semibold">
                {authState.user?.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium">{authState.user?.name}</div>
                <div className="text-sm opacity-80">Sales Representative</div>
              </div>
            </div>
          </header>
          
          <main className="p-8 min-h-[calc(100vh-7rem)] overflow-y-auto">
            <Routes>
              <Route path="/sales" element={<SalesDashboard />} />
              <Route path="/sales/" element={<SalesDashboard />} />
              <Route path="/sales/leads" element={<SalesLeads />} />
              <Route path="/sales/calendar" element={<SalesCalendar />} />
              <Route path="/sales/targets" element={<SalesTargets />} />
              <Route path="/sales/reports" element={<SalesReports />} />
              <Route path="/sales/profile" element={<SalesProfile />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SalesLayout;