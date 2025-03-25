import React from 'react';
import { Track } from '../types/audio';

interface TrackListProps {
  tracks: Track[];
  currentTrack: Track | null;
  onTrackSelect: (index: number) => void;
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  currentTrack,
  onTrackSelect,
}) => {
  return (
    <div className="mt-4 sm:mt-6">
      <h3 className="text-lg sm:text-base font-semibold text-gray-800 mb-3">
        Tracks
      </h3>
      <ul className="space-y-3">
        {tracks.map((track, index) => (
          <li key={index}>
            <button
              onClick={() => onTrackSelect(index)}
              className={`w-full text-left px-4 py-3 sm:py-2 text-base sm:text-sm rounded-lg border border-gray-300 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 ${
                currentTrack && currentTrack.title === track.title
                  ? 'bg-purple-100 text-purple-700 border-purple-300'
                  : 'text-gray-700'
              }`}
            >
              {track.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
