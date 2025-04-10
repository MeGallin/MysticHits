import React from 'react';
import AudioPlayer from './components/AudioPlayer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-fuchsia-900 to-blue-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-white mb-6">Mystic Hits</h1>
      <AudioPlayer />
    </div>
  );
}

export default App;
