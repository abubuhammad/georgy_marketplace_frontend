import { generateMockData, mockStorage } from '@/lib/mockData';
import { realEstateApiService } from './realEstateService-api';
import {
  RealEstateProfessional,
  Property,
  PropertyViewing,
  PropertyInquiry,
  PropertySearchFilters,
  PropertyImage,
  PropertyDocument,
  RealEstateAnalytics,
  PropertyType,
  ListingType,
  UserType
} from '@/types';

class RealEstateService {
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

  // Professional Management
  async registerProfessional(userId: string, data: any): Promise<RealEstateProfessional> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.registerProfessional(userId, data);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      const newProfessional = {
        id: `professional_${Date.now()}`,
        userId,
        userType: data.userType,
        businessName: data.businessName,
        licenseNumber: data.licenseNumber,
        experience: data.experience,
        specializations: data.specializations,
        serviceAreas: data.serviceAreas,
        contactInfo: data.contactInfo,
        isVerified: false,
        rating: 0,
        reviewCount: 0,
        totalListings: 0,
        activeListings: 0,
        totalSales: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store in mock storage
      if (!mockStorage.realEstateProfessionals) mockStorage.realEstateProfessionals = [];
      mockStorage.realEstateProfessionals.push(newProfessional);
      
      console.log('Real estate professional registered:', newProfessional.businessName);
      return newProfessional;
    } catch (error) {
      console.error('Error registering professional:', error);
      throw new Error('Failed to register professional');
    }
  }

  async getProfessional(userId: string): Promise<RealEstateProfessional> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.getProfessional(userId);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      if (!mockStorage.realEstateProfessionals) mockStorage.realEstateProfessionals = [];
      const professional = mockStorage.realEstateProfessionals.find(p => p.userId === userId);
      if (!professional) {
        throw new Error('Professional not found');
      }
      console.log('Retrieved professional:', professional.businessName);
      return professional;
    } catch (error) {
      console.error('Error getting professional:', error);
      throw new Error('Failed to get professional');
    }
  }

  async updateProfessional(userId: string, updates: Partial<RealEstateProfessional>): Promise<RealEstateProfessional> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.updateProfessional(userId, updates);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      if (!mockStorage.realEstateProfessionals) mockStorage.realEstateProfessionals = [];
      const professionalIndex = mockStorage.realEstateProfessionals.findIndex(p => p.userId === userId);
      if (professionalIndex === -1) {
        throw new Error('Professional not found');
      }

      mockStorage.realEstateProfessionals[professionalIndex] = {
        ...mockStorage.realEstateProfessionals[professionalIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      console.log('Updated professional:', mockStorage.realEstateProfessionals[professionalIndex].businessName);
      return mockStorage.realEstateProfessionals[professionalIndex];
    } catch (error) {
      console.error('Error updating professional:', error);
      throw new Error('Failed to update professional');
    }
  }

  // Property Management
  async createProperty(ownerId: string, data: any): Promise<Property> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.createProperty(ownerId, data);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      const newProperty = {
        ...generateMockData.property(),
        ...data,
        ownerId,
      };

      mockStorage.properties.push(newProperty);
      console.log('Property created:', newProperty.title);
      return newProperty;
    } catch (error) {
      console.error('Error creating property:', error);
      throw new Error('Failed to create property');
    }
  }

  async searchProperties(filters: PropertySearchFilters): Promise<{ properties: Property[]; total: number }> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.searchProperties(filters);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      let filteredProperties = [...mockStorage.properties];

      // Apply filters
      if (filters.type) {
        filteredProperties = filteredProperties.filter(p => p.type === filters.type);
      }

      if (filters.listingType) {
        filteredProperties = filteredProperties.filter(p => p.listingType === filters.listingType);
      }

      if (filters.location) {
        filteredProperties = filteredProperties.filter(p => 
          p.location.city?.toLowerCase().includes(filters.location!.toLowerCase()) ||
          p.location.state?.toLowerCase().includes(filters.location!.toLowerCase()) ||
          p.location.address?.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      if (filters.minPrice) {
        filteredProperties = filteredProperties.filter(p => p.price >= filters.minPrice!);
      }

      if (filters.maxPrice) {
        filteredProperties = filteredProperties.filter(p => p.price <= filters.maxPrice!);
      }

      if (filters.bedrooms) {
        filteredProperties = filteredProperties.filter(p => 
          p.features.bedrooms >= filters.bedrooms!
        );
      }

      if (filters.bathrooms) {
        filteredProperties = filteredProperties.filter(p => 
          p.features.bathrooms >= filters.bathrooms!
        );
      }

      if (filters.amenities && filters.amenities.length > 0) {
        filteredProperties = filteredProperties.filter(p => 
          filters.amenities!.every(amenity => p.amenities.includes(amenity))
        );
      }

      // Apply pagination
      const offset = ((filters.page || 1) - 1) * (filters.limit || 10);
      const paginatedProperties = filteredProperties.slice(offset, offset + (filters.limit || 10));

      console.log(`Found ${filteredProperties.length} properties matching filters`);
      return {
        properties: paginatedProperties,
        total: filteredProperties.length
      };
    } catch (error) {
      console.error('Error searching properties:', error);
      return { properties: [], total: 0 };
    }
  }

  async getPropertyById(propertyId: string): Promise<Property> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.getPropertyById(propertyId);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      const property = mockStorage.properties.find(p => p.id === propertyId);
      if (!property) {
        throw new Error('Property not found');
      }

      // Increment view count
      property.viewsCount = (property.viewsCount || 0) + 1;
      
      console.log('Retrieved property:', property.title);
      return property;
    } catch (error) {
      console.error('Error getting property:', error);
      throw new Error('Failed to get property');
    }
  }

  async getUserProperties(userId: string): Promise<Property[]> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.getUserProperties(userId);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      const properties = mockStorage.properties.filter(p => p.agentId === userId || p.ownerId === userId);
      console.log(`Found ${properties.length} properties for user`);
      return properties;
    } catch (error) {
      console.error('Error getting user properties:', error);
      return [];
    }
  }

  async updateProperty(propertyId: string, updates: Partial<Property>): Promise<Property> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.updateProperty(propertyId, updates);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      const propertyIndex = mockStorage.properties.findIndex(p => p.id === propertyId);
      if (propertyIndex === -1) {
        throw new Error('Property not found');
      }

      mockStorage.properties[propertyIndex] = {
        ...mockStorage.properties[propertyIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      console.log('Updated property:', mockStorage.properties[propertyIndex].title);
      return mockStorage.properties[propertyIndex];
    } catch (error) {
      console.error('Error updating property:', error);
      throw new Error('Failed to update property');
    }
  }

  async deleteProperty(propertyId: string): Promise<void> {
    if (this.useBackend) {
      try {
        await realEstateApiService.deleteProperty(propertyId);
        return;
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      const propertyIndex = mockStorage.properties.findIndex(p => p.id === propertyId);
      if (propertyIndex !== -1) {
        mockStorage.properties.splice(propertyIndex, 1);
        console.log('Property deleted:', propertyId);
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      throw new Error('Failed to delete property');
    }
  }

  // Property Images Management
  async uploadPropertyImages(propertyId: string, images: File[]): Promise<PropertyImage[]> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.uploadPropertyImages(propertyId, images);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      // Mock image upload - in production would upload to cloud storage
      const uploadedImages = images.map((file, index) => ({
        id: `image_${Date.now()}_${index}`,
        propertyId,
        url: URL.createObjectURL(file), // Temporary URL for demo
        caption: file.name,
        order: index,
        isPrimary: index === 0,
        uploadedAt: new Date().toISOString(),
      }));

      console.log(`Uploaded ${uploadedImages.length} images for property ${propertyId}`);
      return uploadedImages;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw new Error('Failed to upload images');
    }
  }

  // Property Viewing Management
  async scheduleViewing(data: any): Promise<PropertyViewing> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.scheduleViewing(data);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      const newViewing = {
        id: `viewing_${Date.now()}`,
        propertyId: data.propertyId,
        clientId: data.clientId,
        agentId: data.agentId,
        scheduledDate: data.scheduledDate,
        duration: data.duration || 60,
        notes: data.notes,
        status: 'scheduled' as const,
        reminderSent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store in mock storage
      if (!mockStorage.propertyViewings) mockStorage.propertyViewings = [];
      mockStorage.propertyViewings.push(newViewing);
      
      console.log('Property viewing scheduled:', newViewing.id);
      return newViewing;
    } catch (error) {
      console.error('Error scheduling viewing:', error);
      throw new Error('Failed to schedule viewing');
    }
  }

  async updateViewingStatus(viewingId: string, status: string): Promise<PropertyViewing> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.updateViewingStatus(viewingId, status);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      if (!mockStorage.propertyViewings) mockStorage.propertyViewings = [];
      const viewingIndex = mockStorage.propertyViewings.findIndex(v => v.id === viewingId);
      if (viewingIndex === -1) {
        throw new Error('Viewing not found');
      }

      mockStorage.propertyViewings[viewingIndex].status = status as any;
      mockStorage.propertyViewings[viewingIndex].updatedAt = new Date().toISOString();

      console.log('Updated viewing status:', status);
      return mockStorage.propertyViewings[viewingIndex];
    } catch (error) {
      console.error('Error updating viewing status:', error);
      throw new Error('Failed to update viewing status');
    }
  }

  async getUserViewings(userId: string): Promise<PropertyViewing[]> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.getUserViewings(userId);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      if (!mockStorage.propertyViewings) mockStorage.propertyViewings = [];
      const viewings = mockStorage.propertyViewings.filter(v => 
        v.clientId === userId || v.agentId === userId
      );
      console.log(`Found ${viewings.length} viewings for user`);
      return viewings;
    } catch (error) {
      console.error('Error getting user viewings:', error);
      return [];
    }
  }

  // Property Inquiry Management
  async submitInquiry(data: any): Promise<PropertyInquiry> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.submitInquiry(data);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      const newInquiry = {
        id: `inquiry_${Date.now()}`,
        propertyId: data.propertyId,
        inquirerId: data.inquirerId,
        message: data.message,
        contactMethod: data.contactMethod,
        urgency: data.urgency || 'medium',
        status: 'new' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store in mock storage
      if (!mockStorage.propertyInquiries) mockStorage.propertyInquiries = [];
      mockStorage.propertyInquiries.push(newInquiry);
      
      console.log('Property inquiry submitted:', newInquiry.id);
      return newInquiry;
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      throw new Error('Failed to submit inquiry');
    }
  }

  // Analytics
  async getRealEstateAnalytics(userId: string): Promise<RealEstateAnalytics> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.getRealEstateAnalytics(userId);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      // Return mock analytics
      const analytics = {
        totalListings: 25,
        activeListings: 18,
        totalViews: 1250,
        totalInquiries: 85,
        totalViewings: 45,
        averageViewsPerListing: 50,
        conversionRate: 15,
        topPerformingListings: [
          { id: '1', title: 'Luxury Apartment', views: 150, inquiries: 12 },
          { id: '2', title: 'Family Home', views: 120, inquiries: 8 }
        ],
        monthlyStats: [
          { month: 'Jan', listings: 5, views: 300, inquiries: 20 },
          { month: 'Feb', listings: 7, views: 450, inquiries: 25 },
          { month: 'Mar', listings: 6, views: 380, inquiries: 18 }
        ],
        priceDistribution: [
          { range: '0-1M', count: 8 },
          { range: '1M-5M', count: 12 },
          { range: '5M+', count: 5 }
        ]
      };
      console.log('Retrieved real estate analytics');
      return analytics;
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw new Error('Failed to get analytics');
    }
  }

  // Utility methods
  async getPropertyTypes(): Promise<PropertyType[]> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.getPropertyTypes();
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    return [
      'apartment', 'house', 'condo', 'townhouse', 'villa', 'studio', 'duplex', 'land'
    ] as PropertyType[];
  }

  async getListingTypes(): Promise<ListingType[]> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.getListingTypes();
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    return ['sale', 'rent', 'lease'] as ListingType[];
  }

  async getUserTypes(): Promise<UserType[]> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.getUserTypes();
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    return ['realtor', 'house_agent', 'house_owner'] as UserType[];
  }

  // Additional API methods
  async getAmenities(): Promise<string[]> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.getAmenities();
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    return [
      'parking', 'swimming_pool', 'gym', 'elevator', 'balcony', 'garden',
      'security', 'ac', 'furnished', 'pet_friendly', 'wifi', 'laundry'
    ];
  }

  async addToFavorites(userId: string, propertyId: string): Promise<void> {
    if (this.useBackend) {
      try {
        await realEstateApiService.addToFavorites(userId, propertyId);
        return;
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation - store in localStorage for demo
    try {
      const favorites = JSON.parse(localStorage.getItem(`favorites_${userId}`) || '[]');
      if (!favorites.includes(propertyId)) {
        favorites.push(propertyId);
        localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
      }
      console.log('Added property to favorites');
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  }

  async removeFromFavorites(userId: string, propertyId: string): Promise<void> {
    if (this.useBackend) {
      try {
        await realEstateApiService.removeFromFavorites(userId, propertyId);
        return;
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      const favorites = JSON.parse(localStorage.getItem(`favorites_${userId}`) || '[]');
      const updatedFavorites = favorites.filter((id: string) => id !== propertyId);
      localStorage.setItem(`favorites_${userId}`, JSON.stringify(updatedFavorites));
      console.log('Removed property from favorites');
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  }

  async getUserFavorites(userId: string): Promise<Property[]> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.getUserFavorites(userId);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    try {
      const favoriteIds = JSON.parse(localStorage.getItem(`favorites_${userId}`) || '[]');
      const favoriteProperties = mockStorage.properties.filter(p => favoriteIds.includes(p.id));
      console.log(`Found ${favoriteProperties.length} favorite properties`);
      return favoriteProperties;
    } catch (error) {
      console.error('Error getting user favorites:', error);
      return [];
    }
  }

  async getMarketInsights(location: string): Promise<any> {
    if (this.useBackend) {
      try {
        return await realEstateApiService.getMarketInsights(location);
      } catch (error) {
        console.warn('Backend failed, falling back to mock data');
        this.useBackend = false;
      }
    }

    // Mock implementation
    return {
      averagePrice: 2500000,
      pricePerSqft: 3500,
      marketTrend: 'rising',
      inventory: 145,
      daysOnMarket: 30,
      priceHistory: [
        { month: 'Jan', price: 2400000 },
        { month: 'Feb', price: 2450000 },
        { month: 'Mar', price: 2500000 }
      ],
      comparableProperties: []
    };
  }
}

export const realEstateService = new RealEstateService();
export { RealEstateService };
export default realEstateService;
