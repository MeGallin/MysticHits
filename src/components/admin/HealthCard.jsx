import { useState, useEffect, useRef } from 'react';
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

// Add a caching mechanism to reduce API calls
const healthCache = {
  data: null,
  timestamp: 0,
  expiryTime: 2 * 60 * 1000, // 2 minutes cache validity
};

// Add a backoff timer that increases when rate-limited
let backoffTimer = 0;
const MAX_BACKOFF = 60 * 1000; // Maximum backoff of 1 minute

export default function HealthCard() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const refreshTimerRef = useRef(null);

  const fetchHealthData = async (forceFresh = false) => {
    try {
      setLoading(true);

      // Check if we have valid cached data and not forcing refresh
      const now = Date.now();
      if (
        !forceFresh &&
        healthCache.data &&
        now - healthCache.timestamp < healthCache.expiryTime
      ) {
        setHealthData(healthCache.data);
        setError(null);
        setLoading(false);
        setIsRateLimited(false);
        return;
      }

      // Add a random delay (0-100ms) to prevent synchronized requests from multiple instances
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));

      const { data } = await axios.get(
        `${API_BASE_URL}/health`,
        getAuthHeaders(),
      );

      // Cache the successful response
      healthCache.data = data;
      healthCache.timestamp = now;

      setHealthData(data);
      setError(null);
      setIsRateLimited(false);

      // Reset backoff on successful request
      backoffTimer = 0;
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');

      // Assume it might be rate limiting if the error wasn't caught properly
      backoffTimer = Math.min(MAX_BACKOFF, (backoffTimer || 1000) * 2);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();

    // Calculate refresh time based on rate limiting status
    const refreshTime = isRateLimited
      ? Math.max(5 * 60 * 1000, backoffTimer) // At least 5 minutes when rate limited
      : Math.max(30 * 1000, backoffTimer); // At least 30 seconds normally

    const intervalId = setInterval(() => {
      fetchHealthData(true);
    }, refreshTime);

    return () => {
      clearInterval(intervalId);
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [isRateLimited]); // Re-run effect when rate limit status changes

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
      ) : !healthData ? (
        <div className="text-gray-500">Loading system status...</div>
      ) : (
        <div className="space-y-3">
          {/* Status */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Status:</span>
            <div
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                healthData.status === 'ok'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {healthData.status === 'ok' ? 'OPERATIONAL' : 'DOWN'}
            </div>
          </div>

          {/* Uptime */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Uptime:
            </span>
            <span className="font-medium">
              {formatUptime(healthData.uptimeSec)}
            </span>
          </div>

          {/* Memory (RSS) */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Memory (RSS):</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="font-medium">
                  {healthData.memoryMB} MB
                </TooltipTrigger>
                <TooltipContent>
                  <p>Resident Set Size - Memory allocated to Node.js process</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* System Memory (if available) */}
          {healthData.systemMemory && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">System Memory:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="font-medium">
                    {healthData.systemMemory.used} /{' '}
                    {healthData.systemMemory.total} GB (
                    {healthData.systemMemory.usagePercent}%)
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total system memory usage</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* CPU Load (if available) */}
          {healthData.cpu && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">CPU Load (1m):</span>
              <span className="font-medium">
                {healthData.cpu.loadAvg['1min']}
              </span>
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
                  healthData.db.connected
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {healthData.db.connected ? 'CONNECTED' : 'OFFLINE'}
              </div>
              {healthData.db.connected && healthData.db.latencyMs && (
                <span className="text-xs text-gray-500">
                  {healthData.db.latencyMs}ms
                </span>
              )}
            </div>
          </div>

          {/* Last updated */}
          <div className="text-xs text-gray-500 mt-4">
            Last updated: {new Date(healthData.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}
