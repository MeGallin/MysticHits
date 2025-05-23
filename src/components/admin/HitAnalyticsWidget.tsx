import React, { useState, useEffect } from 'react';
import { FiEye, FiUsers, FiGlobe, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { AlertCircle, Clock } from 'lucide-react';
import services, { HitAnalytics } from '../../services/fetchServices';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface HitAnalyticsWidgetProps {
  days?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const HitAnalyticsWidget: React.FC<HitAnalyticsWidgetProps> = ({
  days = 30,
  autoRefresh = false,
  refreshInterval = 300000, // 5 minutes
}) => {
  const [analytics, setAnalytics] = useState<HitAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const { toast } = useToast();

  const fetchAnalytics = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await services.adminServices.getHitAnalytics(days);

      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError(response.error || 'Failed to fetch hit analytics');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (
      !window.confirm(
        'Are you sure you want to clear all hit data? This action cannot be undone.',
      )
    ) {
      return;
    }

    try {
      setClearing(true);
      const response = await services.adminServices.clearHitData();

      if (response.success) {
        toast({
          title: 'Success',
          description: `Cleared ${
            response.data?.recordsDeleted || 0
          } hit records`,
        });
        // Refresh analytics after clearing
        await fetchAnalytics(false);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to clear hit data',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while clearing data',
        variant: 'destructive',
      });
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAnalytics(false);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [days, autoRefresh, refreshInterval]);

  if (loading && !analytics) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent mr-2"></div>
          <span className="text-gray-300">Loading hit analytics...</span>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-center h-32 text-center">
          <div>
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-400 mb-2">{error}</p>
            <Button
              onClick={() => fetchAnalytics()}
              variant="outline"
              size="sm"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Safely access analytics data with fallbacks
  const summary = analytics?.summary || {
    totalHits: 0,
    uniquePages: 0,
    uniqueVisitors: 0,
    totalRecords: 0,
  };

  const period = analytics?.period || {
    days: days,
    from: new Date().toISOString(),
    to: new Date().toISOString(),
  };

  const dailyStats = analytics?.dailyStats || [];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <FiEye className="mr-2" /> Hit Analytics
          {loading && (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent ml-2"></div>
          )}
        </h2>
        <div className="flex space-x-2">
          <Button
            onClick={() => fetchAnalytics()}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center"
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleClearData}
            variant="outline"
            size="sm"
            disabled={clearing || loading}
            className="flex items-center text-red-400 hover:text-red-300"
          >
            <FiTrash2 className="mr-2" />
            {clearing ? 'Clearing...' : 'Clear Data'}
          </Button>
        </div>
      </div>

      {analytics && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Total Hits</p>
                  <p className="text-2xl font-bold text-white">
                    {summary.totalHits.toLocaleString()}
                  </p>
                </div>
                <FiEye className="h-8 w-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm">Unique Visitors</p>
                  <p className="text-2xl font-bold text-white">
                    {summary.uniqueVisitors.toLocaleString()}
                  </p>
                </div>
                <FiUsers className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Unique Pages</p>
                  <p className="text-2xl font-bold text-white">
                    {summary.uniquePages.toLocaleString()}
                  </p>
                </div>
                <FiGlobe className="h-8 w-8 text-purple-400" />
              </div>
            </div>

            <div className="bg-amber-500/20 rounded-lg p-4 border border-amber-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-200 text-sm">Avg. per Day</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(
                      summary.totalHits / period.days,
                    ).toLocaleString()}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-amber-400" />
              </div>
            </div>
          </div>

          {/* Top Pages Table */}
          <div className="bg-gray-700/30 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-600">
              <h3 className="text-lg font-medium text-white">
                Recent Daily Stats
              </h3>
              <p className="text-sm text-gray-400">
                Last {period.days} days •{' '}
                {new Date(period.from).toLocaleDateString()} -{' '}
                {new Date(period.to).toLocaleDateString()}
              </p>
            </div>

            <div className="overflow-x-auto max-h-64">
              <table className="min-w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Page
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Hits
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Visitors
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {dailyStats.slice(0, 10).map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-700/30">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {new Date(stat.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {stat.page === '/' ? 'Home' : stat.page}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-white font-medium">
                        {stat.totalHits.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {stat.uniqueVisitors.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {dailyStats.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-gray-400"
                      >
                        No hit data available for the selected period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HitAnalyticsWidget;
