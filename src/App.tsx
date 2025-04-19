import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AudioPlayer } from './components/AudioPlayer';
import Footer from './components/Footer';
import ContactPage from './pages/ContactPage';

// Home page component that contains the audio player
const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 gap-6 h-full">
      <AudioPlayer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,50,255,0.15),transparent_70%)] pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none"></div>
        <div
          className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-pink-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none"
          style={{ animationDelay: '1s' }}
        ></div>

        {/* Navigation Header */}
        <header className="w-full py-4 px-6 z-10">
          <nav className="flex justify-between items-center">
            <div className="text-2xl font-bold text-white">
              <Link to="/" className="flex items-center">
                <span className="bg-gradient-to-r from-custom-blue via-custom-orange to-custom-green bg-clip-text text-transparent">
                  Mystic Hits
                </span>
              </Link>
            </div>
            <div className="flex gap-6">
              <Link
                to="/"
                className="text-white hover:text-custom-blue transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                to="/contact"
                className="text-white hover:text-custom-blue transition-colors duration-200"
              >
                Contact
              </Link>
            </div>
          </nav>
        </header>

        <main className="flex-grow z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
