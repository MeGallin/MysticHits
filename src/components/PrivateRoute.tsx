import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom, logout } from '../state/authAtoms';
import { validateToken } from '../utils/authUtils';
import { useToast } from '@/hooks/use-toast';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Get authentication state from Jotai
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Validate token when component mounts
    const checkToken = () => {
      const tokenValid = validateToken();
      setIsTokenValid(tokenValid);
      setIsValidatingToken(false);

      if (!tokenValid && isAuthenticated) {
        // Token is invalid but user is marked as authenticated
        // This is a mismatch that needs to be fixed
        toast({
          title: 'Session Expired',
          description: 'Your session has expired. Please log in again.',
          variant: 'destructive',
        });

        // Log the user out
        setTimeout(() => {
          logout();
        }, 1000);
      }
    };

    checkToken();
  }, [isAuthenticated, toast]);

  // Show loading state while validating token
  if (isValidatingToken) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isTokenValid) {
    // Redirect to login if user is not authenticated or token is invalid
    return <Navigate to="/login" replace />;
  }

  // User is authenticated and token is valid, render the protected content
  return <>{children}</>;
};

export default PrivateRoute;
