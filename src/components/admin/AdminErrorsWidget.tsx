import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { getErrorLogs } from '../../services/fetchServices';

interface ErrorData {
  _id: string;
  route: string;
  status: number;
  msg: string;
  method: string;
  at: string;
}

const AdminErrorsWidget: React.FC = () => {
  const [errors, setErrors] = useState<ErrorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchErrors = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getErrorLogs(1, 10);

      if (response.success && response.data) {
        setErrors(response.data);
        setLastUpdated(new Date());
      } else {
        setError(response.error || 'Failed to load error logs');
      }
    } catch (err) {
      console.error('Failed to fetch error logs:', err);
      setError('Failed to load error logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();

    // Set up auto-refresh every 2 minutes
    const intervalId = setInterval(fetchErrors, 2 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Function to format date strings
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Function to get status color
  const getStatusColor = (status: number) => {
    if (status >= 500) return 'text-red-400';
    if (status >= 400) return 'text-amber-400';
    return 'text-green-400';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <FiAlertCircle className="mr-2 text-red-400" size={24} />
          <h2 className="text-xl font-semibold text-white">Recent Errors</h2>
        </div>
        <button
          onClick={fetchErrors}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50 transition-colors"
          aria-label="Refresh errors"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 text-red-200 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700/20 rounded-lg">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Time
              </th>
              <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Route
              </th>
              <th className="py-2 px-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Message
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center text-gray-400">
                  Loading error logs...
                </td>
              </tr>
            ) : errors.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center text-gray-400">
                  No errors in the last hour
                </td>
              </tr>
            ) : (
              errors.map((err) => (
                <tr key={err._id}>
                  <td className="py-2 px-4 text-sm text-gray-400">
                    {formatDate(err.at)}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-300">
                    <div className="flex items-center">
                      <span className="bg-gray-700 text-gray-300 px-1 rounded text-xs mr-2">
                        {err.method}
                      </span>
                      <span className="truncate max-w-[150px]">
                        {err.route}
                      </span>
                    </div>
                  </td>
                  <td
                    className={`py-2 px-4 text-sm text-center font-medium ${getStatusColor(
                      err.status,
                    )}`}
                  >
                    {err.status}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-300 truncate max-w-[250px]">
                    {err.msg}
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

export default AdminErrorsWidget;
