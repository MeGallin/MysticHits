import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { FiUsers, FiMusic, FiBarChart2, FiMessageSquare } from 'react-icons/fi';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard Overview</h1>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6">
        <p className="text-xl text-white mb-2">
          Welcome, {user?.name || user?.email}
        </p>
        <p className="text-gray-300">
          This is the admin dashboard. From here you can manage users, content,
          and view statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 rounded-lg border border-blue-500/30 flex items-center">
          <FiUsers className="h-10 w-10 text-blue-400 mr-4" />
          <div>
            <h2 className="text-lg font-semibold text-white">
              User Management
            </h2>
            <p className="text-blue-200">Manage user accounts</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 rounded-lg border border-purple-500/30 flex items-center">
          <FiMusic className="h-10 w-10 text-purple-400 mr-4" />
          <div>
            <h2 className="text-lg font-semibold text-white">
              Music Management
            </h2>
            <p className="text-purple-200">Manage playlists and songs</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-6 rounded-lg border border-green-500/30 flex items-center">
          <FiBarChart2 className="h-10 w-10 text-green-400 mr-4" />
          <div>
            <h2 className="text-lg font-semibold text-white">Statistics</h2>
            <p className="text-green-200">View site analytics</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 p-6 rounded-lg border border-amber-500/30 flex items-center">
          <FiMessageSquare className="h-10 w-10 text-amber-400 mr-4" />
          <div>
            <h2 className="text-lg font-semibold text-white">Messages</h2>
            <p className="text-amber-200">Manage contact messages</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Recent Activities
          </h2>
          <div className="space-y-3">
            <p className="text-gray-300">• New user registration (today)</p>
            <p className="text-gray-300">• Playlist updated (yesterday)</p>
            <p className="text-gray-300">• System maintenance (2 days ago)</p>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            System Status
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">API Status:</span>
              <span className="text-green-400">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Database:</span>
              <span className="text-green-400">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Last Backup:</span>
              <span className="text-blue-400">Today at 03:00 AM</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
