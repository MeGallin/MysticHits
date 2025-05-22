import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Clock } from 'lucide-react';

interface ErrorEvent {
  id: string;
  message: string;
  stack?: string;
  timestamp: string;
  path: string;
  severity: 'error' | 'warning' | 'info';
}

// This is a placeholder component. In a real implementation,
// you would fetch error data from the API
const AdminErrorsWidget: React.FC = () => {
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Mock data for demonstration
  const mockErrors: ErrorEvent[] = [
    {
      id: 'err-001',
      message: 'API rate limit exceeded',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      path: '/api/views',
      severity: 'error',
    },
    {
      id: 'err-002',
      message: 'Database connection timeout',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      path: '/api/playlist',
      severity: 'error',
    },
    {
      id: 'err-003',
      message: 'Invalid authentication token',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      path: '/api/auth/refresh',
      severity: 'warning',
    },
  ];

  useEffect(() => {
    // Simulate API call
    const fetchErrors = () => {
      setLoading(true);
      // Simulate network delay
      setTimeout(() => {
        setErrors(mockErrors);
        setLastUpdated(new Date().toISOString());
        setLoading(false);
      }, 800);
    };

    fetchErrors();
    // Refresh every 2 minutes
    const interval = setInterval(fetchErrors, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setErrors(mockErrors);
      setLastUpdated(new Date().toISOString());
      setLoading(false);
    }, 800);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <AlertTriangle className="mr-2" /> Recent Errors
        </h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 rounded-full hover:bg-gray-700/50 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 text-gray-400 ${loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {errors.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No errors recorded in the last 24 hours.
        </div>
      ) : (
        <div className="space-y-3">
          {errors.map((error) => (
            <div key={error.id} className="bg-gray-700/30 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div
                  className={`${getSeverityColor(
                    error.severity,
                  )} h-3 w-3 rounded-full mt-1.5`}
                ></div>
                <div className="flex-1">
                  <div className="font-medium text-white">{error.message}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    Path: {error.path}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(error.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {lastUpdated && (
        <div className="text-xs text-gray-400 flex items-center justify-end mt-4">
          <Clock className="h-3 w-3 mr-1" />
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default AdminErrorsWidget;
