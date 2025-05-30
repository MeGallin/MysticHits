import { useRef, useState, useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  currentTrackAtom,
  isPlayingAtom,
  volumeAtom,
  trackDurationsAtom,
} from '../state/audioAtoms';
import { Track } from '../types/audio';
import { advertisements } from '../data/advertisements';
import {
  logPlay,
  updatePlayEvent,
  logInteraction,
} from '../services/trackingService';
import { sessionManager, qualityTracker } from '../utils/sessionManager';

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
  const [trackDurations, setTrackDurations] = useAtom(trackDurationsAtom);

  // Enhanced analytics state
  const [currentPlayEventId, setCurrentPlayEventId] = useState<string | null>(
    null,
  );
  const [trackStartTime, setTrackStartTime] = useState<number>(0);
  const [lastProgressUpdate, setLastProgressUpdate] = useState<number>(0);

  // Shuffle logic
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

  // Set initial track
  useEffect(() => {
    if (!currentTrack && tracks.length > 0) {
      const initialIndex = shuffledIndices[0] || 0;
      setCurrentTrack(tracks[initialIndex]);
      setCurrentIndex(initialIndex);
    }
  }, [currentTrack, setCurrentTrack, tracks, shuffledIndices]);

  // Set volume
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

  // PLAY/PAUSE EFFECT WITH ROBUST ERROR HANDLING
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          if (
            error.name === 'AbortError' ||
            error.message?.includes('interrupted') ||
            error.message?.includes('removed from the document')
          ) {
            // Ignore rapid user action errors
          } else {
            setError('Error playing audio: ' + error.message);
            setIsPlaying(false);
          }
        });

        if (currentTrack) {
          logPlayEvent(currentTrack);
        }
      } else {
        audioRef.current.pause();
        // Save analytics on pause
        if (currentPlayEventId && trackStartTime > 0) {
          const listenDuration = Math.floor(
            (Date.now() - trackStartTime) / 1000,
          );
          updateCurrentPlayEvent({
            listenDuration,
            completed: false,
          });
        }
      }
    }
  }, [
    isPlaying,
    currentTrack,
    setIsPlaying,
    currentPlayEventId,
    trackStartTime,
    // logPlayEvent, updateCurrentPlayEvent: see below
  ]);

  // Analytics helpers
  const logPlayEvent = useCallback(
    async (track: Track, manualSelection: boolean = false) => {
      try {
        const playEventId = await logPlay(
          {
            trackUrl: track.url,
            title: track.title,
            duration: duration || track.duration,
          },
          {
            track,
            tracks,
            currentIndex,
            isShuffled,
            isRepeating,
            manualSelection,
            playlistId: undefined,
          },
        );
        if (playEventId) {
          setCurrentPlayEventId(playEventId);
          setTrackStartTime(Date.now());
        }
      } catch (error) {
        // Do not block playback for analytics
      }
    },
    [duration, tracks, currentIndex, isShuffled, isRepeating],
  );

  const updateCurrentPlayEvent = useCallback(
    async (updates: {
      listenDuration?: number;
      completed?: boolean;
      skipped?: boolean;
      skipTime?: number;
      repeated?: boolean;
      liked?: boolean;
      shared?: boolean;
    }) => {
      if (!currentPlayEventId) return;
      try {
        const qualityMetrics = qualityTracker.getMetrics();
        await updatePlayEvent(currentPlayEventId, {
          ...updates,
          ...qualityMetrics,
          endedAt: new Date().toISOString(),
        });
      } catch (error) {}
    },
    [currentPlayEventId],
  );

  const logUserInteraction = useCallback(
    async (interactionType: 'like' | 'share' | 'repeat', value: boolean) => {
      if (!currentTrack) return;
      try {
        await logInteraction(currentTrack.url, interactionType, value);
        await updateCurrentPlayEvent({
          [interactionType === 'like'
            ? 'liked'
            : interactionType === 'share'
            ? 'shared'
            : 'repeated']: value,
        });
      } catch (error) {}
    },
    [currentTrack, updateCurrentPlayEvent],
  );

  // Track progress
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      setProgress(currentTime);
      const now = Date.now();
      if (
        now - lastProgressUpdate > 30000 &&
        currentPlayEventId &&
        trackStartTime > 0
      ) {
        const listenDuration = Math.floor((now - trackStartTime) / 1000);
        updateCurrentPlayEvent({
          listenDuration,
          completed: false,
        });
        setLastProgressUpdate(now);
      }
    }
  }, [
    currentPlayEventId,
    trackStartTime,
    lastProgressUpdate,
    updateCurrentPlayEvent,
  ]);

  // Track next/prev/repeat
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

  // ====== THE ROBUST TRACK SELECTION HANDLER ======
  const handleTrackSelect = useCallback(
    (index: number) => {
      // Analytics (as before)
      if (currentPlayEventId && trackStartTime > 0) {
        const listenDuration = Math.floor((Date.now() - trackStartTime) / 1000);
        const completed = duration > 0 && listenDuration >= duration * 0.8;
        updateCurrentPlayEvent({
          listenDuration,
          completed,
          skipped: !completed,
          skipTime: completed ? undefined : listenDuration,
        });
      }

      setCurrentPlayEventId(null);
      setTrackStartTime(0);
      qualityTracker.reset();

      if (isShuffled) setIsShuffled(false);

      // THE FIX: Pause/reset audio before changing tracks!
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch {}
      }

      setCurrentIndex(index);
      setCurrentTrack(tracks[index]);
      setIsPlaying(true); // Auto-play when selecting a track
      setProgress(0);
      setError(null);
    },
    [
      tracks,
      setCurrentTrack,
      setIsPlaying,
      isShuffled,
      currentPlayEventId,
      trackStartTime,
      duration,
      updateCurrentPlayEvent,
    ],
  );

  // Repeat, shuffle, progress
  const togglePlay = useCallback(
    () => setIsPlaying(!isPlaying),
    [isPlaying, setIsPlaying],
  );
  const toggleShuffle = useCallback(() => setIsShuffled((prev) => !prev), []);
  const toggleRepeat = useCallback(() => setIsRepeating((prev) => !prev), []);
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
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      setDuration(audioDuration);
      qualityTracker.setAudioElement(audioRef.current);

      if (currentTrack && currentIndex >= 0 && currentIndex < tracks.length) {
        if (currentTrack.url) {
          setTrackDurations((prevDurations) => ({
            ...prevDurations,
            [currentTrack.url]: audioDuration,
          }));
        }
      }
      setError(null);
    }
  }, [currentTrack, currentIndex, tracks, setTrackDurations]);

  // Show/hide advertisements and repeat logic (unchanged)
  const showAdvertisement = useCallback(() => {
    const randomAdIndex = Math.floor(Math.random() * advertisements.length);
    setCurrentAdId(advertisements[randomAdIndex].id);
    setShowingAd(true);
    setIsPlaying(false);
  }, [setIsPlaying]);
  const closeAdvertisement = useCallback(() => {
    setShowingAd(false);
    setCurrentAdId(null);
    setIsPlaying(true);
  }, [setIsPlaying]);

  const handleTrackEnd = useCallback(() => {
    if (currentPlayEventId && trackStartTime > 0) {
      const listenDuration = Math.floor((Date.now() - trackStartTime) / 1000);
      updateCurrentPlayEvent({
        listenDuration,
        completed: true,
      });
    }
    if (isRepeating && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        setError('Error playing audio: ' + error.message);
        setIsPlaying(false);
      });
      if (currentTrack) {
        logUserInteraction('repeat', true);
      }
    } else {
      setCurrentPlayEventId(null);
      setTrackStartTime(0);
      qualityTracker.reset();
      const shouldShowAd = Math.random() < 0.3;
      if (shouldShowAd) {
        showAdvertisement();
        setTimeout(() => {
          closeAdvertisement();
          playNextTrack();
        }, 5000);
      } else {
        playNextTrack();
      }
    }
  }, [
    playNextTrack,
    isRepeating,
    setIsPlaying,
    showAdvertisement,
    closeAdvertisement,
    currentPlayEventId,
    trackStartTime,
    updateCurrentPlayEvent,
    currentTrack,
    logUserInteraction,
  ]);

  // Track end event listener
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('ended', handleTrackEnd);
      return () => {
        audio.removeEventListener('ended', handleTrackEnd);
      };
    }
  }, [handleTrackEnd]);

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
    logUserInteraction,
    controls: {
      togglePlay,
      handleTimeUpdate,
      handleLoadedMetadata,
      handleFastForward,
      handleRewind,
      playNextTrack,
      playPreviousTrack,
      handleVolumeChange: (value: number) => setVolume(value),
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
