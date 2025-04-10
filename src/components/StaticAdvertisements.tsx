import React from 'react';
import { advertisements } from '../data/advertisements';

export const StaticAdvertisements: React.FC = () => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-medium text-center mb-4 text-white/90">
        Featured Promotions
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {advertisements.map((ad) => (
          <div
            key={ad.id}
            className={`rounded-lg p-3 bg-gradient-to-br ${ad.backgroundColor} shadow-lg hover:shadow-xl transition-all cursor-pointer`}
          >
            <div className="flex flex-col h-full">
              <h4 className={`text-sm font-bold mb-1 ${ad.textColor}`}>
                {ad.title}
              </h4>
              <div className="mb-2 flex-grow">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-20 object-cover rounded"
                />
              </div>
              <p className={`text-xs ${ad.textColor} line-clamp-2`}>
                {ad.description}
              </p>
              <a
                href={ad.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs mt-2 ${ad.textColor} font-medium hover:underline text-right`}
              >
                Learn More →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
