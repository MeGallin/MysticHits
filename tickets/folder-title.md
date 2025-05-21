Ticket: Implement Folder Label Display in Audio Player
Description
Currently, the AudioPlayer component has a placeholder text [folder label HERE] where the folder label should be displayed. We need to implement this feature to show the currently playing folder's label, improving user experience by providing context about the source of the audio content.

Background
The folder label information is available in the application state via selectedFolderAtom
The FolderCard component already displays this information successfully
The placeholder appears in the track info section of the AudioPlayer component
Implementation Tasks
<input disabled="" type="checkbox"> Import the selectedFolderAtom from the folder state management
<input disabled="" type="checkbox"> Use the useAtom hook to access the selected folder information
<input disabled="" type="checkbox"> Replace the placeholder text with a styled folder label display
<input disabled="" type="checkbox"> Add appropriate styling to make the folder label visually distinct from the track title
<input disabled="" type="checkbox"> Handle cases where no folder is selected
Technical Details
// Import the folder atom
import { selectedFolderAtom } from '../state/folderAtoms';

// Inside the component:
const [selectedFolder] = useAtom(selectedFolderAtom);

// Replace the placeholder with:
{selectedFolder?.label && (
<span className="text-blue-300 text-sm font-normal mr-2 px-2 py-0.5 bg-blue-900/30 rounded-md flex-shrink-0">
{selectedFolder.label}
</span>
)}
Acceptance Criteria
When a folder is selected and playing, its label should appear before the track title
The folder label should be visually distinct (different color/style) from the track title
If no folder is selected, no label should appear
The folder label should update automatically when switching between folders
The UI should handle long folder names gracefully without breaking the layout
Estimated Effort
Small (1-2 hours)

Priority
Medium
