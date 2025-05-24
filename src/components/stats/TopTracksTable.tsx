import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FiMusic, FiRefreshCw, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import statsService, { TopTrack } from '@/services/statsService';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * TopTracksTable component displays the most played tracks in a table format
 * Allows filtering by time period and includes sorting functionality
 */
const TopTracksTable: React.FC = () => {
  const [tracks, setTracks] = useState<TopTrack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filtering state
  const [days, setDays] = useState<number>(7);
  const [limit, setLimit] = useState<number>(10);

  // Sorting state
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetches top tracks from the API
  const fetchTopTracks = async () => {
    setLoading(true);
    setError(null);

    try {
      // Force fresh data to bypass any caching issues
      const response = await statsService.fetchTopTracks(days, limit, true);

      if (response.success && response.data) {
        setTracks(response.data);
        setLastUpdated(new Date());
      } else {
        setError(response.error || 'Failed to fetch top tracks data');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
      console.error('Top tracks fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle cache clear and refresh
  const handleClearCacheAndRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      // Clear the cache first
      statsService.clearCache();

      // Force fresh data fetch
      const response = await statsService.fetchTopTracks(days, limit, true);

      if (response.success && response.data) {
        setTracks(response.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(response.error || 'Failed to refresh data');
      }
    } catch (err) {
      setError('An error occurred during refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      // Force fresh data to bypass any caching issues
      const response = await statsService.fetchTopTracks(days, limit, true);

      if (response.success && response.data) {
        setTracks(response.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(response.error || 'Failed to refresh data');
      }
    } catch (err) {
      setError('An error occurred during refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial data fetch and when filtering changes
  useEffect(() => {
    fetchTopTracks();

    // Auto-refresh every 30 minutes
    const intervalId = setInterval(() => {
      handleRefresh();
    }, 30 * 60 * 1000); // 30 minutes in milliseconds

    return () => clearInterval(intervalId);
  }, [days, limit]);

  // Format the "updated" timestamp to be user-friendly
  const formatUpdateTime = () => {
    if (!lastUpdated) return '';
    return `Updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}`;
  };

  // Handle sorting
  const handleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);

    // Sort the tracks by play count
    const sortedTracks = [...tracks].sort((a, b) => {
      return newOrder === 'asc' ? a.count - b.count : b.count - a.count;
    });

    setTracks(sortedTracks);
  };

  // Format the full title for display
  const getFormattedTitle = (title: string) => {
    // Return the full title without any truncation
    if (!title) return '';
    return title;
  };

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg mb-6">
        <p className="text-red-700 dark:text-red-300 mb-2">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTopTracks}
          className="text-xs bg-white dark:bg-gray-800 text-red-700 dark:text-red-300"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <FiMusic className="mr-2 text-purple-600" /> Top Tracks
        </h2>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Period:
            </span>
            <Select
              value={days.toString()}
              onValueChange={(value) => setDays(Number(value))}
            >
              <SelectTrigger className="w-[100px] h-8 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <SelectItem value="1">Last day</SelectItem>
                <SelectItem value="7">Last week</SelectItem>
                <SelectItem value="14">Last 2 weeks</SelectItem>
                <SelectItem value="30">Last month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show:
            </span>
            <Select
              value={limit.toString()}
              onValueChange={(value) => setLimit(Number(value))}
            >
              <SelectTrigger className="w-[80px] h-8 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="flex items-center gap-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
          >
            <FiRefreshCw
              className={isRefreshing ? 'animate-spin' : ''}
              size={14}
            />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCacheAndRefresh}
            disabled={isRefreshing || loading}
            className="flex items-center gap-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
          >
            <FiRefreshCw
              className={isRefreshing ? 'animate-spin' : ''}
              size={14}
            />
            Clear Cache & Refresh
          </Button>
        </div>
      </div>

      {lastUpdated && (
        <p className="text-xs text-gray-600 dark:text-gray-300">
          {formatUpdateTime()}
        </p>
      )}

      {loading ? (
        <div className="w-full h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      ) : tracks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <FiMusic className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-gray-700 dark:text-gray-200 text-lg font-medium mb-2">
            No track data available
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            There are no play events in the selected time period.
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
              <TableRow>
                <TableHead className="w-12 text-center text-gray-700 dark:text-gray-300">
                  #
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300 min-w-0">
                  Title
                </TableHead>
                <TableHead
                  className="w-32 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300"
                  onClick={handleSort}
                >
                  <div className="flex items-center gap-1">
                    Plays
                    {sortOrder === 'asc' ? (
                      <FiArrowUp size={14} />
                    ) : (
                      <FiArrowDown size={14} />
                    )}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracks.map((track, index) => (
                <TableRow
                  key={`${track.trackUrl}-${index}`}
                  className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                >
                  <TableCell className="font-medium text-center text-gray-700 dark:text-gray-300 align-top">
                    {index + 1}
                  </TableCell>
                  <TableCell
                    className="text-gray-900 dark:text-gray-100 py-3"
                    style={{
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                      maxWidth: 'none',
                      overflow: 'visible',
                      textOverflow: 'unset',
                    }}
                    title={track.title}
                  >
                    <div
                      style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}
                    >
                      {getFormattedTitle(track.title)}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 align-top">
                    {track.count}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TopTracksTable;
