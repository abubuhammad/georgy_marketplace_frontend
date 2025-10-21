import { apiClient } from '@/lib/apiClient';
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

class RealEstateApiService {
  // Professional Management
  async registerProfessional(userId: string, data: any): Promise<RealEstateProfessional> {
    try {
      const response = await apiClient.post('/real-estate/professionals/register', {
        userId,
        ...data
      });
      return response.data.professional;
    } catch (error) {
      console.error('Error registering professional:', error);
      throw new Error('Failed to register professional');
    }
  }

  async getProfessional(userId: string): Promise<RealEstateProfessional> {
    try {
      const response = await apiClient.get(`/real-estate/professionals/${userId}`);
      return response.data.professional;
    } catch (error) {
      console.error('Error getting professional:', error);
      throw new Error('Failed to get professional');
    }
  }

  async updateProfessional(userId: string, updates: Partial<RealEstateProfessional>): Promise<RealEstateProfessional> {
    try {
      const response = await apiClient.put(`/real-estate/professionals/${userId}`, updates);
      return response.data.professional;
    } catch (error) {
      console.error('Error updating professional:', error);
      throw new Error('Failed to update professional');
    }
  }

  async verifyProfessional(userId: string): Promise<RealEstateProfessional> {
    try {
      const response = await apiClient.put(`/real-estate/professionals/${userId}/verify`);
      return response.data.professional;
    } catch (error) {
      console.error('Error verifying professional:', error);
      throw new Error('Failed to verify professional');
    }
  }

  // Property Management
  async createProperty(ownerId: string, data: any): Promise<Property> {
    try {
      const response = await apiClient.post('/real-estate/properties', {
        ownerId,
        ...data
      });
      return response.data.property;
    } catch (error) {
      console.error('Error creating property:', error);
      throw new Error('Failed to create property');
    }
  }

  async searchProperties(filters: PropertySearchFilters): Promise<{ properties: Property[]; total: number }> {
    try {
      const response = await apiClient.get('/real-estate/properties', { params: filters });
      return {
        properties: response.data.properties,
        total: response.data.total
      };
    } catch (error) {
      console.error('Error searching properties:', error);
      return { properties: [], total: 0 };
    }
  }

  async getPropertyById(propertyId: string): Promise<Property> {
    try {
      const response = await apiClient.get(`/real-estate/properties/${propertyId}`);
      return response.data.property;
    } catch (error) {
      console.error('Error getting property:', error);
      throw new Error('Failed to get property');
    }
  }

  async getUserProperties(userId: string): Promise<Property[]> {
    try {
      const response = await apiClient.get(`/real-estate/professionals/${userId}/properties`);
      return response.data.properties;
    } catch (error) {
      console.error('Error getting user properties:', error);
      return [];
    }
  }

  async updateProperty(propertyId: string, updates: Partial<Property>): Promise<Property> {
    try {
      const response = await apiClient.put(`/real-estate/properties/${propertyId}`, updates);
      return response.data.property;
    } catch (error) {
      console.error('Error updating property:', error);
      throw new Error('Failed to update property');
    }
  }

  async deleteProperty(propertyId: string): Promise<void> {
    try {
      await apiClient.delete(`/real-estate/properties/${propertyId}`);
    } catch (error) {
      console.error('Error deleting property:', error);
      throw new Error('Failed to delete property');
    }
  }

  async togglePropertyStatus(propertyId: string): Promise<Property> {
    try {
      const response = await apiClient.put(`/real-estate/properties/${propertyId}/toggle-status`);
      return response.data.property;
    } catch (error) {
      console.error('Error toggling property status:', error);
      throw new Error('Failed to toggle property status');
    }
  }

  async featureProperty(propertyId: string, duration: number): Promise<Property> {
    try {
      const response = await apiClient.put(`/real-estate/properties/${propertyId}/feature`, { duration });
      return response.data.property;
    } catch (error) {
      console.error('Error featuring property:', error);
      throw new Error('Failed to feature property');
    }
  }

