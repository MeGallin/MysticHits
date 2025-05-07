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
      {/* Header section with breadcrumb and title */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Link
              to="/admin"
              className="flex items-center text-gray-400 hover:text-white mb-2 sm:mb-0"
            >
              <FiArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <FiBarChart2 className="mr-3 text-green-400" />
              Insights
            </h1>
          </div>

          {/* Last updated timestamp would go here */}
          <div className="text-sm text-gray-400">
            Analytics and performance metrics
          </div>
        </div>

        {/* Quick description of page content */}
        <p className="mt-2 text-gray-400 max-w-3xl">
          Track user engagement and content popularity with real-time analytics.
          Data refreshes automatically and can be manually updated.
        </p>
      </div>

      {/* Cards for summary insights - adds visual appeal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-6 rounded-lg border border-blue-500/30 hover:from-blue-500/30 hover:to-blue-600/20 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-300 text-sm font-medium mb-1">
                User Activity
              </h3>
              <p className="text-2xl font-bold text-white">Engagement</p>
            </div>
            <div className="bg-blue-500/30 p-2 rounded-full">
              <FiUsers className="h-5 w-5 text-blue-300" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Daily and weekly active user metrics
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 p-6 rounded-lg border border-purple-500/30 hover:from-purple-500/30 hover:to-purple-600/20 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-300 text-sm font-medium mb-1">
                Popular Content
              </h3>
              <p className="text-2xl font-bold text-white">Top Tracks</p>
            </div>
            <div className="bg-purple-500/30 p-2 rounded-full">
              <FiMusic className="h-5 w-5 text-purple-300" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Most played tracks across the platform
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* User Activity Stats Section - made more responsive */}
        <div className="xl:col-span-3 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 shadow-lg border border-gray-700/50">
          <UserActivityStats />
        </div>

        {/* Top Tracks Section - made more responsive */}
        <div className="xl:col-span-3 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 shadow-lg border border-gray-700/50">
          <TopTracksTable />
        </div>
      </div>
    </AdminLayout>
  );
};

export default InsightsPage;
