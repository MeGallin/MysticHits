import axios from 'axios';

// Simple in-memory cache for analytics data
const cache: Record<string, { data: any; timestamp: number }> = {};

// API base URL from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Get authentication headers - retrieve token at call time, not initialization time
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    withCredentials: true, // Include credentials for cross-origin requests
  };
};

// API response interface
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  message?: string;
  fromCache?: boolean;
  stale?: boolean;
  details?: any;
}

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
  debug?: {
    message: string;
    totalDocumentsInDB: number;
    eventsInDateRange: number;
    estimatedListenTime?: number;
    estimationMethod?: string;
    aggregatedData?: {
      totalPlays: number;
      actualListenTime: number;
      totalDuration: number;
      completions: number;
      skips: number;
      likes: number;
      shares: number;
      repeats: number;
    };
  };
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

export interface GeographicAnalytics {
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

export interface GeographicListeningAnalytics extends GeographicAnalytics {}

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
class ListeningAnalyticsService {
  private readonly BASE_URL = '/analytics';

  /**
   * Check if analytics is available in current environment
   */
  private isAnalyticsAvailable(): boolean {
    // Analytics are now available in production
    return true;
  }

  /**
   * Fetch listening analytics overview
   */
  async fetchOverview(
    days = 7,
    forceFresh: boolean = false,
  ): Promise<ApiResponse<ListeningAnalyticsOverview>> {
    // Check availability first
    if (!this.isAnalyticsAvailable()) {
      return {
        success: false,
        error:
          'Analytics not available in production yet - feature coming soon!',
        data: null,
      };
    }

    const cacheKey = `overview_${days}`;
    const cachedData = cache[cacheKey];

    if (
      !forceFresh &&
      cachedData &&
      Date.now() - cachedData.timestamp < 5 * 60 * 1000
    ) {
      return { success: true, data: cachedData.data };
    }

    try {
      // Use axios.get with authHeaders like trackingService.ts
      const response = await axios.get(
        `${API_BASE_URL}${this.BASE_URL}/listening-overview`,
        {
          ...getAuthHeaders(),
          params: { days },
        },
      );

      if (response.data.success) {
        cache[cacheKey] = {
          data: response.data.data,
          timestamp: Date.now(),
        };
      }

      return {
        success: true,
        data: response.data.data,
        message: 'Analytics overview fetched successfully',
      };
    } catch (error: any) {
      console.error('Error fetching analytics overview:', error);
      console.error(
        'Full URL attempted:',
        `${API_BASE_URL}${this.BASE_URL}/listening-overview`,
      );

      return {
        success: false,
        error:
          error.response?.data?.error || 'Failed to fetch analytics overview',
        data: null,
        details: {
          url: `${API_BASE_URL}${this.BASE_URL}/listening-overview`,
          statusCode: error.response?.status,
          environment: import.meta.env.PROD ? 'production' : 'development',
          hostname: window.location.hostname,
          actualApiUrl: API_BASE_URL,
        },
      };
    }
  }

  /**
   * Fetch user behavior analytics
   */
  async fetchUserBehavior(
    days = 7,
    limit = 20,
    forceFresh: boolean = false,
  ): Promise<ApiResponse<UserListeningBehavior>> {
    if (!this.isAnalyticsAvailable()) {
      return {
        success: false,
        error:
          'Analytics not available in production yet - feature coming soon!',
        data: null,
      };
    }

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
      const response = await axios.get(
        `${API_BASE_URL}${this.BASE_URL}/user-listening-behavior`,
        {
          ...getAuthHeaders(),
          params: { days, limit },
        },
      );

      if (response.data.success) {
        cache[cacheKey] = {
          data: response.data.data,
          timestamp: Date.now(),
        };
      }

      return {
        success: true,
        data: response.data.data,
        message: 'User behavior analytics fetched successfully',
      };
    } catch (error: any) {
      console.error('Error fetching user behavior analytics:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          'Failed to fetch user behavior analytics',
        data: null,
        details: {
          url: `${API_BASE_URL}${this.BASE_URL}/user-listening-behavior`,
          statusCode: error.response?.status,
          actualApiUrl: API_BASE_URL,
        },
      };
    }
  }

