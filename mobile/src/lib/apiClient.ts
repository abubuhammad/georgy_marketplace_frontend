import AsyncStorage from '@react-native-async-storage/async-storage';

// API Client utility for connecting mobile app to backend
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    details?: any;
  };
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    // Use environment variable or fallback to development URL
    this.baseURL = __DEV__ 
      ? 'http://localhost:5000/api' // Development
      : 'https://api.georgymarketplace.com/api'; // Production
    
    // Load token from AsyncStorage on initialization
    this.loadToken();
  }

  // Load token from AsyncStorage
  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  // Set authentication token
  async setAuthToken(token: string | null) {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem('auth_token', token);
    } else {
      await AsyncStorage.removeItem('auth_token');
    }
  }

  // Get authentication token
  getAuthToken(): string | null {
    return this.token;
  }

  // Create request headers
  private async getHeaders(includeAuth: boolean = true): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    } else if (includeAuth) {
      // Try to load token if not in memory
      const storedToken = await AsyncStorage.getItem('auth_token');
      if (storedToken) {
        this.token = storedToken;
        headers['Authorization'] = `Bearer ${storedToken}`;
      }
    }

    return headers;
  }

  // Handle API response
  private async handleResponse<T>(response: Response): Promise<T> {
    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw {
        message: 'Invalid response format',
        status: response.status
      } as ApiError;
    }

    if (!response.ok) {
      throw {
        message: data.error?.message || data.message || 'Request failed',
        status: response.status,
        details: data.error?.details
      } as ApiError;
    }

    return data;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = await this.getHeaders(includeAuth);
    
    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse<T>(response);
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError) {
        throw {
          message: 'Network error - please check your connection',
          status: 0
        } as ApiError;
      }
      throw error;
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, includeAuth);
  }

  async post<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async put<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async patch<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, includeAuth);
  }

  // File upload method for React Native
  async uploadFile<T>(
    endpoint: string,
    fileUri: string,
    fieldName: string = 'file',
    mimeType: string = 'image/jpeg',
    fileName: string = 'image.jpg',
    additionalData?: Record<string, string>
  ): Promise<T> {
    const formData = new FormData();
    
    // Add file to form data (React Native specific)
    formData.append(fieldName, {
      uri: fileUri,
      type: mimeType,
      name: fileName,
    } as any);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    } else {
      // Try to load token if not in memory
      const storedToken = await AsyncStorage.getItem('auth_token');
      if (storedToken) {
        this.token = storedToken;
        headers['Authorization'] = `Bearer ${storedToken}`;
      }
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return await this.handleResponse<T>(response);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const healthUrl = this.baseURL.replace('/api', '') + '/health';
    const response = await fetch(healthUrl);
    return await this.handleResponse(response);
  }

  // Check if backend is reachable
  async isBackendReachable(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.warn('Backend not reachable:', error);
      return false;
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types and client
export { ApiClient };
export default apiClient;
