import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Define user type
type User = {
  id: string;
  email: string;
  isAdmin: boolean;
  name?: string;
};

// Type for the JWT payload
type JwtPayload = {
  id: string;
  email: string;
  isAdmin: boolean;
  name?: string;
  iat: number;
  exp: number;
};

// Define context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for token on mount and set user if valid
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = jwtDecode<JwtPayload>(token);

          // Check if token is expired
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp < currentTime) {
            // Token expired, log out
            localStorage.removeItem('token');
            setUser(null);
          } else {
            // Valid token, set user
            setUser({
              id: decodedToken.id,
              email: decodedToken.email,
              isAdmin: decodedToken.isAdmin,
              name: decodedToken.name,
            });
          }
        } catch (error) {
          console.error('Invalid token:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    // Run auth check
    checkAuth();

    // Listen for auth events
    const handleLogin = () => {
      checkAuth();
    };

    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:login', handleLogin);
    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:login', handleLogin);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  // Login function
  const login = (token: string) => {
    // Store token
    localStorage.setItem('token', token);

    try {
      // Decode token
      const decodedToken = jwtDecode<JwtPayload>(token);

      // Set user
      setUser({
        id: decodedToken.id,
        email: decodedToken.email,
        isAdmin: decodedToken.isAdmin,
        name: decodedToken.name,
      });

      // Dispatch login event
      window.dispatchEvent(new Event('auth:login'));
    } catch (error) {
      console.error('Invalid token:', error);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);

    // Dispatch logout event
    window.dispatchEvent(new Event('auth:logout'));
  };

  // Context value
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
