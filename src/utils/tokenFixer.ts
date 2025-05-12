import axios from 'axios';

/**
 * Utility to check and fix token format issues in localStorage
 *
 * This addresses a common issue where the token might be stored with extra quotes,
 * causing authentication failures when the token is sent to the API.
 */

/**
 * Check if the token in localStorage has extra quotes and fix it
 * @returns {boolean} True if a fix was applied, false otherwise
 */
export function checkAndFixToken(): boolean {
  try {
    // Get the token from localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      return false;
    }

    // First, check for and remove surrounding quotes
    let fixedToken = token;
    let wasFixed = false;

    // Check if the token starts with a quote
    if (token.startsWith('"') && token.endsWith('"')) {
      // Remove the quotes
      fixedToken = token.substring(1, token.length - 1);
      wasFixed = true;
    }

    // Clean up any extra whitespace
    const trimmedToken = fixedToken.trim();
    if (trimmedToken !== fixedToken) {
      fixedToken = trimmedToken;
      wasFixed = true;
    }

    if (wasFixed) {
      // Store the fixed token back in localStorage
      localStorage.setItem('token', fixedToken);
      console.debug('Token was fixed in checkAndFixToken');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking/fixing token:', error);
    return false;
  }
}

/**
 * Apply the token fix and update axios headers
 * @returns {string|null} The fixed token or null if no token or no fix needed
 */
export function fixTokenAndUpdateHeaders(): string | null {
  try {
    const wasFixed = checkAndFixToken();

    // Get the (potentially fixed) token
    const token = localStorage.getItem('token');

    if (!token) {
      return null;
    }

    // If the token was fixed or we want to ensure headers are set correctly
    if (wasFixed) {
      // Update axios headers with the fixed token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return token;
  } catch (error) {
    console.error('Error fixing token and updating headers:', error);
    return null;
  }
}
