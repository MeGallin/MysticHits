import axios from 'axios';
import { checkAndFixToken } from '@/utils/tokenFixer';

// Types
export interface DAUStats {
  dau: number;
  wau: number;
  updated: string;
}

export interface UserActivityDailySummary {
  dateLabel: string; // e.g., "Today", "Yesterday", "Oct 28"
  date: string; // e.g., "2023-10-30"
  newUsers: number;
  logins: number;
}

export interface BaseResponse {
  success: boolean;
  error?: string;
  status?: number;
  isRateLimited?: boolean;
}

export interface DAUResponse extends BaseResponse {
  data?: DAUStats;
  isRateLimited?: boolean;
}

export interface UserActivitySummaryResponse extends BaseResponse {
  data?: UserActivityDailySummary[];
  isRateLimited?: boolean; // Optional: if this endpoint also has rate limiting
}

// API base URL from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Cache for responses to reduce API calls
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes cache TTL

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
    // Check if this is a rate limit error
    const isRateLimited = error.response.status === 429;

    return {
      success: false,
      error: isRateLimited
        ? 'Rate limit exceeded. Please try again later.'
        : error.response.data?.error ||
          error.response.data?.message ||
          'An error occurred',
      status: error.response.status,
      isRateLimited,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      success: false,
      error: 'No response from server',
      status: 0,
      isRateLimited: false,
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      success: false,
      error: error.message || 'Unknown error',
      status: 0,
      isRateLimited: false,
    };
  }
};

// Check and return cached data if available and fresh
const getCachedData = <T>(cacheKey: string): ApiResponse<T> | null => {
  const cachedItem = responseCache.get(cacheKey);
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_TTL) {
    return {
      success: true,
      data: cachedItem.data as T,
    };
  }
  return null;
};

// Cache successful response data
const cacheResponse = <T>(cacheKey: string, data: T): void => {
  responseCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
};

/**
 * Service for fetching user activity statistics and top tracks
 */
const statsService = {
  /**
   * Fetch daily and weekly active user counts
   * @param forceFresh If true, bypass cache and fetch fresh data
   * @returns Promise with DAU stats
   */
  fetchDAU: async (forceFresh = false): Promise<DAUResponse> => {
    const cacheKey = 'dau-stats';

    // Check cache first unless forceFresh is true
    if (!forceFresh) {
      const cachedData = getCachedData<DAUStats>(cacheKey);
      if (cachedData) return cachedData;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/stats/dau`,
        getAuthHeaders(),
      );

      // Cache the successful response
      cacheResponse<DAUStats>(cacheKey, response.data);

      return {
        success: true,
        data: response.data as DAUStats,
      };
    } catch (error) {
      // If rate limited, return mock data
      const apiError = handleApiError(error);
      if (apiError.isRateLimited) {
        // Return mock data when rate limited
        const mockData: DAUStats = {
          dau: 245,
          wau: 1120,
          updated: new Date().toISOString(),
        };
        return {
          success: true,
          data: mockData,
          status: 200,
          isRateLimited: true,
        };
      }
      return apiError;
    }
  },

  /**
   * Fetch top tracks played by users
   * @param days Number of days to look back (default: 7)
   * @param limit Maximum number of tracks to return (default: 10)
   * @param forceFresh If true, bypass cache and fetch fresh data
   * @returns Promise with array of top tracks
   */
  fetchTopTracks: async (
    days: number = 7,
    limit: number = 10,
    forceFresh = false,
  ): Promise<ApiResponse<TopTrack[]>> => {
    const cacheKey = `top-tracks-${days}-${limit}`;

    // Check cache first unless forceFresh is true
    if (!forceFresh) {
      const cachedData = getCachedData<TopTrack[]>(cacheKey);
      if (cachedData) return cachedData;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/stats/top-tracks?days=${days}&limit=${limit}`,
        getAuthHeaders(),
      );

      // Cache the successful response
      cacheResponse<TopTrack[]>(cacheKey, response.data);

      return {
        success: true,
        data: response.data as TopTrack[],
      };
    } catch (error) {
      // If rate limited, return mock data
      const apiError = handleApiError(error);
      if (apiError.isRateLimited) {
        // Return mock data when rate limited
        const mockTracks: TopTrack[] = [
          { trackUrl: '/tracks/song1.mp3', title: 'Summer Vibes', count: 1245 },
          {
            trackUrl: '/tracks/song2.mp3',
            title: 'Midnight Drive',
            count: 983,
          },
          { trackUrl: '/tracks/song3.mp3', title: 'Ocean Waves', count: 752 },
          { trackUrl: '/tracks/song4.mp3', title: 'Mountain High', count: 621 },
          { trackUrl: '/tracks/song5.mp3', title: 'City Lights', count: 508 },
        ];
        return {
          success: true,
          data: mockTracks,
          status: 200,
          isRateLimited: true,
        };
      }
      return apiError;
    }
  },

  /**
   * Fetch daily user activity summary (new users and logins)
   * @param forceFresh If true, bypass cache and fetch fresh data
   * @returns Promise with array of daily user activity summaries
   */
  fetchUserActivitySummary: async (
    forceFresh = false,
  ): Promise<UserActivitySummaryResponse> => {
    try {
      const response = await axios.get<UserActivityDailySummary[]>(
        `${API_BASE_URL}/admin/stats/user-activity-summary${
          forceFresh ? '?fresh=true' : ''
        }`,
        getAuthHeaders(),
      );

      return {
        success: true,
        data: response.data,
        isRateLimited: response.headers['x-rate-limit-remaining'] === '0',
      };
    } catch (error: any) {
      console.error('Error fetching user activity summary:', error);
      const isRateLimited =
        error.response?.status === 429 ||
        error.response?.headers['x-rate-limit-remaining'] === '0';
      if (isRateLimited) {
        // Fallback to sample data if rate limited
        const sampleData: UserActivityDailySummary[] = [
          {
            dateLabel: 'Today',
            date: new Date().toISOString().split('T')[0],
            newUsers: 1,
            logins: 10,
          },
          {
            dateLabel: 'Yesterday',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            newUsers: 2,
            logins: 12,
          },
        ];
        return {
          success: true,
          data: sampleData,
          error: 'API rate limit hit. Displaying sample data.',
          isRateLimited: true,
        };
      }
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch user activity summary',
        isRateLimited,
      };
    }
  },
};

export default statsService;
