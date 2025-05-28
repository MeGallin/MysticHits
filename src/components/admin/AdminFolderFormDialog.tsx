import React, { useState } from 'react';
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
import { Folder } from '@/services/folderServices';

interface AdminFolderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (folderData: { label: string; path: string }) => Promise<void>;
  folderToEdit?: Folder | null;
  title?: string;
  userName?: string;
}

const AdminFolderFormDialog: React.FC<AdminFolderFormDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  folderToEdit,
  title,
  userName,
}) => {
  const [label, setLabel] = useState(folderToEdit?.label || '');
  const [path, setPath] = useState(folderToEdit?.path || '');
  const [errors, setErrors] = useState<{ label?: string; path?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      newErrors.path = 'Folder path is required';
    } else {
      // Basic URL validation for remote paths
      if (path.startsWith('http')) {
        try {
          new URL(path);
        } catch {
          newErrors.path = 'Please enter a valid URL';
        }
      }
      // Basic path validation for local paths
      else if (
        path.includes('..') ||
        path.includes('<') ||
        path.includes('>')
      ) {
        newErrors.path = 'Invalid path format';
      }
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
      await onSave({
        label: label.trim(),
        path: path.trim(),
      });

      // Reset form and close dialog on successful save
      setLabel('');
      setPath('');
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Error saving folder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setLabel('');
      setPath('');
      setErrors({});
      onOpenChange(false);
    }
  };

  const dialogTitle =
    title ||
    (isEditMode
      ? `Edit Folder${userName ? ` for ${userName}` : ''}`
      : `Add Folder${userName ? ` for ${userName}` : ''}`);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the folder details below.'
              : 'Enter the details for the new folder.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-label">Folder Name</Label>
              <Input
                id="folder-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., My Music Collection"
                disabled={isSubmitting}
                className={errors.label ? 'border-red-500' : ''}
              />
              {errors.label && (
                <p className="text-sm text-red-500">{errors.label}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="folder-path">Folder Path</Label>
              <Input
                id="folder-path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="e.g., /path/to/folder or https://example.com/music"
                disabled={isSubmitting}
                className={errors.path ? 'border-red-500' : ''}
              />
              {errors.path && (
                <p className="text-sm text-red-500">{errors.path}</p>
              )}
              <p className="text-xs text-gray-500">
                Enter a local file path (e.g., /music/collection) or a remote
                URL (e.g., https://example.com/music)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditMode ? (
                'Update Folder'
              ) : (
                'Create Folder'
              )}
            </Button>
          </DialogFooter>{' '}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminFolderFormDialog;
