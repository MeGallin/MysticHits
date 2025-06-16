import React, { forwardRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import './MediaPlayer.css';

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
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenHint, setShowFullscreenHint] = useState(false);
  const [deviceOrientation, setDeviceOrientation] = useState<
    'portrait' | 'landscape'
  >('portrait');

  // Reset error state when src changes
  useEffect(() => {
    if (src) {
      setHasError(false);
      setErrorMessage('');
    }
  }, [src]);

  // Determine media type from MIME string
  const isVideo = mime?.startsWith('video');

  // Simplified download prevention handlers
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.fullscreen-button')) {
      e.preventDefault();
    }
  }, []);

  // Optimized mobile device detection - memoized to prevent re-calculation
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || ('ontouchstart' in window && window.innerWidth <= 768);
  }, []);

  // Device orientation detection
  useEffect(() => {
    const updateOrientation = () => {
      if (typeof window !== 'undefined') {
        const orientation =
          window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        setDeviceOrientation(orientation);
      }
    };

    // Initial orientation check
    updateOrientation();

    // Listen for orientation changes
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  // Simplified fullscreen functionality
  const toggleFullscreen = useCallback(async () => {
    const videoElement = ref && 'current' in ref ? ref.current : null;
    if (!videoElement || !isVideo) return;

    try {
      if (!isFullscreen) {
        // Enter fullscreen with proper mobile support
        if (videoElement.requestFullscreen) {
          await videoElement.requestFullscreen();
        } else if ((videoElement as any).webkitRequestFullscreen) {
          await (videoElement as any).webkitRequestFullscreen();
        } else if ((videoElement as any).webkitEnterFullscreen) {
          // iOS Safari specific
          (videoElement as any).webkitEnterFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  }, [isFullscreen, isVideo, ref]);

  // Simplified fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).webkitDisplayingFullscreen
      );
      setIsFullscreen(isCurrentlyFullscreen);

      if (isCurrentlyFullscreen && isMobile) {
        setShowFullscreenHint(true);
        setTimeout(() => setShowFullscreenHint(false), 3000);
      } else {
        setShowFullscreenHint(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitendfullscreen', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitendfullscreen', handleFullscreenChange);
    };
  }, [isMobile]);

  // Simplified mobile video controls - rely on native behavior
  useEffect(() => {
    if (!isVideo || !isMobile) return;

    const videoElement = ref && 'current' in ref ? ref.current : null;
    if (!videoElement) return;

    // Simple mobile-friendly controls setup
    videoElement.setAttribute('playsinline', 'true');
    videoElement.setAttribute('controls', 'true');
    
    // iOS Safari specific optimizations
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      videoElement.setAttribute('webkit-playsinline', 'true');
    }
    
    return () => {
      // Minimal cleanup
      if (videoElement) {
        videoElement.removeAttribute('webkit-playsinline');
      }
    };
  }, [isVideo, isMobile, ref]);

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
    setHasError(false);
  };

  // Render nothing if there's no source
  if (!src) {
    return null;
  }

  // Use a single video element for both audio and video content
  return (
    <div
      className={`media-player-container relative ${
        isVideo ? 'video-mode' : 'audio-mode'
      }`}
      data-player-type={isVideo ? 'video' : 'audio'} // Add a data attribute for debugging
      onContextMenu={handleContextMenu}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation',
        userSelect: 'none',
      }}
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
          // Enhanced mobile protection
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          msUserSelect: 'none',
          touchAction: 'manipulation',
        }}
        controls={props.showControls !== false}
        controlsList="nodownload noremoteplaybook"
        disablePictureInPicture
        playsInline
        preload="metadata"
        onContextMenu={handleContextMenu}
        onError={handleMediaError}
        onLoadedData={handleLoadedData}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={onPlay}
        onEnded={onEnded}
      />


      {/* Fullscreen Toggle Button - Only show for videos */}
      {isVideo && (
        <button
          onClick={toggleFullscreen}
          className={`fullscreen-button absolute top-3 right-3 ${
            isFullscreen
              ? 'bg-black/80 hover:bg-black/90 text-white border-2 border-white/50 opacity-90 hover:opacity-100'
              : isMobile
              ? 'bg-black/10 hover:bg-black/30 text-white/60 hover:text-white/80 opacity-40 hover:opacity-70'
              : 'bg-black/20 hover:bg-black/40 text-white/80 hover:text-white opacity-60 hover:opacity-100'
          } rounded-lg backdrop-blur-sm transition-all duration-300 z-20 flex items-center justify-center ${
            isMobile
              ? deviceOrientation === 'portrait'
                ? 'p-3 min-w-[52px] min-h-[52px]'
                : 'p-2 min-w-[44px] min-h-[44px]'
              : 'p-2 min-w-[44px] min-h-[44px]'
          } ${isFullscreen && isMobile ? 'scale-110 shadow-lg' : ''}`}
          aria-label={
            isFullscreen ? 'Exit Fullscreen (Tap to Exit)' : 'Enter Fullscreen'
          }
          title={
            isFullscreen ? 'Exit Fullscreen (Tap to Exit)' : 'Enter Fullscreen'
          }
        >
          {isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </button>
      )}

      {/* Mobile Fullscreen Exit Hint - Only show briefly when entering fullscreen on mobile */}
      {isVideo && showFullscreenHint && isMobile && (
        <div className="mobile-fullscreen-hint absolute top-16 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm border border-white/30 z-30 pointer-events-none">
          <div className="flex items-center space-x-2">
            <Minimize className="h-4 w-4" />
            <span>
              Tap video to show controls or use exit button
            </span>
          </div>
        </div>
      )}

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
