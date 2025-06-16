import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  MouseSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import FolderCard from './FolderCard';
import folderServices, { Folder } from '@/services/folderServices';
import { useToast } from '@/hooks/use-toast';

interface FolderGridProps {
  folders: Folder[];
  onEdit: (folder: Folder) => void;
  onDelete: (folderId: string) => void;
  onPlay: (folderId: string) => void;
  onReorder: (folders: Folder[]) => void;
}

const FolderGrid: React.FC<FolderGridProps> = ({
  folders,
  onEdit,
  onDelete,
  onPlay,
  onReorder,
}) => {
  const [items, setItems] = useState<Folder[]>(folders);
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  // Debounce timer reference
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setItems(folders);
  }, [folders]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Debounced save function to avoid too many API calls
  const saveReorderedFolders = useCallback(
    async (folderIds: string[]) => {
      setIsSaving(true);
      try {
        const response = await folderServices.reorderFolders(folderIds);
        if (!response.success) {
          toast({
            title: 'Error',
            description: response.error || 'Failed to save folder order',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error saving folder order:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred while saving folder order',
          variant: 'destructive',
        });
      } finally {
        setIsSaving(false);
      }
    },
    [toast],
  );
  // Clean up the debounce timer when component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 8,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((item) => item._id === active.id);
        const newIndex = prev.findIndex((item) => item._id === over.id);
        const newItems = arrayMove(prev, oldIndex, newIndex);

        // Update the UI immediately
        onReorder(newItems);

        // Clear any existing debounce timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        // Set a new debounce timer for API call
        debounceTimerRef.current = setTimeout(() => {
          const folderIds = newItems.map((folder) => folder._id);
          saveReorderedFolders(folderIds);
        }, 500); // 500ms debounce time

        return newItems;
      });
    }
  };

  // Mobile-specific reorder functions
  const moveItemUp = (index: number) => {
    if (index > 0) {
      setItems((prev) => {
        const newItems = arrayMove(prev, index, index - 1);
        onReorder(newItems);
        
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
          const folderIds = newItems.map((folder) => folder._id);
          saveReorderedFolders(folderIds);
        }, 500);
        
        return newItems;
      });
    }
  };

  const moveItemDown = (index: number) => {
    if (index < items.length - 1) {
      setItems((prev) => {
        const newItems = arrayMove(prev, index, index + 1);
        onReorder(newItems);
        
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
          const folderIds = newItems.map((folder) => folder._id);
          saveReorderedFolders(folderIds);
        }, 500);
        
        return newItems;
      });
    }
  };
  return (
    <>
      {isSaving && (
        <div className="mb-4 p-2 bg-blue-500/10 text-blue-400 text-sm rounded-md border border-blue-500/20 flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Saving folder order...
        </div>
      )}{' '}
      
      {isMobile ? (
        // Mobile view with up/down buttons
        <div className="space-y-4">
          {items.map((folder, index) => (
            <div key={folder._id} className="relative">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveItemUp(index)}
                    disabled={index === 0}
                    className={`p-2 rounded-md text-xs font-medium transition-colors ${
                      index === 0
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveItemDown(index)}
                    disabled={index === items.length - 1}
                    className={`p-2 rounded-md text-xs font-medium transition-colors ${
                      index === items.length - 1
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </div>
                <div className="flex-1">
                  <FolderCard
                    folder={folder}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onPlay={onPlay}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop view with drag and drop
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SortableContext
              items={items.map((f) => f._id)}
              strategy={rectSortingStrategy}
            >
              {items.map((folder) => (
                <div
                  key={folder._id}
                  className="flex flex-col w-full max-w-md mx-auto md:mx-0 mb-4"
                >
                  <FolderCard
                    id={folder._id}
                    folder={folder}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onPlay={onPlay}
                  />
                </div>
              ))}
            </SortableContext>
          </div>
        </DndContext>
      )}
    </>
  );
};

export default FolderGrid;
