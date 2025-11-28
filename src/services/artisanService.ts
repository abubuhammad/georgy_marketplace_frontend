import { generateMockData, mockStorage } from '@/lib/mockData';
import { artisanApiService } from './artisanService-api';
import {
  Artisan,
  ServiceRequest,
  ServiceQuote,
  ServiceChat,
  ChatMessage,
  ServiceCategory,
  ArtisanAnalytics,
  CustomerAnalytics,
  ServiceReview,
  ArtisanFilters,
  ServiceRequestFilters,
} from '@/types';

class ArtisanService {
  private useBackend = true; // Default to using backend API

  constructor() {
    this.checkBackendAvailability();
  }

  private async checkBackendAvailability() {
    try {
      // Use the proxy URL in development, or construct proper URL in production
      const healthUrl = import.meta.env.DEV 
        ? '/api/health'  // Use proxy in development
        : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/health`;
      
      const response = await fetch(healthUrl);
      this.useBackend = response.ok;
    } catch (error) {
      this.useBackend = false;
      console.warn('Backend not available, using mock data');
    }
  }
  // Artisan Management
  async registerArtisan(data: any): Promise<Artisan> {
    if (this.useBackend) {
      try {
        return await artisanApiService.registerArtisan(data);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      const newArtisan = {
        ...generateMockData.artisan(),
        userId: data.userId,
        businessName: data.businessName,
        description: data.description,
        categories: data.categories,
        skills: data.skills,
        experience: data.experience,
        hourlyRate: data.hourlyRate,
        location: data.location,
        serviceArea: data.serviceArea,
        workingHours: data.workingHours,
      };

      mockStorage.artisans.push(newArtisan);
      console.log('Artisan registered:', newArtisan.businessName);
      return newArtisan;
    } catch (error) {
      console.error('Error registering artisan:', error);
      throw new Error('Failed to register artisan');
    }
  }

  async getArtisanProfile(userId: string): Promise<Artisan> {
    if (this.useBackend) {
      try {
        return await artisanApiService.getArtisanProfile(userId);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      const artisan = mockStorage.artisans.find(a => a.userId === userId);
      if (!artisan) {
        throw new Error('Artisan not found');
      }
      console.log('Retrieved artisan profile:', artisan.businessName);
      return artisan;
    } catch (error) {
      console.error('Error getting artisan profile:', error);
      throw new Error('Failed to get artisan profile');
    }
  }

  async updateArtisanProfile(userId: string, updates: any): Promise<Artisan> {
    try {
      const artisanIndex = mockStorage.artisans.findIndex(a => a.userId === userId);
      if (artisanIndex === -1) {
        throw new Error('Artisan not found');
      }

      mockStorage.artisans[artisanIndex] = {
        ...mockStorage.artisans[artisanIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      console.log('Updated artisan profile:', mockStorage.artisans[artisanIndex].businessName);
      return mockStorage.artisans[artisanIndex];
    } catch (error) {
      console.error('Error updating artisan profile:', error);
      throw new Error('Failed to update artisan profile');
    }
  }

  async setAvailability(userId: string, availability: any): Promise<void> {
    try {
      const artisanIndex = mockStorage.artisans.findIndex(a => a.userId === userId);
      if (artisanIndex !== -1) {
        mockStorage.artisans[artisanIndex].availability = availability;
        console.log('Updated artisan availability');
      }
    } catch (error) {
      console.error('Error setting availability:', error);
      throw new Error('Failed to set availability');
    }
  }

  async toggleActiveStatus(userId: string): Promise<void> {
    try {
      const artisanIndex = mockStorage.artisans.findIndex(a => a.userId === userId);
      if (artisanIndex !== -1) {
        mockStorage.artisans[artisanIndex].isActive = !mockStorage.artisans[artisanIndex].isActive;
        console.log('Toggled artisan active status');
      }
    } catch (error) {
      console.error('Error toggling active status:', error);
      throw new Error('Failed to toggle active status');
    }
  }

  async getServiceCategories(): Promise<ServiceCategory[]> {
    if (this.useBackend) {
      try {
        return await artisanApiService.getServiceCategories();
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      const categories = [
        { id: '1', name: 'Plumbing', slug: 'plumbing', description: 'Water and pipe services', icon: '🔧', isActive: true, createdAt: new Date().toISOString() },
        { id: '2', name: 'Electrical', slug: 'electrical', description: 'Electrical installations and repairs', icon: '⚡', isActive: true, createdAt: new Date().toISOString() },
        { id: '3', name: 'Carpentry', slug: 'carpentry', description: 'Wood working and furniture', icon: '🔨', isActive: true, createdAt: new Date().toISOString() },
        { id: '4', name: 'Beauty', slug: 'beauty', description: 'Beauty and personal care services', icon: '💄', isActive: true, createdAt: new Date().toISOString() },
        { id: '5', name: 'Cleaning', slug: 'cleaning', description: 'Home and office cleaning', icon: '🧹', isActive: true, createdAt: new Date().toISOString() }
      ];
      console.log('Retrieved service categories:', categories.length);
      return categories;
    } catch (error) {
      console.error('Error getting service categories:', error);
      return [];
    }
  }

  async searchArtisans(filters: ArtisanFilters): Promise<{ artisans: Artisan[]; total: number }> {
    if (this.useBackend) {
      try {
        return await artisanApiService.searchArtisans(filters);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      let filteredArtisans = [...mockStorage.artisans];

      // Apply filters
      if (filters.category) {
        filteredArtisans = filteredArtisans.filter(a => 
          a.categories?.includes(filters.category as string)
        );
      }

      if (filters.location) {
        // Simple location-based filtering (in production would use proper geo-search)
        filteredArtisans = filteredArtisans.filter(a => a.location);
      }

      if (filters.minRating) {
        filteredArtisans = filteredArtisans.filter(a => 
          (a.rating || 0) >= (filters.minRating || 0)
        );
      }

      if (filters.maxRate) {
        filteredArtisans = filteredArtisans.filter(a => 
          (a.hourlyRate || 0) <= (filters.maxRate || 0)
        );
      }

      // Apply pagination
      const offset = ((filters.page || 1) - 1) * (filters.limit || 10);
      const paginatedArtisans = filteredArtisans.slice(offset, offset + (filters.limit || 10));

      console.log(`Found ${filteredArtisans.length} artisans matching filters`);
      return {
        artisans: paginatedArtisans,
        total: filteredArtisans.length
      };
    } catch (error) {
      console.error('Error searching artisans:', error);
      return { artisans: [], total: 0 };
    }
  }

  // Service Request Management
  async createServiceRequest(data: any): Promise<ServiceRequest> {
    if (this.useBackend) {
      try {
        return await artisanApiService.createServiceRequest(data);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      const newRequest = {
        ...generateMockData.serviceRequest(),
        ...data,
      };

      mockStorage.serviceRequests.push(newRequest);
      console.log('Service request created:', newRequest.title);
      return newRequest;
    } catch (error) {
      console.error('Error creating service request:', error);
      throw new Error('Failed to create service request');
    }
  }

  async getServiceRequests(filters: ServiceRequestFilters): Promise<{ requests: ServiceRequest[]; total: number }> {
    try {
      let filteredRequests = [...mockStorage.serviceRequests];

      // Apply filters
      if (filters.customerId) {
        filteredRequests = filteredRequests.filter(r => r.customerId === filters.customerId);
      }

      if (filters.category) {
        filteredRequests = filteredRequests.filter(r => r.category === filters.category);
      }

      if (filters.status) {
        filteredRequests = filteredRequests.filter(r => r.status === filters.status);
      }

      console.log(`Found ${filteredRequests.length} service requests`);
      return {
        requests: filteredRequests,
        total: filteredRequests.length
      };
    } catch (error) {
      console.error('Error getting service requests:', error);
      return { requests: [], total: 0 };
    }
  }

  async getArtisanRequests(artisanId: string): Promise<ServiceRequest[]> {
    try {
      // In a real app, this would filter by artisan's service areas and categories
      const requests = mockStorage.serviceRequests.filter(r => r.status === 'open');
      console.log(`Found ${requests.length} available requests for artisan`);
      return requests;
    } catch (error) {
      console.error('Error getting artisan requests:', error);
      return [];
    }
  }

  async getServiceRequestById(requestId: string): Promise<ServiceRequest> {
    try {
      const request = mockStorage.serviceRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Service request not found');
      }
      console.log('Retrieved service request:', request.title);
      return request;
    } catch (error) {
      console.error('Error getting service request:', error);
      throw new Error('Failed to get service request');
    }
  }

  // Quote Management
  async submitQuote(data: any): Promise<ServiceQuote> {
    try {
      const newQuote = {
        ...generateMockData.serviceQuote(),
        ...data,
      };

      mockStorage.serviceQuotes.push(newQuote);
      console.log('Quote submitted for request:', data.requestId);
      return newQuote;
    } catch (error) {
      console.error('Error submitting quote:', error);
      throw new Error('Failed to submit quote');
    }
  }

  async getQuotesForRequest(requestId: string): Promise<ServiceQuote[]> {
    try {
      const quotes = mockStorage.serviceQuotes.filter(q => q.requestId === requestId);
      console.log(`Found ${quotes.length} quotes for request`);
      return quotes;
    } catch (error) {
      console.error('Error getting quotes:', error);
      return [];
    }
  }

  async acceptQuote(quoteId: string): Promise<ServiceQuote> {
    try {
      const quoteIndex = mockStorage.serviceQuotes.findIndex(q => q.id === quoteId);
      if (quoteIndex === -1) {
        throw new Error('Quote not found');
      }

      mockStorage.serviceQuotes[quoteIndex].status = 'accepted';
      console.log('Quote accepted:', quoteId);
      return mockStorage.serviceQuotes[quoteIndex];
    } catch (error) {
      console.error('Error accepting quote:', error);
      throw new Error('Failed to accept quote');
    }
  }

  // Analytics and Stats
  async getArtisanAnalytics(artisanId: string): Promise<ArtisanAnalytics> {
    try {
      // Return mock analytics
      const analytics = {
        totalJobs: 25,
        completedJobs: 22,
        activeJobs: 3,
        totalEarnings: 125000,
        averageRating: 4.5,
        responseTime: 30,
        completionRate: 88,
        repeatCustomers: 12,
        monthlyStats: [
          { month: 'Jan', jobs: 5, earnings: 25000 },
          { month: 'Feb', jobs: 7, earnings: 35000 },
          { month: 'Mar', jobs: 6, earnings: 30000 }
        ]
      };
      console.log('Retrieved artisan analytics');
      return analytics;
    } catch (error) {
      console.error('Error getting artisan analytics:', error);
      throw new Error('Failed to get analytics');
    }
  }

  async getCustomerAnalytics(customerId: string): Promise<CustomerAnalytics> {
    try {
      // Return mock analytics
      const analytics = {
        totalRequests: 10,
        completedRequests: 8,
        activeRequests: 2,
        totalSpent: 75000,
        averageRating: 4.3,
        favoriteCategories: ['plumbing', 'electrical'],
        preferredArtisans: []
      };
      console.log('Retrieved customer analytics');
      return analytics;
    } catch (error) {
      console.error('Error getting customer analytics:', error);
      throw new Error('Failed to get analytics');
    }
  }

  // Helper method to transform data (placeholder)
  private transformArtisan(data: any): Artisan {
    return data;
  }
}

export const artisanService = new ArtisanService();
export default artisanService;
