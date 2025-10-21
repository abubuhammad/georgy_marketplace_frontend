import { apiClient } from '@/lib/apiClient';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  isActive?: boolean;
}

export class CategoryAPI {
  private static readonly BASE_URL = '/api/categories';

  /**
   * Get all categories
   */
  static async getCategories(): Promise<{ data: Category[]; error: string | null }> {
    try {
      const response = await apiClient.get<{ data: Category[]; error: null }>(this.BASE_URL);
      return response.data;
    } catch (error: any) {
      return { 
        data: [], 
        error: error.response?.data?.error || error.message || 'Failed to fetch categories'
      };
    }
  }

  /**
   * Get main categories (no parent)
   */
  static async getMainCategories(): Promise<{ data: Category[]; error: string | null }> {
    try {
      const response = await apiClient.get<{ data: Category[]; error: null }>(`${this.BASE_URL}/main`);
      return response.data;
    } catch (error: any) {
      return { 
        data: [], 
        error: error.response?.data?.error || error.message || 'Failed to fetch main categories'
      };
    }
  }

  /**
   * Get subcategories by parent category
   */
  static async getSubcategories(parentId: string): Promise<{ data: Category[]; error: string | null }> {
    try {
      const response = await apiClient.get<{ data: Category[]; error: null }>(`${this.BASE_URL}/subcategories/${parentId}`);
      return response.data;
    } catch (error: any) {
      return { 
        data: [], 
        error: error.response?.data?.error || error.message || 'Failed to fetch subcategories'
      };
    }
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(id: string): Promise<{ data: Category | null; error: string | null }> {
    try {
      const response = await apiClient.get<{ data: Category; error: null }>(`${this.BASE_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.error || error.message || 'Failed to fetch category'
      };
    }
  }

  /**
   * Get category by slug
   */
  static async getCategoryBySlug(slug: string): Promise<{ data: Category | null; error: string | null }> {
    try {
      const response = await apiClient.get<{ data: Category; error: null }>(`${this.BASE_URL}/slug/${slug}`);
      return response.data;
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.error || error.message || 'Failed to fetch category'
      };
    }
  }

  /**
   * Get category tree (hierarchical structure)
   */
  static async getCategoryTree(): Promise<{ data: (Category & { children: Category[] })[] | null; error: string | null }> {
    try {
      const response = await apiClient.get<{ data: (Category & { children: Category[] })[]; error: null }>(`${this.BASE_URL}/tree`);
      return response.data;
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.error || error.message || 'Failed to fetch category tree'
      };
    }
  }

  /**
   * Get categories with listing count
   */
  static async getCategoriesWithCount(): Promise<{ data: (Category & { _count: { listings: number } })[] | null; error: string | null }> {
    try {
      const response = await apiClient.get<{ data: (Category & { _count: { listings: number } })[]; error: null }>(`${this.BASE_URL}/with-count`);
      return response.data;
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.error || error.message || 'Failed to fetch categories with count'
      };
    }
  }

  /**
   * Create category (admin only)
   */
  static async createCategory(categoryData: CreateCategoryData): Promise<{ data: Category | null; error: string | null }> {
    try {
      const response = await apiClient.post<{ data: Category; error: null }>(this.BASE_URL, categoryData);
      return response.data;
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.error || error.message || 'Failed to create category'
      };
    }
  }

  /**
   * Update category (admin only)
   */
  static async updateCategory(id: string, categoryData: UpdateCategoryData): Promise<{ data: Category | null; error: string | null }> {
    try {
      const response = await apiClient.put<{ data: Category; error: null }>(`${this.BASE_URL}/${id}`, categoryData);
      return response.data;
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.error || error.message || 'Failed to update category'
      };
    }
  }

  /**
   * Delete category (admin only)
   */
  static async deleteCategory(id: string): Promise<{ data: boolean; error: string | null }> {
    try {
      await apiClient.delete(`${this.BASE_URL}/${id}`);
      return { data: true, error: null };
    } catch (error: any) {
      return { 
        data: false, 
        error: error.response?.data?.error || error.message || 'Failed to delete category'
      };
    }
  }
}

export default CategoryAPI;
