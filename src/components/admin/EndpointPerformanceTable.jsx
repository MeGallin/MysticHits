import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, ArrowDown, ArrowUp, Clock, Activity } from 'lucide-react';

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

export default function EndpointPerformanceTable() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('requests');
  const [sortDirection, setSortDirection] = useState('desc');

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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Helper to determine color class based on latency
  const getLatencyColorClass = (latency) => {
    if (latency < 100) return 'text-green-600';
    if (latency < 300) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Helper to determine color class based on error rate
  const getErrorColorClass = (rate) => {
    if (rate < 0.05) return 'text-green-600';
    if (rate < 0.2) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Sort endpoints based on current sort field and direction
  const sortedEndpoints = metrics?.endpoints
    ? [...metrics.endpoints].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (sortDirection === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      })
    : [];

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-3 w-3 inline" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 inline" />
    );
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Endpoint Performance
        </h3>
        {loading && (
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        )}
      </div>

      {error ? (
        <div className="text-red-500 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      ) : loading && !metrics ? (
        <div className="text-center py-4">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading endpoint data...</p>
        </div>
      ) : !metrics?.endpoints || metrics.endpoints.length === 0 ? (
        <div className="text-gray-500 text-center py-4">
          No endpoint data available
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('path')}
                  >
                    Endpoint <SortIcon field="path" />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('avgLatency')}
                  >
                    Avg Latency <SortIcon field="avgLatency" />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('p95Latency')}
                  >
                    P95 Latency <SortIcon field="p95Latency" />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('errorRate')}
                  >
                    Error Rate <SortIcon field="errorRate" />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('requests')}
                  >
                    Requests <SortIcon field="requests" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedEndpoints.map((endpoint, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {endpoint.path}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${getLatencyColorClass(
                        endpoint.avgLatency,
                      )}`}
                    >
                      {endpoint.avgLatency}ms
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${getLatencyColorClass(
                        endpoint.p95Latency,
                      )}`}
                    >
                      {endpoint.p95Latency}ms
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${getErrorColorClass(
                        endpoint.errorRate,
                      )}`}
                    >
                      {(endpoint.errorRate * 100).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {endpoint.requests}/min
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-gray-500 mt-4 text-right flex items-center gap-1 justify-end">
            <Clock className="h-3 w-3" />
            Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
          </div>
        </>
      )}
    </div>
  );
}
