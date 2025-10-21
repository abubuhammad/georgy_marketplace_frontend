// Simple in-memory database for development/testing
// This simulates a real database without requiring Supabase setup

export interface LocalListing {
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
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  images: { id: string; image_url: string; is_primary: boolean; sort_order: number }[];
  category?: { name: string; slug: string };
  user?: { first_name: string; last_name: string; phone: string };
}

export interface LocalCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

class LocalDatabase {
  private listings: LocalListing[] = [];
  private categories: LocalCategory[] = [];
  private nextId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize categories
    this.categories = [
      {
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'cat-2',
        name: 'Fashion & Beauty',
        slug: 'fashion',
        description: 'Clothing, shoes, and beauty products',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'cat-3',
        name: 'Home & Garden',
        slug: 'home',
        description: 'Home improvement and garden items',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'cat-4',
        name: 'Vehicles & Transport',
        slug: 'vehicles',
        description: 'Cars, motorcycles, and transport',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'cat-5',
        name: 'Services',
        slug: 'services',
        description: 'Professional and personal services',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];

    // Initialize some sample listings
    this.createSampleListings();
  }

  private createSampleListings() {
    const sampleListings: LocalListing[] = [
      {
        id: 'listing-1',
        title: 'iPhone 14 Pro Max - 256GB',
        description: 'Brand new iPhone 14 Pro Max in excellent condition. Comes with original box and charger.',
        category_id: 'cat-1',
        user_id: 'mock-user-1',
        price: 450000,
        currency: 'NGN',
        condition: 'new',
        location_city: 'Lagos',
        location_state: 'Lagos',
        location_country: 'Nigeria',
        status: 'active',
        view_count: 156,
        like_count: 23,
        is_featured: true,
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        images: [
          { id: 'img-1', image_url: '/images/iphone-1.jpg', is_primary: true, sort_order: 1 }
        ],
        category: this.categories.find(c => c.id === 'cat-1'),
        user: { first_name: 'John', last_name: 'Doe', phone: '+234-123-456-7890' }
      },
      {
        id: 'listing-2',
        title: 'Designer Handbag - Luxury Brand',
        description: 'Authentic designer handbag in excellent condition. Perfect for special occasions.',
        category_id: 'cat-2',
        user_id: 'mock-user-2',
        price: 85000,
        currency: 'NGN',
        condition: 'used',
        location_city: 'Abuja',
        location_state: 'FCT',
        location_country: 'Nigeria',
        status: 'active',
        view_count: 89,
        like_count: 12,
        is_featured: true,
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updated_at: new Date(Date.now() - 172800000).toISOString(),
        images: [
          { id: 'img-2', image_url: '/images/handbag-1.jpg', is_primary: true, sort_order: 1 }
        ],
        category: this.categories.find(c => c.id === 'cat-2'),
        user: { first_name: 'Jane', last_name: 'Smith', phone: '+234-987-654-3210' }
      },
      {
        id: 'listing-3',
        title: 'Gaming Laptop - High Performance',
        description: 'High-end gaming laptop with RTX 4060, perfect for gaming and work.',
        category_id: 'cat-1',
        user_id: 'mock-user-1',
        price: 680000,
        currency: 'NGN',
        condition: 'new',
        location_city: 'Port Harcourt',
        location_state: 'Rivers',
        location_country: 'Nigeria',
        status: 'active',
        view_count: 234,
        like_count: 45,
        is_featured: false,
        created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        updated_at: new Date(Date.now() - 259200000).toISOString(),
        images: [
          { id: 'img-3', image_url: '/images/laptop-1.jpg', is_primary: true, sort_order: 1 }
        ],
        category: this.categories.find(c => c.id === 'cat-1'),
        user: { first_name: 'John', last_name: 'Doe', phone: '+234-123-456-7890' }
      },
      {
        id: 'listing-4',
        title: 'Home Coffee Machine - Professional Grade',
        description: 'Professional espresso machine for home use. Barely used, excellent condition.',
        category_id: 'cat-3',
        user_id: 'mock-user-2',
        price: 125000,
        currency: 'NGN',
        condition: 'used',
        location_city: 'Kano',
        location_state: 'Kano',
        location_country: 'Nigeria',
        status: 'active',
        view_count: 67,
        like_count: 8,
        is_featured: true,
        created_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        updated_at: new Date(Date.now() - 345600000).toISOString(),
        images: [
          { id: 'img-4', image_url: '/images/coffee-machine-1.jpg', is_primary: true, sort_order: 1 }
        ],
        category: this.categories.find(c => c.id === 'cat-3'),
        user: { first_name: 'Jane', last_name: 'Smith', phone: '+234-987-654-3210' }
      },
      {
        id: 'listing-5',
        title: 'Toyota Camry 2020 - Low Mileage',
        description: 'Well-maintained Toyota Camry with low mileage. Full service history available.',
        category_id: 'cat-4',
        user_id: 'mock-user-1',
        price: 8500000,
        currency: 'NGN',
        condition: 'used',
        location_city: 'Lagos',
        location_state: 'Lagos',
        location_country: 'Nigeria',
        status: 'active',
        view_count: 178,
        like_count: 34,
        is_featured: true,
        created_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        updated_at: new Date(Date.now() - 432000000).toISOString(),
        images: [
          { id: 'img-5', image_url: '/images/camry-1.jpg', is_primary: true, sort_order: 1 }
        ],
        category: this.categories.find(c => c.id === 'cat-4'),
        user: { first_name: 'John', last_name: 'Doe', phone: '+234-123-456-7890' }
      }
    ];

    this.listings = sampleListings;
    this.nextId = 6; // Next available ID
  }

