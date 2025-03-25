import React from 'react';
import { AudioControls } from './AudioControls';
import { AudioProgress } from './AudioProgress';
import { TrackList } from './TrackList';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Track } from '../types/audio';

// Dynamically import all mp3 files from the assets folder
const trackModules = (import.meta as any).globEager('../assets/*.mp3');
const dynamicTracks: Track[] = Object.entries(trackModules).map(
  ([path, module]) => {
    const fileName = path.split('/').pop()?.replace('.mp3', '');
    return {
      title: fileName || 'Unknown',
      url: (module as { default: string }).default,
    };
  },
);

const AudioPlayer: React.FC = () => {
  const {
    audioRef,
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    error,
    controls,
  } = useAudioPlayer(dynamicTracks);

  if (error) {
    return (
      <div className="w-full max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">
        {currentTrack ? currentTrack.title : 'No Track Selected'}
      </h2>

      <audio
        ref={audioRef}
        src={currentTrack ? currentTrack.url : undefined}
        onTimeUpdate={controls.handleTimeUpdate}
        onLoadedMetadata={controls.handleLoadedMetadata}
      />

      <AudioControls
        isPlaying={isPlaying}
        onPlayPause={controls.togglePlay}
        onRewind={controls.handleRewind}
        onFastForward={controls.handleFastForward}
        onStop={controls.handleStop}
        isShuffled={controls.isShuffled}
        onShuffle={controls.toggleShuffle}
      />

      <AudioProgress
        progress={progress}
        duration={duration}
        volume={volume}
        onProgressChange={controls.handleProgressChange}
        onVolumeChange={controls.handleVolumeChange}
      />

      <TrackList
        tracks={dynamicTracks}
        currentTrack={currentTrack}
        onTrackSelect={controls.handleTrackSelect}
      />
    </div>
  );
};

export default AudioPlayer;
