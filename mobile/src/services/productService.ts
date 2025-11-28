import { apiClient, ApiError } from '../lib/apiClient';
import { Product } from '../types/Product';
import { Category } from '../types/Category';

export interface SearchFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  condition?: 'new' | 'used' | 'refurbished';
  location?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Mock data fallback
const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Electronics', icon: 'phone-portrait-outline' },
  { id: '2', name: 'Fashion', icon: 'shirt-outline' },
  { id: '3', name: 'Home & Garden', icon: 'home-outline' },
  { id: '4', name: 'Sports', icon: 'football-outline' },
  { id: '5', name: 'Books', icon: 'book-outline' },
  { id: '6', name: 'Beauty', icon: 'flower-outline' },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 45000,
    image: 'https://via.placeholder.com/200',
    rating: 4.5,
    seller_id: 'seller1',
    description: 'High-quality wireless headphones with noise cancellation',
    category: 'Electronics',
    location: 'Lagos',
    condition: 'new'
  },
  {
    id: '2',
    name: 'Smart Watch',
    price: 125000,
    image: 'https://via.placeholder.com/200',
    rating: 4.8,
    seller_id: 'seller2',
    description: 'Feature-rich smartwatch with health monitoring',
    category: 'Electronics',
    location: 'Abuja',
    condition: 'new'
  },
  {
    id: '3',
    name: 'Designer Dress',
    price: 35000,
    image: 'https://via.placeholder.com/200',
    rating: 4.3,
    seller_id: 'seller3',
    description: 'Elegant designer dress for special occasions',
    category: 'Fashion',
    location: 'Port Harcourt',
    condition: 'new'
  },
  {
    id: '4',
    name: 'Coffee Maker',
    price: 28000,
    image: 'https://via.placeholder.com/200',
    rating: 4.6,
    seller_id: 'seller4',
    description: 'Automatic coffee maker with programmable settings',
    category: 'Home & Garden',
    location: 'Kano',
    condition: 'new'
  }
];

class ProductService {
  // Get categories
  async getCategories(): Promise<Category[]> {
    try {
      // Try API first
      const isBackendReachable = await apiClient.isBackendReachable();
      if (isBackendReachable) {
        const response = await apiClient.get<{
          success: boolean;
          data: Category[];
        }>('/products/categories', false);
        
        if (response.success && response.data) {
          return response.data;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch categories from API, using mock data:', error);
    }

    // Fallback to mock data
    return MOCK_CATEGORIES;
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      // Try API first
      const isBackendReachable = await apiClient.isBackendReachable();
      if (isBackendReachable) {
        const response = await apiClient.get<{
          success: boolean;
          data: Product[];
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        }>(`/products?featured=true&limit=${limit}`, false);
        
        if (response.success && response.data) {
          return response.data;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch featured products from API, using mock data:', error);
    }

    // Fallback to mock data
    return MOCK_PRODUCTS.slice(0, limit);
  }

  // Search products with filters
  async searchProducts(filters: SearchFilters = {}): Promise<PaginatedResponse<Product>> {
    try {
      // Try API first
      const isBackendReachable = await apiClient.isBackendReachable();
      if (isBackendReachable) {
        // Build query parameters
        const params = new URLSearchParams();
        
        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
        if (filters.brand) params.append('brand', filters.brand);
        if (filters.condition) params.append('condition', filters.condition);
        if (filters.location) params.append('location', filters.location);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());

        const queryString = params.toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';
        
        const response = await apiClient.get<{
          success: boolean;
          data: Product[];
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        }>(endpoint, false);
        
        if (response.success) {
          return {
            data: response.data || [],
            total: response.total || 0,
            page: response.page || 1,
            limit: response.limit || 20,
            totalPages: response.totalPages || 1
          };
        }
      }
    } catch (error) {
      console.warn('Failed to search products from API, using mock data:', error);
    }

    // Fallback to mock data with basic filtering
    let filteredProducts = [...MOCK_PRODUCTS];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      filteredProducts = filteredProducts.filter(product =>
        product.category === filters.category
      );
    }

    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product =>
        product.price >= filters.minPrice!
      );
    }

    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product =>
        product.price <= filters.maxPrice!
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
        default:
          // Already in newest order
          break;
      }
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredProducts.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: filteredProducts.length,
      page,
      limit,
      totalPages: Math.ceil(filteredProducts.length / limit)
    };
  }

  // Get single product by ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      // Try API first
      const isBackendReachable = await apiClient.isBackendReachable();
      if (isBackendReachable) {
        const response = await apiClient.get<{
          success: boolean;
          data: { product: Product };
        }>(`/products/${id}`, false);
        
        if (response.success && response.data?.product) {
          return response.data.product;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch product from API, using mock data:', error);
    }

    // Fallback to mock data
    return MOCK_PRODUCTS.find(product => product.id === id) || null;
  }
}

export const productService = new ProductService();
export default productService;
