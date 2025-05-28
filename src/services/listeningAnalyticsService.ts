import axios from 'axios';

// Use direct environment variable approach, NOT importing from api.ts
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Function to get auth header with JWT token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

// Simple in-memory cache for analytics data
const cache: Record<string, { data: any; timestamp: number }> = {};

// Data interfaces
export interface ListeningAnalyticsOverview {
  overview: {
    totalPlays: number;
    uniqueUsers: number;
    uniqueTracks: number;
    totalListenTime: number;
    listenRatio: number;
    averageSessionLength: number;
  };
  completion: {
    completionRate: number;
    skippedTracks?: number;
  };
  sources: Array<{
    source: string;
    count: number;
    averageListenDuration: number;
  }>;
  devices: Array<{
    deviceType: string;
    count: number;
    averageListenDuration: number;
  }>;
  // New field for aggregated metrics
  aggregated?: {
    playMetrics: {
      count: number;
      totalDuration: number;
      totalListenTime: number;
      completions: number;
      skips: number;
      repeats: number;
      likes: number;
      shares: number;
    };
  };
}

export interface UserBehavior {
  userId: string;
  username?: string;
  email?: string;
  totalPlays: number;
  totalListenTime: number;
  completionRate: number;
  uniqueTracks: number;
  likedTracks: number;
}

export interface UserListeningBehavior {
  users: UserBehavior[];
}

export interface ListeningPatterns {
  hourlyPattern: Array<{
    hour: number;
    plays: number;
    averageListenDuration: number;
  }>;
  genrePattern: Array<{
    genre: string;
    plays: number;
    averageCompletionRate: number;
  }>;
}

export interface GeographicListeningAnalytics {
  countries: Array<{
    country: string;
    plays: number;
    uniqueUsers: number;
  }>;
  regions: Array<{
    country: string;
    region: string;
    plays: number;
    uniqueUsers: number;
  }>;
  cities: Array<{
    country: string;
    region: string;
    city: string;
    plays: number;
    uniqueUsers: number;
  }>;
}

export interface PlaylistAnalytics {
  playlists: Array<{
    playlistId: string;
    plays: number;
    uniqueUsers: number;
    uniqueTracks: number;
    completionRate: number;
    totalListenTime: number;
  }>;
}

export interface UserEngagementAnalytics {
  engagement: {
    totalUsers: number;
    highEngagementUsers: number;
    highEngagementRate: number;
    averagePlaysPerUser: number;
    averageListenTimePerUser: number;
    likeRate: number;
    shareRate: number;
    repeatRate: number;
    averageActiveDays: number;
  };
  retention: {
    retentionRate: number;
    newUsersLast7Days: number;
    activeUsersLast7Days: number;
    returningUsers: number;
    newUserRetentionRate: number;
  };
  quality: {
    bufferRate: number;
    qualityIssueRate: number;
    totalBufferEvents: number;
    totalQualityDrops: number;
    averageBufferCount: number;
  };
}

