import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  FiPlus,
  FiFolder,
  FiGlobe,
  FiEdit2,
  FiTrash2,
  FiPlay,
  FiRefreshCw,
} from 'react-icons/fi';
import { useToast } from '@/hooks/use-toast';
import folderServices, { Folder } from '@/services/folderServices';
import FolderFormDialog from '../folders/FolderFormDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserFolderListProps {
  userId: string;
  userName: string;
  onPlayFolder?: (userId: string, folderId: string) => void;
}

const UserFolderList: React.FC<UserFolderListProps> = ({
  userId,
  userName,
  onPlayFolder,
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch user's folders on component mount
  useEffect(() => {
    fetchUserFolders();
  }, [userId]);

  const fetchUserFolders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await folderServices.getUserFolders(userId);

      if (response.success && response.data) {
        setFolders(response.data);
      } else {
        setError(response.error || 'Failed to fetch user folders');
        toast({
          title: 'Error',
          description: response.error || 'Failed to fetch user folders',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setError('An unexpected error occurred');
      toast({
        title: 'Error',
        description: 'Failed to load user folders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
      if (!editingFolder) {
        return;
      }

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
          description: `The folder has been updated successfully for ${userName}`,
        });

        // Close the dialog
        setIsFormDialogOpen(false);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update folder',
          variant: 'destructive',
        });
      }
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
          description: `The folder has been deleted successfully from ${userName}'s list`,
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
    if (onPlayFolder) {
      onPlayFolder(userId, folderId);
    }
  };

  if (isLoading && folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400">
        <div className="w-8 h-8 border-2 border-t-blue-500 border-b-blue-500 rounded-full animate-spin mb-2"></div>
        <p>Loading folders...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-white">
          {userName}'s Folders ({folders.length})
        </h2>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchUserFolders}
          className="flex items-center gap-1"
          disabled={isLoading}
        >
          <FiRefreshCw
            className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-200 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      {folders.length === 0 && !isLoading ? (
        <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-400">This user has no folders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {folders.map((folder) => (
            <Card key={folder._id} className="bg-gray-800/70 border-gray-700">
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 truncate">
                    {folder.path.startsWith('http') ? (
                      <FiGlobe className="text-blue-400 h-4 w-4 flex-shrink-0" />
                    ) : (
                      <FiFolder className="text-purple-400 h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="font-medium truncate">{folder.label}</span>
                  </div>

                  <div className="text-xs text-gray-500">
                    {new Date(folder.created).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-xs text-gray-400 break-all mb-3">
                  {folder.path}
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1 flex items-center justify-center"
                    onClick={() => handlePlayFolder(folder._id)}
                  >
                    <FiPlay className="mr-1 h-3 w-3" /> Play
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 flex items-center justify-center"
                    onClick={() => handleEditFolder(folder)}
                  >
                    <FiEdit2 className="mr-1 h-3 w-3" /> Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 flex items-center justify-center"
                      >
                        <FiTrash2 className="mr-1 h-3 w-3" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete folder</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the folder "
                          {folder.label}" from {userName}'s list? This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteFolder(folder._id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog for editing folders */}
      <FolderFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSave={handleSaveFolder}
        folder={editingFolder}
        title={`Edit Folder for ${userName}`}
      />
    </div>
  );
};

export default UserFolderList;
