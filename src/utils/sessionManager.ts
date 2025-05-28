/**
 * Session Manager for Music Player Analytics
 * Handles session tracking, metadata extraction, and network detection
 */

// Generate a unique session ID
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Session state management
class SessionManager {
  private sessionId: string;
  private sessionStartTime: Date;
  private trackPosition: number = 0;
  private sessionTracks: string[] = [];

  constructor() {
    this.sessionId = generateSessionId();
    this.sessionStartTime = new Date();
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getSessionPosition(): number {
    return this.trackPosition;
  }

  addTrack(trackUrl: string): number {
    if (!this.sessionTracks.includes(trackUrl)) {
      this.sessionTracks.push(trackUrl);
    }
    this.trackPosition++;
    return this.trackPosition;
  }

  getPreviousTrack(): string | undefined {
    const currentIndex = this.sessionTracks.length - 1;
    return currentIndex > 0 ? this.sessionTracks[currentIndex - 1] : undefined;
  }

  getNextTrack(tracks: any[], currentIndex: number): string | undefined {
    return currentIndex < tracks.length - 1 ? tracks[currentIndex + 1]?.url : undefined;
  }

  resetSession(): void {
    this.sessionId = generateSessionId();
    this.sessionStartTime = new Date();
    this.trackPosition = 0;
    this.sessionTracks = [];
  }

  getSessionDuration(): number {
    return Math.floor((Date.now() - this.sessionStartTime.getTime()) / 1000);
  }
}

// Global session manager instance
export const sessionManager = new SessionManager();

/**
 * Extract metadata from track information
 */
export interface TrackMetadata {
  artist?: string;
  album?: string;
  genre?: string;
  year?: number;
}

export const extractMetadata = (track: any): TrackMetadata => {
  const metadata: TrackMetadata = {};

  // Extract from track object if available
  if (track.artist) metadata.artist = track.artist;
  if (track.album) metadata.album = track.album;
  if (track.genre) metadata.genre = track.genre;
  if (track.year) metadata.year = track.year;

  // Try to extract from title if metadata is missing
  if (!metadata.artist && track.title) {
    const title = track.title.toLowerCase();
    
    // Common patterns: "Artist - Title", "Artist: Title"
    const artistPattern = /^([^-:]+)[\s]*[-:]\s*(.+)$/;
    const match = title.match(artistPattern);
    if (match) {
      metadata.artist = match[1].trim();
    }
  }

  // Extract year from title if available
  if (!metadata.year && track.title) {
    const yearPattern = /\b(19|20)\d{2}\b/;
    const yearMatch = track.title.match(yearPattern);
    if (yearMatch) {
      metadata.year = parseInt(yearMatch[0]);
    }
  }

  // Set default album if not available
  if (!metadata.album) {
    metadata.album = 'Unknown Album';
  }

  return metadata;
};

/**
 * Detect network type (simplified detection)
 */
export const detectNetworkType = (): 'wifi' | '4g' | '3g' | '2g' | 'ethernet' | 'unknown' => {
  if (!('connection' in navigator)) {
    return 'unknown';
  }

  const connection = (navigator as any).connection;
  
  if (!connection) {
    return 'unknown';
  }

  // Map effective connection types
  switch (connection.effectiveType) {
    case '4g':
      return '4g';
    case '3g':
      return '3g';
    case '2g':
      return '2g';
    case 'slow-2g':
      return '2g';
    default:
      // Check if it's likely ethernet (high speed and not mobile)
      if (connection.downlink > 10 && !('ontouchstart' in window)) {
        return 'ethernet';
      }
      return 'wifi';
  }
};

/**
 * Determine playback source context
 */
export const determinePlaybackSource = (
  isShuffled: boolean,
  isRepeating: boolean,
  manualSelection: boolean = false
): 'playlist' | 'search' | 'recommendation' | 'repeat' | 'shuffle' | 'direct' => {
  if (isRepeating) return 'repeat';
  if (isShuffled) return 'shuffle';
  if (manualSelection) return 'direct';
  return 'playlist';
};

/**
 * Quality metrics tracker
 */
export class QualityTracker {
  private bufferCount: number = 0;
  private qualityDrops: number = 0;
  private audioElement: HTMLAudioElement | null = null;

  setAudioElement(audio: HTMLAudioElement): void {
    if (this.audioElement) {
      this.removeEventListeners();
    }

    this.audioElement = audio;
    this.addEventListeners();
  }

  private addEventListeners(): void {
    if (!this.audioElement) return;

    this.audioElement.addEventListener('waiting', this.handleBuffering);
    this.audioElement.addEventListener('stalled', this.handleQualityDrop);
    this.audioElement.addEventListener('error', this.handleQualityDrop);
  }

  private removeEventListeners(): void {
    if (!this.audioElement) return;

    this.audioElement.removeEventListener('waiting', this.handleBuffering);
    this.audioElement.removeEventListener('stalled', this.handleQualityDrop);
    this.audioElement.removeEventListener('error', this.handleQualityDrop);
  }

  private handleBuffering = (): void => {
    this.bufferCount++;
    console.debug('Buffer event detected, count:', this.bufferCount);
  };

  private handleQualityDrop = (): void => {
    this.qualityDrops++;
    console.debug('Quality drop detected, count:', this.qualityDrops);
  };

  getMetrics(): { bufferCount: number; qualityDrops: number } {
    return {
      bufferCount: this.bufferCount,
      qualityDrops: this.qualityDrops,
    };
  }

  reset(): void {
    this.bufferCount = 0;
    this.qualityDrops = 0;
  }

  cleanup(): void {
    this.removeEventListeners();
    this.audioElement = null;
  }
}

// Global quality tracker instance
export const qualityTracker = new QualityTracker();
