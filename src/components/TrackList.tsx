import React from 'react';
import { useAtom } from 'jotai';
import { Track } from '../types/audio';
import { trackDurationsAtom } from '../state/audioAtoms';
import { VideoIcon } from './icons/VideoIcon';

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
  // Get the stored durations from our atom
  const [trackDurations] = useAtom(trackDurationsAtom);

  return (
    <ul className="space-y-1">
      {tracks.map((track, index) => {
        // Get duration from the trackDurations atom if available, otherwise use track.duration
        const duration =
          track.url && trackDurations[track.url]
            ? trackDurations[track.url]
            : track.duration || 0;

        return (
          <li
            key={index}
            onClick={() => onTrackSelect(index)}
            className={` flex items-center p-2 rounded-md cursor-pointer border border-red-500 ${
              currentTrack && currentTrack.title === track.title
                ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 font-medium'
                : 'hover:bg-white/10'
            }`}
          >
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="break-words" title={track.title}>
                {track.title}
                {track.mime && track.mime.startsWith('video') && (
                  <VideoIcon className="inline-block ml-1 text-blue-500" />
                )}
              </p>
              <p
                className="text-xs text-muted-foreground break-words"
                title={track.artist || ''}
              >
                {track.artist || ''}
              </p>
            </div>
            <div className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
              {duration ? formatTime(duration) : '0:00'}
            </div>
          </li>
        );
      })}
    </ul>
  );
};
