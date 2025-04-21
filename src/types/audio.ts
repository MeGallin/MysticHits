/**
 * Audio-related type definitions
 */

/**
 * Represents an audio track in the application
 */
export interface Track {
  /** The title of the track */
  title: string;

  /** The URL to the audio file (can be a remote URL or a blob URL) */
  url: string;

  /** MIME type of the audio file (e.g., 'audio/mpeg', 'audio/wav') */
  mime: string;

  /** The artist name (optional) */
  artist?: string;

  /** The album name (optional) */
  album?: string;

  /** The duration of the track in seconds (optional) */
  duration?: number;

  /** URL to the album cover image (optional) */
  cover?: string;
}
