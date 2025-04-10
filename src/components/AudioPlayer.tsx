import React, { useState } from 'react';
import { AudioControls } from './AudioControls';
import { TrackList } from './TrackList';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Track } from '../types/audio';
import { Advertisement } from './Advertisement';
import { StaticAdvertisements } from './StaticAdvertisements';

export const AudioPlayer: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [musicFolder, setMusicFolder] = useState<string>('');
  const [folderError, setFolderError] = useState<string>('');
  const [showPlaylist, setShowPlaylist] = useState<boolean>(false);

  // Cleanup URLs when tracks change
  React.useEffect(() => {
    return () => {
      tracks.forEach((track) => {
        if (track.url.startsWith('blob:')) {
          URL.revokeObjectURL(track.url);
        }
      });
    };
  }, [tracks]);

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
        tracks.forEach((track) => {
          if (track.url.startsWith('blob:')) {
            URL.revokeObjectURL(track.url);
          }
        });

        const newTracks: Track[] = audioFiles.map((file) => {
          const title = file.name.substring(0, file.name.lastIndexOf('.'));
          // Extract artist from filename if it contains a dash
          let artist = 'Unknown Artist';
          let trackTitle = title;

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
          };
        });

        setTracks(newTracks);
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
  } = useAudioPlayer(tracks);

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

      <div className="flex flex-col w-full h-full max-w-md mx-auto bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 rounded-xl shadow-2xl overflow-hidden text-white border-2 border-pink-500/30 backdrop-blur-sm">
        {/* Select Music Button */}
        <div className="px-6">
          <button
            onClick={handleFolderSelect}
            className="w-full px-4 py-3 my-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-pink-500/20 flex items-center justify-center font-medium"
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
          </button>
          {folderError && (
            <p className="mt-2 text-red-300 text-sm">{folderError}</p>
          )}
        </div>

        {/* Track Info */}
        <div className="p-6 bg-gradient-to-br from-pink-500/30 to-indigo-500/30 backdrop-blur-sm border-b border-white/10">
          <div className="text-white">
            <h2 className="text-2xl font-bold tracking-tight">
              {currentTrack ? currentTrack.title : 'No Track Selected'}
            </h2>
            <p className="text-sm opacity-90 mt-1 text-pink-200">
              {currentTrack?.artist || 'Select a track to play'}
            </p>

            {/* Next/Previous Track Info */}
            {tracks.length > 0 && currentTrack && (
              <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-4 text-xs">
                {/* Previous Track */}
                {tracks.length > 1 && (
                  <div className="col-span-1">
                    {currentIndex > 0 || isShuffled ? (
                      <>
                        <p className="text-blue-200 font-medium">Previous:</p>
                        <p className="text-white/70 truncate">
                          {isShuffled
                            ? tracks[
                                shuffledIndices[
                                  (shuffledIndices.indexOf(currentIndex) -
                                    1 +
                                    tracks.length) %
                                    tracks.length
                                ]
                              ]?.title
                            : tracks[
                                (currentIndex - 1 + tracks.length) %
                                  tracks.length
                              ]?.title}
                        </p>
                      </>
                    ) : null}
                  </div>
                )}

                {/* Next Track */}
                {tracks.length > 1 && (
                  <div className="col-span-1 text-right">
                    {currentIndex < tracks.length - 1 || isShuffled ? (
                      <>
                        <p className="text-pink-200 font-medium">Next:</p>
                        <p className="text-white/70 truncate">
                          {isShuffled
                            ? tracks[
                                shuffledIndices[
                                  (shuffledIndices.indexOf(currentIndex) + 1) %
                                    tracks.length
                                ]
                              ]?.title
                            : tracks[(currentIndex + 1) % tracks.length]?.title}
                        </p>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <audio
          ref={audioRef}
          src={currentTrack ? currentTrack.url : undefined}
          onTimeUpdate={controls.handleTimeUpdate}
          onLoadedMetadata={controls.handleLoadedMetadata}
        />

        {tracks.length === 0 ? (
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
        {showPlaylist && tracks.length > 0 && (
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
                tracks={tracks}
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
