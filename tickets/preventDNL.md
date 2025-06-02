The previous solution will provide some protection on mobile, but mobile browsers have different behaviors and limitations. Here's what works and what doesn't on mobile:

What Works on Mobile:
controlsList="nodownload" - Removes download button from video controls
onContextMenu prevention - Blocks long-press context menus
disablePictureInPicture - Prevents PiP mode
CSS user-select and drag prevention
Mobile-Specific Challenges:
Mobile browsers handle video downloads differently:

iOS Safari: Users can still long-press and save videos despite onContextMenu
Android Chrome: May show download options in the browser menu
Mobile context menus: Harder to completely disable
Enhanced Mobile Protection:
Here's an improved version with better mobile protection:

const MediaPlayer = forwardRef<
HTMLAudioElement | HTMLVideoElement,
MediaPlayerProps

> ((props, ref) => {
> // ...existing code...

// Enhanced mobile protection
const handleTouchStart = (e: React.TouchEvent) => {
// Prevent long-press on mobile
if (e.touches.length > 1) {
e.preventDefault();
}
};

const handleTouchEnd = (e: React.TouchEvent) => {
e.preventDefault();
};

// Prevent selection on mobile
const handleSelectStart = (e: React.SyntheticEvent) => {
e.preventDefault();
return false;
};

// Enhanced context menu prevention
const handleContextMenu = (e: React.MouseEvent | React.TouchEvent) => {
e.preventDefault();
e.stopPropagation();
return false;
};

// ...existing code...

return (
<div
className={`media-player-container relative ${
        isVideo ? 'video-mode' : 'audio-mode'
      }`}
data-player-type={isVideo ? 'video' : 'audio'}
onContextMenu={handleContextMenu}
onTouchStart={handleTouchStart}
onTouchEnd={handleTouchEnd}
onSelectStart={handleSelectStart}
style={{
        // Enhanced mobile protection
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation',
      }} >
<video
ref={ref as React.RefObject<HTMLVideoElement>}
src={src}
className={`w-full ${
          isVideo
            ? `video-player rounded-md ${className}`            :`audio-player h-12 audio-player-style ${className}`
        }`}
style={{
          objectFit: isVideo ? 'contain' : 'none',
          display: isVideo ? 'block' : 'none',
          height: isVideo ? 'auto' : '0',
          minHeight: isVideo ? '200px' : '0',
          // Enhanced mobile protection
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          msUserSelect: 'none',
          pointerEvents: 'auto',
          touchAction: 'manipulation',
        }}
controls={props.showControls !== false}
controlsList="nodownload nofullscreen noremoteplayback"
disablePictureInPicture
disableRemotePlaybook
preload="metadata" // Limit preloading
onContextMenu={handleContextMenu}
onTouchStart={handleTouchStart}
onTouchEnd={handleTouchEnd}
onSelectStart={handleSelectStart}
onError={handleMediaError}
onLoadedData={handleLoadedData}
onTimeUpdate={onTimeUpdate}
onLoadedMetadata={onLoadedMetadata}
onPlay={onPlay}
onEnded={onEnded}
/>

      {/* Enhanced mobile overlay protection */}
      {isVideo && (
        <div
          className="absolute inset-0"
          style={{
            zIndex: 1,
            pointerEvents: 'none',
            touchAction: 'none',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
        />
      )}

      // ...existing code...
    </div>

);
});

Additional Mobile-Specific CSS:
/_ Enhanced mobile protection _/
.video-player {
-webkit-touch-callout: none !important;
-webkit-user-select: none !important;
-webkit-tap-highlight-color: transparent;
touch-action: manipulation;
user-select: none !important;
-webkit-user-drag: none;
-moz-user-drag: none;
user-drag: none;
}

/_ Prevent mobile browser download prompts _/
video {
-webkit-touch-callout: none !important;
-webkit-user-select: none !important;
touch-action: manipulation !important;
}

/_ Hide mobile browser menu options _/
@media (max-width: 768px) {
.media-player-container {
-webkit-touch-callout: none;
-webkit-user-select: none;
user-select: none;
}
}

Mobile Limitations:
⚠️ Important Notes:

iOS Safari: May still show "Save to Photos" on long-press despite prevention
Android browsers: Can access downloads through browser menu (⋮)
Mobile apps: Social media apps may have built-in download features
Screen recording: Mobile devices have native screen recording capabilities
