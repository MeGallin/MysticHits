import axios from 'axios';
import { validateToken, setAxiosAuthHeader } from '@/utils/authUtils';
import { checkAndFixToken } from '@/utils/tokenFixer';

// Define the folder interface
export interface Folder {
  _id: string;
  label: string;
  path: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  order?: number; // Optional order property for sorting
}

// Define the API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PlaylistResponse {
  success: boolean;
  data?: {
    tracks: Array<{
      id: string;
      title: string;
      artist?: string;
      album?: string;
      url: string;
      duration?: number;
    }>;
  };
  error?: string;
}

// API base URL from environment variables (or default if not set)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const FOLDERS_ENDPOINT = `${API_BASE_URL}/user/folders`; // This matches the server.js route

// Helper function to get auth headers with the current token
const getAuthHeaders = () => {
  // Check and fix token format if needed
  checkAndFixToken();

  // Get the (potentially fixed) token
  const token = localStorage.getItem('token');

  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

// Set up axios instance with auth headers
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to always include the latest token
axiosInstance.interceptors.request.use(
  (config) => {
    // Check and fix token format if needed
    checkAndFixToken();

    // Get the (potentially fixed) token
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Could trigger logout here if needed
    }
    return Promise.reject(error);
  },
);

// Create the folder service
const folderServices = {
  // Get all folders for the authenticated user
  getFolders: async (): Promise<ApiResponse<Folder[]>> => {
    try {
      // Check and fix token format if needed
      checkAndFixToken();

      // Get the (potentially fixed) token
      const token = localStorage.getItem('token');

      if (!token) {
        return {
          success: false,
          error: 'No authentication token found. Please log in again.',
        };
      }

      // Create a new axios instance with the token
      const folderAxios = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // Make the request with the direct token
      const response = await folderAxios.get('/user/folders');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Authentication error
      }
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to fetch folders',
      };
    }
  },

  // Add a new folder
  addFolder: async (folderData: {
    label: string;
    path: string;
  }): Promise<ApiResponse<Folder>> => {
    try {
      const response = await axiosInstance.post(FOLDERS_ENDPOINT, folderData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to add folder',
      };
    }
  },

  // Update an existing folder
  updateFolder: async (
    folderId: string,
    folderData: {
      label: string;
      path: string;
    },
  ): Promise<ApiResponse<Folder>> => {
    try {
      const response = await axiosInstance.patch(
        `${FOLDERS_ENDPOINT}/${folderId}`,
        folderData,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to update folder',
      };
    }
  },

  // Delete a folder
  deleteFolder: async (folderId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await axiosInstance.delete(
        `${FOLDERS_ENDPOINT}/${folderId}`,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to delete folder',
      };
    }
  },

  // Get the playlist for a folder
  getFolderPlaylist: async (folderId: string): Promise<PlaylistResponse> => {
    try {
      const response = await axiosInstance.get(
        `${FOLDERS_ENDPOINT}/${folderId}/playlist`,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to load playlist',
      };
    }
  },

  // Reorder folders
  reorderFolders: async (
    folderIds: string[],
  ): Promise<ApiResponse<Folder[]>> => {
    try {
      const response = await axiosInstance.put(`${FOLDERS_ENDPOINT}/reorder`, {
        folderIds,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to reorder folders',
      };
    }
  },
};

export default folderServices;
