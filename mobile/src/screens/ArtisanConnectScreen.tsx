import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';

interface QuickService {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  category: string;
}

interface FeaturedArtisan {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  distance: string;
  avatar: string;
  isOnline: boolean;
}

interface ArtisanConnectScreenProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const ArtisanConnectScreen: React.FC<ArtisanConnectScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [featuredArtisans, setFeaturedArtisans] = useState<FeaturedArtisan[]>([]);
  const [activeRequests, setActiveRequests] = useState(0);

  const quickServices: QuickService[] = [
    { id: '1', name: 'Plumbing', icon: 'water-outline', color: '#3B82F6', category: '1' },
    { id: '2', name: 'Electrical', icon: 'flash-outline', color: '#F59E0B', category: '2' },
    { id: '3', name: 'Cleaning', icon: 'sparkles-outline', color: '#10B981', category: '5' },
    { id: '4', name: 'Beauty', icon: 'cut-outline', color: '#EC4899', category: '6' },
  ];

  useEffect(() => {
    loadFeaturedArtisans();
    loadUserStats();
  }, []);

  const loadFeaturedArtisans = () => {
    // TODO: Replace with actual API call
    const mockArtisans: FeaturedArtisan[] = [
      {
        id: '1',
        name: 'John Doe',
        category: 'Plumbing',
        rating: 4.9,
        reviewCount: 127,
        distance: '2.3 km',
        avatar: '',
        isOnline: true,
      },
      {
        id: '2',
        name: 'Sarah Wilson',
        category: 'Electrical',
        rating: 4.8,
        reviewCount: 85,
        distance: '1.8 km',
        avatar: '',
        isOnline: false,
      },
      {
        id: '3',
        name: 'Mike Johnson',
        category: 'Carpentry',
        rating: 4.7,
        reviewCount: 63,
        distance: '3.1 km',
        avatar: '',
        isOnline: true,
      },
    ];
    setFeaturedArtisans(mockArtisans);
  };

  const loadUserStats = () => {
    // TODO: Load user's active requests
    setActiveRequests(3);
  };

  const handleQuickService = (service: QuickService) => {
    navigation.navigate('ServiceRequestForm', { 
      category: service.category, 
      categoryName: service.name 
    });
  };

  const renderQuickServiceItem = (service: QuickService) => (
    <TouchableOpacity
      key={service.id}
      style={styles.quickServiceItem}
      onPress={() => handleQuickService(service)}
      activeOpacity={0.7}
    >
      <View style={[styles.quickServiceIcon, { backgroundColor: service.color + '20' }]}>
        <Ionicons name={service.icon} size={28} color={service.color} />
      </View>
      <Text style={styles.quickServiceText}>{service.name}</Text>
    </TouchableOpacity>
  );

  const renderFeaturedArtisan = (artisan: FeaturedArtisan) => (
    <TouchableOpacity
      key={artisan.id}
      style={styles.artisanCard}
      onPress={() => navigation.navigate('ArtisanProfile', { artisanId: artisan.id })}
      activeOpacity={0.7}
    >
      <View style={styles.artisanHeader}>
        <View style={styles.artisanAvatarContainer}>
          {artisan.avatar ? (
            <Image source={{ uri: artisan.avatar }} style={styles.artisanAvatar} />
          ) : (
            <View style={styles.artisanAvatarPlaceholder}>
              <Text style={styles.artisanAvatarText}>
                {artisan.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {artisan.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        <View style={styles.artisanInfo}>
          <Text style={styles.artisanName}>{artisan.name}</Text>
          <Text style={styles.artisanCategory}>{artisan.category}</Text>
          <View style={styles.artisanMeta}>
            <View style={styles.rating}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{artisan.rating}</Text>
              <Text style={styles.reviewCount}>({artisan.reviewCount})</Text>
            </View>
            <Text style={styles.distance}>{artisan.distance} away</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.chatButton}
        onPress={(e) => {
          e.stopPropagation();
          navigation.navigate('Chat', { 
            chatId: `chat_${artisan.id}`,
            participantId: artisan.id,
          });
        }}
      >
        <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Hello, {user?.firstName || 'User'}!</Text>
            <Text style={styles.subtitle}>What service do you need today?</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {activeRequests > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{activeRequests}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('ServiceCategories')}
            >
              <Ionicons name="grid-outline" size={24} color={colors.white} />
              <Text style={styles.quickActionText}>Browse Services</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: '#10B981' }]}
              onPress={() => navigation.navigate('RequestDashboard')}
            >
              <Ionicons name="clipboard-outline" size={24} color={colors.white} />
              <Text style={styles.quickActionText}>My Requests</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Book</Text>
          <View style={styles.quickServicesGrid}>
            {quickServices.map(renderQuickServiceItem)}
          </View>
        </View>

        {/* Featured Artisans */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Artisans Nearby</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('ArtisanDiscovery')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.featuredArtisans}>
            {featuredArtisans.map(renderFeaturedArtisan)}
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How ArtisanConnect Works</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: colors.primary + '20' }]}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Post Your Request</Text>
                <Text style={styles.stepDescription}>
                  Describe your service needs with photos and location
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#10B981' + '20' }]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Get Quotes</Text>
                <Text style={styles.stepDescription}>
                  Receive competitive quotes from verified artisans
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#F59E0B' + '20' }]}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Get It Done</Text>
                <Text style={styles.stepDescription}>
                  Track progress and pay securely when completed
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Emergency Banner */}
        <View style={styles.emergencyBanner}>
          <View style={styles.emergencyContent}>
            <Ionicons name="medical-outline" size={32} color={colors.white} />
            <View style={styles.emergencyText}>
              <Text style={styles.emergencyTitle}>Emergency Services</Text>
              <Text style={styles.emergencySubtitle}>
                Need urgent help? Get immediate assistance 24/7
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={() => navigation.navigate('EmergencyServices')}
          >
            <Text style={styles.emergencyButtonText}>Call Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  quickServicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  quickServiceItem: {
    width: (screenWidth - 60) / 2, // 20px padding on each side + 16px gap
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickServiceIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickServiceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  featuredArtisans: {
    gap: 12,
  },
  artisanCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  artisanHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  artisanAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  artisanAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  artisanAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artisanAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: colors.white,
  },
  artisanInfo: {
    flex: 1,
  },
  artisanName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  artisanCategory: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  artisanMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  reviewCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  distance: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chatButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  stepsContainer: {
    gap: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  emergencyBanner: {
    margin: 20,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emergencyText: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
  },
  emergencyButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emergencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
});

export default ArtisanConnectScreen;