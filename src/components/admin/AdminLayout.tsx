import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiUsers,
  FiMusic,
  FiBarChart2,
  FiMessageSquare,
  FiMenu,
  FiX,
  FiLogOut,
  FiHome,
} from 'react-icons/fi';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar closed by default when navigating to the page
  const { logout, user } = useAuth();
  const location = useLocation();

  const navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <FiHome className="mr-3 h-5 w-5" />,
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: <FiUsers className="mr-3 h-5 w-5" />,
    },
    {
      name: 'Music',
      path: '/admin/music',
      icon: <FiMusic className="mr-3 h-5 w-5" />,
    },
    {
      name: 'Stats',
      path: '/admin/stats',
      icon: <FiBarChart2 className="mr-3 h-5 w-5" />,
    },
    {
      name: 'Messages',
      path: '/admin/messages',
      icon: <FiMessageSquare className="mr-3 h-5 w-5" />,
    },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = () => {
    // Close sidebar when navigation item is selected
    setSidebarOpen(false);
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path ||
      (path === '/admin' && location.pathname === '/admin/dashboard')
    );
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Header with title, logout and sidebar toggle */}
      <div className="fixed top-0 right-0 left-0 h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 z-20">
        <h1 className="text-xl font-bold text-white">Mystic Hits Admin</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => logout()}
            className="p-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 flex items-center"
            title="Logout"
          >
            <FiLogOut className="h-5 w-5" />
          </button>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md bg-gray-700 text-white hover:bg-gray-600"
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed top-14 bottom-0 left-0 z-10 w-64 transition-transform duration-300 ease-in-out transform bg-gray-800 border-r border-gray-700 flex flex-col`}
      >
        {/* Welcome message */}
        <div className="p-4 border-b border-gray-700">
          <p className="text-sm text-gray-400">Welcome, {user?.email}</p>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              } flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors`}
              onClick={handleNavigation}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => {
              logout();
              handleNavigation();
            }}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700"
          >
            <FiLogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main
        className={`flex-1 ml-0 p-6 pt-20 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        } `}
      >
        {children}
      </main>

      {/* Overlay for when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-5 bg-black bg-opacity-50"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;
