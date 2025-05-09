import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { selectedFolderIdAtom } from '@/state/folderAtoms';
import AudioPlayer from '@/components/AudioPlayer';
import { Button } from '@/components/ui/button';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import folderServices, { PlaylistResponse } from '@/services/folderServices';

const PlayerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedFolderId, setSelectedFolderId] = useAtom(selectedFolderIdAtom);
  const [playlist, setPlaylist] = useState<
    { title: string; url: string; mime: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folderName, setFolderName] = useState<string>('');

  const navigate = useNavigate();

  // Get folder ID from query parameter or atom
  const folderId = searchParams.get('fid') || selectedFolderId;

  // Load playlist when component mounts or folder ID changes
  useEffect(() => {
    if (folderId) {
      loadPlaylist(folderId);
    } else {
      setError('No folder selected');
    }
  }, [folderId]);

  const loadPlaylist = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await folderServices.getFolderPlaylist(id);

      if (response.success && response.data) {
        // Process tracks to ensure they have all required properties
        const processedTracks = response.data.map((track: any) => {
          // Make sure URL is properly formed and decode any double-encoded characters
          let url = track.url;

          try {
            // Fix double-encoded URLs (converting %2520 to %20)
            // First check if URL contains encoded percent signs
            if (url && url.includes('%25')) {
              // Decode once to fix any double encoding
              url = decodeURIComponent(url);
            }

            // Handle special characters in URLs
            if (url && (url.includes('%') || url.includes(' '))) {
              // Make sure spaces are properly encoded
              url = url.replace(/ /g, '%20');

              // Create a valid URL object to ensure proper formatting
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
            url: url,
            mime: track.mime || 'audio/mpeg',
          };
        });

        setPlaylist(processedTracks);

        // Try to extract folder name from first track or use generic name
        const firstTrack = processedTracks[0];
        if (firstTrack) {
          let folderName = 'Playlist';
          try {
            // Try to get folder name from URL path
            if (firstTrack.url) {
              const pathParts = firstTrack.url.split('/');
              // Look for a meaningful name in the URL path
              for (let i = pathParts.length - 2; i >= 0; i--) {
                if (
                  pathParts[i] &&
                  !['api', 'media', 'audio', 'music'].includes(
                    pathParts[i].toLowerCase(),
                  )
                ) {
                  folderName = decodeURIComponent(pathParts[i]);
                  break;
                }
              }
            }
          } catch (e) {
            console.error('Error extracting folder name:', e);
          }

          setFolderName(folderName);
        }
      } else {
        setError(response.error || 'Failed to load playlist');
      }
    } catch (error) {
      setError('An unexpected error occurred while loading the playlist');
      console.error('Error loading playlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/folders');
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Background effects - similar to other pages */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,50,255,0.15),transparent_70%)] pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none"></div>
      <div
        className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: '1s' }}
      ></div>

      <div className="flex-grow flex flex-col z-10">
        <div className="container mx-auto py-6 px-4">
          <div className="mb-4">
            <Button
              variant="ghost"
              className="flex items-center text-gray-400 hover:text-white"
              onClick={handleBack}
            >
              <FiArrowLeft className="mr-2" /> Back to Folders
            </Button>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLoading ? 'Loading Player...' : folderName || 'Music Player'}
            </h1>
            <p className="text-gray-400">
              {playlist.length > 0
                ? `Playing ${playlist.length} tracks from your collection`
                : 'Loading your tracks...'}
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400">
              <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-500/30 rounded-full animate-spin mb-4"></div>
              <p className="text-lg">Loading your music...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 text-red-200 p-6 rounded-lg text-center">
              <p className="text-lg font-semibold mb-2">Error</p>
              <p>{error}</p>
              <Button className="mt-4" onClick={handleBack}>
                Return to Folders
              </Button>
            </div>
          ) : playlist.length > 0 ? (
            <AudioPlayer
              playlist={playlist.map((item) => ({
                title: item.title,
                src: item.url,
                mime: item.mime,
              }))}
            />
          ) : (
            <div className="bg-gray-800/70 text-gray-300 p-6 rounded-lg text-center">
              <p>No tracks found in this folder.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;
