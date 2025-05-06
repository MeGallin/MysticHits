import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { AudioControls } from './AudioControls';
import { TrackList } from './TrackList';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Track } from '../types/audio';
import { Advertisement } from './Advertisement';
import { StaticAdvertisements } from './StaticAdvertisements';
import { playlistAtom } from '../state/playlistAtom';
import { Button } from '@/components/ui/button';

interface AudioPlayerProps {
  playlist?: {
    title: string;
    src: string;
    mime: string;
  }[];
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  playlist: propPlaylist = [],
}) => {
  // Local tracks from file selection
  const [localTracks, setLocalTracks] = useState<Track[]>([]);
  const [musicFolder, setMusicFolder] = useState<string>('');
  const [folderError, setFolderError] = useState<string>('');
  const [showPlaylist, setShowPlaylist] = useState<boolean>(false);

  // Remote URL functionality
  const [activeTab, setActiveTab] = useState<'local' | 'remote'>('local');
  const [remoteUrl, setRemoteUrl] = useState<string>('');
  const [isLoadingRemote, setIsLoadingRemote] = useState<boolean>(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);

  // Get remote tracks from playlist atom
  const [remotePlaylist, setRemotePlaylist] = useAtom(playlistAtom);

  // Process tracks from prop playlist if provided
  useEffect(() => {
    if (propPlaylist && propPlaylist.length > 0) {
      // Convert prop playlist to Track format
      const propTracks: Track[] = propPlaylist.map((item) => ({
        title: item.title,
        url: item.src,
        mime: item.mime,
        artist: '',
        album: 'Unknown Album',
        duration: 0,
        cover: '/placeholder.svg?height=300&width=300',
      }));

      // Update remote playlist with the provided tracks
      setRemotePlaylist(propTracks);

      // Automatically switch to local tab to show player
      setActiveTab('local');

      // Show playlist if tracks are provided
      if (propTracks.length > 0) {
        setShowPlaylist(true);
      }
    }
  }, [propPlaylist, setRemotePlaylist]);

  // Combine local and remote tracks
  const [combinedTracks, setCombinedTracks] = useState<Track[]>([]);

  // Update combined tracks when either local or remote tracks change
  useEffect(() => {
    setCombinedTracks([...localTracks, ...remotePlaylist]);
  }, [localTracks, remotePlaylist]);

  // Cleanup URLs when tracks change
  React.useEffect(() => {
    return () => {
      localTracks.forEach((track) => {
        if (track.url.startsWith('blob:')) {
          URL.revokeObjectURL(track.url);
        }
      });
    };
  }, [localTracks]);

  // Handle remote URL input change
  const handleRemoteUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRemoteUrl(e.target.value);
    // Clear error when input changes
    if (remoteError) setRemoteError(null);
  };

  // Handle remote playlist loading
  const handleRemoteLoad = async () => {
    if (!remoteUrl.trim()) {
      setRemoteError('Please enter a URL');
      return;
    }

    // Simple URL validation
    if (!remoteUrl.match(/^https?:\/\/.+/i)) {
      setRemoteError(
        'Please enter a valid URL starting with http:// or https://',
      );
      return;
    }

    setIsLoadingRemote(true);
    setRemoteError(null);

    try {
      // Import playlistServices
      const { playlistServices } = await import('../services/fetchServices');
      const response = await playlistServices.getPlaylistFromUrl(remoteUrl);

      if ('error' in response) {
        setRemoteError(response.error);
        return;
      }

      if (response.data.success && response.data.data.length > 0) {
        // Process tracks and handle CORS issues
        setRemoteError('Loading audio files... This may take a moment.');

        // Create a function to fetch and convert a remote file to a blob URL
        const fetchAndCreateBlobUrl = async (track: Track): Promise<Track> => {
          // Ensure the URL is absolute
          let url = track.url;
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // If URL is relative, make it absolute based on the remote URL
            const baseUrl = new URL(remoteUrl);
            url = new URL(track.url, baseUrl.origin).toString();
          }

          // Due to CORS restrictions, we can't fetch the remote files directly
          // Instead, we'll use the original URLs and handle errors gracefully
          // Check if the URL has encoded characters and decode them
          // URLs from the API might have %20 instead of spaces, etc.
          let cleanUrl = url;
          try {
            // Check if the URL contains encoded characters like %20
            if (url.includes('%')) {
              cleanUrl = decodeURIComponent(url);
            }
          } catch (e) {
            console.error(`Error decoding URL ${url}:`, e);
          }

          // Return the track with the cleaned URL
          return {
            ...track,
            url: cleanUrl,
            mime: track.mime || 'audio/mpeg',
            artist: track.artist || '',
            album: track.album || 'Unknown Album',
            duration: track.duration || 0,
            cover: track.cover || '/placeholder.svg?height=300&width=300',
          };
        };

        // Process all tracks
        try {
          const processedTracks = await Promise.all(
            response.data.data.map(fetchAndCreateBlobUrl),
          );

          setRemotePlaylist(processedTracks);
          setRemoteError(null);
          setActiveTab('local'); // Switch back to local tab to show the player
        } catch (error) {
          console.error('Error processing tracks:', error);
          setRemoteError(
            'Error processing audio files. Some files may not play correctly.',
          );

          // Still set the playlist with the original URLs as fallback
          const fallbackTracks = response.data.data.map((track: Track) => ({
            ...track,
            url: track.url.startsWith('http')
              ? track.url
              : new URL(track.url, new URL(remoteUrl).origin).toString(),
            mime: track.mime || 'audio/mpeg',
            artist: track.artist || '',
            album: track.album || 'Unknown Album',
            duration: track.duration || 0,
            cover: track.cover || '/placeholder.svg?height=300&width=300',
          }));

          setRemotePlaylist(fallbackTracks);
          setActiveTab('local');
        }
      } else {
        setRemoteError('No tracks found in the provided URL');
      }
    } catch (err) {
      setRemoteError('Failed to load playlist. Please try again.');
      console.error('Playlist loading error:', err);
    } finally {
      setIsLoadingRemote(false);
    }
  };

  const handleFolderSelect = async () => {
    try {
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;

      setFolderError('');

      // Handle file selection
      input.onchange = (e) => {
        if (!e.target) return;
        const files = Array.from((e.target as HTMLInputElement).files || []);
        const audioExtensions = [
          '.mp3',
          '.wav',
          '.m4a',
          '.aac',
          '.ogg',
          '.flac',
          '.wma',
        ];
        const audioFiles = files.filter((file) =>
          audioExtensions.some((ext) => file.name.toLowerCase().endsWith(ext)),
        );

        if (audioFiles.length === 0) {
          setFolderError('No audio files found in the selected folder');
          return;
        }

        // Cleanup existing URLs
        localTracks.forEach((track) => {
          if (track.url.startsWith('blob:')) {
            URL.revokeObjectURL(track.url);
          }
        });

        const newTracks: Track[] = audioFiles.map((file) => {
          const title = file.name.substring(0, file.name.lastIndexOf('.'));
          // Extract artist from filename if it contains a dash
          let artist = '';
          let trackTitle = title;
          const ext = file.name.split('.').pop()?.toLowerCase() || '';
          const mimeType = getMimeType(ext);

          if (title.includes(' - ')) {
            const parts = title.split(' - ');
            artist = parts[0];
            trackTitle = parts.slice(1).join(' - ');
          } else if (title.includes('-')) {
            const parts = title.split('-');
            artist = parts[0].trim();
            trackTitle = parts.slice(1).join('-').trim();
          }

          return {
            title: trackTitle,
            artist: artist,
            album: 'Unknown Album',
            duration: 0, // Will be set when audio loads
            url: URL.createObjectURL(file),
            cover: '/placeholder.svg?height=300&width=300',
            mime: mimeType,
          };
        });

        // Helper function to get MIME type from file extension
        function getMimeType(extension: string): string {
          const mimeTypes: Record<string, string> = {
            mp3: 'audio/mpeg',
            wav: 'audio/wav',
            m4a: 'audio/mp4',
            aac: 'audio/aac',
            ogg: 'audio/ogg',
            flac: 'audio/flac',
            wma: 'audio/x-ms-wma',
          };

          return mimeTypes[extension] || 'audio/mpeg'; // Default to audio/mpeg if unknown
        }

        setLocalTracks(newTracks);
        setMusicFolder((e.target as HTMLInputElement).value);
      };

      input.click();
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const {
    audioRef,
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    currentIndex,
    error,
    isShuffled,
    shuffledIndices,
    showingAd,
    currentAdId,
    closeAdvertisement,
    controls,
  } = useAudioPlayer(combinedTracks);

  // Format time helper function
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <>
      {/* Advertisement Overlay */}
      {showingAd && currentAdId && (
        <Advertisement adId={currentAdId} onClose={closeAdvertisement} />
      )}

      <div className="flex flex-col w-full h-full max-w-md mx-auto bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 rounded-none shadow-2xl overflow-hidden text-white border-2 border-pink-500/30 backdrop-blur-sm flex-grow">
        {/* Music Source Selection Tabs */}
        <div className="flex border-b border-white/20">
          <Button
            onClick={() => setActiveTab('local')}
            variant={activeTab === 'local' ? 'default' : 'ghost'}
            className={`flex-1 rounded-none border-0 ${
              activeTab === 'local'
                ? 'bg-white/10 text-pink-300 border-b-2 border-pink-500 shadow-none hover:bg-white/15'
                : 'bg-transparent text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            Local Files
          </Button>
          <Button
            onClick={() => setActiveTab('remote')}
            variant={activeTab === 'remote' ? 'default' : 'ghost'}
            className={`flex-1 rounded-none border-0 ${
              activeTab === 'remote'
                ? 'bg-white/10 text-pink-300 border-b-2 border-pink-500 shadow-none hover:bg-white/15'
                : 'bg-transparent text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            Remote URL
          </Button>
        </div>

        {/* Source Selection UI */}
        <div className="px-6 py-4">
          {activeTab === 'local' ? (
            <>
              <Button
                onClick={handleFolderSelect}
                className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-pink-500/20 flex items-center justify-center font-medium"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
                Select Music Folder
              </Button>
              {folderError && (
                <p className="mt-2 text-red-300 text-sm">{folderError}</p>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium mb-1">
                  Remote Folder URL
                </label>
                <input
                  type="text"
                  id="url"
                  value={remoteUrl}
                  onChange={handleRemoteUrlChange}
                  placeholder="https://example.com/music/"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  disabled={isLoadingRemote}
                />
                <p className="mt-1 text-xs text-white/70">
                  Enter a URL to a folder containing audio files
                </p>
              </div>

              <Button
                onClick={handleRemoteLoad}
                disabled={isLoadingRemote || !remoteUrl.trim()}
                className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-md hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingRemote ? (
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
                  'Load Remote Playlist'
                )}
              </Button>

              {remoteError && (
                <div className="mt-2 p-3 bg-red-500/30 border border-red-500/50 rounded-md text-white">
                  <p className="text-sm font-medium">{remoteError}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="p-6 bg-gradient-to-br from-pink-500/30 to-indigo-500/30 backdrop-blur-sm border-b border-white/10">
          <div className="text-white">
            <div className="overflow-hidden">
              <h2
                className="text-2xl font-bold pb-1"
                title={currentTrack?.title || 'No Track Selected'}
              >
                {currentTrack ? currentTrack.title : 'No Track Selected'}
              </h2>
              <p
                className="text-sm opacity-90 mt-1 text-pink-200 truncate"
                title={currentTrack?.artist || 'Select a track to play'}
              >
                {currentTrack?.artist || 'Select a track to play'}
              </p>
            </div>

            {/* Next/Previous Track Info */}
            {combinedTracks.length > 0 && currentTrack && (
              <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-4 text-xs">
                {/* Previous Track */}
                {combinedTracks.length > 1 && (
                  <div className="col-span-1 overflow-hidden">
                    {currentIndex > 0 || isShuffled ? (
                      <>
                        <p className="text-blue-200 font-medium">Previous:</p>
                        <p
                          className="text-white/70 truncate"
                          title={
                            isShuffled
                              ? combinedTracks[
                                  shuffledIndices[
                                    (shuffledIndices.indexOf(currentIndex) -
                                      1 +
                                      combinedTracks.length) %
                                      combinedTracks.length
                                  ]
                                ]?.title
                              : combinedTracks[
                                  (currentIndex - 1 + combinedTracks.length) %
                                    combinedTracks.length
                                ]?.title
                          }
                        >
                          {isShuffled
                            ? combinedTracks[
                                shuffledIndices[
                                  (shuffledIndices.indexOf(currentIndex) -
                                    1 +
                                    combinedTracks.length) %
                                    combinedTracks.length
                                ]
                              ]?.title
                            : combinedTracks[
                                (currentIndex - 1 + combinedTracks.length) %
                                  combinedTracks.length
                              ]?.title}
                        </p>
                      </>
                    ) : null}
                  </div>
                )}

                {/* Next Track */}
                {combinedTracks.length > 1 && (
                  <div className="col-span-1 text-right overflow-hidden">
                    {currentIndex < combinedTracks.length - 1 || isShuffled ? (
                      <>
                        <p className="text-pink-200 font-medium">Next:</p>
                        <p
                          className="text-white/70 truncate"
                          title={
                            isShuffled
                              ? combinedTracks[
                                  shuffledIndices[
                                    (shuffledIndices.indexOf(currentIndex) +
                                      1) %
                                      combinedTracks.length
                                  ]
                                ]?.title
                              : combinedTracks[
                                  (currentIndex + 1) % combinedTracks.length
                                ]?.title
                          }
                        >
                          {isShuffled
                            ? combinedTracks[
                                shuffledIndices[
                                  (shuffledIndices.indexOf(currentIndex) + 1) %
                                    combinedTracks.length
                                ]
                              ]?.title
                            : combinedTracks[
                                (currentIndex + 1) % combinedTracks.length
                              ]?.title}
                        </p>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Audio element with enhanced error handling */}
        <audio
          ref={audioRef}
          src={currentTrack ? currentTrack.url : undefined}
          onTimeUpdate={controls.handleTimeUpdate}
          onLoadedMetadata={controls.handleLoadedMetadata}
          onError={(e) => {
            console.error('Audio error:', e);
            if (currentTrack) {
              console.error('Failed to load track:', currentTrack);

              // Try to create a fallback audio element to test the source
              const testAudio = new Audio();
              testAudio.src = currentTrack.url;
              testAudio.onerror = () => {
                console.error(
                  'Fallback audio test failed for URL:',
                  currentTrack.url,
                );

                // Try with a different MIME type if the current one fails
                if (currentTrack.mime !== 'audio/mpeg') {
                  // Try with audio/mpeg MIME type as fallback

                  // Update the track in the combined tracks array with audio/mpeg MIME type
                  const updatedTracks = combinedTracks.map((track, idx) =>
                    idx === currentIndex
                      ? { ...track, mime: 'audio/mpeg' }
                      : track,
                  );

                  setCombinedTracks(updatedTracks);

                  // If this is a remote track, also update it in the remote playlist
                  if (
                    remotePlaylist.some(
                      (track) => track.url === currentTrack.url,
                    )
                  ) {
                    const updatedRemotePlaylist = remotePlaylist.map((track) =>
                      track.url === currentTrack.url
                        ? { ...track, mime: 'audio/mpeg' }
                        : track,
                    );
                    setRemotePlaylist(updatedRemotePlaylist);
                  }
                }
              };
            }
          }}
        >
          {/* Add source elements as fallback */}
          {currentTrack && (
            <>
              <source src={currentTrack.url} type={currentTrack.mime} />
              <source src={currentTrack.url} type="audio/mpeg" />
              <source src={currentTrack.url} type="audio/wav" />
              <source src={currentTrack.url} type="audio/mp4" />
              <p>Your browser does not support the audio element.</p>
            </>
          )}
        </audio>

        {combinedTracks.length === 0 ? (
          <div className="p-6 space-y-4 flex-grow flex items-center justify-center">
            <StaticAdvertisements />
          </div>
        ) : (
          <div className="p-6 space-y-4 flex-grow flex flex-col justify-center">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden shadow-inner">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={progress}
                  onChange={(e) =>
                    controls.handleProgressChange(parseFloat(e.target.value))
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label="Seek"
                />
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full pointer-events-none"
                  style={{
                    width: `${duration > 0 ? (progress / duration) * 100 : 0}%`,
                  }}
                ></div>
                <div
                  className="absolute top-1/2 h-4 w-4 rounded-full bg-white shadow-lg -translate-y-1/2 pointer-events-none"
                  style={{
                    left: `${duration > 0 ? (progress / duration) * 100 : 0}%`,
                    transform: 'translateX(-50%) translateY(-50%)',
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-pink-200 font-medium">
                  {formatTime(progress)}
                </span>
                <span className="text-blue-200 font-medium">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Controls */}
            <AudioControls
              isPlaying={isPlaying}
              onPlayPause={controls.togglePlay}
              onPrevious={controls.playPreviousTrack}
              onNext={controls.playNextTrack}
              onStop={controls.handleStop}
              isShuffled={controls.isShuffled}
              onShuffle={controls.toggleShuffle}
              isRepeating={controls.isRepeating}
              onRepeat={controls.toggleRepeat}
              isMuted={controls.isMuted}
              onMute={controls.toggleMute}
              onShowPlaylist={() => setShowPlaylist(!showPlaylist)}
              showPlaylist={showPlaylist}
              volume={volume}
              onVolumeChange={controls.handleVolumeChange}
            />
          </div>
        )}

        {/* Playlist */}
        {showPlaylist && combinedTracks.length > 0 && (
          <div className="border-t border-white/10 p-4 max-h-[30vh] overflow-y-auto bg-gradient-to-br from-indigo-900/80 to-purple-800/80 backdrop-blur-sm">
            <h3 className="font-medium mb-2 text-pink-200 flex items-center">
              <span className="mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
              </span>
              Up Next
            </h3>
            <div className="mt-3 space-y-1">
              <TrackList
                tracks={combinedTracks}
                currentTrack={currentTrack}
                onTrackSelect={controls.handleTrackSelect}
                formatTime={formatTime}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AudioPlayer;
