import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, LoginCredentials, RegisterData } from '@/lib/api-client';
import { User, UserRole } from '@/types';

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Authentication methods
  login: (credentials: LoginForm) => Promise<{ user: User | null; error: string | null }>;
  register: (data: RegisterForm) => Promise<{ user: User | null; error: string | null }>;
  logout: () => Promise<void>;
  
  // User management
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error: string | null }>;
  
  // Role-based access
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  
  // Permission checks
  canAccessAdmin: boolean;
  canSell: boolean;
  canManageOrders: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Authentication methods
  const login = async (credentials: LoginForm) => {
    try {
      setLoading(true);
      console.log('🔐 Attempting login for:', credentials.email);
      
      const result = await apiClient.login(credentials);
      
      if (result.success && result.data?.user) {
        setUser(result.data.user);
        console.log('✅ Login successful:', result.data.user.email, 'Role:', result.data.user.role);
        return { user: result.data.user, error: null };
      } else {
        console.error('❌ Login failed:', result.error);
        return { user: null, error: result.error || 'Login failed' };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return { user: null, error: error instanceof Error ? error.message : 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterForm) => {
    try {
      setLoading(true);
      console.log('🔐 Attempting registration for:', data.email);
      
      // Map RegisterForm to RegisterData (exclude confirmPassword)
      const registerData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role
      };
      
      const result = await apiClient.register(registerData);
      
      if (result.success && result.data?.user) {
        setUser(result.data.user);
        console.log('✅ Registration successful:', result.data.user.email, 'Role:', result.data.user.role);
        return { user: result.data.user, error: null };
      } else {
        console.error('❌ Registration failed:', result.error);
        return { user: null, error: result.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      return { user: null, error: error instanceof Error ? error.message : 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🔐 Logging out user');
      await apiClient.logout();
      setUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear user on logout error
      setUser(null);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };
      
      console.log('🔐 Updating profile for user:', user.id);
      
      const result = await apiClient.updateProfile(updates);
      
      if (result.success && result.data?.user) {
        setUser(result.data.user);
        console.log('✅ Profile updated successfully');
        return { success: true, error: null };
      } else {
        console.error('❌ Profile update failed:', result.error);
        return { success: false, error: result.error || 'Failed to update profile' };
      }
    } catch (error) {
      console.error('❌ Update profile error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update profile' };
    }
  };

  // Role-based access helpers
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  // Permission checks
  const canAccessAdmin = hasRole('admin');
  const canSell = hasAnyRole(['seller', 'admin']);
  const canManageOrders = hasAnyRole(['seller', 'admin', 'delivery']);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing authentication...');
        
        // Check if user is already authenticated
        if (apiClient.isAuthenticated()) {
          const storedUser = apiClient.getStoredUser();
          if (storedUser) {
            console.log('✅ Found stored user:', storedUser.email, 'Role:', storedUser.role);
            setUser(storedUser);
            
            // Verify with server and refresh user data
            try {
              const currentUser = await apiClient.getCurrentUser();
              if (currentUser) {
                setUser(currentUser);
                console.log('✅ User data refreshed from server');
              }
            } catch (error) {
              console.error('❌ Failed to refresh user data:', error);
              // Keep the stored user if server request fails
            }
          }
        } else {
          console.log('🔐 No authentication found');
        }
        
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    setUser,
    setLoading,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    hasAnyRole,
    canAccessAdmin,
    canSell,
    canManageOrders,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};