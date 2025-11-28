import { apiClient, ApiResponse, ApiError } from './apiClient';
import { User } from '../types/User';

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Backend API response types
interface BackendAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken?: string;
  };
}

interface BackendUserResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export class AuthApiService {
  // Register new user
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<BackendAuthResponse>('/auth/register', data, false);
      
      if (response.success && response.data) {
        // Set the auth token in the API client
        await apiClient.setAuthToken(response.data.token);
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken
        };
      }
      
      return {
        success: false,
        error: 'Registration failed'
      };
    } catch (error) {
      console.error('Registration error:', error);
      const apiError = error as ApiError;
      return {
        success: false,
        error: apiError.message || 'Registration failed. Please try again.'
      };
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<BackendAuthResponse>('/auth/login', { email, password }, false);
      
      if (response.success && response.data) {
        // Set the auth token in the API client
        await apiClient.setAuthToken(response.data.token);
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken
        };
      }
      
      return {
        success: false,
        error: 'Login failed'
      };
    } catch (error) {
      console.error('Login error:', error);
      const apiError = error as ApiError;
      return {
        success: false,
        error: apiError.message || 'Login failed. Please check your credentials.'
      };
    }
  }

  // Get current user profile
  static async getProfile(): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<BackendUserResponse>('/auth/profile');
      
      if (response.success && response.data) {
        return {
          success: true,
          user: response.data.user
        };
      }
      
      return {
        success: false,
        error: 'Failed to get profile'
      };
    } catch (error) {
      console.error('Get profile error:', error);
      const apiError = error as ApiError;
      
      // If unauthorized, clear the token
      if (apiError.status === 401) {
        await apiClient.setAuthToken(null);
      }
      
      return {
        success: false,
        error: apiError.message || 'Failed to get profile'
      };
    }
  }

  // Update user profile
  static async updateProfile(updates: UpdateProfileData): Promise<AuthResponse> {
    try {
      const response = await apiClient.put<BackendUserResponse>('/auth/profile', updates);
      
      if (response.success && response.data) {
        return {
          success: true,
          user: response.data.user
        };
      }
      
      return {
        success: false,
        error: 'Failed to update profile'
      };
    } catch (error) {
      console.error('Update profile error:', error);
      const apiError = error as ApiError;
      return {
        success: false,
        error: apiError.message || 'Failed to update profile'
      };
    }
  }

  // Change password
  static async changePassword(data: ChangePasswordData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/auth/change-password', data);
      
      if (response.success) {
        return {
          success: true
        };
      }
      
      return {
        success: false,
        error: 'Failed to change password'
      };
    } catch (error) {
      console.error('Change password error:', error);
      const apiError = error as ApiError;
      return {
        success: false,
        error: apiError.message || 'Failed to change password'
      };
    }
  }

  // Request password reset
  static async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/auth/request-password-reset', { email }, false);
      
      if (response.success) {
        return {
          success: true
        };
      }
      
      return {
        success: false,
        error: 'Failed to request password reset'
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      const apiError = error as ApiError;
      return {
        success: false,
        error: apiError.message || 'Failed to request password reset'
      };
    }
  }

  // Reset password with token
  static async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/auth/reset-password', { token, newPassword }, false);
      
      if (response.success) {
        return {
          success: true
        };
      }
      
      return {
        success: false,
        error: 'Failed to reset password'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      const apiError = error as ApiError;
      return {
        success: false,
        error: apiError.message || 'Failed to reset password'
      };
    }
  }

  // Refresh authentication token
  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: {
          token: string;
          refreshToken: string;
        };
      }>('/auth/refresh-token', { refreshToken }, false);
      
      if (response.success && response.data) {
        // Update the auth token in the API client
        await apiClient.setAuthToken(response.data.token);
        
        return {
          success: true,
          token: response.data.token,
          refreshToken: response.data.refreshToken
        };
      }
      
      return {
        success: false,
        error: 'Failed to refresh token'
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      const apiError = error as ApiError;
      return {
        success: false,
        error: apiError.message || 'Failed to refresh token'
      };
    }
  }

  // Logout user
  static async logout(): Promise<AuthResponse> {
    try {
      // Call logout endpoint (this may invalidate refresh tokens in the future)
      await apiClient.post<ApiResponse<any>>('/auth/logout');
      
      // Clear local token regardless of API response
      await apiClient.setAuthToken(null);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Clear local token even if API call fails
      await apiClient.setAuthToken(null);
      
      return {
        success: true
      };
    }
  }

  // Verify if user is authenticated
  static async verifyAuth(): Promise<{ isAuthenticated: boolean; user?: User }> {
    const token = apiClient.getAuthToken();
    
    if (!token) {
      return { isAuthenticated: false };
    }

    try {
      const result = await this.getProfile();
      
      if (result.success && result.user) {
        return {
          isAuthenticated: true,
          user: result.user
        };
      }
      
      return { isAuthenticated: false };
    } catch (error) {
      return { isAuthenticated: false };
    }
  }

  // Check if backend is available and fallback to mock if needed
  static async initializeAuth(): Promise<{ useBackend: boolean; user?: User }> {
    try {
      const isBackendReachable = await apiClient.isBackendReachable();
      
      if (isBackendReachable) {
        console.log('✅ Backend API is reachable - using real authentication');
        
        // Try to verify existing auth
        const authStatus = await this.verifyAuth();
        
        return {
          useBackend: true,
          user: authStatus.user
        };
      } else {
        console.log('⚠️ Backend API not reachable - falling back to mock authentication');
        
        return {
          useBackend: false
        };
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      
      return {
        useBackend: false
      };
    }
  }
}

export default AuthApiService;
