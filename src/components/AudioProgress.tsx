import React from 'react';

interface AudioProgressProps {
  progress: number;
  duration: number;
  volume: number;
  onProgressChange: (value: number) => void;
  onVolumeChange: (value: number) => void;
}

export const AudioProgress: React.FC<AudioProgressProps> = ({
  progress,
  duration,
  volume,
  onProgressChange,
  onVolumeChange,
}) => {
  return (
    <div className="mt-4 space-y-4">
      <div>
        <label
          htmlFor="progressRange"
          className="block text-base sm:text-sm font-medium text-gray-700 mb-2"
        >
          Progress
        </label>
        <input
          id="progressRange"
          type="range"
          min="0"
          max={duration ? duration.toString() : '0'}
          value={progress}
          onChange={(e) => onProgressChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="text-sm text-gray-500 mt-1">
          {Math.floor(progress)} / {Math.floor(duration)} seconds
        </div>
      </div>
      <div>
        <label
          htmlFor="volumeRange"
          className="block text-base sm:text-sm font-medium text-gray-700 mb-2"
        >
          Volume
        </label>
        <input
          id="volumeRange"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};
