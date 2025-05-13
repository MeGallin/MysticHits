import React, { forwardRef, useState, useEffect } from 'react';

interface MediaPlayerProps {
  src: string;
  mime: string;
  className?: string;
  // Standard media events
  onEnded?: () => void;
  onError?: (error: any) => void;
  onTimeUpdate?: (event: React.SyntheticEvent<HTMLMediaElement>) => void;
  onLoadedMetadata?: (event: React.SyntheticEvent<HTMLMediaElement>) => void;
  onPlay?: (event: React.SyntheticEvent<HTMLMediaElement>) => void;
  // Optional advanced props
  showPlaylist?: boolean;
  playlist?: Array<{
    title: string;
    url?: string;
    src?: string; // Support both url and src property names
    mime: string;
    artist?: string;
  }>;
  // Control whether to show native controls
  showControls?: boolean;
}

/**
 * Universal MediaPlayer component that handles both audio and video content
 * Renders appropriate UI based on MIME type detection
 * Uses a single video element for compatibility across media types
 * Uses forwardRef to allow parent components to access the media element directly
 */
const MediaPlayer = forwardRef<
  HTMLAudioElement | HTMLVideoElement,
  MediaPlayerProps
>((props, ref) => {
  // Extract all props explicitly to avoid issues with prop spreading
  const {
    src,
    mime = 'audio/mpeg',
    className = '',
    playlist = [],
    showPlaylist = false,
    onEnded,
    onError,
    onTimeUpdate,
    onLoadedMetadata,
    onPlay,
  } = props;

  // All hooks must be called unconditionally at the top level
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset error state when src changes
  useEffect(() => {
    if (src) {
      setHasError(false);
      setErrorMessage('');
      setIsLoading(true);
    }
  }, [src]);

  // Determine media type from MIME string
  const isVideo = mime?.startsWith('video');

  // Format playlist items for display - but safely handle null/undefined
  const formattedPlaylist = Array.isArray(playlist)
    ? playlist.map((item) => ({
        title: item.title || 'Untitled',
        artist: item.artist || '',
        mime: item.mime || 'audio/mpeg',
        url: item.url || item.src || '', // Support both url and src properties
        isVideo: item.mime?.startsWith('video') || false,
      }))
    : [];

  // Handle media errors with better UX
  const handleMediaError = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    console.error('Media error:', e);
    setHasError(true);

    // Try to extract error information
    const target = e.target as HTMLMediaElement;
    if (target.error) {
      switch (target.error.code) {
        case 1: // MEDIA_ERR_ABORTED
          setErrorMessage('Media playback aborted');
          break;
        case 2: // MEDIA_ERR_NETWORK
          setErrorMessage('Network error occurred during download');
          break;
        case 3: // MEDIA_ERR_DECODE
          setErrorMessage('Media decoding error');
          break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          setErrorMessage('Media format not supported by browser');
          break;
        default:
          setErrorMessage('An unknown error occurred');
      }
    }

    // Propagate error to parent component if handler provided
    if (onError) {
      onError(e);
    }
  };

  // Handle successful loading
  const handleLoadedData = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Render nothing if there's no source
  if (!src) {
    return null;
  }

  // Use a single video element for both audio and video content
  return (
    <div
      className={`media-player-container ${
        isVideo ? 'video-mode' : 'audio-mode'
      }`}
      data-player-type={isVideo ? 'video' : 'audio'} // Add a data attribute for debugging
    >
      {/* Media Player Element - with specific styling based on media type */}
      <video
        ref={ref as React.RefObject<HTMLVideoElement>}
        src={src}
        className={`w-full ${
          isVideo
            ? `video-player rounded-md ${className}` // Video styling
            : `audio-player h-12 audio-player-style ${className}` // Audio-only styling
        }`}
        style={{
          objectFit: isVideo ? 'contain' : 'none', // Set proper object-fit for video content
          display: isVideo ? 'block' : 'none', // Hide audio element completely, we'll use our custom UI
          height: isVideo ? 'auto' : '0', // Force height for audio mode
          minHeight: isVideo ? '200px' : '0', // Set minimum height based on content type
        }}
        controls={props.showControls !== false}
        onError={handleMediaError}
        onLoadedData={handleLoadedData}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={onPlay}
        onEnded={onEnded}
      />

      {/* Error Message Display */}
      {hasError && (
        <div className="bg-red-500/20 border border-red-600/30 text-white p-2 rounded mt-1 text-xs">
          <p className="font-medium">Playback Error: {errorMessage}</p>
          <p>Please try a different file or format.</p>
        </div>
      )}

      {/* Optional playlist display when showPlaylist is true */}
      {showPlaylist && formattedPlaylist.length > 0 && (
        <div className="playlist-container mt-4 bg-gray-800/30 rounded p-2">
          <h3 className="text-sm font-medium mb-2">Playlist</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {formattedPlaylist.map((item, index) => (
              <div
                key={`playlist-${index}`}
                className="text-xs py-1 px-2 hover:bg-white/10 rounded cursor-pointer flex items-center"
              >
                <span className="mr-2 text-gray-400">{index + 1}.</span>
                <span className="truncate">{item.title}</span>
                {item.artist && (
                  <span className="text-gray-400 mx-1">• {item.artist}</span>
                )}
                {item.isVideo && (
                  <span className="ml-auto bg-pink-500 text-xs px-1 rounded">
                    Video
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

// Add display name for debugging purposes
MediaPlayer.displayName = 'MediaPlayer';

export default MediaPlayer;
