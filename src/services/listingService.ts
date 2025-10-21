import { isDevMode } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { localDB } from './localDatabase';
import { prismaService } from './prismaService';

export interface CreateListingData {
  title: string;
  description: string;
  category: string;
  price: number;
  condition: string;
  location: string;
  contactPhone: string;
  images: File[];
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category_id: string;
  user_id: string;
  price: number;
  currency: string;
  condition: string;
  location_city: string;
  location_state: string;
  location_country: string;
  status: 'active' | 'inactive' | 'sold' | 'reserved' | 'expired';
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  images?: { id: string; image_url: string; is_primary: boolean }[];
  category?: { name: string; slug: string };
  user?: { first_name: string; last_name: string; phone: string };
}

export class ListingService {
  async createListing(data: CreateListingData, userId: string): Promise<{ listing: Listing | null; error: string | null }> {
    try {
      if (isDevMode) {
        // Use local database in dev mode
        const slug = data.category.toLowerCase().replace(/\s+/g, '-');
        let category = await localDB.getCategoryBySlug(slug);

        if (!category) {
          category = await localDB.createCategory({
            name: data.category,
            slug: slug,
            description: `${data.category} category`
          });
        }

        // Parse location
        const locationParts = data.location.split(',').map(part => part.trim());
        const city = locationParts[0] || '';
        const state = locationParts[1] || '';

        // Create placeholder images (in real app these would be uploaded)
        const images = data.images.map((_, index) => ({
          id: `img-${Date.now()}-${index}`,
          image_url: 'https://via.placeholder.com/400x300?text=Product+Image',
          is_primary: index === 0,
          sort_order: index
        }));

        const listing = await localDB.createListing({
          title: data.title,
          description: data.description,
          category_id: category.id,
          user_id: userId,
          price: parseFloat(data.price.toString()),
          condition: data.condition,
          location_city: city,
          location_state: state,
          location_country: 'Nigeria',
          images: images
        });

        return { listing: listing as Listing, error: null };
      }

      // Use Prisma for production MySQL database
      const slug = data.category.toLowerCase().replace(/\s+/g, '-');
      let category = await prisma.category.findUnique({
        where: { slug }
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: data.category,
            slug: slug,
            description: `${data.category} category`,
            isActive: true
          }
        });
      }

      const locationParts = data.location.split(',').map(part => part.trim());
      const city = locationParts[0] || '';
      const state = locationParts[1] || '';

