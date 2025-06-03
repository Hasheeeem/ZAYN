import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Settings, 
  BarChart, 
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'leads', name: 'Leads', icon: <Users size={20} /> },
    { id: 'opportunities', name: 'Opportunities', icon: <Briefcase size={20} /> },
    { id: 'management', name: 'Management', icon: <Settings size={20} /> },
    { id: 'reports', name: 'Reports', icon: <BarChart size={20} /> }
  ];

  return (
    <div className="w-[250px] bg-gradient-to-b from-gray-800 to-gray-700 text-white shadow-lg z-10 h-screen flex flex-col">
      <div className="p-5 border-b border-gray-700 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
          Z
        </div>
        <div className="text-xl font-semibold">ZownLead</div>
      </div>
      
      <nav className="py-5 flex-1">
        {navItems.map(item => (
          <div
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`px-5 py-3 cursor-pointer transition-all duration-200 flex items-center gap-3 hover:bg-gray-700 hover:border-l-4 hover:border-blue-500 ${
              activePage === item.id 
                ? 'bg-gray-700/50 border-l-4 border-blue-500' 
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
        className="px-5 py-3 cursor-pointer transition-all duration-200 flex items-center gap-3 hover:bg-gray-700 border-t border-gray-700 mb-5"
      >
        <div className="text-gray-300"><LogOut size={20} /></div>
        <span>Logout</span>
      </div>
    </div>
  );
};

export default Sidebar;