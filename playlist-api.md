
# 🎧 Frontend Playlist Integration - Ticket Breakdown

This document outlines the tickets required to integrate the playlist API into the frontend player interface.

---

## ✅ Story 1: Create Jotai Playlist Atom
**Description:** Set up a global atom using Jotai to store and access the remote playlist throughout the app.

### Tasks:
- [ ] Create a new file `atoms/playlist.ts`.
- [ ] Define a `Track` type with `title`, `url`, and `mime`.
- [ ] Export an atom to hold an array of `Track`.

**Acceptance Criteria:**
- Atom can be imported and used across components.
- Proper TypeScript typing for the track shape.

---

## ✅ Story 2: RemotePlaylistLoader Component
**Description:** Create a form input component that allows the user to load a remote folder URL and fetch tracks.

### Tasks:
- [ ] Create `components/RemotePlaylistLoader.tsx`.
- [ ] Input field for user to enter folder URL.
- [ ] On submit, send request to backend API.
- [ ] Parse response and update playlist atom.
- [ ] Display loading state and error feedback.

**Acceptance Criteria:**
- Submitting a valid URL fetches and stores the playlist.
- User receives feedback on error or empty playlist.

---

## ✅ Story 3: PlaylistViewer Component
**Description:** Create a component to display the current tracks stored in the playlist atom.

### Tasks:
- [ ] Create `components/PlaylistViewer.tsx`.
- [ ] List all track titles, MIME types, and audio players.
- [ ] Use native `<audio>` tag for each track.
- [ ] Display a fallback if the playlist is empty.

**Acceptance Criteria:**
- Playlist loads visually when tracks exist.
- Each track shows a title, playable audio control, and MIME type.

---

## ✅ Story 4: App Integration
**Description:** Mount both components in the main app UI to allow complete functionality.

### Tasks:
- [ ] Import and use `RemotePlaylistLoader` and `PlaylistViewer` in `App.tsx`.
- [ ] Ensure layout and basic styling with Tailwind or your CSS framework.

**Acceptance Criteria:**
- UI lets user load a playlist and see the tracks in one view.
- Fully functional interaction between input, fetch, store, and display.

---

## ✅ Story 5: Frontend Fetch Error Handling
**Description:** Improve user experience by handling backend errors or invalid links gracefully.

### Tasks:
- [ ] Display message if playlist API fails.
- [ ] Highlight UI error state (e.g. red message).
- [ ] Prevent broken playlist from being stored.

**Acceptance Criteria:**
- UI does not crash or break from failed requests.
- User sees clear feedback when something goes wrong.

---

## 🧩 Optional Enhancements
- [ ] Allow selecting and playing a specific track.
- [ ] Add Play All / Shuffle mode.
- [ ] Display track durations (if metadata added).
- [ ] Save last used URL in localStorage.

