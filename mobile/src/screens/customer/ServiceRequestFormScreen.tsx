import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors } from '../../theme/theme';
import { useLocation } from '../../hooks/useLocation';
import { ImagePicker } from '../../components/ImagePicker';

interface ServiceRequestFormScreenProps {
  navigation: any;
  route: any;
}

interface ServiceRequest {
  title: string;
  description: string;
  category: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  budgetMin: string;
  budgetMax: string;
  images: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  preferredDate: string;
  preferredTime: string;
}

export const ServiceRequestFormScreen: React.FC<ServiceRequestFormScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { category, categoryName } = route.params || {};
  const { getCurrentLocation, reverseGeocode } = useLocation();

  const [request, setRequest] = useState<ServiceRequest>({
    title: '',
    description: '',
    category: category || '',
    urgency: 'medium',
    budgetMin: '',
    budgetMax: '',
    images: [],
    location: null,
    preferredDate: '',
    preferredTime: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        const address = await reverseGeocode(location.latitude, location.longitude);
        setRequest(prev => ({
          ...prev,
          location: {
            ...location,
            address: address || `${location.latitude}, ${location.longitude}`,
          }
        }));
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };


  const handleSubmit = async () => {
    if (!request.title.trim()) {
      Alert.alert('Error', 'Please enter a service title');
      return;
    }
    
    if (!request.description.trim()) {
      Alert.alert('Error', 'Please enter a service description');
      return;
    }

    setLoading(true);
    try {
      // TODO: Submit to API
      Alert.alert(
        'Request Submitted!', 
        'Your service request has been posted. Artisans in your area will send you quotes soon.',
        [
          {
            text: 'View Requests',
            onPress: () => navigation.navigate('RequestDashboard'),
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const urgencyOptions = [
    { key: 'low', label: 'Low Priority', color: '#10B981' },
    { key: 'medium', label: 'Medium Priority', color: '#F59E0B' },
    { key: 'high', label: 'High Priority', color: '#EF4444' },
    { key: 'emergency', label: 'Emergency', color: '#DC2626' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Request Service</Text>
          {categoryName && (
            <Text style={styles.category}>Category: {categoryName}</Text>
          )}
        </View>

        <View style={styles.form}>
          {/* Service Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Title *</Text>
            <TextInput
              style={styles.textInput}
              value={request.title}
              onChangeText={(text) => setRequest(prev => ({ ...prev, title: text }))}
              placeholder="e.g., Fix leaking kitchen faucet"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={request.description}
              onChangeText={(text) => setRequest(prev => ({ ...prev, description: text }))}
              placeholder="Describe the service you need in detail..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Urgency */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority Level</Text>
            <View style={styles.urgencyContainer}>
              {urgencyOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.urgencyOption,
                    request.urgency === option.key && [
                      styles.urgencyOptionSelected,
                      { borderColor: option.color }
                    ]
                  ]}
                  onPress={() => setRequest(prev => ({ ...prev, urgency: option.key as any }))}
                >
                  <View 
                    style={[
                      styles.urgencyIndicator,
                      { backgroundColor: option.color }
                    ]} 
                  />
                  <Text style={[
                    styles.urgencyText,
                    request.urgency === option.key && { color: option.color }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Budget Range */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Budget Range (₦)</Text>
            <View style={styles.budgetContainer}>
              <TextInput
                style={[styles.textInput, styles.budgetInput]}
                value={request.budgetMin}
                onChangeText={(text) => setRequest(prev => ({ ...prev, budgetMin: text }))}
                placeholder="Min"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
              <Text style={styles.budgetSeparator}>to</Text>
              <TextInput
                style={[styles.textInput, styles.budgetInput]}
                value={request.budgetMax}
                onChangeText={(text) => setRequest(prev => ({ ...prev, budgetMax: text }))}
                placeholder="Max"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <Text style={styles.locationText}>
                {request.location?.address || 'Getting location...'}
              </Text>
              <TouchableOpacity onPress={getLocation}>
                <Ionicons name="refresh-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Images */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Images (Optional)</Text>
            <ImagePicker
              maxImages={5}
              onImagesSelected={(imageUris) => {
                setRequest(prev => ({ ...prev, images: imageUris }));
              }}
              onError={(error) => {
                Alert.alert('Error', error);
              }}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.submitButtonText}>Submitting...</Text>
          ) : (
            <>
              <Ionicons name="send-outline" size={20} color={colors.white} />
              <Text style={styles.submitButtonText}>Submit Request</Text>
            </>
          )}
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  textArea: {
    height: 100,
  },
  urgencyContainer: {
    gap: 12,
  },
  urgencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  urgencyOptionSelected: {
    borderWidth: 2,
    backgroundColor: colors.background,
  },
  urgencyIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  urgencyText: {
    fontSize: 16,
    color: colors.text,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  budgetInput: {
    flex: 1,
  },
  budgetSeparator: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    gap: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default ServiceRequestFormScreen;