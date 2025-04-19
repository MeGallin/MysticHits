import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AudioPlayer } from './components/AudioPlayer';
import Footer from './components/Footer';
import ContactPage from './pages/ContactPage';

// Navigation component
const Navigation = () => {
  return (
    <nav className="bg-gradient-to-r from-indigo-900 to-purple-900 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-xl">Mystic Hits</div>
        <ul className="flex space-x-6">
          <li>
            <Link
              to="/"
              className="text-white hover:text-pink-300 transition-colors"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className="text-white hover:text-pink-300 transition-colors"
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

// Home page component that contains the audio player
const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 gap-6 min-h-screen">
      <AudioPlayer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,50,255,0.15),transparent_70%)] pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none"></div>
        <div
          className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-pink-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none"
          style={{ animationDelay: '1s' }}
        ></div>

        {/* Content */}
        <Navigation />
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
