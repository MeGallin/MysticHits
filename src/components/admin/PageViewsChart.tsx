import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { DailyPageViewData } from '@/services/statsService';

interface PageViewsChartProps {
  data: DailyPageViewData[] | null;
  loading?: boolean;
  error?: string | null;
  isRateLimited?: boolean;
  period?: string;
}

const PageViewsChart: React.FC<PageViewsChartProps> = ({
  data,
  loading = false,
  error = null,
  isRateLimited = false,
  period = '30 days',
}) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [chartInitialized, setChartInitialized] = useState(false);

  // Add debug logging to trace the data flow
  useEffect(() => {
    console.log('PageViewsChart: Component mounted or updated');
    console.log('Data received in chart:', data);
    console.log('Chart ref exists:', !!chartRef.current);

    if (!data || !chartRef.current) {
      console.log('Missing data or chart ref');
      return;
    }

    try {
      // Process dates and values for the chart
      const dates = data.map((item) => {
        // Format date for display (e.g., "Apr 15")
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      });

      const viewsData = data.map((item) => item.views);
      const visitorsData = data.map((item) => item.visitors);

      console.log('Processed chart data:');
      console.log('Dates:', dates);
      console.log('Views:', viewsData);
      console.log('Visitors:', visitorsData);

      // Create or update the chart
      if (chartInstance.current) {
        console.log('Updating existing chart');
        chartInstance.current.data.labels = dates;
        chartInstance.current.data.datasets[0].data = viewsData;
        chartInstance.current.data.datasets[1].data = visitorsData;
        chartInstance.current.update();
      } else {
        console.log('Creating new chart');
        const ctx = chartRef.current.getContext('2d');

        if (!ctx) {
          console.error('Could not get 2d context from canvas');
          return;
        }

        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: dates,
            datasets: [
              {
                label: 'Page Views',
                data: viewsData,
                borderColor: 'rgba(59, 130, 246, 0.8)',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
              },
              {
                label: 'Unique Visitors',
                data: visitorsData,
                borderColor: 'rgba(16, 185, 129, 0.8)',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: 'rgba(255, 255, 255, 0.8)',
                },
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                borderColor: 'rgba(75, 85, 99, 0.8)',
                borderWidth: 1,
              },
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(75, 85, 99, 0.2)',
                },
                ticks: {
                  color: 'rgba(209, 213, 219, 0.8)',
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(75, 85, 99, 0.2)',
                },
                ticks: {
                  color: 'rgba(209, 213, 219, 0.8)',
                },
              },
            },
            interaction: {
              mode: 'nearest',
              axis: 'x',
              intersect: false,
            },
          },
        });

        setChartInitialized(true);
      }
    } catch (err) {
      console.error('Error creating/updating chart:', err);
    }
  }, [data]);

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        console.log('Destroying chart instance');
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-red-400 text-center">
          <p className="text-lg mb-2">Error loading chart data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-gray-400">
          No data available for the selected period
        </p>
      </div>
    );
  }

  return (
    <div className="h-80">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default PageViewsChart;
