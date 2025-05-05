import React from 'react';
import { Link } from 'react-router-dom';

/**
 * NavigationLinks component that displays navigation links
 * Split into two groups: main navigation and auth links
 */
const NavigationLinks: React.FC = () => (
  <>
    <div className="flex items-center space-x-6">
      <Link
        to="/"
        className="font-bold text-lg hover:text-yellow-400 transition-colors uppercase"
      >
        Home
      </Link>
      <Link
        to="/charts"
        className="hover:text-yellow-400 transition-colors uppercase"
      >
        Charts
      </Link>
      <Link
        to="/about"
        className="hover:text-yellow-400 transition-colors uppercase"
      >
        About
      </Link>
      <Link
        to="/contact"
        className="hover:text-yellow-400 transition-colors uppercase"
      >
        Contact
      </Link>
    </div>
    <div className="flex items-center space-x-4">
      <Link
        to="/login"
        className="hover:text-yellow-400 transition-colors uppercase"
      >
        Login
      </Link>
      <Link
        to="/register"
        className="hover:text-yellow-400 transition-colors uppercase"
      >
        Register
      </Link>
    </div>
  </>
);

export default NavigationLinks;
