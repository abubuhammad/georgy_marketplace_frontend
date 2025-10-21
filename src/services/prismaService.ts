import { prisma } from '@/lib/prisma';
import { Listing } from '@/types';

export class PrismaService {
  
  // Listing operations
  async createListing(data: {
    title: string;
    description: string;
    category: string;
    price: number;
    condition: string;
    locationCity: string;
    locationState: string;
    images?: Array<{ url: string; isPrimary: boolean }>;
  }, userId: string) {
    // Check if Prisma is available (not in browser)
    if (!prisma) {
      throw new Error('Prisma not available in browser environment');
    }
    
    try {
      // Find or create category
      let category = await prisma.category.findFirst({
        where: { name: { contains: data.category, mode: 'insensitive' } }
      });

      if (!category) {
        const slug = data.category.toLowerCase().replace(/\s+/g, '-');
        category = await prisma.category.create({
          data: {
            name: data.category,
            slug: slug,
            description: `${data.category} category`,
          }
        });
      }

      const listing = await prisma.listing.create({
        data: {
          title: data.title,
          description: data.description,
          userId: userId,
          categoryId: category.id,
          price: data.price,
          currency: 'NGN',
          condition: data.condition,
          locationCity: data.locationCity,
          locationState: data.locationState,
          locationCountry: 'Nigeria',
          images: {
            create: data.images?.map((img, index) => ({
              imageUrl: img.url,
              isPrimary: img.isPrimary,
              sortOrder: index + 1,
            })) || []
          }
        },
        include: {
          category: true,
          user: true,
          images: true,
        }
      });

      return { listing: this.transformListing(listing), error: null };
    } catch (error) {
      console.error('Error creating listing:', error);
      return { listing: null, error: (error as Error).message };
    }
  }

