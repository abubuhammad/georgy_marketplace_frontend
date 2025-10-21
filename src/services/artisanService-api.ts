import { apiClient } from '@/lib/apiClient';
import {
  Artisan,
  ServiceRequest,
  ServiceQuote,
  ServiceCategory,
  ArtisanAnalytics,
  CustomerAnalytics,
  ArtisanFilters,
  ServiceRequestFilters,
} from '@/types';

class ArtisanApiService {
  // Artisan Management
  async registerArtisan(data: any): Promise<Artisan> {
    try {
      const response = await apiClient.post('/artisans/register', data);
      return response.data.artisan;
    } catch (error) {
      console.error('Error registering artisan:', error);
      throw new Error('Failed to register artisan');
    }
  }

  async getArtisanProfile(userId: string): Promise<Artisan> {
    try {
      const response = await apiClient.get(`/artisans/profile/${userId}`);
      return response.data.artisan;
    } catch (error) {
      console.error('Error getting artisan profile:', error);
      throw new Error('Failed to get artisan profile');
    }
  }

  async updateArtisanProfile(userId: string, updates: any): Promise<Artisan> {
    try {
      const response = await apiClient.put(`/artisans/profile/${userId}`, updates);
      return response.data.artisan;
    } catch (error) {
      console.error('Error updating artisan profile:', error);
      throw new Error('Failed to update artisan profile');
    }
  }

  async setAvailability(userId: string, availability: any): Promise<void> {
    try {
      await apiClient.put(`/artisans/${userId}/availability`, { availability });
    } catch (error) {
      console.error('Error setting availability:', error);
      throw new Error('Failed to set availability');
    }
  }

  async toggleActiveStatus(userId: string): Promise<void> {
    try {
      await apiClient.put(`/artisans/${userId}/toggle-status`);
    } catch (error) {
      console.error('Error toggling active status:', error);
      throw new Error('Failed to toggle active status');
    }
  }

  async getServiceCategories(): Promise<ServiceCategory[]> {
    try {
      const response = await apiClient.get('/artisans/categories');
      return response.data.categories;
    } catch (error) {
      console.error('Error getting service categories:', error);
      // Fallback to hardcoded categories
      return [
        { id: '1', name: 'Plumbing', slug: 'plumbing', description: 'Water and pipe services', icon: '🔧', isActive: true, createdAt: new Date().toISOString() },
        { id: '2', name: 'Electrical', slug: 'electrical', description: 'Electrical installations and repairs', icon: '⚡', isActive: true, createdAt: new Date().toISOString() },
        { id: '3', name: 'Carpentry', slug: 'carpentry', description: 'Wood working and furniture', icon: '🔨', isActive: true, createdAt: new Date().toISOString() },
        { id: '4', name: 'Beauty', slug: 'beauty', description: 'Beauty and personal care services', icon: '💄', isActive: true, createdAt: new Date().toISOString() },
        { id: '5', name: 'Cleaning', slug: 'cleaning', description: 'Home and office cleaning', icon: '🧹', isActive: true, createdAt: new Date().toISOString() }
      ];
    }
  }

  async searchArtisans(filters: ArtisanFilters): Promise<{ artisans: Artisan[]; total: number }> {
    try {
      const response = await apiClient.get('/artisans', { params: filters });
      return {
        artisans: response.data.artisans,
        total: response.data.total
      };
    } catch (error) {
      console.error('Error searching artisans:', error);
      return { artisans: [], total: 0 };
    }
  }

  // Service Request Management
  async createServiceRequest(data: any): Promise<ServiceRequest> {
    try {
      const response = await apiClient.post('/artisans/service-requests', data);
      return response.data.request;
    } catch (error) {
      console.error('Error creating service request:', error);
      throw new Error('Failed to create service request');
    }
  }

  async getServiceRequests(filters: ServiceRequestFilters): Promise<{ requests: ServiceRequest[]; total: number }> {
    try {
      const response = await apiClient.get('/artisans/service-requests', { params: filters });
      return {
        requests: response.data.requests,
        total: response.data.total
      };
    } catch (error) {
      console.error('Error getting service requests:', error);
      return { requests: [], total: 0 };
    }
  }

  async getArtisanRequests(artisanId: string): Promise<ServiceRequest[]> {
    try {
      const response = await apiClient.get(`/artisans/${artisanId}/requests`);
      return response.data.requests;
    } catch (error) {
      console.error('Error getting artisan requests:', error);
      return [];
    }
  }

  async getServiceRequestById(requestId: string): Promise<ServiceRequest> {
    try {
      const response = await apiClient.get(`/artisans/service-requests/${requestId}`);
      return response.data.request;
    } catch (error) {
      console.error('Error getting service request:', error);
      throw new Error('Failed to get service request');
    }
  }

  // Quote Management
  async submitQuote(data: any): Promise<ServiceQuote> {
    try {
      const response = await apiClient.post('/artisans/quotes', data);
      return response.data.quote;
    } catch (error) {
      console.error('Error submitting quote:', error);
      throw new Error('Failed to submit quote');
    }
  }

  async getQuotesForRequest(requestId: string): Promise<ServiceQuote[]> {
    try {
      const response = await apiClient.get(`/artisans/service-requests/${requestId}/quotes`);
      return response.data.quotes;
    } catch (error) {
      console.error('Error getting quotes:', error);
      return [];
    }
  }

  async acceptQuote(quoteId: string): Promise<ServiceQuote> {
    try {
      const response = await apiClient.put(`/artisans/quotes/${quoteId}/accept`);
      return response.data.quote;
    } catch (error) {
      console.error('Error accepting quote:', error);
      throw new Error('Failed to accept quote');
    }
  }

  // Analytics and Stats
  async getArtisanAnalytics(artisanId: string): Promise<ArtisanAnalytics> {
    try {
      const response = await apiClient.get(`/artisans/${artisanId}/analytics`);
      return response.data.analytics;
    } catch (error) {
      console.error('Error getting artisan analytics:', error);
      // Fallback to mock analytics
      return {
        totalJobs: 0,
        completedJobs: 0,
        activeJobs: 0,
        totalEarnings: 0,
        averageRating: 0,
        responseTime: 0,
        completionRate: 0,
        repeatCustomers: 0,
        monthlyStats: []
      };
    }
  }

  async getCustomerAnalytics(customerId: string): Promise<CustomerAnalytics> {
    try {
      const response = await apiClient.get(`/artisans/customers/${customerId}/analytics`);
      return response.data.analytics;
    } catch (error) {
      console.error('Error getting customer analytics:', error);
      // Fallback to mock analytics
      return {
        totalRequests: 0,
        completedRequests: 0,
        activeRequests: 0,
        totalSpent: 0,
        averageRating: 0,
        favoriteCategories: [],
        preferredArtisans: []
      };
    }
  }
}

export const artisanApiService = new ArtisanApiService();
export default artisanApiService;
