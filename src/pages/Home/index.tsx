import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import SearchBar from '@/components/SearchBar';
import CategoryNav from '@/components/CategoryNav';
import { ProductCard, Product } from '@/components/domain/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/common/Button';
import { ChevronRight, Star, Truck, Shield, Award } from '@/assets/icons';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Samsung Galaxy S24 Ultra',
    price: 850000,
    originalPrice: 950000,
    image: '/placeholder.svg',
    rating: 4.5,
    reviewCount: 1250,
    discount: 11,
    inStock: true,
    category: 'Electronics'
  },
  {
    id: '2',
    name: 'Nike Air Max 270',
    price: 45000,
    originalPrice: 55000,
    image: '/placeholder.svg',
    rating: 4.3,
    reviewCount: 890,
    discount: 18,
    inStock: true,
    category: 'Fashion'
  },
  {
    id: '3',
    name: 'MacBook Pro M3',
    price: 1200000,
    image: '/placeholder.svg',
    rating: 4.8,
    reviewCount: 456,
    inStock: true,
    category: 'Electronics'
  },
  {
    id: '4',
    name: 'Adidas Ultraboost 22',
    price: 38000,
    originalPrice: 48000,
    image: '/placeholder.svg',
    rating: 4.2,
    reviewCount: 234,
    discount: 21,
    inStock: false,
    category: 'Fashion'
  }
];

const categories = [
  { name: 'Electronics', icon: '📱', count: '10K+' },
  { name: 'Fashion', icon: '👕', count: '5K+' },
  { name: 'Home & Garden', icon: '🏠', count: '3K+' },
  { name: 'Sports', icon: '⚽', count: '2K+' },
  { name: 'Books', icon: '📚', count: '1K+' },
  { name: 'Beauty', icon: '💄', count: '800+' }
];

const HomePage: React.FC = () => {
  const { addItem } = useCart();

  const handleAddToCart = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      addItem(product);
    }
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // TODO: Implement search functionality
  };

  const handleCategorySelect = (category: unknown) => {
    console.log('Selected category:', category);
    // TODO: Implement category filtering
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CategoryNav onCategorySelect={handleCategorySelect} />
      
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome to Georgy Marketplace
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100">
              Discover amazing products at unbeatable prices
            </p>
            
            {/* Prominent Search Bar */}
            <div className="max-w-3xl mx-auto mb-8">
              <SearchBar 
                onSearch={handleSearch}
                placeholder="What are you looking for?"
                className="mx-auto"
              />
            </div>
            
            <Button size="lg" variant="secondary" icon={ChevronRight}>
              Shop Now
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div key={category.name} className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} items</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Truck className="mx-auto mb-4 text-red-600" size={48} />
              <h3 className="text-xl font-semibold mb-2">Free Delivery</h3>
              <p className="text-gray-600">Free shipping on orders over ₦50,000</p>
            </div>
            <div className="text-center">
              <Shield className="mx-auto mb-4 text-red-600" size={48} />
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">100% secure payment processing</p>
            </div>
            <div className="text-center">
              <Award className="mx-auto mb-4 text-red-600" size={48} />
              <h3 className="text-xl font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">30-day money back guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;