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
    <div className="h-full bg-white rounded-lg">
      <div className="overflow-y-auto pr-2 pl-2 pt-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <ul className="space-y-2">
          {tracks.map((track, index) => (
            <li key={index}>
              <button
                onClick={() => onTrackSelect(index)}
                className={`w-full text-left px-4 py-3 sm:py-2 text-base sm:text-sm rounded-lg border hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 ${
                  currentTrack && currentTrack.title === track.title
                    ? 'bg-purple-100 text-purple-700 border-purple-300'
                    : 'text-gray-700 border-gray-300'
                }`}
              >
                {track.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
