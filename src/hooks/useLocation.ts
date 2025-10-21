import { useState, useEffect, useCallback } from 'react';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationError {
  code: number;
  message: string;
}

interface UseLocationReturn {
  coordinates: Coordinates | null;
  error: LocationError | null;
  isLoading: boolean;
  accuracy: number | null;
  getCurrentLocation: () => Promise<void>;
  watchPosition: () => void;
  stopWatching: () => void;
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => number;
  formatAddress: (lat: number, lng: number) => Promise<string>;
}

export function useLocation(): UseLocationReturn {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<LocationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by this browser',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute
    };

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      setCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setAccuracy(position.coords.accuracy);
    } catch (err) {
      const geolocationError = err as GeolocationPositionError;
      setError({
        code: geolocationError.code,
        message: getLocationErrorMessage(geolocationError.code),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by this browser',
      });
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000, // 30 seconds
    };

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setAccuracy(position.coords.accuracy);
        setError(null);
      },
      (err) => {
        setError({
          code: err.code,
          message: getLocationErrorMessage(err.code),
        });
      },
      options
    );

    setWatchId(id);
  }, []);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }, []);

  // Format coordinates to human-readable address using reverse geocoding
  const formatAddress = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      // Using a free geocoding service (you might want to use Google Maps API in production)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }
      
      const data = await response.json();
      
      if (data.display_name) {
        return data.display_name;
      }
      
      // Fallback to basic formatting
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Geocoding error:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }, []);

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    coordinates,
    error,
    isLoading,
    accuracy,
    getCurrentLocation,
    watchPosition,
    stopWatching,
    calculateDistance,
    formatAddress,
  };
}

// Helper functions
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function getLocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Location access denied by user';
    case 2:
      return 'Location information unavailable';
    case 3:
      return 'Location request timed out';
    default:
      return 'Unknown location error';
  }
}

// Hook for checking if location services are available
export function useLocationPermission() {
  const [permission, setPermission] = useState<PermissionState | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if geolocation is supported
    setIsSupported('geolocation' in navigator);

    // Check permission status if supported
    if ('permissions' in navigator && 'geolocation' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermission(result.state);
        
        // Listen for permission changes
        result.onchange = () => {
          setPermission(result.state);
        };
      });
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
        });
      });
      
      setPermission('granted');
      return true;
    } catch (error) {
      setPermission('denied');
      return false;
    }
  }, [isSupported]);

  return {
    permission,
    isSupported,
    requestPermission,
  };
}
