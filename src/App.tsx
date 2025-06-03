import React from 'react';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './components/AdminLogin';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';

const AppContent: React.FC = () => {
  const { authState } = useAuth();

  return (
    <div className="font-sans">
      {authState.isAuthenticated ? <AdminLayout /> : <AdminLogin />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;