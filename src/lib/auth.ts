import { User, UserRole } from '@/types';

// Simple JWT-like token implementation for development
const JWT_SECRET = 'development-secret-key';
const TOKEN_EXPIRY_HOURS = 24;

export interface LoginCredentials {
  email: string;
  password: string;
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

export class AuthService {
  // Hash password
  private static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare password
  private static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  private static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  // Verify JWT token
  public static verifyToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Register new user
  public static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(data.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          emailVerified: false,
        }
      });

      // Generate token
      const token = this.generateToken(user.id);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        user: {
          ...userWithoutPassword,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
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
  public static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Check password
      const isValidPassword = await this.comparePassword(password, user.password);

      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Generate token
      const token = this.generateToken(user.id);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        user: {
          ...userWithoutPassword,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
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
  public static async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) return null;

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Update user profile
  public static async updateProfile(userId: string, updates: Partial<{
    firstName: string;
    lastName: string;
    avatar: string;
  }>): Promise<AuthResponse> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updates
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        user: {
          ...userWithoutPassword,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        }
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: 'Failed to update profile'
      };
    }
  }

  // Change password
  public static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      // Get current user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Verify current password
      const isValidPassword = await this.comparePassword(currentPassword, user.password);

      if (!isValidPassword) {
        return {
          success: false,
          error: 'Current password is incorrect'
        };
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      return {
        success: true
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: 'Failed to change password'
      };
    }
  }

  // Request password reset
  public static async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Don't reveal if email exists for security
        return {
          success: true
        };
      }

      // Generate reset token
      const resetToken = jwt.sign({ userId: user.id, type: 'password-reset' }, JWT_SECRET, { expiresIn: '1h' });

      // Save reset token to database
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        }
      });

      // TODO: Send email with reset link
      console.log(`Password reset token for ${email}: ${resetToken}`);

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

  // Reset password with token
  public static async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };

      if (decoded.type !== 'password-reset') {
        return {
          success: false,
          error: 'Invalid reset token'
        };
      }

      // Check if token exists and is not expired
      const resetRecord = await prisma.passwordReset.findFirst({
        where: {
          token,
          expiresAt: { gt: new Date() },
          used: false
        }
      });

      if (!resetRecord) {
        return {
          success: false,
          error: 'Invalid or expired reset token'
        };
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password and mark token as used
      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetRecord.userId },
          data: { password: hashedPassword }
        }),
        prisma.passwordReset.update({
          where: { id: resetRecord.id },
          data: { used: true }
        })
      ]);

      return {
        success: true
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: 'Failed to reset password'
      };
    }
  }

  // Verify email
  public static async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };

      if (decoded.type !== 'email-verification') {
        return {
          success: false,
          error: 'Invalid verification token'
        };
      }

      // Update user as verified
      const user = await prisma.user.update({
        where: { id: decoded.userId },
        data: { emailVerified: true }
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        user: {
          ...userWithoutPassword,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        }
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: 'Failed to verify email'
      };
    }
  }

  // Logout (invalidate token on client side, optionally blacklist token)
  public static async logout(token: string): Promise<AuthResponse> {
    try {
      // For now, just return success (token invalidation happens on client)
      // In production, you might want to blacklist tokens
      return {
        success: true
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: 'Logout failed'
      };
    }
  }
}

export default AuthService;
