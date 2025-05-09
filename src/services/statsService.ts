import axios from 'axios';
import { checkAndFixToken } from '@/utils/tokenFixer';

// Types
export interface DAUStats {
  dau: number;
  wau: number;
  updated: string;
}

export interface TopTrack {
  trackUrl: string;
  title: string;
  count: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

// API base URL from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Get authentication headers
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

// Handle API errors
const handleApiError = (error: any): ApiResponse => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return {
      success: false,
      error:
        error.response.data?.error ||
        error.response.data?.message ||
        'An error occurred',
      status: error.response.status,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      success: false,
      error: 'No response from server',
      status: 0,
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      success: false,
      error: error.message || 'Unknown error',
      status: 0,
    };
  }
};

/**
 * Service for fetching user activity statistics and top tracks
 */
const statsService = {
  /**
   * Fetch daily and weekly active user counts
   * @returns Promise with DAU stats
   */
  fetchDAU: async (): Promise<ApiResponse<DAUStats>> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/stats/dau`,
        getAuthHeaders(),
      );
      return {
        success: true,
        data: response.data as DAUStats,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Fetch top tracks played by users
   * @param days Number of days to look back (default: 7)
   * @param limit Maximum number of tracks to return (default: 10)
   * @returns Promise with array of top tracks
   */
  fetchTopTracks: async (
    days: number = 7,
    limit: number = 10,
  ): Promise<ApiResponse<TopTrack[]>> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/stats/top-tracks?days=${days}&limit=${limit}`,
        getAuthHeaders(),
      );
      return {
        success: true,
        data: response.data as TopTrack[],
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default statsService;