      const listing = await prisma.listing.create({
        data: {
          title: data.title,
          description: data.description,
          categoryId: category.id,
          userId: userId,
          price: parseFloat(data.price.toString()),
          currency: 'NGN',
          condition: data.condition,
          locationCity: city,
          locationState: state,
          locationCountry: 'Nigeria',
          status: 'active',
          isNegotiable: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        include: {
          category: true,
          user: true
        }
      });

      if (data.images.length > 0) {
        await this.uploadListingImages(listing.id, data.images);
      }

      const completeListing = await this.getListingById(listing.id);
      return { listing: completeListing, error: null };
    } catch (error) {
      console.error('Unexpected error creating listing:', error);
      return { listing: null, error: 'Unexpected error occurred' };
    }
  }

  async uploadListingImages(listingId: string, images: File[]): Promise<void> {
    try {
      for (let i = 0; i < images.length; i++) {
        const imageUrl = 'https://via.placeholder.com/400x300?text=Product+Image';

        // Save image record to database
        await prisma.listingImage.create({
          data: {
            listingId: listingId,
            imageUrl: imageUrl,
            isPrimary: i === 0, // First image is primary
            sortOrder: i
          }
        });
      }
    } catch (error) {
      console.error('Error uploading listing images:', error);
    }
  }

  async getListingById(id: string): Promise<Listing | null> {
    try {
      if (isDevMode) {
        // Use local database
        const listing = await localDB.getListingById(id);
        return listing;
      }

      // Use Prisma for production
      const listing = await prisma.listing.findUnique({
        where: { id },
        include: {
          category: true,
          user: true,
          images: true
        }
      });

      if (!listing) {
        return null;
      }

      return {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        category_id: listing.categoryId,
        user_id: listing.userId,
        price: listing.price,
        currency: listing.currency,
        condition: listing.condition,
        location_city: listing.locationCity,
        location_state: listing.locationState,
        location_country: listing.locationCountry,
        status: listing.status as any,
        view_count: listing.viewCount || 0,
        like_count: listing.likeCount || 0,
        created_at: listing.createdAt.toISOString(),
        updated_at: listing.updatedAt.toISOString(),
        category: listing.category ? { name: listing.category.name, slug: listing.category.slug } : undefined,
        user: listing.user ? { 
          first_name: listing.user.firstName || '', 
          last_name: listing.user.lastName || '', 
          phone: listing.user.phone || '' 
        } : undefined,
        images: listing.images?.map(img => ({
          id: img.id,
          image_url: img.imageUrl,
          is_primary: img.isPrimary
        })) || []
      } as Listing;
    } catch (error) {
      console.error('Unexpected error fetching listing:', error);
      return null;
    }
  }

  async getListings(filters?: {
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    search?: string;
    userId?: string;
    limit?: number;
    offset?: number;
    featured?: boolean;
  }): Promise<{ listings: Listing[]; total: number }> {
    try {
      if (isDevMode) {
        // Use local database in dev mode
        const dbFilters: any = {
          status: 'active',
          limit: filters?.limit,
          offset: filters?.offset
        };

        if (filters?.userId) {
          dbFilters.user_id = filters.userId;
        }

        if (filters?.featured !== undefined) {
          dbFilters.is_featured = filters.featured;
        }

        if (filters?.category) {
          const category = await localDB.getCategoryBySlug(filters.category);
          if (category) {
            dbFilters.category_id = category.id;
          }
        }

        if (filters?.search) {
          dbFilters.search = filters.search;
        }

        const { data, count } = await localDB.getListings(dbFilters);
        
        // Apply additional filters not handled by localDB
        let filtered = data;

        if (filters?.minPrice !== undefined) {
          filtered = filtered.filter(l => l.price >= filters.minPrice!);
        }

        if (filters?.maxPrice !== undefined) {
          filtered = filtered.filter(l => l.price <= filters.maxPrice!);
        }

        if (filters?.condition) {
          filtered = filtered.filter(l => l.condition === filters.condition);
        }

        if (filters?.location) {
          const locationLower = filters.location.toLowerCase();
          filtered = filtered.filter(l => 
            l.location_city.toLowerCase().includes(locationLower) ||
            l.location_state.toLowerCase().includes(locationLower)
          );
        }

        return { listings: filtered as Listing[], total: filtered.length };
      }

      // Use Prisma for production
      const whereClause: any = { status: 'active' };

      if (filters?.userId) {
        whereClause.userId = filters.userId;
      }

      if (filters?.featured !== undefined) {
        whereClause.isFeatured = filters.featured;
      }

      if (filters?.category) {
        const category = await prisma.category.findUnique({
          where: { slug: filters.category }
        });
        if (category) {
          whereClause.categoryId = category.id;
        }
      }

      if (filters?.location) {
        whereClause.OR = [
          { locationCity: { contains: filters.location, mode: 'insensitive' } },
          { locationState: { contains: filters.location, mode: 'insensitive' } }
        ];
      }

      if (filters?.minPrice) {
        whereClause.price = { ...whereClause.price, gte: filters.minPrice };
      }

      if (filters?.maxPrice) {
        whereClause.price = { ...whereClause.price, lte: filters.maxPrice };
      }

      if (filters?.condition) {
        whereClause.condition = filters.condition;
      }

      if (filters?.search) {
        whereClause.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const total = await prisma.listing.count({ where: whereClause });

      const listings = await prisma.listing.findMany({
        where: whereClause,
        include: {
          category: true,
          user: true,
          images: true
        },
        orderBy: { createdAt: 'desc' },
        skip: filters?.offset,
        take: filters?.limit
      });

      const formattedListings: Listing[] = listings.map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        category_id: listing.categoryId,
        user_id: listing.userId,
        price: listing.price,
        currency: listing.currency,
        condition: listing.condition,
        location_city: listing.locationCity,
        location_state: listing.locationState,
        location_country: listing.locationCountry,
        status: listing.status as any,
        view_count: listing.viewCount || 0,
        like_count: listing.likeCount || 0,
        created_at: listing.createdAt.toISOString(),
        updated_at: listing.updatedAt.toISOString(),
        category: listing.category ? { name: listing.category.name, slug: listing.category.slug } : undefined,
        user: listing.user ? { 
          first_name: listing.user.firstName || '', 
          last_name: listing.user.lastName || '', 
          phone: listing.user.phone || '' 
        } : undefined,
        images: listing.images?.map(img => ({
          id: img.id,
          image_url: img.imageUrl,
          is_primary: img.isPrimary
        })) || []
      }));

      return { listings: formattedListings, total };
    } catch (error) {
      console.error('Unexpected error fetching listings:', error);
      return { listings: [], total: 0 };
    }
  }

  async incrementViewCount(listingId: string): Promise<void> {
    try {
      await prisma.listing.update({
        where: { id: listingId },
        data: { viewCount: { increment: 1 } }
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  async updateListingStatus(listingId: string, status: string): Promise<{ success: boolean; error?: string }> {
    try {
      await prisma.listing.update({
        where: { id: listingId },
        data: { 
          status,
          updatedAt: new Date()
        }
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Unexpected error occurred' };
    }
  }
}

export const listingService = new ListingService();
