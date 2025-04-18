import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const [uniqueHitCount, setUniqueHitCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchViewCount = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/hits/page-hits`,
        );
        setUniqueHitCount(res.data.uniqueHitCount);
      } catch (err: any) {
        setError('Could not load visitor stats');
      }
    };
    fetchViewCount();
  }, []);

  return (
    <footer className="w-full mt-8 py-4 bg-gradient-to-r from-custom-blue via-custom-orange to-custom-green text-white text-center shadow-lg">
      <div className="flex flex-col items-center gap-2">
        <span className="font-bold tracking-wider text-lg drop-shadow">
          Mystic Hits &copy; {new Date().getFullYear()}
        </span>
        <span className="text-sm opacity-80">
          Funky Modern Music Player &mdash; Enjoy the vibes!
        </span>
        <div className="flex gap-4 mt-1">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-custom-blue transition-colors duration-200"
          >
            GitHub
          </a>
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-custom-orange transition-colors duration-200"
          >
            Twitter
          </a>
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
