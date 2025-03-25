import React from 'react';

interface AudioControlsProps {
  isPlaying: boolean;
  isShuffled: boolean;
  onPlayPause: () => void;
  onRewind: () => void;
  onFastForward: () => void;
  onStop: () => void;
  onShuffle: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  onPlayPause,
  onRewind,
  onFastForward,
  onStop,
  isShuffled,
  onShuffle,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
      <button
        onClick={onPlayPause}
        className="col-span-2 sm:col-span-1 px-4 py-3 sm:py-2 text-base sm:text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors duration-200"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button
        onClick={onStop}
        className="col-span-2 sm:col-span-1 px-4 py-3 sm:py-2 text-base sm:text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors duration-200"
      >
        Stop
      </button>
      <button
        onClick={onRewind}
        className="col-span-1 px-4 py-3 sm:py-2 text-base sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200"
      >
        Rewind 10s
      </button>
      <button
        onClick={onFastForward}
        className="col-span-1 px-4 py-3 sm:py-2 text-base sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200"
      >
        Forward 10s
      </button>
      <button
        onClick={onShuffle}
        className={`col-span-2 sm:col-span-1 px-4 py-3 sm:py-2 text-base sm:text-sm ${
          isShuffled
            ? 'bg-purple-500 hover:bg-purple-600 active:bg-purple-700'
            : 'bg-gray-500 hover:bg-gray-600 active:bg-gray-700'
        } text-white rounded-lg transition-colors duration-200`}
      >
        {isShuffled ? 'Shuffle On' : 'Shuffle Off'}
      </button>
    </div>
  );
};
