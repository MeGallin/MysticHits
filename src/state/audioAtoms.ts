import { atom } from 'jotai';

export const currentTrackAtom = atom<{ title: string; url: string } | null>(
  null,
);
export const isPlayingAtom = atom<boolean>(false);
export const volumeAtom = atom<number>(1);
