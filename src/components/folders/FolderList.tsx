import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import { useToast } from '@/hooks/use-toast';
import {
  foldersAtom,
  foldersLoadingAtom,
  foldersErrorAtom,
  editingFolderAtom,
  selectedFolderIdAtom,
} from '@/state/folderAtoms';
import folderServices, { Folder } from '@/services/folderServices';
import FolderCard from './FolderCard';
import FolderFormDialog from './FolderFormDialog';
import { logout } from '@/state/authAtoms';
import FolderGrid from './FolderGrid';

const FolderList: React.FC = () => {
  const [folders, setFolders] = useAtom(foldersAtom);
  const [isLoading, setIsLoading] = useAtom(foldersLoadingAtom);
  const [error, setError] = useAtom(foldersErrorAtom);
  const [editingFolder, setEditingFolder] = useAtom(editingFolderAtom);
  const [, setSelectedFolderId] = useAtom(selectedFolderIdAtom);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch folders on component mount
  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await folderServices.getFolders();

      if (response.success && response.data) {
        setFolders(response.data);
      } else {
        setError(response.error || 'Failed to fetch folders');

        // Check if the error is related to authentication
        if (
          response.error?.includes('Authentication token is invalid or expired')
        ) {
          toast({
            title: 'Authentication Error',
            description: 'Your session has expired. Please log in again.',
            variant: 'destructive',
          });

          // Log the user out and redirect to login page
          setTimeout(() => {
            logout();
            navigate('/login');
          }, 2000);
        } else {
          toast({
            title: 'Error',
            description: response.error || 'Failed to fetch folders',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      setError('An unexpected error occurred');
      toast({
        title: 'Error',
        description: 'Failed to load folders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFolder = () => {
    setEditingFolder(null);
    setIsFormDialogOpen(true);
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setIsFormDialogOpen(true);
  };

  const handleSaveFolder = async (folderData: {
    label: string;
    path: string;
  }) => {
    try {
      if (editingFolder) {
        // Update existing folder
        const response = await folderServices.updateFolder(
          editingFolder._id,
          folderData,
        );

        if (response.success) {
          // Update the folder in our state
          setFolders(
            folders.map((folder) =>
              folder._id === editingFolder._id
                ? { ...folder, ...folderData }
                : folder,
            ),
          );

          toast({
            title: 'Folder updated',
            description: 'Your folder has been updated successfully',
          });
        } else {
          toast({
            title: 'Error',
            description: response.error || 'Failed to update folder',
            variant: 'destructive',
          });
        }
      } else {
        // Create new folder
        const response = await folderServices.addFolder(folderData);

        if (response.success && response.data) {
          // Add the new folder to our state
          setFolders([...folders, response.data]);

          toast({
            title: 'Folder created',
            description: 'Your folder has been created successfully',
          });
        } else {
          toast({
            title: 'Error',
            description: response.error || 'Failed to create folder',
            variant: 'destructive',
          });
        }
      }

      // Close the dialog
      setIsFormDialogOpen(false);
    } catch (error) {
      console.error('Error saving folder:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const response = await folderServices.deleteFolder(folderId);

      if (response.success) {
        // Remove the folder from our state
        setFolders(folders.filter((folder) => folder._id !== folderId));

        toast({
          title: 'Folder deleted',
          description: 'Your folder has been deleted successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete folder',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const handlePlayFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
    // Redirect to home page with folder ID instead of player page
    navigate(`/?fid=${folderId}`);
  };

  if (isLoading && folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin mb-4"></div>
        <p>Loading folders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">My Folders</h1>
        <div className="flex gap-2">
          <Button onClick={handleAddFolder} className="flex items-center gap-1">
            <FiPlus /> Add Folder
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-200 p-4 rounded-md mb-6 flex flex-col">
          <div className="flex justify-between items-center">
            <div>{error}</div>
            {!error.includes('Authentication token is invalid or expired') && (
              <Button
                variant="outline"
                size="sm"
                onClick={fetchFolders}
                className="text-white border-white hover:bg-red-500/30"
                disabled={isLoading}
              >
                <FiRefreshCw
                  className={`mr-2 ${isLoading ? 'animate-spin' : ''}`}
                />
                Retry
              </Button>
            )}
          </div>
          {error.includes('Authentication token is invalid or expired') && (
            <p className="text-sm mt-2">Redirecting to login page...</p>
          )}
        </div>
      )}

      {folders.length === 0 && !isLoading ? (
        <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-300 mb-2">
            No folders yet
          </h2>
          <p className="text-gray-400 mb-6">
            Add your first folder to get started.
          </p>
          <Button onClick={handleAddFolder}>
            <FiPlus className="mr-2" /> Add Your First Folder
          </Button>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 gap-8">
            {/* Folders Grid with DND */}
            <div className="col-span-full">
              <FolderGrid
                folders={folders}
                onEdit={handleEditFolder}
                onDelete={handleDeleteFolder}
                onPlay={handlePlayFolder}
                onReorder={(newFolders) => setFolders(newFolders)}
              />
            </div>

            {/* Add Folder Card - rendered separately to avoid DnD context issues */}
            <div className="flex flex-col w-full max-w-md mx-auto md:mx-0">
              <Card
                className="w-full flex items-center justify-center bg-gray-800/50 border-dashed border-gray-700 hover:border-gray-500 transition-colors cursor-pointer h-[180px]"
                onClick={handleAddFolder}
              >
                <div className="flex flex-col items-center p-6">
                  <div className="h-12 w-12 bg-gray-700/50 rounded-full flex items-center justify-center mb-2">
                    <FiPlus className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-gray-400 font-medium">Add Folder</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Dialog for adding/editing folders */}
      <FolderFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        folderToEdit={editingFolder}
      />
    </div>
  );
};

export default FolderList;
