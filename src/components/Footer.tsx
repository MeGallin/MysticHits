import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hitsServices } from '@services/fetchServices';

const Footer: React.FC = () => {
  const [uniqueHitCount, setUniqueHitCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchViewCount = async () => {
      try {
        // Fetch unique hit count from API
        const response = await hitsServices.getPageHits();
        if (response.success && response.data?.uniqueHitCount !== undefined) {
          setUniqueHitCount(response.data.uniqueHitCount);
          setError(null);
        } else {
          // Set a fallback value if the API doesn't return a count
          setUniqueHitCount(0);
          setError('Stats unavailable');
        }
      } catch (err: any) {
        // Set a default value on error
        setUniqueHitCount(0);
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
            : uniqueHitCount === null
            ? 'Loading...'
            : `Page Visits: ${uniqueHitCount}`}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
