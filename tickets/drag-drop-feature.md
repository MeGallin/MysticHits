Feature Ticket: Implement Drag and Drop for Folder Cards with Persistent Ordering
Description
Implement a drag and drop feature for folder cards that allows users to reorder their folders. The new order should be persisted in the database so that it's maintained across page refreshes and user sessions.

Acceptance Criteria
Users can drag and drop folder cards to reorder them
Visual feedback is provided during dragging
Reordered positions are saved to the database
Order is maintained when the page is reloaded
Drag and drop works on both desktop and mobile devices
Keyboard accessibility is supported for drag and drop operations
Implementation Details
Frontend Tasks
Install required dependencies
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

Modify FolderCard component to be draggable
// filepath: FE/src/components/folders/FolderCard.tsx
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
id: string; // For drag and drop identification
}

const FolderCard: React.FC<FolderCardProps> = ({
folder,
onEdit,
onDelete,
onPlay,
id,
}) => {
const isRemote = folder.path.startsWith('http');

const {
attributes,
listeners,
setNodeRef,
transform,
transition,
isDragging,
} = useSortable({ id });

const style = {
transform: CSS.Transform.toString(transform),
transition,
opacity: isDragging ? 0.5 : 1,
};

const handleDelete = (e: React.MouseEvent) => {
e.stopPropagation();
if (confirm('Are you sure you want to delete this folder?')) {
onDelete(folder.\_id);
}
};

return (
<Card
ref={setNodeRef}
style={style}
className={`bg-gray-800/70 border border-gray-700 hover:border-gray-600 transition-all duration-200 ${isDragging ? 'ring-2 ring-blue-500' : ''}`} >
<CardHeader className="pb-2">
<div className="flex justify-between items-start">
<CardTitle className="text-white font-semibold">
{folder.label}
</CardTitle>
<div className="flex space-x-1">
<Button
variant="ghost"
size="icon"
className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700/50 cursor-grab"
{...attributes}
{...listeners} >
<FiMove className="h-4 w-4" />
<span className="sr-only">Drag</span>
</Button>
<Button
variant="ghost"
size="icon"
className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700/50"
onClick={(e) => {
e.stopPropagation();
onEdit(folder);
}} >
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
{/_ Rest of component remains unchanged _/}
<CardContent>
{/_ Existing content _/}
</CardContent>
<CardFooter>
{/_ Existing footer _/}
</CardFooter>
</Card>
);
};

Create FolderGrid component to manage drag-and-drop
// filepath: FE/src/components/folders/FolderGrid.tsx
import React, { useEffect, useState } from 'react';
import FolderCard from './FolderCard';
import { Folder } from '@/services/folderServices';
import {
DndContext,
closestCenter,
KeyboardSensor,
PointerSensor,
useSensor,
useSensors,
DragEndEvent,
} from '@dnd-kit/core';
import {
arrayMove,
SortableContext,
sortableKeyboardCoordinates,
rectSortingStrategy,
} from '@dnd-kit/sortable';

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
const [items, setItems] = useState<Folder[]>([]);

useEffect(() => {
setItems(folders);
}, [folders]);

const sensors = useSensors(
useSensor(PointerSensor, {
activationConstraint: {
distance: 8, // 8px movement before drag starts
},
}),
useSensor(KeyboardSensor, {
coordinateGetter: sortableKeyboardCoordinates,
})
);

const handleDragEnd = (event: DragEndEvent) => {
const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        onReorder(newItems); // Persist the changes
        return newItems;
      });
    }

};

return (
<DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
<SortableContext items={items.map(folder => folder.\_id)} strategy={rectSortingStrategy}>
{items.map((folder) => (
<FolderCard
              key={folder._id}
              id={folder._id}
              folder={folder}
              onEdit={onEdit}
              onDelete={onDelete}
              onPlay={onPlay}
            />
))}
</SortableContext>
</div>
</DndContext>
);
};

export default FolderGrid;

Update Folder Service to persist order changes
// filepath: FE/src/services/folderServices.ts
// Add to existing folderServices.ts file

export interface Folder {
\_id: string;
label: string;
path: string;
created: string;
position?: number; // New field to track order
// other existing fields...
}

export const updateFolderOrder = async (folders: Folder[]): Promise<void> => {
try {
const response = await fetch('/api/folders/reorder', {
method: 'PUT',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({
folderIds: folders.map(folder => folder.\_id)
}),
});

    if (!response.ok) {
      throw new Error('Failed to update folder order');
    }

} catch (error) {
console.error('Error updating folder order:', error);
throw error;
}
};

