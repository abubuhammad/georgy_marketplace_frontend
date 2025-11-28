import apiClient from './apiClient';

export interface Order {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  amount: number;
  quantity?: number;
  seller?: {
    name: string;
    avatar?: string;
  };
}

export interface ActivityMetrics {
  itemsViewedThisWeek: number;
  searchesPerformed: number;
  messagesSent: number;
  reviewsWritten: number;
}

export interface CustomerDashboard {
  totalOrders: number;
  favoriteItems: number;
  profileViews: number;
  reviewsGiven: number;
  recentOrders: Order[];
  activityMetrics: ActivityMetrics;
}

/**
 * Fetch customer dashboard data from backend
 * Falls back to mock data if endpoint doesn't exist
 */
export const fetchCustomerDashboard = async (): Promise<CustomerDashboard> => {
  try {
    const response = await apiClient.get('/customers/dashboard');
    return response.data.data;
  } catch (error: any) {
    console.warn('Dashboard endpoint not yet available, using fallback data:', error.message);
    // Return fallback data while backend endpoints are being developed
    return {
      totalOrders: 0,
      favoriteItems: 0,
      profileViews: 0,
      reviewsGiven: 0,
      recentOrders: [],
      activityMetrics: {
        itemsViewedThisWeek: 0,
        searchesPerformed: 0,
        messagesSent: 0,
        reviewsWritten: 0
      }
    };
  }
};

/**
 * Fetch customer orders
 * Falls back to empty array if endpoint doesn't exist
 */
export const fetchCustomerOrders = async (
  page: number = 1,
  limit: number = 20,
  status?: string
): Promise<{ orders: Order[]; total: number; pages: number }> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const response = await apiClient.get(`/customers/orders?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.warn('Orders endpoint not yet available:', error);
    return { orders: [], total: 0, pages: 0 };
  }
};

/**
 * Fetch customer favorites/wishlist
 * Falls back to empty array if endpoint doesn't exist
 */
export const fetchCustomerFavorites = async (
  page: number = 1,
  limit: number = 20
): Promise<{ favorites: any[]; total: number }> => {
  try {
    const response = await apiClient.get(`/customers/favorites?page=${page}&limit=${limit}`);
    return response.data.data;
  } catch (error) {
    console.warn('Favorites endpoint not yet available:', error);
    return { favorites: [], total: 0 };
  }
};

/**
 * Fetch customer activity metrics
 * Falls back to zeros if endpoint doesn't exist
 */
export const fetchActivityMetrics = async (): Promise<ActivityMetrics> => {
  try {
    const response = await apiClient.get('/customers/activity-metrics');
    return response.data.data;
  } catch (error) {
    console.warn('Activity metrics endpoint not yet available:', error);
    // Return default metrics if API fails
    return {
      itemsViewedThisWeek: 0,
      searchesPerformed: 0,
      messagesSent: 0,
      reviewsWritten: 0
    };
  }
};

/**
 * Fetch order details
 */
export const fetchOrderDetails = async (orderId: string): Promise<Order> => {
  try {
    const response = await apiClient.get(`/customers/orders/${orderId}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch order details:', error);
    throw error;
  }
};

/**
 * Write review for an order
 */
export const submitOrderReview = async (
  orderId: string,
  rating: number,
  review: string
): Promise<any> => {
  try {
    const response = await apiClient.post(`/customers/orders/${orderId}/review`, {
      rating,
      review
    });
    return response.data;
  } catch (error) {
    console.error('Failed to submit review:', error);
    throw error;
  }
};

/**
 * Add item to favorites
 */
export const addToFavorites = async (productId: string): Promise<any> => {
  try {
    const response = await apiClient.post('/customers/favorites', { productId });
    return response.data;
  } catch (error) {
    console.error('Failed to add to favorites:', error);
    throw error;
  }
};

/**
 * Remove item from favorites
 */
export const removeFromFavorites = async (productId: string): Promise<any> => {
  try {
    const response = await apiClient.delete(`/customers/favorites/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to remove from favorites:', error);
    throw error;
  }
};

/**
 * Get customer profile statistics
 */
export const fetchProfileStats = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/customers/profile-stats');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch profile stats:', error);
    throw error;
  }
};
