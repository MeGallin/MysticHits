import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
        <p className="text-xl text-white mb-4">
          Welcome, {user?.name || user?.email}
        </p>
        <p className="text-gray-300">
          This is the admin dashboard. From here you can manage users, content,
          and view statistics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-700/50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">
              User Management
            </h2>
            <p className="text-gray-300">View and manage user accounts.</p>
          </div>

          <div className="bg-gray-700/50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">
              Music Management
            </h2>
            <p className="text-gray-300">Manage playlists and audio content.</p>
          </div>

          <div className="bg-gray-700/50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">
              Statistics
            </h2>
            <p className="text-gray-300">
              View site analytics and user metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
