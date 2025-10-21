import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from '@types/index';

interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
}

class ApiServiceClass {
  private readonly baseURL = __DEV__ 
    ? 'http://localhost:5000/api' // Development (Backend runs on port 5000)
    : 'https://api.georgymarketplace.com/api'; // Production
  
  private readonly timeout = 30000; // 30 seconds

  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      // Get auth token
      const token = await AsyncStorage.getItem('auth_token');
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config?.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Create request options
      const requestOptions: RequestInit = {
        method,
        headers,
        signal: AbortSignal.timeout(config?.timeout || this.timeout),
      };

      // Add body for non-GET requests
      if (data && method !== 'GET') {
        requestOptions.body = JSON.stringify(data);
      }

      // Make request
      const response = await fetch(url, requestOptions);
      
      // Parse response
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data: responseData.data || responseData,
        message: responseData.message,
      };

    } catch (error: any) {
      console.error(`API ${method} ${endpoint} error:`, error);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      if (error.message.includes('Network request failed')) {
        throw new Error('No internet connection');
      }

      throw new Error(error.message || 'Something went wrong');
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, config);
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, config);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }

  // File upload method
  async uploadFile(endpoint: string, file: any, additionalData?: any): Promise<ApiResponse<any>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      // Get auth token
      const token = await AsyncStorage.getItem('auth_token');
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // Add additional data if provided
      if (additionalData) {
        Object.keys(additionalData).forEach(key => {
          formData.append(key, additionalData[key]);
        });
      }

      // Prepare headers (don't set Content-Type for FormData)
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: AbortSignal.timeout(this.timeout),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data: responseData.data || responseData,
        message: responseData.message,
      };

    } catch (error: any) {
      console.error(`File upload ${endpoint} error:`, error);
      throw new Error(error.message || 'File upload failed');
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const ApiService = new ApiServiceClass();
