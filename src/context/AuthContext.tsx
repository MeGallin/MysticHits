import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { jwtDecode } from 'jwt-decode';

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
          console.log('Token expired, logging out');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
          setToken(null);
          return;
        }

        // Token is valid, set auth state
        console.log(
          'Valid token found, setting auth state. Admin:',
          !!decodedToken.isAdmin,
        );
        setIsAuthenticated(true);
        setIsAdmin(!!decodedToken.isAdmin);
        setUser({
          id: decodedToken.userId,
          email: decodedToken.email,
        });
        setToken(storedToken);
      } catch (error) {
        // Invalid token
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
        setToken(null);
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

      console.log('Login successful. Admin status:', !!decodedToken.isAdmin);

      // Set auth state
      setIsAuthenticated(true);
      setIsAdmin(!!decodedToken.isAdmin);
      setUser({
        id: decodedToken.userId,
        email: decodedToken.email,
      });
      setToken(newToken);
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

    console.log('User logged out');
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
