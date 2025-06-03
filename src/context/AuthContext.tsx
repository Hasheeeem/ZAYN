import React, { createContext, useContext, useState } from 'react';
import { AuthContextType, AuthState, User } from '../types/auth';

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

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'admin@lead.com' && password === 'password') {
        const user: User = {
          id: 1,
          name: 'Admin User',
          email: 'admin@lead.com',
          role: 'admin',
          status: 'active',
          lastLogin: new Date().toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })
        };
        
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'Invalid email or password'
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

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};