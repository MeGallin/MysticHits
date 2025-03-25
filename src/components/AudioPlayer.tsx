import React, { useRef, useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  currentTrackAtom,
  isPlayingAtom,
  volumeAtom,
} from '../state/audioAtoms';

interface Track {
  title: string;
  url: string;
}

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
  // Use dynamically imported tracks
  const tracks = dynamicTracks;

  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useAtom(currentTrackAtom);
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const [volume, setVolume] = useAtom(volumeAtom);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!currentTrack && tracks.length > 0) {
      setCurrentTrack(tracks[0]);
      setCurrentIndex(0);
    }
  }, [currentTrack, setCurrentTrack, tracks]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((error) => console.error('Error playing audio:', error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleFastForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 10;
    }
  };

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 10;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleTrackSelect = (index: number) => {
    setCurrentIndex(index);
    setCurrentTrack(tracks[index]);
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="max-w-lg w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        {currentTrack ? currentTrack.title : 'No Track Selected'}
      </h2>
      <audio
        ref={audioRef}
        src={currentTrack ? currentTrack.url : undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
        <button
          onClick={togglePlay}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={handleRewind}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
        >
          Rewind 10s
        </button>
        <button
          onClick={handleFastForward}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
        >
          Forward 10s
        </button>
      </div>
      <div className="mt-6">
        <label
          htmlFor="progressRange"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Progress
        </label>
        <input
          id="progressRange"
          type="range"
          min="0"
          max={duration ? duration.toString() : '0'}
          value={progress}
          onChange={(e) => {
            const newTime = parseFloat(e.target.value);
            if (audioRef.current) {
              audioRef.current.currentTime = newTime;
            }
            setProgress(newTime);
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="text-sm text-gray-500 mt-1">
          {Math.floor(progress)} / {Math.floor(duration)} seconds
        </div>
      </div>
      <div className="mt-6">
        <label
          htmlFor="volumeRange"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Volume
        </label>
        <input
          id="volumeRange"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <div className="mt-6">
        <h3 className="font-semibold text-gray-800 mb-2">Tracks</h3>
        <ul className="space-y-2">
          {tracks.map((track, index) => (
            <li key={index}>
              <button
                onClick={() => handleTrackSelect(index)}
                className={`w-full text-left px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition-colors duration-200 ${
                  currentTrack && currentTrack.title === track.title
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-700'
                }`}
              >
                {track.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AudioPlayer;
