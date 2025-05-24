import axios from 'axios';
import { checkAndFixToken } from '@/utils/tokenFixer';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Response cache for API calls
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Types for Listening Analytics
export interface ListeningOverview {
  totalPlays: number;
  totalListenTime: number;
  totalTrackTime: number;
  uniqueUsers: number;
  uniqueTracks: number;
  averageSessionLength: number;
  listenRatio: number;
}

export interface CompletionStats {
  completedTracks: number;
  skippedTracks: number;
  totalTracks: number;
  completionRate: number;
  skipRate: number;
}

export interface SourceStats {
  source: string;
  count: number;
  averageListenDuration: number;
}

export interface DeviceStats {
  deviceType: string;
  count: number;
  averageListenDuration: number;
}

export interface SkipAnalysis {
  averageSkipTime: number;
  totalSkips: number;
}

export interface ListeningAnalyticsOverview {
  overview: ListeningOverview;
  completion: CompletionStats;
  sources: SourceStats[];
  devices: DeviceStats[];
  skipAnalysis: SkipAnalysis;
  period: string;
  updatedAt: string;
}

export interface UserBehavior {
  userId: string;
  username: string;
  email: string;
  totalPlays: number;
  totalListenTime: number;
  uniqueTracks: number;
  completedTracks: number;
  skippedTracks: number;
  repeatedTracks: number;
  likedTracks: number;
  sharedTracks: number;
  averageSessionLength: number;
  deviceTypes: number;
  sources: number;
  countries: number;
  completionRate: number;
  skipRate: number;
  averageListenTimePerTrack: number;
  firstPlay: string;
  lastPlay: string;
}

export interface UserListeningBehavior {
  users: UserBehavior[];
  period: string;
  totalUsers: number;
  updatedAt: string;
}

export interface HourlyPattern {
  hour: number;
  plays: number;
  totalListenTime: number;
  uniqueUsers: number;
}

export interface DailyPattern {
  day: string;
  dayNumber: number;
  plays: number;
  totalListenTime: number;
  uniqueUsers: number;
}

export interface GenrePattern {
  genre: string;
  plays: number;
  totalListenTime: number;
  uniqueUsers: number;
  averageCompletionRate: number;
}

export interface ListeningPatterns {
  hourlyPattern: HourlyPattern[];
  dailyPattern: DailyPattern[];
  genrePattern: GenrePattern[];
  period: string;
  updatedAt: string;
}

export interface GeographicData {
  country: string;
  region?: string;
  city?: string;
  plays: number;
  totalListenTime: number;
  uniqueUsers: number;
  averageSessionLength?: number;
}

export interface GeographicListeningAnalytics {
  countries: GeographicData[];
  regions: GeographicData[];
  cities: GeographicData[];
  period: string;
  updatedAt: string;
}

export interface PlaylistAnalytic {
  playlistId: string;
  plays: number;
  totalListenTime: number;
  uniqueUsers: number;
  uniqueTracks: number;
  averageSessionPosition: number;
  completedTracks: number;
  skippedTracks: number;
  completionRate: number;
}

export interface PlaylistAnalytics {
  playlists: PlaylistAnalytic[];
  sourceBreakdown: SourceStats[];
  period: string;
  updatedAt: string;
}

export interface EngagementMetrics {
  totalUsers: number;
  averagePlaysPerUser: number;
  averageListenTimePerUser: number;
  totalInteractions: number;
  likeRate: number;
  shareRate: number;
  repeatRate: number;
  averageActiveDays: number;
  highEngagementUsers: number;
  highEngagementRate: number;
}

export interface RetentionMetrics {
  totalUsers: number;
  newUsersLast7Days: number;
  activeUsersLast7Days: number;
  returningUsers: number;
  retentionRate: number;
  newUserRetentionRate: number;
}

export interface QualityMetrics {
  totalPlays: number;
  totalBufferEvents: number;
  totalQualityDrops: number;
  averageBufferCount: number;
  averageQualityDrops: number;
  bufferRate: number;
  qualityIssueRate: number;
}

export interface UserEngagementAnalytics {
  engagement: EngagementMetrics;
  retention: RetentionMetrics;
  quality: QualityMetrics;
  period: string;
  updatedAt: string;
}

export interface BaseResponse {
  success: boolean;
  error?: string;
  status?: number;
  isRateLimited?: boolean;
}

export interface ListeningAnalyticsResponse<T> extends BaseResponse {
  data?: T;
}

// Helper functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const handleApiError = (error: any): BaseResponse => {
  console.error('API Error:', error);

  const isRateLimited = error.response?.status === 429;

  if (error.response) {
    return {
      success: false,
      error:
        error.response.data?.error ||
        error.response.data?.message ||
        'An error occurred',
      status: error.response.status,
      isRateLimited,
    };
  } else if (error.request) {
    return {
      success: false,
      error: 'No response from server',
      status: 0,
      isRateLimited: false,
    };
  } else {
    return {
      success: false,
      error: error.message || 'Unknown error',
      status: 0,
      isRateLimited: false,
    };
  }
};

const getCachedData = <T>(
  cacheKey: string,
): ListeningAnalyticsResponse<T> | null => {
  const cachedItem = responseCache.get(cacheKey);
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_TTL) {
    return {
      success: true,
      data: cachedItem.data as T,
    };
  }
  return null;
};

