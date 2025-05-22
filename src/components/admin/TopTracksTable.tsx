import React, { useState, useEffect, useRef } from 'react';
import { Music, AlertTriangle, Clock, AlertCircle } from 'lucide-react';
import statsService, { TopTrack } from '@/services/statsService';

interface TopTracksTableProps {
  days?: number;
  limit?: number;
}

const TopTracksTable: React.FC<TopTracksTableProps> = ({
  days = 7,
  limit = 10,
}) => {
  const [tracks, setTracks] = useState<TopTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const refreshTimeoutRef = useRef<number | null>(null);

  const fetchTracks = async (forceFresh = false) => {
    try {
      setLoading(true);
      const response = await statsService.fetchTopTracks(
        days,
        limit,
        forceFresh,
      );

      if (response.success && response.data) {
        // Ensure we have valid data with all required properties
        const validTracks = response.data.filter(
          (track) =>
            track &&
            typeof track.count === 'number' &&
            typeof track.title === 'string' &&
            typeof track.trackUrl === 'string',
        );

        setTracks(validTracks);
        setLastUpdated(new Date().toISOString());
        setError(null);
        setIsRateLimited(response.isRateLimited || false);
      } else {
        setError(response.error || 'Failed to fetch top tracks');
        setTracks([]); // Reset tracks to empty array on error
        setIsRateLimited(response.isRateLimited || false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setTracks([]); // Reset tracks to empty array on error
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();

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
        : 3 * 60 * 1000; // 3 minutes normally

      refreshTimeoutRef.current = window.setTimeout(() => {
        fetchTracks();
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
  }, [days, limit, isRateLimited]);

  // Calculate the total number of plays - safely handle empty array
  const totalPlays =
    tracks.length > 0 ? tracks.reduce((sum, track) => sum + track.count, 0) : 0;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-6 pb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Music className="mr-2" /> Top Tracks (Last {days} Days)
          </h2>
          {loading && (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          )}
        </div>

        {error && (
          <div className="mt-4 text-red-400 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        {isRateLimited && (
          <div className="mt-2 text-amber-400 text-xs flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Using cached/sample data (API rate limit)
          </div>
        )}
      </div>

      {!loading && tracks.length === 0 ? (
        <div className="px-6 py-8 text-center text-gray-400">
          No track data available for the selected period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Track
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Plays
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Share
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800/30 divide-y divide-gray-700">
              {tracks.map((track, index) => {
                // Calculate percentage safely
                const percentage =
                  totalPlays > 0 ? (track.count / totalPlays) * 100 : 0;

                return (
                  <tr key={index} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="font-medium">
                        {track.title || 'Unknown Track'}
                      </div>
                      <div className="text-xs text-gray-400 truncate max-w-[300px]">
                        {track.trackUrl || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {typeof track.count === 'number'
                        ? track.count.toLocaleString()
                        : '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-600 h-2 rounded-full mr-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-300 min-w-[40px] text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {lastUpdated && (
            <div className="px-6 py-3 text-xs text-gray-400 flex items-center justify-end">
              <Clock className="h-3 w-3 mr-1" />
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TopTracksTable;
