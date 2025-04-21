import React, { Suspense, lazy } from 'react';

// Lazy-loaded component
const NavigationLinks = lazy(() => import('./NavigationLinks'));

/**
 * Navigation component that displays the site navigation bar
 */
const Navigation: React.FC = () => {
  return (
    <nav className="bg-gradient-to-r from-custom-blue via-custom-orange to-custom-green text-white px-4 py-3 shadow-md border-b-2 border-gray-900">
      <div className="container mx-auto flex items-center justify-between">
        <Suspense fallback={<div className="text-white">Loading...</div>}>
          <NavigationLinks />
        </Suspense>
      </div>
    </nav>
  );
};

export default Navigation;
