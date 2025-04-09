import React from 'react';
import { AudioControls } from './AudioControls';
import { AudioProgress } from './AudioProgress';
import { TrackList } from './TrackList';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Track } from '../types/audio';

const AudioPlayer: React.FC = () => {
  const [tracks, setTracks] = React.useState<Track[]>([]);
  const [musicFolder, setMusicFolder] = React.useState<string>('');
  const [folderError, setFolderError] = React.useState<string>('');

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

        const newTracks: Track[] = audioFiles.map((file) => ({
          title: file.name.substring(0, file.name.lastIndexOf('.')),
          url: URL.createObjectURL(file),
        }));

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
    error,
    controls,
  } = useAudioPlayer(tracks);

  if (error) {
    return (
      <div className="w-full max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg w-full mx-auto p-6 bg-white bg-opacity-50 rounded-lg shadow-lg flex flex-col flex-1 overflow-hidden">
      <div className="mb-4">
        <button
          onClick={handleFolderSelect}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Select Music Folder
        </button>
        {folderError && (
          <p className="mt-2 text-red-500 text-sm">{folderError}</p>
        )}
        {musicFolder && (
          <p className="mt-2 text-sm text-gray-600 truncate">
            Selected: {musicFolder}
          </p>
        )}
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 text-center">
        {currentTrack ? currentTrack.title : 'No Track Selected'}
      </h2>
      <audio
        ref={audioRef}
        src={currentTrack ? currentTrack.url : undefined}
        onTimeUpdate={controls.handleTimeUpdate}
        onLoadedMetadata={controls.handleLoadedMetadata}
      />

      {tracks.length === 0 ? (
        <>
          <div className="bg-purple-100 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-purple-800">
              Discover New Music!
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Stream thousands of songs with a premium subscription.
            </p>
            <button className="mt-2 px-4 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
              Try Now
            </button>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg text-center flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Upgrade Your Sound
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Get 20% off premium headphones this week!
            </p>
            <button className="mt-2 px-4 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
              Shop Now
            </button>
          </div>

          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-blue-800">
              Learn to Play
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Sign up for online music lessons today!
            </p>
            <button className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              Start Learning
            </button>
          </div>

          <div className="bg-green-100 p-4 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-green-800">
              Share Your Vibe
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Create and share playlists with friends.
            </p>
            <button className="mt-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
              Get Started
            </button>
          </div>
        </>
      ) : (
        <div>
          <AudioControls
            isPlaying={isPlaying}
            onPlayPause={controls.togglePlay}
            onRewind={controls.handleRewind}
            onFastForward={controls.handleFastForward}
            onStop={controls.handleStop}
            isShuffled={controls.isShuffled}
            onShuffle={controls.toggleShuffle}
            isMuted={controls.isMuted}
            onMute={controls.toggleMute}
          />
          <AudioProgress
            progress={progress}
            duration={duration}
            volume={volume}
            onProgressChange={controls.handleProgressChange}
            onVolumeChange={controls.handleVolumeChange}
          />
          <div className="mt-4 flex-1 overflow-auto min-h-0">
            <TrackList
              tracks={tracks}
              currentTrack={currentTrack}
              onTrackSelect={controls.handleTrackSelect}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
