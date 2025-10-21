import { useEffect, useRef } from 'react';

export interface UseRealTimeDataOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds
  onUpdate?: () => void;
}

export function useRealTimeData(
  fetchFunction: () => Promise<void>,
  options: UseRealTimeDataOptions = {}
) {
  const {
    enabled = true,
    interval = 30000, // 30 seconds default
    onUpdate
  } = options;
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchRef = useRef(fetchFunction);
  
  // Update the fetch function ref when it changes
  useEffect(() => {
    fetchRef.current = fetchFunction;
  }, [fetchFunction]);
  
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    
    const performFetch = async () => {
      try {
        await fetchRef.current();
        onUpdate?.();
      } catch (error) {
        console.error('Real-time data fetch failed:', error);
      }
    };
    
    // Set up the interval
    intervalRef.current = setInterval(performFetch, interval);
    
    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, onUpdate]);
  
  // Manual refresh function
  const refresh = async () => {
    try {
      await fetchRef.current();
      onUpdate?.();
    } catch (error) {
      console.error('Manual refresh failed:', error);
      throw error;
    }
  };
  
  return { refresh };
}
