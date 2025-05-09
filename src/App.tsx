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
import ErrorBoundary from './components/ErrorBoundary';
import RateLimitBanner from './components/RateLimitBanner';
import { setupApiErrorHandlers } from './utils/apiErrorHandler';
import { initializeAuth, logout } from './state/authAtoms';
import axios from 'axios';
import { fixTokenAndUpdateHeaders } from './utils/tokenFixer';

// Initialize API error handlers
setupApiErrorHandlers();

// Check for and fix token format issues, then set up axios default authorization header
const fixedToken = fixTokenAndUpdateHeaders();
if (fixedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${fixedToken}`;
}

// Initialize auth from stored token
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
