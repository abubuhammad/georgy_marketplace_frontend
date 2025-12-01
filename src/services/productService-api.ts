import { apiClient, ApiResponse } from '@/lib/apiClient';
import { Product, SearchFilters, PaginatedResponse } from '@/types';

export interface CreateProductData {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  price: number;
  originalPrice?: number;
  condition: 'new' | 'used' | 'refurbished';
  brand?: string;
  model?: string;
  locationCity: string;
  locationState: string;
  locationCountry?: string;
  isNegotiable: boolean;
  images: File[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

// Backend API response types
interface BackendProductResponse {
  success: boolean;
  data: {
    product: Product;
  };
}

interface BackendProductsResponse {
  success: boolean;
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ProductApiService {
  // Create new product
  async createProduct(userId: string, productData: CreateProductData) {
    try {
      const response = await apiClient.post<BackendProductResponse>('/products', {
        ...productData,
        sellerId: userId
      });
      
      return { data: response.data?.product || null, error: null };
    } catch (error: any) {
      console.error('Error creating product:', error);
      return { data: null, error: error.message || 'Failed to create product' };
    }
  }

  // Get paginated products with filters  
  async getProducts(filters: SearchFilters = {}): Promise<{ data: PaginatedResponse<Product> | null; error: string | null }> {
    try {
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
      
      const response = await apiClient.get<BackendProductsResponse>(endpoint, false);
      
      // Return structure that matches what productService expects
      return {
        data: {
          data: response.data || [],
          pagination: {
            page: response.page || 1,
            limit: response.limit || 20,
            total: response.total || 0,
            pages: response.totalPages || 1
          }
        },
        error: null
      };
    } catch (error: any) {
      console.error('Error fetching products:', error);
      return {
        data: null,
        error: error.message || 'Failed to fetch products'
      };
    }
  }

  // Get single product by ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Product }>(`/products/${id}`, false);
      return response.data || null;
    } catch (error: any) {
      console.error('Error getting product:', error);
      return null;
    }
  }

  // Update product
  async updateProduct(productData: UpdateProductData) {
    try {
      const { id, ...updateData } = productData;
      const response = await apiClient.put<BackendProductResponse>(`/products/${id}`, updateData);
      
      return { data: response.data?.product || null, error: null };
    } catch (error: any) {
      console.error('Error updating product:', error);
      return { data: null, error: error.message || 'Failed to update product' };
    }
  }

  // Delete product
  async deleteProduct(id: string) {
    try {
      await apiClient.delete<ApiResponse<any>>(`/products/${id}`);
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message || 'Failed to delete product' };
    }
  }

  // Get products by seller
  async getSellerProducts(sellerId: string): Promise<Product[]> {
    try {
      const response = await apiClient.get<BackendProductsResponse>(`/products?sellerId=${sellerId}`);
      return response.data || [];
    } catch (error: any) {
      console.error('Error getting seller products:', error);
      return [];
    }
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      const response = await apiClient.get<BackendProductsResponse>(`/products?featured=true&limit=${limit}`, false);
      return response.data || [];
    } catch (error: any) {
      console.error('Error getting featured products:', error);
      return [];
    }
  }

  // Search suggestions
  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: { suggestions: string[] };
      }>(`/products/suggestions?q=${encodeURIComponent(query)}`, false);
      
      return response.data?.suggestions || [];
    } catch (error: any) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }
}

export const productApiService = new ProductApiService();
export default productApiService;
