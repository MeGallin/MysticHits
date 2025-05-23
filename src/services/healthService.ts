import axios from 'axios';
import { checkAndFixToken } from '@/utils/tokenFixer';

// Types
export interface HealthData {
  status: string;
  uptimeSec: number;
  memoryMB: number;
  systemMemory?: {
    total: number;
    used: number;
    usagePercent: number;
  };
  cpu?: {
    cores: number;
    model: string;
    loadAvg: {
      '1min': number;
      '5min': number;
      '15min': number;
    };
  };
  db: {
    connected: boolean;
    latencyMs: number | null;
  };
  os?: {
    platform: string;
    release: string;
    hostname: string;
    uptime: number;
  };
  timestamp: string;
}

export interface ApiMetrics {
  apiLatency: {
    avg: number;
    p95: number;
  };
  errorRate: number;
  requestsPerMinute: number;
  timestamp: string;
  endpoints?: Array<{
    path: string;
    avgLatency: number;
    p95Latency: number;
    errorRate: number;
    requests: number;
  }>;
  dbQueries?: {
    avgLatency: number;
    connections: number;
    active: number;
    queriesPerMin: number;
  };
  cache?: {
    hitRate: number;
    missRate: number;
    evictions: number;
    size: string;
  };
}

export interface SystemResources {
  success: boolean;
  cpu: {
    usage: {
      user: number;
      system: number;
    };
    cores: number;
    loadAvg: number[];
  };
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    system: {
      total: number;
      free: number;
      used: number;
      usagePercent: string;
    };
  };
  os: {
    platform: string;
    arch: string;
    release: string;
    hostname: string;
    uptime: number;
  };
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  isAuthError?: boolean;
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
      isAuthError: error.response.status === 401,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      success: false,
      error: 'No response from server',
      status: 0,
      isAuthError: false,
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      success: false,
      error: error.message || 'Unknown error',
      status: 0,
      isAuthError: false,
    };
  }
};

/**
 * Service for fetching system health information
 */
const healthService = {
  /**
   * Check if user is authenticated for health endpoints
   * @returns Whether the user is authenticated
   */
  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        console.log('No token found during auth check');
        return false;
      }

      // Log token format for debugging (mask most of it for security)
      const tokenFirstChars = token.substring(0, 10);
      const tokenLength = token.length;
      console.log(
        `Checking auth with token: ${tokenFirstChars}...${token.substring(
          tokenLength - 5,
        )} (${tokenLength} chars)`,
      );

      const response = await axios.get(`${API_BASE_URL}/health/auth`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Auth response:', response.data);
      return response.data.authenticated === true;
    } catch (error) {
      console.error(
        'Auth check error:',
        error.response?.status || error.message,
      );

      // If unauthorized or forbidden, clear token to force new login
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Auth failed with 401/403, clearing token');
        localStorage.removeItem('token');
      }

      return false;
    }
  },

  /**
   * Fetch basic system health information
   * @returns Promise with health data
   */
  fetchHealthStatus: async () => {
    try {
      // Add cache-busting parameter with timestamp modulo to reduce unnecessary precision
      // This helps avoid ad blockers while still preventing hard caching
      const cacheBuster = Math.floor(Date.now() / 10000); // Changes every 10 seconds

      const response = await axios.get(
        `${API_BASE_URL}/health?_t=${cacheBuster}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return {
        success: true,
        data: response.data,
        isRateLimited: false,
      };
    } catch (error) {
      console.error('Error fetching health status:', error);

      // Check for rate limiting specifically
      const isRateLimited = error.response?.status === 429;

      // If rate limited, return a simplified/mock health status
      if (isRateLimited) {
        return {
          success: true,
          data: {
            status: 'partial',
            database: { status: 'unknown', latency: null },
            api: { status: 'rate_limited', latency: null },
            cache: { status: 'unknown', latency: null },
            updatedAt: new Date().toISOString(),
          },
          isRateLimited: true,
          error: 'Rate limit exceeded. Using cached data.',
        };
      }

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch health status',
        isRateLimited,
      };
    }
  },

  /**
   * Fetch API performance metrics
   * @returns Promise with API metrics
   */
  fetchApiMetrics: async (): Promise<ApiResponse<ApiMetrics>> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/health/metrics`,
        getAuthHeaders(),
      );
      return {
        success: true,
        data: response.data as ApiMetrics,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Fetch detailed system resource information
   * @returns Promise with system resources data
   */
  fetchSystemResources: async (): Promise<ApiResponse<SystemResources>> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/health/system`,
        getAuthHeaders(),
      );
      return {
        success: true,
        data: response.data as SystemResources,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default healthService;
