import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

// Platform types for multi-platform support
export type Platform = 'ecommerce' | 'realestate' | 'jobs' | 'artisan';

interface AppContextType {
  // UI State
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // Platform Management
  currentPlatform: Platform;
  setPlatform: (platform: Platform) => void;
  
  // Global Loading States
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Search State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Location Data
  userLocation: GeolocationCoordinates | null;
  setUserLocation: (location: GeolocationCoordinates | null) => void;
  
  // Currency/Language
  currency: string;
  setCurrency: (currency: string) => void;
  
  // Notification Count
  notificationCount: number;
  setNotificationCount: (count: number) => void;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  currentPlatform: 'ecommerce',
  setPlatform: () => {},
  isLoading: false,
  setIsLoading: () => {},
  searchQuery: '',
  setSearchQuery: () => {},
  userLocation: null,
  setUserLocation: () => {},
  currency: 'NGN',
  setCurrency: () => {},
  notificationCount: 0,
  setNotificationCount: () => {},
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('ecommerce');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [currency, setCurrency] = useState('NGN');
  const [notificationCount, setNotificationCount] = useState(0);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const setPlatform = (platform: Platform) => {
    setCurrentPlatform(platform);
    // Reset search when switching platforms
    setSearchQuery('');
  };

  // Get user location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(position.coords);
        },
        (error) => {
          console.warn('Failed to get user location:', error);
        }
      );
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        currentPlatform,
        setPlatform,
        isLoading,
        setIsLoading,
        searchQuery,
        setSearchQuery,
        userLocation,
        setUserLocation,
        currency,
        setCurrency,
        notificationCount,
        setNotificationCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
