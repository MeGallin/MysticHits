import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-900 rounded-lg shadow-xl p-8 md:p-12 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About MysticHits
          </h1>
          <p className="text-xl md:text-2xl">
            Discover the story behind the music that moves you
          </p>
        </div>
      </section>

      {/* Personal Story Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-gray-600">The Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-gray-200 rounded-full p-4 h-64 w-64 mx-auto">
              {/* Placeholder for profile image */}
              <div className="flex items-center justify-center h-full text-gray-400">
                <span className="text-6xl">👤</span>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <p className="text-lg mb-4 text-gray-500">
              Hi there! I'm the creator of MysticHits, a platform born from my
              lifelong passion for music and technology. As a developer and
              music enthusiast, I often found myself wanting a more personalized
              way to curate and share my favorite musical discoveries.
            </p>
            <p className="text-lg mb-4 text-gray-500">
              What started as a simple side project in 2024 has evolved into
              MysticHits - a space where music lovers can create custom
              playlists, discover new sounds, and connect with others who share
              their sonic preferences. My background in web development combined
              with years of collecting vinyl and digital music gave me the
              perfect foundation to build this audio experience.
            </p>
          </div>
        </div>
      </section>

      {/* App Purpose Section */}
      <section className="mb-12 bg-gray-100 p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-gray-600">
          The MysticHits Vision
        </h2>
        <p className="text-lg mb-6 text-gray-500">
          MysticHits stands out from other music platforms through its focus on
          personalized curation and technology that understands your unique
          taste patterns. Our application combines modern React and TypeScript
          with advanced audio processing to create a seamless listening
          experience.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4 text-indigo-500">🎵</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-600">
              Curated Experiences
            </h3>
            <p className="text-gray-500">
              Custom playlists designed around moods, activities, and personal
              preferences
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4 text-indigo-500">🔍</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-600">
              Discovery Engine
            </h3>
            <p className="text-gray-500">
              Advanced algorithms help you find your next favorite track
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4 text-indigo-500">🌐</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-600">
              Community Connection
            </h3>
            <p className="text-gray-500">
              Share and explore playlists created by music lovers worldwide
            </p>
          </div>
        </div>
      </section>

      {/* Feature List Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-gray-600">
          What Makes Us Special
        </h2>
        <ul className="space-y-4">
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2 mt-1">✓</span>
            <span className="text-gray-500">
              Built with React, TypeScript, and Tailwind CSS for a responsive
              modern experience
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2 mt-1">✓</span>
            <span className="text-gray-500">
              Innovative audio processing technology for crystal-clear playback
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2 mt-1">✓</span>
            <span className="text-gray-500">
              Open-source architecture with community contributions welcome
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2 mt-1">✓</span>
            <span className="text-gray-500">
              Continuous updates based on user feedback and music industry
              trends
            </span>
          </li>
        </ul>
      </section>

      {/* Contact Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-gray-600">Get In Touch</h2>
        <p className="text-lg mb-4 text-gray-500">
          Have questions, suggestions, or just want to chat about music? We'd
          love to hear from you! Visit our{' '}
          <a href="/contact" className="text-indigo-500 hover:text-indigo-700">
            Contact Page
          </a>{' '}
          or follow us on social media.
        </p>
      </section>
    </div>
  );
};

export default About;
