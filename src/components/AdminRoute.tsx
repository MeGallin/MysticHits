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

  // Debug info
  console.log(
    'AdminRoute auth check - isAuthenticated:',
    isAuthenticated,
    'isAdmin:',
    isAdmin,
  );

  if (!isAuthenticated) {
    // Redirect to login if user is not authenticated at all
    console.log('AdminRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Redirect to home if user is authenticated but not an admin
    console.log('AdminRoute: User not an admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // User is authenticated and is an admin, render the protected content
  console.log(
    'AdminRoute: User is authenticated and is an admin, rendering content',
  );
  return <>{children}</>;
};

export default AdminRoute;
