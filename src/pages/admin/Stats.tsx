import React, { useState, useEffect, useRef } from 'react';
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
import {
  AlertTriangle,
  Clock,
  AlertCircle,
  Users as LucideUsersIcon,
} from 'lucide-react'; // Added Clock, AlertCircle, LucideUsersIcon
import healthService from '@/services/healthService';
import statsService, {
  DAUStats,
  UserActivityDailySummary,
} from '@/services/statsService'; // Added UserActivityDailySummary

const StatsPage: React.FC = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // DAU/WAU Stats
  const [dauStats, setDauStats] = useState<DAUStats | null>(null);
  const [dauLoading, setDauLoading] = useState(true);
  const [dauError, setDauError] = useState<string | null>(null);
  const [dauIsRateLimited, setDauIsRateLimited] = useState(false);
  const dauRefreshTimeoutRef = useRef<number | null>(null);

  // User Activity Summary Stats
  const [userActivitySummary, setUserActivitySummary] = useState<
    UserActivityDailySummary[] | null
  >(null);
  const [userActivityLoading, setUserActivityLoading] = useState(true);
  const [userActivityError, setUserActivityError] = useState<string | null>(
    null,
  );
  const [userActivityRateLimited, setUserActivityRateLimited] = useState(false);
  // Placeholder for user activity summary refresh, if needed separately
  // const userActivityRefreshTimeoutRef = useRef<number | null>(null);

  // This is a placeholder - in a real implementation, you would fetch stats from the API
  const stats = {
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

  const fetchDauStats = async (forceFresh = false) => {
    try {
      setDauLoading(true);
      const response = await statsService.fetchDAU(forceFresh);

      if (response.success && response.data) {
        setDauStats(response.data);
        setDauError(null);
        setDauIsRateLimited(response.isRateLimited || false);
      } else {
        setDauError(response.error || 'Failed to fetch user activity stats');
        setDauIsRateLimited(response.isRateLimited || false);
      }
    } catch (err) {
      setDauError('An unexpected error occurred while fetching DAU stats');
      console.error(err);
    } finally {
      setDauLoading(false);
    }
  };

  const fetchUserActivitySummaryData = async (forceFresh = false) => {
    try {
      setUserActivityLoading(true);
      const response = await statsService.fetchUserActivitySummary(forceFresh);

      if (response.success && response.data) {
        setUserActivitySummary(response.data);
        setUserActivityError(null);
        setUserActivityRateLimited(response.isRateLimited || false);
      } else {
        setUserActivityError(
          response.error || 'Failed to fetch user activity summary',
        );
        setUserActivityRateLimited(response.isRateLimited || false);
      }
    } catch (err) {
      setUserActivityError(
        'An unexpected error occurred while fetching user activity summary',
      );
      console.error(err);
    } finally {
      setUserActivityLoading(false);
    }
  };

  useEffect(() => {
    fetchDauStats(); // Initial fetch
    fetchUserActivitySummaryData(); // Initial fetch for activity summary

    const refreshIntervalTime =
      dauIsRateLimited || userActivityRateLimited // Use a combined check if desired
        ? 5 * 60 * 1000 // 5 minutes if rate limited
        : 2 * 60 * 1000; // 2 minutes normally

    const intervalId = setInterval(() => {
      fetchDauStats(true);
      fetchUserActivitySummaryData(true);
    }, refreshIntervalTime);

    return () => {
      clearInterval(intervalId);
      if (dauRefreshTimeoutRef.current) {
        // Ensure this ref is used if you have separate timeouts
        window.clearTimeout(dauRefreshTimeoutRef.current);
      }
      // Clear userActivityRefreshTimeoutRef if it were used
    };
  }, [dauIsRateLimited, userActivityRateLimited]); // Re-run if either rate limit status changes

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
              {/* Active Users Stats (derived from DAU/WAU) */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-white flex items-center">
                      <LucideUsersIcon className="mr-2 h-5 w-5" /> Active Users
                    </h2>
                    {dauLoading && !dauStats && (
                      <div className="mt-2 flex items-center">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent mr-2"></div>
                        <p className="text-gray-400">Loading...</p>
                      </div>
                    )}
                    {dauError && (
                      <p className="text-red-400 mt-2 text-sm">{dauError}</p>
                    )}
                    {dauStats && !dauLoading && !dauError && (
                      <p className="text-4xl font-bold text-white mt-2">
                        {dauStats.dau}
                      </p>
                    )}
                  </div>
                  <div className="bg-blue-500/30 p-3 rounded-full">
                    <FiUsers className="h-8 w-8 text-blue-300" />
                  </div>
                </div>

                {dauStats && !dauLoading && !dauError && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Daily Active Users</span>
                      <span className="text-white font-medium">
                        {dauStats.dau}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Weekly Active Users</span>
                      <span className="text-white font-medium">
                        {dauStats.wau}
                      </span>
                    </div>
                    {dauIsRateLimited && (
                      <div className="mt-1 text-amber-400 text-xs flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Using cached data (API rate limit)
                      </div>
                    )}
                    <div className="text-xs text-gray-400 flex items-center justify-end mt-1 pt-1 border-t border-gray-700/50">
                      <Clock className="h-3 w-3 mr-1" />
                      Last updated:{' '}
                      {new Date(dauStats.updated).toLocaleString()}
                    </div>
                  </div>
                )}
                {dauLoading &&
                  dauStats && ( // Show spinner next to title if loading new data but old data exists
                    <div className="absolute top-6 right-6 animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  )}
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

              {/* User Activity card removed from System tab */}
            </div>
          </TabsContent>

          <TabsContent value="traffic" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <UserActivityStats
                stats={dauStats}
                loading={dauLoading}
                error={dauError}
                isRateLimited={dauIsRateLimited}
              />

              {/* User Activity card moved here from System tab */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700">
                <h2 className="text-xl font-semibold text-white p-6 pb-4 flex items-center">
                  <FiUsers className="mr-2" /> User Activity
                  {userActivityLoading && (
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent ml-2"></div>
                  )}
                </h2>
                {userActivityRateLimited && !userActivityError && (
                  <div className="px-6 pb-2 text-amber-400 text-xs flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Using cached/sample data (API rate limit)
                  </div>
                )}
                {userActivityError && (
                  <div className="px-6 pb-4 text-red-400 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {userActivityError}
                  </div>
                )}
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
                      {userActivitySummary && !userActivityError ? (
                        userActivitySummary.map((activity, index) => (
                          <tr key={index}>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {activity.dateLabel}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-green-400">
                              {activity.newUsers > 0
                                ? `+${activity.newUsers}`
                                : activity.newUsers}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {activity.logins}
                            </td>
                          </tr>
                        ))
                      ) : !userActivityLoading && !userActivityError ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 sm:px-6 py-4 text-center text-gray-400"
                          >
                            No user activity data available.
                          </td>
                        </tr>
                      ) : null}
                      {userActivityLoading &&
                        !userActivitySummary &&
                        !userActivityError && (
                          <tr>
                            <td
                              colSpan={3}
                              className="px-4 sm:px-6 py-4 text-center text-gray-400"
                            >
                              Loading activity data...
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
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
