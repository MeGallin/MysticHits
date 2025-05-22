import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Clock, HardDrive, MemoryStick, Cpu } from 'lucide-react';
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

export default function SystemResourcesCard() {
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_BASE_URL}/health/system`,
        getAuthHeaders(),
      );
      if (data.success) {
        setResources(data);
        setError(null);
        setAuthError(false);
      } else {
        setError(data.message || 'Failed to fetch system resources');
        setAuthError(false);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setAuthError(true);
        setError('Authentication required. Please log in.');
      } else {
        setAuthError(false);
        setError('Failed to fetch system resources');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    const interval = setInterval(fetchResources, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Format bytes to human-readable size
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Format uptime to human-readable format
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds % 60}s`;
  };

  // Helper to determine color based on CPU load
  const getLoadColorClass = (load, cores) => {
    const normalizedLoad = load / cores;
    if (normalizedLoad < 0.7) return 'bg-green-500';
    if (normalizedLoad < 0.9) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Helper to determine color based on memory usage
  const getMemoryColorClass = (percent) => {
    const pct = parseFloat(percent);
    if (pct < 70) return 'bg-green-500';
    if (pct < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          System Resources
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
      ) : !resources ? (
        <div className="text-gray-500">Loading system resources...</div>
      ) : (
        <div className="space-y-4">
          {/* CPU Information */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Cpu className="h-4 w-4" />
              CPU
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cores:</span>
                <span className="font-medium">{resources.cpu.cores}</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Load (1m):</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="font-medium">
                        {resources.cpu.loadAvg[0]}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Average CPU load over 1 minute</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getLoadColorClass(
                      resources.cpu.loadAvg[0],
                      resources.cpu.cores,
                    )}`}
                    style={{
                      width: `${Math.min(
                        100,
                        (resources.cpu.loadAvg[0] / resources.cpu.cores) * 100,
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Load (5m/15m):</span>
                <span className="font-medium">
                  {resources.cpu.loadAvg[1]} / {resources.cpu.loadAvg[2]}
                </span>
              </div>
            </div>
          </div>

          {/* Memory Information */}
          <div className="pt-2 border-t border-gray-200">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <MemoryStick className="h-4 w-4" />
              Memory
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Process Memory (RSS):</span>
                <span className="font-medium">
                  {formatBytes(resources.memory.rss)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Heap Used/Total:</span>
                <span className="font-medium">
                  {formatBytes(resources.memory.heapUsed)} /{' '}
                  {formatBytes(resources.memory.heapTotal)}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">System Memory:</span>
                  <span className="font-medium">
                    {formatBytes(resources.memory.system.used)} /{' '}
                    {formatBytes(resources.memory.system.total)}(
                    {resources.memory.system.usagePercent}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getMemoryColorClass(
                      resources.memory.system.usagePercent,
                    )}`}
                    style={{
                      width: `${Math.min(
                        100,
                        parseFloat(resources.memory.system.usagePercent),
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* OS Information */}
          <div className="pt-2 border-t border-gray-200">
            <h4 className="text-sm font-medium mb-2">Operating System</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Platform:</div>
              <div className="text-right font-medium">
                {resources.os.platform} ({resources.os.arch})
              </div>

              <div className="text-gray-500">Release:</div>
              <div className="text-right font-medium">
                {resources.os.release}
              </div>

              <div className="text-gray-500">Hostname:</div>
              <div className="text-right font-medium">
                {resources.os.hostname}
              </div>

              <div className="text-gray-500">System Uptime:</div>
              <div className="text-right font-medium">
                {formatUptime(resources.os.uptime)}
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-gray-500 mt-2 flex items-center gap-1 justify-end">
            <Clock className="h-3 w-3" />
            Last updated: {new Date(resources.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}
