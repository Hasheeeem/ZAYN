import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, AlertTriangle, Wifi, WifiOff, Users, Settings } from 'lucide-react';
import apiService from '../services/api';

const UnifiedLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const { authState, login } = useAuth();

  useEffect(() => {
    // Test API connection on component mount
    const testConnection = async () => {
      const connected = await apiService.testConnection();
      setApiConnected(connected);
    };
    
    testConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiConnected) {
      return;
    }
    
    await login(email, password);
  };

  const getErrorMessage = (error: string) => {
    if (error.includes('Admin access required')) {
      return 'Invalid credentials or insufficient permissions. Please check your email and password.';
    }
    if (error.includes('Account locked')) {
      return 'Your account has been temporarily locked due to multiple failed login attempts. Please try again later.';
    }
    if (error.includes('disabled')) {
      return 'Your account has been disabled. Please contact your system administrator.';
    }
    if (error.includes('Unable to connect to server')) {
      return 'Cannot connect to the backend server. Please ensure the backend is running on http://localhost:8000';
    }
    return error;
  };

  const retryConnection = async () => {
    setApiConnected(null);
    const connected = await apiService.testConnection();
    setApiConnected(connected);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden backdrop-blur-sm bg-white/95">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white text-center relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full backdrop-blur-sm">
              <Shield size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">ZownLead CRM</h1>
            <p className="text-indigo-100 font-medium">Welcome Back</p>
            <p className="text-indigo-200 text-sm mt-1">Sign in to your account</p>
          </div>
        </div>

        {/* API Connection Status */}
        <div className="px-8 pt-6">
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            apiConnected === null ? 'bg-yellow-50 border border-yellow-200' :
            apiConnected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {apiConnected === null ? (
              <>
                <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-yellow-700 text-sm">Testing connection...</span>
              </>
            ) : apiConnected ? (
              <>
                <Wifi size={16} className="text-green-600" />
                <span className="text-green-700 text-sm">Backend connected</span>
              </>
            ) : (
              <>
                <WifiOff size={16} className="text-red-600" />
                <span className="text-red-700 text-sm">Backend disconnected</span>
                <button
                  onClick={retryConnection}
                  className="ml-auto text-red-600 hover:text-red-800 text-sm underline"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          {authState.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 text-sm font-medium">Authentication Failed</p>
                <p className="text-red-700 text-sm mt-1">{getErrorMessage(authState.error)}</p>
              </div>
            </div>
          )}

          {!apiConnected && apiConnected !== null && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">Backend Server Not Available</p>
              <p className="text-red-700 text-sm mt-1">
                Please start the backend server by running: <code className="bg-red-100 px-1 rounded">npm run backend</code>
              </p>
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-gray-50 focus:bg-white"
              placeholder="Enter your email"
              required
              autoComplete="email"
              disabled={authState.loading || !apiConnected}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={authState.loading || !apiConnected}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={authState.loading || !apiConnected}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={authState.loading || !apiConnected}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {authState.loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing In...
              </>
            ) : (
              <>
                <Shield size={18} />
                Sign In
              </>
            )}
          </button>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Protected by enterprise-grade security
            </p>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Encrypted
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                Monitored
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                Secured
              </span>
            </div>
          </div>
        </form>
        
        <div className="bg-gray-50 px-8 py-4 border-t">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-3">Access Levels</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Settings size={14} className="text-indigo-600" />
                  <span className="font-semibold text-gray-700">Admin Access</span>
                </div>
                <p className="text-gray-600">Full system management</p>
              </div>
              <div className="bg-white rounded-lg p-3 border text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Users size={14} className="text-green-600" />
                  <span className="font-semibold text-gray-700">Sales Access</span>
                </div>
                <p className="text-gray-600">Lead management</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Contact your administrator for access</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;