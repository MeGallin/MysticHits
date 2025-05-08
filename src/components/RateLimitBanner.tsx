import React, { useEffect, useState } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { RATE_LIMIT_EVENT } from '@/utils/apiErrorHandler';

/**
 * Banner that shows when the user hits a rate limit (429 status code)
 * Auto-hides after 10 seconds
 */
const RateLimitBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Handler for the rate limit event
    const handleRateLimit = () => {
      setVisible(true);
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 10000);
      
      // Clear timeout if component unmounts
      return () => clearTimeout(timer);
    };
    
    // Listen for rate limit events
    window.addEventListener(RATE_LIMIT_EVENT, handleRateLimit);
    
    // Clean up event listener
    return () => {
      window.removeEventListener(RATE_LIMIT_EVENT, handleRateLimit);
    };
  }, []);
  
  if (!visible) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black py-2 px-4 flex items-center justify-center shadow-md animate-slideDown">
      <FiAlertTriangle className="mr-2 flex-shrink-0" />
      <span className="font-medium">
        You're making requests too quickly. Please slow down.
      </span>
      <button
        onClick={() => setVisible(false)}
        className="ml-4 p-1 rounded-full hover:bg-amber-600 transition-colors"
        aria-label="Dismiss"
      >
        <FiX />
      </button>
    </div>
  );
};

export default RateLimitBanner;