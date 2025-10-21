import { isDevMode } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import {
  CustomerStats,
  CustomerActivity,
  CustomerOrder,
  CustomerPreferences,
  CustomerOnboarding,
  OnboardingStep,
  CustomerEngagement,
  CustomerBadge,
  CustomerMilestone,
  CustomerAddress,
  CustomerWishlist,
  WishlistItem,
  CustomerSupport,
  SupportMessage,
  CustomerNotification,
  CustomerRecommendation,
  CustomerInsights
} from '@/features/customer/types';

class CustomerService {
  // Customer Stats & Dashboard
  async getCustomerStats(customerId: string): Promise<CustomerStats> {
    if (isDevMode) {
      // Return mock data for development
      return {
        activeOrders: 2,
        savedItems: 5,
        totalSpent: 15000,
        reviewsGiven: 3,
        loyaltyPoints: 150,
        membershipLevel: 'Bronze',
        accountAge: 30,
        lastActivity: new Date().toISOString()
      };
    }

    try {
      // Get active orders count
      const orders = await prisma.order.findMany({
        where: { buyerId: customerId },
        select: { id: true, totalAmount: true, status: true }
      });

      const activeOrders = orders?.filter(o => 
        ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)
      ).length || 0;

      const totalSpent = orders?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0;

      // Get saved items count
      const favorites = await prisma.savedListing.findMany({
        where: { userId: customerId },
        select: { id: true }
      });

      const savedItems = favorites?.length || 0;

      // Get reviews count
      const reviews = await prisma.review.findMany({
        where: { userId: customerId },
        select: { id: true }
      });

      const reviewsGiven = reviews?.length || 0;

      // Get or calculate loyalty points and membership level
      const loyaltyPoints = Math.floor(totalSpent / 100); // 1 point per ₦100 spent
      const membershipLevel = loyaltyPoints > 2000 ? 'Gold' : loyaltyPoints > 1000 ? 'Silver' : 'Bronze';

      // Get account age
      const profile = await prisma.user.findUnique({
        where: { id: customerId },
        select: { createdAt: true }
      });

      const accountAge = profile?.createdAt ? 
        Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

      return {
        activeOrders,
        savedItems,
        totalSpent,
        reviewsGiven,
        loyaltyPoints,
        membershipLevel,
        accountAge,
        lastActivity: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw error;
    }
  }

  async getCustomerActivity(customerId: string, limit = 10): Promise<CustomerActivity[]> {
    if (isDevMode) {
      // Return mock activities for development
      return [
        {
          id: 'activity-1',
          type: 'order_placed',
          title: 'Order placed',
          description: 'Order ORD-12345 has been placed',
          timestamp: new Date().toISOString(),
          status: 'pending'
        }
      ];
    }

    try {
      const activities: CustomerActivity[] = [];

      // Get recent orders
      const recentOrders = await prisma.order.findMany({
        where: { buyerId: customerId },
        select: { id: true, orderNumber: true, status: true, createdAt: true, updatedAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      // Get recent reviews
      const recentReviews = await prisma.review.findMany({
        where: { userId: customerId },
        include: { listing: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 3
      });

      // Get recent favorites
      const recentFavorites = await prisma.savedListing.findMany({
        where: { userId: customerId },
        include: { listing: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 3
      });

      // Add order activities
      recentOrders?.forEach(order => {
        if (order.status === 'delivered') {
          activities.push({
            id: `order-delivered-${order.id}`,
            type: 'order_delivered',
            title: 'Order delivered',
            description: `Order ${order.orderNumber} has been delivered`,
            timestamp: order.updatedAt?.toISOString() || order.createdAt.toISOString(),
            status: 'completed'
          });
        } else if (order.status === 'shipped') {
          activities.push({
            id: `order-shipped-${order.id}`,
            type: 'order_placed',
            title: 'Order shipped',
            description: `Order ${order.orderNumber} is on the way`,
            timestamp: order.updatedAt?.toISOString() || order.createdAt.toISOString(),
            status: 'pending'
          });
        } else {
          activities.push({
            id: `order-placed-${order.id}`,
            type: 'order_placed',
            title: 'Order placed',
            description: `Order ${order.orderNumber} has been placed`,
            timestamp: order.createdAt.toISOString(),
            status: 'pending'
          });
        }
      });

      // Add review activities
      recentReviews?.forEach(review => {
        activities.push({
          id: `review-${review.id}`,
          type: 'review_submitted',
          title: 'Product review submitted',
          description: `You reviewed "${review.listing?.title || 'a product'}"`,
          timestamp: review.createdAt.toISOString(),
          status: 'completed'
        });
      });

      // Add favorite activities
      recentFavorites?.forEach(favorite => {
        activities.push({
          id: `favorite-${favorite.id}`,
          type: 'item_saved',
          title: 'Added item to wishlist',
          description: `Saved "${favorite.listing?.title || 'an item'}" to wishlist`,
          timestamp: favorite.createdAt.toISOString(),
          status: 'action'
        });
      });

      // Sort by timestamp and limit
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching customer activity:', error);
      return [];
    }
  }

  async logActivity(customerId: string, activity: Omit<CustomerActivity, 'id'>): Promise<void> {
    try {
      await prisma.customerActivity.create({
        data: {
          customerId,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          timestamp: activity.timestamp,
          status: activity.status
        }
      });
    } catch (error) {
      console.error('Error logging customer activity:', error);
      throw error;
    }
  }

  // Customer Orders
  async getCustomerOrders(customerId: string): Promise<CustomerOrder[]> {
    try {
      const orders = await prisma.order.findMany({
        where: { buyerId: customerId },
        include: {
          items: true,
          // Note: Address relations would need to be properly set up in schema
        },
        orderBy: { createdAt: 'desc' }
      });

      return orders || [];
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return [];
    }
  }

  async getOrderDetails(orderId: string): Promise<CustomerOrder | null> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          // Note: Address relations would need to be properly set up in schema
        }
      });

      return order;
    } catch (error) {
      console.error('Error fetching order details:', error);
      return null;
    }
  }

