/**
 * Authentication reset utility
 *
 * This file provides functionality to completely reset the authentication state
 * which can be useful to recover from corrupted tokens or other auth issues.
 */

import axios from 'axios';
import { debugTokenFromStorage } from './tokenDebugger';

/**
 * Complete reset of all authentication data and state
 * Use this as a last resort when authentication is broken and cannot be recovered
 */
export function resetAuthentication(): void {
  console.info('Performing complete authentication reset');

  try {
    // Debug current token state
    debugTokenFromStorage();

    // Clear localStorage token
    localStorage.removeItem('token');
    console.debug('Cleared token from localStorage');

    // Clear any other auth-related storage
    sessionStorage.removeItem('auth');
    localStorage.removeItem('user');

    // Clear axios default headers
    delete axios.defaults.headers.common['Authorization'];
    console.debug('Cleared Authorization header from axios');

    // Force reload the page to reset all in-memory state
    window.location.reload();
  } catch (error) {
    console.error('Error during authentication reset:', error);
  }
}

/**
 * Add a reset button to the page for development purposes
 * This should NOT be used in production!
 */
export function addAuthResetButton(): void {
  // Check for development mode using window location
  // This is a simple heuristic - localhost or 127.0.0.1 are likely dev environments
  const isDev =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.local');

  if (isDev) {
    const button = document.createElement('button');
    button.innerText = 'Reset Auth (Dev Only)';
    button.style.position = 'fixed';
    button.style.bottom = '10px';
    button.style.right = '10px';
    button.style.zIndex = '9999';
    button.style.background = '#ff4757';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.padding = '8px 12px';
    button.style.cursor = 'pointer';
    button.style.fontWeight = 'bold';
    button.style.opacity = '0.7';

    button.addEventListener('click', () => {
      if (
        confirm(
          'Are you sure you want to reset all authentication state? This will log you out.',
        )
      ) {
        resetAuthentication();
      }
    });

    document.body.appendChild(button);
  }
}
