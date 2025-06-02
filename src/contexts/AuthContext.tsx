import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type User = {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'sales';
  status: 'active' | 'inactive';
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, role: 'admin' | 'sales') => Promise<boolean>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for stored auth token on mount
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user data', error);
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);
  
  const login = async (username: string, password: string, role: 'admin' | 'sales'): Promise<boolean> => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call to your backend
      const response = await fetch('http://localhost:3001/users');
      const users = await response.json();
      
      // Find user with matching username and role
      const matchedUser = users.find(
        (u: any) => u.username === username && u.role === role && u.status === 'active'
      );
      
      if (!matchedUser) {
        return false;
      }
      
      // In a real app, password verification would happen on the server
      // This is just a simulation for the demo
      
      // Create a user object without the password hash
      const { password_hash, ...userWithoutPassword } = matchedUser;
      
      // Store user data in local storage
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      
      return true;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};