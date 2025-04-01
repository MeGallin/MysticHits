import React from 'react';
import AudioPlayer from './components/AudioPlayer';

function App() {
  return (
    <div className="h-screen bg-gradient-to-b from-indigo-500 to-pink-500 flex flex-col items-center">
      {/* <h1 className="text-4xl font-bold text-purple-600 py-4 ">Mystic Hits</h1> */}
      <AudioPlayer />
    </div>
  );
}

export default App;
