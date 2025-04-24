import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

/**
 * A wrapper for admin routes that requires admin privileges
 * If user is not admin or not authenticated, redirects to login or specified path
 */
const AdminRoute: React.FC<AdminRouteProps> = ({
  children,
  redirectPath = '/login',
}) => {
  const { isAuthenticated, isAdmin } = useAuth();

  console.log(
    'AdminRoute check - isAuthenticated:',
    isAuthenticated,
    'isAdmin:',
    isAdmin,
  );

  // If user is not authenticated or not an admin, redirect
  if (!isAuthenticated || !isAdmin) {
    console.log('Redirecting non-admin user to', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  // If user is authenticated and is an admin, render the children
  return <>{children}</>;
};

export default AdminRoute;
