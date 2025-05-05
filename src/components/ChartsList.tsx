import React from 'react';
import { FiMusic, FiExternalLink, FiLock } from 'react-icons/fi';

export interface ChartTrack {
  title: string;
  artist: string;
  art: string;
  link: string;
  explicit: boolean;
}

export interface ChartsData {
  updated: string;
  tracks: ChartTrack[];
}

interface ChartsListProps {
  data: ChartsData | null;
  loading: boolean;
  error: string | null;
  storefront: string;
  onStorefrontChange: (storefront: string) => void;
}

// Common storefronts with country names
const STOREFRONTS = [
  { code: 'us', name: 'United States' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'jp', name: 'Japan' },
  { code: 'es', name: 'Spain' },
  { code: 'it', name: 'Italy' },
  { code: 'cy', name: 'Cyprus' },
  { code: 'gr', name: 'Greece' },
];

export const ChartsList: React.FC<ChartsListProps> = ({
  data,
  loading,
  error,
  storefront,
  onStorefrontChange,
}) => {
  // Format date to be more readable
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Handle storefront change from dropdown
  const handleStorefrontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStorefrontChange(e.target.value);
  };

  if (loading) {
    return (
      <div className="w-full py-12 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading charts...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-400">
          Error Loading Charts
        </h3>
        <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Storefront selector */}
      <div className="mb-8">
        <label
          htmlFor="storefront"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
        >
          Select Chart Region:
        </label>
        <div className="flex">
          <select
            id="storefront"
            value={storefront}
            onChange={handleStorefrontChange}
            className="flex-grow md:flex-grow-0 md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {STOREFRONTS.map((sf) => (
              <option key={sf.code} value={sf.code}>
                {sf.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {data && (
        <>
          <div className="flex flex-wrap items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              Most-Played Songs
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {formatDate(data.updated)}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.tracks.map((track, index) => (
                <li key={`${track.title}-${index}`}>
                  <div className="flex items-center px-4 py-4 sm:px-6">
                    <div className="flex items-center min-w-0 flex-1">
                      {/* Rank number */}
                      <div className="flex-shrink-0 w-10 text-center font-bold text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </div>

                      {/* Album art */}
                      <div className="flex-shrink-0 h-16 w-16 mr-4">
                        <img
                          src={track.art}
                          alt={`${track.title} by ${track.artist}`}
                          className="h-full w-full object-cover rounded shadow-sm"
                          loading="lazy"
                        />
                      </div>

                      {/* Track info */}
                      <div className="min-w-0 flex-1 px-2">
                        <div className="flex items-center">
                          <p
                            className="text-md font-medium text-gray-900 dark:text-white truncate"
                            title={track.title}
                          >
                            {track.title}
                            {track.explicit && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                Explicit
                              </span>
                            )}
                          </p>
                        </div>
                        <p
                          className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate"
                          title={track.artist}
                        >
                          {track.artist}
                        </p>
                      </div>

                      {/* Disabled Apple Music link */}
                      <div className="flex-shrink-0">
                        <button
                          disabled
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-500 bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed opacity-70"
                          title="Listening functionality unavailable"
                        >
                          <FiLock className="mr-1" />
                          Listen
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {!data && !loading && !error && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <FiMusic className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">
            No chart data available
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try selecting a different region or check back later.
          </p>
        </div>
      )}
    </div>
  );
};

export default ChartsList;
