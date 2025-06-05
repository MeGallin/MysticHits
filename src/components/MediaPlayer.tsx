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
  const [showFullscreenHint, setShowFullscreenHint] = useState(false);
  const [deviceOrientation, setDeviceOrientation] = useState<
    'portrait' | 'landscape'
  >('portrait');

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

    // Check if the event is cancelable before preventing default
    if (e.cancelable) {
      e.preventDefault();
      e.stopPropagation();
    }
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
      // Single touch - check if we can prevent the event
      if (e.cancelable) {
        // Use CSS touch-action to prevent long press context menu
        const target = e.currentTarget as HTMLElement;
        target.style.touchAction = 'manipulation';
      }
    } else if (e.touches.length > 1) {
      // Multi-touch - prevent immediately if cancelable
      if (e.cancelable) {
        e.preventDefault();
      }
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

    // Only prevent default if the event is cancelable
    if (e.cancelable) {
      e.preventDefault();
    }
  };

  const handleSelectStart = (e: React.SyntheticEvent) => {
    e.preventDefault();
    return false;
  };

  // Mobile device detection utility
  const isMobile =
    typeof window !== 'undefined' &&
    (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ) ||
      window.innerWidth <= 768);

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

  // Fullscreen functionality with enhanced mobile support and controls visibility
  const toggleFullscreen = async () => {
    const videoElement = ref && 'current' in ref ? ref.current : null;

    if (!videoElement || !isVideo) return;

    try {
      if (!isFullscreen) {
        // Pre-configure controls before entering fullscreen
        videoElement.setAttribute('controls', 'true');
        (videoElement as any).controls = true;

        // Enter fullscreen - try different methods for mobile compatibility
        if (videoElement.requestFullscreen) {
          await videoElement.requestFullscreen();
        } else if ((videoElement as any).webkitRequestFullscreen) {
          await (videoElement as any).webkitRequestFullscreen();
        } else if ((videoElement as any).msRequestFullscreen) {
          await (videoElement as any).msRequestFullscreen();
        }

        // Simple post-fullscreen configuration for mobile
        if (isMobile) {
          setTimeout(() => {
            try {
              // Just ensure controls are enabled - tap-to-show will handle the rest
              videoElement.setAttribute('controls', 'true');
              (videoElement as any).controls = true;
            } catch (error) {
              // Ignore errors
            }
          }, 200);
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

  // Enhanced fullscreen change handler with controls visibility enforcement
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);

      // Simple mobile controls setup when entering fullscreen
      if (isCurrentlyFullscreen && isMobile) {
        setShowFullscreenHint(true);
        // Hide hint after 4 seconds
        setTimeout(() => setShowFullscreenHint(false), 4000);

        // Simply ensure controls are enabled - let tap-to-show handle the rest
        const videoElement = ref && 'current' in ref ? ref.current : null;
        if (videoElement) {
          setTimeout(() => {
            try {
              videoElement.setAttribute('controls', 'true');
              (videoElement as any).controls = true;
            } catch (error) {
              // Ignore errors
            }
          }, 100);
        }
      } else {
        setShowFullscreenHint(false);

        // Restore normal controls behavior when exiting fullscreen
        if (!isCurrentlyFullscreen && isMobile) {
          const videoElement = ref && 'current' in ref ? ref.current : null;
          if (videoElement) {
            try {
              // Restore normal auto-hide behavior
              const videoStyle = (videoElement as any).style;
              if (videoStyle) {
                videoStyle.removeProperty(
                  '-webkit-media-controls-auto-hide-time',
                );
                videoStyle.removeProperty(
                  '-webkit-media-controls-auto-hide-delay',
                );
                // Set normal auto-hide timing for mobile
                videoStyle.setProperty(
                  '-webkit-media-controls-auto-hide-time',
                  '3s',
                  'important',
                );
                videoStyle.setProperty(
                  '-webkit-media-controls-auto-hide-delay',
                  '3s',
                  'important',
                );
              }
            } catch (error) {
              // Ignore errors
            }
          }
        }
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
  }, [isMobile, ref]);

  // Optimized tap-to-show-controls for mobile fullscreen - Performance-optimized to prevent loops
  useEffect(() => {
    let controlsTimeoutId: number | null = null;
    let lastTapTime = 0;
    let isProcessingTap = false;

    // Debounced tap handler with anti-loop protection
    const handleFullscreenTap = (e: TouchEvent | MouseEvent) => {
      if (!isFullscreen || !isMobile) return;

      const videoElement = ref && 'current' in ref ? ref.current : null;
      if (!videoElement) return;

      // Don't interfere with fullscreen button clicks
      const target = e.target as HTMLElement;
      if (target.closest('.fullscreen-button')) return;

      // Prevent event bubbling and default to stop loops (only if cancelable)
      if (e.cancelable) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Enhanced debouncing: prevent rapid-fire calls
      const now = Date.now();
      if (isProcessingTap || now - lastTapTime < 1000) {
        // Increased to 1 second
        return;
      }

      lastTapTime = now;
      isProcessingTap = true;

      // Clear any existing timeout
      if (controlsTimeoutId) {
        clearTimeout(controlsTimeoutId);
      }

      console.log('Fullscreen tap detected - showing controls');

      try {
        // Strategy 1: Force controls visibility (NO EVENT DISPATCHING to prevent loops)
        videoElement.setAttribute('controls', 'true');
        (videoElement as any).controls = true;
        videoElement.setAttribute('data-controls-forced', 'true');

        // Strategy 2: Webkit controls visibility without event dispatching
        const videoStyle = (videoElement as any).style;
        if (videoStyle) {
          videoStyle.setProperty(
            '-webkit-media-controls-auto-hide-time',
            '15s',
            'important',
          );
          videoStyle.setProperty(
            '-webkit-media-controls-auto-hide-delay',
            '0s',
            'important',
          );
          videoStyle.setProperty(
            '-webkit-media-controls-show',
            'true',
            'important',
          );
          videoStyle.setProperty('--media-controls-show', 'true', 'important');
        }

        // Strategy 3: Focus without triggering additional events
        videoElement.focus();

        // Strategy 4: CSS class manipulation for control visibility
        videoElement.classList.add('force-controls-visible');
        setTimeout(() => {
          if (videoElement) {
            videoElement.classList.remove('force-controls-visible');
          }
        }, 15000);

        // Set a timeout to reduce aggressive control showing after 15 seconds
        controlsTimeoutId = window.setTimeout(() => {
          try {
            if (videoStyle) {
              videoStyle.setProperty(
                '-webkit-media-controls-auto-hide-time',
                '5s',
                'important',
              );
            }
          } catch (error) {
            // Ignore errors
          }
          isProcessingTap = false; // Reset processing flag
        }, 15000);
      } catch (error) {
        console.warn('Error showing video controls:', error);
        isProcessingTap = false;
      }

      // Reset processing flag after a longer delay
      setTimeout(() => {
        isProcessingTap = false;
      }, 500); // Increased delay
    };

    // Enhanced container tap handler with area detection
    const handleContainerTap = (e: TouchEvent | MouseEvent) => {
      if (!isFullscreen || !isMobile) return;

      const target = e.target as HTMLElement;

      // Only handle taps on the video or container, not UI elements
      if (
        target.closest('.fullscreen-button') ||
        target.closest('.mobile-fullscreen-hint') ||
        target.closest('button') ||
        target.tagName === 'BUTTON'
      ) {
        return;
      }

      // Trigger the same logic as video tap
      handleFullscreenTap(e);
    };

    if (isFullscreen && isMobile) {
      const videoElement = ref && 'current' in ref ? ref.current : null;
      if (videoElement) {
        console.log('Setting up optimized fullscreen controls for mobile');

        // Strategy 1: Add event listeners for tap detection (passive: false only for touchend to allow preventDefault)
        videoElement.addEventListener(
          'touchend',
          handleFullscreenTap as EventListener,
          { passive: false },
        );
        videoElement.addEventListener(
          'click',
          handleFullscreenTap as EventListener,
          { passive: true },
        );

        // Strategy 2: Container listeners (fallback)
        const container = videoElement.parentElement;
        if (container) {
          container.addEventListener(
            'touchend',
            handleContainerTap as EventListener,
            { passive: false },
          );
          container.addEventListener(
            'click',
            handleContainerTap as EventListener,
            { passive: true },
          );
        }

        // Strategy 3: Initial controls setup (no loops, just one-time setup)
        videoElement.setAttribute('controls', 'true');
        (videoElement as any).controls = true;
        videoElement.setAttribute('data-controls-forced', 'true');

        // Strategy 4: CSS class for permanent control visibility
        videoElement.classList.add('fullscreen-mobile-controls-visible');
      }
    }

    // Cleanup function
    return () => {
      const videoElement = ref && 'current' in ref ? ref.current : null;

      // Clear timeouts
      if (controlsTimeoutId) {
        clearTimeout(controlsTimeoutId);
      }

      if (videoElement) {
        console.log('Cleaning up fullscreen control listeners');

        // Remove all event listeners
        videoElement.removeEventListener(
          'touchend',
          handleFullscreenTap as EventListener,
        );
        videoElement.removeEventListener(
          'click',
          handleFullscreenTap as EventListener,
        );

        const container = videoElement.parentElement;
        if (container) {
          container.removeEventListener(
            'touchend',
            handleContainerTap as EventListener,
          );
          container.removeEventListener(
            'click',
            handleContainerTap as EventListener,
          );
        }

        // Remove CSS classes
        videoElement.classList.remove('force-controls-visible');
        videoElement.classList.remove('fullscreen-mobile-controls-visible');
        videoElement.removeAttribute('data-controls-forced');

        // Restore normal video behavior when exiting fullscreen
        if (isMobile && !isFullscreen) {
          try {
            const videoStyle = (videoElement as any).style;
            if (videoStyle) {
              videoStyle.removeProperty(
                '-webkit-media-controls-auto-hide-time',
              );
              videoStyle.removeProperty(
                '-webkit-media-controls-auto-hide-delay',
              );
              videoStyle.removeProperty('-webkit-media-controls-show');
              videoStyle.removeProperty('--media-controls-show');
              videoStyle.setProperty(
                '-webkit-media-controls-auto-hide-time',
                '3s',
                'important',
              );
            }
          } catch (error) {
            // Ignore errors
          }
        }
      }
    };
  }, [isFullscreen, isMobile, ref]);

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
      }`}
      data-player-type={isVideo ? 'video' : 'audio'} // Add a data attribute for debugging
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation',
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
        controlsList={
          isMobile
            ? 'nodownload noremoteplaybook'
            : 'nodownload nofullscreen noremoteplaybook'
        }
        disablePictureInPicture
        playsInline
        preload="metadata"
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
            // Exclude fullscreen button area (top-right corner)
            clipPath:
              'polygon(0% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 100%, 0% 100%)',
          }}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
        />
      )}

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
              Use video controls at bottom or tap exit button to leave
              fullscreen
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
