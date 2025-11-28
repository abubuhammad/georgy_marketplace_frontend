import { User, UserRole } from '@/types';
import { JobPostingData, Job, JobApplication, JobSearchFilters } from '@/features/job/types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    token: string;
    refreshToken?: string;
  };
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'auth_user';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem(TOKEN_KEY);
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem(TOKEN_KEY, token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Get stored token
  getToken(): string | null {
    return this.token || localStorage.getItem(TOKEN_KEY);
  }

  // Make HTTP request with authentication
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authentication header if token exists
    const token = this.getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      console.log(`🔗 API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      if (!response.headers.get('content-type')?.includes('application/json')) {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response as unknown as T;
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && token) {
          console.log('🔐 Token expired, attempting refresh...');
          const refreshed = await this.refreshAuthToken();
          if (refreshed) {
            // Retry the original request with new token
            return this.request(endpoint, options);
          } else {
            // Refresh failed, clear auth and redirect to login
            this.clearToken();
            window.location.href = '/login';
            throw new Error('Authentication expired. Please login again.');
          }
        }

        console.error('❌ API Error:', data);
        const errorMessage = data.error || data.message || `HTTP error! status: ${response.status}`;
        console.error('❌ Error details:', {
          url,
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(errorMessage);
      }

      console.log('✅ API Success:', data);
      return data;
      
    } catch (error) {
      console.error('❌ API Request failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  }

  // Refresh authentication token
  private async refreshAuthToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.success && data.data?.token) {
        this.setToken(data.data.token);
        if (data.data.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, data.data.refreshToken);
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success && response.data?.token) {
        this.setToken(response.data.token);
        
        if (response.data.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
        }
        
        // Store user data
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.success && response.data?.token) {
        this.setToken(response.data.token);
        
        if (response.data.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
        }
        
        // Store user data
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.request<ApiResponse<{ user: User }>>('/auth/profile');
      
      if (response.success && response.data?.user) {
        // Update stored user data
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        return response.data.user;
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async updateProfile(updates: Partial<User>): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response.success && response.data?.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Profile update failed'
      };
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password change failed'
      };
    }
  }

  async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/auth/request-password-reset', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password reset request failed'
      };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password reset failed'
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = localStorage.getItem(USER_KEY);
    return !!(token && user);
  }

  // Get stored user
  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }

  // Public HTTP methods
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Two-Factor Authentication (2FA)
  async startTwoFactorSetup(): Promise<ApiResponse<{ qrCodeDataUrl: string; secret: string; otpauthUrl: string }>> {
    try {
      const response = await this.request<ApiResponse<{ qrCodeDataUrl: string; secret: string; otpauthUrl: string }>>(
        '/safety/two-factor/setup',
        { method: 'POST' }
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start two-factor setup',
      };
    }
  }

  async verifyTwoFactor(code: string): Promise<ApiResponse<{ twoFactorAuth: boolean }>> {
    try {
      const response = await this.request<ApiResponse<{ twoFactorAuth: boolean }>>(
        '/safety/two-factor/verify',
        {
          method: 'POST',
          body: JSON.stringify({ code }),
        }
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify two-factor code',
      };
    }
  }

  async disableTwoFactor(clearSecret: boolean = false): Promise<ApiResponse<{ twoFactorAuth: boolean }>> {
    try {
      const response = await this.request<ApiResponse<{ twoFactorAuth: boolean }>>(
        '/safety/two-factor/disable',
        {
          method: 'POST',
          body: JSON.stringify({ clearSecret }),
        }
      );
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to disable two-factor authentication',
      };
    }
  }

  // Job-related methods
  async getJobs(filters?: JobSearchFilters): Promise<ApiResponse<Job[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              queryParams.append(key, value.join(','));
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }
      
      const endpoint = `/jobs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.request<ApiResponse<Job[]>>(endpoint);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch jobs'
      };
    }
  }

  async getJobById(id: string): Promise<ApiResponse<Job>> {
    try {
      const response = await this.request<ApiResponse<Job>>(`/jobs/${id}`);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch job'
      };
    }
  }

  async postJob(jobData: JobPostingData): Promise<ApiResponse<Job>> {
    try {
      const response = await this.request<ApiResponse<Job>>('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to post job'
      };
    }
  }

  async updateJob(id: string, jobData: Partial<JobPostingData>): Promise<ApiResponse<Job>> {
    try {
      const response = await this.request<ApiResponse<Job>>(`/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(jobData),
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update job'
      };
    }
  }

  async deleteJob(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.request<ApiResponse<void>>(`/jobs/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete job'
      };
    }
  }

  async getMyJobs(): Promise<ApiResponse<Job[]>> {
    try {
      const response = await this.request<ApiResponse<Job[]>>('/jobs/my-jobs');
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch my jobs'
      };
    }
  }

  // Job Application methods
  async applyForJob(jobId: string, applicationData: {
    coverLetter?: string;
    expectedSalary?: { min: number; max: number; currency: string; period: string };
    availableFrom?: string;
  }): Promise<ApiResponse<JobApplication>> {
    try {
      const response = await this.request<ApiResponse<JobApplication>>(`/jobs/${jobId}/apply`, {
        method: 'POST',
        body: JSON.stringify(applicationData),
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to apply for job'
      };
    }
  }

  async getMyApplications(): Promise<ApiResponse<JobApplication[]>> {
    try {
      const response = await this.request<ApiResponse<JobApplication[]>>('/jobs/applications/my-applications');
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch applications'
      };
    }
  }

  async getJobApplications(jobId: string): Promise<ApiResponse<JobApplication[]>> {
    try {
      const response = await this.request<ApiResponse<JobApplication[]>>(`/jobs/${jobId}/applications`);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch job applications'
      };
    }
  }

  async updateApplicationStatus(applicationId: string, status: string, notes?: string): Promise<ApiResponse<JobApplication>> {
    try {
      const response = await this.request<ApiResponse<JobApplication>>(`/jobs/applications/${applicationId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes }),
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update application status'
      };
    }
  }

  // Resume and Document methods
  async uploadResume(file: File): Promise<ApiResponse<{ url: string; fileName: string }>> {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await this.request<ApiResponse<{ url: string; fileName: string }>>('/users/resume/upload', {
        method: 'POST',
        body: formData,
        headers: {}, // Don't set Content-Type, let browser set it for FormData
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload resume'
      };
    }
  }

  async updateResumeText(resumeText: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.request<ApiResponse<void>>('/users/resume/text', {
        method: 'PUT',
        body: JSON.stringify({ resumeText }),
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update resume text'
      };
    }
  }

  async deleteResume(): Promise<ApiResponse<void>> {
    try {
      const response = await this.request<ApiResponse<void>>('/users/resume', {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete resume'
      };
    }
  }

  // Employer Analytics
  async getEmployerAnalytics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.request<ApiResponse<any>>('/employer/analytics');
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch employer analytics'
      };
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;