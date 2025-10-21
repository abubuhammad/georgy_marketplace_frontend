import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook for dashboard data refresh on navigation
 * Ensures dashboard data reloads when user navigates back/forward or directly to the page
 * 
 * @param refreshCallback - Function to call when dashboard should refresh
 * @param dependencies - Additional dependencies to watch for changes (optional)
 */
export const useDashboardRefresh = (
  refreshCallback: () => void | Promise<void>,
  dependencies: any[] = []
) => {
  const location = useLocation();

  const refresh = useCallback(refreshCallback, dependencies);

  // Refresh on location change (browser back/forward navigation)
  useEffect(() => {
    refresh();
  }, [location.key, refresh]);

  // Also refresh on initial mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return { refresh };
};

export default useDashboardRefresh;