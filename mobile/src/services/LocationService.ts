import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

export interface LocationData extends LocationCoordinates {
  address?: Address;
  timestamp?: number;
}

export interface ServiceArea {
  center: LocationCoordinates;
  radiusKm: number;
}

export interface ArtisanLocation {
  id: string;
  name: string;
  coordinates: LocationCoordinates;
  address: Address;
  serviceArea: ServiceArea;
  rating: number;
  categories: string[];
  isAvailable: boolean;
}

class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationData | null = null;
  private watchId: Location.LocationSubscription | null = null;
  private permissionsGranted: boolean = false;

  constructor() {
    if (LocationService.instance) {
      return LocationService.instance;
    }
    LocationService.instance = this;
  }

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Request location permissions from the user
   */
  async requestLocationPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Location access is required to find nearby artisans and estimate service distances. Please enable location permissions.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        return false;
      }

      // Request background permissions for better service area tracking (optional)
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      this.permissionsGranted = true;
      console.log('Location permissions granted:', { foregroundStatus, backgroundStatus });
      
      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      Alert.alert('Permission Error', 'Unable to request location permissions');
      return false;
    }
  }

  /**
   * Get current device location
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      if (!this.permissionsGranted) {
        const hasPermissions = await this.requestLocationPermissions();
        if (!hasPermissions) return null;
      }

      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        maximumAge: 30000, // Cache for 30 seconds
      });

      const coordinates: LocationCoordinates = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
        accuracy: locationResult.coords.accuracy || undefined,
      };

      // Get address information
      const address = await this.reverseGeocode(coordinates);

      this.currentLocation = {
        ...coordinates,
        address,
        timestamp: Date.now(),
      };

      return this.currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Location Error', 'Unable to get your current location. Please check your GPS settings.');
      return null;
    }
  }

  /**
   * Start watching location changes
   */
  async startLocationWatching(callback: (location: LocationData) => void): Promise<boolean> {
    try {
      if (!this.permissionsGranted) {
        const hasPermissions = await this.requestLocationPermissions();
        if (!hasPermissions) return false;
      }

      if (this.watchId) {
        this.stopLocationWatching();
      }

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 60000, // Update every minute
          distanceInterval: 100, // Update every 100 meters
        },
        async (locationResult) => {
          const coordinates: LocationCoordinates = {
            latitude: locationResult.coords.latitude,
            longitude: locationResult.coords.longitude,
            accuracy: locationResult.coords.accuracy || undefined,
          };

          // Get address information
          const address = await this.reverseGeocode(coordinates);

          const locationData: LocationData = {
            ...coordinates,
            address,
            timestamp: Date.now(),
          };

          this.currentLocation = locationData;
          callback(locationData);
        }
      );

      return true;
    } catch (error) {
      console.error('Error starting location watching:', error);
      return false;
    }
  }

  /**
   * Stop watching location changes
   */
  stopLocationWatching(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  /**
   * Convert coordinates to address (reverse geocoding)
   */
  async reverseGeocode(coordinates: LocationCoordinates): Promise<Address | undefined> {
    try {
      const results = await Location.reverseGeocodeAsync(coordinates);
      
      if (results && results.length > 0) {
        const result = results[0];
        return {
          street: result.street || undefined,
          city: result.city || undefined,
          state: result.region || undefined,
          country: result.country || undefined,
          postalCode: result.postalCode || undefined,
          formattedAddress: this.formatAddress(result),
        };
      }

      return undefined;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return undefined;
    }
  }

  /**
   * Convert address to coordinates (forward geocoding)
   */
  async geocode(address: string): Promise<LocationCoordinates[]> {
    try {
      const results = await Location.geocodeAsync(address);
      
      return results.map(result => ({
        latitude: result.latitude,
        longitude: result.longitude,
      }));
    } catch (error) {
      console.error('Error geocoding address:', error);
      return [];
    }
  }

  /**
   * Calculate distance between two points in kilometers
   */
  calculateDistance(point1: LocationCoordinates, point2: LocationCoordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(point2.latitude - point1.latitude);
    const dLon = this.deg2rad(point2.longitude - point1.longitude);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(point1.latitude)) * Math.cos(this.deg2rad(point2.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Check if a location is within a service area
   */
  isWithinServiceArea(customerLocation: LocationCoordinates, serviceArea: ServiceArea): boolean {
    const distance = this.calculateDistance(customerLocation, serviceArea.center);
    return distance <= serviceArea.radiusKm;
  }

  /**
   * Find nearby artisans within a specified radius
   */
  findNearbyArtisans(
    customerLocation: LocationCoordinates,
    artisans: ArtisanLocation[],
    maxDistanceKm: number = 25,
    serviceCategory?: string
  ): Array<ArtisanLocation & { distance: number }> {
    const nearbyArtisans = artisans
      .filter(artisan => {
        // Filter by availability
        if (!artisan.isAvailable) return false;

        // Filter by service category if specified
        if (serviceCategory && !artisan.categories.includes(serviceCategory)) {
          return false;
        }

        // Check if customer is within artisan's service area
        return this.isWithinServiceArea(customerLocation, artisan.serviceArea);
      })
      .map(artisan => {
        const distance = this.calculateDistance(customerLocation, artisan.coordinates);
        return { ...artisan, distance };
      })
      .filter(artisan => artisan.distance <= maxDistanceKm)
      .sort((a, b) => {
        // Sort by distance first, then by rating
        if (a.distance !== b.distance) {
          return a.distance - b.distance;
        }
        return b.rating - a.rating;
      });

    return nearbyArtisans;
  }

  /**
   * Get formatted distance text
   */
  getDistanceText(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m away`;
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)}km away`;
    } else {
      return `${Math.round(distanceKm)}km away`;
    }
  }

  /**
   * Estimate travel time (simple calculation based on distance)
   */
  estimateTravelTime(distanceKm: number): string {
    // Assumes average speed of 30km/h in urban areas
    const hours = distanceKm / 30;
    const minutes = Math.round(hours * 60);
    
    if (minutes < 60) {
      return `~${minutes} mins`;
    } else {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `~${hrs}h ${mins}m` : `~${hrs}h`;
    }
  }

  /**
   * Get current cached location
   */
  getCachedLocation(): LocationData | null {
    return this.currentLocation;
  }

  /**
   * Check if cached location is fresh (less than 5 minutes old)
   */
  isCachedLocationFresh(): boolean {
    if (!this.currentLocation || !this.currentLocation.timestamp) {
      return false;
    }
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return this.currentLocation.timestamp > fiveMinutesAgo;
  }

  /**
   * Private helper methods
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private formatAddress(geocodeResult: any): string {
    const parts = [];
    
    if (geocodeResult.name) parts.push(geocodeResult.name);
    if (geocodeResult.street) parts.push(geocodeResult.street);
    if (geocodeResult.city) parts.push(geocodeResult.city);
    if (geocodeResult.region) parts.push(geocodeResult.region);
    
    return parts.join(', ');
  }

  /**
   * Create service area from address and radius
   */
  async createServiceArea(address: string, radiusKm: number): Promise<ServiceArea | null> {
    try {
      const coordinates = await this.geocode(address);
      if (coordinates.length === 0) {
        throw new Error('Address not found');
      }

      return {
        center: coordinates[0],
        radiusKm,
      };
    } catch (error) {
      console.error('Error creating service area:', error);
      return null;
    }
  }

  /**
   * Search for artisans with advanced filters
   */
  searchArtisans(params: {
    customerLocation: LocationCoordinates;
    artisans: ArtisanLocation[];
    category?: string;
    maxDistance?: number;
    minRating?: number;
    sortBy?: 'distance' | 'rating' | 'availability';
  }): Array<ArtisanLocation & { distance: number }> {
    const {
      customerLocation,
      artisans,
      category,
      maxDistance = 25,
      minRating = 0,
      sortBy = 'distance'
    } = params;

    let filteredArtisans = this.findNearbyArtisans(
      customerLocation,
      artisans,
      maxDistance,
      category
    );

    // Apply rating filter
    if (minRating > 0) {
      filteredArtisans = filteredArtisans.filter(artisan => artisan.rating >= minRating);
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filteredArtisans.sort((a, b) => b.rating - a.rating);
        break;
      case 'availability':
        filteredArtisans.sort((a, b) => {
          if (a.isAvailable && !b.isAvailable) return -1;
          if (!a.isAvailable && b.isAvailable) return 1;
          return a.distance - b.distance; // Secondary sort by distance
        });
        break;
      case 'distance':
      default:
        // Already sorted by distance in findNearbyArtisans
        break;
    }

    return filteredArtisans;
  }
}

export default LocationService.getInstance();