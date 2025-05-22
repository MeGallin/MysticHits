import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, BarChart2, Clock, Cpu } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// API base URL from environment variables or fallback to localhost
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

export default function ApiMetricsCard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_BASE_URL}/health/metrics`,
        getAuthHeaders(),
      );
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch API metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Helper to determine color based on latency
  const getLatencyColorClass = (latency) => {
    if (latency < 100) return 'bg-green-500';
    if (latency < 300) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Helper to determine color based on error rate
  const getErrorColorClass = (rate) => {
    if (rate < 0.1) return 'text-green-500';
    if (rate < 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          API Performance
        </h3>
        {loading && (
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        )}
      </div>

      {error ? (
        <div className="text-red-500 font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      ) : !metrics ? (
        <div className="text-gray-500">Loading API metrics...</div>
      ) : (
        <div className="space-y-4">
          {/* Average Latency */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Average Latency:</span>
              <span className="font-medium">{metrics.apiLatency.avg}ms</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
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
              <span className="text-gray-500">P95 Latency:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="font-medium">
                    {metrics.apiLatency.p95}ms
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>95th percentile request latency</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
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

          {/* Error Rate */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Error Rate:
            </span>
            <span
              className={`font-medium ${getErrorColorClass(metrics.errorRate)}`}
            >
              {(metrics.errorRate * 100).toFixed(2)}%
            </span>
          </div>

          {/* Requests Per Minute */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5" />
              Requests/Min:
            </span>
            <span className="font-medium">{metrics.requestsPerMinute}</span>
          </div>

          {/* Database Queries (if available) */}
          {metrics.dbQueries && (
            <div className="pt-2 border-t border-gray-200 mt-2">
              <h4 className="text-sm font-medium mb-2">Database</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Avg Query Latency:</div>
                <div className="text-right">
                  {metrics.dbQueries.avgLatency}ms
                </div>
                <div className="text-gray-500">Active Connections:</div>
                <div className="text-right">
                  {metrics.dbQueries.active}/{metrics.dbQueries.connections}
                </div>
                <div className="text-gray-500">Queries/Min:</div>
                <div className="text-right">
                  {metrics.dbQueries.queriesPerMin}
                </div>
              </div>
            </div>
          )}

          {/* Cache Stats (if available) */}
          {metrics.cache && (
            <div className="pt-2 border-t border-gray-200 mt-2">
              <h4 className="text-sm font-medium mb-2">Cache</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Hit Rate:</div>
                <div className="text-right">
                  {(metrics.cache.hitRate * 100).toFixed(1)}%
                </div>
                <div className="text-gray-500">Miss Rate:</div>
                <div className="text-right">
                  {(metrics.cache.missRate * 100).toFixed(1)}%
                </div>
                <div className="text-gray-500">Evictions:</div>
                <div className="text-right">{metrics.cache.evictions}</div>
                <div className="text-gray-500">Cache Size:</div>
                <div className="text-right">{metrics.cache.size}</div>
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}
