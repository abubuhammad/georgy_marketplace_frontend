import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface RouterWrapperProps {
  children: React.ReactNode;
  onLocationChange?: (location: Location) => void;
}

/**
 * Router wrapper that handles location changes and forces re-renders
 * This ensures pages refresh properly when navigating back/forward
 */
export const RouterWrapper: React.FC<RouterWrapperProps> = ({ 
  children, 
  onLocationChange 
}) => {
  const location = useLocation();

  useEffect(() => {
    // Force scroll to top on navigation
    window.scrollTo(0, 0);
    
    // Call optional callback
    if (onLocationChange) {
      onLocationChange(location);
    }
  }, [location.pathname, location.search, location.key, onLocationChange]);

  return <>{children}</>;
};

export default RouterWrapper;