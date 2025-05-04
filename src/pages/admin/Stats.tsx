import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  FiUsers,
  FiMusic,
  FiBarChart2,
  FiEye,
  FiArrowLeft,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const StatsPage: React.FC = () => {
  // This is a placeholder - in a real implementation, you would fetch stats from the API
  const stats = {
    users: {
      total: 156,
      admins: 2,
      newThisMonth: 14,
    },
    music: {
      totalSongs: 78,
      totalPlaylists: 12,
    },
    views: {
      total: 12458,
      unique: 3862,
      averagePerDay: 128,
    },
  };

  return (
    <AdminLayout>
      <div className="flex items-center mb-6">
        <Link
          to="/admin/dashboard"
          className="flex items-center text-gray-400 hover:text-white mr-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white">System Statistics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Users Stats */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 rounded-lg border border-blue-500/30">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-white">Users</h2>
              <p className="text-4xl font-bold text-white mt-2">
                {stats.users.total}
              </p>
            </div>
            <div className="bg-blue-500/30 p-3 rounded-full">
              <FiUsers className="h-8 w-8 text-blue-300" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-200">Admins</span>
              <span className="text-white font-medium">
                {stats.users.admins}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-200">New this month</span>
              <span className="text-white font-medium">
                {stats.users.newThisMonth}
              </span>
            </div>
          </div>
        </div>

        {/* Music Stats */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 rounded-lg border border-purple-500/30">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-white">Music</h2>
              <p className="text-4xl font-bold text-white mt-2">
                {stats.music.totalSongs}
              </p>
            </div>
            <div className="bg-purple-500/30 p-3 rounded-full">
              <FiMusic className="h-8 w-8 text-purple-300" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-200">Total songs</span>
              <span className="text-white font-medium">
                {stats.music.totalSongs}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-200">Playlists</span>
              <span className="text-white font-medium">
                {stats.music.totalPlaylists}
              </span>
            </div>
          </div>
        </div>

        {/* Views Stats */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-6 rounded-lg border border-green-500/30">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-white">Views</h2>
              <p className="text-4xl font-bold text-white mt-2">
                {stats.views.total.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-500/30 p-3 rounded-full">
              <FiEye className="h-8 w-8 text-green-300" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-200">Unique visitors</span>
              <span className="text-white font-medium">
                {stats.views.unique.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-200">Avg. per day</span>
              <span className="text-white font-medium">
                {stats.views.averagePerDay}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics graph placeholder */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Page Views (Last 30 Days)
        </h2>
        <div className="h-64 bg-gray-700/50 rounded-md flex items-center justify-center">
          <p className="text-gray-400">
            Graph visualization would be rendered here
          </p>
        </div>
      </div>

      {/* Data table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden">
          <h2 className="text-xl font-semibold text-white p-6 pb-4">
            Top Pages
          </h2>
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Page
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Views
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800/30 divide-y divide-gray-700">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  Home
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  5,842
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  Playlist
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  3,125
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  About
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  1,864
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  Contact
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  1,627
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden">
          <h2 className="text-xl font-semibold text-white p-6 pb-4">
            User Activity
          </h2>
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  New Users
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Logins
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800/30 divide-y divide-gray-700">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  Today
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">
                  +3
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  42
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  Yesterday
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">
                  +5
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  38
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  Apr 22
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">
                  +2
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  45
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  Apr 21
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">
                  +4
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  51
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StatsPage;
