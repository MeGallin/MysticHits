import { atom } from 'jotai';
import { Track } from '../types/audio';

/**
 * Jotai atoms for managing audio player state
 * These atoms provide global state management for the audio player
 */

/** Stores the currently selected track */
export const currentTrackAtom = atom<Track | null>(null);

/** Tracks whether audio is currently playing */
export const isPlayingAtom = atom<boolean>(false);

/** Stores the current volume level (0.0 to 1.0) */
export const volumeAtom = atom<number>(0.8); // Default to 80% volume

/** Stores the durations of each track by URL for persistence between displays */
export const trackDurationsAtom = atom<Record<string, number>>({});
