import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layout Components
import AdminLayout from './layouts/AdminLayout';
import SalesLayout from './layouts/SalesLayout';

// Auth Pages
import AdminLogin from './pages/auth/AdminLogin';
import SalesLogin from './pages/auth/SalesLogin';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import OpportunityManagement from './pages/admin/OpportunityManagement';
import Reports from './pages/admin/Reports';

// Sales Pages
import SalesDashboard from './pages/sales/Dashboard';
import MyOpportunities from './pages/sales/MyOpportunities';
import OpportunityDetails from './pages/sales/OpportunityDetails';

// Protection Wrappers
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/unauthorized\" replace />;
  }
  
  return <>{children}</>;
};

const ProtectedSalesRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/sales/login" replace />;
  }
  
  if (user?.role !== 'sales') {
    return <Navigate to="/unauthorized\" replace />;
  }
  
  return <>{children}</>;
};

// Error Pages
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="text-xl text-gray-600 mt-4">Page Not Found</p>
    </div>
  </div>
);

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-red-600">401</h1>
      <p className="text-xl text-gray-600 mt-4">Unauthorized Access</p>
    </div>
  </div>
);

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/sales/login" element={<SalesLogin />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedAdminRoute>
          <AdminLayout />
        </ProtectedAdminRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="opportunities" element={<OpportunityManagement />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      
      {/* Sales Routes */}
      <Route path="/sales" element={
        <ProtectedSalesRoute>
          <SalesLayout />
        </ProtectedSalesRoute>
      }>
        <Route index element={<SalesDashboard />} />
        <Route path="opportunities" element={<MyOpportunities />} />
        <Route path="opportunities/:id" element={<OpportunityDetails />} />
      </Route>
      
      {/* Error Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
      
      {/* Default Route */}
      <Route path="/" element={<Navigate to="/admin/login\" replace />} />
    </Routes>
  );
}

export default App;