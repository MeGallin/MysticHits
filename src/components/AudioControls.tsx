import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  Heart,
  ListMusic,
  Square,
  Share2,
} from 'lucide-react';
import { logInteraction } from '@services/trackingService';
import { playlistServices } from '@services/fetchServices';

interface AudioControlsProps {
  isPlaying: boolean;
  isShuffled: boolean;
  isRepeating: boolean;
  isMuted: boolean;
  showPlaylist: boolean;
  volume: number;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onStop: () => void;
  onShuffle: () => void;
  onRepeat: () => void;
  onMute: () => void;
  onShowPlaylist: () => void;
  onVolumeChange: (value: number) => void;
  onLike?: (liked: boolean) => void;
  onShare?: () => void;
  currentTrack?: {
    title: string;
    artist?: string;
  } | null;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  onStop,
  onShuffle,
  isShuffled,
  onRepeat,
  isRepeating,
  onMute,
  isMuted,
  showPlaylist,
  onShowPlaylist,
  volume,
  onVolumeChange,
  onLike,
  onShare,
  currentTrack,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [userLikes, setUserLikes] = useState<
    Record<string, { liked: boolean; timestamp: string }>
  >({});
  const [likesLoaded, setLikesLoaded] = useState(false);

  // Load user's liked tracks when component mounts
  useEffect(() => {
    const loadUserLikes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLikesLoaded(true);
          return;
        }

        const response = await playlistServices.getUserLikes();
        if (response.success && response.data?.data?.likes) {
          setUserLikes(response.data.data.likes);
        }
      } catch (error) {
        console.error('Error loading user likes:', error);
      } finally {
        setLikesLoaded(true);
      }
    };

    loadUserLikes();
  }, []);

  // Update like state when current track changes
  useEffect(() => {
    if (currentTrack && likesLoaded) {
      const trackId = currentTrack.title; // Using title as trackId as per the logInteraction call
      const isTrackLiked = userLikes[trackId]?.liked || false;
      setIsLiked(isTrackLiked);
    }
  }, [currentTrack, userLikes, likesLoaded]);

  const handleLike = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    onLike?.(newLikedState);

    // Update local userLikes state to keep UI in sync
    if (currentTrack) {
      const trackId = currentTrack.title;
      setUserLikes((prev) => {
        const updated = { ...prev };
        if (newLikedState) {
          updated[trackId] = {
            liked: true,
            timestamp: new Date().toISOString(),
          };
        } else {
          delete updated[trackId];
        }
        return updated;
      });

      // Log the interaction using the tracking service
      try {
        await logInteraction(
          currentTrack.title, // trackUrl/trackId
          'like',
          newLikedState,
        );
        console.log('Like interaction logged successfully');
      } catch (error: any) {
        console.error('Error logging interaction:', error);

        // Handle authentication errors
        if (
          error.response?.status === 401 ||
          error.message?.includes('not authenticated')
        ) {
          console.warn(
            'User not authenticated - like action UI updated but not saved to database',
          );
          // You might want to show a toast notification here
          // For now, we'll just keep the UI state but warn the user
        } else {
          // For other errors, you might want to revert the UI state
          console.error('Failed to save like to database:', error.message);
          // Optionally revert the UI state on error
          // setIsLiked(!newLikedState);
          // setUserLikes(prev => { ... }); // revert the change
        }
      }
    }
  };

  const handleShare = () => {
    onShare?.();
    // Basic Web Share API implementation
    if (navigator.share && currentTrack) {
      navigator
        .share({
          title: currentTrack.title,
          text: `Check out this track: ${currentTrack.title}${
            currentTrack.artist ? ` by ${currentTrack.artist}` : ''
          }`,
          url: window.location.href,
        })
        .catch((error) => {
          console.log('Error sharing:', error);
          // Fallback: copy to clipboard
          fallbackShare();
        });
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    if (currentTrack) {
      const shareText = `Check out this track: ${currentTrack.title}${
        currentTrack.artist ? ` by ${currentTrack.artist}` : ''
      } - ${window.location.href}`;
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          // Could show a toast notification here
          console.log('Track info copied to clipboard');
        })
        .catch(() => {
          console.log('Could not copy to clipboard');
        });
    }
  };
  return (
    <div className="bg-gradient-to-br from-indigo-900/90 via-purple-800/90 to-pink-900/90 backdrop-blur-sm p-3 rounded-lg">
      {/* Main Controls */}
      <div className="flex items-center justify-between">
        <button
          className={`p-2 rounded-full ${
            isShuffled
              ? 'text-pink-400 bg-white/10'
              : 'text-white/70 hover:text-pink-300'
          }`}
          onClick={onShuffle}
          aria-label={isShuffled ? 'Shuffle On' : 'Shuffle Off'}
        >
          <Shuffle className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-2">
          <button
            className="text-white/70 hover:text-pink-300 p-2 rounded-full"
            onClick={onPrevious}
            aria-label="Previous Track"
          >
            <SkipBack className="h-6 w-6" />
          </button>
          <button
            onClick={onPlayPause}
            className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white h-12 w-12 flex items-center justify-center shadow-lg hover:from-pink-600 hover:to-purple-700"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </button>
          <button
            className="text-white/70 hover:text-pink-300 p-2 rounded-full"
            onClick={onNext}
            aria-label="Next Track"
          >
            <SkipForward className="h-6 w-6" />
          </button>
          <button
            className="text-white/70 hover:text-pink-300 p-2 rounded-full"
            onClick={onStop}
            aria-label="Stop"
          >
            <Square className="h-6 w-6" />
          </button>
        </div>
        <button
          className={`p-2 rounded-full ${
            isRepeating
              ? 'text-pink-400 bg-white/10'
              : 'text-white/70 hover:text-pink-300'
          }`}
          onClick={onRepeat}
          aria-label={isRepeating ? 'Repeat On' : 'Repeat Off'}
        >
          <Repeat className="h-5 w-5" />
        </button>
      </div>

      {/* Volume and Additional Controls */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`p-2 rounded-full transition-all duration-200 ${
              isLiked
                ? 'text-red-400 bg-red-400/20 hover:bg-red-400/30'
                : 'text-white/70 hover:text-red-300 hover:bg-white/10'
            }`}
            aria-label={isLiked ? 'Unlike Track' : 'Like Track'}
            title={isLiked ? 'Unlike this track' : 'Like this track'}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="text-white/70 hover:text-blue-300 hover:bg-white/10 p-2 rounded-full transition-all duration-200"
            aria-label="Share Track"
            title="Share this track"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2 flex-1 mx-4">
          <button
            onClick={onMute}
            className="text-white/70 hover:text-pink-300"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-volume-x"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" x2="17" y1="9" y2="15" />
                <line x1="17" x2="23" y1="9" y2="15" />
              </svg>
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </button>

          <div className="relative flex-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.005"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-8 appearance-none bg-transparent rounded-full outline-none cursor-pointer z-10 relative opacity-70 hover:opacity-100 transition-opacity volume-range"
              aria-label="Volume control"
            />
            <div className="absolute top-1/2 left-0 w-full h-3 bg-white/20 rounded-full -translate-y-1/2 pointer-events-none">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                style={{ width: `${volume * 100}%` }}
              ></div>
              <div
                className="absolute top-1/2 h-6 w-6 rounded-full bg-white shadow-lg -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${volume * 100}%`,
                  transform: 'translateX(-50%) translateY(-50%)',
                  boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <button
            className={`text-white/70 hover:text-pink-300 p-2 rounded-full ${
              showPlaylist ? 'text-pink-400' : ''
            }`}
            onClick={onShowPlaylist}
            aria-label="Show Playlist"
          >
            <ListMusic className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
