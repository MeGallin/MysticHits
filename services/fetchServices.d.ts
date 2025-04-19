// Type definitions for fetchServices.js

// Define the structure of API responses
interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  error: string;
  status: number;
  success?: false;
}

// Define the contact form data structure
interface ContactFormData {
  fullName: string;
  email: string;
  message: string;
}

// Define the playlist data structure
interface PlaylistTrack {
  title: string;
  url: string;
  mime: string;
}

interface PlaylistResponse {
  success: boolean;
  count: number;
  data: PlaylistTrack[];
}

// Define the contact services
export interface ContactServices {
  submitContactForm: (
    formData: ContactFormData,
  ) => Promise<ApiSuccessResponse | ApiErrorResponse>;
}

// Define the playlist services
export interface PlaylistServices {
  getPlaylistFromUrl: (
    url: string,
  ) => Promise<ApiSuccessResponse<PlaylistResponse> | ApiErrorResponse>;
}

// Export the services
export const contactServices: ContactServices;
export const playlistServices: PlaylistServices;

// Default export
declare const services: {
  contactServices: ContactServices;
  playlistServices: PlaylistServices;
};

export default services;
