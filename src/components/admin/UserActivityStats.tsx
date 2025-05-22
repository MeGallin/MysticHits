import React, { useState, useEffect, useRef } from 'react';
import { Users, AlertTriangle, Clock, AlertCircle } from 'lucide-react';
import statsService, { DAUStats } from '@/services/statsService';

const UserActivityStats: React.FC = () => {
  const [stats, setStats] = useState<DAUStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const refreshTimeoutRef = useRef<number | null>(null);

  const fetchUserStats = async (forceFresh = false) => {
    try {
      setLoading(true);
      const response = await statsService.fetchDAU(forceFresh);

      if (response.success && response.data) {
        setStats(response.data);
        setError(null);

        // Note if the data is from the rate limit handler
        setIsRateLimited(response.isRateLimited || false);
      } else {
        setError(response.error || 'Failed to fetch user activity stats');
        setIsRateLimited(response.isRateLimited || false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();

    // Instead of a fixed interval, we'll use an exponential backoff for retries
    // when rate limited, or a normal refresh when not rate limited
    const scheduleNextRefresh = () => {
      // Clear any existing timeout
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
      }

      // Set the refresh timeout based on rate limiting status
      const refreshTime = isRateLimited
        ? 5 * 60 * 1000 // 5 minutes if rate limited
        : 2 * 60 * 1000; // 2 minutes normally

      refreshTimeoutRef.current = window.setTimeout(() => {
        fetchUserStats();
        scheduleNextRefresh();
      }, refreshTime);
    };

    scheduleNextRefresh();

    // Cleanup
    return () => {
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [isRateLimited]); // Re-run when rate limiting status changes

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Users className="mr-2" /> User Activity
          </h2>
        </div>
        {loading && (
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        )}
      </div>

      {isRateLimited && (
        <div className="mt-2 text-amber-400 text-xs flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          Using cached/sample data (API rate limit)
        </div>
      )}

      {error ? (
        <div className="mt-4 text-red-400 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {error}
        </div>
      ) : !stats ? (
        <div className="mt-4 text-gray-400">Loading user activity data...</div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">
                Daily Active Users
              </div>
              <div className="text-3xl font-bold text-white">{stats.dau}</div>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">
                Weekly Active Users
              </div>
              <div className="text-3xl font-bold text-white">{stats.wau}</div>
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div className="text-gray-400 text-sm">Retention</div>
              <div className="text-white text-sm font-medium">
                {Math.round((stats.dau / stats.wau) * 100)}%
              </div>
            </div>
            <div className="w-full bg-gray-600 h-2 rounded-full mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((stats.dau / stats.wau) * 100),
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="text-xs text-gray-400 flex items-center justify-end mt-2">
            <Clock className="h-3 w-3 mr-1" />
            Last updated: {new Date(stats.updated).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActivityStats;