const cacheResponse = <T>(cacheKey: string, data: T): void => {
  responseCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
};

/**
 * Service for fetching comprehensive listening analytics
 */
const listeningAnalyticsService = {
  /**
   * Fetch listening analytics overview
   */
  fetchOverview: async (
    days: number = 7,
    forceFresh = false,
  ): Promise<ListeningAnalyticsResponse<ListeningAnalyticsOverview>> => {
    const cacheKey = `listening-analytics-overview-${days}`;

    if (!forceFresh) {
      const cachedData = getCachedData<ListeningAnalyticsOverview>(cacheKey);
      if (cachedData) return cachedData;
    }

    try {
      await checkAndFixToken();
      const response = await axios.get(
        `${API_BASE_URL}/admin/listening-analytics/overview?days=${days}`,
        getAuthHeaders(),
      );

      cacheResponse(cacheKey, response.data);

      return {
        success: true,
        data: response.data as ListeningAnalyticsOverview,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Fetch user listening behavior analytics
   */
  fetchUserBehavior: async (
    days: number = 7,
    limit: number = 20,
    forceFresh = false,
  ): Promise<ListeningAnalyticsResponse<UserListeningBehavior>> => {
    const cacheKey = `listening-analytics-user-behavior-${days}-${limit}`;

    if (!forceFresh) {
      const cachedData = getCachedData<UserListeningBehavior>(cacheKey);
      if (cachedData) return cachedData;
    }

    try {
      await checkAndFixToken();
      const response = await axios.get(
        `${API_BASE_URL}/admin/listening-analytics/user-behavior?days=${days}&limit=${limit}`,
        getAuthHeaders(),
      );

      cacheResponse(cacheKey, response.data);

      return {
        success: true,
        data: response.data as UserListeningBehavior,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Fetch listening patterns analysis
   */
  fetchPatterns: async (
    days: number = 7,
    forceFresh = false,
  ): Promise<ListeningAnalyticsResponse<ListeningPatterns>> => {
    const cacheKey = `listening-analytics-patterns-${days}`;

    if (!forceFresh) {
      const cachedData = getCachedData<ListeningPatterns>(cacheKey);
      if (cachedData) return cachedData;
    }

    try {
      await checkAndFixToken();
      const response = await axios.get(
        `${API_BASE_URL}/admin/listening-analytics/patterns?days=${days}`,
        getAuthHeaders(),
      );

      cacheResponse(cacheKey, response.data);

      return {
        success: true,
        data: response.data as ListeningPatterns,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Fetch geographic listening analytics
   */
  fetchGeographic: async (
    days: number = 7,
    forceFresh = false,
  ): Promise<ListeningAnalyticsResponse<GeographicListeningAnalytics>> => {
    const cacheKey = `listening-analytics-geographic-${days}`;

    if (!forceFresh) {
      const cachedData = getCachedData<GeographicListeningAnalytics>(cacheKey);
      if (cachedData) return cachedData;
    }

    try {
      await checkAndFixToken();
      const response = await axios.get(
        `${API_BASE_URL}/admin/listening-analytics/geographic?days=${days}`,
        getAuthHeaders(),
      );

      cacheResponse(cacheKey, response.data);

      return {
        success: true,
        data: response.data as GeographicListeningAnalytics,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Fetch playlist usage analytics
   */
  fetchPlaylistAnalytics: async (
    days: number = 7,
    limit: number = 20,
    forceFresh = false,
  ): Promise<ListeningAnalyticsResponse<PlaylistAnalytics>> => {
    const cacheKey = `listening-analytics-playlists-${days}-${limit}`;

    if (!forceFresh) {
      const cachedData = getCachedData<PlaylistAnalytics>(cacheKey);
      if (cachedData) return cachedData;
    }

    try {
      await checkAndFixToken();
      const response = await axios.get(
        `${API_BASE_URL}/admin/listening-analytics/playlists?days=${days}&limit=${limit}`,
        getAuthHeaders(),
      );

      cacheResponse(cacheKey, response.data);

      return {
        success: true,
        data: response.data as PlaylistAnalytics,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Fetch user engagement analytics
   */
  fetchEngagement: async (
    days: number = 30,
    forceFresh = false,
  ): Promise<ListeningAnalyticsResponse<UserEngagementAnalytics>> => {
    const cacheKey = `listening-analytics-engagement-${days}`;

    if (!forceFresh) {
      const cachedData = getCachedData<UserEngagementAnalytics>(cacheKey);
      if (cachedData) return cachedData;
    }

    try {
      await checkAndFixToken();
      const response = await axios.get(
        `${API_BASE_URL}/admin/listening-analytics/engagement?days=${days}`,
        getAuthHeaders(),
      );

      cacheResponse(cacheKey, response.data);

      return {
        success: true,
        data: response.data as UserEngagementAnalytics,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Clear cache for all listening analytics
   */
  clearCache: () => {
    const keysToDelete = Array.from(responseCache.keys()).filter((key) =>
      key.startsWith('listening-analytics'),
    );
    keysToDelete.forEach((key) => responseCache.delete(key));
  },
};

export default listeningAnalyticsService;
