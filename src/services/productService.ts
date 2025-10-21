import { generateMockData, mockStorage } from '@/lib/mockData';
import { Product, SearchFilters, PaginatedResponse } from '@/types';
import { productApiService } from './productService-api';
import { apiClient } from '@/lib/apiClient';

export interface CreateProductData {
  // Core fields present in all categories
  title?: string;
  productName?: string; // For groceries
  description: string;
  categoryId: string;
  subcategoryId?: string;
  price: number;
  originalPrice?: number;
  condition?: 'new' | 'used' | 'refurbished' | 'like-new' | 'excellent' | 'good' | 'fair';
  brand?: string;
  model?: string;
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
  isNegotiable?: boolean;
  images: File[];
  
  // Dynamic fields that vary by category
  [key: string]: any;
  
  // Electronics specific fields
  storage?: string;
  display?: string;
  camera?: string;
  battery?: string;
  processor?: string;
  connectivity?: string;
  otherFeatures?: string;
  inBoxAccessories?: string;
  warranty?: string;
  
  // Groceries specific fields
  netWeight?: string;
  unit?: string;
  packagingType?: string;
  ingredients?: string;
  nutritionFacts?: string;
  allergenInfo?: string;
  origin?: string;
  grade?: string;
  processingType?: string;
  shelfLife?: string;
  storageInstructions?: string;
  stockQuantity?: number;
  minimumOrderQuantity?: number;
  discountPrice?: number;
  features?: string;
  sku?: string;
  tags?: string;
  deliveryNotes?: string;
  seasonalAvailability?: string;
  
  // Fashion specific fields
  size?: string | string[];
  color?: string;
  material?: string;
  
