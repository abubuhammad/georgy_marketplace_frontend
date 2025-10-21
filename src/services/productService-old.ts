import { isDevMode } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { Product, SearchFilters, PaginatedResponse } from '@/types';
import { localDB } from './localDatabase';

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

class ProductService {
  // Create new product listing
  async createProduct(userId: string, productData: CreateProductData) {
    if (isDevMode) {
      // Use local database for development
      try {
        const { listingService } = await import('./listingService');
        const { listing } = await listingService.createListing({
          title: productData.title,
          description: productData.description,
          category: productData.categoryId,
          price: productData.price,
          condition: productData.condition,
          location: `${productData.locationCity}, ${productData.locationState}`,
          contactPhone: '', // Will be filled from user profile
          images: productData.images
        }, userId);
        return { data: listing, error: null };
      } catch (error) {
        return { data: null, error: (error as Error).message };
      }
    }

    try {
      const listing = await prisma.listing.create({
        data: {
          title: productData.title,
          description: productData.description,
          categoryId: productData.categoryId,
          subcategoryId: productData.subcategoryId,
          userId: userId,
          price: productData.price,
          originalPrice: productData.originalPrice,
          condition: productData.condition,
          brand: productData.brand,
          model: productData.model,
          locationCity: productData.locationCity,
          locationState: productData.locationState,
          locationCountry: productData.locationCountry || 'Nigeria',
          isNegotiable: productData.isNegotiable,
          status: 'active',
        },
        include: {
          category: true,
          subcategory: true,
          user: true,
          images: true,
          reviews: true
        }
      });

      // Upload images if provided
      if (productData.images && productData.images.length > 0) {
        await this.uploadProductImages(listing.id, productData.images);
      }

      return { data: listing, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Get product by ID
  async getProductById(id: string) {
    if (isDevMode) {
      // Use local database or listing service for development/fallback
      try {
        const { listingService } = await import('./listingService');
        const listing = await listingService.getListingById(id);
        if (listing) {
          return { data: listing, error: null };
        } else {
          return { data: null, error: 'Product not found' };
        }
      } catch (error) {
        return { data: null, error: (error as Error).message };
      }
    }

    try {
      const listing = await prisma.listing.findUnique({
        where: { id },
        include: {
          category: true,
          subcategory: true,
          user: true,
          images: true,
          reviews: true
        }
      });

      if (!listing) {
        return { data: null, error: 'Product not found' };
      }

      // Increment view count
      await prisma.listing.update({
        where: { id },
        data: { 
          viewCount: { increment: 1 }
        }
      });

      return { data: listing, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Get products with filters and pagination
  async getProducts(filters: SearchFilters = {}, page = 1, limit = 20): Promise<PaginatedResponse<Product>> {
    if (isDevMode) {
      // Use local database data
      const { listingService } = await import('./listingService');
      const { listings } = await listingService.getListings({ limit, offset: (page - 1) * limit });
      
      const products: Product[] = listings.map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        originalPrice: listing.price,
        currency: listing.currency,
        condition: listing.condition as any,
        category: listing.category?.name || 'Uncategorized',
        categoryId: listing.category_id,
        subcategory: null,
        brand: null,
        model: null,
        images: listing.images.map(img => img.image_url),
        primaryImage: listing.images.find(img => img.is_primary)?.image_url || listing.images[0]?.image_url,
        sellerId: listing.user_id,
        sellerName: `${listing.user?.first_name} ${listing.user?.last_name}`,
        sellerRating: 4.5,
        sellerVerified: true,
        location: {
          city: listing.location_city,
          state: listing.location_state,
          country: listing.location_country,
        },
        coordinates: null,
        status: listing.status as any,
        features: [],
        specifications: {},
        isNegotiable: true,
        views: listing.view_count,
        likes: listing.like_count,
        saves: 0,
        isActive: listing.status === 'active',
        isFeatured: listing.is_featured,
        createdAt: listing.created_at,
        updatedAt: listing.updated_at,
      }));
      
      return {
        data: products,
        pagination: {
          page,
          limit,
          total: products.length,
          pages: Math.ceil(products.length / limit),
        },
      };
    }

    try {
      const whereClause: any = { status: 'active' };

      // Apply filters
      if (filters.query) {
        whereClause.OR = [
          { title: { contains: filters.query, mode: 'insensitive' } },
          { description: { contains: filters.query, mode: 'insensitive' } }
        ];
      }

      if (filters.category) {
        whereClause.categoryId = filters.category;
      }

      if (filters.priceMin !== undefined) {
        whereClause.price = { ...whereClause.price, gte: filters.priceMin };
      }

      if (filters.priceMax !== undefined) {
        whereClause.price = { ...whereClause.price, lte: filters.priceMax };
      }

      // Get count for pagination
      const total = await prisma.listing.count({ where: whereClause });

      // Apply sorting
      let orderBy: any = { createdAt: 'desc' };
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price':
            orderBy = { price: filters.sortOrder === 'desc' ? 'desc' : 'asc' };
            break;
          case 'newest':
            orderBy = { createdAt: 'desc' };
            break;
          case 'popular':
            orderBy = { viewCount: 'desc' };
            break;
        }
      }

      const listings = await prisma.listing.findMany({
        where: whereClause,
        include: {
          category: true,
          subcategory: true,
          user: true,
          images: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        data: listings || [],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, pages: 0 },
      };
    }
  }

  // Get user's products
  async getUserProducts(userId: string) {
    try {
      const listings = await prisma.listing.findMany({
        where: { userId },
        include: {
          category: true,
          images: true,
          reviews: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return { data: listings, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Update product
  async updateProduct(productData: UpdateProductData) {
    try {
      const listing = await prisma.listing.update({
        where: { id: productData.id },
        data: {
          title: productData.title,
          description: productData.description,
          categoryId: productData.categoryId,
          subcategoryId: productData.subcategoryId,
          price: productData.price,
          originalPrice: productData.originalPrice,
          condition: productData.condition,
          brand: productData.brand,
          model: productData.model,
          locationCity: productData.locationCity,
          locationState: productData.locationState,
          locationCountry: productData.locationCountry,
          isNegotiable: productData.isNegotiable,
          updatedAt: new Date(),
        },
        include: {
          category: true,
          subcategory: true,
          user: true,
          images: true,
          reviews: true
        }
      });

      return { data: listing, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Delete product
  async deleteProduct(id: string) {
    try {
      await prisma.listing.delete({
        where: { id }
      });

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  // Upload product images (placeholder - would need actual file storage implementation)
  async uploadProductImages(listingId: string, images: File[]) {
    try {
      // This would normally upload to a file storage service and save image records
      const uploadPromises = images.map(async (file, index) => {
        const imageUrl = 'https://via.placeholder.com/400x300?text=Product+Image';
        
        // Save image record
        await prisma.listingImage.create({
          data: {
            listingId,
            imageUrl,
            sortOrder: index,
            isPrimary: index === 0,
          }
        });

        return imageUrl;
      });

      const urls = await Promise.all(uploadPromises);
      return { urls, error: null };
    } catch (error) {
      return { urls: null, error: (error as Error).message };
    }
  }

  // Get featured products
  async getFeaturedProducts(limit = 8) {
    if (isDevMode) {
      // Use real local database data instead of mock data
      const { listingService } = await import('./listingService');
      const { listings } = await listingService.getListings({ featured: true, limit });
      
      // Convert listings to Product format for compatibility
      const products = listings.map(listing => ({
        id: listing.id,
        name: listing.title,
        price: listing.price,
        image: listing.images?.[0]?.image_url || 'https://via.placeholder.com/300x200',
        category: listing.category?.name || 'General',
        location: `${listing.location_city}, ${listing.location_state}`,
        condition: listing.condition,
        featured: true,
        createdAt: listing.created_at
      }));

      return { data: products, error: null };
    }

    try {
      const listings = await prisma.listing.findMany({
        where: {
          status: 'active',
          isFeatured: true
        },
        include: {
          category: true,
          images: true,
          user: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return { data: listings, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Get similar products
  async getSimilarProducts(productId: string, categoryId: string, limit = 4) {
    try {
      const listings = await prisma.listing.findMany({
        where: {
          status: 'active',
          categoryId,
          NOT: { id: productId }
        },
        include: {
          category: true,
          images: true,
          user: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return { data: listings, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Search products
  async searchProducts(query: string, limit = 10) {
    try {
      const listings = await prisma.listing.findMany({
        where: {
          status: 'active',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          category: true,
          images: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return { data: listings, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Toggle favorite
  async toggleFavorite(userId: string, listingId: string) {
    try {
      // Check if already favorited
      const existing = await prisma.savedListing.findUnique({
        where: {
          userId_listingId: {
            userId,
            listingId
          }
        }
      });

      if (existing) {
        // Remove from favorites
        await prisma.savedListing.delete({
          where: {
            userId_listingId: {
              userId,
              listingId
            }
          }
        });
        return { isFavorited: false, error: null };
      } else {
        // Add to favorites
        await prisma.savedListing.create({
          data: {
            userId,
            listingId
          }
        });
        return { isFavorited: true, error: null };
      }
    } catch (error) {
      return { isFavorited: false, error: (error as Error).message };
    }
  }

  // Get user's favorite products
  async getUserFavorites(userId: string) {
    try {
      const favorites = await prisma.savedListing.findMany({
        where: { userId },
        include: {
          listing: {
            include: {
              category: true,
              images: true,
              user: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return { data: favorites.map(fav => fav.listing), error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }
}

export default new ProductService();
