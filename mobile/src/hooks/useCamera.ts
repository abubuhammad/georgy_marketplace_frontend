import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const useCamera = () => {
  const [loading, setLoading] = useState(false);

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Media library permission is required to select photos');
      return false;
    }
    return true;
  };

  const takePhoto = async (): Promise<string | null> => {
    try {
      setLoading(true);
      
      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (): Promise<string | null> => {
    try {
      setLoading(true);
      
      const hasPermission = await requestMediaLibraryPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const pickMultipleImages = async (): Promise<string[]> => {
    try {
      setLoading(true);
      
      const hasPermission = await requestMediaLibraryPermissions();
      if (!hasPermission) return [];

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        return result.assets.map(asset => asset.uri);
      }
      return [];
    } catch (error) {
      console.error('Multiple image picker error:', error);
      Alert.alert('Error', 'Failed to pick images');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    takePhoto,
    pickImage,
    pickMultipleImages,
    requestCameraPermissions,
    requestMediaLibraryPermissions,
  };
};
