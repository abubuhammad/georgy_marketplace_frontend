import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationAddress {
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  name?: string;
}

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [locationAddress, setLocationAddress] = useState<LocationAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionGranted(status === 'granted');
    } catch (error) {
      console.error('Permission check error:', error);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setPermissionGranted(granted);
      
      if (!granted) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to use location-based features'
        );
      }
      
      return granted;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<LocationCoords | null> => {
    try {
      setLoading(true);

      if (!permissionGranted) {
        const granted = await requestLocationPermission();
        if (!granted) return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
      });

      const coords: LocationCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };

      setUserLocation(coords);
      return coords;
    } catch (error) {
      console.error('Get location error:', error);
      Alert.alert('Location Error', 'Failed to get current location');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const watchLocation = () => {
    if (!permissionGranted) {
      requestLocationPermission();
      return null;
    }

    return Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        const coords: LocationCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        };
        setUserLocation(coords);
      }
    );
  };

  const reverseGeocode = async (coords: LocationCoords): Promise<LocationAddress | null> => {
    try {
      setLoading(true);

      const addresses = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        const locationAddress: LocationAddress = {
          street: address.street,
          city: address.city,
          region: address.region,
          country: address.country,
          postalCode: address.postalCode,
          name: address.name,
        };

        setLocationAddress(locationAddress);
        return locationAddress;
      }

      return null;
    } catch (error) {
      console.error('Reverse geocode error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const geocodeAddress = async (address: string): Promise<LocationCoords | null> => {
    try {
      setLoading(true);

      const locations = await Location.geocodeAsync(address);

      if (locations.length > 0) {
        const coords: LocationCoords = {
          latitude: locations[0].latitude,
          longitude: locations[0].longitude,
        };

        return coords;
      }

      return null;
    } catch (error) {
      console.error('Geocode error:', error);
      Alert.alert('Geocoding Error', 'Failed to find location for the given address');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (coords1: LocationCoords, coords2: LocationCoords): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(coords2.latitude - coords1.latitude);
    const dLon = toRadians(coords2.longitude - coords1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(coords1.latitude)) * Math.cos(toRadians(coords2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  return {
    userLocation,
    locationAddress,
    loading,
    permissionGranted,
    getCurrentLocation,
    watchLocation,
    reverseGeocode,
    geocodeAddress,
    calculateDistance,
    requestLocationPermission,
  };
};
