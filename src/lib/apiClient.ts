// API Client utility for connecting frontend to backend
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
    // Use proxy in development, full URL in production
    if (import.meta.env.DEV) {
      // In development, use relative URLs - they'll be proxied to backend
      this.baseURL = '/api';
    } else {
      // In production, use environment variable or fallback
      this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    }
    
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  // Set authentication token
  setAuthToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Get authentication token
  getAuthToken(): string | null {
    return this.token;
  }

  // Create request headers
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
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
    
    const config: RequestInit = {
      headers: this.getHeaders(includeAuth),
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

  // File upload method
  async uploadFile<T>(
    endpoint: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: Record<string, string>
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
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
    // Use appropriate URL based on environment
    const healthUrl = import.meta.env.DEV ? '/api/health' : `${this.baseURL}/health`;
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
