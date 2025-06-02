import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  LogOut, 
  ChevronLeft,
  UserCog
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  toggleMobileSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, toggleMobileSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Leads', path: '/admin/leads', icon: <Users size={20} /> },
    { name: 'People', path: '/admin/people', icon: <UserCog size={20} /> },
    { name: 'Reports', path: '/admin/reports', icon: <BarChart3 size={20} /> },
  ];

  const sidebarClasses = `
    h-full flex flex-col bg-gray-900 text-white transition-all duration-300
    ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
    ${isMobileOpen ? 'fixed inset-y-0 left-0 z-50 w-64' : 'hidden lg:flex'}
  `;

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'lg:hidden' : ''}`}>
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center">
              <span className="font-bold text-white">LM</span>
            </div>
            <h2 className={`font-bold text-xl ${isCollapsed ? 'lg:hidden' : ''}`}>LeadManager</h2>
          </div>
          
          <button 
            onClick={toggleMobileSidebar}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 lg:hidden"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 hidden lg:block"
          >
            <ChevronLeft size={20} className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          <ul className="space-y-1.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }
                    ${isCollapsed ? 'lg:justify-center' : ''}
                  `}
                  end
                >
                  {item.icon}
                  <span className={isCollapsed ? 'lg:hidden' : ''}>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 w-full px-3 py-2.5 text-gray-400 
              hover:text-white hover:bg-gray-800 rounded-lg transition-colors
              ${isCollapsed ? 'lg:justify-center' : ''}
            `}
          >
            <LogOut size={20} />
            <span className={isCollapsed ? 'lg:hidden' : ''}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar