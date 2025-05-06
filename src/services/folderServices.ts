import axios from 'axios';

// Define the folder interface
export interface Folder {
  _id: string;
  label: string;
  path: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
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
const API_BASE_URL = 'http://localhost:8000/api';
const FOLDERS_ENDPOINT = `${API_BASE_URL}/user/folders`;

// Helper function to get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('Current auth token:', token ? 'Token exists' : 'No token found');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
    withCredentials: true,
  };
};

// Create the folder service
const folderServices = {
  // Get all folders for the authenticated user
  getFolders: async (): Promise<ApiResponse<Folder[]>> => {
    try {
      console.log('Fetching folders from:', FOLDERS_ENDPOINT);
      const headers = getAuthHeaders();

      const response = await axios.get(FOLDERS_ENDPOINT, headers);
      console.log('Folders API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Folder fetch error details:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch folders',
      };
    }
  },

  // Add a new folder
  addFolder: async (folderData: {
    label: string;
    path: string;
  }): Promise<ApiResponse<Folder>> => {
    try {
      const response = await axios.post(
        FOLDERS_ENDPOINT,
        folderData,
        getAuthHeaders(),
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add folder',
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
      const response = await axios.patch(
        `${FOLDERS_ENDPOINT}/${folderId}`,
        folderData,
        getAuthHeaders(),
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update folder',
      };
    }
  },

  // Delete a folder
  deleteFolder: async (folderId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await axios.delete(
        `${FOLDERS_ENDPOINT}/${folderId}`,
        getAuthHeaders(),
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete folder',
      };
    }
  },

  // Get the playlist for a folder
  getFolderPlaylist: async (folderId: string): Promise<PlaylistResponse> => {
    try {
      const response = await axios.get(
        `${FOLDERS_ENDPOINT}/${folderId}/playlist`,
        getAuthHeaders(),
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load playlist',
      };
    }
  },
};

export default folderServices;
