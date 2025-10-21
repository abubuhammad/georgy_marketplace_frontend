import { UserRole } from '@/types';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
}

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
  role: UserRole;
}

// Mock users database (in production this would be API calls)
const mockUsers: Array<User & { password: string }> = [];

// Simple mock JWT token (in production this would be handled by backend)
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

// Simple password hashing simulation (in production would use bcrypt on backend)
const hashPassword = (password: string): string => {
  return btoa(password + 'salt'); // This is NOT secure, just for demo
};

const comparePassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

export class AuthClientService {
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
        role: data.role,
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

  // Store authentication data
  static async storeAuth(user: User, token: string): Promise<void> {
    try {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error storing auth:', error);
    }
  }

  // Get stored authentication data
  static async getStoredAuth(): Promise<{ user: User; token: string } | null> {
    try {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        return { user, token };
      }
      return null;
    } catch (error) {
      console.error('Error getting stored auth:', error);
      return null;
    }
  }

  // Clear authentication data
  static async clearAuth(): Promise<void> {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  }

  // Create admin user for testing
  static initializeAdminUser(): void {
    if (mockUsers.length === 0) {
      const adminUser: User & { password: string } = {
        id: 'admin_001',
        email: 'admin@georgy.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: true,
        password: hashPassword('admin123')
      };
      mockUsers.push(adminUser);

      // Also create a test customer
      const customerUser: User & { password: string } = {
        id: 'customer_001',
        email: 'customer@test.com',
        firstName: 'Test',
        lastName: 'Customer',
        role: 'customer',
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: true,
        password: hashPassword('customer123')
      };
      mockUsers.push(customerUser);

      // Create a test seller
      const sellerUser: User & { password: string } = {
        id: 'seller_001',
        email: 'seller@test.com',
        firstName: 'Test',
        lastName: 'Seller',
        role: 'seller',
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: true,
        password: hashPassword('seller123')
      };
      mockUsers.push(sellerUser);

      // Create a test artisan
      const artisanUser: User & { password: string } = {
        id: 'artisan_001',
        email: 'artisan@test.com',
        firstName: 'Test',
        lastName: 'Artisan',
        role: 'artisan',
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: true,
        password: hashPassword('artisan123')
      };
      mockUsers.push(artisanUser);

      console.log('Initialized test users:');
      console.log('Admin: admin@georgy.com / admin123');
      console.log('Customer: customer@test.com / customer123');
      console.log('Seller: seller@test.com / seller123');
      console.log('Artisan: artisan@test.com / artisan123');
    }
  }
}

// Initialize admin user on module load
AuthClientService.initializeAdminUser();

export default AuthClientService;
