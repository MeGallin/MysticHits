import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hitsServices } from '@services/fetchServices';

const Footer: React.FC = () => {
  const [hitCount, setHitCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchViewCount = async () => {
      try {
        const response = await hitsServices.getPageHits();

        if (response.success && response.data?.hitCount !== undefined) {
          setHitCount(response.data.hitCount);
          setError(null);
        } else {
          setHitCount(0);
          setError('Stats unavailable');
        }
      } catch (err) {
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
