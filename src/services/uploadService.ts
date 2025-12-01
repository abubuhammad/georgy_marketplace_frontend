import { apiClient } from '@/lib/apiClient';

export interface UploadedImage {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface UploadResponse {
  success: boolean;
  data: UploadedImage | UploadedImage[];
  error?: string;
}

class UploadService {
  // Upload single image
  async uploadSingle(file: File, folder: string = 'products'): Promise<{ data: UploadedImage | null; error: string | null }> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('auth_token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 
                     import.meta.env.VITE_API_URL || 
                     'https://georgy-marketplace-backend.onrender.com/api';
      
      const response = await fetch(`${baseUrl}/upload/single?folder=${folder}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return { data: null, error: result.error || 'Upload failed' };
      }

      return { data: result.data, error: null };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Upload multiple images
  async uploadMultiple(files: File[], folder: string = 'products'): Promise<{ data: UploadedImage[] | null; error: string | null }> {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const token = localStorage.getItem('auth_token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 
                     import.meta.env.VITE_API_URL || 
                     'https://georgy-marketplace-backend.onrender.com/api';
      
      const response = await fetch(`${baseUrl}/upload/multiple?folder=${folder}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return { data: null, error: result.error || 'Upload failed' };
      }

      return { data: result.data, error: null };
    } catch (error) {
      console.error('Error uploading images:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Convert File to base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Upload images as base64 (alternative method)
  async uploadBase64(files: File[], folder: string = 'products'): Promise<{ data: UploadedImage[] | null; error: string | null }> {
    try {
      const base64Images = await Promise.all(files.map(file => this.fileToBase64(file)));

      const response = await apiClient.post<UploadResponse>('/upload/base64', {
        images: base64Images,
        folder
      });

      if (!response.success) {
        return { data: null, error: 'Upload failed' };
      }

      return { data: response.data as UploadedImage[], error: null };
    } catch (error) {
      console.error('Error uploading base64 images:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Delete image
  async deleteImage(publicId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/upload/image/${encodeURIComponent(publicId)}`);
      return { success: response.success, error: null };
    } catch (error) {
      console.error('Error deleting image:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}

export const uploadService = new UploadService();
export default uploadService;
