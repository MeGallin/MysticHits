import { ChartsData } from '../components/ChartsList';

// Base URL for API requests - using Vite's environment variable approach
const API_URL = import.meta.env.VITE_API_URL || '';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const chartsService = {
  /**
   * Get Apple Music 'Most-Played' charts for a specific storefront
   * @param storefront - Two letter country code (e.g., 'us', 'gb')
   * @returns Promise with charts data
   */
  getCharts: async (
    storefront: string = 'us',
  ): Promise<ApiResponse<ChartsData>> => {
    try {
      const response = await fetch(
        `${API_URL}/charts/${storefront.toLowerCase()}`,
      );

      if (!response.ok) {
        // Handle HTTP errors
        if (response.status === 404) {
          return {
            success: false,
            error: `Charts for storefront "${storefront}" not found`,
          };
        }
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error fetching charts:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  },
};

export default chartsService;
