import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { jwtDecode } from 'jwt-decode';
import { broadcastLogin, broadcastLogout } from '../utils/authUtils';
import { getDefaultStore } from 'jotai';
import axios from 'axios';

// Define the shape of the JWT payload
interface JwtPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
  exp: number;
}

// Define the user type
interface User {
  id: string;
  email: string;
}

/**
 * Basic validation to check if a string looks like a JWT token
 * This helps prevent decoding errors from malformed tokens
 */
function isValidTokenFormat(token: string): boolean {
  // JWT tokens should have 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  // Each part should be base64url encoded
  try {
    // Just check if we can decode the parts
    return true;
  } catch (e) {
    return false;
  }
}

// Atoms for auth state
export const tokenAtom = atomWithStorage<string | null>('token', null);
export const isAuthenticatedAtom = atom<boolean>(false);
export const isAdminAtom = atom<boolean>(false);
export const userAtom = atom<User | null>(null);

// Helper function to set auth token in axios defaults
const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Derived atom to check if token is valid and set auth state
export const authStateAtom = atom(
  (get) => {
    return {
      isAuthenticated: get(isAuthenticatedAtom),
      isAdmin: get(isAdminAtom),
      user: get(userAtom),
      token: get(tokenAtom),
    };
  },
  (get, set, newToken: string | null) => {
    // If we're logging out (token is null)
    if (!newToken) {
      set(tokenAtom, null);
      set(isAuthenticatedAtom, false);
      set(isAdminAtom, false);
      set(userAtom, null);
      setAuthToken(null); // Clear axios auth header
      broadcastLogout();
      return;
    }

    // Validate token format before trying to decode
    if (!isValidTokenFormat(newToken)) {
      console.error('Invalid token format');
      set(tokenAtom, null);
      set(isAuthenticatedAtom, false);
      set(isAdminAtom, false);
      set(userAtom, null);
      return;
    }

    // We're logging in with a new token
    try {
      // Decode the token
      const decodedToken = jwtDecode<JwtPayload>(newToken);

      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        // Token expired
        set(tokenAtom, null);
        set(isAuthenticatedAtom, false);
        set(isAdminAtom, false);
        set(userAtom, null);
        return;
      }

      // Token is valid, set auth state
      set(tokenAtom, newToken);
      set(isAuthenticatedAtom, true);
      set(isAdminAtom, !!decodedToken.isAdmin);
      set(userAtom, {
        id: decodedToken.userId,
        email: decodedToken.email,
      });
      setAuthToken(newToken); // Set axios auth header

      // Always broadcast login event for any non-Jotai components
      broadcastLogin();
    } catch (error) {
      // Invalid token
      console.error('Error decoding token:', error);
      set(tokenAtom, null);
      set(isAuthenticatedAtom, false);
      set(isAdminAtom, false);
      set(userAtom, null);
    }
  },
);

// Get the default Jotai store to use outside of React components
const store = getDefaultStore();

// Helper functions for login/logout
export function login(token: string) {
  if (!token) {
    console.error('Attempted to login with null/empty token');
    return;
  }

  try {
    // Update auth state using the default store
    store.set(authStateAtom, token);

    // Explicitly broadcast login event again to ensure UI updates
    // This ensures navigation updates even if the Jotai store update doesn't trigger a re-render
    setTimeout(() => {
      broadcastLogin();
    }, 0);
  } catch (error) {
    console.error('Error during login:', error);
  }
}

export function logout() {
  try {
    // Clear auth state using the default store
    store.set(authStateAtom, null);

    // Explicitly broadcast logout event again to ensure UI updates
    setTimeout(() => {
      broadcastLogout();
    }, 0);
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

// Initialize authentication from stored token
export function initializeAuth() {
  try {
    const storedToken = localStorage.getItem('token');

    // Only proceed if we have a token and it's not empty
    if (storedToken && storedToken.trim() !== '') {
      store.set(authStateAtom, storedToken);
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
  }
}
