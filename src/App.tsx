import React, { useEffect } from 'react';
import AppRouter from './AppRouter';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import { Toaster } from '@/components/ui/toaster';
import { useAtom } from 'jotai';
import { playlistAtom } from './state/playlistAtom';
import {
  currentTrackAtom,
  isPlayingAtom,
  trackDurationsAtom,
} from './state/audioAtoms';
import { debugTokenFromStorage } from './utils/tokenDebugger';
import ErrorBoundary from './components/ErrorBoundary';
import RateLimitBanner from './components/RateLimitBanner';
import { setupApiErrorHandlers } from './utils/apiErrorHandler';
import { initializeAuth, logout } from './state/authAtoms';
import axios from 'axios';
import { fixTokenAndUpdateHeaders } from './utils/tokenFixer';
import { addAuthResetButton } from './utils/authReset';

// Initialize API error handlers
setupApiErrorHandlers();

// First, debug token state before any operations
debugTokenFromStorage();

// Force clean any token in localStorage
try {
  const token = localStorage.getItem('token');
  if (token) {
    // Clean the token of quotes and whitespace
    let cleanedToken = token;
    if (token.startsWith('"') && token.endsWith('"')) {
      cleanedToken = token.substring(1, token.length - 1);
    }
    cleanedToken = cleanedToken.trim();

    // Handle any padding characters that might cause validation issues
    // Some tokens might have padding characters that need to be fixed
    cleanedToken = cleanedToken.replace(/=+$/, '');

    // Only update if we actually cleaned something
    if (cleanedToken !== token) {
      localStorage.setItem('token', cleanedToken);
      console.debug('Token was cleaned during App initialization');

      // Debug after cleaning
      debugTokenFromStorage();
    }
  }
} catch (e) {
  console.error('Error cleaning token:', e);
}

// Now run the standard token fixer
const fixedToken = fixTokenAndUpdateHeaders();
if (fixedToken) {
  // Set up axios default authorization header with the fixed token
  axios.defaults.headers.common['Authorization'] = `Bearer ${fixedToken}`;
  console.debug('Token fixed and axios headers updated');
}

// Then initialize auth from stored token
// This function now includes additional token format fixing
initializeAuth();

function App() {
  // Get setters for all audio-related atoms
  const [, setPlaylist] = useAtom(playlistAtom);
  const [, setCurrentTrack] = useAtom(currentTrackAtom);
  const [, setIsPlaying] = useAtom(isPlayingAtom);
  const [, setTrackDurations] = useAtom(trackDurationsAtom);

  // Add event listener to clear all audio state on logout
  useEffect(() => {
    const handleLogout = () => {
      // Reset all audio-related state
      setPlaylist([]);
      setCurrentTrack(null);
      setIsPlaying(false);
      setTrackDurations({});
    };

    // Listen for the auth:logout event
    window.addEventListener('auth:logout', handleLogout);

    // Add the auth reset button (the function internally checks for development mode)
    addAuthResetButton();

    // Cleanup the event listener when component unmounts
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [setPlaylist, setCurrentTrack, setIsPlaying, setTrackDurations]);

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Rate limiting banner */}
        <RateLimitBanner />

        {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,50,255,0.15),transparent_70%)] pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none"></div>
        <div
          className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-pink-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none"
          style={{ animationDelay: '1s' }}
        ></div>

        {/* Navigation Header */}
        <header className="w-full z-10">
          <Navigation />
        </header>

        <main className="flex-grow z-10 overflow-y-auto">
          <AppRouter />
        </main>

        <Footer />
      </div>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
