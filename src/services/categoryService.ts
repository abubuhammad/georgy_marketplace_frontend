import { isDevMode } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { Category } from '@/types';
import { localDB } from './localDatabase';
import { prismaService } from './prismaService';

class CategoryService {
  // Get all categories
  async getCategories() {
    if (isDevMode) {
      try {
        const categories = await localDB.getCategories();
        return { data: categories, error: null };
      } catch (error) {
        return { data: null, error: (error as Error).message };
      }
    }

    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      });

      return { data: categories, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Get main categories (no parent)
  async getMainCategories() {
    if (isDevMode) {
      try {
        const categories = await localDB.getCategories();
        return { data: categories, error: null };
      } catch (error) {
        return { data: null, error: (error as Error).message };
      }
    }

    try {
      const categories = await prisma.category.findMany({
        where: { 
          isActive: true,
          parentId: null
        },
        orderBy: { sortOrder: 'asc' }
      });

      return { data: categories, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Get subcategories by parent category
  async getSubcategories(parentId: string) {
    try {
      const categories = await prisma.category.findMany({
        where: {
          parentId,
          isActive: true
        },
        orderBy: { sortOrder: 'asc' }
      });

      return { data: categories, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Get category by ID
  async getCategoryById(id: string) {
    if (isDevMode) {
      try {
        const category = await localDB.getCategoryById(id);
        return { data: category, error: null };
      } catch (error) {
        return { data: null, error: (error as Error).message };
      }
    }

    try {
      const category = await prisma.category.findUnique({
        where: { id }
      });

      return { data: category, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Get category by slug
  async getCategoryBySlug(slug: string) {
    if (isDevMode) {
      try {
        const category = await localDB.getCategoryBySlug(slug);
        return { data: category, error: null };
      } catch (error) {
        return { data: null, error: (error as Error).message };
      }
    }

    try {
      const category = await prisma.category.findUnique({
        where: { slug }
      });

      return { data: category, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Get category tree (hierarchical structure)
  async getCategoryTree() {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      });

      // Build tree structure
      const categoryMap = new Map<string, Category & { children: Category[] }>();
      const rootCategories: (Category & { children: Category[] })[] = [];

      // First pass: create map of all categories
      categories?.forEach(category => {
        categoryMap.set(category.id, { ...category, children: [] });
      });

      // Second pass: build tree structure
      categories?.forEach(category => {
        const categoryWithChildren = categoryMap.get(category.id)!;
        
        if (category.parentId) {
          const parent = categoryMap.get(category.parentId);
          if (parent) {
            parent.children.push(categoryWithChildren);
          }
        } else {
          rootCategories.push(categoryWithChildren);
        }
      });

      return { data: rootCategories, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Get category with listing count
  async getCategoriesWithCount() {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { listings: true }
          }
        },
        orderBy: { sortOrder: 'asc' }
      });

      return { data: categories, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Create category (admin only)
  async createCategory(categoryData: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    parentId?: string;
    sortOrder?: number;
  }) {
    try {
      const category = await prisma.category.create({
        data: {
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          icon: categoryData.icon,
          parentId: categoryData.parentId,
          sortOrder: categoryData.sortOrder || 0,
          isActive: true,
        }
      });

      return { data: category, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Update category (admin only)
  async updateCategory(id: string, updates: {
    name?: string;
    slug?: string;
    description?: string;
    icon?: string;
    parentId?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    try {
      const category = await prisma.category.update({
        where: { id },
        data: {
          name: updates.name,
          slug: updates.slug,
          description: updates.description,
          icon: updates.icon,
          parentId: updates.parentId,
          sortOrder: updates.sortOrder,
          isActive: updates.isActive,
          updatedAt: new Date(),
        }
      });

      return { data: category, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Delete category (admin only)
  async deleteCategory(id: string) {
    try {
      // Check if category has subcategories
      const subcategories = await prisma.category.findMany({
        where: { parentId: id }
      });

      if (subcategories && subcategories.length > 0) {
        return { error: 'Cannot delete category with subcategories' };
      }

      // Check if category has listings
      const listings = await prisma.listing.findMany({
        where: { categoryId: id }
      });

      if (listings && listings.length > 0) {
        return { error: 'Cannot delete category with listings' };
      }

      await prisma.category.delete({
        where: { id }
      });

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  // Get popular categories based on listing count
  async getPopularCategories(limit = 6) {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { listings: true }
          }
        },
        orderBy: {
          listings: {
            _count: 'desc'
          }
        },
        take: limit
      });

      return { data: categories, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Search categories
  async searchCategories(query: string) {
    try {
      const categories = await prisma.category.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        orderBy: { name: 'asc' }
      });

      return { data: categories, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }
}

export default new CategoryService();
