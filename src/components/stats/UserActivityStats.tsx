import React, { useState, useEffect } from 'react';
import { FiUsers, FiUserCheck, FiRefreshCw } from 'react-icons/fi';
import KpiCard from './KpiCard';
import statsService, { DAUStats } from '@/services/statsService';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

/**
 * UserActivityStats component displays Daily and Weekly Active Users metrics
 * Fetches data from the stats service and displays it in KPI cards
 */
const UserActivityStats: React.FC = () => {
  const [stats, setStats] = useState<DAUStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchUserStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await statsService.fetchDAU();

      if (response.success && response.data) {
        setStats(response.data);
        setLastUpdated(new Date());
      } else {
        setError(response.error || 'Failed to fetch user activity stats');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const response = await statsService.fetchDAU();

      if (response.success && response.data) {
        setStats(response.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(response.error || 'Failed to refresh stats');
      }
    } catch (err) {
      setError('An error occurred during refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUserStats();

    // Auto-refresh every 10 minutes
    const intervalId = setInterval(() => {
      handleRefresh();
    }, 10 * 60 * 1000); // 10 minutes in milliseconds

    return () => clearInterval(intervalId);
  }, []);

  // Format the "updated" timestamp to be user-friendly
  const formatUpdateTime = () => {
    if (!lastUpdated) return '';
    return `Updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}`;
  };

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg mb-6">
        <p className="text-red-700 dark:text-red-300 mb-2">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUserStats}
          className="text-xs bg-white dark:bg-gray-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/50"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          User Activity
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className="flex items-center gap-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
        >
          <FiRefreshCw
            className={isRefreshing ? 'animate-spin' : ''}
            size={14}
          />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard
          label="Daily Active Users"
          value={stats?.dau ?? 0}
          icon={<FiUserCheck className="text-blue-600" />}
          tooltip="Unique users active in the last 24 hours"
          loading={loading}
          footer={formatUpdateTime()}
          className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800 shadow-sm"
        />

        <KpiCard
          label="Weekly Active Users"
          value={stats?.wau ?? 0}
          icon={<FiUsers className="text-purple-600" />}
          tooltip="Unique users active in the last 7 days"
          loading={loading}
          footer={formatUpdateTime()}
          className="bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-800 shadow-sm"
        />
      </div>
    </div>
  );
};

export default UserActivityStats;
