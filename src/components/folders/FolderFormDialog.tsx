import React, { useState } from 'react';
import { useAtom } from 'jotai';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { foldersAtom } from '@/state/folderAtoms';
import folderServices, { Folder } from '@/services/folderServices';
import { useToast } from '@/hooks/use-toast';

interface FolderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderToEdit?: Folder | null;
}

const FolderFormDialog: React.FC<FolderFormDialogProps> = ({
  open,
  onOpenChange,
  folderToEdit,
}) => {
  const [folders, setFolders] = useAtom(foldersAtom);
  const [label, setLabel] = useState(folderToEdit?.label || '');
  const [path, setPath] = useState(folderToEdit?.path || '');
  const [errors, setErrors] = useState<{ label?: string; path?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isEditMode = !!folderToEdit;

  // Reset form when dialog opens/closes or the folder to edit changes
  React.useEffect(() => {
    if (open) {
      setLabel(folderToEdit?.label || '');
      setPath(folderToEdit?.path || '');
      setErrors({});
    }
  }, [open, folderToEdit]);

  const validateForm = (): boolean => {
    const newErrors: { label?: string; path?: string } = {};

    if (!label.trim()) {
      newErrors.label = 'Folder name is required';
    }

    if (!path.trim()) {
      newErrors.path = 'Path or URL is required';
    } else if (!path.startsWith('http') && !path.startsWith('/')) {
      newErrors.path = 'Path must be a URL or absolute path';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const folderData = {
        label: label.trim(),
        path: path.trim(),
      };

      let result;

      if (isEditMode && folderToEdit) {
        // Update existing folder
        result = await folderServices.updateFolder(
          folderToEdit._id,
          folderData,
        );

        if (result.success) {
          // Update folder in state
          setFolders(
            folders.map((folder) =>
              folder._id === folderToEdit._id
                ? { ...folder, ...folderData }
                : folder,
            ),
          );

          toast({
            title: 'Folder updated',
            description: 'Your folder has been updated successfully',
          });
        }
      } else {
        // Create new folder
        result = await folderServices.addFolder(folderData);

        if (result.success && result.data) {
          // Add new folder to state
          setFolders([...folders, result.data]);

          toast({
            title: 'Folder created',
            description: 'Your folder has been created successfully',
          });
        }
      }

      if (result.success) {
        onOpenChange(false); // Close dialog on success
      } else {
        setErrors({ path: result.error || 'Failed to save folder' });
        toast({
          title: 'Error',
          description: result.error || 'Failed to save folder',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving folder:', error);
      setErrors({ path: 'An unexpected error occurred' });
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit Folder' : 'Add New Folder'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update the details of your music folder.'
                : 'Enter the details to create a new music folder.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="label">Folder Name</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="My Music Collection"
              />
              {errors.label && (
                <p className="text-sm text-red-500">{errors.label}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="path">Path or URL</Label>
              <Input
                id="path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/path/to/music or https://example.com/playlist"
              />
              {errors.path && (
                <p className="text-sm text-red-500">{errors.path}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? 'Updating...'
                  : 'Adding...'
                : isEditMode
                ? 'Update Folder'
                : 'Add Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FolderFormDialog;
