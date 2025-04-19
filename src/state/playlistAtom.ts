import { atom } from 'jotai';
import { Track } from '../types/audio';

/**
 * Atom that stores the current playlist of tracks
 * This can be imported and used across components
 */
export const playlistAtom = atom<Track[]>([]);
