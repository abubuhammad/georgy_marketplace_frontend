import { apiClient } from '../lib/apiClient';
import { Artisan, ServiceCategory, ServiceRequest } from '../types/Artisan';

export interface ArtisanFilters {
  category?: string;
  location?: string;
  rating?: number;
  availability?: 'available' | 'busy' | 'offline';
  search?: string;
  page?: number;
  limit?: number;
}

export interface ServiceRequestData {
  title: string;
  description: string;
  category: string;
  location?: string;
  budget_min?: number;
  budget_max?: number;
  urgency: 'low' | 'medium' | 'high';
  preferred_date?: string;
  images?: string[];
  artisan_id?: string;
}

// Mock data fallback
const MOCK_CATEGORIES: ServiceCategory[] = [
  { id: '1', name: 'Plumbing', icon: 'water-outline' },
  { id: '2', name: 'Electrical', icon: 'flash-outline' },
  { id: '3', name: 'Carpentry', icon: 'hammer-outline' },
  { id: '4', name: 'Cleaning', icon: 'brush-outline' },
  { id: '5', name: 'Painting', icon: 'color-palette-outline' },
  { id: '6', name: 'HVAC', icon: 'thermometer-outline' },
  { id: '7', name: 'Beauty', icon: 'cut-outline' },
  { id: '8', name: 'Gardening', icon: 'leaf-outline' },
];

const MOCK_ARTISANS: Artisan[] = [
  {
    id: '1',
    user_id: 'user1',
    business_name: 'Quick Fix Plumbing',
    description: 'Professional plumbing services with 10+ years experience. Specializing in pipe repairs, installations, and emergency services.',
    service_categories: ['Plumbing'],
    location: 'Lagos Island, Lagos',
    rating: 4.8,
    completed_jobs: 124,
    hourly_rate: 5000,
    availability_status: 'available',
    profile_image: 'https://via.placeholder.com/100',
    verified: true,
    phone: '+234123456789',
    email: 'quickfix@example.com'
  },
  {
    id: '2',
    user_id: 'user2',
    business_name: 'Elite Electrical Services',
    description: 'Licensed electrician for residential and commercial work. Available for installations, repairs, and emergency callouts.',
    service_categories: ['Electrical'],
    location: 'Victoria Island, Lagos',
    rating: 4.9,
    completed_jobs: 89,
    hourly_rate: 6000,
    availability_status: 'available',
    profile_image: 'https://via.placeholder.com/100',
    verified: true,
    phone: '+234123456790',
    email: 'elite@example.com'
  },
  {
    id: '3',
    user_id: 'user3',
    business_name: 'Master Carpenter',
    description: 'Expert carpenter with specialization in custom furniture and home improvements. Quality workmanship guaranteed.',
    service_categories: ['Carpentry'],
    location: 'Ikeja, Lagos',
    rating: 4.7,
    completed_jobs: 156,
    hourly_rate: 4500,
    availability_status: 'busy',
    profile_image: 'https://via.placeholder.com/100',
    verified: true,
    phone: '+234123456791',
    email: 'carpenter@example.com'
  },
  {
    id: '4',
    user_id: 'user4',
    business_name: 'Sparkle Cleaning',
    description: 'Professional cleaning services for homes and offices. Eco-friendly products and thorough cleaning guaranteed.',
    service_categories: ['Cleaning'],
    location: 'Surulere, Lagos',
    rating: 4.6,
    completed_jobs: 203,
    hourly_rate: 3000,
    availability_status: 'available',
    profile_image: 'https://via.placeholder.com/100',
    verified: true,
    phone: '+234123456792',
    email: 'sparkle@example.com'
  },
  {
    id: '5',
    user_id: 'user5',
    business_name: 'Beauty Pro',
    description: 'Professional beauty services including hair styling, makeup, and nail care. Mobile services available.',
    service_categories: ['Beauty'],
    location: 'Lekki, Lagos',
    rating: 4.9,
    completed_jobs: 78,
    hourly_rate: 8000,
    availability_status: 'available',
    profile_image: 'https://via.placeholder.com/100',
    verified: true,
    phone: '+234123456793',
    email: 'beauty@example.com'
  }
];

