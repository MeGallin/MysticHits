import axios from 'axios';
import { handleApiError } from './apiUtils';
import {
  getCurrentDeviceType,
  type DeviceType,
} from '../utils/deviceDetection';
import {
  sessionManager,
  extractMetadata,
  detectNetworkType,
  determinePlaybackSource,
  qualityTracker,
  type TrackMetadata,
} from '../utils/sessionManager';

// API base URL from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Enhanced interface for play event payload with comprehensive analytics
export interface PlayEventPayload {
  trackUrl: string;
  title?: string;
  duration?: number;
  deviceType?: DeviceType;
  
  // Enhanced analytics fields
  artist?: string;
  album?: string;
  genre?: string;
  year?: number;
  
  // Playback context
  source?: 'playlist' | 'search' | 'recommendation' | 'repeat' | 'shuffle' | 'direct';
  playlistId?: string;
  previousTrack?: string;
  nextTrack?: string;
  
  // Session data
  sessionId?: string;
  sessionPosition?: number;
  
  // Quality metrics
  networkType?: 'wifi' | '4g' | '3g' | '2g' | 'ethernet' | 'unknown';
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
 * Log a track play event with comprehensive analytics
 * @param payload Play event data containing trackUrl, title, and duration
 * @param context Additional context for enhanced analytics
 * @returns Promise that resolves when event is logged or queued
 */
export const logPlay = async (
  payload: PlayEventPayload,
  context?: {
    track?: any;
    tracks?: any[];
    currentIndex?: number;
    isShuffled?: boolean;
    isRepeating?: boolean;
    manualSelection?: boolean;
    playlistId?: string;
  }
): Promise<string | void> => {
  try {
    // Check if we are authenticated before making the request
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Not authenticated, adding play event to queue');
      offlinePlayEvents.push(payload);
      return;
    }

    // Extract metadata from track if available
    const metadata = context?.track ? extractMetadata(context.track) : {};
    
    // Get session information
    const sessionId = sessionManager.getSessionId();
    const sessionPosition = sessionManager.addTrack(payload.trackUrl);
    
    // Determine playback context
    const source = determinePlaybackSource(
      context?.isShuffled || false,
      context?.isRepeating || false,
      context?.manualSelection || false
    );
    
    // Get network type
    const networkType = detectNetworkType();
    
    // Get previous and next tracks
    const previousTrack = sessionManager.getPreviousTrack();
    const nextTrack = context?.tracks && context?.currentIndex !== undefined 
      ? sessionManager.getNextTrack(context.tracks, context.currentIndex)
      : undefined;

    // Enhance payload with comprehensive analytics data
    const enhancedPayload = {
      ...payload,
      deviceType: payload.deviceType || getCurrentDeviceType(),
      
      // Enhanced analytics fields
      ...metadata,
      
      // Playback context
      source,
      playlistId: context?.playlistId,
      previousTrack,
      nextTrack,
      
      // Session data
      sessionId,
      sessionPosition,
      
      // Quality metrics
      networkType,
    };

    // Attempt to send the event immediately
    const response = await axios.post(
      `${API_BASE_URL}/playlist/plays`,
      enhancedPayload,
      getAuthHeaders(),
    );
    
    console.debug('Enhanced play event logged successfully', enhancedPayload);
    return response.data?.playEventId; // Return the playEventId for tracking updates
  } catch (error) {
    console.warn('Failed to log play event, adding to queue', error);

    // Add enhanced payload to queue
    const enhancedPayload = {
      ...payload,
      deviceType: payload.deviceType || getCurrentDeviceType(),
    };

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

/**
 * Update a play event with progress/completion data
 * @param playEventId The ID of the play event to update
 * @param updates Update data for the play event
 */
export const updatePlayEvent = async (
  playEventId: string,
  updates: {
    listenDuration?: number;
    completed?: boolean;
    skipped?: boolean;
    skipTime?: number;
    repeated?: boolean;
    liked?: boolean;
    shared?: boolean;
    bufferCount?: number;
    qualityDrops?: number;
    endedAt?: string;
  }
): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Not authenticated, cannot update play event');
      return;
    }

    await axios.put(
      `${API_BASE_URL}/playlist/plays/${playEventId}`,
      updates,
      getAuthHeaders(),
    );
    
    console.debug('Play event updated successfully', { playEventId, updates });
  } catch (error) {
    console.warn('Failed to update play event', error);
  }
};

/**
 * Log user interaction with a track (like, share, repeat)
 * @param trackUrl The URL of the track
 * @param interactionType Type of interaction
 * @param value Boolean value for the interaction
 */
export const logInteraction = async (
  trackUrl: string,
  interactionType: 'like' | 'share' | 'repeat',
  value: boolean
): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Not authenticated, cannot log interaction');
      return;
    }

    await axios.post(
      `${API_BASE_URL}/playlist/interactions`,
      {
        trackUrl,
        interactionType,
        value,
      },
      getAuthHeaders(),
    );
    
    console.debug('Interaction logged successfully', { trackUrl, interactionType, value });
  } catch (error) {
    console.warn('Failed to log interaction', error);
  }
};

/**
 * Batch update multiple play events
 * @param updates Array of play event updates
 */
export const batchUpdatePlayEvents = async (
  updates: Array<{
    playEventId: string;
    updateData: {
      listenDuration?: number;
      completed?: boolean;
      skipped?: boolean;
      skipTime?: number;
      repeated?: boolean;
      liked?: boolean;
      shared?: boolean;
      bufferCount?: number;
      qualityDrops?: number;
      endedAt?: string;
    };
  }>
): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Not authenticated, cannot batch update play events');
      return;
    }

    await axios.post(
      `${API_BASE_URL}/playlist/plays/batch-update`,
      { updates },
      getAuthHeaders(),
    );
    
    console.debug('Play events batch updated successfully', updates);
  } catch (error) {
    console.warn('Failed to batch update play events', error);
  }
};

/**
 * Reset session (useful when user logs out or starts fresh)
 */
export const resetSession = (): void => {
  sessionManager.resetSession();
  qualityTracker.reset();
  console.debug('Session reset');
};

export default {
  logPlay,
  updatePlayEvent,
  logInteraction,
  batchUpdatePlayEvents,
  getQueuedEventCount,
  clearEventQueue,
  resetSession,
};