  async getListings(filters?: {
    user_id?: string;
    status?: string;
    is_featured?: boolean;
    category_id?: string;
    search?: string;
    limit?: number;
    offset?: number;
    featured?: boolean;
  }) {
    // Check if Prisma is available (not in browser)
    if (!prisma) {
      throw new Error('Prisma not available in browser environment');
    }
    
    try {
      const where: any = {};
      
      if (filters?.user_id) {
        where.userId = filters.user_id;
      }
      
      if (filters?.status) {
        where.status = filters.status;
      } else {
        where.status = 'active'; // Default to active listings
      }
      
      if (filters?.is_featured !== undefined || filters?.featured !== undefined) {
        where.isFeatured = filters.is_featured || filters.featured;
      }
      
      if (filters?.category_id) {
        where.categoryId = filters.category_id;
      }
      
      if (filters?.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const listings = await prisma.listing.findMany({
        where,
        include: {
          category: true,
          user: true,
          images: true,
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || undefined,
        skip: filters?.offset || 0,
      });

      const total = await prisma.listing.count({ where });

      return {
        listings: listings.map(this.transformListing),
        total
      };
    } catch (error) {
      console.error('Error fetching listings:', error);
      return { listings: [], total: 0 };
    }
  }

  async getListingById(id: string) {
    // Check if Prisma is available (not in browser)
    if (!prisma) {
      throw new Error('Prisma not available in browser environment');
    }
    
    try {
      const listing = await prisma.listing.findUnique({
        where: { id },
        include: {
          category: true,
          user: true,
          images: true,
        }
      });

      if (listing) {
        // Increment view count
        await prisma.listing.update({
          where: { id },
          data: { viewCount: { increment: 1 } }
        });
      }

      return listing ? this.transformListing(listing) : null;
    } catch (error) {
      console.error('Error fetching listing:', error);
      return null;
    }
  }

  // Category operations
  async getCategories() {
    // Check if Prisma is available (not in browser)
    if (!prisma) {
      throw new Error('Prisma not available in browser environment');
    }
    
    try {
      return await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getCategoryById(id: string) {
    if (!prisma) {
      throw new Error('Prisma not available in browser environment');
    }
    try {
      return await prisma.category.findUnique({
        where: { id }
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }

  async getCategoryBySlug(slug: string) {
    if (!prisma) {
      throw new Error('Prisma not available in browser environment');
    }
    try {
      return await prisma.category.findUnique({
        where: { slug }
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }

  // User operations
  async createUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }) {
    try {
      return await prisma.user.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: data.role || 'customer',
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async getUserByEmail(email: string) {
    try {
      return await prisma.user.findUnique({
        where: { email }
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async getUserById(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id }
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  // Seller operations
  async getSellerProfile(userId: string) {
    try {
      return await prisma.sellerProfile.findUnique({
        where: { userId },
        include: { user: true }
      });
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      return null;
    }
  }

  async updateSellerProfile(userId: string, data: any) {
    try {
      return await prisma.sellerProfile.upsert({
        where: { userId },
        update: data,
        create: {
          userId,
          ...data
        }
      });
    } catch (error) {
      console.error('Error updating seller profile:', error);
      throw error;
    }
  }

  // Analytics operations
  async getSellerAnalytics(sellerId: string, startDate?: Date, endDate?: Date) {
    try {
      const where: any = { userId: sellerId };
      
      if (startDate && endDate) {
        where.createdAt = {
          gte: startDate,
          lte: endDate
        };
      }

      const [listings, totalViews, totalLikes] = await Promise.all([
        prisma.listing.findMany({ where }),
        prisma.listing.aggregate({
          where,
          _sum: { viewCount: true }
        }),
        prisma.listing.aggregate({
          where,
          _sum: { likeCount: true }
        })
      ]);

      return {
        totalListings: listings.length,
        activeListings: listings.filter(l => l.status === 'active').length,
        totalViews: totalViews._sum.viewCount || 0,
        totalLikes: totalLikes._sum.likeCount || 0,
        featuredListings: listings.filter(l => l.isFeatured).length,
        listings
      };
    } catch (error) {
      console.error('Error fetching seller analytics:', error);
      return {
        totalListings: 0,
        activeListings: 0,
        totalViews: 0,
        totalLikes: 0,
        featuredListings: 0,
        listings: []
      };
    }
  }

  // Seed database with sample data
  async seedDatabase() {
    try {
      console.log('🌱 Seeding Prisma database...');
      
      // Check if data already exists
      const userCount = await prisma.user.count();
      if (userCount > 0) {
        console.log('Database already seeded');
        return;
      }

      // Use the seed function from prisma.ts
      const { seedDatabase } = await import('@/lib/prisma');
      await seedDatabase();
      
      console.log('✅ Database seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }

  // Helper method to transform Prisma listing to our Listing type
  private transformListing(prismaListing: any): Listing {
    return {
      id: prismaListing.id,
      title: prismaListing.title,
      description: prismaListing.description,
      category_id: prismaListing.categoryId,
      user_id: prismaListing.userId,
      price: prismaListing.price,
      currency: prismaListing.currency,
      condition: prismaListing.condition,
      location_city: prismaListing.locationCity,
      location_state: prismaListing.locationState,
      location_country: prismaListing.locationCountry,
      status: prismaListing.status,
      view_count: prismaListing.viewCount,
      like_count: prismaListing.likeCount,
      is_featured: prismaListing.isFeatured,
      created_at: prismaListing.createdAt.toISOString(),
      updated_at: prismaListing.updatedAt.toISOString(),
      images: prismaListing.images?.map((img: any) => ({
        id: img.id,
        image_url: img.imageUrl,
        is_primary: img.isPrimary,
        sort_order: img.sortOrder
      })) || [],
      category: prismaListing.category ? {
        name: prismaListing.category.name,
        slug: prismaListing.category.slug
      } : undefined,
      user: prismaListing.user ? {
        first_name: prismaListing.user.firstName,
        last_name: prismaListing.user.lastName,
        phone: prismaListing.user.phone
      } : undefined
    };
  }
}

// Export singleton instance
export const prismaService = new PrismaService();
