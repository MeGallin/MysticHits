/**
 * Authentication utilities and event management
 * 
 * This file provides utilities for managing authentication state
 * and broadcasting authentication events to components.
 */

// Event names
export const AUTH_EVENTS = {
  LOGIN: 'auth:login',
  LOGOUT: 'auth:logout'
};

/**
 * Check if user is authenticated based on token in localStorage
 */
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
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