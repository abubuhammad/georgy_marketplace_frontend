import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ExpoImagePicker from 'expo-image-picker';
import { colors } from '../../theme/theme';
import { useCamera } from '../../hooks/useCamera';
import { ImagePicker } from '../../components/ImagePicker';
import { CameraImage } from '../../services/CameraService';

interface ArtisanProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  bio: string;
  specializations: string[];
  experience: number;
  location: {
    address: string;
    city: string;
    state: string;
  };
  serviceRadius: number;
  rating: number;
  totalJobs: number;
  isVerified: boolean;
  isActive: boolean;
  availability: {
    isAvailable: boolean;
    workingHours: {
      [key: string]: {
        enabled: boolean;
        startTime: string;
        endTime: string;
      };
    };
  };
  portfolio: PortfolioItem[];
  certifications: Certification[];
  subscription: {
    tier: 'basic' | 'premium' | 'enterprise';
    commissionRate: number;
    features: string[];
  };
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  completedAt: string;
  cost: number;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedAt: string;
  expiresAt?: string;
  credentialId?: string;
  verified: boolean;
  image?: string;
}

interface ArtisanProfileScreenProps {
  navigation: any;
  route: any;
}

const SPECIALIZATIONS = [
  'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning',
  'Beauty Services', 'Automotive', 'Handyman', 'Welding', 'Masonry'
];

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export const ArtisanProfileScreen: React.FC<ArtisanProfileScreenProps> = ({ navigation, route }) => {
  const { requestCameraPermissions } = useCamera();
  const [profile, setProfile] = useState<ArtisanProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'portfolio' | 'certifications' | 'availability'>('info');
  const [showSpecializationModal, setShowSpecializationModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showCertificationModal, setShowCertificationModal] = useState(false);

  // Form states
  const [editingInfo, setEditingInfo] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState<Partial<PortfolioItem>>({
    title: '',
    description: '',
    images: [],
    category: 'Plumbing',
    cost: 0,
  });
  const [newCertification, setNewCertification] = useState<Partial<Certification>>({
    name: '',
    issuer: '',
    credentialId: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockProfile: ArtisanProfile = {
        id: 'art_1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+234-806-123-4567',
        bio: 'Experienced plumber with 8+ years in residential and commercial plumbing. Specializing in pipe installation, repair, and water system maintenance.',
        specializations: ['Plumbing', 'Pipe Installation', 'Water Systems'],
        experience: 8,
        location: {
          address: '123 Artisan Street',
          city: 'Lagos',
          state: 'Lagos State',
        },
        serviceRadius: 15,
        rating: 4.8,
        totalJobs: 234,
        isVerified: true,
        isActive: true,
        availability: {
          isAvailable: true,
          workingHours: {
            monday: { enabled: true, startTime: '08:00', endTime: '18:00' },
            tuesday: { enabled: true, startTime: '08:00', endTime: '18:00' },
            wednesday: { enabled: true, startTime: '08:00', endTime: '18:00' },
            thursday: { enabled: true, startTime: '08:00', endTime: '18:00' },
            friday: { enabled: true, startTime: '08:00', endTime: '18:00' },
            saturday: { enabled: true, startTime: '09:00', endTime: '15:00' },
            sunday: { enabled: false, startTime: '10:00', endTime: '14:00' },
          },
        },
        portfolio: [
          {
            id: 'port_1',
            title: 'Kitchen Renovation Plumbing',
            description: 'Complete plumbing installation for modern kitchen renovation including new pipes, fixtures, and appliances connection.',
            images: [],
            category: 'Plumbing',
            completedAt: '2024-01-10T00:00:00Z',
            cost: 85000,
          },
          {
            id: 'port_2',
            title: 'Bathroom Pipe Repair',
            description: 'Emergency pipe repair and replacement in master bathroom. Fixed leaks and upgraded old copper pipes.',
            images: [],
            category: 'Plumbing',
            completedAt: '2024-01-05T00:00:00Z',
            cost: 35000,
          },
        ],
        certifications: [
          {
            id: 'cert_1',
            name: 'Certified Plumbing Professional',
            issuer: 'National Plumbing Association',
            issuedAt: '2022-03-15T00:00:00Z',
            credentialId: 'NPA-2022-001234',
            verified: true,
          },
          {
            id: 'cert_2',
            name: 'Safety Training Certificate',
            issuer: 'Occupational Safety Institute',
            issuedAt: '2023-06-20T00:00:00Z',
            expiresAt: '2025-06-20T00:00:00Z',
            verified: true,
          },
        ],
        subscription: {
          tier: 'premium',
          commissionRate: 8,
          features: ['Priority Listing', 'Analytics Dashboard', 'Customer Chat'],
        },
      };

      setProfile(mockProfile);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<ArtisanProfile>) => {
    if (!profile) return;

    try {
      setLoading(true);
      // TODO: Send to API
      console.log('Updating profile:', updates);
      
      setProfile({ ...profile, ...updates });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async (callback: (imageUri: string) => void) => {
    try {
      await requestCameraPermissions();
      
      const options = [
        { text: 'Camera', onPress: () => openCamera(callback) },
        { text: 'Photo Library', onPress: () => openImagePicker(callback) },
        { text: 'Cancel', style: 'cancel' as const },
      ];

      Alert.alert('Select Image', 'Choose an option', options);
    } catch (error) {
      Alert.alert('Permission Error', 'Camera permission is required');
    }
  };

  const openCamera = async (callback: (imageUri: string) => void) => {
    const result = await ExpoImagePicker.launchCameraAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      callback(result.assets[0].uri);
    }
  };

  const openImagePicker = async (callback: (imageUri: string) => void) => {
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      callback(result.assets[0].uri);
    }
  };

  const addPortfolioItem = async () => {
    if (!newPortfolio.title?.trim()) {
      Alert.alert('Error', 'Please enter a title for your portfolio item');
      return;
    }

    try {
      const portfolioItem: PortfolioItem = {
        id: `port_${Date.now()}`,
        title: newPortfolio.title!,
        description: newPortfolio.description || '',
        images: newPortfolio.images || [],
        category: newPortfolio.category!,
        completedAt: new Date().toISOString(),
        cost: newPortfolio.cost || 0,
      };

      if (profile) {
        const updatedProfile = {
          ...profile,
          portfolio: [...profile.portfolio, portfolioItem],
        };
        setProfile(updatedProfile);
      }

      setNewPortfolio({ title: '', description: '', images: [], category: 'Plumbing', cost: 0 });
      setShowPortfolioModal(false);
      Alert.alert('Success', 'Portfolio item added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add portfolio item');
    }
  };

  const addCertification = async () => {
    if (!newCertification.name?.trim() || !newCertification.issuer?.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const certification: Certification = {
        id: `cert_${Date.now()}`,
        name: newCertification.name!,
        issuer: newCertification.issuer!,
        issuedAt: new Date().toISOString(),
        credentialId: newCertification.credentialId,
        verified: false,
      };

      if (profile) {
        const updatedProfile = {
          ...profile,
          certifications: [...profile.certifications, certification],
        };
        setProfile(updatedProfile);
      }

      setNewCertification({ name: '', issuer: '', credentialId: '' });
      setShowCertificationModal(false);
      Alert.alert('Success', 'Certification added successfully. It will be verified within 24-48 hours.');
    } catch (error) {
      Alert.alert('Error', 'Failed to add certification');
    }
  };

  const renderInfoTab = () => {
    if (!profile) return null;

    return (
      <View style={styles.tabContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{profile.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.avatarEditButton}
              onPress={() => handleImagePick((uri) => updateProfile({ avatar: uri }))}
            >
              <Ionicons name="camera" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.totalJobs}</Text>
              <Text style={styles.statLabel}>Jobs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.experience}+</Text>
              <Text style={styles.statLabel}>Years</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <TouchableOpacity onPress={() => setEditingInfo(!editingInfo)}>
              <Ionicons name={editingInfo ? "checkmark" : "pencil"} size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Name</Text>
              {editingInfo ? (
                <TextInput
                  style={styles.infoInput}
                  value={profile.name}
                  onChangeText={(text) => setProfile({ ...profile, name: text })}
                />
              ) : (
                <Text style={styles.infoValue}>{profile.name}</Text>
              )}
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile.email}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Phone</Text>
              {editingInfo ? (
                <TextInput
                  style={styles.infoInput}
                  value={profile.phone}
                  onChangeText={(text) => setProfile({ ...profile, phone: text })}
                />
              ) : (
                <Text style={styles.infoValue}>{profile.phone}</Text>
              )}
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Bio</Text>
              {editingInfo ? (
                <TextInput
                  style={[styles.infoInput, styles.bioInput]}
                  value={profile.bio}
                  onChangeText={(text) => setProfile({ ...profile, bio: text })}
                  multiline
                  numberOfLines={3}
                />
              ) : (
                <Text style={styles.infoValue}>{profile.bio}</Text>
              )}
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Specializations</Text>
            <TouchableOpacity onPress={() => setShowSpecializationModal(true)}>
              <Ionicons name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.specializationsContainer}>
            {profile.specializations.map((spec, index) => (
              <View key={index} style={styles.specializationTag}>
                <Text style={styles.specializationText}>{spec}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderPortfolioTab = () => {
    if (!profile) return null;

    return (
      <View style={styles.tabContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Portfolio ({profile.portfolio.length})</Text>
          <TouchableOpacity onPress={() => setShowPortfolioModal(true)}>
            <Ionicons name="add" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {profile.portfolio.map((item) => (
          <View key={item.id} style={styles.portfolioCard}>
            <View style={styles.portfolioHeader}>
              <Text style={styles.portfolioTitle}>{item.title}</Text>
              <Text style={styles.portfolioCost}>₦{item.cost.toLocaleString()}</Text>
            </View>
            <Text style={styles.portfolioDescription}>{item.description}</Text>
            <View style={styles.portfolioMeta}>
              <Text style={styles.portfolioCategory}>{item.category}</Text>
              <Text style={styles.portfolioDate}>
                {new Date(item.completedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderCertificationsTab = () => {
    if (!profile) return null;

    return (
      <View style={styles.tabContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Certifications ({profile.certifications.length})</Text>
          <TouchableOpacity onPress={() => setShowCertificationModal(true)}>
            <Ionicons name="add" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {profile.certifications.map((cert) => (
          <View key={cert.id} style={styles.certificationCard}>
            <View style={styles.certificationHeader}>
              <Text style={styles.certificationName}>{cert.name}</Text>
              {cert.verified && (
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              )}
            </View>
            <Text style={styles.certificationIssuer}>{cert.issuer}</Text>
            <View style={styles.certificationMeta}>
              <Text style={styles.certificationDate}>
                Issued: {new Date(cert.issuedAt).toLocaleDateString()}
              </Text>
              {cert.expiresAt && (
                <Text style={styles.certificationDate}>
                  Expires: {new Date(cert.expiresAt).toLocaleDateString()}
                </Text>
              )}
            </View>
            {cert.credentialId && (
              <Text style={styles.credentialId}>ID: {cert.credentialId}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderAvailabilityTab = () => {
    if (!profile) return null;

    return (
      <View style={styles.tabContent}>
        <View style={styles.availabilityHeader}>
          <Text style={styles.sectionTitle}>Availability Settings</Text>
          <View style={styles.availabilityToggle}>
            <Text style={styles.availabilityLabel}>Available for work</Text>
            <Switch
              value={profile.availability.isAvailable}
              onValueChange={(value) => 
                updateProfile({
                  availability: {
                    ...profile.availability,
                    isAvailable: value,
                  }
                })
              }
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Working Hours</Text>
        {DAYS_OF_WEEK.map((day) => {
          const daySchedule = profile.availability.workingHours[day.key];
          
          return (
            <View key={day.key} style={styles.scheduleDay}>
              <View style={styles.scheduleDayHeader}>
                <Text style={styles.dayName}>{day.label}</Text>
                <Switch
                  value={daySchedule.enabled}
                  onValueChange={(enabled) => {
                    const updatedHours = {
                      ...profile.availability.workingHours,
                      [day.key]: { ...daySchedule, enabled },
                    };
                    updateProfile({
                      availability: {
                        ...profile.availability,
                        workingHours: updatedHours,
                      }
                    });
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
              
              {daySchedule.enabled && (
                <View style={styles.timeInputs}>
                  <View style={styles.timeInput}>
                    <Text style={styles.timeLabel}>Start</Text>
                    <TextInput
                      style={styles.timeValue}
                      value={daySchedule.startTime}
                      onChangeText={(time) => {
                        const updatedHours = {
                          ...profile.availability.workingHours,
                          [day.key]: { ...daySchedule, startTime: time },
                        };
                        updateProfile({
                          availability: {
                            ...profile.availability,
                            workingHours: updatedHours,
                          }
                        });
                      }}
                      placeholder="08:00"
                    />
                  </View>
                  
                  <View style={styles.timeInput}>
                    <Text style={styles.timeLabel}>End</Text>
                    <TextInput
                      style={styles.timeValue}
                      value={daySchedule.endTime}
                      onChangeText={(time) => {
                        const updatedHours = {
                          ...profile.availability.workingHours,
                          [day.key]: { ...daySchedule, endTime: time },
                        };
                        updateProfile({
                          availability: {
                            ...profile.availability,
                            workingHours: updatedHours,
                          }
                        });
                      }}
                      placeholder="18:00"
                    />
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>My Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.tabBar}>
        {[
          { key: 'info', label: 'Info', icon: 'person-outline' },
          { key: 'portfolio', label: 'Portfolio', icon: 'briefcase-outline' },
          { key: 'certifications', label: 'Certs', icon: 'ribbon-outline' },
          { key: 'availability', label: 'Schedule', icon: 'calendar-outline' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons
              name={tab.icon as keyof typeof Ionicons.glyphMap}
              size={20}
              color={activeTab === tab.key ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'portfolio' && renderPortfolioTab()}
        {activeTab === 'certifications' && renderCertificationsTab()}
        {activeTab === 'availability' && renderAvailabilityTab()}
      </ScrollView>

      {/* Portfolio Modal */}
      <Modal
        visible={showPortfolioModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPortfolioModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Portfolio Item</Text>
              <TouchableOpacity onPress={() => setShowPortfolioModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newPortfolio.title}
                  onChangeText={(text) => setNewPortfolio({ ...newPortfolio, title: text })}
                  placeholder="e.g., Kitchen Renovation Plumbing"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newPortfolio.description}
                  onChangeText={(text) => setNewPortfolio({ ...newPortfolio, description: text })}
                  placeholder="Describe the work you completed..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cost (₦)</Text>
                <TextInput
                  style={styles.textInput}
                  value={newPortfolio.cost?.toString()}
                  onChangeText={(text) => setNewPortfolio({ ...newPortfolio, cost: parseInt(text) || 0 })}
                  placeholder="35000"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Project Images</Text>
                <ImagePicker
                  multiple
                  maxImages={5}
                  placeholder="Add project photos"
                  options={{
                    aspect: [4, 3],
                    quality: 0.8,
                    maxWidth: 1200,
                    maxHeight: 900,
                  }}
                  onImagesSelected={(images: CameraImage[]) => {
                    const imageUris = images.map(img => img.uri);
                    setNewPortfolio({ ...newPortfolio, images: imageUris });
                  }}
                  uploadEndpoint="/api/portfolio/upload" // TODO: Replace with actual endpoint
                  onUploadComplete={(urls) => {
                    console.log('Portfolio images uploaded:', urls);
                    // Update portfolio with uploaded URLs
                    setNewPortfolio({ ...newPortfolio, images: urls });
                  }}
                  onUploadError={(error) => {
                    Alert.alert('Upload Error', error);
                  }}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={addPortfolioItem}>
                <Ionicons name="checkmark" size={20} color={colors.white} />
                <Text style={styles.submitButtonText}>Add Portfolio Item</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Certification Modal */}
      <Modal
        visible={showCertificationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCertificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Certification</Text>
              <TouchableOpacity onPress={() => setShowCertificationModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Certification Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newCertification.name}
                  onChangeText={(text) => setNewCertification({ ...newCertification, name: text })}
                  placeholder="e.g., Certified Plumbing Professional"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Issuing Organization *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newCertification.issuer}
                  onChangeText={(text) => setNewCertification({ ...newCertification, issuer: text })}
                  placeholder="e.g., National Plumbing Association"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Credential ID (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={newCertification.credentialId}
                  onChangeText={(text) => setNewCertification({ ...newCertification, credentialId: text })}
                  placeholder="e.g., NPA-2022-001234"
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={addCertification}>
                <Ionicons name="checkmark" size={20} color={colors.white} />
                <Text style={styles.submitButtonText}>Add Certification</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerRight: {
    width: 24,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 50,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Sections
  infoSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  infoGrid: {
    gap: 16,
    marginBottom: 24,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  infoInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },

  // Specializations
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specializationTag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specializationText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },

  // Portfolio
  portfolioCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  portfolioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  portfolioCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  portfolioDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  portfolioMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portfolioCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  portfolioDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Certifications
  certificationCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  certificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  certificationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  certificationIssuer: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  certificationMeta: {
    gap: 2,
    marginBottom: 4,
  },
  certificationDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  credentialId: {
    fontSize: 12,
    color: colors.primary,
    fontFamily: 'monospace',
  },

  // Availability
  availabilityHeader: {
    marginBottom: 24,
  },
  availabilityToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  availabilityLabel: {
    fontSize: 16,
    color: colors.text,
  },
  scheduleDay: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scheduleDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  timeInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  timeInput: {
    flex: 1,
    gap: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  timeValue: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default ArtisanProfileScreen;