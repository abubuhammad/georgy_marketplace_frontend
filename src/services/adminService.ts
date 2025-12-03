import { apiClient, ApiResponse } from '@/lib/api-client';

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
      const resp = await apiClient.get<any>('/admin/overview');
      
      // Handle different response formats
      if (resp?.success && resp?.data) {
        console.log('📊 Fetched admin overview from backend API');
        return {
          totalUsers: resp.data.totalUsers || 0,
          totalOrders: resp.data.totalOrders || 0,
          totalRevenue: resp.data.totalRevenue || 0,
          activeListings: resp.data.activeListings || 0,
          pendingVerifications: resp.data.pendingVerifications || 0,
          reportedIssues: resp.data.reportedIssues || 0
        };
      }
      
      // Direct response format
      if (resp?.totalUsers !== undefined) {
        console.log('📊 Fetched admin overview (direct format)');
        return {
          totalUsers: resp.totalUsers || 0,
          totalOrders: resp.totalOrders || 0,
          totalRevenue: resp.totalRevenue || 0,
          activeListings: resp.activeListings || 0,
          pendingVerifications: resp.pendingVerifications || 0,
          reportedIssues: resp.reportedIssues || 0
        };
      }

      console.warn('Admin overview API returned unexpected format');
      return this.getEmptyStats();
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      return this.getEmptyStats();
    }
  }
  
  private getEmptyStats(): PlatformStats {
    return {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      activeListings: 0,
      pendingVerifications: 0,
      reportedIssues: 0
    };
  }

  // Get recent platform activities from activity log
  async getRecentActivities(limit: number = 10): Promise<ActivityItem[]> {
    try {
      // Try to get recent orders as activity
      const ordersResp = await apiClient.get<any>('/admin/dashboard/stats');
      
      if (ordersResp?.recentOrders && Array.isArray(ordersResp.recentOrders)) {
        return ordersResp.recentOrders.slice(0, limit).map((order: any, index: number) => ({
          id: order.id || `activity-${index}`,
          type: 'order_placed' as const,
          description: `Order placed${order.buyer ? ` by ${order.buyer.firstName} ${order.buyer.lastName}` : ''}${order.product ? ` for ${order.product.title}` : ''}`,
          timestamp: this.formatTimestamp(order.createdAt || new Date().toISOString()),
          status: 'success' as const,
          metadata: { orderId: order.id }
        }));
      }
      
      // Return empty array if no data
      return [];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  // Get pending actions that require admin attention
  async getPendingActions(): Promise<{ pendingVerifications: number; reportedIssues: number; paymentDisputes: number }> {
    try {
      // Get pending counts from moderation stats
      const resp = await apiClient.get<any>('/admin/moderation/stats');
      
      if (resp?.success && resp?.data?.pending) {
        return {
          pendingVerifications: resp.data.pending.accounts || 0,
          reportedIssues: resp.data.pending.total || 0,
          paymentDisputes: 0
        };
      }
      
      if (resp?.pending) {
        return {
          pendingVerifications: resp.pending.accounts || 0,
          reportedIssues: resp.pending.total || 0,
          paymentDisputes: 0
        };
      }
      
      return {
        pendingVerifications: 0,
        reportedIssues: 0,
        paymentDisputes: 0
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
