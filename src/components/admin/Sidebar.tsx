import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, BarChart3 } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h2 className="text-2xl font-bold text-primary-600">ZAYN</h2>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </NavLink>
              
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <Users className="mr-3 h-5 w-5" />
                User Management
              </NavLink>
              
              <NavLink
                to="/admin/opportunities"
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <Briefcase className="mr-3 h-5 w-5" />
                Opportunities
              </NavLink>
              
              <NavLink
                to="/admin/reports"
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <BarChart3 className="mr-3 h-5 w-5" />
                Reports
              </NavLink>
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">Admin Portal</p>
                  <p className="text-xs font-medium text-gray-500">v1.0.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;