import React from 'react'; // Removed useState, useEffect, useRef
import { Users, AlertTriangle, Clock, AlertCircle } from 'lucide-react';
import { DAUStats } from '@/services/statsService'; // Removed statsService import

interface UserActivityStatsProps {
  stats: DAUStats | null;
  loading: boolean;
  error: string | null;
  isRateLimited: boolean;
}

const UserActivityStats: React.FC<UserActivityStatsProps> = ({
  stats,
  loading,
  error,
  isRateLimited,
}) => {
  // Removed internal state and fetchUserStats logic
  // Removed useEffect for polling

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

      {isRateLimited &&
        !error && ( // Added !error to not show if there's a more critical error
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
