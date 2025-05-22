import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  FiUsers,
  FiMusic,
  FiBarChart2,
  FiEye,
  FiArrowLeft,
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HealthCard from '@/components/admin/HealthCard';
import ApiLatencyWidget from '@/components/admin/ApiLatencyWidget';
import UserActivityStats from '@/components/admin/UserActivityStats';
import TopTracksTable from '@/components/admin/TopTracksTable';
import AdminErrorsWidget from '@/components/admin/AdminErrorsWidget';
import { AlertTriangle } from 'lucide-react';
import healthService from '@/services/healthService';

const StatsPage: React.FC = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const isAuth = await healthService.checkAuth();
        setIsAuthenticated(isAuth);
        if (!isAuth) {
          console.warn('User not authenticated for health endpoints');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    navigate('/login', { state: { returnUrl: '/admin/stats' } });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-full">
          <Link
            to="/admin/dashboard"
            className="flex items-center text-gray-400 hover:text-white mb-4"
          >
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </Link>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-yellow-800">
                  Authentication Required
                </h3>
                <p className="text-yellow-700 mt-1">
                  You need to be logged in as an admin to view system
                  statistics.
                </p>
                <button
                  onClick={handleLogin}
                  className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Log In
                </button>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

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
            System Statistics
          </h1>
        </div>

        <Tabs defaultValue="system" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <HealthCard />
              {/* Users Stats */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
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
                    <span className="text-gray-400">Admins</span>
                    <span className="text-white font-medium">
                      {stats.users.admins}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">New this month</span>
                    <span className="text-white font-medium">
                      {stats.users.newThisMonth}
                    </span>
                  </div>
                </div>
              </div>

              {/* Music Stats */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
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
                    <span className="text-gray-400">Total songs</span>
                    <span className="text-white font-medium">
                      {stats.music.totalSongs}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Playlists</span>
                    <span className="text-white font-medium">
                      {stats.music.totalPlaylists}
                    </span>
                  </div>
                </div>
              </div>

              {/* Views Stats */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
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
                    <span className="text-gray-400">Unique visitors</span>
                    <span className="text-white font-medium">
                      {stats.views.unique.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Avg. per day</span>
                    <span className="text-white font-medium">
                      {stats.views.averagePerDay}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* API Performance Metrics and Errors Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* API Latency Widget */}
              <ApiLatencyWidget />

              {/* Errors Widget */}
              <AdminErrorsWidget />
            </div>

            {/* Analytics graph placeholder */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FiBarChart2 className="mr-2" /> Page Views (Last 30 Days)
              </h2>
              <div className="h-64 bg-gray-700/50 rounded-md flex items-center justify-center">
                <p className="text-gray-400">
                  Graph visualization would be rendered here
                </p>
              </div>
            </div>

            {/* Data tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700">
                <h2 className="text-xl font-semibold text-white p-6 pb-4 flex items-center">
                  <FiBarChart2 className="mr-2" /> Top Pages
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Page
                        </th>
                        <th
                          scope="col"
                          className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Views
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800/30 divide-y divide-gray-700">
                      <tr>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          Home
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          5,842
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          Playlist
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          3,125
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          Charts
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          2,345
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          About
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          1,864
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          Contact
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          1,627
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700">
                <h2 className="text-xl font-semibold text-white p-6 pb-4 flex items-center">
                  <FiUsers className="mr-2" /> User Activity
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          New Users
                        </th>
                        <th
                          scope="col"
                          className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Logins
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800/30 divide-y divide-gray-700">
                      <tr>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          Today
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-green-400">
                          +3
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          42
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          Yesterday
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-green-400">
                          +5
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          38
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          Apr 22
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-green-400">
                          +2
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          45
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          Apr 21
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-green-400">
                          +4
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          51
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="traffic" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <UserActivityStats />
            </div>
            <TopTracksTable />
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <AdminErrorsWidget />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default StatsPage;
