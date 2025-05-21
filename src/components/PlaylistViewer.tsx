import React, { useState, useRef } from 'react';
import { useAtom } from 'jotai';
import { playlistAtom } from '../state/playlistAtom';
import MediaPlayer from './MediaPlayer';

export const PlaylistViewer: React.FC = () => {
  const [playlist] = useAtom(playlistAtom);

  console.log('Playlist:', playlist);

  // If playlist is empty, show a message
  if (!playlist || playlist.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 rounded-xl shadow-lg text-white">
        <div className="text-center py-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-pink-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          <h3 className="text-xl font-bold mb-2">No Tracks Available</h3>
          <p className="text-white/70">
            Use the Remote Playlist Loader to fetch tracks from a URL
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 rounded-xl shadow-lg text-white">
      <h2 className="text-xl font-bold mb-4">
        Playlist ({playlist.length} tracks)
      </h2>

      <div className="space-y-4">
        {playlist.map((track, index) => (
          <div
            key={`${track.url}-${index}`}
            className="p-3 bg-white/10 rounded-lg border border-white/20"
          >
            <div className="mb-2 ">
              <h3 className="font-medium text-lg">{track.title}</h3>
              <p className="text-xs text-white/70">MIME Type: {track.mime}</p>
            </div>

            <MediaPlayer
              src={track.url}
              mime={track.mime || 'audio/mpeg'}
              className="w-full"
              onError={(e) => console.error(`Error playing ${track.title}:`, e)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistViewer;
