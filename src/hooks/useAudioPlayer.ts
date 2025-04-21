import { useRef, useState, useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  currentTrackAtom,
  isPlayingAtom,
  volumeAtom,
} from '../state/audioAtoms';
import { Track } from '../types/audio';
import { advertisements } from '../data/advertisements';

/**
 * Custom hook for audio player functionality
 *
 * This hook encapsulates all the logic for the audio player, including:
 * - Track playback control (play, pause, next, previous)
 * - Volume control
 * - Progress tracking
 * - Shuffle and repeat modes
 * - Advertisement display
 *
 * @param tracks - Array of audio tracks to play
 * @returns Object containing audio player state and controls
 */

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
  const [showingAd, setShowingAd] = useState(false);
  const [currentAdId, setCurrentAdId] = useState<number | null>(null);

  /**
   * Initialize or update shuffled indices when tracks change or shuffle mode changes
   * Creates a randomly shuffled array of indices for shuffle mode
   */
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

  /**
   * Initialize the current track when tracks are loaded
   * Sets the initial track based on shuffle mode
   */
  useEffect(() => {
    if (!currentTrack && tracks.length > 0) {
      const initialIndex = shuffledIndices[0] || 0;
      setCurrentTrack(tracks[initialIndex]);
      setCurrentIndex(initialIndex);
    }
  }, [currentTrack, setCurrentTrack, tracks, shuffledIndices]);

  /**
   * Update audio volume when volume state changes
   * Applies mute state by setting volume to 0 when muted
   */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  /**
   * Toggle mute state
   * Stores previous volume when muting and restores it when unmuting
   */
  const toggleMute = useCallback(() => {
    if (!isMuted) {
      setPreviousVolume(volume);
    } else {
      setVolume(previousVolume);
    }
    setIsMuted(!isMuted);
  }, [isMuted, volume, previousVolume, setVolume]);

  /**
   * Handle play/pause state changes
   * Plays or pauses the audio when isPlaying state changes
   * Includes error handling for failed play attempts
   */
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

  /**
   * Toggle play/pause state
   */
  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  /**
   * Update progress state when audio time changes
   * Called by the audio element's timeupdate event
   */
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  }, []);

  /**
   * Play the next track in the playlist
   * Handles both normal and shuffle modes
   */
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

  /**
   * Play the previous track in the playlist
   * Handles both normal and shuffle modes
   */
  const playPreviousTrack = useCallback(() => {
    if (tracks.length > 0) {
      const currentShuffledIndex = shuffledIndices.indexOf(currentIndex);
      const prevShuffledIndex =
        (currentShuffledIndex - 1 + tracks.length) % tracks.length;
      const prevIndex = isShuffled
        ? shuffledIndices[prevShuffledIndex]
        : (currentIndex - 1 + tracks.length) % tracks.length;

      setCurrentIndex(prevIndex);
      setCurrentTrack(tracks[prevIndex]);
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

  /**
   * Handle audio metadata loading
   * Updates duration state and track duration when audio metadata is loaded
   */
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

  /**
   * Toggle repeat mode for the current track
   */
  const toggleRepeat = useCallback(() => {
    setIsRepeating((prev) => !prev);
  }, []);

  /**
   * Show a random advertisement
   * Selects a random ad from the advertisements array and displays it
   * Pauses playback while the ad is showing
   */
  const showAdvertisement = useCallback(() => {
    // Select a random ad
    const randomAdIndex = Math.floor(Math.random() * advertisements.length);
    setCurrentAdId(advertisements[randomAdIndex].id);
    setShowingAd(true);
    setIsPlaying(false); // Pause playback while ad is showing
  }, [setIsPlaying]);

  /**
   * Close the advertisement and resume playback
   * Hides the ad and resumes audio playback
   */
  const closeAdvertisement = useCallback(() => {
    setShowingAd(false);
    setCurrentAdId(null);
    setIsPlaying(true); // Resume playback
  }, [setIsPlaying]);

  /**
   * Handle track end event
   * Manages what happens when a track finishes playing:
   * - If repeat is on, restarts the current track
   * - Otherwise, may show an ad (30% chance) before playing the next track
   * - Or plays the next track immediately
   */
  const handleTrackEnd = useCallback(() => {
    if (isRepeating && audioRef.current) {
      // If repeat is on, restart the current track
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        setError('Error playing audio: ' + error.message);
        setIsPlaying(false);
      });
    } else {
      // Show an advertisement before playing the next track
      // 30% chance to show an ad between tracks
      const shouldShowAd = Math.random() < 0.3;

      if (shouldShowAd) {
        showAdvertisement();
        // Set a timeout to automatically close the ad after 5 seconds
        setTimeout(() => {
          closeAdvertisement();
          playNextTrack();
        }, 5000);
      } else {
        // Otherwise play the next track immediately
        playNextTrack();
      }
    }
  }, [
    playNextTrack,
    isRepeating,
    setIsPlaying,
    showAdvertisement,
    closeAdvertisement,
  ]);

  /**
   * Set up event listener for track end
   * Attaches the handleTrackEnd callback to the audio element's 'ended' event
   * Cleans up the listener when the component unmounts or dependencies change
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('ended', handleTrackEnd);
      return () => {
        audio.removeEventListener('ended', handleTrackEnd);
      };
    }
  }, [handleTrackEnd]);

  /**
   * Fast forward the current track by 10 seconds
   */
  const handleFastForward = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime += 10;
    }
  }, []);

  /**
   * Rewind the current track by 10 seconds
   */
  const handleRewind = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 10;
    }
  }, []);

  /**
   * Update the volume level
   * @param value - New volume level (0.0 to 1.0)
   */
  const handleVolumeChange = useCallback(
    (value: number) => {
      setVolume(value);
    },
    [setVolume],
  );

  /**
   * Handle track selection from the playlist
   * Sets the selected track as the current track and starts playing it
   * @param index - Index of the selected track in the tracks array
   */
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

  /**
   * Toggle shuffle mode
   * When enabled, tracks will play in a randomized order
   */
  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => !prev);
  }, []);

  /**
   * Update the current playback position
   * @param newTime - New playback position in seconds
   */
  const handleProgressChange = useCallback((newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  }, []);

  /**
   * Stop playback and reset progress
   * Pauses the audio and resets the playback position to the beginning
   */
  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setProgress(0);
      setIsPlaying(false);
    }
  }, [setIsPlaying]);

  /**
   * Return object containing all audio player state and controls
   * This is used by components to interact with the audio player
   */
  return {
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
    showAdvertisement,
    closeAdvertisement,
    controls: {
      togglePlay,
      handleTimeUpdate,
      handleLoadedMetadata,
      handleFastForward,
      handleRewind,
      playNextTrack,
      playPreviousTrack,
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
