import { isDevMode } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { User, UserRole } from '@/types';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

class AuthService {
  // Sign up new user
  async signUp(userData: SignUpData) {
    if (isDevMode) {
      // Mock signup for development
      const mockUser = {
        id: `user-${Date.now()}`,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return { user: mockUser, error: null };
    }

    try {
      // Note: In a real implementation, password hashing should be done on the server
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          // passwordHash: await hashPassword(userData.password), // Server-side hashing
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: userData.role,
          isActive: true
        }
      });

      return { user, error: null };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  }

  // Sign in user
  async signIn(credentials: SignInData) {
    if (isDevMode) {
      // Mock signin for development
      const mockUser = {
        id: `user-${Date.now()}`,
        email: credentials.email,
        firstName: 'Test',
        lastName: 'User',
        role: 'customer' as UserRole,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return { user: mockUser, error: null };
    }

    try {
      // Note: In a real implementation, this would verify against hashed password
      const user = await prisma.user.findUnique({
        where: { email: credentials.email }
      });

      if (!user) {
        return { user: null, error: 'Invalid credentials' };
      }

      // Here you would verify the password hash
      // const isValidPassword = await verifyPassword(credentials.password, user.passwordHash);
      // if (!isValidPassword) {
      //   return { user: null, error: 'Invalid credentials' };
      // }

      return { user, error: null };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  }

  // Sign out user
  async signOut() {
    try {
      // In a client-side app, this would clear local storage/session
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User | null> {
    if (isDevMode) {
      // Check local storage for mock user
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      return null;
    }

    try {
      // In a real implementation, you'd verify the JWT token and get user from database
      const token = localStorage.getItem('token');
      if (!token) return null;

      // Mock user for now - in real app, decode JWT and get user from database
      const userId = localStorage.getItem('userId');
      if (!userId) return null;

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatarUrl,
        role: user.role as UserRole,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: ProfileUpdateData) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: updates.firstName,
          lastName: updates.lastName,
          phone: updates.phone,
          bio: updates.bio,
          addressLine1: updates.addressLine1,
          addressLine2: updates.addressLine2,
          city: updates.city,
          state: updates.state,
          country: updates.country,
          postalCode: updates.postalCode,
          updatedAt: new Date(),
        }
      });

      return { data: user, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      // In a real implementation, this would send a reset email
      console.log(`Password reset requested for: ${email}`);
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  // Update password
  async updatePassword(newPassword: string) {
    try {
      // In a real implementation, this would hash the password and update in database
      console.log('Password updated');
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  // Upload avatar
  async uploadAvatar(userId: string, file: File) {
    try {
      // Mock avatar upload - in real implementation, upload to storage service
      const avatarUrl = 'https://via.placeholder.com/150x150?text=Avatar';

      // Update user with avatar URL
      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl }
      });

      return { url: avatarUrl, error: null };
    } catch (error) {
      return { url: null, error: (error as Error).message };
    }
  }

  // Check if user has specific role
  hasRole(user: User | null, role: UserRole): boolean {
    return user?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(user: User | null, roles: UserRole[]): boolean {
    return user ? roles.includes(user.role) : false;
  }

  // Get user permissions
  getUserPermissions(user: User | null) {
    if (!user) return { canSell: false, canManageOrders: false, canAccessAdmin: false };

    return {
      canSell: this.hasAnyRole(user, ['seller', 'admin']),
      canManageOrders: this.hasAnyRole(user, ['seller', 'admin', 'delivery']),
      canAccessAdmin: this.hasRole(user, 'admin'),
      canManageProperties: this.hasAnyRole(user, ['realtor', 'house_agent', 'house_owner', 'admin']),
      canPostJobs: this.hasAnyRole(user, ['employer', 'admin']),
      canApplyJobs: this.hasAnyRole(user, ['job_seeker', 'customer']),
    };
  }
}

export default new AuthService();
