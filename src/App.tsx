import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import SalesLayout from './components/SalesLayout';
import UnifiedLogin from './components/UnifiedLogin';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';

const AppContent: React.FC = () => {
  const { authState } = useAuth();

  if (!authState.isAuthenticated) {
    return <UnifiedLogin />;
  }

  // Route based on user role
  if (authState.user?.role === 'admin') {
    return <AdminLayout />;
  } else if (authState.user?.role === 'sales') {
    return <SalesLayout />;
  }

  // Fallback for unknown roles
  return <UnifiedLogin />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;