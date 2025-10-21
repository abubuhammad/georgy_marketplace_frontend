import { useState } from 'react';
import { HybridAuthService } from '@/lib/auth-hybrid';
import { useAuthContext } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface RegisterData {
  firstName: string;
  lastName: string;
  role: UserRole;
}

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const { setUser, setLoading: setAuthLoading } = useAuthContext();

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await HybridAuthService.login(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        // Store authentication data
        if (result.token) {
          await HybridAuthService.storeAuth(result.user, result.token);
        }
        
        // Show auth mode info
        const authInfo = HybridAuthService.getAuthInfo();
        console.log(`🔐 Logged in using ${authInfo.mode} mode`);
        
        return true;
      } else {
        alert(result.error || 'Login failed. Please check your credentials.');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, userData: RegisterData) => {
    setLoading(true);
    try {
      const result = await HybridAuthService.register({ email, password, ...userData });
      
      if (result.success) {
        const authMode = HybridAuthService.getAuthMode();
        const message = authMode === 'api' 
          ? 'Registration successful! Please check your email to verify your account.'
          : 'Registration successful! You can now log in.';
        alert(message);
        return true;
      } else {
        alert(result.error || 'Registration failed. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const result = await HybridAuthService.requestPasswordReset(email);
      
      if (result.success) {
        const authMode = HybridAuthService.getAuthMode();
        const message = authMode === 'api'
          ? 'Password reset email sent! Please check your inbox.'
          : 'Password reset request processed (mock mode).';
        alert(message);
        return true;
      } else {
        alert(result.error || 'Failed to send reset email. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Reset password error:', error);
      alert('Failed to send reset email. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      await HybridAuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    login,
    register,
    resetPassword,
    logout,
    loading,
  };
};
