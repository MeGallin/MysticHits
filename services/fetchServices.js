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

// Export all service groups
export default {
  contactServices,
  playlistServices,
  hitsServices,
};
