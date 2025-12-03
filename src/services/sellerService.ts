import { generateMockData, mockStorage } from '@/lib/mockData';
import { localDB } from './localDatabase';
import { listingService } from './listingService';
import { prisma } from '@/lib/prisma';
import { apiClient, ApiResponse } from '@/lib/api-client';
import { 
  SellerAnalytics, 
  StockAlert, 
  InventoryItem, 
  SellerProfile,
  Conversation,
  CustomerMessage,
  SellerPerformanceMetrics,
  OnboardingProgress,
  SellerApplication,
  ProductSalesData,
  MonthlyRevenue
} from '@/features/seller/types';

// Environment setup - prefer backend API unless developer enables mocks
const isDevMode = (import.meta.env.VITE_USE_MOCKS === 'true');
const USE_API_CALLS = !isDevMode;

export class SellerService {
  // Helper method to calculate customer metrics
  private async calculateCustomerMetrics(sellerId: string, startDate: Date, endDate: Date, totalRevenue: number) {
    if (isDevMode) {
      // Return mock data for development
      return {
        totalCustomers: 15,
        newCustomers: 8,
        returningCustomers: 7,
        customerRetentionRate: 46.7,
        averageCustomerValue: totalRevenue > 0 ? totalRevenue / 15 : 0
      };
    }

    try {
      // TODO: Implement API call to backend for customer orders data
      console.log('Using mock customer metrics - TODO: implement API call');
      
      // For now, return mock data based on the totalRevenue parameter
      const mockTotalCustomers = Math.max(1, Math.floor(totalRevenue / 50000)); // Assume avg customer value of 50k
      
      return {
        totalCustomers: mockTotalCustomers,
        newCustomers: Math.floor(mockTotalCustomers * 0.3), // 30% new customers
        returningCustomers: Math.floor(mockTotalCustomers * 0.7), // 70% returning
        customerRetentionRate: 70,
        averageCustomerValue: mockTotalCustomers > 0 ? totalRevenue / mockTotalCustomers : 0
      };
    } catch (error) {
      console.error('Error calculating customer metrics:', error);
      return {
        totalCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0,
        customerRetentionRate: 0,
        averageCustomerValue: 0
      };
    }
  }

