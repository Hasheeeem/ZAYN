import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  Target,
  User,
  CheckSquare,
  LogOut 
} from 'lucide-react';

interface SalesSidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const SalesSidebar: React.FC<SalesSidebarProps> = ({ activePage, onNavigate }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'leads', name: 'My Leads', icon: <Users size={20} /> },
    { id: 'calendar', name: 'Calendar', icon: <Calendar size={20} /> },
    { id: 'tasks', name: 'Tasks', icon: <CheckSquare size={20} /> },
    { id: 'targets', name: 'Sales Targets', icon: <Target size={20} /> },
    { id: 'profile', name: 'My Profile', icon: <User size={20} /> }
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-[250px] bg-gradient-to-b from-gray-800 to-gray-700 text-white shadow-lg z-10 flex flex-col transition-all duration-300 lg:translate-x-0 transform">
      <div className="p-5 border-b border-gray-700 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center font-bold text-lg">
          Z
        </div>
        <div>
          <div className="text-xl font-semibold">ZownLead</div>
          <div className="text-xs text-gray-300">Sales Portal</div>
        </div>
      </div>
      
      <nav className="py-5 flex-1 overflow-y-auto">
        {navItems.map(item => (
          <div
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`px-5 py-3 cursor-pointer transition-all duration-200 flex items-center gap-3 hover:bg-gray-700 hover:border-l-4 hover:border-green-500 ${
              activePage === item.id 
                ? 'bg-gray-700/50 border-l-4 border-green-500' 
                : 'border-l-4 border-transparent'
            }`}
          >
            <div className="text-gray-300">{item.icon}</div>
            <span>{item.name}</span>
          </div>
        ))}
      </nav>
      
      <div 
        onClick={handleLogout}
        className="px-5 py-3 cursor-pointer transition-all duration-200 flex items-center gap-3 hover:bg-gray-700 border-t border-gray-700 mt-auto"
      >
        <div className="text-gray-300"><LogOut size={20} /></div>
        <span>Logout</span>
      </div>
    </aside>
  );
};

export default SalesSidebar;