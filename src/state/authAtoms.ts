import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { jwtDecode } from 'jwt-decode';
import { broadcastLogin, broadcastLogout } from '../utils/authUtils';
import { getDefaultStore } from 'jotai';
import axios from 'axios';
import { inspectToken } from '../utils/tokenDebugger';

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
  // Check if token is undefined, null, or empty
  if (!token || typeof token !== 'string') {
    console.debug(
      'Token validation failed: token is null, undefined, or not a string',
    );
    return false;
  }

  try {
    // Clean any quotes and whitespace that might have been accidentally included
    const cleanToken = token.replace(/^["']|["']$/g, '').trim();

    // Handle any unusual characters that might be in the token
    // Some JWT implementations add padding characters that should be removed
    const normalizedToken = cleanToken.replace(/=+$/, '');

    // JWT tokens should have 3 parts separated by dots
    const parts = normalizedToken.split('.');
    if (parts.length !== 3) {
      console.debug(
        `Token validation failed: expected 3 parts, got ${parts.length}`,
      );
      return false;
    }

    // Check that each part is base64url encoded
    // Base64url uses only alphanumeric characters plus "-" and "_"
    const base64UrlRegex = /^[A-Za-z0-9\-_]*$/;

    // Check header (part 0)
    if (!base64UrlRegex.test(parts[0])) {
      console.debug('Token validation failed: header part failed regex test');
      // Log the first invalid character found
      const invalidChar = Array.from(parts[0]).find(
        (char) => !base64UrlRegex.test(char),
      );
      console.debug(
        `First invalid char in header: ${JSON.stringify(invalidChar)}`,
      );
      return false;
    }

    // Check payload (part 1)
    if (!base64UrlRegex.test(parts[1])) {
      console.debug('Token validation failed: payload part failed regex test');
      // Log the first invalid character found
      const invalidChar = Array.from(parts[1]).find(
        (char) => !base64UrlRegex.test(char),
      );
      console.debug(
        `First invalid char in payload: ${JSON.stringify(invalidChar)}`,
      );
      return false;
    }

    // Check signature (part 2)
    if (!base64UrlRegex.test(parts[2])) {
      console.debug(
        'Token validation failed: signature part failed regex test',
      );
      // Log the first invalid character found
      const invalidChar = Array.from(parts[2]).find(
        (char) => !base64UrlRegex.test(char),
      );
      console.debug(
        `First invalid char in signature: ${JSON.stringify(invalidChar)}`,
      );
      return false;
    }

    return true;
  } catch (e) {
    console.debug('Token validation failed with exception:', e);
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

    // Inspect original token
    inspectToken(newToken, 'authStateAtom - before cleaning');

    // First, try to clean the token of any potential quotes and whitespace
    let cleanedToken = newToken;
    if (newToken.startsWith('"') && newToken.endsWith('"')) {
      cleanedToken = newToken.substring(1, newToken.length - 1);
      console.debug('Cleaned quotes from token in authStateAtom');
    }
    cleanedToken = cleanedToken.trim();

    // Inspect cleaned token
    inspectToken(cleanedToken, 'authStateAtom - after cleaning');

    // Validate token format before trying to decode
    if (!isValidTokenFormat(cleanedToken)) {
      console.error('Invalid token format');
      set(tokenAtom, null);
      set(isAuthenticatedAtom, false);
      set(isAdminAtom, false);
      set(userAtom, null);
      return;
    }

    // We're logging in with a new token
    try {
      // Decode the cleaned token
      const decodedToken = jwtDecode<JwtPayload>(cleanedToken);

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
      set(tokenAtom, cleanedToken);
      set(isAuthenticatedAtom, true);
      set(isAdminAtom, !!decodedToken.isAdmin);
      set(userAtom, {
        id: decodedToken.userId,
        email: decodedToken.email,
      });
      setAuthToken(cleanedToken); // Set axios auth header

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
    // Check if there's a token in localStorage
    const storedToken = localStorage.getItem('token');

    // Log for debugging
    console.debug('Initializing auth, token exists:', !!storedToken);

    if (storedToken) {
      // Use the token debugger to inspect the token in detail
      inspectToken(storedToken, 'initializeAuth');
    }

    // Only proceed if we have a token and it's not empty
    if (storedToken && storedToken.trim() !== '') {
      // Check if the token has quotes around it and fix if needed
      let tokenToUse = storedToken;
      if (storedToken.startsWith('"') && storedToken.endsWith('"')) {
        // Remove quotes and update localStorage
        tokenToUse = storedToken.substring(1, storedToken.length - 1);
        localStorage.setItem('token', tokenToUse);
        console.debug('Fixed quoted token in initializeAuth');
      }

      // Remove any additional whitespace
      tokenToUse = tokenToUse.trim();

      if (tokenToUse !== storedToken) {
        localStorage.setItem('token', tokenToUse);
      }

      // Check token format before attempting to use it
      if (isValidTokenFormat(tokenToUse)) {
        // Update auth state using the default store
        store.set(authStateAtom, tokenToUse);
      } else {
        console.error('Token format validation failed during initialization');
        console.debug(
          'Token preview:',
          tokenToUse.substring(0, Math.min(10, tokenToUse.length)) + '...',
        );
        // Clear invalid token
        localStorage.removeItem('token');
      }
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
  }
}
