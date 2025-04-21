/// <reference types="vite/client" />

/**
 * Type declarations for various file formats
 * These declarations allow TypeScript to understand imports of non-code files
 */

/**
 * MP3 audio file declaration
 * Allows importing .mp3 files as modules in TypeScript
 */
declare module '*.mp3' {
  const src: string;
  export default src;
}

/**
 * WAV audio file declaration
 * Allows importing .wav files as modules in TypeScript
 */
declare module '*.wav' {
  const src: string;
  export default src;
}
