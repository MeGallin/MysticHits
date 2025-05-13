/**
 * Audio and video related type definitions
 */

/**
 * Represents an audio or video track in the application
 */
export interface Track {
  /** The title of the track */
  title: string;

  /** The URL to the media file (can be a remote URL or a blob URL) */
  url: string;

  /** MIME type of the media file (e.g., 'audio/mpeg', 'audio/wav', 'video/mp4') */
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
