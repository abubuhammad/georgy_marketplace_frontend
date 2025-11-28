import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';
import CameraService, { CameraImage, ImageUploadOptions } from '../../services/CameraService';

export interface ImagePickerProps {
  onImageSelected?: (image: CameraImage) => void;
  onImagesSelected?: (images: CameraImage[]) => void;
  onUploadComplete?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  multiple?: boolean;
  maxImages?: number;
  showPreview?: boolean;
  uploadEndpoint?: string;
  uploadHeaders?: Record<string, string>;
  options?: ImageUploadOptions;
  style?: any;
  placeholder?: string;
  disabled?: boolean;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  onImageSelected,
  onImagesSelected,
  onUploadComplete,
  onUploadError,
  multiple = false,
  maxImages = 5,
  showPreview = true,
  uploadEndpoint,
  uploadHeaders,
  options = {},
  style,
  placeholder = "Add photos",
  disabled = false,
}) => {
  const [selectedImages, setSelectedImages] = useState<CameraImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageSelection = async (type: 'camera' | 'gallery') => {
    try {
      let images: CameraImage[] = [];

      if (multiple) {
        if (type === 'gallery') {
          const selectedImages = await CameraService.selectMultiplePhotos({
            ...options,
            selectionLimit: maxImages,
          });
          images = selectedImages;
        } else {
          const image = await CameraService.takePhoto(options);
          if (image) images = [image];
        }
      } else {
        const image = type === 'camera' 
          ? await CameraService.takePhoto(options)
          : await CameraService.selectPhoto(options);
        
        if (image) images = [image];
      }

      if (images.length > 0) {
        // Validate images
        const validImages: CameraImage[] = [];
        for (const image of images) {
          const validation = CameraService.validateImage(image, {
            maxFileSize: 5 * 1024 * 1024, // 5MB
            minWidth: 100,
            minHeight: 100,
          });

          if (validation.valid) {
            validImages.push(image);
          } else {
            Alert.alert('Invalid Image', validation.error);
          }
        }

        if (validImages.length > 0) {
          const newImages = multiple 
            ? [...selectedImages, ...validImages].slice(0, maxImages)
            : validImages;

          setSelectedImages(newImages);

          // Callback for single/multiple selection
          if (multiple && onImagesSelected) {
            onImagesSelected(newImages);
          } else if (!multiple && onImageSelected && newImages[0]) {
            onImageSelected(newImages[0]);
          }

          // Auto-upload if endpoint provided
          if (uploadEndpoint) {
            await handleUpload(validImages);
          }
        }
      }
    } catch (error) {
      console.error('Error selecting images:', error);
      Alert.alert('Error', 'Failed to select images. Please try again.');
    }
  };

  const handleUpload = async (images: CameraImage[]) => {
    if (!uploadEndpoint || uploading) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const uploadResults = await CameraService.uploadMultipleImages(images, {
        endpoint: uploadEndpoint,
        headers: uploadHeaders,
        onProgress: (completed, total) => {
          setUploadProgress((completed / total) * 100);
        },
      });

      const successfulUploads = uploadResults.filter(result => result.success);
      const failedUploads = uploadResults.filter(result => !result.success);

      if (failedUploads.length > 0) {
        const errorMessage = failedUploads[0].error || 'Upload failed';
        onUploadError?.(errorMessage);
        Alert.alert('Upload Error', errorMessage);
      }

      if (successfulUploads.length > 0) {
        const uploadedUrls = successfulUploads
          .map(result => result.imageUrl)
          .filter(Boolean) as string[];
        
        onUploadComplete?.(uploadedUrls);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.(errorMessage);
      Alert.alert('Upload Error', errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const showImagePicker = () => {
    if (disabled) return;

    const actions = [
      {
        text: 'Camera',
        onPress: () => handleImageSelection('camera'),
      },
      {
        text: 'Photo Library',
        onPress: () => handleImageSelection('gallery'),
      },
      {
        text: 'Cancel',
        style: 'cancel' as const,
      },
    ];

    Alert.alert('Select Image', 'Choose an option', actions);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);

    if (multiple && onImagesSelected) {
      onImagesSelected(newImages);
    } else if (!multiple && newImages.length > 0 && onImageSelected) {
      onImageSelected(newImages[0]);
    }
  };

  const renderImagePreview = (image: CameraImage, index: number) => (
    <View key={index} style={styles.imagePreview}>
      <Image source={{ uri: image.uri }} style={styles.previewImage} />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeImage(index)}
      >
        <Ionicons name="close-circle" size={20} color="#EF4444" />
      </TouchableOpacity>
      
      {image.fileSize && (
        <View style={styles.imageMeta}>
          <Text style={styles.imageMetaText}>
            {Math.round(image.fileSize / 1024)}KB
          </Text>
        </View>
      )}
    </View>
  );

  const renderAddButton = () => {
    const canAddMore = multiple ? selectedImages.length < maxImages : selectedImages.length === 0;
    
    if (!canAddMore) return null;

    return (
      <TouchableOpacity
        style={[styles.addButton, disabled && styles.addButtonDisabled]}
        onPress={showImagePicker}
        disabled={disabled || uploading}
      >
        {uploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.uploadingText}>
              Uploading {Math.round(uploadProgress)}%
            </Text>
          </View>
        ) : (
          <>
            <Ionicons 
              name="camera-outline" 
              size={32} 
              color={disabled ? colors.textSecondary : colors.primary} 
            />
            <Text style={[styles.addButtonText, disabled && styles.addButtonTextDisabled]}>
              {selectedImages.length > 0 ? 'Add More' : placeholder}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {showPreview && selectedImages.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.previewContainer}
          contentContainerStyle={styles.previewContent}
        >
          {selectedImages.map((image, index) => renderImagePreview(image, index))}
        </ScrollView>
      )}

      {renderAddButton()}

      {multiple && selectedImages.length > 0 && (
        <Text style={styles.imageCount}>
          {selectedImages.length} of {maxImages} images selected
        </Text>
      )}

      {uploading && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${uploadProgress}%` }]} 
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  
  // Preview
  previewContainer: {
    maxHeight: 120,
  },
  previewContent: {
    paddingRight: 16,
    gap: 12,
  },
  imagePreview: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
  },
  imageMeta: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  imageMetaText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '500',
  },

  // Add Button
  addButton: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.background,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  addButtonTextDisabled: {
    color: colors.textSecondary,
  },
  
  // Uploading State
  uploadingContainer: {
    alignItems: 'center',
    gap: 8,
  },
  uploadingText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },

  // Progress
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },

  // Image Count
  imageCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default ImagePicker;