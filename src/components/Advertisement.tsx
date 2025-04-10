import React from 'react';
import { advertisements } from '../data/advertisements';

interface AdvertisementProps {
  adId?: number; // Optional: specific ad ID to show
  onClose: () => void;
}

export const Advertisement: React.FC<AdvertisementProps> = ({
  adId,
  onClose,
}) => {
  // Get a specific ad by ID or a random one if no ID provided
  const ad = adId
    ? advertisements.find((a) => a.id === adId) || advertisements[0]
    : advertisements[Math.floor(Math.random() * advertisements.length)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div
        className={`relative w-full max-w-md p-6 rounded-xl shadow-2xl bg-gradient-to-br ${ad.backgroundColor} ${ad.textColor}`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white/80 hover:text-white"
          aria-label="Close advertisement"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Ad content */}
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-bold mb-2">{ad.title}</h3>
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full h-auto rounded-lg mb-4 shadow-lg"
          />
          <p className="text-center mb-4">{ad.description}</p>
          <a
            href={ad.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors shadow-md"
          >
            Learn More
          </a>
        </div>

        {/* Skip ad countdown */}
        <div className="mt-4 text-center text-sm opacity-80">
          Advertisement will close in 5 seconds...
        </div>
      </div>
    </div>
  );
};
