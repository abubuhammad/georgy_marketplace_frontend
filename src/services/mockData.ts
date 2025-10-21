import { Category, Product } from '@/types';

// Mock categories data
export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic devices and gadgets',
    icon: 'Smartphone',
    parent_id: null,
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing, shoes, and accessories',
    icon: 'Shirt',
    parent_id: null,
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Home appliances and garden items',
    icon: 'Home',
    parent_id: null,
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Vehicles',
    slug: 'vehicles',
    description: 'Cars, motorcycles, and automotive',
    icon: 'Car',
    parent_id: null,
    sort_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Real Estate',
    slug: 'real-estate',
    description: 'Properties for sale and rent',
    icon: 'Building',
    parent_id: null,
    sort_order: 5,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Jobs',
    slug: 'jobs',
    description: 'Job opportunities and career',
    icon: 'Briefcase',
    parent_id: null,
    sort_order: 6,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '7',
    name: 'Services',
    slug: 'services',
    description: 'Professional and personal services',
    icon: 'Users',
    parent_id: null,
    sort_order: 7,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '8',
    name: 'Sports & Recreation',
    slug: 'sports-recreation',
    description: 'Sports equipment and recreational items',
    icon: 'Activity',
    parent_id: null,
    sort_order: 8,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Mock products data
export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max',
    description: 'Latest iPhone with advanced camera system and titanium design. Excellent condition, barely used.',
    category_id: '1',
    subcategory_id: '1',
    user_id: '1',
    price: 450000,
    original_price: 500000,
    currency: 'NGN',
    condition: 'new',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    location_city: 'Lagos',
    location_state: 'Lagos',
    location_country: 'Nigeria',
    is_negotiable: true,
    is_featured: true,
    status: 'active',
    view_count: 245,
    like_count: 38,
    images: [
      {
        id: '1',
        listing_id: '1',
        image_url: '/api/placeholder/400/300',
        alt_text: 'iPhone 15 Pro Max',
        sort_order: 1,
        created_at: new Date().toISOString()
      }
    ],
    category: { id: '1', name: 'Electronics', slug: 'electronics' },
    user: {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      avatar_url: null,
      is_verified: true
    },
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'MacBook Pro M3',
    description: 'Brand new MacBook Pro with M3 chip, 16GB RAM, 512GB SSD. Perfect for professionals.',
    category_id: '1',
    subcategory_id: '1',
    user_id: '2',
    price: 680000,
    currency: 'NGN',
    condition: 'new',
    brand: 'Apple',
    model: 'MacBook Pro M3',
    location_city: 'Abuja',
    location_state: 'FCT',
    location_country: 'Nigeria',
    is_negotiable: false,
    is_featured: true,
    status: 'active',
    view_count: 189,
    like_count: 45,
    images: [
      {
        id: '2',
        listing_id: '2',
        image_url: '/api/placeholder/400/300',
        alt_text: 'MacBook Pro M3',
        sort_order: 1,
        created_at: new Date().toISOString()
      }
    ],
    category: { id: '1', name: 'Electronics', slug: 'electronics' },
    user: {
      id: '2',
      first_name: 'Jane',
      last_name: 'Smith',
      avatar_url: null,
      is_verified: true
    },
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Nike Air Jordan 1',
    description: 'Original Nike Air Jordan 1 in excellent condition. Size 42. Comes with original box.',
    category_id: '2',
    subcategory_id: '2',
    user_id: '3',
    price: 85000,
    currency: 'NGN',
    condition: 'used',
    brand: 'Nike',
    model: 'Air Jordan 1',
    location_city: 'Lagos',
    location_state: 'Lagos',
    location_country: 'Nigeria',
    is_negotiable: true,
    is_featured: false,
    status: 'active',
    view_count: 156,
    like_count: 23,
    images: [
      {
        id: '3',
        listing_id: '3',
        image_url: '/api/placeholder/400/300',
        alt_text: 'Nike Air Jordan 1',
        sort_order: 1,
        created_at: new Date().toISOString()
      }
    ],
    category: { id: '2', name: 'Fashion', slug: 'fashion' },
    user: {
      id: '3',
      first_name: 'Mike',
      last_name: 'Johnson',
      avatar_url: null,
      is_verified: false
    },
    created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Toyota Camry 2019',
    description: 'Well maintained Toyota Camry 2019 model. Low mileage, full service history.',
    category_id: '4',
    subcategory_id: '4',
    user_id: '4',
    price: 8500000,
    currency: 'NGN',
    condition: 'used',
    brand: 'Toyota',
    model: 'Camry 2019',
    location_city: 'Port Harcourt',
    location_state: 'Rivers',
    location_country: 'Nigeria',
    is_negotiable: true,
    is_featured: true,
    status: 'active',
    view_count: 412,
    like_count: 67,
    images: [
      {
        id: '4',
        listing_id: '4',
        image_url: '/api/placeholder/400/300',
        alt_text: 'Toyota Camry 2019',
        sort_order: 1,
        created_at: new Date().toISOString()
      }
    ],
    category: { id: '4', name: 'Vehicles', slug: 'vehicles' },
    user: {
      id: '4',
      first_name: 'Sarah',
      last_name: 'Williams',
      avatar_url: null,
      is_verified: true
    },
    created_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Samsung Galaxy S24 Ultra',
    description: 'Latest Samsung Galaxy S24 Ultra with S Pen. 256GB storage, excellent camera quality.',
    category_id: '1',
    subcategory_id: '1',
    user_id: '5',
    price: 380000,
    currency: 'NGN',
    condition: 'new',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    location_city: 'Kano',
    location_state: 'Kano',
    location_country: 'Nigeria',
    is_negotiable: true,
    is_featured: false,
    status: 'active',
    view_count: 198,
    like_count: 31,
    images: [
      {
        id: '5',
        listing_id: '5',
        image_url: '/api/placeholder/400/300',
        alt_text: 'Samsung Galaxy S24 Ultra',
        sort_order: 1,
        created_at: new Date().toISOString()
      }
    ],
    category: { id: '1', name: 'Electronics', slug: 'electronics' },
    user: {
      id: '5',
      first_name: 'David',
      last_name: 'Brown',
      avatar_url: null,
      is_verified: true
    },
    created_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    updated_at: new Date().toISOString()
  }
];

// Helper functions for mock data
export const getFeaturedProducts = (limit: number = 8): Product[] => {
  return mockProducts.filter(p => p.is_featured).slice(0, limit);
};

export const getRecentProducts = (limit: number = 12): Product[] => {
  return mockProducts.slice(0, limit);
};

export const getProductsByCategory = (categoryId: string, limit?: number): Product[] => {
  const filtered = mockProducts.filter(p => p.category_id === categoryId);
  return limit ? filtered.slice(0, limit) : filtered;
};

export const searchProducts = (query: string, limit?: number): Product[] => {
  const filtered = mockProducts.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase()) ||
    p.brand?.toLowerCase().includes(query.toLowerCase())
  );
  return limit ? filtered.slice(0, limit) : filtered;
};
