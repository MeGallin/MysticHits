import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { FiBarChart2, FiArrowLeft, FiUsers, FiMusic } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import UserActivityStats from '@/components/stats/UserActivityStats';
import TopTracksTable from '@/components/stats/TopTracksTable';

/**
 * Insights page component
 * Displays user activity metrics and top tracks in the admin dashboard
 */
const InsightsPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-full">
        <Link
          to="/admin/dashboard"
          className="flex items-center text-gray-400 hover:text-white mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Dashboard
        </Link>

        <div className="flex items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Insights & Analytics
          </h1>
        </div>

        <div className="space-y-6">
          {/* User Activity Stats Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-700">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <FiUsers className="mr-2" /> User Activity
              </h2>
              <p className="text-sm text-gray-300 mt-1">
                Daily and weekly active user statistics
              </p>
            </div>
            <UserActivityStats />
          </div>

          {/* Top Tracks Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-700">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <FiMusic className="mr-2" /> Top Tracks
              </h2>
              <p className="text-sm text-gray-300 mt-1">
                Most popular music across the platform
              </p>
            </div>
            <TopTracksTable />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default InsightsPage;
