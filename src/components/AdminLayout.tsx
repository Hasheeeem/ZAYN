import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard';
import Leads from '../pages/Leads';
import UserSettings from '../pages/UserSettings';
import Reports from '../pages/Reports';
import Management from '../pages/Management';

const AdminLayout: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const { authState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Auto-redirect to dashboard on mount if at root
  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '') {
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Update active page based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') {
      setActivePage('dashboard');
    } else if (path === '/leads') {
      setActivePage('leads');
    } else if (path === '/usersettings') {
      setActivePage('usersettings');
    } else if (path === '/reports') {
      setActivePage('reports');
    } else if (path === '/management') {
      setActivePage('management');
    }
  }, [location.pathname]);
  
  const handleNavigate = (page: string) => {
    setActivePage(page);
    if (page === 'dashboard') {
      navigate('/dashboard');
    } else {
      navigate(`/${page}`);
    }
  };
  
  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Dashboard';
      case 'leads':
        return 'Lead Management';
      case 'usersettings':
        return 'User Settings';
      case 'reports':
        return 'Reports & Analytics';
      case 'management':
        return 'Management';
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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/usersettings" element={<UserSettings />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/management" element={<Management />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;