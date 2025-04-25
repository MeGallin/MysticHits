import axios from 'axios';

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
const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return {
      error: error.response.data.error || 'An error occurred',
      status: error.response.status,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      error: 'No response from server. Please check your connection.',
      status: 0,
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      error: error.message || 'An unexpected error occurred',
      status: 0,
    };
  }
};

// Authentication services
export const authServices = {
  // Login user with email and password
  loginUser: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
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
      return handleApiError(error);
    }
  },

  // Logout user
  logoutUser: async () => {
    try {
      // Call backend logout endpoint
      const response = await api.post('/auth/logout');

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

      return handleApiError(error);
    }
  },

  // Register a new user
  registerUser: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        password: newPassword,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Contact form services
export const contactServices = {
  // Submit contact form data
  submitContactForm: async (formData) => {
    try {
      const response = await api.post('/contact', formData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Playlist services
export const playlistServices = {
  // Get playlist from remote URL
  getPlaylistFromUrl: async (url) => {
    try {
      const response = await api.get('/playlist', {
        params: { url },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Hits/visitor count services
export const hitsServices = {
  // Get page hit count
  getPageHits: async () => {
    try {
      const response = await api.get('/hits/page-hits');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Admin services
export const adminServices = {
  // Get all users
  getUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete a user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Export all service groups
export default {
  authServices,
  contactServices,
  playlistServices,
  hitsServices,
  adminServices,
};

// Export individual functions for direct import
export const loginUser = authServices.loginUser;
export const registerUser = authServices.registerUser;
export const requestPasswordReset = authServices.requestPasswordReset;
export const resetPassword = authServices.resetPassword;
export const logoutUser = authServices.logoutUser;
export const { getUsers, deleteUser } = adminServices;
