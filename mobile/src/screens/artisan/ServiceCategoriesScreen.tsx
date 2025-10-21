import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';

interface ServiceCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  color: string;
}

const serviceCategories: ServiceCategory[] = [
  {
    id: '1',
    name: 'Plumbing',
    icon: 'water-outline',
    description: 'Pipes, fixtures, water systems',
    color: '#3B82F6',
  },
  {
    id: '2',
    name: 'Electrical',
    icon: 'flash-outline',
    description: 'Wiring, outlets, lighting',
    color: '#F59E0B',
  },
  {
    id: '3',
    name: 'Carpentry',
    icon: 'hammer-outline',
    description: 'Furniture, doors, windows',
    color: '#8B5CF6',
  },
  {
    id: '4',
    name: 'Painting',
    icon: 'brush-outline',
    description: 'Interior, exterior painting',
    color: '#EC4899',
  },
  {
    id: '5',
    name: 'Cleaning',
    icon: 'sparkles-outline',
    description: 'Home, office cleaning services',
    color: '#10B981',
  },
  {
    id: '6',
    name: 'Beauty',
    icon: 'cut-outline',
    description: 'Hair, nails, makeup services',
    color: '#F97316',
  },
  {
    id: '7',
    name: 'Automotive',
    icon: 'car-outline',
    description: 'Car repair, maintenance',
    color: '#6366F1',
  },
  {
    id: '8',
    name: 'Handyman',
    icon: 'construct-outline',
    description: 'General repairs and fixes',
    color: '#EF4444',
  },
];

interface ServiceCategoriesScreenProps {
  navigation: any;
}

export const ServiceCategoriesScreen: React.FC<ServiceCategoriesScreenProps> = ({ navigation }) => {
  const handleCategoryPress = (category: ServiceCategory) => {
    navigation.navigate('ArtisanDiscovery', { category: category.id, categoryName: category.name });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Service Categories</Text>
        <Text style={styles.subtitle}>Choose the service you need</Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesGrid}>
          {serviceCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryCard, { borderLeftColor: category.color }]}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                  <Ionicons
                    name={category.icon}
                    size={32}
                    color={category.color}
                  />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => navigation.navigate('EmergencyServices')}
        >
          <Ionicons name="medical-outline" size={24} color={colors.white} />
          <Text style={styles.emergencyButtonText}>Emergency Services</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  categoriesGrid: {
    padding: 20,
    gap: 16,
  },
  categoryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  cardFooter: {
    marginLeft: 12,
  },
  bottomSection: {
    padding: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  emergencyButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default ServiceCategoriesScreen;