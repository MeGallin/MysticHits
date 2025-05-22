import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Clock, Database, Server } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { checkAndFixToken } from '@/utils/tokenFixer';

// API base URL from environment variables or fallback to localhost
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Get authentication headers with token fix attempt
const getAuthHeaders = () => {
  // Check and fix token format if needed
  checkAndFixToken();

  // Get the (potentially fixed) token
  const token = localStorage.getItem('token');

  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

export default function HealthCard() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(false);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_BASE_URL}/health`,
        getAuthHeaders(),
      );
      setHealth(data);
      setError(null);
      setAuthError(false);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setAuthError(true);
        setError('Authentication required. Please log in.');
      } else {
        setAuthError(false);
        setError('Failed to fetch system health');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Format uptime to human-readable format
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Server className="h-5 w-5" />
          System Health
        </h3>
        {loading && (
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        )}
      </div>

      {error ? (
        <div
          className={`${
            authError ? 'text-yellow-600' : 'text-red-500'
          } font-medium flex items-center gap-2`}
        >
          <AlertCircle className="h-4 w-4" />
          {error}
          {authError && (
            <button
              onClick={() => (window.location.href = '/login')}
              className="ml-2 text-blue-500 underline text-sm"
            >
              Login
            </button>
          )}
        </div>
      ) : !health ? (
        <div className="text-gray-500">Loading system status...</div>
      ) : (
        <div className="space-y-3">
          {/* Status */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Status:</span>
            <div
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                health.status === 'ok'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {health.status === 'ok' ? 'OPERATIONAL' : 'DOWN'}
            </div>
          </div>

          {/* Uptime */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Uptime:
            </span>
            <span className="font-medium">
              {formatUptime(health.uptimeSec)}
            </span>
          </div>

          {/* Memory (RSS) */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Memory (RSS):</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="font-medium">
                  {health.memoryMB} MB
                </TooltipTrigger>
                <TooltipContent>
                  <p>Resident Set Size - Memory allocated to Node.js process</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* System Memory (if available) */}
          {health.systemMemory && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">System Memory:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="font-medium">
                    {health.systemMemory.used} / {health.systemMemory.total} GB
                    ({health.systemMemory.usagePercent}%)
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total system memory usage</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* CPU Load (if available) */}
          {health.cpu && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">CPU Load (1m):</span>
              <span className="font-medium">{health.cpu.loadAvg['1min']}</span>
            </div>
          )}

          {/* Database */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Database className="h-3.5 w-3.5" />
              Database:
            </span>
            <div className="flex items-center gap-2">
              <div
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  health.db.connected
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {health.db.connected ? 'CONNECTED' : 'OFFLINE'}
              </div>
              {health.db.connected && health.db.latencyMs && (
                <span className="text-xs text-gray-500">
                  {health.db.latencyMs}ms
                </span>
              )}
            </div>
          </div>

          {/* Last updated */}
          <div className="text-xs text-gray-500 mt-4">
            Last updated: {new Date(health.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}