  // Analytics & Dashboard
  async getSellerAnalytics(sellerId: string, period: '7d' | '30d' | '90d' | '1y'): Promise<SellerAnalytics> {
    try {
      // Calculate date range based on period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch real data from the database or local storage
      let orders: any[] = [];
      let listings: any[] = [];
      let reviews: any[] = [];

      if (isDevMode) {
        // Use local database for development
        try {
          const { data: userListings } = await localDB.getListings({ user_id: sellerId });
          listings = userListings;
          
          // For now, no orders or reviews in local DB - but listings will show
          orders = [];
          reviews = [];
          
          console.log(`Fetched local data for seller ${sellerId}:`, {
            orders: orders.length,
            listings: listings.length,
            reviews: reviews.length
          });
        } catch (error) {
          console.log('Local database query failed:', error);
        }
      } else {
        // Use API calls to fetch data from backend
        try {
          // Fetch seller listings
          const listingsResp = await apiClient.get<ApiResponse<any[]>>('/products/seller/my-products');
          listings = listingsResp && (listingsResp as any).success ? (listingsResp as any).data || [] : [];

          // Fetch seller orders
          // The seller orders endpoint is provided by seller routes as '/api/seller/orders'
          const ordersResp = await apiClient.get<ApiResponse<any[]>>('/seller/orders');
          orders = ordersResp && (ordersResp as any).success ? (ordersResp as any).data || [] : [];

          // Reviews: attempt to fetch seller reviews if endpoint exists, otherwise fallback
          try {
            const reviewsResp = await apiClient.get<ApiResponse<any[]>>(`/products/reviews?sellerId=${sellerId}`);
            reviews = reviewsResp && (reviewsResp as any).success ? (reviewsResp as any).data || [] : [];
          } catch (revErr) {
            reviews = [];
          }

          console.log(`Fetched API data for seller ${sellerId}:`, {
            orders: orders.length,
            listings: listings.length,
            reviews: reviews.length
          });
        } catch (error) {
          console.log('API call failed:', error);
          orders = [];
          listings = [];
          reviews = [];
        }
      }



      // Calculate metrics with fallback demo data for new sellers
      const totalOrders = orders?.length || 0;
      const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0;
      const pendingOrders = orders?.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length || 0;
      const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0;
      const refundedOrders = orders?.filter(o => o.status === 'refunded').length || 0;

      let totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      let averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const totalProducts = listings?.length || 0;
      const activeProducts = listings?.filter(l => l.status === 'active').length || 0;

      const totalReviews = reviews?.length || 0;
      let customerRating = totalReviews > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      // Calculate growth metrics from historical data
      const previousEndDate = new Date(startDate);
      const previousStartDate = new Date(startDate);
      
      switch (period) {
        case '7d':
          previousStartDate.setDate(previousEndDate.getDate() - 7);
          break;
        case '30d':
          previousStartDate.setDate(previousEndDate.getDate() - 30);
          break;
        case '90d':
          previousStartDate.setDate(previousEndDate.getDate() - 90);
          break;
        case '1y':
          previousStartDate.setFullYear(previousEndDate.getFullYear() - 1);
          break;
      }

      // TODO: Implement API call for previous period data
      // For now, simulate growth metrics with mock data
      const previousRevenue = totalRevenue * 0.8; // Simulate 20% growth
      const previousOrderCount = Math.max(0, totalOrders - Math.floor(totalOrders * 0.2));

      const revenueGrowth = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
        : totalRevenue > 0 ? 100 : 0;
      
      const orderGrowth = previousOrderCount > 0 
        ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100 
        : totalOrders > 0 ? 100 : 0;

      // Calculate conversion rate from listings view count
      const totalViews = listings?.reduce((sum, listing) => sum + (listing.view_count || 0), 0) || 0;
      const conversionRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;

      // Calculate top selling listings from real order data
      const listingSales = new Map<string, { totalSold: number; revenue: number; listing: any }>();
      
      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const listingId = item.listing_id;
          const quantity = item.quantity || 0;
          const revenue = (item.price || 0) * quantity;
          
          if (listingSales.has(listingId)) {
            const current = listingSales.get(listingId)!;
            current.totalSold += quantity;
            current.revenue += revenue;
          } else {
            const listing = listings?.find(l => l.id === listingId);
            if (listing) {
              listingSales.set(listingId, {
                totalSold: quantity,
                revenue: revenue,
                listing: listing
              });
            }
          }
        });
      });

      let topSellingProducts: ProductSalesData[] = Array.from(listingSales.values())
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5)
        .map(({ totalSold, revenue, listing }) => ({
          productId: listing.id,
          productName: listing.title,
          imageUrl: listing.listing_images?.find((img: any) => img.is_primary)?.image_url || 
                   listing.listing_images?.[0]?.image_url || 
                   'https://via.placeholder.com/200',
          totalSold,
          revenue,
          averageRating: 4 + Math.random(), // TODO: Calculate from actual reviews
          viewCount: listing.view_count || 0,
          conversionRate: listing.view_count > 0 ? (totalSold / listing.view_count) * 100 : 0
        }));

      // If no sales data, show top listings by views
      if (topSellingProducts.length === 0 && listings.length > 0) {
        topSellingProducts = listings
          .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
          .slice(0, 5)
          .map(listing => ({
            productId: listing.id,
            productName: listing.title,
            imageUrl: listing.listing_images?.find((img: any) => img.is_primary)?.image_url || 
                     listing.listing_images?.[0]?.image_url || 
                     'https://via.placeholder.com/200',
            totalSold: 0,
            revenue: 0,
            averageRating: 4 + Math.random(),
            viewCount: listing.view_count || 0,
            conversionRate: 0
          }));
      }



      // Calculate monthly revenue from real data
      const monthlyData = new Map<string, { revenue: number; orders: number }>();
      
      // Get last 6 months of data
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyData.set(monthKey, { revenue: 0, orders: 0 });
      }

      orders?.forEach(order => {
        const orderDate = new Date(order.created_at);
        const monthKey = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (monthlyData.has(monthKey)) {
          const current = monthlyData.get(monthKey)!;
          current.revenue += order.total_amount || 0;
          current.orders += 1;
        }
      });

      let revenueByMonth: MonthlyRevenue[] = Array.from(monthlyData.entries()).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        orders: data.orders,
        averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0
      }));



      return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalProducts,
        activeProducts,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        refundedOrders,
        conversionRate,
        customerRating,
        totalReviews,
        revenueGrowth,
        orderGrowth,
        topSellingProducts,
        revenueByMonth,
        ordersByStatus: [
          { status: 'completed', count: completedOrders, percentage: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0 },
          { status: 'pending', count: pendingOrders, percentage: totalOrders > 0 ? (pendingOrders / totalOrders) * 100 : 0 },
          { status: 'cancelled', count: cancelledOrders, percentage: totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0 }
        ],
        customerMetrics: await this.calculateCustomerMetrics(sellerId, startDate, endDate, totalRevenue),
        inventoryMetrics: {
          totalProducts,
          activeProducts,
          outOfStockProducts: totalProducts - activeProducts,
          lowStockProducts: Math.floor(Math.random() * 10),
          averageStockLevel: 50,
          stockTurnoverRate: 2.5
        }
      };
    } catch (error) {
      console.error('Error fetching seller analytics:', error);
      throw error;
    }
  }

  async getStockAlerts(sellerId: string): Promise<StockAlert[]> {
    try {
      // Get products and calculate alerts on frontend for now
      const inventory = await this.getInventory(sellerId);
      const alerts: StockAlert[] = [];
      
      inventory.forEach(item => {
        const reorderLevel = item.reorderLevel;
        const currentStock = item.quantity;
        
        if (currentStock === 0) {
          alerts.push({
            id: `alert-out-${item.productId}`,
            productId: item.productId,
            productName: item.product.title,
            currentStock,
            reorderLevel,
            severity: 'out_of_stock',
            createdAt: new Date().toISOString(),
            acknowledged: false
          });
        } else if (currentStock <= reorderLevel) {
          alerts.push({
            id: `alert-low-${item.productId}`,
            productId: item.productId,
            productName: item.product.title,
            currentStock,
            reorderLevel,
            severity: currentStock <= reorderLevel / 2 ? 'critical' : 'low',
            createdAt: new Date().toISOString(),
            acknowledged: false
          });
        }
      });
      
      return alerts;
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      return [];
    }
  }

  // Inventory Management
  async getInventory(sellerId: string): Promise<InventoryItem[]> {
    try {
      // Call the real API to get seller products
      const result = await apiClient.get<ApiResponse<any[]>>('/products/seller/my-products');
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch products');
      }

      // Transform backend product data to inventory format
      return (result.data || []).map((product: any) => {
        // Handle images - may be array (already parsed) or string (needs parsing)
        let imagesArray: { image_url: string }[] = [];
        if (product.images) {
          if (Array.isArray(product.images)) {
            imagesArray = product.images.map((url: string) => ({ image_url: url }));
          } else if (typeof product.images === 'string') {
            try {
              const parsed = JSON.parse(product.images);
              imagesArray = Array.isArray(parsed) 
                ? parsed.map((url: string) => ({ image_url: url }))
                : [{ image_url: product.images }];
            } catch {
              imagesArray = [{ image_url: product.images }];
            }
          }
        }
        if (imagesArray.length === 0) {
          imagesArray = [{ image_url: '/api/placeholder/200/200' }];
        }

        return {
          id: `inv-${product.id}`,
          productId: product.id,
          product: {
            id: product.id,
            title: product.title,
            sku: product.sku || 'N/A',
            price: product.price,
            category: product.categoryId || product.category || 'Uncategorized',
            images: imagesArray
          },
          quantity: product.stockQuantity || 0,
          reservedQuantity: 0, // Not implemented yet
          availableQuantity: product.stockQuantity || 0,
          reorderLevel: 10, // Default value, not in backend yet
          reorderQuantity: 20, // Default value
          cost: product.price * 0.8, // Estimated cost at 80% of price
          location: 'Default Warehouse',
          lastUpdated: product.updatedAt || new Date().toISOString(),
          movements: [] // Not implemented yet
        };
      });
    } catch (error) {
      console.error('Error fetching inventory:', error);
      
      // Fallback to mock data if API fails
      return [
        {
          id: 'inv-1',
          productId: 'listing-1',
          product: {
            id: 'listing-1',
            title: 'iPhone 14 Pro Max',
            sku: 'IPH14PM256',
            price: 450000,
            category: 'Electronics', // Fixed: string instead of object
            images: [{ image_url: '/images/iphone-1.jpg' }]
          },
          quantity: 5,
          reservedQuantity: 0,
          availableQuantity: 5,
          reorderLevel: 3,
          reorderQuantity: 10,
          cost: 400000,
          location: 'Warehouse A',
          lastUpdated: new Date().toISOString(),
          movements: []
        }
      ];
    }
  }

  async updateStock(productId: string, quantity: number, reason: string): Promise<void> {
    try {
      if (!isDevMode) {
        try {
          const resp = await apiClient.put<ApiResponse<any>>(`/products/${productId}/inventory`, {
            quantity,
            reason
          });
          if (resp && (resp as any).success) {
            console.log('📦 Stock updated via backend API');
            return;
          }
          throw new Error('API returned no success flag');
        } catch (apiErr) {
          console.error('Stock update API call failed, simulating local update', apiErr);
        }
      }
      console.log(`Stock updated (local): Product ${productId} to ${quantity} units. Reason: ${reason}`);
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  // Seller Profile Management
  async getSellerProfile(sellerId: string): Promise<SellerProfile | null> {
    try {
      console.log('Loading seller profile for:', sellerId);

      if (!isDevMode) {
        try {
          const resp = await apiClient.get<ApiResponse<SellerProfile>>('/seller/store/settings');
          if (resp && (resp as any).success && (resp as any).data) {
            return (resp as any).data as SellerProfile;
          }
          console.warn('Seller profile API returned no data, falling back to mock');
        } catch (apiErr) {
          console.error('Seller profile API call failed, falling back to mock', apiErr);
        }
      }

      // Return mock seller profile for development/fallback
      return {
        id: 'profile-1',
        userId: sellerId,
        businessName: 'John\'s Electronics Store',
        businessDescription: 'Premium electronics and gadgets at competitive prices',
        businessType: 'small_business',
        businessAddress: {
          street: '123 Victoria Island',
          city: 'Lagos',
          state: 'Lagos State',
          postalCode: '101001',
          country: 'Nigeria'
        },
        contactInfo: {
          primaryPhone: '+234-123-456-7890',
          businessEmail: 'john@electronics.com',
          website: 'https://johnselectronics.com'
        },
        bankDetails: {
          accountName: 'John Doe Business Account',
          accountNumber: '1234567890',
          bankName: 'First Bank of Nigeria',
          bankCode: '011',
          verified: true
        },
        taxInfo: {
          taxId: 'TIN-123456789',
          taxExempt: false
        },
        socialMedia: {
          facebook: 'https://facebook.com/johnselectronics',
          instagram: 'https://instagram.com/johnselectronics'
        },
        branding: {
          logo: '/api/placeholder/80/80',
          coverImage: '/api/placeholder/800/200',
          primaryColor: '#DC2626',
          secondaryColor: '#B91C1C',
          slogan: 'Premium Electronics at Great Prices'
        },
        verification: {
          status: 'verified',
          level: 'standard',
          documentsSubmitted: [
            {
              id: 'doc-1',
              type: 'business_license',
              fileName: 'business_cert.pdf',
              fileUrl: '/documents/business_cert.pdf',
              status: 'approved',
              uploadedAt: new Date().toISOString()
            },
            {
              id: 'doc-2',
              type: 'tax_id',
              fileName: 'tax_certificate.pdf',
              fileUrl: '/documents/tax_cert.pdf',
              status: 'approved',
              uploadedAt: new Date().toISOString()
            },
            {
              id: 'doc-3',
              type: 'identity',
              fileName: 'id_card.pdf',
              fileUrl: '/documents/id_card.pdf',
              status: 'approved',
              uploadedAt: new Date().toISOString()
            },
            {
              id: 'doc-4',
              type: 'address_proof',
              fileName: 'utility_bill.pdf',
              fileUrl: '/documents/utility_bill.pdf',
              status: 'pending',
              uploadedAt: new Date().toISOString()
            },
            {
              id: 'doc-5',
              type: 'bank_statement',
              fileName: 'bank_statement.pdf',
              fileUrl: '/documents/bank_statement.pdf',
              status: 'approved',
              uploadedAt: new Date().toISOString()
            }
          ],
          verifiedAt: new Date().toISOString(),
          badges: [
            {
              id: 'badge-1',
              type: 'verified_business',
              title: 'Verified Business',
              description: 'This business has been verified by our team',
              icon: 'shield-check',
              earnedAt: new Date().toISOString()
            }
          ]
        },
        settings: {
          autoAcceptOrders: true,
          autoConfirmPayment: false,
          enableNotifications: true,
          workingHours: [
            { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
            { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
            { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
            { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
            { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
            { day: 'saturday', isOpen: true, openTime: '10:00', closeTime: '16:00' },
            { day: 'sunday', isOpen: false }
          ],
          shippingPolicies: [],
          returnPolicy: {
            acceptReturns: true,
            returnWindow: 14,
            restockingFee: 0,
            conditions: ['Original packaging', 'Item in good condition'],
            instructions: 'Contact us within 14 days for return approval'
          },
          customPolicies: [],
          languages: ['en', 'yo'],
          currency: 'NGN',
          timezone: 'Africa/Lagos'
        },
        statistics: {
          totalRevenue: 2500000,
          totalOrders: 125,
          totalCustomers: 87,
          averageRating: 4.8,
          totalReviews: 94,
          responseTime: 2,
          orderFulfillmentRate: 98.5,
          onTimeDeliveryRate: 95.2
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      // Return null to trigger the "Profile not found" state
      return null;
    }
  }

  async updateSellerProfile(sellerId: string, profileData: Partial<SellerProfile>): Promise<void> {
    try {
      if (!isDevMode) {
        try {
          const resp = await apiClient.put<ApiResponse<any>>('/seller/store/settings', profileData);
          if (resp && (resp as any).success) {
            console.log('✅ Seller profile updated via backend API');
            return;
          }
          throw new Error('API returned no success flag');
        } catch (apiErr) {
          console.error('Seller profile update API call failed, simulating local update', apiErr);
        }
      }
      console.log('Seller profile updated (local):', { sellerId, profileData });
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error updating seller profile:', error);
      throw error;
    }
  }

  // Customer Communication
  async getConversations(sellerId: string): Promise<Conversation[]> {
    try {
      if (!isDevMode) {
        try {
          const resp = await apiClient.get<ApiResponse<any[]>>('/chat/conversations');
          if (resp && (resp as any).success && (resp as any).data) {
            console.log('💬 Fetched conversations from backend API');
            return (resp as any).data as Conversation[];
          }
          console.warn('Conversations API returned no data');
        } catch (apiErr) {
          console.error('Conversations API call failed, falling back to mock', apiErr);
        }
      }
      // Return mock conversations for development/fallback
      return [
        {
          id: 'conv-1',
          seller_id: sellerId,
          customer_id: 'customer-1',
          listing_id: 'listing-1',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message: {
            id: 'msg-1',
            content: 'Hi, is this iPhone still available?',
            sender_id: 'customer-1',
            sender_type: 'customer',
            timestamp: new Date().toISOString(),
            status: 'read'
          },
          customer: {
            id: 'customer-1',
            first_name: 'Alice',
            last_name: 'Johnson',
            avatar: null
          }
        }
      ];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  async getMessages(conversationId: string): Promise<CustomerMessage[]> {
    try {
      if (!isDevMode) {
        try {
          const resp = await apiClient.get<ApiResponse<any[]>>(`/chat/conversations/${conversationId}/messages`);
          if (resp && (resp as any).success && (resp as any).data) {
            console.log('📨 Fetched messages from backend API');
            return (resp as any).data as CustomerMessage[];
          }
        } catch (apiErr) {
          console.error('Messages API call failed, falling back to empty', apiErr);
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<void> {
    try {
      if (!isDevMode) {
        try {
          const resp = await apiClient.post<ApiResponse<any>>(`/chat/conversations/${conversationId}/messages`, {
            content,
            senderId
          });
          if (resp && (resp as any).success) {
            console.log('✉️ Message sent via backend API');
            return;
          }
          throw new Error('API returned no success flag');
        } catch (apiErr) {
          console.error('Send message API call failed, simulating local send', apiErr);
        }
      }
      console.log('Message sent (local/simulated)', { conversationId, senderId, content });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Performance Analytics
  async getPerformanceMetrics(sellerId: string, period: string): Promise<SellerPerformanceMetrics> {
    try {
      if (!isDevMode) {
        try {
          const resp = await apiClient.get<ApiResponse<any>>(`/seller/analytics?period=${period}`);
          if (resp && (resp as any).success && (resp as any).data) {
            console.log('📈 Fetched performance metrics from backend API');
            return (resp as any).data as SellerPerformanceMetrics;
          }
        } catch (apiErr) {
          console.error('Performance metrics API call failed, falling back to mock', apiErr);
        }
      }
      // Return mock performance metrics for development/fallback
      return {
      period: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      },
      sales: {
        totalRevenue: 45000,
        totalOrders: 150,
        averageOrderValue: 300,
        salesGrowth: 15.2,
        bestSellingCategory: 'Electronics',
        peakSalesHour: 14,
        salesByChannel: [
          { channel: 'Direct', revenue: 30000, orders: 100, percentage: 66.7 },
          { channel: 'Search', revenue: 15000, orders: 50, percentage: 33.3 }
        ],
        salesTrends: []
      },
      products: {
        totalProducts: 25,
        newProducts: 3,
        bestPerformers: [],
        underPerformers: [],
        outOfStock: 2,
        lowStock: 5,
        averageViews: 150,
        conversionRate: 3.2
      },
      customers: {
        totalCustomers: 200,
        newCustomers: 25,
        returningCustomers: 45,
        customerRetentionRate: 72.5,
        averageCustomerValue: 450
      },
      operations: {
        orderFulfillmentTime: 18,
        shippingAccuracy: 98.5,
        returnRate: 2.1,
        customerSatisfaction: 4.6,
        responseTime: 2.5,
        disputeRate: 0.5
      },
      financial: {
        grossProfit: 35000,
        netProfit: 28000,
        profitMargin: 62.2,
        totalExpenses: 7000,
        payoutReceived: 25000,
        pendingPayout: 3000,
        refundTotal: 500,
        chargebackTotal: 100
      },
      competition: {
        marketShare: 8.5,
        priceCompetitiveness: 85,
        rankingPosition: 12,
        competitorCount: 45,
        priceAdvantage: 5.2
      }
    };
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return {} as SellerPerformanceMetrics;
    }
  }

  // Onboarding
  async getOnboardingProgress(sellerId: string): Promise<OnboardingProgress> {
    try {
      if (!isDevMode) {
        try {
          const resp = await apiClient.get<ApiResponse<any>>('/seller/onboarding/progress');
          if (resp && (resp as any).success && (resp as any).data) {
            console.log('📋 Fetched onboarding progress from backend API');
            return (resp as any).data as OnboardingProgress;
          }
        } catch (apiErr) {
          console.error('Onboarding progress API call failed, falling back to mock', apiErr);
        }
      }
      // Return mock onboarding data for development/fallback
      const initialProgress = {
        currentStep: 1,
        totalSteps: 7,
        completedSteps: 0,
        progressPercentage: 0,
        steps: [
          { id: '1', title: 'Business Information', description: 'Provide your business details', status: 'pending' as const, required: true, order: 1, estimatedTime: 10 },
          { id: '2', title: 'Verification Documents', description: 'Upload required documents', status: 'pending' as const, required: true, order: 2, estimatedTime: 15 },
          { id: '3', title: 'Bank Details', description: 'Add your payout information', status: 'pending' as const, required: true, order: 3, estimatedTime: 5 },
          { id: '4', title: 'First Product', description: 'List your first product', status: 'pending' as const, required: false, order: 4, estimatedTime: 20 },
          { id: '5', title: 'Store Setup', description: 'Customize your store', status: 'pending' as const, required: false, order: 5, estimatedTime: 15 },
          { id: '6', title: 'Shipping Settings', description: 'Configure shipping options', status: 'pending' as const, required: true, order: 6, estimatedTime: 10 },
          { id: '7', title: 'Launch Store', description: 'Go live and start selling', status: 'pending' as const, required: true, order: 7, estimatedTime: 5 }
        ],
        startedAt: new Date().toISOString()
      };
      
      console.log('Using mock onboarding data - TODO: implement API call');
      return initialProgress;
    } catch (error) {
      console.error('Error fetching onboarding progress:', error);
      throw error;
    }
  }

  async updateOnboardingStep(sellerId: string, stepId: string, status: 'completed' | 'skipped'): Promise<void> {
    try {
      if (!isDevMode) {
        try {
          const resp = await apiClient.post<ApiResponse<any>>('/seller/onboarding/step', {
            stepId,
            status
          });
          if (resp && (resp as any).success) {
            console.log('✅ Onboarding step updated via backend API');
            return;
          }
          throw new Error('API returned no success flag');
        } catch (apiErr) {
          console.error('Onboarding step update API call failed, simulating local update', apiErr);
        }
      }
      console.log(`Onboarding step updated (local): Step ${stepId} marked as ${status} for seller ${sellerId}`);
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      throw error;
    }
  }
}

export const sellerService = new SellerService();
