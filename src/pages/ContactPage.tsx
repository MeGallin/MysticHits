import React from 'react';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,50,255,0.15),transparent_70%)] pointer-events-none"></div>

      {/* Animated background elements - keeping the same style as the main app */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none"></div>
      <div
        className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-pink-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: '1s' }}
      ></div>

      <div className="flex-grow flex items-center justify-center p-4 z-10">
        <div className="bg-gray-800/70 backdrop-blur-lg p-8 rounded-xl shadow-2xl max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Contact Us
          </h1>
          <p className="text-gray-300 mb-8 text-center">
            Have questions or feedback about Mystic Hits? We'd love to hear from
            you!
          </p>

          {/* This is just a placeholder. The actual form will be implemented in a future ticket */}
          <div className="space-y-4">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-300 text-center">
                Contact form coming soon!
              </p>
            </div>

            {/* Back to Home button */}
            <div className="flex justify-center mt-6">
              <Link
                to="/"
                className="px-6 py-2 bg-custom-blue hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-300 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;
