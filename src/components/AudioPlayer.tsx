import React, { useState } from 'react';
import { AudioControls } from './AudioControls';
import { TrackList } from './TrackList';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Track } from '../types/audio';

const AudioPlayer: React.FC = () => {
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
    error,
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
    <div className="flex flex-col w-full max-w-md mx-auto bg-gradient-to-br from-purple-900 via-fuchsia-900 to-blue-900 rounded-xl shadow-lg overflow-hidden text-white">
      {/* Select Music Button */}
      <div className="px-6 pt-4">
        <button
          onClick={handleFolderSelect}
          className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors shadow-md"
        >
          Select Music Folder
        </button>
        {folderError && (
          <p className="mt-2 text-red-300 text-sm">{folderError}</p>
        )}
      </div>

      {/* Track Info */}
      <div className="p-6 bg-gradient-to-br from-pink-500/20 to-blue-500/20">
        <div className="text-white">
          <h2 className="text-2xl font-bold">
            {currentTrack ? currentTrack.title : 'No Track Selected'}
          </h2>
          <p className="text-sm opacity-90">
            {currentTrack?.artist || 'Select a track to play'}
          </p>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentTrack ? currentTrack.url : undefined}
        onTimeUpdate={controls.handleTimeUpdate}
        onLoadedMetadata={controls.handleLoadedMetadata}
      />

      {tracks.length === 0 ? (
        <div className="p-6 space-y-4">
          <div className="text-center text-white/80">
            <p>Select a music folder to get started</p>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
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
                className="h-full bg-gradient-to-r from-pink-500 to-blue-500 rounded-full pointer-events-none"
                style={{
                  width: `${duration > 0 ? (progress / duration) * 100 : 0}%`,
                }}
              ></div>
              <div
                className="absolute top-1/2 h-3 w-3 rounded-full bg-white shadow-md -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${duration > 0 ? (progress / duration) * 100 : 0}%`,
                  transform: 'translateX(-50%) translateY(-50%)',
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="text-pink-200">{formatTime(progress)}</span>
              <span className="text-blue-200">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <AudioControls
            isPlaying={isPlaying}
            onPlayPause={controls.togglePlay}
            onPrevious={controls.handleRewind}
            onNext={controls.handleFastForward}
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
        <div className="border-t border-white/10 p-4 max-h-64 overflow-y-auto bg-gradient-to-br from-purple-900/80 to-blue-900/80">
          <h3 className="font-medium mb-2">Up Next</h3>
          <TrackList
            tracks={tracks}
            currentTrack={currentTrack}
            onTrackSelect={controls.handleTrackSelect}
            formatTime={formatTime}
          />
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
