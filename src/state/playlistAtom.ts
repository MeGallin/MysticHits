import { atom } from 'jotai';
import { Track } from '../types/audio';

/**
 * Jotai atom for managing the playlist state
 *
 * This atom stores the list of tracks loaded from remote sources.
 * It's separate from local tracks to allow different handling of
 * remote vs local audio files.
 *
 * Components can subscribe to this atom to react to playlist changes.
 */
export const playlistAtom = atom<Track[]>([]);
