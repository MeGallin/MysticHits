import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
  redirectPath?: string;
}

/**
 * A wrapper for admin routes that requires admin privileges
 * If user is not admin or not authenticated, redirects to login or specified path
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ redirectPath = '/login' }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is not authenticated or not an admin, redirect
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to={redirectPath} replace />;
  }

  // If user is authenticated and is an admin, render the protected route
  return <Outlet />;
};

export default AdminRoute;
