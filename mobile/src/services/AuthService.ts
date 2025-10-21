import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/User';

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

// Mock users database for mobile (in production this would be API calls)
const mockUsers: Array<User & { password: string }> = [
  {
    id: 'admin_001',
    email: 'admin@georgy.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emailVerified: true,
    password: 'YWRtaW4xMjNzYWx0' // admin123 hashed
  },
  {
    id: 'customer_001',
    email: 'customer@test.com',
    firstName: 'Test',
    lastName: 'Customer',
    role: 'customer',
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emailVerified: true,
    password: 'Y3VzdG9tZXIxMjNzYWx0' // customer123 hashed
  }
];

// Simple mock JWT token generation
const generateMockToken = (userId: string): string => {
  return btoa(JSON.stringify({ userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
};

const verifyMockToken = (token: string): { userId: string } | null => {
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.exp > Date.now()) {
      return { userId: decoded.userId };
    }
    return null;
  } catch {
    return null;
  }
};

// Simple password hashing simulation
const hashPassword = (password: string): string => {
  return btoa(password + 'salt');
};

const comparePassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

export class MobileAuthService {
  // Register new user
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === data.email);
      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      // Create new user
      const newUser: User & { password: string } = {
        id: 'user_' + Date.now(),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as any,
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        password: hashPassword(data.password)
      };

      mockUsers.push(newUser);

      // Generate token
      const token = generateMockToken(newUser.id);

      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;

      return {
        success: true,
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed. Please try again.'
      };
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Check password
      const isValidPassword = comparePassword(password, user.password);
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Generate token
      const token = generateMockToken(user.id);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const user = mockUsers.find(u => u.id === userId);
      if (!user) return null;

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<{
    firstName: string;
    lastName: string;
    avatar: string;
  }>): Promise<AuthResponse> {
    try {
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Update user
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Return user without password
      const { password: _, ...userWithoutPassword } = mockUsers[userIndex];

      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: 'Failed to update profile'
      };
    }
  }

  // Request password reset
  static async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      // In a real app, this would send an email
      console.log(`Password reset requested for: ${email}`);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        error: 'Failed to request password reset'
      };
    }
  }

  // Verify token
  static verifyToken(token: string): { userId: string } | null {
    return verifyMockToken(token);
  }

  // Check stored authentication
  static async getStoredAuth(): Promise<{ user: User; token: string } | null> {
    try {
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('auth_token')
      ]);

      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser);
        const tokenValid = this.verifyToken(storedToken);
        
        if (tokenValid) {
          return { user, token: storedToken };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Get stored auth error:', error);
      return null;
    }
  }

  // Store authentication
  static async storeAuth(user: User, token: string): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem('user', JSON.stringify(user)),
        AsyncStorage.setItem('auth_token', token)
      ]);
    } catch (error) {
      console.error('Store auth error:', error);
    }
  }

  // Clear stored authentication
  static async clearAuth(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem('user'),
        AsyncStorage.removeItem('auth_token')
      ]);
    } catch (error) {
      console.error('Clear auth error:', error);
    }
  }
}

export default MobileAuthService;