// Service functions
const listeningAnalyticsService = {
  // Fetch overview analytics with cache support
  fetchOverview: async (days: number = 7, forceFresh: boolean = false) => {
    const cacheKey = `overview_${days}`;
    const cachedData = cache[cacheKey];

    // Use cache if available and not expired (5 minutes) and not forcing refresh
    if (
      !forceFresh &&
      cachedData &&
      Date.now() - cachedData.timestamp < 5 * 60 * 1000
    ) {
      return { success: true, data: cachedData.data };
    }

    try {
      // Use direct API_BASE_URL, not from config file
      const response = await axios.get(
        `${API_BASE_URL}/analytics/overview?days=${days}`,
        getAuthHeader(),
      );

      // Store in cache
      if (response.data.success) {
        cache[cacheKey] = {
          data: response.data.data,
          timestamp: Date.now(),
        };
      }

      return response.data;
    } catch (error) {
      console.error('Failed to fetch listening analytics overview:', error);
      return {
        success: false,
        error: 'Failed to fetch analytics overview. Please try again later.',
      };
    }
  },

  // Fetch user behavior analytics
  fetchUserBehavior: async (
    days: number = 7,
    limit: number = 20,
    forceFresh: boolean = false,
  ) => {
    const cacheKey = `user_behavior_${days}_${limit}`;
    const cachedData = cache[cacheKey];

    if (
      !forceFresh &&
      cachedData &&
      Date.now() - cachedData.timestamp < 5 * 60 * 1000
    ) {
      return { success: true, data: cachedData.data };
    }

    try {
      // Use direct API_BASE_URL, not from config file
      const response = await axios.get(
        `${API_BASE_URL}/analytics/user-behavior?days=${days}&limit=${limit}`,
        getAuthHeader(),
      );

      if (response.data.success) {
        cache[cacheKey] = {
          data: response.data.data,
          timestamp: Date.now(),
        };
      }

      return response.data;
    } catch (error) {
      console.error('Failed to fetch user behavior analytics:', error);
      return {
        success: false,
        error:
          'Failed to fetch user behavior analytics. Please try again later.',
      };
    }
  },

  // Fetch listening patterns
  fetchPatterns: async (days: number = 7, forceFresh: boolean = false) => {
    const cacheKey = `patterns_${days}`;
    const cachedData = cache[cacheKey];

    if (
      !forceFresh &&
      cachedData &&
      Date.now() - cachedData.timestamp < 5 * 60 * 1000
    ) {
      return { success: true, data: cachedData.data };
    }

    try {
      // Log the URL for debugging
      const url = `${API_BASE_URL}/analytics/patterns?days=${days}`;
      console.log(`Fetching patterns from: ${url}`);

      // Use direct API_BASE_URL, not from config file
      const response = await axios.get(url, getAuthHeader());

      if (response.data.success) {
        cache[cacheKey] = {
          data: response.data.data,
          timestamp: Date.now(),
        };
      }

      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch listening patterns:', error);

      // If we have cached data, return it as a fallback even if it's old
      if (cachedData) {
        console.log('Using cached patterns data as fallback');
        return {
          success: true,
          data: cachedData.data,
          fromCache: true,
          stale: true,
        };
      }

      return {
        success: false,
        error: 'Failed to fetch listening patterns. Please try again later.',
        details: {
          url: `${API_BASE_URL}/analytics/patterns`,
          statusCode: error.response?.status,
          isConnected: navigator.onLine,
        },
      };
    }
  },

  // Fetch geographic analytics
  fetchGeographic: async (days: number = 7, forceFresh: boolean = false) => {
    const cacheKey = `geographic_${days}`;
    const cachedData = cache[cacheKey];

    if (
      !forceFresh &&
      cachedData &&
      Date.now() - cachedData.timestamp < 5 * 60 * 1000
    ) {
      return { success: true, data: cachedData.data };
    }

    try {
      // Use direct API_BASE_URL, not from config file
      const response = await axios.get(
        `${API_BASE_URL}/analytics/geographic?days=${days}`,
        getAuthHeader(),
      );

      if (response.data.success) {
        cache[cacheKey] = {
          data: response.data.data,
          timestamp: Date.now(),
        };
      }

      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch geographic analytics:', error);

      // If we have cached data, return it as a fallback even if it's old
      if (cachedData) {
        return {
          success: true,
          data: cachedData.data,
          fromCache: true,
          stale: true,
        };
      }

      return {
        success: false,
        error: 'Failed to fetch geographic analytics. Please try again later.',
        details: {
          url: `${API_BASE_URL}/analytics/geographic`,
          statusCode: error.response?.status,
          isConnected: navigator.onLine,
        },
      };
    }
  },

  // Fetch playlist analytics
  fetchPlaylistAnalytics: async (
    days: number = 7,
    limit: number = 15,
    forceFresh: boolean = false,
  ) => {
    const cacheKey = `playlists_${days}_${limit}`;
    const cachedData = cache[cacheKey];

    if (
      !forceFresh &&
      cachedData &&
      Date.now() - cachedData.timestamp < 5 * 60 * 1000
    ) {
      return { success: true, data: cachedData.data };
    }

    try {
      // Use direct API_BASE_URL, not from config file
      const response = await axios.get(
        `${API_BASE_URL}/analytics/playlists?days=${days}&limit=${limit}`,
        getAuthHeader(),
      );

      if (response.data.success) {
        cache[cacheKey] = {
          data: response.data.data,
          timestamp: Date.now(),
        };
      }

      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch playlist analytics:', error);

      // If we have cached data, return it as a fallback even if it's old
      if (cachedData) {
        return {
          success: true,
          data: cachedData.data,
          fromCache: true,
          stale: true,
        };
      }

      return {
        success: false,
        error: 'Failed to fetch playlist analytics. Please try again later.',
        details: {
          url: `${API_BASE_URL}/analytics/playlists`,
          statusCode: error.response?.status,
          isConnected: navigator.onLine,
        },
      };
    }
  },

  // Fix the fetchEngagement function to handle network errors
  fetchEngagement: async (days: number = 7, forceFresh: boolean = false) => {
    const cacheKey = `engagement_${days}`;
    const cachedData = cache[cacheKey];

    // Use cached data if available and not forcing refresh
    if (
      !forceFresh &&
      cachedData &&
      Date.now() - cachedData.timestamp < 5 * 60 * 1000
    ) {
      return { success: true, data: cachedData.data };
    }

    try {
      // Log the URL being called (for debugging)
      const url = `${API_BASE_URL}/analytics/engagement?days=${days}`;
      console.log(`Fetching engagement analytics from: ${url}`);

      // Set a longer timeout for this API call
      const response = await axios.get(url, {
        ...getAuthHeader(),
        timeout: 15000, // 15 seconds timeout
      });

      if (response.data && response.data.success) {
        cache[cacheKey] = {
          data: response.data.data,
          timestamp: Date.now(),
        };
        return response.data;
      } else {
        throw new Error(response.data?.error || 'Invalid response from server');
      }
    } catch (error: any) {
      console.error('Failed to fetch engagement analytics:', error);

      // If we have cached data, return it as a fallback even if it's old
      if (cachedData) {
        console.log('Using cached engagement data as fallback');
        return {
          success: true,
          data: cachedData.data,
          fromCache: true,
          stale: true,
        };
      }

      // Provide more detailed error information
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch engagement analytics';

      // Return helpful error with connection details
      return {
        success: false,
        error: errorMessage,
        details: {
          url: `${API_BASE_URL}/analytics/engagement`,
          statusCode: error.response?.status,
          isConnected: navigator.onLine,
        },
      };
    }
  },
};

export default listeningAnalyticsService;
