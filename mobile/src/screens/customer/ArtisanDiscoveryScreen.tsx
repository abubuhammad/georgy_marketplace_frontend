import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Searchbar, Chip, FAB, ActivityIndicator, Switch } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';
import { Artisan, ServiceCategory } from '../../types/Artisan';
import { artisanService } from '../../services/artisanService';
import LocationService, { LocationData, ArtisanLocation } from '../../services/LocationService';

export const ArtisanDiscoveryScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  
  // Location-based state
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [useLocationFilter, setUseLocationFilter] = useState(true);
  const [maxDistance, setMaxDistance] = useState(25); // km
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'availability'>('distance');
  const [artisansWithDistance, setArtisansWithDistance] = useState<(Artisan & { distance?: number })[]>([]);

  useEffect(() => {
    loadInitialData();
    requestLocationPermission();
  }, []);

  useEffect(() => {
    loadArtisans();
  }, [selectedCategory, searchQuery, userLocation, useLocationFilter, maxDistance, sortBy]);

  const requestLocationPermission = async () => {
    try {
      setLocationLoading(true);
      const hasPermission = await LocationService.requestLocationPermissions();
      
      if (hasPermission) {
        const location = await LocationService.getCurrentLocation();
        if (location) {
          setUserLocation(location);
        }
      } else {
        setUseLocationFilter(false);
        Alert.alert(
          'Location Access Denied',
          'Without location access, we cannot show nearby artisans or calculate distances. You can still browse all available artisans.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location:', error);
      setUseLocationFilter(false);
    } finally {
      setLocationLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      const location = await LocationService.getCurrentLocation();
      if (location) {
        setUserLocation(location);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to get your current location');
    } finally {
      setLocationLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load service categories
      const categories = await artisanService.getServiceCategories();
      setServiceCategories(categories);
      
      // Load initial artisans
      await loadArtisans();
    } catch (error) {
      console.error('Failed to load initial data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadArtisans = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

      // Build search filters
      const filters: any = {
        limit: 20,
        page: 1
      };

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      if (selectedCategory) {
        const categoryName = serviceCategories.find(cat => cat.id === selectedCategory)?.name;
        if (categoryName) {
          filters.category = categoryName;
        }
      }

      // Add location filters if user location is available and enabled
      if (useLocationFilter && userLocation) {
        filters.latitude = userLocation.latitude;
        filters.longitude = userLocation.longitude;
        filters.maxDistance = maxDistance;
      }

      // Search artisans
      const result = await artisanService.searchArtisans(filters);
      let processedArtisans = result.artisans;

      // Calculate distances if location is available
      if (userLocation && processedArtisans.length > 0) {
        processedArtisans = processedArtisans.map(artisan => {
          // Assume artisan has coordinates from API or generate mock coordinates
          const artisanCoords = getArtisanCoordinates(artisan);
          const distance = artisanCoords 
            ? LocationService.calculateDistance(userLocation, artisanCoords)
            : undefined;
          
          return { ...artisan, distance };
        });

        // Apply location-based sorting
        if (useLocationFilter) {
          switch (sortBy) {
            case 'distance':
              processedArtisans.sort((a, b) => {
                if (a.distance === undefined) return 1;
                if (b.distance === undefined) return -1;
                return a.distance - b.distance;
              });
              break;
            case 'rating':
              processedArtisans.sort((a, b) => b.rating - a.rating);
              break;
            case 'availability':
              processedArtisans.sort((a, b) => {
                if (a.availability_status === 'available' && b.availability_status !== 'available') return -1;
                if (a.availability_status !== 'available' && b.availability_status === 'available') return 1;
                if (a.distance === undefined || b.distance === undefined) return 0;
                return a.distance - b.distance;
              });
              break;
          }
        }
      }

      setArtisans(processedArtisans);
      setArtisansWithDistance(processedArtisans);
      setTotal(result.total);

    } catch (error) {
      console.error('Failed to load artisans:', error);
      Alert.alert('Error', 'Failed to load artisans');
    } finally {
      setRefreshing(false);
    }
  };

  // Helper function to get artisan coordinates (mock for now)
  const getArtisanCoordinates = (artisan: Artisan) => {
    // TODO: Replace with actual coordinates from artisan profile
    // For now, generate mock coordinates based on Lagos area
    const baseLatitude = 6.5244;
    const baseLongitude = 3.3792;
    
    // Generate random offset within ~50km radius
    const offsetRange = 0.45; // roughly 50km in degrees
    const latOffset = (Math.random() - 0.5) * offsetRange;
    const lonOffset = (Math.random() - 0.5) * offsetRange;
    
    return {
      latitude: baseLatitude + latOffset,
      longitude: baseLongitude + lonOffset,
    };
  };

  const formatRate = (rate: number) => {
    return `₦${rate.toLocaleString()}/hr`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return colors.success;
      case 'busy':
        return colors.warning;
      case 'offline':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const renderCategory = ({ item }: { item: ServiceCategory }) => (
    <Chip
      selected={selectedCategory === item.id}
      onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
      style={styles.categoryChip}
      icon={item.icon}
    >
      {item.name}
    </Chip>
  );

  const renderArtisan = ({ item }: { item: Artisan & { distance?: number } }) => (
    <Card style={styles.artisanCard}>
      <Card.Content>
        <View style={styles.artisanHeader}>
          <View style={styles.artisanInfo}>
            <View style={styles.nameContainer}>
              <Text variant="titleLarge" style={styles.businessName}>
                {item.business_name}
              </Text>
              {item.verified && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </View>
            
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={colors.warning} />
              <Text variant="bodyMedium" style={styles.rating}>
                {item.rating} ({item.completed_jobs} jobs)
              </Text>
            </View>

            <View style={styles.locationRow}>
              <Text variant="bodyMedium" style={styles.location}>
                📍 {item.location}
              </Text>
              {item.distance !== undefined && (
                <Text variant="bodyMedium" style={styles.distance}>
                  • {LocationService.getDistanceText(item.distance)}
                </Text>
              )}
            </View>

            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.availability_status) }]} />
              <Text variant="bodySmall" style={styles.statusText}>
                {getStatusText(item.availability_status)}
              </Text>
              {item.distance !== undefined && (
                <Text variant="bodySmall" style={styles.travelTime}>
                  • {LocationService.estimateTravelTime(item.distance)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text variant="titleMedium" style={styles.rate}>
              {formatRate(item.hourly_rate)}
            </Text>
            {item.distance !== undefined && (
              <Text variant="bodySmall" style={styles.distanceLabel}>
                {item.distance.toFixed(1)}km away
              </Text>
            )}
          </View>
        </View>

        <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.categoriesContainer}>
          {item.service_categories.map((category, index) => (
            <Chip key={index} compact style={styles.serviceChip}>
              {category}
            </Chip>
          ))}
        </View>
      </Card.Content>

      <Card.Actions>
        <Button 
          mode="outlined" 
          onPress={() => navigation.navigate('Chat', { artisanId: item.id })}
        >
          Message
        </Button>
        <Button 
          mode="contained"
          onPress={() => navigation.navigate('ServiceRequest', { artisanId: item.id })}
        >
          Book Service
        </Button>
      </Card.Actions>
    </Card>
  );

  const handleRefresh = () => {
    loadArtisans(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyMedium" style={{ marginTop: 16, color: colors.textSecondary }}>
          Loading artisans...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search artisans..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Service Categories
      </Text>
      {serviceCategories.length > 0 ? (
        <FlatList
          data={serviceCategories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text variant="bodyMedium" style={styles.emptyText}>
            No service categories available
          </Text>
        </View>
      )}

      {/* Location Controls */}
      <View style={styles.locationControls}>
        <View style={styles.locationHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Available Artisans ({total})
          </Text>
          
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="location" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {userLocation && (
          <View style={styles.locationInfo}>
            <Text variant="bodySmall" style={styles.locationText}>
              📍 {userLocation.address?.formattedAddress || 'Current location'}
            </Text>
          </View>
        )}

        <View style={styles.filterRow}>
          <View style={styles.locationToggle}>
            <Text variant="bodyMedium">GPS-based sorting</Text>
            <Switch
              value={useLocationFilter && !!userLocation}
              onValueChange={setUseLocationFilter}
              disabled={!userLocation}
            />
          </View>
          
          {useLocationFilter && userLocation && (
            <View style={styles.sortControls}>
              <Text variant="bodySmall" style={styles.sortLabel}>Sort by:</Text>
              <View style={styles.sortButtons}>
                {[{ key: 'distance', label: 'Distance' }, { key: 'rating', label: 'Rating' }, { key: 'availability', label: 'Status' }].map((sort) => (
                  <Chip
                    key={sort.key}
                    selected={sortBy === sort.key}
                    onPress={() => setSortBy(sort.key as any)}
                    compact
                    style={styles.sortChip}
                  >
                    {sort.label}
                  </Chip>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
      
      {artisans.length > 0 ? (
        <FlatList
          data={artisans}
          renderItem={renderArtisan}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.artisansList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {searchQuery || selectedCategory 
              ? 'No artisans found matching your criteria'
              : 'No artisans available'
            }
          </Text>
          <Button mode="outlined" onPress={handleRefresh} style={{ marginTop: 8 }}>
            Retry
          </Button>
        </View>
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('ServiceRequest')}
        label="Request Service"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  searchBar: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    marginVertical: 12,
    color: colors.text,
  },
  categoriesList: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  artisansList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  artisanCard: {
    marginBottom: 16,
    elevation: 2,
  },
  artisanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  artisanInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  businessName: {
    color: colors.text,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    marginLeft: 4,
    color: colors.textSecondary,
  },
  location: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  distance: {
    color: colors.primary,
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: colors.textSecondary,
  },
  travelTime: {
    color: colors.textSecondary,
    marginLeft: 8,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  rate: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  distanceLabel: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  description: {
    color: colors.textSecondary,
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    backgroundColor: colors.primaryLight,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  
  // Location Controls
  locationControls: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
  },
  locationInfo: {
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  locationText: {
    color: colors.textSecondary,
  },
  filterRow: {
    gap: 12,
  },
  locationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  sortControls: {
    marginTop: 8,
  },
  sortLabel: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    backgroundColor: colors.background,
  },
});
