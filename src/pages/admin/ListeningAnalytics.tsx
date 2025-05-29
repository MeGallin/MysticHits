import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  FiUsers,
  FiMusic,
  FiBarChart2,
  FiHeadphones,
  FiTrendingUp,
  FiGlobe,
  FiList,
  FiHeart,
  FiRefreshCw,
  FiArrowLeft,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import listeningAnalyticsService, {
  ListeningAnalyticsOverview,
  UserListeningBehavior,
  ListeningPatterns,
  GeographicListeningAnalytics,
  PlaylistAnalytics,
  UserEngagementAnalytics,
} from '@/services/listeningAnalyticsService';

// Add this interface to handle aggregated data structures
interface AggregatedAnalyticsData {
  standard: any; // Original data structure
  aggregated: any; // Aggregated data structure
  combined?: any; // Combined view of both structures
}

const ListeningAnalytics: React.FC = () => {
  // State for different analytics sections
  const [overview, setOverview] = useState<ListeningAnalyticsOverview | null>(
    null,
  );
  const [userBehavior, setUserBehavior] =
    useState<UserListeningBehavior | null>(null);
  const [patterns, setPatterns] = useState<ListeningPatterns | null>(null);
  const [geographic, setGeographic] =
    useState<GeographicListeningAnalytics | null>(null);
  const [playlists, setPlaylists] = useState<PlaylistAnalytics | null>(null);
  const [engagement, setEngagement] = useState<UserEngagementAnalytics | null>(
    null,
  );

  console.log(
    'ListeningAnalytics component mounted - initial state:',
    overview,
    userBehavior,
    patterns,
    geographic,
    playlists,
    engagement,
  );
  // Loading states
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [userBehaviorLoading, setUserBehaviorLoading] = useState(false);
  const [patternsLoading, setPatternsLoading] = useState(false);
  const [geographicLoading, setGeographicLoading] = useState(false);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [engagementLoading, setEngagementLoading] = useState(false);

  // Error states
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [userBehaviorError, setUserBehaviorError] = useState<string | null>(
    null,
  );
  const [patternsError, setPatternsError] = useState<string | null>(null);
  const [geographicError, setGeographicError] = useState<string | null>(null);
  const [playlistsError, setPlaylistsError] = useState<string | null>(null);
  const [engagementError, setEngagementError] = useState<string | null>(null);

  // Settings
  const [selectedDays, setSelectedDays] = useState(7);

  // Process data to handle both aggregated and standard formats
  const processOverviewData = (rawData: any): ListeningAnalyticsOverview => {
    if (!rawData) return {} as ListeningAnalyticsOverview;

    // Check for aggregated data structure
    const hasAggregatedData =
      rawData.aggregated &&
      rawData.aggregated.playMetrics &&
      Object.keys(rawData.aggregated.playMetrics).length > 0;

    // If we have aggregated data, merge it into the overview
    if (hasAggregatedData) {
      const standardOverview = rawData.overview || {};
      const aggregatedMetrics = rawData.aggregated.playMetrics || {};

      // Create a combined view with priority to aggregated data
      return {
        ...rawData,
        overview: {
          ...standardOverview,
          totalPlays:
            aggregatedMetrics.count || standardOverview.totalPlays || 0,
          totalListenTime:
            aggregatedMetrics.totalListenTime ||
            standardOverview.totalListenTime ||
            0,
          completions: aggregatedMetrics.completions || 0,
          skips: aggregatedMetrics.skips || 0,
          // Keep other metrics from standard data if they exist
          uniqueUsers: standardOverview.uniqueUsers || 0,
          uniqueTracks: standardOverview.uniqueTracks || 0,
          listenRatio: standardOverview.listenRatio || 0,
          averageSessionLength: standardOverview.averageSessionLength || 0,
        },
        // Update completion stats if we have aggregated data
        completion: rawData.completion
          ? {
              ...rawData.completion,
              completionRate:
                aggregatedMetrics.count > 0
                  ? aggregatedMetrics.completions / aggregatedMetrics.count
                  : rawData.completion.completionRate || 0,
            }
          : {
              completionRate: 0,
            },
      };
    }

    // Return original data if no aggregation
    return rawData;
  };

  // Fetch functions
  const fetchOverview = async (forceFresh = false) => {
    setOverviewLoading(true);
    setOverviewError(null);
    try {
      const response = await listeningAnalyticsService.fetchOverview(
        selectedDays,
        forceFresh,
      );
      if (response.success && response.data) {
        // Process the data to handle aggregated and standard formats
        const processedData = processOverviewData(response.data);
        setOverview(processedData);
      } else {
        setOverviewError(response.error || 'Failed to fetch overview');
      }
    } catch (error) {
      setOverviewError('An unexpected error occurred');
    } finally {
      setOverviewLoading(false);
    }
  };

  const fetchUserBehavior = async (forceFresh = false) => {
    setUserBehaviorLoading(true);
    setUserBehaviorError(null);
    try {
      const response = await listeningAnalyticsService.fetchUserBehavior(
        selectedDays,
        20,
        forceFresh,
      );
      if (response.success && response.data) {
        setUserBehavior(response.data);
      } else {
        setUserBehaviorError(response.error || 'Failed to fetch user behavior');
      }
    } catch (error) {
      setUserBehaviorError('An unexpected error occurred');
    } finally {
      setUserBehaviorLoading(false);
    }
  };

  const fetchPatterns = async (forceFresh = false) => {
    setPatternsLoading(true);
    setPatternsError(null);
    try {
      const response = await listeningAnalyticsService.fetchPatterns(
        selectedDays,
        forceFresh,
      );
      if (response.success && response.data) {
        setPatterns(response.data);
      } else {
        setPatternsError(response.error || 'Failed to fetch patterns');
      }
    } catch (error) {
      setPatternsError('An unexpected error occurred');
    } finally {
      setPatternsLoading(false);
    }
  };

  const fetchGeographic = async (forceFresh = false) => {
    setGeographicLoading(true);
    setGeographicError(null);
    try {
      const response = await listeningAnalyticsService.fetchGeographic(
        selectedDays,
        forceFresh,
      );
      if (response.success && response.data) {
        setGeographic(response.data);
      } else {
        setGeographicError(response.error || 'Failed to fetch geographic data');
      }
    } catch (error) {
      setGeographicError('An unexpected error occurred');
    } finally {
      setGeographicLoading(false);
    }
  };

  const fetchPlaylists = async (forceFresh = false) => {
    setPlaylistsLoading(true);
    setPlaylistsError(null);
    try {
      const response = await listeningAnalyticsService.fetchPlaylistAnalytics(
        selectedDays,
        15,
        forceFresh,
      );
      if (response.success && response.data) {
        setPlaylists(response.data);
      } else {
        setPlaylistsError(
          response.error || 'Failed to fetch playlist analytics',
        );
      }
    } catch (error) {
      setPlaylistsError('An unexpected error occurred');
    } finally {
      setPlaylistsLoading(false);
    }
  };

  const fetchEngagement = async (forceFresh = false) => {
    setEngagementLoading(true);
    setEngagementError(null);
    try {
      const response = await listeningAnalyticsService.fetchEngagement(
        selectedDays,
        forceFresh,
      );
      if (response.success) {
        setEngagement(response.data);

        // Show a stale data notice if we're using old cached data
        if (response.stale) {
          setEngagementError(
            '⚠️ Using cached data - Unable to refresh from server',
          );
        }
      } else {
        // Enhanced error message with connection details
        let errorMsg = response.error || 'Failed to fetch engagement analytics';
        if (response.details) {
          const { isConnected, statusCode } = response.details;
          if (!isConnected) {
            errorMsg += ' - Please check your internet connection';
          } else if (statusCode) {
            errorMsg += ` - Server returned status: ${statusCode}`;
          }
        }
        setEngagementError(errorMsg);
      }
    } catch (error: any) {
      setEngagementError(`Error: ${error.message || 'Unknown error'}`);
      console.error('Unexpected error in fetchEngagement:', error);
    } finally {
      setEngagementLoading(false);
    }
  };

  // Load all data
  const loadAllData = (forceFresh = false) => {
    fetchOverview(forceFresh);
    fetchUserBehavior(forceFresh);
    fetchPatterns(forceFresh);
    fetchGeographic(forceFresh);
    fetchPlaylists(forceFresh);
    fetchEngagement(forceFresh);
  };

  useEffect(() => {
    loadAllData();
  }, [selectedDays]);

  // Helper function to format time in minutes/hours
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0m';
    if (seconds < 3600) {
      return `${Math.round(seconds / 60)}m`;
    }
    return `${Math.round((seconds / 3600) * 10) / 10}h`;
  };

  // Helper function to format percentage
  const formatPercentage = (value: number) => {
    if (!value || isNaN(value)) return '0%';
    return `${Math.round(value * 100)}%`;
  };

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-full">
        <Link
          to="/admin/dashboard"
          className="flex items-center text-gray-400 hover:text-white mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Dashboard
        </Link>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Listening Analytics
              </h1>
              <p className="text-gray-400 mt-1">
                Comprehensive insights into user listening behavior and
                engagement
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedDays}
                onChange={(e) => setSelectedDays(Number(e.target.value))}
                className="px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600"
              >
                <option value={1}>Last 24 hours</option>
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <Button
                onClick={() => loadAllData(true)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <FiRefreshCw className="h-4 w-4" />
                <span>Refresh All</span>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger
                value="overview"
                className="flex items-center space-x-2"
              >
                <FiBarChart2 className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="flex items-center space-x-2"
              >
                <FiUsers className="h-4 w-4" />
                <span>User Behavior</span>
              </TabsTrigger>
              <TabsTrigger
                value="patterns"
                className="flex items-center space-x-2"
              >
                <FiTrendingUp className="h-4 w-4" />
                <span>Patterns</span>
              </TabsTrigger>
              <TabsTrigger
                value="geographic"
                className="flex items-center space-x-2"
              >
                <FiGlobe className="h-4 w-4" />
                <span>Geographic</span>
              </TabsTrigger>
              <TabsTrigger
                value="playlists"
                className="flex items-center space-x-2"
              >
                <FiList className="h-4 w-4" />
                <span>Playlists</span>
              </TabsTrigger>
              <TabsTrigger
                value="engagement"
                className="flex items-center space-x-2"
              >
                <FiHeart className="h-4 w-4" />
                <span>Engagement</span>
              </TabsTrigger>
            </TabsList>
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {overviewLoading && (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}

              {overviewError && (
                <Card className="bg-red-900/20 border-red-700">
                  <CardContent className="flex items-center p-6">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-red-400">{overviewError}</span>
                  </CardContent>
                </Card>
              )}

              {overview && overview.overview && !overviewLoading && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                          Total Plays
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">
                          {(overview.overview.totalPlays || 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {overview.overview.uniqueUsers || 0} unique users
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                          Listen Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">
                          {formatTime(overview.overview.totalListenTime || 0)}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatPercentage(overview.overview.listenRatio || 0)}{' '}
                          completion
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                          Completion Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">
                          {overview.completion &&
                          typeof overview.completion.completionRate !==
                            'undefined'
                            ? formatPercentage(
                                overview.completion.completionRate,
                              )
                            : 'N/A'}
                        </div>
                        <Progress
                          value={
                            (overview.completion?.completionRate || 0) * 100
                          }
                          className="mt-2 h-2"
                        />
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                          Unique Tracks
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">
                          {(
                            overview.overview.uniqueTracks || 0
                          ).toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Avg {overview.overview.averageSessionLength || 0} per
                          session
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sources and Devices */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">
                          Top Sources
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {overview.sources &&
                          overview.sources.slice(0, 5).map((source, index) => (
                            <div
                              key={`source-${index}-${
                                source.source || 'unknown'
                              }`}
                              className="flex justify-between items-center"
                            >
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary">{index + 1}</Badge>
                                <span className="text-white capitalize">
                                  {source.source}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-semibold">
                                  {source.count}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {formatTime(source.averageListenDuration)} avg
                                </div>
                              </div>
                            </div>
                          ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">
                          Top Devices
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {overview.devices &&
                          overview.devices.slice(0, 5).map((device, index) => (
                            <div
                              key={`device-${index}-${
                                device.deviceType || 'unknown'
                              }`}
                              className="flex justify-between items-center"
                            >
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary">{index + 1}</Badge>
                                <span className="text-white capitalize">
                                  {device.deviceType}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-semibold">
                                  {device.count}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {formatTime(device.averageListenDuration)} avg
                                </div>
                              </div>
                            </div>
                          ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
            {/* User Behavior Tab */}
            <TabsContent value="users" className="space-y-6">
              {userBehaviorLoading && (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}

              {userBehaviorError && (
                <Card className="bg-red-900/20 border-red-700">
                  <CardContent className="flex items-center p-6">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-red-400">{userBehaviorError}</span>
                  </CardContent>
                </Card>
              )}

              {userBehavior && !userBehaviorLoading && (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Top Users by Activity
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Most active users in the last {selectedDays} days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-2 text-gray-400">
                              User
                            </th>
                            <th className="text-right py-2 text-gray-400">
                              Plays
                            </th>
                            <th className="text-right py-2 text-gray-400">
                              Listen Time
                            </th>
                            <th className="text-right py-2 text-gray-400">
                              Completion
                            </th>
                            <th className="text-right py-2 text-gray-400">
                              Tracks
                            </th>
                            <th className="text-right py-2 text-gray-400">
                              Likes
                            </th>
                          </tr>
                        </thead>
                        <tbody className="space-y-2">
                          {userBehavior &&
                            userBehavior.users &&
                            userBehavior.users
                              .slice(0, 10)
                              .map((user, index) => (
                                <tr
                                  key={user.userId}
                                  className="border-b border-gray-800"
                                >
                                  <td className="py-3">
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="secondary">
                                        {index + 1}
                                      </Badge>
                                      <div>
                                        <div className="text-white font-medium">
                                          {user.username}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {user.email}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="text-right py-3 text-white">
                                    {user.totalPlays}
                                  </td>
                                  <td className="text-right py-3 text-white">
                                    {formatTime(user.totalListenTime)}
                                  </td>
                                  <td className="text-right py-3 text-white">
                                    {user.completionRate}%
                                  </td>
                                  <td className="text-right py-3 text-white">
                                    {user.uniqueTracks}
                                  </td>
                                  <td className="text-right py-3 text-white">
                                    {user.likedTracks}
                                  </td>
                                </tr>
                              ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            {/* Patterns Tab */}
            <TabsContent value="patterns" className="space-y-6">
              {patternsLoading && (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}

              {patternsError && (
                <Card className="bg-red-900/20 border-red-700">
                  <CardContent className="flex items-center p-6">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-red-400">{patternsError}</span>
                  </CardContent>
                </Card>
              )}

              {patterns && patterns.hourlyPattern && !patternsLoading && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Hourly Pattern */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Hourly Listening Pattern
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {patterns.hourlyPattern &&
                          patterns.hourlyPattern.map((hour) => (
                            <div
                              key={hour.hour}
                              className="flex items-center space-x-3"
                            >
                              <div className="w-12 text-sm text-gray-400">
                                {hour.hour.toString().padStart(2, '0')}:00
                              </div>
                              <div className="flex-1">
                                <div
                                  className="bg-blue-600 h-2 rounded"
                                  style={{
                                    width: `${Math.max(
                                      5,
                                      (hour.plays /
                                        Math.max(
                                          ...(patterns.hourlyPattern || []).map(
                                            (h) => h.plays,
                                          ),
                                        )) *
                                        100,
                                    )}%`,
                                  }}
                                />
                              </div>
                              <div className="w-16 text-right text-sm text-white">
                                {hour.plays}
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Genre Pattern */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Top Genres</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {patterns.genrePattern &&
                        patterns.genrePattern
                          .slice(0, 8)
                          .map((genre, index) => (
                            <div
                              key={`genre-${index}-${genre.genre || 'unknown'}`}
                              className="flex justify-between items-center"
                            >
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary">{index + 1}</Badge>
                                <span className="text-white">
                                  {genre.genre}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-semibold">
                                  {genre.plays}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {formatPercentage(
                                    genre.averageCompletionRate,
                                  )}{' '}
                                  completion
                                </div>
                              </div>
                            </div>
                          ))}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            {/* Geographic Tab */}
            <TabsContent value="geographic" className="space-y-6">
              {geographicLoading && (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}

              {geographicError && (
                <Card className="bg-red-900/20 border-red-700">
                  <CardContent className="flex items-center p-6">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-red-400">{geographicError}</span>
                  </CardContent>
                </Card>
              )}

              {geographic && !geographicLoading && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Countries */}
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">
                          Top Countries
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {geographic &&
                          geographic.countries &&
                          geographic.countries
                            .slice(0, 8)
                            .map((country, index) => (
                              <div
                                key={`country-${index}-${
                                  country.country || 'unknown'
                                }`}
                                className="flex justify-between items-center"
                              >
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary">{index + 1}</Badge>
                                  <span className="text-white">
                                    {country.country}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="text-white font-semibold">
                                    {country.plays}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {country.uniqueUsers} users
                                  </div>
                                </div>
                              </div>
                            ))}
                      </CardContent>
                    </Card>

                    {/* Regions */}
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">
                          Top Regions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {geographic &&
                          geographic.regions &&
                          geographic.regions
                            .slice(0, 8)
                            .map((region, index) => (
                              <div
                                key={`region-${index}-${
                                  region.country || 'unknown'
                                }-${region.region || 'unknown'}`}
                                className="flex justify-between items-center"
                              >
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary">{index + 1}</Badge>
                                  <div>
                                    <div className="text-white text-sm">
                                      {region.region}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {region.country}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-white font-semibold">
                                    {region.plays}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {region.uniqueUsers} users
                                  </div>
                                </div>
                              </div>
                            ))}
                      </CardContent>
                    </Card>

                    {/* Cities */}
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Top Cities</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {geographic &&
                          geographic.cities &&
                          geographic.cities.slice(0, 8).map((city, index) => (
                            <div
                              key={`city-${index}-${
                                city.country || 'unknown'
                              }-${city.region || 'unknown'}-${
                                city.city || 'unknown'
                              }`}
                              className="flex justify-between items-center"
                            >
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary">{index + 1}</Badge>
                                <div>
                                  <div className="text-white text-sm">
                                    {city.city}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {city.region}, {city.country}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-semibold">
                                  {city.plays}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {city.uniqueUsers} users
                                </div>
                              </div>
                            </div>
                          ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
            {/* Playlists Tab */}
            <TabsContent value="playlists" className="space-y-6">
              {playlistsLoading && (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}

              {playlistsError && (
                <Card className="bg-red-900/20 border-red-700">
                  <CardContent className="flex items-center p-6">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-red-400">{playlistsError}</span>
                  </CardContent>
                </Card>
              )}

              {playlists && !playlistsLoading && (
                <div className="space-y-6">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Playlist Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-700">
                              <th className="text-left py-2 text-gray-400">
                                Playlist ID
                              </th>
                              <th className="text-right py-2 text-gray-400">
                                Plays
                              </th>
                              <th className="text-right py-2 text-gray-400">
                                Users
                              </th>
                              <th className="text-right py-2 text-gray-400">
                                Tracks
                              </th>
                              <th className="text-right py-2 text-gray-400">
                                Completion
                              </th>
                              <th className="text-right py-2 text-gray-400">
                                Listen Time
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {playlists.playlists &&
                              playlists.playlists.map((playlist, index) => (
                                <tr
                                  key={playlist.playlistId}
                                  className="border-b border-gray-800"
                                >
                                  <td className="py-3">
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="secondary">
                                        {index + 1}
                                      </Badge>
                                      <span className="text-white font-mono text-xs">
                                        {playlist.playlistId.substring(0, 8)}...
                                      </span>
                                    </div>
                                  </td>
                                  <td className="text-right py-3 text-white">
                                    {playlist.plays}
                                  </td>
                                  <td className="text-right py-3 text-white">
                                    {playlist.uniqueUsers}
                                  </td>
                                  <td className="text-right py-3 text-white">
                                    {playlist.uniqueTracks}
                                  </td>
                                  <td className="text-right py-3 text-white">
                                    {playlist.completionRate}%
                                  </td>
                                  <td className="text-right py-3 text-white">
                                    {formatTime(playlist.totalListenTime)}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            {/* Engagement Tab */}
            <TabsContent value="engagement" className="space-y-6">
              {engagementLoading && (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}

              {engagementError && (
                <Card className="bg-red-900/20 border-red-700">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                      <span className="text-red-400">{engagementError}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchEngagement(true)}
                      className="ml-4"
                    >
                      <FiRefreshCw className="mr-2 h-4 w-4" /> Retry
                    </Button>
                  </CardContent>
                </Card>
              )}

              {engagement && !engagementLoading && (
                <div className="space-y-6">
                  {/* Engagement Metrics */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                          Total Users
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">
                          {engagement.engagement
                            ? engagement.engagement.totalUsers
                            : 'N/A'}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {engagement.engagement
                            ? engagement.engagement.highEngagementUsers
                            : 0}{' '}
                          high engagement
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                          Avg Plays/User
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">
                          {engagement.engagement
                            ? engagement.engagement.averagePlaysPerUser
                            : 'N/A'}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {engagement.engagement
                            ? formatTime(
                                engagement.engagement.averageListenTimePerUser,
                              )
                            : 'N/A'}{' '}
                          listen time
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                          Retention Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">
                          {engagement.retention
                            ? formatPercentage(
                                engagement.retention.retentionRate,
                              )
                            : 'N/A'}
                        </div>
                        <Progress
                          value={
                            engagement.retention
                              ? engagement.retention.retentionRate * 100
                              : 0
                          }
                          className="mt-2 h-2"
                        />
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                          Quality Score
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">
                          {engagement.quality
                            ? Math.round(
                                (1 - engagement.quality.bufferRate) * 100,
                              )
                            : 'N/A'}
                          %
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {engagement.quality
                            ? engagement.quality.averageBufferCount.toFixed(1)
                            : 'N/A'}{' '}
                          avg buffers
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Engagement Stats */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">
                          User Interactions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Like Rate</span>
                          <span className="text-white">
                            {engagement.engagement
                              ? engagement.engagement.likeRate.toFixed(2)
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Share Rate</span>
                          <span className="text-white">
                            {engagement.engagement
                              ? engagement.engagement.shareRate.toFixed(2)
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Repeat Rate</span>
                          <span className="text-white">
                            {engagement.engagement
                              ? engagement.engagement.repeatRate.toFixed(2)
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Avg Active Days</span>
                          <span className="text-white">
                            {engagement.engagement
                              ? engagement.engagement.averageActiveDays
                              : 'N/A'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">
                          User Retention
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">New Users (7d)</span>
                          <span className="text-white">
                            {engagement.retention
                              ? engagement.retention.newUsersLast7Days
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">
                            Active Users (7d)
                          </span>
                          <span className="text-white">
                            {engagement.retention
                              ? engagement.retention.activeUsersLast7Days
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Returning Users</span>
                          <span className="text-white">
                            {engagement.retention
                              ? engagement.retention.returningUsers
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">
                            New User Retention
                          </span>
                          <span className="text-white">
                            {engagement.retention
                              ? formatPercentage(
                                  engagement.retention.newUserRetentionRate,
                                )
                              : 'N/A'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">
                          Quality Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Buffer Rate</span>
                          <span className="text-white">
                            {engagement.quality
                              ? formatPercentage(engagement.quality.bufferRate)
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Quality Issues</span>
                          <span className="text-white">
                            {engagement.quality
                              ? formatPercentage(
                                  engagement.quality.qualityIssueRate,
                                )
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">
                            Total Buffer Events
                          </span>
                          <span className="text-white">
                            {engagement.quality
                              ? engagement.quality.totalBufferEvents
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Quality Drops</span>
                          <span className="text-white">
                            {engagement.quality
                              ? engagement.quality.totalQualityDrops
                              : 'N/A'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>{' '}
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ListeningAnalytics;
