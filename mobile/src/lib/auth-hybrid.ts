import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthClientService } from './auth-client';
import { AuthApiService } from './auth-api';
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

// Hybrid Authentication Service that switches between API and Mock for mobile
export class HybridAuthService {
  private static useBackend: boolean = false;
  private static initialized: boolean = false;

  // Initialize and determine which auth method to use
  static async initialize(): Promise<{ useBackend: boolean; user?: User }> {
    if (this.initialized) {
      return { useBackend: this.useBackend };
    }

    try {
      const result = await AuthApiService.initializeAuth();
      this.useBackend = result.useBackend;
      this.initialized = true;

      console.log(`🔐 Mobile Authentication mode: ${this.useBackend ? 'API Backend' : 'Mock Client'}`);

      return result;
    } catch (error) {
      console.error('Hybrid auth initialization error:', error);
      this.useBackend = false;
      this.initialized = true;
      return { useBackend: false };
    }
  }

  // Get current auth mode
  static getAuthMode(): 'api' | 'mock' {
    return this.useBackend ? 'api' : 'mock';
  }

  // Force switch to mock mode (for development/testing)
  static switchToMock(): void {
    this.useBackend = false;
    console.log('🔐 Mobile: Switched to mock authentication mode');
  }

  // Force switch to API mode (if backend becomes available)
  static switchToApi(): void {
    this.useBackend = true;
    console.log('🔐 Mobile: Switched to API authentication mode');
  }

  // Register new user
  static async register(data: RegisterData): Promise<AuthResponse> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.useBackend) {
      return await AuthApiService.register(data);
    } else {
      return await AuthClientService.register(data);
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<AuthResponse> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.useBackend) {
      return await AuthApiService.login(email, password);
    } else {
      return await AuthClientService.login(email, password);
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.useBackend) {
      // For API mode, we get the current user profile instead
      const result = await AuthApiService.getProfile();
      return result.user || null;
    } else {
      return await AuthClientService.getUserById(userId);
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: any): Promise<AuthResponse> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.useBackend) {
      return await AuthApiService.updateProfile(updates);
    } else {
      return await AuthClientService.updateProfile(userId, updates);
    }
  }

  // Request password reset
  static async requestPasswordReset(email: string): Promise<AuthResponse> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.useBackend) {
      return await AuthApiService.requestPasswordReset(email);
    } else {
      return await AuthClientService.requestPasswordReset(email);
    }
  }

  // Change password
  static async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.useBackend) {
      return await AuthApiService.changePassword({ currentPassword, newPassword });
    } else {
      // Mock service doesn't support change password, return success
      return { success: true };
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    if (this.useBackend) {
      await AuthApiService.logout();
    } else {
      await AuthClientService.clearAuth();
    }
  }

  // Verify token
  static verifyToken(token: string): { userId: string } | null {
    if (this.useBackend) {
      // For API mode, tokens are verified on the server
      // We'll just check if token exists locally
      return token ? { userId: 'api-user' } : null;
    } else {
      return AuthClientService.verifyToken(token);
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<{ isAuthenticated: boolean; user?: User }> {
    if (!this.initialized) {
      const result = await this.initialize();
      return {
        isAuthenticated: !!result.user,
        user: result.user
      };
    }

    if (this.useBackend) {
      return await AuthApiService.verifyAuth();
    } else {
      const storedAuth = await AuthClientService.getStoredAuth();
      return {
        isAuthenticated: !!storedAuth,
        user: storedAuth?.user
      };
    }
  }

  // Get stored authentication data
  static async getStoredAuth(): Promise<{ user: User; token: string } | null> {
    if (this.useBackend) {
      const result = await AuthApiService.verifyAuth();
      if (result.isAuthenticated && result.user) {
        const token = await AsyncStorage.getItem('auth_token');
        return token ? { user: result.user, token } : null;
      }
      return null;
    } else {
      return await AuthClientService.getStoredAuth();
    }
  }

  // Store authentication data
  static async storeAuth(user: User, token: string): Promise<void> {
    if (this.useBackend) {
      // For API mode, token is already stored by apiClient
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } else {
      await AuthClientService.storeAuth(user, token);
    }
  }

  // Clear authentication data
  static async clearAuth(): Promise<void> {
    if (this.useBackend) {
      await AuthApiService.logout();
      await AsyncStorage.removeItem('user');
    } else {
      await AuthClientService.clearAuth();
    }
  }

  // Get authentication status info
  static async getAuthInfo(): Promise<{
    mode: 'api' | 'mock';
    initialized: boolean;
    hasToken: boolean;
  }> {
    const token = await AsyncStorage.getItem('auth_token');
    
    return {
      mode: this.getAuthMode(),
      initialized: this.initialized,
      hasToken: !!token
    };
  }
}

export default HybridAuthService;