  // Category field (can be subcategory for some categories)
  category?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

// Mock products data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro (256 GB)',
    description: 'The iPhone 15 Pro features a titanium design with the powerful A17 Pro chip, advanced camera system with 48MP main camera, and innovative Action Button. Experience next-level photography with 5x telephoto zoom, studio-quality portraits, and advanced computational photography.',
    price: 620000,
    originalPrice: 680000,
    discount: 8.8,
    images: ['/api/placeholder/300/300'],
    category: { id: '1', name: 'Electronics', slug: 'electronics', isActive: true },
    subcategory: 'Smartphones',
    brand: 'Apple',
    rating: 4.8,
    reviewCount: 125,
    inStock: true,
    stockQuantity: 5,
    sellerId: 'seller_001',
    seller: {
      id: 'seller_001',
      userId: 'user_001',
      user: {
        id: 'user_001',
        email: 'seller@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'seller',
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: true
      },
      businessName: 'Tech Store',
      businessDescription: 'Quality electronics',
      businessAddress: {
        street: '123 Main St',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        postalCode: '100001'
      },
      businessPhone: '+234-123-456-7890',
      businessEmail: 'info@techstore.com',
      logo: null,
      rating: 4.5,
      reviewCount: 50,
      isVerified: true,
      documents: [],
      createdAt: new Date().toISOString()
    },
    specifications: {
      'Brand': 'Apple',
      'Model': 'iPhone 15 Pro',
      'Storage': '256GB',
      'RAM': '8GB',
      'Display': '6.1-inch Super Retina XDR OLED, 2556×1179, 120Hz ProMotion',
      'Camera': '48MP Main + 12MP Ultra Wide + 12MP Telephoto (5x zoom)',
      'Front Camera': '12MP TrueDepth with Portrait mode',
      'Battery': 'Up to 23 hours video playback',
      'Processor': 'A17 Pro chip with 6-core CPU, 6-core GPU, 16-core Neural Engine',
      'Connectivity': '5G, Wi-Fi 6E, Bluetooth 5.3, USB-C',
      'Other Features': 'Face ID, Action Button, MagSafe, Ceramic Shield front',
      'In-box Accessories': 'USB-C to USB-C Cable, Documentation',
      'Warranty': '1 Year Limited Warranty + 90 Days Complimentary Support',
      'Color': 'Natural Titanium'
    },
    tags: ['smartphone', 'apple', 'iphone', '5g', 'pro', 'titanium', 'new'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Samsung 4K Smart TV',
    description: 'Large screen smart TV with excellent picture quality',
    price: 280000,
    originalPrice: 320000,
    discount: 12.5,
    images: ['/api/placeholder/300/300'],
    category: { id: '1', name: 'Electronics', slug: 'electronics', isActive: true },
    subcategory: 'TVs',
    brand: 'Samsung',
    rating: 4.6,
    reviewCount: 89,
    inStock: true,
    stockQuantity: 3,
    sellerId: 'seller_002',
    seller: {
      id: 'seller_002',
      userId: 'user_002',
      user: {
        id: 'user_002',
        email: 'seller2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'seller',
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: true
      },
      businessName: 'Electronics Hub',
      businessDescription: 'Home appliances and electronics',
      businessAddress: {
        street: '456 Market St',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        postalCode: '100002'
      },
      businessPhone: '+234-123-456-7891',
      businessEmail: 'info@electronicshub.com',
      logo: null,
      rating: 4.3,
      reviewCount: 75,
      isVerified: true,
      documents: [],
      createdAt: new Date().toISOString()
    },
    specifications: {
      'Screen Size': '55 inches',
      'Resolution': '4K UHD',
      'Smart TV': 'Yes'
    },
    tags: ['tv', 'samsung', 'smart', '4k'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'MacBook Pro 13"',
    description: 'Powerful laptop for professionals',
    price: 850000,
    images: ['/api/placeholder/300/300'],
    category: { id: '1', name: 'Electronics', slug: 'electronics', isActive: true },
    subcategory: 'Laptops',
    brand: 'Apple',
    rating: 4.9,
    reviewCount: 234,
    inStock: true,
    stockQuantity: 2,
    sellerId: 'seller_001',
    seller: {
      id: 'seller_001',
      userId: 'user_001',
      user: {
        id: 'user_001',
        email: 'seller@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'seller',
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: true
      },
      businessName: 'Tech Store',
      businessDescription: 'Quality electronics',
      businessAddress: {
        street: '123 Main St',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        postalCode: '100001'
      },
      businessPhone: '+234-123-456-7890',
      businessEmail: 'info@techstore.com',
      logo: null,
      rating: 4.5,
      reviewCount: 50,
      isVerified: true,
      documents: [],
      createdAt: new Date().toISOString()
    },
    specifications: {
      'Processor': 'M2 Chip',
      'RAM': '16GB',
      'Storage': '512GB SSD'
    },
    tags: ['laptop', 'apple', 'macbook', 'professional'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

class ProductService {
  private static useBackend: boolean = true;
  private static initialized: boolean = false;

  // Initialize and determine which mode to use
  static async initialize(): Promise<boolean> {
    if (this.initialized) {
      return this.useBackend;
    }

    try {
      this.useBackend = await apiClient.isBackendReachable();
      this.initialized = true;
      
      console.log(`📦 Products service mode: ${this.useBackend ? 'API Backend' : 'Mock Data'}`);
      return this.useBackend;
    } catch (error) {
      console.error('Product service initialization error:', error);
      this.useBackend = false;
      this.initialized = true;
      return false;
    }
  }

  // Create new product listing
  async createProduct(userId: string, productData: CreateProductData) {
    if (!ProductService.initialized) {
      await ProductService.initialize();
    }

    if (ProductService.useBackend) {
      try {
        // Convert File objects to URLs - in a real app you'd upload to a file service
        // For now, generate placeholder URLs based on file names
        const productDataWithImageUrls = {
          ...productData,
          images: productData.images.map((file, index) => {
            if (file instanceof File) {
              // Generate a realistic image URL for demo purposes
              return `/api/placeholder/400/300?id=${Date.now()}_${index}`;
            }
            return file;
          }) as string[]
        };
        
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(productDataWithImageUrls)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          return { data: null, error: errorData.error || 'Failed to create product' };
        }
        
        const result = await response.json();
        return { data: result.data, error: null };
      } catch (error) {
        console.error('Error creating product:', error);
        return { data: null, error: (error as Error).message };
      }
    }
    try {
      // Create new product with mock data structure
      const newProduct: Product = {
        id: `product_${Date.now()}`,
        name: productData.title,
        description: productData.description,
        price: productData.price,
        originalPrice: productData.originalPrice,
        discount: productData.originalPrice ? 
          ((productData.originalPrice - productData.price) / productData.originalPrice) * 100 : 0,
        images: ['/api/placeholder/300/300'], // Mock image URLs
        category: { 
          id: productData.categoryId, 
          name: 'Category Name', 
          slug: 'category-slug', 
          isActive: true 
        },
        subcategory: productData.subcategoryId,
        brand: productData.brand,
        rating: 0,
        reviewCount: 0,
        inStock: true,
        stockQuantity: 1,
        sellerId: userId,
        seller: mockProducts[0].seller, // Use mock seller data
        specifications: {},
        tags: [productData.brand?.toLowerCase() || '', productData.condition].filter(Boolean),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to mock storage
      if (!mockStorage.products) mockStorage.products = [...mockProducts];
      mockStorage.products.push(newProduct);

      // Also add to seller inventory for consistency
      if (!mockStorage.sellerInventory) mockStorage.sellerInventory = [];
      const inventoryItem = {
        id: `inv-${newProduct.id}`,
        productId: newProduct.id,
        sellerId: userId,
        product: {
          id: newProduct.id,
          title: newProduct.name,
          sku: `SKU-${Date.now()}`,
          price: newProduct.price,
          category: productData.categoryId,
          images: newProduct.images.map(url => ({ image_url: url }))
        },
        quantity: productData.stockQuantity || 1,
        availableQuantity: productData.stockQuantity || 1,
        reservedQuantity: 0,
        reorderLevel: 5,
        cost: newProduct.price * 0.8, // Assume 20% margin
        lastUpdated: new Date().toISOString(),
        status: 'active'
      };
      mockStorage.sellerInventory.push(inventoryItem);

      console.log('Product created:', newProduct.name);
      return { data: newProduct, error: null };
    } catch (error) {
      console.error('Error creating product:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Get paginated products with filters
  async getProducts(filters: SearchFilters = {}, page: number = 1, limit: number = 20): Promise<{ data: PaginatedResponse<Product> | null; error: string | null }> {
    if (!ProductService.initialized) {
      await ProductService.initialize();
    }

    if (ProductService.useBackend) {
      console.log('🔗 Using backend API for products');
      // Ensure pagination values are passed to API layer
      const result = await productApiService.getProducts({
        ...filters,
        page,
        limit,
      } as any);
      console.log('🔍 Backend API result:', result);
      return result;
    }
    try {
      // Initialize products if not exists
      if (!mockStorage.products) mockStorage.products = [...mockProducts];
      
      let filteredProducts = [...mockStorage.products];

      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.brand?.toLowerCase().includes(searchTerm) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      // Apply category filter
      if (filters.category) {
        filteredProducts = filteredProducts.filter(product =>
          product.category.slug === filters.category
        );
      }

      // Apply price range filter
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

      // Apply brand filter
      if (filters.brand) {
        filteredProducts = filteredProducts.filter(product =>
          product.brand?.toLowerCase() === filters.brand!.toLowerCase()
        );
      }

      // Apply condition filter
      if (filters.condition) {
        filteredProducts = filteredProducts.filter(product =>
          product.tags.includes(filters.condition!)
        );
      }

      // Apply location filter
      if (filters.location) {
        // Mock location filtering - in real app would use proper geo-search
        filteredProducts = filteredProducts.filter(product =>
          product.seller.businessAddress.city.toLowerCase().includes(filters.location!.toLowerCase()) ||
          product.seller.businessAddress.state.toLowerCase().includes(filters.location!.toLowerCase())
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
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
          case 'newest':
            filteredProducts.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            break;
          case 'popularity':
            filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
            break;
          default:
            break;
        }
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      const paginatedProducts = filteredProducts.slice(offset, offset + limit);

      console.log(`Retrieved ${paginatedProducts.length} products (page ${page})`);
      
      return {
        data: {
          data: paginatedProducts,
          pagination: {
            page,
            limit,
            total: filteredProducts.length,
            pages: Math.ceil(filteredProducts.length / limit)
          }
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Get single product by ID
  async getProductById(id: string): Promise<{ data: Product | null; error: string | null }> {
    if (!ProductService.initialized) {
      await ProductService.initialize();
    }

    if (ProductService.useBackend) {
      const result = await productApiService.getProductById(id);
      return { data: result, error: null };
    }
    try {
      if (!mockStorage.products) mockStorage.products = [...mockProducts];
      
      const product = mockStorage.products.find(p => p.id === id);
      if (product) {
        console.log('Retrieved product:', product.name);
        return { data: product, error: null };
      }
      return { data: null, error: 'Product not found' };
    } catch (error) {
      console.error('Error getting product:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Update product
  async updateProduct(productData: UpdateProductData) {
    try {
      if (!mockStorage.products) mockStorage.products = [...mockProducts];
      
      const productIndex = mockStorage.products.findIndex(p => p.id === productData.id);
      if (productIndex === -1) {
        return { data: null, error: 'Product not found' };
      }

      // Update product data
      const updatedProduct = {
        ...mockStorage.products[productIndex],
        name: productData.title || mockStorage.products[productIndex].name,
        description: productData.description || mockStorage.products[productIndex].description,
        price: productData.price || mockStorage.products[productIndex].price,
        originalPrice: productData.originalPrice || mockStorage.products[productIndex].originalPrice,
        brand: productData.brand || mockStorage.products[productIndex].brand,
        updatedAt: new Date().toISOString()
      };

      mockStorage.products[productIndex] = updatedProduct;
      
      console.log('Product updated:', updatedProduct.name);
      return { data: updatedProduct, error: null };
    } catch (error) {
      console.error('Error updating product:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Delete product
  async deleteProduct(id: string) {
    try {
      if (!mockStorage.products) mockStorage.products = [...mockProducts];
      
      const productIndex = mockStorage.products.findIndex(p => p.id === id);
      if (productIndex === -1) {
        return { success: false, error: 'Product not found' };
      }

      mockStorage.products.splice(productIndex, 1);
      
      console.log('Product deleted:', id);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Get products by seller
  async getSellerProducts(sellerId: string): Promise<Product[]> {
    try {
      if (!mockStorage.products) mockStorage.products = [...mockProducts];
      
      const sellerProducts = mockStorage.products.filter(p => p.sellerId === sellerId);
      console.log(`Found ${sellerProducts.length} products for seller`);
      return sellerProducts;
    } catch (error) {
      console.error('Error getting seller products:', error);
      return [];
    }
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 8): Promise<{ data: Product[] | null; error: string | null }> {
    if (!ProductService.initialized) {
      await ProductService.initialize();
    }

    // Prefer backend when available
    if (ProductService.useBackend) {
      try {
        const data = await productApiService.getFeaturedProducts(limit);
        console.log(`Retrieved ${Array.isArray(data) ? data.length : 0} featured products from API`);
        return { data: Array.isArray(data) ? data : [], error: null };
      } catch (e) {
        console.warn('Falling back to mock featured products due to API error:', e);
      }
    }

    try {
      if (!mockStorage.products) mockStorage.products = [...mockProducts];
      
      // Return highest rated products as featured
      const featured = [...mockStorage.products]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
      
      console.log(`Retrieved ${featured.length} featured products`);
      return { data: featured, error: null };
    } catch (error) {
      console.error('Error getting featured products:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Get similar products
  async getSimilarProducts(productId: string, categoryId: string, limit: number = 4): Promise<{ data: Product[] | null; error: string | null }> {
    try {
      if (!mockStorage.products) mockStorage.products = [...mockProducts];
      
      const similar = mockStorage.products
        .filter(p => p.id !== productId && p.category.id === categoryId)
        .slice(0, limit);
      
      console.log(`Retrieved ${similar.length} similar products`);
      return { data: similar, error: null };
    } catch (error) {
      console.error('Error getting similar products:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  // Toggle favorite product
  async toggleFavorite(userId: string, productId: string): Promise<{ isFavorited: boolean; error: string | null }> {
    try {
      // Mock implementation - in real app would save to database
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const isCurrentlyFavorited = favorites.includes(productId);
      
      if (isCurrentlyFavorited) {
        const newFavorites = favorites.filter((id: string) => id !== productId);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
      } else {
        favorites.push(productId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
      }
      
      const isFavorited = !isCurrentlyFavorited;
      console.log(`Product ${productId} ${isFavorited ? 'added to' : 'removed from'} favorites`);
      return { isFavorited, error: null };
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { isFavorited: false, error: (error as Error).message };
    }
  }

  // Search suggestions
  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      if (!mockStorage.products) mockStorage.products = [...mockProducts];
      
      const suggestions: Set<string> = new Set();
      const queryLower = query.toLowerCase();

      mockStorage.products.forEach(product => {
        // Add product name if it matches
        if (product.name.toLowerCase().includes(queryLower)) {
          suggestions.add(product.name);
        }
        
        // Add brand if it matches
        if (product.brand?.toLowerCase().includes(queryLower)) {
          suggestions.add(product.brand);
        }
        
        // Add category if it matches
        if (product.category.name.toLowerCase().includes(queryLower)) {
          suggestions.add(product.category.name);
        }
      });

      const result = Array.from(suggestions).slice(0, 10);
      console.log(`Generated ${result.length} search suggestions`);
      return result;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }
}

// Initialize mock products storage
if (!mockStorage.products) {
  mockStorage.products = [...mockProducts];
}

export const productService = new ProductService();
export default productService;
