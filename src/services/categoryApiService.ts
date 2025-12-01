import { apiClient } from '@/lib/apiClient';

export interface CategoryMetadata {
  icon: string;
  color: string;
  type: 'product' | 'property';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  metadata?: CategoryMetadata;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

interface CategoryResponse {
  success: boolean;
  data: Category;
}

class CategoryApiService {
  // Get all categories
  async getCategories(type?: 'product' | 'property'): Promise<{ data: Category[] | null; error: string | null }> {
    try {
      const endpoint = type ? `/categories?type=${type}` : '/categories';
      const response = await apiClient.get<CategoriesResponse>(endpoint, false);
      return { data: response.data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      return { data: null, error: error.message || 'Failed to fetch categories' };
    }
  }

  // Get main/root categories (no parent)
  async getMainCategories(type?: 'product' | 'property'): Promise<{ data: Category[] | null; error: string | null }> {
    try {
      const endpoint = type ? `/categories/main?type=${type}` : '/categories/main';
      const response = await apiClient.get<CategoriesResponse>(endpoint, false);
      return { data: response.data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching main categories:', error);
      return { data: null, error: error.message || 'Failed to fetch main categories' };
    }
  }

  // Get product categories
  async getProductCategories(): Promise<{ data: Category[] | null; error: string | null }> {
    return this.getMainCategories('product');
  }

  // Get property categories  
  async getPropertyCategories(): Promise<{ data: Category[] | null; error: string | null }> {
    return this.getMainCategories('property');
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<{ data: Category | null; error: string | null }> {
    try {
      const response = await apiClient.get<CategoryResponse>(`/categories/${id}`, false);
      return { data: response.data || null, error: null };
    } catch (error: any) {
      console.error('Error fetching category:', error);
      return { data: null, error: error.message || 'Failed to fetch category' };
    }
  }

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<{ data: Category | null; error: string | null }> {
    try {
      const response = await apiClient.get<CategoryResponse>(`/categories/slug/${slug}`, false);
      return { data: response.data || null, error: null };
    } catch (error: any) {
      console.error('Error fetching category:', error);
      return { data: null, error: error.message || 'Failed to fetch category' };
    }
  }

  // Get subcategories
  async getSubcategories(parentId: string): Promise<{ data: Category[] | null; error: string | null }> {
    try {
      const response = await apiClient.get<CategoriesResponse>(`/categories/${parentId}/subcategories`, false);
      return { data: response.data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching subcategories:', error);
      return { data: null, error: error.message || 'Failed to fetch subcategories' };
    }
  }

  // Admin: Create category
  async createCategory(categoryData: {
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    icon?: string;
    color?: string;
    type?: 'product' | 'property';
  }): Promise<{ data: Category | null; error: string | null }> {
    try {
      const response = await apiClient.post<CategoryResponse>('/categories', categoryData);
      return { data: response.data || null, error: null };
    } catch (error: any) {
      console.error('Error creating category:', error);
      return { data: null, error: error.message || 'Failed to create category' };
    }
  }

  // Admin: Update category
  async updateCategory(id: string, categoryData: {
    name?: string;
    slug?: string;
    description?: string;
    parentId?: string;
    icon?: string;
    color?: string;
    type?: 'product' | 'property';
  }): Promise<{ data: Category | null; error: string | null }> {
    try {
      const response = await apiClient.put<CategoryResponse>(`/categories/${id}`, categoryData);
      return { data: response.data || null, error: null };
    } catch (error: any) {
      console.error('Error updating category:', error);
      return { data: null, error: error.message || 'Failed to update category' };
    }
  }

  // Admin: Delete category
  async deleteCategory(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await apiClient.delete(`/categories/${id}`);
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error deleting category:', error);
      return { success: false, error: error.message || 'Failed to delete category' };
    }
  }
}

export const categoryApiService = new CategoryApiService();
export default categoryApiService;
