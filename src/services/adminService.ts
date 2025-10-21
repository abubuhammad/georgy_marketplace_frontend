import { isDevMode } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

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
  metadata?: Record<string, any>;
}

class AdminService {
  // Get platform statistics from real database
  async getPlatformStats(): Promise<PlatformStats> {
    if (isDevMode) {
      // Return mock stats for development
      return {
        totalUsers: 150,
        totalOrders: 75,
        totalRevenue: 125000,
        activeListings: 200,
        pendingVerifications: 5,
        reportedIssues: 2
      };
    }

    try {
      // Get total users count
      const totalUsers = await prisma.user.count();

      // Get total orders count and revenue
      const orders = await prisma.order.findMany({
        select: { totalAmount: true }
      });

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0;

      // Get active listings count
      const activeListings = await prisma.listing.count({
        where: { status: 'active' }
      });

      // Get pending verifications count (users with seller role who aren't verified)
      const pendingVerifications = await prisma.user.count({
        where: {
          role: 'seller',
          isVerified: false
        }
      });

      // Get reported issues count
      const reportedIssues = await prisma.notification.count({
        where: {
          type: 'report',
          isRead: false
        }
      });

      return {
        totalUsers: totalUsers || 0,
        totalOrders,
        totalRevenue,
        activeListings: activeListings || 0,
        pendingVerifications: pendingVerifications || 0,
        reportedIssues: reportedIssues || 0
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
    if (isDevMode) {
      // Return mock activities for development
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
        }
      ];
    }

    try {
      const activities: ActivityItem[] = [];

      // Get recent user registrations
      const recentUsers = await prisma.user.findMany({
        select: { id: true, firstName: true, lastName: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 3
      });

      recentUsers?.forEach(user => {
        activities.push({
          id: `user_${user.id}`,
          type: 'user_registration',
          description: `New user registered: ${user.firstName} ${user.lastName}`.trim() || 'Unknown User',
          timestamp: this.formatTimestamp(user.createdAt.toISOString()),
          status: 'info',
          metadata: { userId: user.id }
        });
      });

      // Get recent orders
      const recentOrders = await prisma.order.findMany({
        select: { id: true, totalAmount: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 3
      });

      recentOrders?.forEach(order => {
        activities.push({
          id: `order_${order.id}`,
          type: 'order_placed',
          description: `Order #${order.id.slice(-6)} placed for ₦${order.totalAmount.toLocaleString()}`,
          timestamp: this.formatTimestamp(order.createdAt.toISOString()),
          status: 'success',
          metadata: { orderId: order.id, amount: order.totalAmount }
        });
      });

      // Get recent listings
      const recentListings = await prisma.listing.findMany({
        select: { id: true, title: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 2
      });

      recentListings?.forEach(listing => {
        activities.push({
          id: `listing_${listing.id}`,
          type: 'listing_created',
          description: `New listing created: ${listing.title}`,
          timestamp: this.formatTimestamp(listing.createdAt.toISOString()),
          status: 'info',
          metadata: { listingId: listing.id }
        });
      });

      // Get recent notifications as proxy for support activities
      const recentNotifications = await prisma.notification.findMany({
        where: {
          type: { in: ['report', 'support', 'complaint'] }
        },
        select: { id: true, title: true, type: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 2
      });

      recentNotifications?.forEach(notification => {
        activities.push({
          id: `notification_${notification.id}`,
          type: 'support_ticket',
          description: `Support issue: ${notification.title}`,
          timestamp: this.formatTimestamp(notification.createdAt.toISOString()),
          status: 'warning',
          metadata: { notificationId: notification.id }
        });
      });

      // Sort by creation time and limit
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);

    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  // Get pending actions that require admin attention
  async getPendingActions() {
    if (isDevMode) {
      // Return mock pending actions for development
      return {
        pendingVerifications: 3,
        reportedIssues: 2,
        paymentDisputes: 1
      };
    }

    try {
      const [
        pendingVerifications,
        reportedIssues,
        paymentDisputes
      ] = await Promise.all([
        // Users with seller role who aren't verified
        prisma.user.count({
          where: {
            role: 'seller',
            isVerified: false
          }
        }),
        // Notifications for reported issues
        prisma.notification.count({
          where: {
            type: 'report',
            isRead: false
          }
        }),
        // Messages for payment disputes (as proxy)
        prisma.message.count({
          where: {
            subject: { contains: 'dispute', mode: 'insensitive' },
            isRead: false
          }
        })
      ]);

      return {
        pendingVerifications: pendingVerifications || 0,
        reportedIssues: reportedIssues || 0,
        paymentDisputes: paymentDisputes || 0
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
