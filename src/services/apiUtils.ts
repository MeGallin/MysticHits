import { AxiosError } from 'axios';

// Generic API Response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

/**
 * Generic error handler for API requests
 * Processes Axios errors and returns a standardized error response
 */
export const handleApiError = (error: unknown): ApiResponse => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const data = axiosError.response.data as any;
      return {
        success: false,
        error: data?.error || 'An error occurred',
        status: axiosError.response.status,
      };
    } else if (axiosError.request) {
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
        error: axiosError.message || 'An unexpected error occurred',
        status: 0,
      };
    }
  }

  // For non-Axios errors
  return {
    success: false,
    error: error instanceof Error ? error.message : 'An unknown error occurred',
    status: 0,
  };
};

/**
 * Helper to get the authentication header
 * Returns a header object with the JWT token if available
 */
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Helper to check if the current user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

// Add missing axios import
import axios from 'axios';