  // Customer Preferences
  async getCustomerPreferences(customerId: string): Promise<CustomerPreferences> {
    try {
      const preferences = await prisma.customerPreferences.findUnique({
        where: { customerId }
      });

      return preferences?.preferences || {
        notifications: {
          email: true,
          sms: false,
          push: true,
          orderUpdates: true,
          promotions: true,
          newsletter: false,
          securityAlerts: true,
          priceDrops: false,
          backInStock: false
        },
        privacy: {
          profileVisible: true,
          showOnlineStatus: false,
          allowMessages: true,
          shareActivity: false,
          allowDataAnalytics: true
        },
        display: {
          currency: 'NGN',
          language: 'en',
          timeZone: 'WAT',
          theme: 'light',
          listingView: 'grid',
          itemsPerPage: 20
        },
        shopping: {
          autoSaveCart: true,
          quickBuy: false,
          priceAlerts: false,
          recommendationsEnabled: true
        }
      };
    } catch (error) {
      console.error('Error fetching customer preferences:', error);
      // Return default preferences
      return {
        notifications: {
          email: true,
          sms: false,
          push: true,
          orderUpdates: true,
          promotions: true,
          newsletter: false,
          securityAlerts: true,
          priceDrops: false,
          backInStock: false
        },
        privacy: {
          profileVisible: true,
          showOnlineStatus: false,
          allowMessages: true,
          shareActivity: false,
          allowDataAnalytics: true
        },
        display: {
          currency: 'NGN',
          language: 'en',
          timeZone: 'WAT',
          theme: 'light',
          listingView: 'grid',
          itemsPerPage: 20
        },
        shopping: {
          autoSaveCart: true,
          quickBuy: false,
          priceAlerts: false,
          recommendationsEnabled: true
        }
      };
    }
  }

  async updateCustomerPreferences(customerId: string, preferences: CustomerPreferences): Promise<void> {
    try {
      await prisma.customerPreferences.upsert({
        where: { customerId },
        update: { preferences },
        create: { customerId, preferences }
      });
    } catch (error) {
      console.error('Error updating customer preferences:', error);
      throw error;
    }
  }

  // Profile Management
  async updateCustomerProfile(customerId: string, updates: Record<string, any>): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: customerId },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });

      // Log activity
      await this.logActivity(customerId, {
        type: 'profile_updated',
        title: 'Profile Updated',
        description: 'Customer updated their profile information',
        timestamp: new Date().toISOString(),
        status: 'completed'
      });
    } catch (error) {
      console.error('Error updating customer profile:', error);
      throw error;
    }
  }

  // Get recent orders for dashboard
  async getRecentOrders(customerId: string, limit = 5): Promise<any[]> {
    try {
      const orders = await prisma.order.findMany({
        where: { buyerId: customerId },
        include: {
          items: {
            include: {
              listing: {
                include: {
                  images: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return orders || [];
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }
  }

  // Customer Recommendations
  async getCustomerRecommendations(customerId: string, limit = 6): Promise<any[]> {
    if (isDevMode) {
      return []; // Return empty for development
    }

    try {
      // Get user's favorite categories and recent purchases
      const userFavorites = await prisma.savedListing.findMany({
        where: { userId: customerId },
        include: { listing: { select: { categoryId: true, price: true } } },
        take: 10
      });

      const userOrders = await prisma.orderItem.findMany({
        where: {
          order: { buyerId: customerId }
        },
        include: {
          listing: { select: { categoryId: true, price: true } }
        },
        take: 10
      });

      // Extract preferred categories and price ranges
      const allItems = [
        ...userFavorites.map(f => f.listing),
        ...userOrders.map(o => o.listing)
      ].filter(Boolean);

      const categories = [...new Set(allItems.map(item => item?.categoryId).filter(Boolean))];
      const avgPrice = allItems.length > 0 ? 
        allItems.reduce((sum, item) => sum + (item?.price || 0), 0) / allItems.length : 50000;

      // Get recommendations based on user preferences
      const whereClause: any = {
        status: 'active',
        NOT: { userId: customerId } // Don't recommend user's own items
      };

      if (categories.length > 0) {
        whereClause.categoryId = { in: categories };
      }

      whereClause.price = {
        gte: Math.max(0, avgPrice * 0.5),
        lte: avgPrice * 2
      };

      const recommendations = await prisma.listing.findMany({
        where: whereClause,
        include: {
          category: true,
          images: true,
          user: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return recommendations || [];
    } catch (error) {
      console.error('Error fetching customer recommendations:', error);
      // Fallback to popular products
      try {
        const fallback = await prisma.listing.findMany({
          where: {
            status: 'active',
            NOT: { userId: customerId }
          },
          include: {
            category: true,
            images: true,
            user: true
          },
          orderBy: { createdAt: 'desc' },
          take: limit
        });

        return fallback || [];
      } catch {
        return [];
      }
    }
  }
}

export default new CustomerService();
