import React, { useState, useEffect } from 'react';
import { BarChart2, Clock } from 'lucide-react';
import healthService from '@/services/healthService';
import { ApiMetrics } from '@/services/healthService';

const ApiLatencyWidget: React.FC = () => {
  const [metrics, setMetrics] = useState<ApiMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await healthService.fetchApiMetrics();

        if (response.success && response.data) {
          setMetrics(response.data);
          setError(null);
        } else {
          setError(response.error || 'Failed to fetch API metrics');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchMetrics, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to determine color based on latency
  const getLatencyColorClass = (latency: number) => {
    if (latency < 100) return 'bg-green-500';
    if (latency < 300) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Helper to determine color based on error rate
  const getErrorColorClass = (rate: number) => {
    if (rate < 0.1) return 'text-green-500';
    if (rate < 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <BarChart2 className="mr-2" /> API Performance
        </h2>
        {loading && (
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        )}
      </div>

      {error ? (
        <div className="mt-4 text-red-400">{error}</div>
      ) : !metrics ? (
        <div className="mt-4 text-gray-400">Loading API metrics...</div>
      ) : (
        <div className="space-y-6 mt-4">
          {/* Average Latency */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Average Latency:</span>
              <span className="font-medium text-white">
                {metrics.apiLatency.avg}ms
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${getLatencyColorClass(
                  metrics.apiLatency.avg,
                )}`}
                style={{
                  width: `${Math.min(100, metrics.apiLatency.avg / 5)}%`,
                }}
              ></div>
            </div>
          </div>

          {/* P95 Latency */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">P95 Latency:</span>
              <span className="font-medium text-white">
                {metrics.apiLatency.p95}ms
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${getLatencyColorClass(
                  metrics.apiLatency.p95,
                )}`}
                style={{
                  width: `${Math.min(100, metrics.apiLatency.p95 / 10)}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="text-sm text-gray-400">Error Rate</div>
              <div
                className={`text-lg font-bold ${getErrorColorClass(
                  metrics.errorRate,
                )}`}
              >
                {(metrics.errorRate * 100).toFixed(2)}%
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="text-sm text-gray-400">Requests/Min</div>
              <div className="text-lg font-bold text-white">
                {metrics.requestsPerMinute}
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-gray-400 flex items-center justify-end mt-2">
            <Clock className="h-3 w-3 mr-1" />
            Last updated: {new Date(metrics.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiLatencyWidget;
