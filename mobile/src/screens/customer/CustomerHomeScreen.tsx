import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList, Alert, RefreshControl } from 'react-native';
import { Text, Card, Button, Searchbar, Chip, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';

// Artisan service categories
const serviceCategories = [
  { id: '1', name: 'Plumbing', icon: 'water-outline', description: 'Pipes, drains, water systems' },
  { id: '2', name: 'Electrical', icon: 'flash-outline', description: 'Wiring, repairs, installations' },
  { id: '3', name: 'Carpentry', icon: 'hammer-outline', description: 'Furniture, repairs, installations' },
  { id: '4', name: 'Painting', icon: 'brush-outline', description: 'Interior, exterior painting' },
  { id: '5', name: 'Cleaning', icon: 'sparkles-outline', description: 'Home, office, deep cleaning' },
  { id: '6', name: 'Beauty', icon: 'cut-outline', description: 'Hair, makeup, skincare' },
  { id: '7', name: 'Automotive', icon: 'car-outline', description: 'Car repairs, maintenance' },
  { id: '8', name: 'Handyman', icon: 'build-outline', description: 'General repairs, odd jobs' },
];

export const CustomerHomeScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderServiceCategory = ({ item }: { item: any }) => (
    <Card 
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
    >
      <Card.Content style={styles.categoryContent}>
        <Ionicons 
          name={item.icon as any} 
          size={40} 
          color={colors.primary} 
          style={styles.categoryIcon}
        />
        <Text variant="titleMedium" style={styles.categoryName}>
          {item.name}
        </Text>
        <Text variant="bodySmall" style={styles.categoryDescription}>
          {item.description}
        </Text>
      </Card.Content>
    </Card>
  );

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('ArtisanDiscovery', { query: searchQuery });
    }
  };

  const handleCategoryPress = (category: any) => {
    navigation.navigate('ServiceCategories', { category: category.name });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyMedium" style={{ marginTop: 16, color: colors.textSecondary }}>
          Loading home data...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.greeting}>
          Welcome to Georgy
        </Text>
        <Text variant="bodyMedium" style={styles.subGreeting}>
          Find skilled artisans and book services
        </Text>
      </View>

      {/* Search Bar */}
      <Searchbar
        placeholder="Search for services..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={handleSearch}
        style={styles.searchBar}
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button
          mode="contained"
          icon="account-group"
          onPress={() => navigation.navigate('ArtisanDiscovery')}
          style={styles.actionButton}
        >
          Find Artisans
        </Button>
        <Button
          mode="outlined"
          icon="clipboard-list"
          onPress={() => navigation.navigate('RequestDashboard')}
          style={styles.actionButton}
        >
          My Requests
        </Button>
      </View>

      {/* Service Categories */}
      <Text variant="headlineSmall" style={styles.sectionTitle}>
        Service Categories
      </Text>
      <FlatList
        data={serviceCategories}
        renderItem={renderServiceCategory}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.categoriesGrid}
      />

      {/* How It Works */}
      <Text variant="headlineSmall" style={styles.sectionTitle}>
        How It Works
      </Text>
      <View style={styles.howItWorksContainer}>
        <View style={styles.stepCard}>
          <Ionicons name="search-outline" size={24} color={colors.primary} />
          <Text variant="titleMedium" style={styles.stepTitle}>1. Find Service</Text>
          <Text variant="bodySmall" style={styles.stepDescription}>
            Browse categories or search for the service you need
          </Text>
        </View>
        <View style={styles.stepCard}>
          <Ionicons name="person-outline" size={24} color={colors.primary} />
          <Text variant="titleMedium" style={styles.stepTitle}>2. Choose Artisan</Text>
          <Text variant="bodySmall" style={styles.stepDescription}>
            Review profiles, ratings, and get quotes from skilled artisans
          </Text>
        </View>
        <View style={styles.stepCard}>
          <Ionicons name="checkmark-outline" size={24} color={colors.primary} />
          <Text variant="titleMedium" style={styles.stepTitle}>3. Book & Pay</Text>
          <Text variant="bodySmall" style={styles.stepDescription}>
            Schedule your service and pay securely through our platform
          </Text>
        </View>
      </View>

      {/* Get Started Promotion */}
      <Card style={styles.promoCard}>
        <Card.Content>
          <View style={styles.promoContent}>
            <Ionicons name="construct" size={48} color={colors.primary} />
            <View style={styles.promoText}>
              <Text variant="titleLarge" style={styles.promoTitle}>
                Ready to Get Started?
              </Text>
              <Text variant="bodyMedium" style={styles.promoDescription}>
                Find the perfect artisan for your next project
              </Text>
            </View>
          </View>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('ServiceRequestForm')}
            style={styles.promoButton}
          >
            Request Service Now
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
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
  header: {
    padding: 20,
    backgroundColor: colors.primary,
  },
  greeting: {
    color: colors.white,
    marginBottom: 4,
  },
  subGreeting: {
    color: colors.white,
    opacity: 0.9,
  },
  searchBar: {
    margin: 20,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 16,
    color: colors.text,
  },
  categoriesGrid: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  categoryCard: {
    flex: 1,
    margin: 6,
    maxWidth: '47%',
  },
  categoryContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  categoryIcon: {
    marginBottom: 12,
  },
  categoryName: {
    textAlign: 'center',
    color: colors.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  categoryDescription: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 12,
  },
  howItWorksContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
  },
  stepTitle: {
    marginLeft: 16,
    marginRight: 12,
    color: colors.text,
    minWidth: 100,
  },
  stepDescription: {
    flex: 1,
    color: colors.textSecondary,
  },
  promoCard: {
    margin: 20,
    backgroundColor: colors.primaryLight,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  promoText: {
    flex: 1,
    marginLeft: 16,
  },
  promoTitle: {
    color: colors.primary,
    marginBottom: 4,
  },
  promoDescription: {
    color: colors.textSecondary,
  },
  promoButton: {
    alignSelf: 'flex-start',
  },
});
