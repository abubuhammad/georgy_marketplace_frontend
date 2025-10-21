import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to handle page refresh on navigation
 * Ensures pages reload their data when navigating back/forward
 * 
 * @param refreshCallback - Function to call when page should refresh
 * @param dependencies - Additional dependencies to watch for changes
 */
export const usePageRefresh = (
  refreshCallback: () => void | Promise<void>,
  dependencies: any[] = []
) => {
  const location = useLocation();

  const refresh = useCallback(refreshCallback, dependencies);

  // Refresh on location change (browser back/forward)
  useEffect(() => {
    refresh();
  }, [location.key, refresh]);

  // Refresh on URL search params change
  useEffect(() => {
    refresh();
  }, [location.search, refresh]);

  // Also refresh when component mounts
  useEffect(() => {
    refresh();
  }, []);

  return { refresh };
};

/**
 * Hook specifically for handling URL parameter changes
 * Useful for pages that need to sync state with URL params
 */
export const useUrlSync = (
  syncCallback: (searchParams: URLSearchParams) => void
) => {
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    syncCallback(searchParams);
  }, [location.search, syncCallback]);
};

export default usePageRefresh;