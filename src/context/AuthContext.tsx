import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, AuthState, User } from '../types/auth';
import apiService from '../services/api';

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null
};

export const AuthContext = createContext<AuthContextType>({
  authState: defaultAuthState,
  login: async () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      setAuthState(prev => ({ ...prev, loading: true }));
      apiService.getCurrentUser()
        .then(response => {
          if (response.success) {
            // Verify user is admin
            if (response.data.role === 'admin') {
              setAuthState({
                isAuthenticated: true,
                user: response.data,
                loading: false,
                error: null
              });
            } else {
              // Non-admin user, clear token and show error
              apiService.clearToken();
              setAuthState({
                isAuthenticated: false,
                user: null,
                loading: false,
                error: 'Admin access required. Only administrators can access this system.'
              });
            }
          } else {
            // Token is invalid, clear it
            apiService.clearToken();
            setAuthState(prev => ({ ...prev, loading: false }));
          }
        })
        .catch((error) => {
          // Token is invalid, clear it
          apiService.clearToken();
          setAuthState(prev => ({ 
            ...prev, 
            loading: false,
            error: error.message?.includes('403') ? 'Admin access required' : null
          }));
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiService.login(email, password);
      
      if (response.success) {
        // Verify user is admin
        if (response.data.user.role === 'admin') {
          setAuthState({
            isAuthenticated: true,
            user: response.data.user,
            loading: false,
            error: null
          });
        } else {
          // Non-admin user
          apiService.clearToken();
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: 'Admin access required. Only administrators can access this system.'
          }));
        }
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: response.message || 'Login failed'
        }));
      }
    } catch (error: any) {
      let errorMessage = 'An error occurred during login';
      
      if (error.message) {
        if (error.message.includes('403')) {
          errorMessage = 'Admin access required. Only administrators can access this system.';
        } else if (error.message.includes('423')) {
          errorMessage = 'Account locked due to too many failed attempts. Please try again later.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      });
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};