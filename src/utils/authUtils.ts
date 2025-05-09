/**
 * Authentication utilities and event management
 *
 * This file provides utilities for managing authentication state
 * and broadcasting authentication events to components.
 */
import { getDefaultStore } from 'jotai';
import { isAuthenticatedAtom, login } from '../state/authAtoms';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { checkAndFixToken } from './tokenFixer';

// Event names
export const AUTH_EVENTS = {
  LOGIN: 'auth:login',
  LOGOUT: 'auth:logout',
  TOKEN_REFRESH: 'auth:token_refresh',
};

// Define the shape of the JWT payload
interface JwtPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
  exp: number;
}

/**
 * Check if user is authenticated by accessing the Jotai store directly
 * This function makes non-React components and utility functions compatible
 * with our Jotai implementation
 */
export const isAuthenticated = (): boolean => {
  // First try to get state from Jotai atom
  try {
    const store = getDefaultStore();
    return store.get(isAuthenticatedAtom);
  } catch (error) {
    // Fallback to localStorage check if Jotai store is not available
    return localStorage.getItem('token') !== null;
  }
};

/**
 * Broadcast login event when user successfully logs in
 */
export const broadcastLogin = (): void => {
  window.dispatchEvent(new Event(AUTH_EVENTS.LOGIN));
};

/**
 * Broadcast logout event when user logs out
 */
export const broadcastLogout = (): void => {
  window.dispatchEvent(new Event(AUTH_EVENTS.LOGOUT));
};

/**
 * Debug function to log token details
 */
export const logTokenDetails = (): void => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.log('DEBUG: No token found in localStorage');
    return;
  }

  console.log('DEBUG: Token exists in localStorage');
  console.log('DEBUG: Token length:', token.length);
  console.log('DEBUG: Token first 10 chars:', token.substring(0, 10) + '...');

  try {
    // Try to decode the token
    const decoded = jwtDecode<JwtPayload>(token);
    console.log('DEBUG: Token decoded successfully');
    console.log('DEBUG: Token payload:', {
      userId: decoded.userId,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
      exp: new Date(decoded.exp * 1000).toISOString(),
      now: new Date().toISOString(),
      isExpired: decoded.exp < Date.now() / 1000,
    });
  } catch (error) {
    console.error('DEBUG: Failed to decode token:', error);
  }

  // Check if token is in Authorization header
  const authHeader = axios.defaults.headers.common['Authorization'];
  console.log(
    'DEBUG: Authorization header:',
    authHeader ? 'exists' : 'missing',
  );
  if (authHeader) {
    console.log(
      'DEBUG: Header matches localStorage token:',
      authHeader === `Bearer ${token}`,
    );
  }
};

/**
 * Check if the current token is valid and not expired
 * If it's expired, attempt to refresh it
 * @returns {boolean} True if token is valid, false otherwise
 */
export const validateToken = (): boolean => {
  // First, check and fix token format if needed
  const wasFixed = checkAndFixToken();
  if (wasFixed) {
    console.log('Token format was fixed during validation');
  }

  // Get the (potentially fixed) token
  const token = localStorage.getItem('token');

  if (!token) {
    console.log('No token found in localStorage');
    return false;
  }

  // Log token details for debugging
  logTokenDetails();

  try {
    // Decode the token
    const decodedToken = jwtDecode<JwtPayload>(token);

    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp < currentTime) {
      console.log('Token is expired, removing from storage');
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      return false;
    }

    // Token is valid
    console.log('Token is valid');

    // Ensure the token is set in axios headers
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Ensured axios Authorization header is set with token');

    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    return false;
  }
};

/**
 * Set the authorization header for all axios requests
 */
export const setAxiosAuthHeader = (): void => {
  // First, check and fix token format if needed
  const wasFixed = checkAndFixToken();
  if (wasFixed) {
    console.log('Token format was fixed before setting axios header');
  }

  // Get the (potentially fixed) token
  const token = localStorage.getItem('token');

  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Set axios Authorization header with token from authUtils');
  } else {
    delete axios.defaults.headers.common['Authorization'];
    console.log('Removed axios Authorization header from authUtils');
  }
};
