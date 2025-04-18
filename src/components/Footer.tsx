import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hitsServices } from '../../services/fetchServices';

const Footer: React.FC = () => {
  const [uniqueHitCount, setUniqueHitCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchViewCount = async () => {
      try {
        // Fetch unique hit count from API
        const response = await hitsServices.getPageHits();
        if (response.success) {
          setUniqueHitCount(response.data.uniqueHitCount);
        } else {
          setError('Could not load visitor stats');
        }
      } catch (err: any) {
        setError('Could not load visitor stats');
        console.error('Error fetching visitor stats:', err);
      }
    };
    fetchViewCount();
  }, []);

  return (
    <footer className="w-full py-2 bg-gradient-to-r from-custom-blue via-custom-orange to-custom-green text-white text-center shadow-lg shrink-0">
      <div className="flex flex-col items-center gap-2">
        <span className="font-bold tracking-wider text-lg drop-shadow">
          Mystic Hits &copy; {new Date().getFullYear()}
        </span>
        <span className="text-sm opacity-80">
          Funky Modern Music Player &mdash; Enjoy the vibes!
        </span>
        <div className="flex gap-4 mt-1">
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
        <div className="mt-2 text-xs opacity-90">
          {error
            ? error
            : uniqueHitCount === null
            ? 'Loading visitors...'
            : `Unique Visitors: ${uniqueHitCount}`}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
