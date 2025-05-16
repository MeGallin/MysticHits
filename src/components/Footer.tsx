import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hitsServices } from '@services/fetchServices';

// Session key for tracking if user has been counted
const HIT_COUNTED_KEY = 'mystic_hits_counted';

const Footer: React.FC = () => {
  const [hitCount, setHitCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[Footer] Component mounted');

    const fetchViewCount = async () => {
      try {
        // Check if user has already been counted in this session
        const hasBeenCounted =
          sessionStorage.getItem(HIT_COUNTED_KEY) === 'true';

        // If already counted in this session, use readonly mode
        console.log('[Footer] Has been counted already?', hasBeenCounted);

        // Fetch hit count from API (readonly if already counted)
        console.log(
          '[Footer] Fetching page hit count from API with readonly=',
          hasBeenCounted,
        );
        const response = await hitsServices.getPageHits(hasBeenCounted);
        console.log('[Footer] API Response:', response.data);

        // Mark user as counted for this session
        if (!hasBeenCounted) {
          sessionStorage.setItem(HIT_COUNTED_KEY, 'true');
          console.log('[Footer] User marked as counted for this session');
        }

        // Use totalHitCount if available, otherwise fall back to uniqueHitCount
        if (
          response.success &&
          (response.data?.totalHitCount !== undefined ||
            response.data?.uniqueHitCount !== undefined)
        ) {
          // Choose totalHitCount as the primary display value
          const displayCount =
            response.data?.totalHitCount !== undefined
              ? response.data.totalHitCount
              : response.data.uniqueHitCount;

          console.log('[Footer] Setting hit count to:', displayCount);
          setHitCount(displayCount);
          setError(null);
        } else {
          // Set a fallback value if the API doesn't return a count
          setHitCount(0);
          setError('Stats unavailable');
        }
      } catch (err: any) {
        // Set a default value on error
        setHitCount(0);
        setError('Stats unavailable');
        console.error('Error fetching visitor stats:', err);
      }
    };
    fetchViewCount();
  }, []);

  return (
    <footer className="w-full size-auto bg-gradient-to-r from-custom-blue via-custom-orange to-custom-green text-white text-center shadow-lg shrink-0 border-t-2 border-gray-900">
      <div className="flex flex-col items-center">
        <span className="font-bold tracking-wider text-sm drop-shadow">
          MYSTIC HITS &copy; {new Date().getFullYear()}
        </span>

        <div className="flex gap-4">
          <Link
            to="/"
            className="hover:text-custom-green transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            to="/contact"
            className="hover:text-custom-green transition-colors duration-200"
          >
            Contact
          </Link>
        </div>
        <div className="mb-1 text-xs opacity-90">
          {error
            ? error
            : hitCount === null
            ? 'Loading...'
            : `Page Visits: ${hitCount}`}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
