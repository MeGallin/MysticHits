import React, { useEffect, useRef, useState } from 'react';

interface AudioProgressProps {
  progress: number;
  duration: number;
  volume: number;
  onProgressChange: (value: number) => void;
  onVolumeChange: (value: number) => void;
}

// Modern volume icon component with animated transitions
const VolumeIcon: React.FC<{ volume: number }> = ({ volume }) => {
  const volumeLevel = Math.floor(volume * 10); // Scale volume to 0-9
  const scale = 1 + volumeLevel / 20; // Scale from 1 to 1.5

  // Determine which icon to show based on volume level
  switch (volumeLevel) {
    case 0:
      // Mute Icon
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-400 dark:text-gray-300 transition-all duration-300 ease-in-out"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          style={{ transform: `scale(${scale})` }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
          />
        </svg>
      );
    case 1:
    case 2:
    case 3:
      // Low Volume Icon
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-blue-500 dark:text-blue-400 transition-all duration-300 ease-in-out"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          style={{ transform: `scale(${scale})` }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      );
    default:
      // High Volume Icon (for levels 4-9)
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-purple-500 dark:text-purple-400 transition-all duration-300 ease-in-out"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          style={{ transform: `scale(${scale})` }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      );
  }
};

export const AudioProgress: React.FC<AudioProgressProps> = ({
  progress,
  duration,
  volume,
  onProgressChange,
  onVolumeChange,
}) => {
  // Refs for progress bar animation
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressThumbRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(0);
  const [tooltipValue, setTooltipValue] = useState('');

  // Helper function to format time (e.g., 125 seconds -> 2:05)
  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Update progress bar width based on current progress
  useEffect(() => {
    if (progressBarRef.current && !isDragging) {
      const percent = duration > 0 ? (progress / duration) * 100 : 0;
      progressBarRef.current.style.width = `${percent}%`;

      if (progressThumbRef.current) {
        progressThumbRef.current.style.left = `${percent}%`;
      }
    }
  }, [progress, duration, isDragging]);

  // Handle progress bar click/drag
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newProgress = percent * duration;
    onProgressChange(newProgress);
  };

  // Handle mouse move over progress bar for tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const value = percent * duration;

    setTooltipPosition(x);
    setTooltipValue(formatTime(value));
    setShowTooltip(true);
  };

  return (
    <div className="mt-6 space-y-6 px-3 py-4 select-none bg-white rounded-lg shadow-md">
      {/* Progress Bar */}
      <div className="space-y-1">
        <div
          className="relative h-2 bg-gray-700 rounded-full cursor-pointer group"
          onClick={handleProgressBarClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Progress fill */}
          <div
            ref={progressBarRef}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-100 ease-out shadow-inner"
            style={{ width: `${(progress / duration) * 100}%` }}
          />

          {/* Thumb indicator */}
          <div
            ref={progressThumbRef}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 ring-2 ring-gray-400 dark:ring-gray-600"
            style={{ left: `${(progress / duration) * 100}%` }}
          />

          {/* Tooltip */}
          {showTooltip && (
            <div
              className="absolute bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded transform -translate-x-1/2 shadow-lg"
              style={{ left: tooltipPosition }}
            >
              {tooltipValue}
            </div>
          )}
        </div>

        {/* Time indicators */}
        <div className="flex justify-between text-xs text-gray-300 px-0.5 font-medium">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-3">
        <div className="group relative">
          <VolumeIcon volume={volume} />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="relative w-24 h-6 flex items-center">
          <input
            id="volumeRange"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1 appearance-none bg-gray-700 rounded-lg cursor-pointer accent-purple-400"
            aria-label="Volume control"
          />

          {/* Custom volume track */}
          <div
            className="pointer-events-none absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg"
            style={{ width: `${volume * 100}%`, transform: 'translateY(-50%)' }}
          />

          {/* Custom volume thumb */}
          <div
            className="pointer-events-none absolute top-1/2 w-3 h-3 bg-white rounded-full shadow-md transform -translate-y-1/2 ring-2 ring-gray-400 dark:ring-gray-600"
            style={{ left: `calc(${volume * 100}% - ${volume * 3}px)` }}
          />
        </div>
      </div>
    </div>
  );
};
