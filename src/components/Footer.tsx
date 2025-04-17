import React from 'react';

const Footer: React.FC = () => (
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
        <a
          href="mailto:info@mystichits.com"
          className="hover:text-custom-green transition-colors duration-200"
        >
          Contact
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
