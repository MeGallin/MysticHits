import React from 'react';
import AppRouter from './AppRouter';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,50,255,0.15),transparent_70%)] pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none"></div>
        <div
          className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-pink-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none"
          style={{ animationDelay: '1s' }}
        ></div>

        {/* Navigation Header */}
        <header className="w-full z-10">
          <Navigation />
        </header>

        <main className="flex-grow z-10 overflow-y-auto">
          <AppRouter />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
