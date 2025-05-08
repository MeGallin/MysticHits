import React, { useState, useEffect } from 'react';
import { FiActivity, FiRefreshCw } from 'react-icons/fi';
import { getApiMetrics } from '../../services/fetchServices';

interface MetricsData {
  requestCount: number;
  averageLatency: string;
  routes: {
    route: string;
    requestCount: number;
    averageLatency: string;
  }[];
}

const ApiLatencyWidget: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getApiMetrics();

      if (response.success && response.data) {
        setMetrics(response.data);
        setLastUpdated(new Date());
      } else {
        setError(response.error || 'Failed to load API metrics');
      }
    } catch (err) {
      console.error('Failed to fetch API metrics:', err);
      setError('Failed to load API metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Set up auto-refresh every 5 minutes
    const intervalId = setInterval(fetchMetrics, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <FiActivity className="mr-2 text-blue-400" size={24} />
          <h2 className="text-xl font-semibold text-white">API Performance</h2>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50 transition-colors"
          aria-label="Refresh metrics"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 text-red-200 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700/30 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">
            Average Latency (15m)
          </div>
          <div className="text-3xl font-bold text-white">
            {loading ? '...' : metrics?.averageLatency || 'N/A'}{' '}
            <span className="text-gray-400 text-lg">ms</span>
          </div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Requests</div>
          <div className="text-3xl font-bold text-white">
            {loading ? '...' : metrics?.requestCount.toLocaleString() || 'N/A'}
          </div>
        </div>
      </div>

      <h3 className="text-lg font-medium text-white mb-2">Route Performance</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700/20 rounded-lg">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Route
              </th>
              <th className="py-2 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Requests
              </th>
              <th className="py-2 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Avg. Latency
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={3} className="py-4 px-4 text-center text-gray-400">
                  Loading metrics...
                </td>
              </tr>
            ) : !metrics || metrics.routes.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 px-4 text-center text-gray-400">
                  No route data available
                </td>
              </tr>
            ) : (
              metrics.routes.slice(0, 5).map((route, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 text-sm text-gray-300 truncate max-w-[200px]">
                    {route.route}
                  </td>
                  <td className="py-2 px-4 text-right text-sm text-gray-300">
                    {route.requestCount}
                  </td>
                  <td className="py-2 px-4 text-right text-sm text-gray-300">
                    {route.averageLatency} ms
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {lastUpdated && (
        <div className="text-xs text-gray-400 mt-4 text-right">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default ApiLatencyWidget;
