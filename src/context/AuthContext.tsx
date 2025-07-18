import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';

interface UserAuthData {
  _id: string;
  username: string;
  email: string;
  token: string;
}

interface AuthContextType {
  user: UserAuthData | null;
  isAuthenticated: boolean;
  login: (userData: UserAuthData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserAuthData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('chatAppUser');

    if (storedUser) {
      try {
        const parsedUser: UserAuthData = JSON.parse(storedUser);

        if (parsedUser.token) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to parse user data from localStorage', error);
        localStorage.removeItem('chatAppUser');
      }
    }
  }, []);

  const login = (userData: UserAuthData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('chatAppUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('chatAppUser');
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
