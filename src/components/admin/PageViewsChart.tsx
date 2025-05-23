import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import services, { HitAnalytics } from '../../services/fetchServices';

interface PageViewsChartProps {
  days?: number;
  height?: number;
}

const PageViewsChart: React.FC<PageViewsChartProps> = ({
  days = 30,
  height = 300,
}) => {
  const [analytics, setAnalytics] = useState<HitAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await services.adminServices.getHitAnalytics(days);

      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError(response.error || 'Failed to fetch page view data');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error fetching page views:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="flex items-center space-x-2 text-gray-400">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading chart data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center text-red-400">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="mb-2">{error}</p>
          <button
            onClick={fetchData}
            className="text-blue-400 hover:underline text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.dailyStats.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center text-gray-400">
          <p className="mb-2">No page view data available</p>
          <p className="text-sm">Data will appear as users visit the site</p>
        </div>
      </div>
    );
  }

  // Group daily stats by date for chart display
  const chartData = analytics.dailyStats.reduce((acc, stat) => {
    const date = stat.date;
    if (!acc[date]) {
      acc[date] = { date, totalHits: 0, uniqueVisitors: 0 };
    }
    acc[date].totalHits += stat.totalHits;
    acc[date].uniqueVisitors += stat.uniqueVisitors;
    return acc;
  }, {} as Record<string, { date: string; totalHits: number; uniqueVisitors: number }>);

  const sortedData = Object.values(chartData).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  // Simple SVG chart implementation
  const maxHits = Math.max(...sortedData.map((d) => d.totalHits), 1);
  const maxVisitors = Math.max(...sortedData.map((d) => d.uniqueVisitors), 1);
  const chartHeight = height - 60; // Leave space for labels
  const chartWidth = 600;
  const pointSpacing = chartWidth / Math.max(sortedData.length - 1, 1);

  return (
    <div className="w-full" style={{ height }}>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span className="text-gray-300">Total Hits</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span className="text-gray-300">Unique Visitors</span>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {analytics.period.days} days •{' '}
          {analytics.summary.totalHits.toLocaleString()} total hits
        </div>
      </div>

      <div className="bg-gray-700/30 rounded-lg p-4 overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="w-full">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              y1={chartHeight * ratio}
              x2={chartWidth}
              y2={chartHeight * ratio}
              stroke="#374151"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}

          {/* Hit line */}
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            points={sortedData
              .map(
                (d, i) =>
                  `${i * pointSpacing},${
                    chartHeight - (d.totalHits / maxHits) * chartHeight
                  }`,
              )
              .join(' ')}
          />

          {/* Visitor line */}
          <polyline
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
            points={sortedData
              .map(
                (d, i) =>
                  `${i * pointSpacing},${
                    chartHeight - (d.uniqueVisitors / maxVisitors) * chartHeight
                  }`,
              )
              .join(' ')}
          />

          {/* Data points */}
          {sortedData.map((d, i) => (
            <g key={d.date}>
              <circle
                cx={i * pointSpacing}
                cy={chartHeight - (d.totalHits / maxHits) * chartHeight}
                r="3"
                fill="#3B82F6"
              />
              <circle
                cx={i * pointSpacing}
                cy={
                  chartHeight - (d.uniqueVisitors / maxVisitors) * chartHeight
                }
                r="3"
                fill="#10B981"
              />
            </g>
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          {sortedData.map((d, i) => (
            <span
              key={d.date}
              className={i % 3 === 0 ? '' : 'hidden sm:inline'}
            >
              {new Date(d.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageViewsChart;
