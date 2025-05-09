import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import { broadcastLogin, broadcastLogout } from '../utils/authUtils';
import axios from 'axios'; // Add axios import

// Define the shape of the JWT payload
interface JwtPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
  exp: number;
}

// Define the shape of our auth context
interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: { id: string; email: string } | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

// Hook for using the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Helper function to set auth token in axios defaults
  const setAuthToken = (token: string | null) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Check for token in localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      try {
        // Decode the token
        const decodedToken = jwtDecode<JwtPayload>(storedToken);

        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          // Token expired, remove from storage
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
          setToken(null);
          setAuthToken(null); // Clear axios auth header
          return;
        }

        // Token is valid, set auth state
        setIsAuthenticated(true);
        setIsAdmin(!!decodedToken.isAdmin);
        setUser({
          id: decodedToken.userId,
          email: decodedToken.email,
        });
        setToken(storedToken);
        setAuthToken(storedToken); // Set axios auth header
      } catch (error) {
        // Invalid token
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
        setToken(null);
        setAuthToken(null); // Clear axios auth header
      }
    }
  }, []);

  // Login function
  const login = (newToken: string) => {
    try {
      // Store token in localStorage
      localStorage.setItem('token', newToken);

      // Decode the token
      const decodedToken = jwtDecode<JwtPayload>(newToken);

      // Set auth state
      setIsAuthenticated(true);
      setIsAdmin(!!decodedToken.isAdmin);
      setUser({
        id: decodedToken.userId,
        email: decodedToken.email,
      });
      setToken(newToken);
      setAuthToken(newToken); // Set axios auth header

      // Broadcast login event to update Navigation component
      broadcastLogin();
    } catch (error) {
      console.error('Error during login:', error);
      logout();
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');

    // Reset auth state
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
    setToken(null);
    setAuthToken(null); // Clear axios auth header

    // Broadcast logout event to update Navigation component
    broadcastLogout();
  };

  // Provide the auth context to children
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
