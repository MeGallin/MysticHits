import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom, isAdminAtom } from '../state/authAtoms';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  // Get authentication and admin state from Jotai
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [isAdmin] = useAtom(isAdminAtom);

  if (!isAuthenticated) {
    // Redirect to login if user is not authenticated at all
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Redirect to home if user is authenticated but not an admin
    return <Navigate to="/" replace />;
  }

  // User is authenticated and is an admin, render the protected content
  return <>{children}</>;
};

export default AdminRoute;
