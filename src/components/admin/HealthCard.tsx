import React, { useState, useEffect } from 'react';
import { healthServices } from '../../services/fetchServices';
import { FiServer, FiDatabase, FiClock, FiHardDrive } from 'react-icons/fi';

interface HealthData {
  status: string;
  uptimeSec: number;
  memoryMB: number;
  db: {
    connected: boolean;
    latencyMs: number | null;
  };
  timestamp: string;
}

const HealthCard: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Format uptime into a more human-readable format
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Function to fetch health status data
  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const response = await healthServices.getHealthStatus();
      if (response.success && response.data) {
        setHealthData(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch system status');
      }
    } catch (err) {
      setError('An error occurred while fetching system status');
      console.error('Health status fetch error:', err);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  // Fetch health data on component mount and set up refresh interval
  useEffect(() => {
    fetchHealthData();

    // Refresh every 60 seconds
    const interval = setInterval(() => {
      fetchHealthData();
    }, 60000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-6 border border-red-500/30">
        <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
          <FiServer className="mr-2 text-red-400" /> System Status
        </h2>
        <p className="text-red-300">{error}</p>
        <button
          onClick={fetchHealthData}
          className="mt-3 px-4 py-1 bg-red-500/30 hover:bg-red-500/50 text-white rounded-md transition-all text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <FiServer className="mr-2 text-blue-400" /> System Status
        </h2>
        {!loading && (
          <span className="text-xs text-gray-400">
            Updated {lastRefresh.toLocaleTimeString()}
          </span>
        )}
      </div>

      {loading && !healthData ? (
        <div className="text-gray-300 animate-pulse">
          Loading system status...
        </div>
      ) : (
        <div className="space-y-3">
          {/* API Status */}
          <div className="flex justify-between items-center">
            <span className="text-gray-300 flex items-center">
              <FiServer className="mr-2 text-blue-400" /> API Status:
            </span>
            <span
              className={`${
                healthData?.status === 'ok' ? 'text-green-400' : 'text-red-400'
              } font-medium`}
            >
              {healthData?.status === 'ok' ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Uptime */}
          <div className="flex justify-between items-center">
            <span className="text-gray-300 flex items-center">
              <FiClock className="mr-2 text-purple-400" /> Uptime:
            </span>
            <span className="text-purple-400 font-medium">
              {healthData ? formatUptime(healthData.uptimeSec) : 'Unknown'}
            </span>
          </div>

          {/* Memory Usage */}
          <div className="flex justify-between items-center">
            <span className="text-gray-300 flex items-center">
              <FiHardDrive className="mr-2 text-yellow-400" /> Memory Usage:
            </span>
            <span className="text-yellow-400 font-medium">
              {healthData ? `${healthData.memoryMB} MB` : 'Unknown'}
            </span>
          </div>

          {/* Database Status */}
          <div className="flex justify-between items-center">
            <span className="text-gray-300 flex items-center">
              <FiDatabase className="mr-2 text-green-400" /> Database:
            </span>
            <div className="flex items-center">
              <span
                className={`${
                  healthData?.db.connected ? 'text-green-400' : 'text-red-400'
                } font-medium`}
              >
                {healthData?.db.connected ? 'Connected' : 'Disconnected'}
              </span>
              {healthData?.db.connected &&
                healthData?.db.latencyMs !== null && (
                  <span className="text-gray-400 text-xs ml-2">
                    ({healthData.db.latencyMs}ms)
                  </span>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Refresh button */}
      <button
        onClick={fetchHealthData}
        className="mt-4 px-4 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-md transition-all text-sm flex items-center justify-center w-full"
        disabled={loading}
      >
        {loading ? 'Updating...' : 'Refresh Status'}
      </button>
    </div>
  );
};

export default HealthCard;