  // Listing operations
  async createListing(data: Partial<LocalListing>): Promise<LocalListing> {
    const listing: LocalListing = {
      id: `listing-${this.nextId++}`,
      title: data.title || '',
      description: data.description || '',
      category_id: data.category_id || '',
      user_id: data.user_id || '',
      price: data.price || 0,
      currency: 'NGN',
      condition: data.condition || 'new',
      location_city: data.location_city || '',
      location_state: data.location_state || '',
      location_country: data.location_country || 'Nigeria',
      status: 'active',
      view_count: 0,
      like_count: 0,
      is_featured: Math.random() > 0.7, // 30% chance of being featured
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: data.images || [],
      category: this.categories.find(c => c.id === data.category_id),
      user: {
        first_name: 'John',
        last_name: 'Doe',
        phone: data.user_id === 'mock-user-1' ? '+234-123-456-7890' : '+234-987-654-3210'
      }
    };

    this.listings.push(listing);
    return listing;
  }

  async getListings(filters?: {
    user_id?: string;
    status?: string;
    is_featured?: boolean;
    category_id?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: LocalListing[]; count: number }> {
    let filtered = [...this.listings];

    if (filters?.user_id) {
      filtered = filtered.filter(l => l.user_id === filters.user_id);
    }

    if (filters?.status) {
      filtered = filtered.filter(l => l.status === filters.status);
    }

    if (filters?.is_featured !== undefined) {
      filtered = filtered.filter(l => l.is_featured === filters.is_featured);
    }

    if (filters?.category_id) {
      filtered = filtered.filter(l => l.category_id === filters.category_id);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(l => 
        l.title.toLowerCase().includes(searchLower) ||
        l.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort by created_at desc
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = filtered.length;
    
    if (filters?.offset || filters?.limit) {
      const start = filters.offset || 0;
      const end = start + (filters.limit || 10);
      filtered = filtered.slice(start, end);
    }

    return { data: filtered, count: total };
  }

  async getListingById(id: string): Promise<LocalListing | null> {
    const listing = this.listings.find(l => l.id === id);
    if (listing) {
      // Increment view count
      listing.view_count++;
      listing.updated_at = new Date().toISOString();
    }
    return listing || null;
  }

  async updateListing(id: string, updates: Partial<LocalListing>): Promise<LocalListing | null> {
    const index = this.listings.findIndex(l => l.id === id);
    if (index === -1) return null;

    this.listings[index] = {
      ...this.listings[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return this.listings[index];
  }

  async deleteListing(id: string): Promise<boolean> {
    const index = this.listings.findIndex(l => l.id === id);
    if (index === -1) return false;

    this.listings.splice(index, 1);
    return true;
  }

  // Category operations
  async getCategories(): Promise<LocalCategory[]> {
    return [...this.categories];
  }

  async getCategoryBySlug(slug: string): Promise<LocalCategory | null> {
    return this.categories.find(c => c.slug === slug) || null;
  }

  async getCategoryById(id: string): Promise<LocalCategory | null> {
    return this.categories.find(c => c.id === id) || null;
  }

  // Create category (for dynamic category creation)
  async createCategory(data: { name: string; slug: string; description?: string }): Promise<LocalCategory> {
    const category: LocalCategory = {
      id: `cat-${this.nextId++}`,
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      is_active: true,
      created_at: new Date().toISOString()
    };

    this.categories.push(category);
    return category;
  }

  // Clear all data (for testing)
  async clearAll(): Promise<void> {
    this.listings = [];
    this.initializeData();
    this.nextId = 1;
  }

  // Get statistics for dashboard
  async getStats(user_id?: string) {
    const userListings = user_id ? this.listings.filter(l => l.user_id === user_id) : this.listings;
    
    return {
      totalListings: userListings.length,
      activeListings: userListings.filter(l => l.status === 'active').length,
      totalViews: userListings.reduce((sum, l) => sum + l.view_count, 0),
      featuredListings: userListings.filter(l => l.is_featured).length
    };
  }
}

// Singleton instance
export const localDB = new LocalDatabase();
