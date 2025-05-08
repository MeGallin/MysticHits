import axios, { AxiosError, AxiosResponse } from 'axios';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

// User-related interfaces
interface UserData {
  email: string;
  password: string;
  name?: string;
}

// Contact form interface
interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

// API Metrics interface
interface MetricsData {
  requestCount: number;
  averageLatency: string;
  routes: {
    route: string;
    requestCount: number;
    averageLatency: string;
  }[];
}

// Error event interface
interface ErrorData {
  _id: string;
  route: string;
  status: number;
  msg: string;
  method: string;
  at: string;
}

interface AuthServices {
  loginUser: (email: string, password: string) => Promise<ApiResponse>;
  logoutUser: () => Promise<ApiResponse>;
  registerUser: (userData: UserData) => Promise<ApiResponse>;
  requestPasswordReset: (email: string) => Promise<ApiResponse>;
  resetPassword: (token: string, newPassword: string) => Promise<ApiResponse>;
}

interface ContactServices {
  submitContactForm: (formData: ContactFormData) => Promise<ApiResponse>;
}

interface PlaylistServices {
  getPlaylistFromUrl: (url: string) => Promise<ApiResponse>;
}

interface HitsServices {
  getPageHits: () => Promise<ApiResponse>;
}

interface AdminServices {
  getUsers: () => Promise<ApiResponse>;
  deleteUser: (userId: string) => Promise<ApiResponse>;
  changeUserRole: (userId: string, isAdmin: boolean) => Promise<ApiResponse>;
  getMessages: (filter?: string) => Promise<ApiResponse>;
  getMessage: (id: string) => Promise<ApiResponse>;
  updateMessage: (
    id: string,
    updates: { read?: boolean; important?: boolean },
  ) => Promise<ApiResponse>;
  deleteMessage: (id: string) => Promise<ApiResponse>;
  getApiMetrics: () => Promise<ApiResponse<MetricsData>>;
  getErrorLogs: (
    hours?: number,
    limit?: number,
  ) => Promise<ApiResponse<ErrorData[]>>;
}

interface HealthServices {
  getHealthStatus: () => Promise<ApiResponse>;
}

interface Services {
  authServices: AuthServices;
  contactServices: ContactServices;
  playlistServices: PlaylistServices;
  hitsServices: HitsServices;
  adminServices: AdminServices;
  healthServices: HealthServices;
}

// Get the API base URL from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generic error handler for API requests
const handleApiError = (error: AxiosError): ApiResponse => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return {
      success: false,
      error: error.response.data?.error || 'An error occurred',
      status: error.response.status,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      success: false,
      error: 'No response from server. Please check your connection.',
      status: 0,
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      status: 0,
    };
  }
};

// Authentication services
export const authServices: AuthServices = {
  // Login user with email and password
  loginUser: async (email, password) => {
    try {
      const response: AxiosResponse = await api.post('/auth/login', {
        email,
        password,
      });
      // Store token in local storage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Add token to default axios headers for future requests
        api.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${response.data.token}`;

        // Broadcast login event
        window.dispatchEvent(new Event('auth:login'));
      }
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  // Logout user
  logoutUser: async () => {
    try {
      // Call backend logout endpoint
      const response: AxiosResponse = await api.post('/auth/logout');

      // Remove token from localStorage
      localStorage.removeItem('token');

      // Remove Authorization header from axios
      delete api.defaults.headers.common['Authorization'];

      // Broadcast logout event
      window.dispatchEvent(new Event('auth:logout'));

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      // Still remove token even if backend call fails
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];

      // Still broadcast logout event even if API call fails
      window.dispatchEvent(new Event('auth:logout'));

      return handleApiError(error as AxiosError);
    }
  },

  // Register a new user
  registerUser: async (userData) => {
    try {
      const response: AxiosResponse = await api.post('/auth/signup', userData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      const response: AxiosResponse = await api.post('/auth/forgot-password', {
        email,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    try {
      const response: AxiosResponse = await api.post(
        `/auth/reset-password/${token}`,
        {
          password: newPassword,
        },
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
};

// Contact form services
export const contactServices: ContactServices = {
  // Submit contact form data
  submitContactForm: async (formData) => {
    try {
      const response: AxiosResponse = await api.post('/contact', formData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
};

// Playlist services
export const playlistServices: PlaylistServices = {
  // Get playlist from remote URL
  getPlaylistFromUrl: async (url) => {
    try {
      const response: AxiosResponse = await api.get('/playlist', {
        params: { url },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
};

// Hits/visitor count services
export const hitsServices: HitsServices = {
  // Get page hit count
  getPageHits: async () => {
    try {
      const response: AxiosResponse = await api.get('/hits/page-hits');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
};

// Admin services
export const adminServices: AdminServices = {
  // Get all users
  getUsers: async () => {
    try {
      const response: AxiosResponse = await api.get('/admin/users');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  // Delete a user
  deleteUser: async (userId) => {
    try {
      const response: AxiosResponse = await api.delete(
        `/admin/users/${userId}`,
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  // Change user role (admin status)
  changeUserRole: async (userId, isAdmin) => {
    try {
      const response: AxiosResponse = await api.patch(
        `/admin/users/${userId}/role`,
        {
          isAdmin,
        },
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  // Get all messages with optional filter (all, unread, important)
  getMessages: async (filter = 'all') => {
    try {
      const response: AxiosResponse = await api.get('/admin/messages', {
        params: filter !== 'all' ? { filter } : undefined,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  // Get a single message by ID
  getMessage: async (id) => {
    try {
      const response: AxiosResponse = await api.get(`/admin/messages/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  // Update message properties (read/important status)
  updateMessage: async (id, updates) => {
    try {
      const response: AxiosResponse = await api.patch(
        `/admin/messages/${id}`,
        updates,
      );
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  // Delete a message
  deleteMessage: async (id) => {
    try {
      const response: AxiosResponse = await api.delete(`/admin/messages/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  // Get API performance metrics
  getApiMetrics: async () => {
    try {
      const response: AxiosResponse = await api.get('/health/metrics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return {
        success: true,
        data: response.data.metrics,
      };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  // Get error logs
  getErrorLogs: async (hours = 1, limit = 10) => {
    try {
      const response: AxiosResponse = await api.get('/admin/errors', {
        params: { hours, limit },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return {
        success: true,
        data: response.data.errors || [],
      };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
};

// Health status services
export const healthServices: HealthServices = {
  // Get system health status
  getHealthStatus: async () => {
    try {
      const response: AxiosResponse = await api.get('/health');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
};

// Export all service groups
const services: Services = {
  authServices,
  contactServices,
  playlistServices,
  hitsServices,
  adminServices,
  healthServices,
};

// Export individual functions for direct import
export const {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  logoutUser,
} = authServices;
// Explicitly export all admin service functions including message-related ones
export const {
  getUsers,
  deleteUser,
  changeUserRole,
  getMessages,
  getMessage,
  updateMessage,
  deleteMessage,
  getApiMetrics,
  getErrorLogs,
} = adminServices;

// Export services object as default
export default services;
