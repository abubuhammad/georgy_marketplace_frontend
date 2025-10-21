import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MapPin, Star, Heart, ShoppingCart, Briefcase, Home as HomeIcon, Car, Smartphone, Shirt, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserDropdown } from '@/components/ui/user-dropdown';
import { useAppContext } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import categoryService from '@/services/categoryService';
import productService from '@/services/productService';
import { Category, Product } from '@/types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentPlatform, setPlatform, searchQuery, setSearchQuery } = useAppContext();
  const { user } = useAuthContext();
  const { itemCount } = useCart();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // Get dashboard route based on user role
  const getDashboardRoute = (userRole: string) => {
    switch (userRole) {
      case 'seller':
        return '/seller/dashboard';
      case 'admin':
        return '/admin';
      case 'customer':
        return '/customer/dashboard';
      case 'delivery':
        return '/delivery/dashboard';
      case 'realtor':
        return '/realtor/dashboard';
      case 'house_agent':
        return '/house-agent/dashboard';
      case 'house_owner':
        return '/house-owner/dashboard';
      case 'employer':
        return '/employer/dashboard';
      case 'job_seeker':
        return '/job-seeker/dashboard';
      case 'artisan':
        return '/artisan/dashboard';
      default:
        return '/customer/dashboard';
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load categories
      const { data: categoriesData } = await categoryService.getMainCategories();
      if (categoriesData) {
        setCategories(categoriesData.slice(0, 8)); // Show first 8 categories
      }

      // Load featured products
      const { data: featuredData } = await productService.getFeaturedProducts(8);
      if (featuredData) {
        setFeaturedProducts(featuredData);
      }

      // Load recent products
      const { data: recentData } = await productService.getProducts({}, 1, 12);
      if (recentData && recentData.data) {
        setRecentProducts(recentData.data);
      }
    } catch (error) {
      console.error('Error loading homepage data:', error);
      
      // Set fallback data for development
      setCategories([
        { id: '1', name: 'Electronics', slug: 'electronics', icon: 'Smartphone', description: 'Electronic devices', parent_id: null, sort_order: 1, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '2', name: 'Fashion', slug: 'fashion', icon: 'Shirt', description: 'Clothing and accessories', parent_id: null, sort_order: 2, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '3', name: 'Home & Garden', slug: 'home-garden', icon: 'HomeIcon', description: 'Home and garden items', parent_id: null, sort_order: 3, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '4', name: 'Vehicles', slug: 'vehicles', icon: 'Car', description: 'Cars and vehicles', parent_id: null, sort_order: 4, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ]);
      
      const mockProduct = {
        id: '1',
        title: 'Sample Product',
        description: 'This is a sample product for demonstration',
        price: 25000,
        currency: 'NGN',
        condition: 'new' as const,
        brand: 'Sample Brand',
        location_city: 'Lagos',
        location_state: 'Lagos',
        is_negotiable: true,
        is_featured: true,
        status: 'active' as const,
        view_count: 150,
        like_count: 25,
        images: [{ id: '1', listing_id: '1', image_url: '/api/placeholder/300/200', alt_text: 'Sample product', sort_order: 1, created_at: new Date().toISOString() }],
        category: { id: '1', name: 'Electronics', slug: 'electronics' },
        user: { id: '1', first_name: 'John', last_name: 'Doe', avatar_url: null, is_verified: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setFeaturedProducts([mockProduct, { ...mockProduct, id: '2', title: 'Featured Product 2' }]);
      setRecentProducts([mockProduct, { ...mockProduct, id: '3', title: 'Recent Product 1' }, { ...mockProduct, id: '4', title: 'Recent Product 2' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const categoryIcons = {
    'electronics': <Smartphone className="w-6 h-6" />,
    'vehicles': <Car className="w-6 h-6" />,
    'real-estate': <Building className="w-6 h-6" />,
    'fashion': <Shirt className="w-6 h-6" />,
    'home-garden': <HomeIcon className="w-6 h-6" />,
    'jobs': <Briefcase className="w-6 h-6" />,
  };

  const platformColors = {
    'ecommerce': 'bg-primary',
    'realestate': 'bg-blue-600',
    'jobs': 'bg-purple-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Platform Switcher */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">Georgy Marketplace</h1>
              <div className="flex items-center space-x-2">
                <Button
                  variant={currentPlatform === 'ecommerce' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlatform('ecommerce')}
                >
                  Marketplace
                </Button>
                <Button
                  variant={currentPlatform === 'realestate' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlatform('realestate')}
                >
                  Real Estate
                </Button>
                <Button
                  variant={currentPlatform === 'jobs' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlatform('jobs')}
                >
                  Jobs
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
              <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/post-ad')}>
              <Plus className="w-4 h-4 mr-1" />
              Post Ad
              </Button>
              <Button variant="outline" size="sm" className="relative" onClick={() => navigate('/cart')}>
                <ShoppingCart className="w-4 h-4" />
              {itemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                    {itemCount}
                  </Badge>
              )}
              </Button>
              <UserDropdown user={user} />
              </div>
              ) : (
              <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
              Sign In
              </Button>
              <Button size="sm" onClick={() => navigate('/post-ad')}>
                <Plus className="w-4 h-4 mr-1" />
                Post Ad
              </Button>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {currentPlatform === 'ecommerce' && 'Find Everything You Need'}
              {currentPlatform === 'realestate' && 'Your Dream Home Awaits'}
              {currentPlatform === 'jobs' && 'Your Next Opportunity'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {currentPlatform === 'ecommerce' && 'Buy and sell with confidence on Nigeria\'s trusted marketplace'}
              {currentPlatform === 'realestate' && 'Discover properties from verified realtors and agents'}
              {currentPlatform === 'jobs' && 'Connect with employers and find your perfect job match'}
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex rounded-lg overflow-hidden shadow-lg">
                <Input
                  type="text"
                  placeholder={
                    currentPlatform === 'ecommerce' ? 'What are you looking for?' :
                    currentPlatform === 'realestate' ? 'Search properties by location or type...' :
                    'Search jobs by title, company, or location...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 text-lg py-4 px-6 focus:ring-0"
                />
                <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90 px-8">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Browse Categories
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories?.map((category) => (
              <Card 
                key={category.id} 
                className="group hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-3 border-0 bg-gradient-to-br from-white to-gray-50 hover:from-primary/5 hover:to-accent/5" 
                onClick={() => navigate(`/products?category=${category.id}`)}
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl">
                      {categoryIcons[category.slug as keyof typeof categoryIcons] || <HomeIcon className="w-8 h-8 text-primary" />}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 group-hover:text-gray-700 transition-colors duration-300">
                    {category.description || 'Explore this category'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold">Featured Listings</h2>
              <Button variant="outline" onClick={() => navigate('/products?featured=true')}>View All</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                  <div className="relative">
                    <img
                      src={product.images?.[0]?.image_url || '/api/placeholder/300/200'}
                      alt={product.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 left-2 bg-accent">
                      Featured
                    </Badge>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Added to favorites:', product.title);
                      }}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {product.title}
                    </CardTitle>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-primary">
                        ₦{product.price.toLocaleString()}
                      </span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm ml-1">{product.rating || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {product.location_city}, {product.location_state}
                    </div>
                    <Button className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Listings */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Recent Listings</h2>
            <Button variant="outline">View All</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentProducts?.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                <div className="relative">
                  <img
                    src={product.images?.[0]?.image_url || '/api/placeholder/300/200'}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Added to favorites:', product.title);
                    }}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2 line-clamp-2">
                    {product.title}
                  </CardTitle>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold text-primary">
                      ₦{product.price.toLocaleString()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {product.condition}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {product.location_city}, {product.location_state}
                  </div>
                  <Button className="w-full" size="sm">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-xl opacity-90">Active Listings</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-xl opacity-90">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1,000+</div>
              <div className="text-xl opacity-90">Verified Sellers</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to start selling?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of successful sellers on Nigeria's most trusted marketplace
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Plus className="w-5 h-5 mr-2" />
              Post Your First Ad
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