Update parent component to use FolderGrid
// filepath: FE/src/pages/FoldersPage.tsx (or wherever folders are displayed)
import React from 'react';
import { Folder, updateFolderOrder } from '@/services/folderServices';
import FolderGrid from '@/components/folders/FolderGrid';
import { toast } from '@/components/ui/toast'; // Assuming you have a toast component

const FoldersPage: React.FC = () => {
// Existing code for loading/managing folders

const handleReorder = async (reorderedFolders: Folder[]) => {
try {
await updateFolderOrder(reorderedFolders);
// Optional: Show success toast
toast({
title: "Order saved",
description: "Folder order has been updated",
});
} catch (error) {
console.error('Failed to save folder order:', error);
toast({
title: "Error saving order",
description: "There was a problem saving the folder order",
variant: "destructive",
});
}
};

return (
<div className="container mx-auto p-4">
<h1 className="text-2xl font-bold mb-4">Your Folders</h1>

      <FolderGrid
        folders={folders}
        onEdit={handleEditFolder}
        onDelete={handleDeleteFolder}
        onPlay={handlePlayFolder}
        onReorder={handleReorder}
      />
    </div>

);
};

Backend Tasks
Update Folder Schema to include position field
// filepath: BE/src/models/Folder.js (adjust path as needed)
const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
// Existing fields
label: { type: String, required: true },
path: { type: String, required: true },
created: { type: Date, default: Date.now },
// New position field for order tracking
position: { type: Number, default: 0 }
});

// Add index for efficient sorting
folderSchema.index({ position: 1 });

module.exports = mongoose.model('Folder', folderSchema);

Create API endpoint to handle reordering
// filepath: BE/src/routes/folders.js (adjust path as needed)
const express = require('express');
const router = express.Router();
const Folder = require('../models/Folder');

// Existing routes...

/\*\*

- Reorder folders
- Updates position values for multiple folders in one operation
  \*/
  router.put('/reorder', async (req, res) => {
  try {
  const { folderIds } = req.body;
      if (!Array.isArray(folderIds)) {
        return res.status(400).json({ error: 'folderIds must be an array' });
      }

      // Use a transaction for atomicity
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Update each folder with its new position
        await Promise.all(folderIds.map((id, index) => {
          return Folder.findByIdAndUpdate(
            id,
            { position: index },
            { session }
          );
        }));

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ success: true });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
  } catch (error) {
  console.error('Error reordering folders:', error);
  res.status(500).json({ error: 'Failed to update folder order' });
  }
  });

module.exports = router;

Update folder retrieval to sort by position
// filepath: BE/src/controllers/folderController.js (adjust path as needed)

// Update existing getFolders function or create new one
const getFolders = async (req, res) => {
try {
// Get folders sorted by position
const folders = await Folder.find()
.sort({ position: 1 })
.lean();

    res.status(200).json(folders);

} catch (error) {
console.error('Error retrieving folders:', error);
res.status(500).json({ error: 'Failed to retrieve folders' });
}
};

Run database migration to add position to existing folders
// filepath: BE/src/migrations/addPositionToFolders.js

const mongoose = require('mongoose');
const Folder = require('../models/Folder');

const migratePositions = async () => {
try {
// Get all folders sorted by creation date (or other existing logic)
const folders = await Folder.find().sort({ created: 1 });

    // Update each folder with a position value
    for (let i = 0; i < folders.length; i++) {
      folders[i].position = i;
      await folders[i].save();
    }

    console.log(`Successfully updated position for ${folders.length} folders`);

} catch (error) {
console.error('Migration failed:', error);
} finally {
mongoose.disconnect();
}
};

// Connect to DB and run migration
mongoose.connect(process.env.MONGODB_URI)
.then(() => migratePositions())
.catch(err => console.error('Failed to connect to database:', err));

Technical Notes
The @dnd-kit library provides accessible drag and drop functionality
We're using optimistic UI updates (update client first, then server)
Position field is numeric to allow for easy insertion between items without renumbering
Consider implementing debounce for the API call if users might make multiple reorderings quickly
Dependencies
@dnd-kit/core
@dnd-kit/sortable
@dnd-kit/utilities
Testing Requirements
Test drag and drop functionality on desktop and mobile
Verify that order persists after page refresh
Test keyboard navigation for accessibility
Verify that proper visual feedback is shown during dragging
Test error scenarios (network failure during reorder save)
Test concurrent editing (what happens if two users reorder simultaneously)
Estimated Effort
Frontend implementation: 8 hours
Backend implementation: 4 hours
Testing and bug fixes: 4 hours
Total: 16 hours
