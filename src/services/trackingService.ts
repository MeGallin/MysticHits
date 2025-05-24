import axios from 'axios';
import { handleApiError } from './apiUtils';
import {
  getCurrentDeviceType,
  type DeviceType,
} from '../utils/deviceDetection';

// API base URL from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Interface for play event payload
export interface PlayEventPayload {
  trackUrl: string;
  title?: string;
  duration?: number;
  deviceType?: DeviceType;
}

// Queue for storing events when offline
let offlinePlayEvents: PlayEventPayload[] = [];
let isRetrying = false;

// Get authentication headers - retrieve token at call time, not initialization time
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    withCredentials: true, // Include credentials for cross-origin requests
  };
};

/**
 * Log a track play event
 * @param payload Play event data containing trackUrl, title, and duration
 * @returns Promise that resolves when event is logged or queued
 */
export const logPlay = async (payload: PlayEventPayload): Promise<void> => {
  try {
    // Check if we are authenticated before making the request
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Not authenticated, adding play event to queue');
      offlinePlayEvents.push(payload);
      return;
    }

    // Enhance payload with device type if not provided
    const enhancedPayload = {
      ...payload,
      deviceType: payload.deviceType || getCurrentDeviceType(),
    };

    // Attempt to send the event immediately
    await axios.post(
      `${API_BASE_URL}/playlist/plays`,
      enhancedPayload,
      getAuthHeaders(),
    );
    console.debug('Play event logged successfully', enhancedPayload);
  } catch (error) {
    console.warn('Failed to log play event, adding to queue', error);

    // Enhance payload with device type before adding to queue
    const enhancedPayload = {
      ...payload,
      deviceType: payload.deviceType || getCurrentDeviceType(),
    };

    // Add to offline queue
    offlinePlayEvents.push(enhancedPayload);

    // If we're not already retrying events and have some queued
    if (!isRetrying && offlinePlayEvents.length > 0) {
      retryQueuedEvents();
    }
  }
};

/**
 * Attempt to send queued events
 * Will retry up to 2 times with increasing delays
 */
const retryQueuedEvents = async (): Promise<void> => {
  if (offlinePlayEvents.length === 0 || isRetrying) return;

  // Check if we are authenticated before retrying
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('Not authenticated, postponing retry of play events');
    isRetrying = false;
    return;
  }

  isRetrying = true;
  let retryCount = 0;
  const maxRetries = 2;

  const attemptSend = async () => {
    if (offlinePlayEvents.length === 0) {
      isRetrying = false;
      return;
    }

    if (retryCount >= maxRetries) {
      // Give up after max retries
      console.warn(
        `Gave up retrying ${offlinePlayEvents.length} play events after ${maxRetries} attempts`,
      );
      isRetrying = false;
      return;
    }

    try {
      // Try to send the first event in the queue
      const event = offlinePlayEvents[0];
      await axios.post(
        `${API_BASE_URL}/playlist/plays`,
        event,
        getAuthHeaders(),
      );

      // If successful, remove from queue
      offlinePlayEvents.shift();
      console.debug('Successfully sent queued play event', event);

      // Continue with any remaining events
      if (offlinePlayEvents.length > 0) {
        await attemptSend();
      } else {
        isRetrying = false;
      }
    } catch (error) {
      // Increment retry count and try again after delay
      retryCount++;
      const delay = retryCount * 5000; // 5s, then 10s

      console.debug(
        `Retry ${retryCount} failed, will retry again in ${delay}ms`,
      );
      setTimeout(attemptSend, delay);
    }
  };

  // Start the retry process
  await attemptSend();
};

/**
 * Get the current count of queued events
 * Useful for diagnostics or UI indicators
 */
export const getQueuedEventCount = (): number => {
  return offlinePlayEvents.length;
};

/**
 * Clear the event queue
 * Useful for testing or user-initiated clean up
 */
export const clearEventQueue = (): void => {
  offlinePlayEvents = [];
};

export default {
  logPlay,
  getQueuedEventCount,
  clearEventQueue,
};