  // Property Images Management
  async uploadPropertyImages(propertyId: string, images: File[]): Promise<PropertyImage[]> {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`images`, image);
      });
      formData.append('propertyId', propertyId);

      const response = await apiClient.post(`/real-estate/properties/${propertyId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.images;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw new Error('Failed to upload images');
    }
  }

  async deletePropertyImage(imageId: string): Promise<void> {
    try {
      await apiClient.delete(`/real-estate/property-images/${imageId}`);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  async setPrimaryImage(imageId: string): Promise<PropertyImage> {
    try {
      const response = await apiClient.put(`/real-estate/property-images/${imageId}/set-primary`);
      return response.data.image;
    } catch (error) {
      console.error('Error setting primary image:', error);
      throw new Error('Failed to set primary image');
    }
  }

  // Property Documents Management
  async uploadPropertyDocuments(propertyId: string, documents: File[]): Promise<PropertyDocument[]> {
    try {
      const formData = new FormData();
      documents.forEach((document, index) => {
        formData.append(`documents`, document);
      });
      formData.append('propertyId', propertyId);

      const response = await apiClient.post(`/real-estate/properties/${propertyId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.documents;
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw new Error('Failed to upload documents');
    }
  }

  // Property Viewing Management
  async scheduleViewing(data: any): Promise<PropertyViewing> {
    try {
      const response = await apiClient.post('/real-estate/viewings', data);
      return response.data.viewing;
    } catch (error) {
      console.error('Error scheduling viewing:', error);
      throw new Error('Failed to schedule viewing');
    }
  }

  async updateViewingStatus(viewingId: string, status: string): Promise<PropertyViewing> {
    try {
      const response = await apiClient.put(`/real-estate/viewings/${viewingId}`, { status });
      return response.data.viewing;
    } catch (error) {
      console.error('Error updating viewing status:', error);
      throw new Error('Failed to update viewing status');
    }
  }

  async getUserViewings(userId: string): Promise<PropertyViewing[]> {
    try {
      const response = await apiClient.get(`/real-estate/users/${userId}/viewings`);
      return response.data.viewings;
    } catch (error) {
      console.error('Error getting user viewings:', error);
      return [];
    }
  }

  async rescheduleViewing(viewingId: string, newDate: string): Promise<PropertyViewing> {
    try {
      const response = await apiClient.put(`/real-estate/viewings/${viewingId}/reschedule`, { 
        scheduledDate: newDate 
      });
      return response.data.viewing;
    } catch (error) {
      console.error('Error rescheduling viewing:', error);
      throw new Error('Failed to reschedule viewing');
    }
  }

  async cancelViewing(viewingId: string, reason?: string): Promise<void> {
    try {
      await apiClient.put(`/real-estate/viewings/${viewingId}/cancel`, { reason });
    } catch (error) {
      console.error('Error canceling viewing:', error);
      throw new Error('Failed to cancel viewing');
    }
  }

  // Property Inquiry Management
  async submitInquiry(data: any): Promise<PropertyInquiry> {
    try {
      const response = await apiClient.post('/real-estate/inquiries', data);
      return response.data.inquiry;
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      throw new Error('Failed to submit inquiry');
    }
  }

  async getInquiries(filters: any): Promise<{ inquiries: PropertyInquiry[]; total: number }> {
    try {
      const response = await apiClient.get('/real-estate/inquiries', { params: filters });
      return {
        inquiries: response.data.inquiries,
        total: response.data.total
      };
    } catch (error) {
      console.error('Error getting inquiries:', error);
      return { inquiries: [], total: 0 };
    }
  }

  async updateInquiryStatus(inquiryId: string, status: string): Promise<PropertyInquiry> {
    try {
      const response = await apiClient.put(`/real-estate/inquiries/${inquiryId}`, { status });
      return response.data.inquiry;
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      throw new Error('Failed to update inquiry status');
    }
  }

  async respondToInquiry(inquiryId: string, response: string): Promise<PropertyInquiry> {
    try {
      const responseData = await apiClient.put(`/real-estate/inquiries/${inquiryId}/respond`, { 
        response 
      });
      return responseData.data.inquiry;
    } catch (error) {
      console.error('Error responding to inquiry:', error);
      throw new Error('Failed to respond to inquiry');
    }
  }

  // Virtual Tours
  async uploadVirtualTour(propertyId: string, tourData: any): Promise<any> {
    try {
      const response = await apiClient.post(`/real-estate/properties/${propertyId}/virtual-tour`, tourData);
      return response.data.tour;
    } catch (error) {
      console.error('Error uploading virtual tour:', error);
      throw new Error('Failed to upload virtual tour');
    }
  }

  async getVirtualTour(propertyId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/real-estate/properties/${propertyId}/virtual-tour`);
      return response.data.tour;
    } catch (error) {
      console.error('Error getting virtual tour:', error);
      return null;
    }
  }

  // Analytics
  async getRealEstateAnalytics(userId: string): Promise<RealEstateAnalytics> {
    try {
      const response = await apiClient.get(`/real-estate/professionals/${userId}/analytics`);
      return response.data.analytics;
    } catch (error) {
      console.error('Error getting analytics:', error);
      // Fallback to mock analytics
      return {
        totalListings: 0,
        activeListings: 0,
        totalViews: 0,
        totalInquiries: 0,
        totalViewings: 0,
        averageViewsPerListing: 0,
        conversionRate: 0,
        topPerformingListings: [],
        monthlyStats: [],
        priceDistribution: []
      };
    }
  }

  async getPropertyAnalytics(propertyId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/real-estate/properties/${propertyId}/analytics`);
      return response.data.analytics;
    } catch (error) {
      console.error('Error getting property analytics:', error);
      return {
        views: 0,
        inquiries: 0,
        viewings: 0,
        favorites: 0,
        dailyViews: [],
        inquiryTrends: []
      };
    }
  }

  // Market Data
  async getMarketInsights(location: string): Promise<any> {
    try {
      const response = await apiClient.get('/real-estate/market/insights', { 
        params: { location } 
      });
      return response.data.insights;
    } catch (error) {
      console.error('Error getting market insights:', error);
      return {
        averagePrice: 0,
        pricePerSqft: 0,
        marketTrend: 'stable',
        inventory: 0,
        daysOnMarket: 0,
        priceHistory: [],
        comparableProperties: []
      };
    }
  }

  // Utility methods
  async getPropertyTypes(): Promise<PropertyType[]> {
    try {
      const response = await apiClient.get('/real-estate/property-types');
      return response.data.types;
    } catch (error) {
      console.error('Error getting property types:', error);
      // Fallback to hardcoded types
      return [
        'apartment', 'house', 'condo', 'townhouse', 'villa', 'studio', 'duplex', 'land'
      ] as PropertyType[];
    }
  }

  async getListingTypes(): Promise<ListingType[]> {
    try {
      const response = await apiClient.get('/real-estate/listing-types');
      return response.data.types;
    } catch (error) {
      console.error('Error getting listing types:', error);
      // Fallback to hardcoded types
      return ['sale', 'rent', 'lease'] as ListingType[];
    }
  }

  async getUserTypes(): Promise<UserType[]> {
    try {
      const response = await apiClient.get('/real-estate/user-types');
      return response.data.types;
    } catch (error) {
      console.error('Error getting user types:', error);
      // Fallback to hardcoded types
      return ['realtor', 'house_agent', 'house_owner'] as UserType[];
    }
  }

  async getAmenities(): Promise<string[]> {
    try {
      const response = await apiClient.get('/real-estate/amenities');
      return response.data.amenities;
    } catch (error) {
      console.error('Error getting amenities:', error);
      // Fallback to hardcoded amenities
      return [
        'parking', 'swimming_pool', 'gym', 'elevator', 'balcony', 'garden',
        'security', 'ac', 'furnished', 'pet_friendly', 'wifi', 'laundry'
      ];
    }
  }

  // Property Favorites
  async addToFavorites(userId: string, propertyId: string): Promise<void> {
    try {
      await apiClient.post('/real-estate/favorites', { userId, propertyId });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw new Error('Failed to add to favorites');
    }
  }

  async removeFromFavorites(userId: string, propertyId: string): Promise<void> {
    try {
      await apiClient.delete(`/real-estate/favorites/${userId}/${propertyId}`);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw new Error('Failed to remove from favorites');
    }
  }

  async getUserFavorites(userId: string): Promise<Property[]> {
    try {
      const response = await apiClient.get(`/real-estate/users/${userId}/favorites`);
      return response.data.properties;
    } catch (error) {
      console.error('Error getting user favorites:', error);
      return [];
    }
  }
}

export const realEstateApiService = new RealEstateApiService();
export default realEstateApiService;
