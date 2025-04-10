import { useRef, useState, useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  currentTrackAtom,
  isPlayingAtom,
  volumeAtom,
} from '../state/audioAtoms';
import { Track } from '../types/audio';

export const useAudioPlayer = (tracks: Track[]) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useAtom(currentTrackAtom);
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const [volume, setVolume] = useAtom(volumeAtom);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  // Initialize or update shuffled indices when tracks change or shuffle mode changes
  useEffect(() => {
    if (tracks.length > 0) {
      if (isShuffled) {
        const indices = Array.from({ length: tracks.length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        setShuffledIndices(indices);
      } else {
        setShuffledIndices(Array.from({ length: tracks.length }, (_, i) => i));
      }
    }
  }, [tracks.length, isShuffled]);

  useEffect(() => {
    if (!currentTrack && tracks.length > 0) {
      const initialIndex = shuffledIndices[0] || 0;
      setCurrentTrack(tracks[initialIndex]);
      setCurrentIndex(initialIndex);
    }
  }, [currentTrack, setCurrentTrack, tracks, shuffledIndices]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const toggleMute = useCallback(() => {
    if (!isMuted) {
      setPreviousVolume(volume);
    } else {
      setVolume(previousVolume);
    }
    setIsMuted(!isMuted);
  }, [isMuted, volume, previousVolume, setVolume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          setError('Error playing audio: ' + error.message);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack, setIsPlaying]);

  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  }, []);

  const playNextTrack = useCallback(() => {
    if (tracks.length > 0) {
      const currentShuffledIndex = shuffledIndices.indexOf(currentIndex);
      const nextShuffledIndex = (currentShuffledIndex + 1) % tracks.length;
      const nextIndex = isShuffled
        ? shuffledIndices[nextShuffledIndex]
        : (currentIndex + 1) % tracks.length;

      setCurrentIndex(nextIndex);
      setCurrentTrack(tracks[nextIndex]);
      setProgress(0);
      setIsPlaying(true);
    }
  }, [
    tracks,
    currentIndex,
    shuffledIndices,
    isShuffled,
    setCurrentTrack,
    setIsPlaying,
  ]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      setDuration(audioDuration);

      // Update the track's duration if it's not set
      if (currentTrack && currentIndex >= 0 && currentIndex < tracks.length) {
        const updatedTracks = [...tracks];
        if (
          !updatedTracks[currentIndex].duration ||
          updatedTracks[currentIndex].duration === 0
        ) {
          updatedTracks[currentIndex] = {
            ...updatedTracks[currentIndex],
            duration: audioDuration,
          };
          // We don't need to setTracks here as it would cause a re-render loop
          // This is just updating the duration for display purposes
        }
      }

      setError(null);
    }
  }, [currentTrack, currentIndex, tracks]);

  const toggleRepeat = useCallback(() => {
    setIsRepeating((prev) => !prev);
  }, []);

  const handleTrackEnd = useCallback(() => {
    if (isRepeating && audioRef.current) {
      // If repeat is on, restart the current track
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        setError('Error playing audio: ' + error.message);
        setIsPlaying(false);
      });
    } else {
      // Otherwise play the next track
      playNextTrack();
    }
  }, [playNextTrack, isRepeating, setIsPlaying]);

  // Add event listener for track end
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('ended', handleTrackEnd);
      return () => {
        audio.removeEventListener('ended', handleTrackEnd);
      };
    }
  }, [handleTrackEnd]);

  const handleFastForward = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime += 10;
    }
  }, []);

  const handleRewind = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 10;
    }
  }, []);

  const handleVolumeChange = useCallback(
    (value: number) => {
      setVolume(value);
    },
    [setVolume],
  );

  const handleTrackSelect = useCallback(
    (index: number) => {
      // Disable shuffle mode when manually selecting a track
      if (isShuffled) {
        setIsShuffled(false);
      }
      setCurrentIndex(index);
      setCurrentTrack(tracks[index]);
      setIsPlaying(true); // Auto-play when selecting a track
      setProgress(0);
      setError(null);
    },
    [tracks, setCurrentTrack, setIsPlaying, isShuffled],
  );

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => !prev);
  }, []);

  const handleProgressChange = useCallback((newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  }, []);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setProgress(0);
      setIsPlaying(false);
    }
  }, [setIsPlaying]);

  return {
    audioRef,
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    currentIndex,
    error,
    controls: {
      togglePlay,
      handleTimeUpdate,
      handleLoadedMetadata,
      handleFastForward,
      handleRewind,
      handleVolumeChange,
      handleTrackSelect,
      handleProgressChange,
      handleStop,
      toggleShuffle,
      isShuffled,
      toggleRepeat,
      isRepeating,
      isMuted,
      toggleMute,
    },
  };
};
