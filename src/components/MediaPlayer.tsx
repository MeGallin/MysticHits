import React, { forwardRef, useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [deviceOrientation, setDeviceOrientation] = useState('portrait');
  const [showFullscreenHint, setShowFullscreenHint] = useState(false);

  // Enhanced mobile detection and handling
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent,
        );
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    const checkOrientation = () => {
      if (window.innerHeight > window.innerWidth) {
        setDeviceOrientation('portrait');
      } else {
        setDeviceOrientation('landscape');
      }
    };

    checkMobile();
    checkOrientation();

    const handleResize = () => {
      checkMobile();
      checkOrientation();
    };

    const handleOrientationChange = () => {
      // Small delay to allow for orientation change to complete
      setTimeout(checkOrientation, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

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

  // Download prevention handlers
  const handleContextMenu = (e: React.MouseEvent | React.TouchEvent) => {
    // Allow fullscreen button clicks to pass through
    const target = e.target as HTMLElement;
    if (
      target.closest('button[aria-label*="Fullscreen"]') ||
      target.closest('.fullscreen-button')
    ) {
      return true;
    }

    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Allow fullscreen button touches to pass through
    const target = e.target as HTMLElement;
    if (
      target.closest('button[aria-label*="Fullscreen"]') ||
      target.closest('.fullscreen-button')
    ) {
      return true;
    }

    // Prevent long-press on mobile (context menu)
    if (e.touches.length === 1) {
      // Single touch - prevent long press context menu
      const preventLongPress = setTimeout(() => {
        e.preventDefault();
      }, 500); // Prevent context menu after 500ms

      // Clear timeout if touch ends quickly
      const handleTouchEnd = () => {
        clearTimeout(preventLongPress);
        document.removeEventListener('touchend', handleTouchEnd);
      };
      document.addEventListener('touchend', handleTouchEnd, { once: true });
    } else if (e.touches.length > 1) {
      // Multi-touch - prevent immediately
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Allow fullscreen button touches to pass through
    const target = e.target as HTMLElement;
    if (
      target.closest('button[aria-label*="Fullscreen"]') ||
      target.closest('.fullscreen-button')
    ) {
      return true;
    }

    e.preventDefault();
  };

  const handleSelectStart = (e: React.SyntheticEvent) => {
    e.preventDefault();
    return false;
  };

  // Fullscreen functionality with enhanced mobile support
  const toggleFullscreen = async () => {
    const videoElement = ref && 'current' in ref ? ref.current : null;

    if (!videoElement || !isVideo) return;

    try {
      if (!isFullscreen) {
        // Enter fullscreen - try different methods for mobile compatibility
        if (videoElement.requestFullscreen) {
          await videoElement.requestFullscreen();
        } else if ((videoElement as any).webkitRequestFullscreen) {
          await (videoElement as any).webkitRequestFullscreen();
        } else if ((videoElement as any).webkitEnterFullscreen) {
          // iOS Safari
          (videoElement as any).webkitEnterFullscreen();
        } else if ((videoElement as any).msRequestFullscreen) {
          await (videoElement as any).msRequestFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);

      // Show hint when entering fullscreen on mobile
      if (isCurrentlyFullscreen && isMobile) {
        setShowFullscreenHint(true);
        // Hide hint after 4 seconds
        setTimeout(() => setShowFullscreenHint(false), 4000);
      } else {
        setShowFullscreenHint(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange,
      );
      document.removeEventListener(
        'msfullscreenchange',
        handleFullscreenChange,
      );
    };
  }, []);

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
      className={`media-player-container relative ${
        isVideo ? 'video-mode' : 'audio-mode'
      } ${isMobile ? 'mobile-device' : 'desktop-device'} ${deviceOrientation}`}
      data-player-type={isVideo ? 'video' : 'audio'} // Add a data attribute for debugging
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation',
        // Enhanced mobile protection
        WebkitTapHighlightColor: 'transparent',
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
          minHeight: isVideo
            ? isMobile
              ? deviceOrientation === 'portrait'
                ? '180px'
                : '150px'
              : '200px'
            : '0',
          // Enhanced mobile protection
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          msUserSelect: 'none',
          touchAction: 'manipulation',
        }}
        controls={props.showControls !== false}
        controlsList="nodownload nofullscreen noremoteplaybook"
        disablePictureInPicture
        preload="metadata"
        playsInline // Important for mobile Safari
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onError={handleMediaError}
        onLoadedData={handleLoadedData}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={onPlay}
        onEnded={onEnded}
      />

      {/* Enhanced mobile overlay protection - Only for videos */}
      {isVideo && (
        <div
          className="absolute inset-0"
          style={{
            zIndex: 1,
            pointerEvents: 'none',
            touchAction: 'none',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            // Dynamic clip path based on device and orientation
            clipPath: isMobile
              ? deviceOrientation === 'portrait'
                ? 'polygon(0% 0%, 75% 0%, 75% 25%, 100% 25%, 100% 100%, 0% 100%)'
                : 'polygon(0% 0%, 80% 0%, 80% 20%, 100% 20%, 100% 100%, 0% 100%)'
              : 'polygon(0% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 100%, 0% 100%)',
          }}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
        />
      )}

      {/* Fullscreen Toggle Button - Only show for videos */}
      {isVideo && (
        <button
          onClick={toggleFullscreen}
          className={`fullscreen-button absolute ${
            isMobile
              ? deviceOrientation === 'portrait'
                ? 'top-3 right-3'
                : 'top-2 right-2'
              : 'top-3 right-3'
          } ${
            isFullscreen
              ? 'bg-black/80 hover:bg-black/90 text-white border-2 border-white/50 opacity-90 hover:opacity-100'
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
            <Minimize
              className={`${
                isMobile && deviceOrientation === 'portrait'
                  ? 'h-5 w-5'
                  : 'h-4 w-4'
              }`}
            />
          ) : (
            <Maximize
              className={`${
                isMobile && deviceOrientation === 'portrait'
                  ? 'h-5 w-5'
                  : 'h-4 w-4'
              }`}
            />
          )}
        </button>
      )}

      {/* Mobile Fullscreen Exit Hint - Only show briefly when entering fullscreen on mobile */}
      {isVideo && showFullscreenHint && isMobile && (
        <div className="mobile-fullscreen-hint absolute top-16 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm border border-white/30 z-30 pointer-events-none">
          <div className="flex items-center space-x-2">
            <Minimize className="h-4 w-4" />
            <span>Tap the exit button to leave fullscreen</span>
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
