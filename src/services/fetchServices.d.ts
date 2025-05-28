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

// Define the auth data structures
interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

interface UserRegistrationData {
  email: string;
  password: string;
  name?: string;
}

// Define the authentication services
export interface AuthServices {
  loginUser: (
    email: string,
    password: string,
  ) => Promise<ApiSuccessResponse<LoginResponse> | ApiErrorResponse>;

  logoutUser: () => Promise<ApiSuccessResponse | ApiErrorResponse>;

  registerUser: (
    userData: UserRegistrationData,
  ) => Promise<ApiSuccessResponse | ApiErrorResponse>;

  requestPasswordReset: (
    email: string,
  ) => Promise<ApiSuccessResponse | ApiErrorResponse>;

  resetPassword: (
    token: string,
    newPassword: string,
  ) => Promise<ApiSuccessResponse | ApiErrorResponse>;
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

// Define the hits/visitor count services
export interface HitsServices {
  getPageHits: () => Promise<
    ApiSuccessResponse<{ hitCount: number }> | ApiErrorResponse
  >;
}

// Define admin data structures
interface User {
  _id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
}

// Define admin services
export interface AdminServices {
  getUsers(): Promise<ApiSuccessResponse<User[]> | ApiErrorResponse>;
  deleteUser(userId: string): Promise<ApiSuccessResponse | ApiErrorResponse>;
}

// Export individual auth functions
export function loginUser(
  email: string,
  password: string,
): Promise<ApiSuccessResponse<LoginResponse> | ApiErrorResponse>;

export function logoutUser(): Promise<ApiSuccessResponse | ApiErrorResponse>;

export function registerUser(
  userData: UserRegistrationData,
): Promise<ApiSuccessResponse | ApiErrorResponse>;

export function requestPasswordReset(
  email: string,
): Promise<ApiSuccessResponse | ApiErrorResponse>;

export function resetPassword(
  token: string,
  newPassword: string,
): Promise<ApiSuccessResponse | ApiErrorResponse>;

// Export the services
export const authServices: AuthServices;
export const contactServices: ContactServices;
export const playlistServices: PlaylistServices;
export const hitsServices: HitsServices;
export const getUsers: AdminServices['getUsers'];
export const deleteUser: AdminServices['deleteUser'];

// Default export
declare const services: {
  authServices: AuthServices;
  contactServices: ContactServices;
  playlistServices: PlaylistServices;
  hitsServices: HitsServices;
};

export default services;