  /**
   * Fetch listening patterns analytics
   */
  async fetchPatterns(
    days = 7,
    forceFresh: boolean = false,
  ): Promise<ApiResponse<ListeningPatterns>> {
    if (!this.isAnalyticsAvailable()) {
      return {
        success: false,
        error:
          'Analytics not available in production yet - feature coming soon!',
        data: null,
      };
    }

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
      const response = await axios.get(
        `${API_BASE_URL}${this.BASE_URL}/listening-patterns`,
        {
          ...getAuthHeaders(),
          params: { days },
        },
      );

      if (response.data.success) {
        cache[cacheKey] = {
          data: response.data.data,
          timestamp: Date.now(),
        };
      }

      return {
        success: true,
        data: response.data.data,
        message: 'Listening patterns fetched successfully',
      };
    } catch (error: any) {
      console.error('Error fetching listening patterns:', error);
      return {
        success: false,
        error:
          error.response?.data?.error || 'Failed to fetch listening patterns',
        data: null,
        details: {
          url: `${API_BASE_URL}${this.BASE_URL}/listening-patterns`,
          statusCode: error.response?.status,
          actualApiUrl: API_BASE_URL,
        },
      };
    }
  }

  /**
   * Fetch geographic analytics
   */
  async fetchGeographic(
    days = 7,
    forceFresh: boolean = false,
  ): Promise<ApiResponse<GeographicAnalytics>> {
    if (!this.isAnalyticsAvailable()) {
      return {
        success: false,
        error:
          'Analytics not available in production yet - feature coming soon!',
        data: null,
      };
    }

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
      const response = await axios.get(
        `${API_BASE_URL}${this.BASE_URL}/geographic-listening`,
        {
          ...getAuthHeaders(),
          params: { days },
        },
      );

      if (response.data.success) {
        cache[cacheKey] = {
          data: response.data.data,
          timestamp: Date.now(),
        };
      }

      return {
        success: true,
        data: response.data.data,
        message: 'Geographic analytics fetched successfully',
      };
    } catch (error: any) {
      console.error('Error fetching geographic analytics:', error);
      return {
        success: false,
        error:
          error.response?.data?.error || 'Failed to fetch geographic analytics',
        data: null,
        details: {
          url: `${API_BASE_URL}${this.BASE_URL}/geographic-listening`,
          statusCode: error.response?.status,
          actualApiUrl: API_BASE_URL,
        },
      };
    }
  }

  /**
   * Fetch playlist analytics
   */
  async fetchPlaylists(
    days = 7,
    limit = 15,
    forceFresh: boolean = false,
  ): Promise<ApiResponse<PlaylistAnalytics>> {
    if (!this.isAnalyticsAvailable()) {
      return {
        success: false,
        error:
          'Analytics not available in production yet - feature coming soon!',
        data: null,
      };
    }

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
      const response = await axios.get(
        `${API_BASE_URL}${this.BASE_URL}/playlist-analytics`,
        {
          ...getAuthHeaders(),
          params: { days, limit },
        },
      );

      if (response.data.success) {
        cache[cacheKey] = {
          data: response.data.data,
          timestamp: Date.now(),
        };
      }

      return {
        success: true,
        data: response.data.data,
        message: 'Playlist analytics fetched successfully',
      };
    } catch (error: any) {
      console.error('Error fetching playlist analytics:', error);
      return {
        success: false,
        error:
          error.response?.data?.error || 'Failed to fetch playlist analytics',
        data: null,
        details: {
          url: `${API_BASE_URL}${this.BASE_URL}/playlist-analytics`,
          statusCode: error.response?.status,
          actualApiUrl: API_BASE_URL,
        },
      };
    }
  }

  /**
   * Fetch engagement analytics
   */
  async fetchEngagement(
    days = 7,
    forceFresh: boolean = false,
  ): Promise<ApiResponse<UserEngagementAnalytics>> {
    if (!this.isAnalyticsAvailable()) {
      return {
        success: false,
        error:
          'Analytics not available in production yet - feature coming soon!',
        data: null,
      };
    }

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
      const response = await axios.get(
        `${API_BASE_URL}${this.BASE_URL}/user-engagement`,
        {
          ...getAuthHeaders(),
          params: { days },
        },
      );

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
      console.error('Error fetching engagement analytics:', error);

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
        data: null,
        details: {
          url: `${API_BASE_URL}/analytics/user-engagement`,
          statusCode: error.response?.status,
          isConnected: navigator.onLine,
        },
      };
    }
  }
}

export default new ListeningAnalyticsService();
