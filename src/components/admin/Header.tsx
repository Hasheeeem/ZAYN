import { useState } from 'react';
import { Bell, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Mobile Menu Toggle */}
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
            
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gray-900">Zayn Admin Portal</h1>
            </div>
          </div>
          
          {/* Right side - User profile & actions */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
            </button>
            
            <button
              type="button"
              className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Settings</span>
              <Settings className="h-6 w-6" />
            </button>
            
            {/* Profile dropdown */}
            <div className="relative flex items-center">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 hidden md:block">
                  <div className="text-sm font-medium text-gray-700">{user?.username}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="ml-2 rounded-full bg-white p-1 text-gray-400 hover:text-red-500"
              >
                <span className="sr-only">Log out</span>
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;