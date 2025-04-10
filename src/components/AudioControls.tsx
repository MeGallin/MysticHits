import React from 'react';
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
} from 'lucide-react';

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
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
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
}) => {
  return (
    <>
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
        <button
          className="text-white/70 hover:text-pink-300 p-2 rounded-full"
          aria-label="Favorite"
        >
          <Heart className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-2 w-32">
          <button
            onClick={onMute}
            className="text-white/70 hover:text-pink-300"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-volume-x"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" x2="17" y1="9" y2="15" />
                <line x1="17" x2="23" y1="9" y2="15" />
              </svg>
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <div className="relative w-full">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1 appearance-none bg-white/20 rounded-full outline-none cursor-pointer z-10 relative opacity-0"
              aria-label="Volume control"
            />
            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/20 rounded-full -translate-y-1/2 pointer-events-none">
              <div
                className="h-full bg-blue-400 rounded-full"
                style={{ width: `${volume * 100}%` }}
              ></div>
              <div
                className="absolute top-1/2 h-2.5 w-2.5 rounded-full bg-blue-400 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${volume * 100}%`,
                  transform: 'translateX(-50%) translateY(-50%)',
                }}
              ></div>
            </div>
          </div>
        </div>
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
    </>
  );
};
