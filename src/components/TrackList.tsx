import React from 'react';
import { Track } from '../types/audio';

interface TrackListProps {
  tracks: Track[];
  currentTrack: Track | null;
  onTrackSelect: (index: number) => void;
  formatTime: (seconds: number) => string;
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  currentTrack,
  onTrackSelect,
  formatTime,
}) => {
  return (
    <ul className="space-y-1">
      {tracks.map((track, index) => (
        <li
          key={index}
          onClick={() => onTrackSelect(index)}
          className={`flex items-center p-2 rounded-md cursor-pointer ${
            currentTrack && currentTrack.title === track.title
              ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 font-medium'
              : 'hover:bg-white/10'
          }`}
        >
          <div className="flex-1 min-w-0">
            <p className="truncate">{track.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {track.artist || 'Unknown Artist'}
            </p>
          </div>
          <div className="text-xs text-muted-foreground ml-2">
            {track.duration ? formatTime(track.duration) : '0:00'}
          </div>
        </li>
      ))}
    </ul>
  );
};
