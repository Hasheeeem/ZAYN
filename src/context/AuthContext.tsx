import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, AuthState, User } from '../types/auth';
import apiService from '../services/api';

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true, // Start with loading true
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
            // Accept both admin and sales users
            if (response.data.role === 'admin' || response.data.role === 'sales') {
              setAuthState({
                isAuthenticated: true,
                user: response.data,
                loading: false,
                error: null
              });
            } else {
              // Invalid role, clear token
              apiService.clearToken();
              setAuthState({
                isAuthenticated: false,
                user: null,
                loading: false,
                error: 'Invalid user role. Please contact your administrator.'
              });
            }
          } else {
            // Token is invalid, clear it
            apiService.clearToken();
            setAuthState(prev => ({ ...prev, loading: false, isAuthenticated: false, user: null }));
          }
        })
        .catch((error) => {
          // Token is invalid, clear it
          apiService.clearToken();
          setAuthState(prev => ({ 
            ...prev, 
            loading: false,
            isAuthenticated: false,
            user: null,
            error: error.message?.includes('403') ? 'Access denied' : null
          }));
        });
    } else {
      // No token found, set loading to false
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiService.login(email, password);
      
      if (response.success) {
        // Accept both admin and sales users
        if (response.data.user.role === 'admin' || response.data.user.role === 'sales') {
          setAuthState({
            isAuthenticated: true,
            user: response.data.user,
            loading: false,
            error: null
          });
        } else {
          // Invalid role
          apiService.clearToken();
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: 'Invalid user role. Please contact your administrator.'
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
          errorMessage = 'Access denied. Please check your credentials.';
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