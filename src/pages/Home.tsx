import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { selectedFolderIdAtom } from '@/state/folderAtoms';
import AudioPlayer from '../components/AudioPlayer';
import folderServices from '@/services/folderServices';
import { useToast } from '@/hooks/use-toast';
import { isAuthenticated } from '@/utils/authUtils';

export default function Home() {
  const [searchParams] = useSearchParams();
  const [selectedFolderId, setSelectedFolderId] = useAtom(selectedFolderIdAtom);
  const [playlist, setPlaylist] = useState<
    { title: string; src: string; mime: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [folderName, setFolderName] = useState<string>('');
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  // Get folder ID from query parameter or atom
  const folderId = searchParams.get('fid') || selectedFolderId;

  // Update auth state when it changes
  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(isAuthenticated());
      // Clear playlist if logged out
      if (!isAuthenticated()) {
        setPlaylist([]);
      }
    };

    window.addEventListener('auth:login', handleAuthChange);
    window.addEventListener('auth:logout', handleAuthChange);

    return () => {
      window.removeEventListener('auth:login', handleAuthChange);
      window.removeEventListener('auth:logout', handleAuthChange);
    };
  }, []);

  // Load playlist when component mounts or folder ID changes, but only if user is authenticated
  useEffect(() => {
    if (folderId && isLoggedIn) {
      loadPlaylist(folderId);
    }
  }, [folderId, isLoggedIn]);

  const loadPlaylist = async (id: string) => {
    // Double-check authentication before making API call
    if (!isAuthenticated()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await folderServices.getFolderPlaylist(id);

      if (response.success && response.data) {
        // Process tracks to ensure they have all required properties
        const processedTracks = response.data.map((track: any) => {
          // Make sure URL is properly formed and decode any double-encoded characters
          let url = track.url;

          try {
            // Fix double-encoded URLs (converting %2520 to %20)
            if (url && url.includes('%25')) {
              url = decodeURIComponent(url);
            }

            // Handle special characters in URLs
            if (url && (url.includes('%') || url.includes(' '))) {
              url = url.replace(/ /g, '%20');

              try {
                if (url.startsWith('http')) {
                  const parsedUrl = new URL(url);
                  url = parsedUrl.toString();
                }
              } catch (e) {
                console.warn('Error parsing URL:', e);
              }
            }

            // If it's a relative path, convert to absolute
            if (
              url &&
              !url.startsWith('http') &&
              !url.startsWith('blob:') &&
              url.startsWith('/')
            ) {
              url = `${window.location.origin}${url}`;
            }
          } catch (e) {
            console.error('Error processing URL:', e, url);
          }

          return {
            title: track.title || 'Unknown Title',
            src: url,
            mime: track.mime || 'audio/mpeg',
          };
        });

        setPlaylist(processedTracks);

        // Extract folder name for toast notification
        if (processedTracks.length > 0) {
          const firstTrack = processedTracks[0];
          let name = 'Playlist';

          try {
            if (firstTrack.src) {
              const pathParts = firstTrack.src.split('/');
              for (let i = pathParts.length - 2; i >= 0; i--) {
                if (
                  pathParts[i] &&
                  !['api', 'media', 'audio', 'music'].includes(
                    pathParts[i].toLowerCase(),
                  )
                ) {
                  name = decodeURIComponent(pathParts[i]);
                  break;
                }
              }
            }
            setFolderName(name);

            // Show success toast
            toast({
              title: 'Playlist loaded',
              description: `Playing ${processedTracks.length} tracks from ${name}`,
              duration: 3000,
            });
          } catch (e) {
            console.error('Error extracting folder name:', e);
          }
        }
      } else {
        console.error('Failed to load playlist:', response.error);
        toast({
          title: 'Error',
          description: response.error || 'Failed to load playlist',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while loading the playlist',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return <AudioPlayer playlist={playlist} />;
}
