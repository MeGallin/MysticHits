import React from 'react';
import { AudioPlayer } from './components/AudioPlayer';

function App() {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,50,255,0.15),transparent_70%)]"></div>

      {/* Animated background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-pink-500/5 rounded-full filter blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>
      <div className="h-full w-full flex items-center justify-center">
        <AudioPlayer />
      </div>
    </div>
  );
}

export default App;
