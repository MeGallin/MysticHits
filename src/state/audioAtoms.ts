import { atom } from 'jotai';
import { Track } from '../types/audio';

export const currentTrackAtom = atom<Track | null>(null);
export const isPlayingAtom = atom<boolean>(false);
export const volumeAtom = atom<number>(0.8); // Default to 80% volume
