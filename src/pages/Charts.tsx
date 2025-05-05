import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import ChartsList, { ChartsData } from '../components/ChartsList';
import chartsService from '../services/chartsService';

const ChartsPage: React.FC = () => {
  const [chartsData, setChartsData] = useState<ChartsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [storefront, setStorefront] = useState<string>('us');
  const [refreshTime, setRefreshTime] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Function to fetch charts data from API
  const fetchChartsData = async (sf: string = storefront) => {
    setLoading(true);
    setError(null);

    try {
      const response = await chartsService.getCharts(sf);

      if (response.success && response.data) {
        setChartsData(response.data);
        setRefreshTime(new Date());
      } else {
        setError(response.error || 'Failed to load charts data');
      }
    } catch (err) {
      setError('An error occurred while fetching charts data');
      console.error('Charts fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchChartsData();

    // Set up auto-refresh every 60 seconds
    const interval = setInterval(() => {
      setIsRefreshing(true);

      chartsService
        .getCharts(storefront)
        .then((response) => {
          if (response.success && response.data) {
            setChartsData(response.data);
            setRefreshTime(new Date());
          }
        })
        .catch((err) => {
          console.error('Auto-refresh error:', err);
        })
        .finally(() => {
          setIsRefreshing(false);
        });
    }, 60000); // 60 seconds

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [storefront]);

  // Handle storefront change
  const handleStorefrontChange = (newStorefront: string) => {
    if (newStorefront !== storefront) {
      setStorefront(newStorefront);
      fetchChartsData(newStorefront);
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    if (!loading) {
      fetchChartsData();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
          <span className="px-4 py-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full">
            The most popular songs on Apple Music right now
          </span>
        </p>

        <div className="flex items-center justify-center mt-4">
          {refreshTime && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mr-3">
              Updated: {refreshTime.toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw
              className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <ChartsList
          data={chartsData}
          loading={loading}
          error={error}
          storefront={storefront}
          onStorefrontChange={handleStorefrontChange}
        />
      </div>
    </div>
  );
};

export default ChartsPage;
