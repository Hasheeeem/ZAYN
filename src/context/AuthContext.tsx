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
            setAuthState({
              isAuthenticated: true,
              user: response.data,
              loading: false,
              error: null
            });
          } else {
            // Token is invalid, clear it
            apiService.clearToken();
            setAuthState(prev => ({ ...prev, loading: false }));
          }
        })
        .catch(() => {
          // Token is invalid, clear it
          apiService.clearToken();
          setAuthState(prev => ({ ...prev, loading: false }));
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiService.login(email, password);
      
      if (response.success) {
        setAuthState({
          isAuthenticated: true,
          user: response.data.user,
          loading: false,
          error: null
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: response.message || 'Login failed'
        }));
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'An error occurred during login'
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