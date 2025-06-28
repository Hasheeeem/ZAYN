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

  // Show loading state while checking authentication
  if (authState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <UnifiedLogin />;
  }

  // Route based on user role with immediate dashboard redirect
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