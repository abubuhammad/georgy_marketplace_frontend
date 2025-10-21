import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Chip, RadioButton, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';
import { useCamera } from '../../hooks/useCamera';
import { useLocation } from '../../hooks/useLocation';
import { artisanService, ServiceRequestData } from '../../services/artisanService';
import { ServiceCategory } from '../../types/Artisan';

const urgencyLevels = [
  { value: 'low', label: 'Low - Within a week' },
  { value: 'medium', label: 'Medium - Within 2-3 days' },
  { value: 'high', label: 'High - ASAP' },
];

export const ServiceRequestScreen = ({ navigation, route }: any) => {
  const { artisanId } = route.params || {};
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budgetMin: '',
    budgetMax: '',
    urgency: 'medium',
    preferredDate: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  
  const { takePhoto, pickImage } = useCamera();
  const { getCurrentLocation, userLocation } = useLocation();

  useEffect(() => {
    loadServiceCategories();
  }, []);

  const loadServiceCategories = async () => {
    try {
      setCategoriesLoading(true);
      const categories = await artisanService.getServiceCategories();
      setServiceCategories(categories);
    } catch (error) {
      console.error('Failed to load service categories:', error);
      Alert.alert('Error', 'Failed to load service categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPhoto = async () => {
    Alert.alert(
      'Add Photo',
      'Choose how to add a photo',
      [
        { text: 'Camera', onPress: handleTakePhoto },
        { text: 'Gallery', onPress: handlePickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleTakePhoto = async () => {
    try {
      const photoUri = await takePhoto();
      if (photoUri) {
        setImages(prev => [...prev, photoUri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handlePickImage = async () => {
    try {
      const imageUri = await pickImage();
      if (imageUri) {
        setImages(prev => [...prev, imageUri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Get current location
      await getCurrentLocation();
      
      const requestData: ServiceRequestData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: userLocation ? `${userLocation.latitude}, ${userLocation.longitude}` : 'Lagos, Nigeria',
        budget_min: formData.budgetMin ? parseInt(formData.budgetMin) : undefined,
        budget_max: formData.budgetMax ? parseInt(formData.budgetMax) : undefined,
        urgency: formData.urgency as 'low' | 'medium' | 'high',
        preferred_date: formData.preferredDate || undefined,
        images,
        artisan_id: artisanId,
      };

      // Submit service request via API
      const result = await artisanService.createServiceRequest(requestData);
      
      Alert.alert(
        'Success', 
        'Your service request has been submitted! Artisans will send you quotes soon.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Failed to submit service request:', error);
      Alert.alert('Error', error.message || 'Failed to submit service request');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Request a Service
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Describe what you need help with
          </Text>

          <TextInput
            label="Service Title *"
            value={formData.title}
            onChangeText={(text) => updateField('title', text)}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Fix leaking pipe in kitchen"
          />

          <TextInput
            label="Description *"
            value={formData.description}
            onChangeText={(text) => updateField('description', text)}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            placeholder="Provide detailed description of the issue..."
          />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Service Category *
          </Text>
          {categoriesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text variant="bodySmall" style={{ marginLeft: 8, color: colors.textSecondary }}>
                Loading categories...
              </Text>
            </View>
          ) : (
            <View style={styles.categoriesContainer}>
              {serviceCategories.map((category) => (
                <Chip
                  key={category.id}
                  selected={formData.category === category.name}
                  onPress={() => updateField('category', category.name)}
                  style={styles.categoryChip}
                >
                  {category.name}
                </Chip>
              ))}
            </View>
          )}

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Budget Range (Optional)
          </Text>
          <View style={styles.budgetContainer}>
            <TextInput
              label="Min (₦)"
              value={formData.budgetMin}
              onChangeText={(text) => updateField('budgetMin', text)}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.budgetInput]}
            />
            <TextInput
              label="Max (₦)"
              value={formData.budgetMax}
              onChangeText={(text) => updateField('budgetMax', text)}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.budgetInput]}
            />
          </View>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Urgency Level
          </Text>
          <RadioButton.Group
            onValueChange={(value) => updateField('urgency', value)}
            value={formData.urgency}
          >
            {urgencyLevels.map((level) => (
              <View key={level.value} style={styles.radioItem}>
                <RadioButton value={level.value} />
                <Text variant="bodyMedium" style={styles.radioLabel}>
                  {level.label}
                </Text>
              </View>
            ))}
          </RadioButton.Group>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Photos (Optional)
          </Text>
          <Button
            mode="outlined"
            icon="camera"
            onPress={handleAddPhoto}
            style={styles.photoButton}
          >
            Add Photos
          </Button>

          {images.length > 0 && (
            <View style={styles.imagesContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageItem}>
                  <Ionicons name="image" size={40} color={colors.primary} />
                  <Button
                    mode="text"
                    onPress={() => removeImage(index)}
                    compact
                  >
                    Remove
                  </Button>
                </View>
              ))}
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          >
            Submit Request
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
  card: {
    margin: 16,
    padding: 8,
  },
  title: {
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  categoryChip: {
    marginBottom: 8,
  },
  budgetContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  budgetInput: {
    flex: 1,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    marginLeft: 8,
    flex: 1,
    color: colors.text,
  },
  photoButton: {
    marginBottom: 16,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  imageItem: {
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
});
