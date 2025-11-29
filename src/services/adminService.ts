import { apiClient, ApiResponse } from '@/lib/api-client';

// Environment setup - prefer backend API unless developer enables mocks
const isDevMode = (import.meta.env.VITE_USE_MOCKS === 'true');

export interface PlatformStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeListings: number;
  pendingVerifications: number;
  reportedIssues: number;
}

export interface ActivityItem {
  id: string;
  type: 'user_registration' | 'order_placed' | 'listing_created' | 'support_ticket' | 'payment_processed' | 'listing_flagged';
  description: string;
  timestamp: string;
  status: 'info' | 'success' | 'warning' | 'error';
  metadata?: Record<string, unknown>;
}

class AdminService {
  // Get platform statistics from backend API
  async getPlatformStats(): Promise<PlatformStats> {
    try {
      if (!isDevMode) {
        try {
          const resp = await apiClient.get<ApiResponse<PlatformStats>>('/admin/overview');
          if (resp && (resp as ApiResponse<PlatformStats>).success && (resp as ApiResponse<PlatformStats>).data) {
            console.log('📊 Fetched admin overview from backend API');
            return (resp as ApiResponse<PlatformStats>).data as PlatformStats;
          }
          console.warn('Admin overview API returned no data, falling back to mock');
        } catch (apiErr) {
          console.error('Admin overview API call failed, falling back to mock', apiErr);
        }
      }

      // Return mock stats for development/fallback
      return {
        totalUsers: 15234,
        totalOrders: 8956,
        totalRevenue: 2850000000,
        activeListings: 8956,
        pendingVerifications: 45,
        reportedIssues: 20
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      return {
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeListings: 0,
        pendingVerifications: 0,
        reportedIssues: 0
      };
    }
  }

  // Get recent platform activities
  async getRecentActivities(limit: number = 10): Promise<ActivityItem[]> {
    try {
      if (!isDevMode) {
        try {
          const resp = await apiClient.get<ApiResponse<ActivityItem[]>>(`/admin/activities?limit=${limit}`);
          if (resp && (resp as ApiResponse<ActivityItem[]>).success && (resp as ApiResponse<ActivityItem[]>).data) {
            console.log('📋 Fetched admin activities from backend API');
            return (resp as ApiResponse<ActivityItem[]>).data as ActivityItem[];
          }
          console.warn('Admin activities API returned no data, falling back to mock');
        } catch (apiErr) {
          console.error('Admin activities API call failed, falling back to mock', apiErr);
        }
      }

      // Return mock activities for development/fallback
      return [
        {
          id: 'activity-1',
          type: 'user_registration',
          description: 'New user registered: John Doe',
          timestamp: this.formatTimestamp(new Date().toISOString()),
          status: 'info',
          metadata: { userId: 'user-1' }
        },
        {
          id: 'activity-2',
          type: 'order_placed',
          description: 'Order #12345 placed for ₦5,000',
          timestamp: this.formatTimestamp(new Date(Date.now() - 3600000).toISOString()),
          status: 'success',
          metadata: { orderId: 'order-1', amount: 5000 }
        },
        {
          id: 'activity-3',
          type: 'listing_created',
          description: 'New listing: iPhone 14 Pro Max',
          timestamp: this.formatTimestamp(new Date(Date.now() - 7200000).toISOString()),
          status: 'info',
          metadata: { listingId: 'listing-1' }
        }
      ].slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  // Get pending actions that require admin attention
  async getPendingActions(): Promise<{ pendingVerifications: number; reportedIssues: number; paymentDisputes: number }> {
    try {
      if (!isDevMode) {
        try {
          const resp = await apiClient.get<ApiResponse<{ pendingVerifications: number; reportedIssues: number; paymentDisputes: number }>>('/admin/pending-actions');
          if (resp && (resp as ApiResponse<{ pendingVerifications: number; reportedIssues: number; paymentDisputes: number }>).success) {
            console.log('⚠️ Fetched pending actions from backend API');
            return (resp as ApiResponse<{ pendingVerifications: number; reportedIssues: number; paymentDisputes: number }>).data || {
              pendingVerifications: 0,
              reportedIssues: 0,
              paymentDisputes: 0
            };
          }
          console.warn('Pending actions API returned no data, falling back to mock');
        } catch (apiErr) {
          console.error('Pending actions API call failed, falling back to mock', apiErr);
        }
      }

      // Return mock pending actions for development/fallback
      return {
        pendingVerifications: 3,
        reportedIssues: 2,
        paymentDisputes: 1
      };
    } catch (error) {
      console.error('Error fetching pending actions:', error);
      return {
        pendingVerifications: 0,
        reportedIssues: 0,
        paymentDisputes: 0
      };
    }
  }

  // Helper method to format timestamp
  private formatTimestamp(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now.getTime() - time.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return time.toLocaleDateString();
  }
}

export const adminService = new AdminService();
