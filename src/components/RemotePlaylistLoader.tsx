import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { playlistAtom } from '../state/playlistAtom';
import { playlistServices } from '@services/fetchServices';
import { Track } from '../types/audio';

// Define types for API response
interface PlaylistTrack {
  title: string;
  url: string;
  mime: string;
}

interface PlaylistResponse {
  success: boolean;
  error?: string;
  data: {
    success: boolean;
    data: PlaylistTrack[];
  };
}

export const RemotePlaylistLoader: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [, setPlaylist] = useAtom(playlistAtom);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    // Clear error when input changes
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate URL
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Simple URL validation
    if (!url.match(/^https?:\/\/.+/i)) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = (await playlistServices.getPlaylistFromUrl(
        url,
      )) as PlaylistResponse;

      if ('error' in response) {
        setError(response.error || 'An error occurred');
        return;
      }

      if (response.data.success && response.data.data.length > 0) {
        // Map the API response to our Track type
        const tracks: Track[] = response.data.data.map(
          (track: PlaylistTrack) => ({
            title: track.title,
            url: track.url,
            mime: track.mime,
            // Optional fields can be added if available
            artist: 'Unknown Artist',
            album: 'Unknown Album',
          }),
        );

        setPlaylist(tracks);
      } else {
        setError('No tracks found in the provided URL');
      }
    } catch (err) {
      setError('Failed to load playlist. Please try again.');
      console.error('Playlist loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 rounded-xl shadow-lg text-white">
      <h2 className="text-xl font-bold mb-4">Load Remote Playlist</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium mb-1">
            Remote Folder URL
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={handleInputChange}
            placeholder="https://example.com/music/"
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-white/70">
            Enter a URL to a folder containing audio files
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-md hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </span>
          ) : (
            'Load Playlist'
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-500/30 border border-red-500/50 rounded-md text-white">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};

export default RemotePlaylistLoader;
