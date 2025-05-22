import React from 'react';
import { FiEdit2, FiTrash2, FiPlay, FiMove } from 'react-icons/fi';
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
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FolderCardProps {
  folder: Folder;
  onEdit: (folder: Folder) => void;
  onDelete: (folderId: string) => void;
  onPlay: (folderId: string) => void;
  id?: string; // Optional for drag-and-drop
}

const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onEdit,
  onDelete,
  onPlay,
  id,
}) => {
  const isRemote = folder.path.startsWith('http');

  // Only useSortable if id is provided (for drag-and-drop)
  const sortable = id ? useSortable({ id }) : undefined;
  const style = sortable
    ? {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        opacity: sortable.isDragging ? 0.5 : 1,
      }
    : {};

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this folder?')) {
      onDelete(folder._id);
    }
  };

  return (
    <Card
      ref={sortable?.setNodeRef}
      style={style}
      className={`bg-gray-900/90 border border-gray-800 hover:border-blue-800/50 transition-all duration-200 rounded-lg shadow-lg shadow-black/20 w-full h-full ${
        sortable?.isDragging ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <CardHeader className="pb-2 pt-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-white text-lg font-semibold">
            {folder.label}
          </CardTitle>
          <div className="flex space-x-1">
            {/* Only show drag handle if id is provided */}
            {id && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800/80 rounded-md cursor-grab"
                {...(sortable?.attributes || {})}
                {...(sortable?.listeners || {})}
                tabIndex={0}
                aria-label="Drag to reorder"
                type="button"
              >
                <FiMove className="h-4 w-4" />
                <span className="sr-only">Drag</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800/80 rounded-md"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(folder);
              }}
              type="button"
            >
              <FiEdit2 className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-gray-800/80 rounded-md"
              onClick={handleDelete}
              type="button"
            >
              <FiTrash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        <div className="space-y-1">
          <div className="text-xs text-gray-400 break-all">
            <span
              className={`inline-block px-2 py-1 rounded-md text-xs font-medium mb-2 mr-2 ${
                isRemote
                  ? 'bg-blue-800/70 text-blue-200 border border-blue-700'
                  : 'bg-purple-800/70 text-purple-200 border border-purple-700'
              }`}
            >
              {isRemote ? 'Remote' : 'Local'}
            </span>
            <span className="opacity-80">{folder.path}</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Created {formatDateRelative(folder.createdAt)}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1 pb-4">
        <Button
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all border border-blue-500"
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
