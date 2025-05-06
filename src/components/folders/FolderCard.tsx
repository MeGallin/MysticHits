import React from 'react';
import { FiEdit2, FiTrash2, FiPlay } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { formatDateRelative } from '@/utils/dateFormatter';
import { Folder } from '@/services/folderServices';

interface FolderCardProps {
  folder: Folder;
  onEdit: (folder: Folder) => void;
  onDelete: (folderId: string) => void;
  onPlay: (folderId: string) => void;
}

const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onEdit,
  onDelete,
  onPlay,
}) => {
  const isRemote = folder.path.startsWith('http');

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this folder?')) {
      onDelete(folder._id);
    }
  };

  return (
    <Card className="bg-gray-800/70 border border-gray-700 hover:border-gray-600 transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-white font-semibold">
            {folder.label}
          </CardTitle>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700/50"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(folder);
              }}
            >
              <FiEdit2 className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-gray-700/50"
              onClick={handleDelete}
            >
              <FiTrash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-xs text-gray-400 break-all">
            <span
              className={`inline-block px-2 py-1 rounded-full mr-2 text-xs ${
                isRemote
                  ? 'bg-blue-900/40 text-blue-300'
                  : 'bg-purple-900/40 text-purple-300'
              }`}
            >
              {isRemote ? 'Remote' : 'Local'}
            </span>
            {folder.path}
          </div>
          <div className="text-xs text-gray-500">
            Created {formatDateRelative(folder.created)}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full flex items-center justify-center gap-2"
          onClick={() => onPlay(folder._id)}
        >
          <FiPlay className="h-4 w-4" />
          Play Folder
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FolderCard;
