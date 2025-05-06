import React from 'react';
import { Navigate } from 'react-router-dom';
import { AUTH_EVENTS, isAuthenticated } from '@/utils/authUtils';

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that protects routes requiring authentication
 * Redirects to login page if the user is not authenticated
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default PrivateRoute;
