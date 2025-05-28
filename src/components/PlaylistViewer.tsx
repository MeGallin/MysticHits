import React, { useState, useRef } from 'react';
import { useAtom } from 'jotai';
import { playlistAtom } from '../state/playlistAtom';
import { currentTrackAtom } from '../state/audioAtoms';
import MediaPlayer from './MediaPlayer';

export const PlaylistViewer: React.FC = () => {
  const [playlist] = useAtom(playlistAtom);
  const [currentTrack] = useAtom(currentTrackAtom);

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
        {playlist.map((track, index) => {
          // Check if this track is currently playing by comparing URLs
          const isCurrentlyPlaying = currentTrack && currentTrack.url === track.url;
          
          return (
            <div
              key={`${track.url}-${index}`}
              className={`p-3 bg-white/10 rounded-lg transition-all duration-200 ${
                isCurrentlyPlaying
                  ? 'border-2 border-pink-400 bg-gradient-to-r from-pink-500/20 to-purple-500/20 shadow-lg shadow-pink-500/25'
                  : 'border border-white/20 hover:border-white/40'
              }`}
            >
              <div className="mb-2">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium text-lg ${
                    isCurrentlyPlaying ? 'text-pink-200' : 'text-white'
                  }`}>
                    {track.title}
                    {isCurrentlyPlaying && (
                      <span className="ml-2 inline-flex items-center">
                        <span className="animate-pulse w-2 h-2 bg-pink-400 rounded-full mr-1"></span>
                        <span className="text-xs font-medium text-pink-300">NOW PLAYING</span>
                      </span>
                    )}
                  </h3>
                </div>
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
