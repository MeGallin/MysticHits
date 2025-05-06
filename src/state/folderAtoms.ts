import { atom } from 'jotai';
import { Folder } from '@/services/folderServices';

// Atom to store the list of user folders
export const foldersAtom = atom<Folder[]>([]);

// Atom to store the currently selected folder ID
export const selectedFolderIdAtom = atom<string | null>(null);

// Atom to track loading state for folder operations
export const foldersLoadingAtom = atom<boolean>(false);

// Atom to store any error messages related to folder operations
export const foldersErrorAtom = atom<string | null>(null);

// Atom to store the folder being edited
export const editingFolderAtom = atom<Folder | null>(null);

// Derived atom that gets a folder by ID from the folders list
export const selectedFolderAtom = atom((get) => {
  const folders = get(foldersAtom);
  const selectedId = get(selectedFolderIdAtom);

  if (!selectedId) return null;
  return folders.find((folder) => folder._id === selectedId) || null;
});
