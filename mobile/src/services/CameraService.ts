import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';

export interface ImageUploadOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  compressQuality?: number;
  uploadEndpoint?: string;
}

export interface CameraImage {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
  mimeType?: string;
  fileName?: string;
  base64?: string;
}

export interface ImageUploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  uploadId?: string;
}

class CameraService {
  private static instance: CameraService;

  constructor() {
    if (CameraService.instance) {
      return CameraService.instance;
    }
    CameraService.instance = this;
  }

  static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  /**
   * Request camera permissions
   */
  async requestCameraPermissions(): Promise<boolean> {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (cameraPermission.status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Camera access is required to take photos. Please enable camera permissions in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  /**
   * Request media library permissions  
   */
  async requestMediaLibraryPermissions(): Promise<boolean> {
    try {
      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (mediaPermission.status !== 'granted') {
        Alert.alert(
          'Media Library Permission Required',
          'Photo access is required to select images. Please enable photo permissions in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting media library permissions:', error);
      return false;
    }
  }

  /**
   * Take a photo using device camera
   */
  async takePhoto(options: ImageUploadOptions = {}): Promise<CameraImage | null> {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) return null;

      const {
        allowsEditing = true,
        aspect = [1, 1],
        quality = 0.8,
      } = options;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        aspect,
        quality,
        base64: false,
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      let processedImage = await this.processImage(asset.uri, options);
      
      return processedImage;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Camera Error', 'Failed to take photo. Please try again.');
      return null;
    }
  }

  /**
   * Select photo from device gallery
   */
  async selectPhoto(options: ImageUploadOptions = {}): Promise<CameraImage | null> {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) return null;

      const {
        allowsEditing = true,
        aspect = [1, 1],
        quality = 0.8,
      } = options;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        aspect,
        quality,
        base64: false,
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      let processedImage = await this.processImage(asset.uri, options);
      
      return processedImage;
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Gallery Error', 'Failed to select photo. Please try again.');
      return null;
    }
  }

  /**
   * Select multiple photos from gallery
   */
  async selectMultiplePhotos(options: ImageUploadOptions & { selectionLimit?: number } = {}): Promise<CameraImage[]> {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) return [];

      const {
        allowsEditing = false, // Usually disabled for multiple selection
        quality = 0.8,
        selectionLimit = 5,
      } = options;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        quality,
        allowsMultipleSelection: true,
        selectionLimit,
        base64: false,
        exif: false,
      });

      if (result.canceled || !result.assets) {
        return [];
      }

      const processedImages: CameraImage[] = [];
      for (const asset of result.assets) {
        const processedImage = await this.processImage(asset.uri, options);
        if (processedImage) {
          processedImages.push(processedImage);
        }
      }

      return processedImages;
    } catch (error) {
      console.error('Error selecting multiple photos:', error);
      Alert.alert('Gallery Error', 'Failed to select photos. Please try again.');
      return [];
    }
  }

  /**
   * Show image picker options (Camera or Gallery)
   */
  async showImagePicker(options: ImageUploadOptions = {}): Promise<CameraImage | null> {
    return new Promise((resolve) => {
      const actions = [
        {
          text: 'Camera',
          onPress: async () => {
            const image = await this.takePhoto(options);
            resolve(image);
          }
        },
        {
          text: 'Photo Library',
          onPress: async () => {
            const image = await this.selectPhoto(options);
            resolve(image);
          }
        },
        {
          text: 'Cancel',
          style: 'cancel' as const,
          onPress: () => resolve(null),
        }
      ];

      Alert.alert('Select Image', 'Choose an option', actions);
    });
  }

  /**
   * Process and compress image
   */
  private async processImage(uri: string, options: ImageUploadOptions = {}): Promise<CameraImage | null> {
    try {
      const {
        maxWidth = 1200,
        maxHeight = 1200,
        compressQuality = 0.8,
      } = options;

      // Get original image info
      const originalInfo = await FileSystem.getInfoAsync(uri);

      // Resize and compress image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: maxWidth,
              height: maxHeight,
            }
          }
        ],
        {
          compress: compressQuality,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false,
        }
      );

      // Get processed image info
      const processedInfo = await FileSystem.getInfoAsync(manipulatedImage.uri);
      
      // Create filename if not provided
      const timestamp = Date.now();
      const fileName = `image_${timestamp}.jpg`;

      const result: CameraImage = {
        uri: manipulatedImage.uri,
        width: manipulatedImage.width,
        height: manipulatedImage.height,
        fileSize: processedInfo.exists ? processedInfo.size : undefined,
        mimeType: 'image/jpeg',
        fileName,
      };

      return result;
    } catch (error) {
      console.error('Error processing image:', error);
      return null;
    }
  }

  /**
   * Upload image to server
   */
  async uploadImage(image: CameraImage, options: { 
    endpoint: string; 
    fieldName?: string;
    additionalFields?: Record<string, string>;
    headers?: Record<string, string>;
  }): Promise<ImageUploadResult> {
    try {
      const { 
        endpoint, 
        fieldName = 'image',
        additionalFields = {},
        headers = {}
      } = options;

      const formData = new FormData();
      
      // Add image file
      formData.append(fieldName, {
        uri: image.uri,
        type: image.mimeType || 'image/jpeg',
        name: image.fileName || 'image.jpg',
      } as any);

      // Add additional fields
      Object.keys(additionalFields).forEach(key => {
        formData.append(key, additionalFields[key]);
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...headers,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const responseData = await response.json();

      return {
        success: true,
        imageUrl: responseData.imageUrl || responseData.url,
        uploadId: responseData.id || responseData.uploadId,
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    images: CameraImage[],
    options: { 
      endpoint: string; 
      fieldName?: string;
      additionalFields?: Record<string, string>;
      headers?: Record<string, string>;
      onProgress?: (completed: number, total: number) => void;
    }
  ): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const result = await this.uploadImage(images[i], options);
      results.push(result);
      
      if (options.onProgress) {
        options.onProgress(i + 1, images.length);
      }
    }

    return results;
  }

  /**
   * Create image thumbnail
   */
  async createThumbnail(image: CameraImage, size: number = 150): Promise<CameraImage | null> {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        image.uri,
        [
          {
            resize: {
              width: size,
              height: size,
            }
          }
        ],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false,
        }
      );

      const processedInfo = await FileSystem.getInfoAsync(manipulatedImage.uri);
      const fileName = `thumb_${image.fileName || 'image.jpg'}`;

      return {
        uri: manipulatedImage.uri,
        width: manipulatedImage.width,
        height: manipulatedImage.height,
        fileSize: processedInfo.exists ? processedInfo.size : undefined,
        mimeType: 'image/jpeg',
        fileName,
      };
    } catch (error) {
      console.error('Error creating thumbnail:', error);
      return null;
    }
  }

  /**
   * Validate image file
   */
  validateImage(image: CameraImage, options: {
    maxFileSize?: number; // in bytes
    minWidth?: number;
    minHeight?: number;
    allowedTypes?: string[];
  } = {}): { valid: boolean; error?: string } {
    const {
      maxFileSize = 5 * 1024 * 1024, // 5MB default
      minWidth = 100,
      minHeight = 100,
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    } = options;

    if (image.fileSize && image.fileSize > maxFileSize) {
      return {
        valid: false,
        error: `Image file size (${Math.round(image.fileSize / 1024)}KB) exceeds maximum allowed size (${Math.round(maxFileSize / 1024)}KB)`
      };
    }

    if (image.width < minWidth || image.height < minHeight) {
      return {
        valid: false,
        error: `Image dimensions (${image.width}x${image.height}) are smaller than minimum required (${minWidth}x${minHeight})`
      };
    }

    if (image.mimeType && !allowedTypes.includes(image.mimeType)) {
      return {
        valid: false,
        error: `Image type (${image.mimeType}) is not supported. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Delete image file from cache
   */
  async deleteImageCache(uri: string): Promise<boolean> {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) {
        await FileSystem.deleteAsync(uri);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting image cache:', error);
      return false;
    }
  }

  /**
   * Get image file info
   */
  async getImageInfo(uri: string): Promise<{ width: number; height: number; fileSize?: number } | null> {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists) return null;

      // Get image dimensions
      const result = await ImageManipulator.manipulateAsync(uri, [], {
        format: ImageManipulator.SaveFormat.JPEG,
        compress: 1,
      });

      return {
        width: result.width,
        height: result.height,
        fileSize: info.size,
      };
    } catch (error) {
      console.error('Error getting image info:', error);
      return null;
    }
  }
}

export default CameraService.getInstance();