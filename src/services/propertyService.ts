import { apiClient } from '@/lib/api-client';

export interface CreatePropertyData {
  title: string;
  description: string;
  type: 'sale' | 'lease' | 'rent';
  propertyType: 'house' | 'apartment' | 'commercial' | 'land';
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  location: string;
  address: string;
  latitude?: number;
  longitude?: number;
  images?: File[];
  virtualTour?: string;
  amenities?: string[];
  agentId?: string;
}

export interface PropertySearchFilters {
  search?: string;
  type?: 'sale' | 'lease' | 'rent';
  propertyType?: 'house' | 'apartment' | 'commercial' | 'land';
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  location?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'area';
  page?: number;
  limit?: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: 'sale' | 'lease' | 'rent';
  propertyType: 'house' | 'apartment' | 'commercial' | 'land';
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  location: string;
  address: string;
  latitude?: number;
  longitude?: number;
  images: string;
  virtualTour?: string;
  amenities?: string;
  ownerId: string;
  agentId?: string;
  featured: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  viewings?: any[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class PropertyService {
  // Get paginated properties with filters
  async getProperties(filters: PropertySearchFilters = {}): Promise<{ data: PaginatedResponse<Property> | null; error: string | null }> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.type) params.append('type', filters.type);
      if (filters.propertyType) params.append('propertyType', filters.propertyType);
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.bedrooms !== undefined) params.append('bedrooms', filters.bedrooms.toString());
      if (filters.bathrooms !== undefined) params.append('bathrooms', filters.bathrooms.toString());
      if (filters.minArea !== undefined) params.append('minArea', filters.minArea.toString());
      if (filters.maxArea !== undefined) params.append('maxArea', filters.maxArea.toString());
      if (filters.location) params.append('location', filters.location);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const endpoint = queryString ? `/real-estate/properties?${queryString}` : '/real-estate/properties';
      
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Property>>>(endpoint);
      
      return {
        data: response.data || null,
        error: null
      };
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      return {
        data: null,
        error: error.message || 'Failed to fetch properties'
      };
    }
  }

  // Get single property by ID
  async getPropertyById(id: string): Promise<Property | null> {
    try {
      const response = await apiClient.get<ApiResponse<Property>>(`/real-estate/properties/${id}`);
      return response.data || null;
    } catch (error: any) {
      console.error('Error getting property:', error);
      return null;
    }
  }

  // Create new property
  async createProperty(propertyData: CreatePropertyData): Promise<{ data: Property | null; error: string | null }> {
    try {
      let imageUrls: string[] = [];

      // Upload images if present
      if (propertyData.images && propertyData.images.length > 0) {
        const formData = new FormData();
        propertyData.images.forEach((file) => {
          if (file instanceof File) {
            formData.append('images', file);
          }
        });

        try {
          const uploadResponse = await apiClient.post('/upload/multiple', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          if (uploadResponse.success && uploadResponse.data) {
            imageUrls = uploadResponse.data.map((img: any) => img.imageUrl);
          }
        } catch (uploadError) {
          console.warn('Image upload failed, proceeding without images:', uploadError);
          // Continue with property creation even if image upload fails
        }
      }

      const propertyDataWithImageUrls = {
        ...propertyData,
        images: imageUrls
      };

      const response = await apiClient.post<ApiResponse<Property>>('/real-estate/properties', propertyDataWithImageUrls);
      
      return {
        data: response.data || null,
        error: null
      };
    } catch (error: any) {
      console.error('Error creating property:', error);
      return {
        data: null,
        error: error.message || 'Failed to create property'
      };
    }
  }

  // Update property
  async updateProperty(id: string, propertyData: Partial<CreatePropertyData>): Promise<{ data: Property | null; error: string | null }> {
    try {
      // Handle image uploads if present
      const updateData = {
        ...propertyData,
        images: propertyData.images?.map((file, index) => {
          if (file instanceof File) {
            return `/api/placeholder/600/400?id=${Date.now()}_${index}`;
          }
          return file;
        }) as string[]
      };

      const response = await apiClient.put<ApiResponse<Property>>(`/real-estate/properties/${id}`, updateData);
      
      return {
        data: response.data || null,
        error: null
      };
    } catch (error: any) {
      console.error('Error updating property:', error);
      return {
        data: null,
        error: error.message || 'Failed to update property'
      };
    }
  }

  // Delete property
  async deleteProperty(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await apiClient.delete<ApiResponse<any>>(`/real-estate/properties/${id}`);
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error deleting property:', error);
      return { success: false, error: error.message || 'Failed to delete property' };
    }
  }

  // Get user's properties
  async getUserProperties(): Promise<Property[]> {
    try {
      const response = await apiClient.get<ApiResponse<Property[]>>('/real-estate/user/properties');
      return response.data || [];
    } catch (error: any) {
      console.error('Error getting user properties:', error);
      return [];
    }
  }

  // Schedule property viewing
  async scheduleViewing(propertyId: string, scheduledAt: string, notes?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await apiClient.post<ApiResponse<any>>(`/real-estate/properties/${propertyId}/viewing`, {
        scheduledAt,
        notes
      });
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error scheduling viewing:', error);
      return { success: false, error: error.message || 'Failed to schedule viewing' };
    }
  }

  // Get featured properties
  async getFeaturedProperties(limit: number = 8): Promise<Property[]> {
    try {
      const response = await this.getProperties({ limit });
      if (response.data?.data) {
        // Filter for featured properties or return first few
        return response.data.data.filter(p => p.featured).slice(0, limit) || response.data.data.slice(0, limit);
      }
      return [];
    } catch (error: any) {
      console.error('Error getting featured properties:', error);
      return [];
    }
  }
}

export const propertyService = new PropertyService();
export default propertyService;