class ArtisanService {
  // Get service categories
  async getServiceCategories(): Promise<ServiceCategory[]> {
    try {
      // Try API first
      const isBackendReachable = await apiClient.isBackendReachable();
      if (isBackendReachable) {
        const response = await apiClient.get<{
          success: boolean;
          data: { categories: ServiceCategory[] };
        }>('/artisans/categories', false);
        
        if (response.success && response.data?.categories) {
          return response.data.categories;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch service categories from API, using mock data:', error);
    }

    // Fallback to mock data
    return MOCK_CATEGORIES;
  }

  // Search artisans with filters
  async searchArtisans(filters: ArtisanFilters = {}): Promise<{ artisans: Artisan[]; total: number }> {
    try {
      // Try API first
      const isBackendReachable = await apiClient.isBackendReachable();
      if (isBackendReachable) {
        // Build query parameters
        const params = new URLSearchParams();
        
        if (filters.category) params.append('category', filters.category);
        if (filters.location) params.append('location', filters.location);
        if (filters.rating) params.append('rating', filters.rating.toString());
        if (filters.availability) params.append('availability', filters.availability);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());

        const queryString = params.toString();
        const endpoint = queryString ? `/artisans?${queryString}` : '/artisans';
        
        const response = await apiClient.get<{
          success: boolean;
          data: { artisans: Artisan[]; total: number };
        }>(endpoint, false);
        
        if (response.success && response.data) {
          return {
            artisans: response.data.artisans || [],
            total: response.data.total || 0
          };
        }
      }
    } catch (error) {
      console.warn('Failed to search artisans from API, using mock data:', error);
    }

    // Fallback to mock data with basic filtering
    let filteredArtisans = [...MOCK_ARTISANS];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredArtisans = filteredArtisans.filter(artisan =>
        artisan.business_name.toLowerCase().includes(searchLower) ||
        artisan.description.toLowerCase().includes(searchLower) ||
        artisan.service_categories.some(cat => cat.toLowerCase().includes(searchLower))
      );
    }

    if (filters.category) {
      filteredArtisans = filteredArtisans.filter(artisan =>
        artisan.service_categories.includes(filters.category!)
      );
    }

    if (filters.location) {
      filteredArtisans = filteredArtisans.filter(artisan =>
        artisan.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.availability) {
      filteredArtisans = filteredArtisans.filter(artisan =>
        artisan.availability_status === filters.availability
      );
    }

    if (filters.rating) {
      filteredArtisans = filteredArtisans.filter(artisan =>
        artisan.rating >= filters.rating!
      );
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredArtisans.slice(startIndex, endIndex);

    return {
      artisans: paginatedData,
      total: filteredArtisans.length
    };
  }

  // Get artisan by ID
  async getArtisanById(id: string): Promise<Artisan | null> {
    try {
      // Try API first
      const isBackendReachable = await apiClient.isBackendReachable();
      if (isBackendReachable) {
        const response = await apiClient.get<{
          success: boolean;
          data: { artisan: Artisan };
        }>(`/artisans/${id}`, false);
        
        if (response.success && response.data?.artisan) {
          return response.data.artisan;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch artisan from API, using mock data:', error);
    }

    // Fallback to mock data
    return MOCK_ARTISANS.find(artisan => artisan.id === id) || null;
  }

  // Create service request
  async createServiceRequest(data: ServiceRequestData): Promise<ServiceRequest> {
    try {
      // Try API first
      const isBackendReachable = await apiClient.isBackendReachable();
      if (isBackendReachable) {
        const response = await apiClient.post<{
          success: boolean;
          data: { request: ServiceRequest };
        }>('/artisans/service-requests', data);
        
        if (response.success && response.data?.request) {
          return response.data.request;
        }
      }
    } catch (error) {
      console.warn('Failed to create service request via API, creating mock request:', error);
    }

    // Fallback to mock creation
    const mockRequest: ServiceRequest = {
      id: `req_${Date.now()}`,
      customer_id: 'current_user', // Would be from auth context
      title: data.title,
      description: data.description,
      category: data.category,
      location: data.location || 'Lagos, Nigeria',
      budget_min: data.budget_min,
      budget_max: data.budget_max,
      urgency: data.urgency,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: data.images || [],
      artisan_id: data.artisan_id
    };

    return mockRequest;
  }

  // Get service requests for customer
  async getCustomerServiceRequests(customerId: string): Promise<ServiceRequest[]> {
    try {
      // Try API first
      const isBackendReachable = await apiClient.isBackendReachable();
      if (isBackendReachable) {
        const response = await apiClient.get<{
          success: boolean;
          data: { requests: ServiceRequest[] };
        }>(`/artisans/service-requests?customerId=${customerId}`);
        
        if (response.success && response.data?.requests) {
          return response.data.requests;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch service requests from API, using mock data:', error);
    }

    // Fallback to mock data
    return [
      {
        id: '1',
        customer_id: customerId,
        title: 'Fix leaking kitchen pipe',
        description: 'Kitchen sink pipe is leaking and needs immediate repair',
        category: 'Plumbing',
        location: 'Lagos Island',
        budget_min: 5000,
        budget_max: 15000,
        urgency: 'high',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: []
      }
    ];
  }
}

export const artisanService = new ArtisanService();
export default artisanService;
