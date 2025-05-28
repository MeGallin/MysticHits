import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  FiBarChart2,
  FiArrowLeft,
  FiUsers,
  FiMusic,
  FiClock,
  FiTrendingUp,
  FiPlayCircle,
  FiHeadphones,
  FiSkipForward,
  FiHeart,
  FiShare2,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import UserActivityStats from '@/components/stats/UserActivityStats';
import TopTracksTable from '@/components/stats/TopTracksTable';
import listeningAnalyticsService from '@/services/listeningAnalyticsService';
import type {
  ListeningAnalyticsOverview,
  UserBehavior,
  ListeningPatterns,
  UserEngagementAnalytics,
} from '@/services/listeningAnalyticsService';

/**
 * Enhanced Insights page component
 * Displays comprehensive analytics including user activity, listening patterns,
 * engagement metrics, and top tracks with enhanced visualizations
 */
const InsightsPage: React.FC = () => {
  // State for listening analytics data
  const [overview, setOverview] = useState<ListeningAnalyticsOverview | null>(
    null,
  );
  const [engagement, setEngagement] = useState<UserEngagementAnalytics | null>(
    null,
  );
  const [patterns, setPatterns] = useState<ListeningPatterns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7');

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        const [overviewRes, engagementRes, patternsRes] = await Promise.all([
          listeningAnalyticsService.fetchOverview(parseInt(selectedPeriod)),
          listeningAnalyticsService.fetchEngagement(parseInt(selectedPeriod)),
          listeningAnalyticsService.fetchPatterns(parseInt(selectedPeriod)),
        ]);

        if (overviewRes.success) setOverview(overviewRes.data || null);
        if (engagementRes.success) setEngagement(engagementRes.data || null);
        if (patternsRes.success) setPatterns(patternsRes.data || null);

        // Show error if any critical data failed to load
        if (!overviewRes.success) {
          setError(overviewRes.error || 'Failed to load analytics overview');
        }
      } catch (err) {
        setError('Failed to load analytics data');
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedPeriod]);

  // Format time in minutes/hours
  const formatTime = (seconds: number) => {
    if (seconds < 3600) {
      return `${Math.round(seconds / 60)}m`;
    }
    return `${Math.round(seconds / 3600)}h ${Math.round(
      (seconds % 3600) / 60,
    )}m`;
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Enhanced Metric Card Component
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: number;
    trendLabel?: string;
    color?: string;
  }> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    trendLabel,
    color = 'blue',
  }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg bg-${color}-500/20 mr-3`}>{icon}</div>
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {trend !== undefined && (
          <div
            className={`text-sm ${
              trend >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            <FiTrendingUp
              className={`inline w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`}
            />
            {Math.abs(trend).toFixed(1)}%
            {trendLabel && (
              <span className="text-gray-500 ml-1">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Progress Bar Component
  const ProgressBar: React.FC<{
    label: string;
    value: number;
    max: number;
    color?: string;
  }> = ({ label, value, max, color = 'blue' }) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">{label}</span>
          <span className="text-white">{value.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`bg-${color}-500 h-2 rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
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

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-0">
            Enhanced Insights & Analytics
          </h1>

          {/* Period Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Period:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1">Last 24 hours</option>
              <option value="7">Last week</option>
              <option value="14">Last 2 weeks</option>
              <option value="30">Last month</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {/* Key Metrics Overview */}
            {overview && overview.overview && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Plays"
                  value={overview.overview.totalPlays.toLocaleString()}
                  subtitle={`${overview.overview.uniqueUsers} unique users`}
                  icon={<FiPlayCircle className="w-6 h-6 text-blue-400" />}
                  color="blue"
                />
                <MetricCard
                  title="Listen Time"
                  value={formatTime(overview.overview.totalListenTime)}
                  subtitle={`${formatPercentage(
                    overview.overview.listenRatio,
                  )} completion`}
                  icon={<FiHeadphones className="w-6 h-6 text-green-400" />}
                  color="green"
                />
                <MetricCard
                  title="Completion Rate"
                  value={overview.completion ? formatPercentage(overview.completion.completionRate) : 'N/A'}
                  subtitle={overview.completion ? `${overview.completion.skippedTracks} skipped` : 'N/A'}
                  icon={<FiClock className="w-6 h-6 text-purple-400" />}
                  color="purple"
                />
                <MetricCard
                  title="Unique Tracks"
                  value={overview.overview.uniqueTracks.toLocaleString()}
                  subtitle={`${Math.round(
                    overview.overview.averageSessionLength,
                  )}min avg session`}
                  icon={<FiMusic className="w-6 h-6 text-orange-400" />}
                  color="orange"
                />
              </div>
            )}

            {/* Engagement Metrics */}
            {engagement && engagement.engagement && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <FiHeart className="mr-2 text-red-400" /> User Engagement
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">
                      Interaction Rates
                    </h3>
                    <ProgressBar
                      label="Like Rate"
                      value={Math.round(engagement.engagement.likeRate * 100)}
                      max={100}
                      color="red"
                    />
                    <ProgressBar
                      label="Share Rate"
                      value={Math.round(engagement.engagement.shareRate * 100)}
                      max={100}
                      color="blue"
                    />
                    <ProgressBar
                      label="Repeat Rate"
                      value={Math.round(engagement.engagement.repeatRate * 100)}
                      max={100}
                      color="green"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">
                      User Activity
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          High Engagement Users
                        </span>
                        <span className="text-white">
                          {engagement.engagement.highEngagementUsers} (
                          {formatPercentage(
                            engagement.engagement.highEngagementRate,
                          )}
                          )
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          Avg Plays per User
                        </span>
                        <span className="text-white">
                          {Math.round(
                            engagement.engagement.averagePlaysPerUser,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          Avg Listen Time per User
                        </span>
                        <span className="text-white">
                          {formatTime(
                            engagement.engagement.averageListenTimePerUser,
                          )}
                        </span>
                      </div>                        <div className="flex justify-between">
                          <span className="text-gray-400">Retention Rate</span>
                          <span className="text-white">
                            {engagement.retention ? formatPercentage(engagement.retention.retentionRate) : 'N/A'}
                          </span>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Listening Patterns */}
            {patterns && patterns.hourlyPattern && patterns.hourlyPattern.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <FiBarChart2 className="mr-2 text-blue-400" /> Listening
                  Patterns
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">
                      Peak Hours
                    </h3>
                    <div className="space-y-2">
                      {patterns.hourlyPattern && patterns.hourlyPattern
                        .sort((a, b) => b.plays - a.plays)
                        .slice(0, 6)
                        .map((hour, index) => (
                          <div
                            key={hour.hour}
                            className="flex items-center justify-between"
                          >
                            <span className="text-gray-400">
                              {hour.hour}:00 - {hour.hour + 1}:00
                            </span>
                            <div className="flex items-center">
                              <div className="w-20 bg-gray-700 rounded-full h-2 mr-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{
                                    width: `${
                                      (hour.plays /
                                        Math.max(
                                          ...(patterns.hourlyPattern ? patterns.hourlyPattern.map(
                                            (h) => h.plays,
                                          ) : [1]),
                                        )) *
                                      100
                                    }%`,
                                  }}
                                />
                              </div>
                              <span className="text-white text-sm">
                                {hour.plays}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">
                      Popular Genres
                    </h3>
                    <div className="space-y-2">
                      {patterns.genrePattern && patterns.genrePattern
                        .sort((a, b) => b.plays - a.plays)
                        .slice(0, 6)
                        .map((genre, index) => (
                          <div
                            key={genre.genre}
                            className="flex items-center justify-between"
                          >
                            <span className="text-gray-400 capitalize">
                              {genre.genre || 'Unknown'}
                            </span>
                            <div className="flex items-center">
                              <div className="w-20 bg-gray-700 rounded-full h-2 mr-2">
                                <div
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{
                                    width: `${
                                      (genre.plays /
                                        Math.max(
                                          ...(patterns.genrePattern ? patterns.genrePattern.map(
                                            (g) => g.plays,
                                          ) : [1]),
                                        )) *
                                      100
                                    }%`,
                                  }}
                                />
                              </div>
                              <span className="text-white text-sm">
                                {genre.plays}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Original User Activity Stats Section - Enhanced */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-700">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <FiUsers className="mr-2" /> User Activity Stats
                </h2>
                <p className="text-sm text-gray-300 mt-1">
                  Daily and weekly active user statistics with enhanced insights
                </p>
              </div>
              <UserActivityStats />
            </div>

            {/* Original Top Tracks Section - Enhanced */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-700">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <FiMusic className="mr-2" /> Top Tracks Performance
                </h2>
                <p className="text-sm text-gray-300 mt-1">
                  Most popular music across the platform with detailed analytics
                </p>
              </div>
              <TopTracksTable />
            </div>

            {/* Additional Analytics Link */}
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm rounded-lg p-6 border border-purple-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Comprehensive Analytics
                  </h3>
                  <p className="text-gray-300">
                    Access detailed listening analytics with geographic data,
                    playlist performance, and advanced metrics
                  </p>
                </div>
                <Link
                  to="/admin/listening-analytics"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                >
                  View Full Analytics
                  <FiArrowLeft className="ml-2 rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default InsightsPage;
