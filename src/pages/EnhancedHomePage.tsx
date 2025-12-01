import React, { useState, useEffect, lazy, Suspense, memo, useCallback, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, MapPin, Star, Heart, ShoppingCart, Briefcase, Home as HomeIcon, Car, Smartphone, Shirt, Building, ArrowRight, Users, ShieldCheck, Package, TrendingUp, Activity, Book, Baby, Key, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserDropdown } from '@/components/ui/user-dropdown';
import { useAppContext } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import categoryApiService, { Category as ApiCategory } from '@/services/categoryApiService';
import productService from '@/services/productService';
import { propertyService, Property } from '@/services/propertyService';
import { Category, Product } from '@/types';
import { HeroSection } from '@/components/enhanced/HeroSection';
import { EnhancedProductCard } from '@/components/enhanced/ProductCard';
import { ProductSkeletonGrid, CategorySkeletonGrid } from '@/components/ui/product-skeleton';
import { MainLayout } from '@/components/layout/MainLayout';
import JobService from '@/services/jobService';
import type { Job } from '@/features/job/types';

// Default categories as fallback when API is unavailable
const defaultProductCategories: ApiCategory[] = [
  { id: '1', name: 'Electronics', slug: 'electronics', metadata: { icon: 'Smartphone', color: 'from-blue-500 to-purple-600', type: 'product' }, createdAt: '', updatedAt: '' },
  { id: '2', name: 'Fashion', slug: 'fashion', metadata: { icon: 'Shirt', color: 'from-pink-500 to-rose-600', type: 'product' }, createdAt: '', updatedAt: '' },
  { id: '3', name: 'Home & Garden', slug: 'home-garden', metadata: { icon: 'Home', color: 'from-green-500 to-emerald-600', type: 'product' }, createdAt: '', updatedAt: '' },
  { id: '4', name: 'Vehicles', slug: 'vehicles', metadata: { icon: 'Car', color: 'from-orange-500 to-red-600', type: 'product' }, createdAt: '', updatedAt: '' },
  { id: '5', name: 'Sports', slug: 'sports', metadata: { icon: 'Activity', color: 'from-teal-500 to-cyan-600', type: 'product' }, createdAt: '', updatedAt: '' },
  { id: '6', name: 'Books', slug: 'books', metadata: { icon: 'Book', color: 'from-amber-500 to-yellow-600', type: 'product' }, createdAt: '', updatedAt: '' },
  { id: '7', name: 'Health & Beauty', slug: 'health-beauty', metadata: { icon: 'Heart', color: 'from-purple-500 to-indigo-600', type: 'product' }, createdAt: '', updatedAt: '' },
  { id: '8', name: 'Baby & Kids', slug: 'baby-kids', metadata: { icon: 'Baby', color: 'from-rose-400 to-pink-500', type: 'product' }, createdAt: '', updatedAt: '' }
];

const defaultPropertyCategories: ApiCategory[] = [
  { id: 'residential', name: 'Residential', slug: 'residential', metadata: { icon: 'Home', color: 'from-emerald-500 to-teal-600', type: 'property' }, createdAt: '', updatedAt: '' },
  { id: 'commercial', name: 'Commercial', slug: 'commercial', metadata: { icon: 'Building', color: 'from-blue-500 to-indigo-600', type: 'property' }, createdAt: '', updatedAt: '' },
  { id: 'land', name: 'Land & Plots', slug: 'land', metadata: { icon: 'MapPin', color: 'from-green-500 to-emerald-600', type: 'property' }, createdAt: '', updatedAt: '' },
  { id: 'rentals', name: 'Rentals', slug: 'rentals', metadata: { icon: 'Key', color: 'from-purple-500 to-violet-600', type: 'property' }, createdAt: '', updatedAt: '' },
  { id: 'luxury', name: 'Luxury Homes', slug: 'luxury', metadata: { icon: 'Crown', color: 'from-yellow-500 to-amber-600', type: 'property' }, createdAt: '', updatedAt: '' },
  { id: 'investment', name: 'Investment', slug: 'investment', metadata: { icon: 'TrendingUp', color: 'from-cyan-500 to-blue-600', type: 'property' }, createdAt: '', updatedAt: '' }
];

const EnhancedHomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentPlatform, setPlatform, searchQuery, setSearchQuery } = useAppContext();
  const { user } = useAuthContext();
  const { itemCount } = useCart();
  
  const [productCategories, setProductCategories] = useState<ApiCategory[]>([]);
  const [propertyCategories, setPropertyCategories] = useState<ApiCategory[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If current platform is artisan, redirect to ArtisanConnect page
    if (currentPlatform === 'artisan') {
      navigate('/artisan-connect');
      return;
    }
    loadData();
    // Only reload on platform change, not on every location change
  }, [currentPlatform]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load categories from API
      const [productCatsResult, propertyCatsResult] = await Promise.all([
        categoryApiService.getProductCategories(),
        categoryApiService.getPropertyCategories()
      ]);
      
      if (productCatsResult.data) {
        setProductCategories(productCatsResult.data);
      }
      if (propertyCatsResult.data) {
        setPropertyCategories(propertyCatsResult.data);
      }

      // Reset lists before loading based on platform
      setFeaturedProducts([]);
      setRecentProducts([]);
      setFeaturedProperties([]);
      setProperties([]);
      setJobs([]);

      // Normalizer to adapt API products to UI expectations
      const normalizeProduct = (p: any) => {
        if (!p) return p;
        const name = p.name || p.title || p.productName || '';
        const title = p.title || name;
        
        // Get images array - could be string[], {image_url}[], or JSON string
        let imagesArray: string[] = [];
        if (typeof p.images === 'string') {
          try {
            imagesArray = JSON.parse(p.images);
          } catch {
            imagesArray = p.images ? [p.images] : [];
          }
        } else if (Array.isArray(p.images)) {
          // Handle both string[] and {image_url}[] formats
          imagesArray = p.images.map((img: any) => 
            typeof img === 'string' ? img : (img.image_url || img.imageUrl || img.url || img.src || '')
          );
        } else if (Array.isArray(p.productImages)) {
          imagesArray = p.productImages.map((img: any) => 
            typeof img === 'string' ? img : (img.image_url || img.imageUrl || img.url || img.src || '')
          );
        }
        
        // Filter out empty strings
        imagesArray = imagesArray.filter((url: string) => url && url.length > 0);
        
        return {
          ...p,
          name,
          title,
          images: imagesArray, // Keep as string[] for ProductCard compatibility
          price: Number(p.price || p.unitPrice || 0),
          rating: p.rating ?? 0,
          reviewCount: p.reviewCount ?? p.reviewsCount ?? 0,
          stockQuantity: p.stockQuantity ?? 0,
          inStock: p.inStock ?? (p.stockQuantity > 0),
          location_city: p.location_city || p.locationCity || p.city || p.seller?.businessAddress?.city || '',
          location_state: p.location_state || p.locationState || p.state || p.seller?.businessAddress?.state || '',
          condition: p.condition || 'new',
        };
      };

      if (currentPlatform === 'ecommerce') {
        // Fetch featured products (limit 8)
        const featuredData = await productService.getFeaturedProducts(8);
        console.log('Featured products response:', featuredData);
        if (featuredData && Array.isArray((featuredData as any).data)) {
          setFeaturedProducts(((featuredData as any).data as any[]).map(normalizeProduct));
        } else if (Array.isArray(featuredData)) {
          setFeaturedProducts((featuredData as any[]).map(normalizeProduct));
        }
        
        // Fetch recent/current listings (limit 20)
        const recentData = await productService.getProducts({}, 1, 20);
        console.log('Recent products response:', recentData);
        const items = Array.isArray(recentData?.data?.data)
          ? recentData.data.data
          : Array.isArray((recentData as any)?.data)
          ? (recentData as any).data
          : Array.isArray(recentData as any)
          ? (recentData as any)
          : [];
        setRecentProducts((items as any[]).map(normalizeProduct));
      } else if (currentPlatform === 'realestate') {
        const props = await propertyService.getFeaturedProperties(8);
        if (Array.isArray(props)) setFeaturedProperties(props);
        const list = await propertyService.getProperties({ page: 1, limit: 12, sortBy: 'date' });
        if (list.data?.data) setProperties(list.data.data);
      } else if (currentPlatform === 'jobs') {
        const list = await JobService.searchJobs({ page: 1, limit: 12, sortBy: 'date' } as any);
        if (Array.isArray(list.jobs)) setJobs(list.jobs);
      }
    } catch (error) {
      console.error('Error loading homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categoryIcons = {
    'electronics': <Smartphone className="w-6 h-6" />,
    'vehicles': <Car className="w-6 h-6" />,
    'real-estate': <Building className="w-6 h-6" />,
    'fashion': <Shirt className="w-6 h-6" />,
    'home-garden': <HomeIcon className="w-6 h-6" />,
    'jobs': <Briefcase className="w-6 h-6" />,
    'sports': <Activity className="w-6 h-6" />,
    'books': <Book className="w-6 h-6" />,
    'health-beauty': <Heart className="w-6 h-6" />,
    'baby-kids': <Baby className="w-6 h-6" />,
  };

  // Memoized section wrapper with reduced animation for better performance
  const SectionWrapper = memo(({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.05 });

    return (
      <section
        ref={ref}
        className={`transition-opacity duration-300 ${isInView ? 'opacity-100' : 'opacity-0'} ${className}`}
      >
        {children}
      </section>
    );
  });

  // Don't render if we're redirecting to artisan connect
  if (currentPlatform === 'artisan') {
    return null;
  }

  return (
    <MainLayout>
      {/* Enhanced Hero Section - Now with dynamic images */}
      <HeroSection
        currentPlatform={currentPlatform}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />

      {/* Main Content Section - Moved from Hero Overlay */}
      <SectionWrapper className="py-16 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                <span className="block text-gray-900">Discover Amazing</span>
                <span className="block text-primary">Products & Services</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {currentPlatform === 'realestate' 
                  ? 'Find your dream property with trusted real estate professionals across Nigeria'
                  : currentPlatform === 'jobs'
                  ? 'Connect with top employers and discover career opportunities that match your skills'
                  : currentPlatform === 'artisan'
                  ? 'Connect with skilled professionals for all your service needs - from plumbing to beauty services'
                  : 'Join Nigeria\'s most trusted marketplace. Buy, sell, and discover everything you need in one place.'
                }
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white border-0 px-8 py-4 text-lg font-semibold"
                    onClick={() => navigate(
                      currentPlatform === 'realestate' ? '/properties' : 
                      currentPlatform === 'jobs' ? '/jobs' : 
                      currentPlatform === 'artisan' ? '/artisan-connect' :
                      '/products'
                    )}
                  >
                    <Package className="w-5 h-5 mr-2" />
                    {currentPlatform === 'realestate' ? 'VIEW PROPERTIES' : 
                     currentPlatform === 'jobs' ? 'FIND JOBS' : 
                     currentPlatform === 'artisan' ? 'FIND ARTISANS' :
                     'SHOP NOW'}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="px-8 py-4 text-lg font-semibold"
                    onClick={() => navigate(
                      currentPlatform === 'realestate' ? '/properties' : 
                      currentPlatform === 'jobs' ? '/jobs' : 
                      currentPlatform === 'artisan' ? '/artisan-connect' :
                      '/products'
                    )}
                  >
                    {currentPlatform === 'realestate' ? 'Browse Areas' : 
                     currentPlatform === 'jobs' ? 'Browse Companies' : 
                     currentPlatform === 'artisan' ? 'Browse Services' :
                     'Explore Categories'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  currentPlatform === 'realestate' ? 'Verified Properties' : 
                  currentPlatform === 'jobs' ? 'Verified Employers' : 
                  currentPlatform === 'artisan' ? 'Skilled Artisans' : 
                  'Trusted Sellers',
                  
                  currentPlatform === 'realestate' ? 'Expert Agents' : 
                  currentPlatform === 'jobs' ? 'Career Growth' : 
                  currentPlatform === 'artisan' ? 'Real-time Tracking' : 
                  'Secure Payments',
                  
                  currentPlatform === 'realestate' ? 'Best Locations' : 
                  currentPlatform === 'jobs' ? 'Remote Opportunities' : 
                  currentPlatform === 'artisan' ? 'Quality Service' : 
                  'Fast Delivery',
                  
                  currentPlatform === 'realestate' ? 'Great Prices' : 
                  currentPlatform === 'jobs' ? 'Competitive Salaries' : 
                  currentPlatform === 'artisan' ? 'Secure Payments' : 
                  'Quality Products'
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className="flex items-center bg-gray-50 rounded-lg px-4 py-3 text-gray-700 font-medium"
                  >
                    <div className="w-3 h-3 bg-primary rounded-full mr-3 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: Users, value: "50K+", label: "Happy Customers", color: "bg-teal-500" },
                { icon: ShoppingCart, value: "10K+", label: currentPlatform === 'realestate' ? 'Properties' : currentPlatform === 'jobs' ? 'Job Listings' : currentPlatform === 'artisan' ? 'Services' : 'Products', color: "bg-coral-500" },
                { icon: ShieldCheck, value: "100%", label: "Secure Platform", color: "bg-green-500" },
                { icon: Star, value: "4.9★", label: "Customer Rating", color: "bg-yellow-500" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  className="bg-white rounded-xl p-6 text-center shadow-lg border"
                >
                  <div className={`inline-flex p-3 rounded-full ${stat.color} mb-3`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionWrapper>

      {/* Categories Section - Optimized */}
      <SectionWrapper className="py-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
              Explore Categories
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Discover thousands of products and properties across our marketplace
            </p>
          </div>
          
          {loading ? (
            <CategorySkeletonGrid />
          ) : (
            <>
              {/* Product Categories Section */}
              <div className="mb-12">
                <h3 className="text-xl font-bold text-gray-800 text-center mb-6">Product Categories</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                  {(productCategories.length > 0 ? productCategories : defaultProductCategories).map((category) => {
                    const color = category.metadata?.color || 'from-gray-500 to-gray-600';
                    const iconName = category.metadata?.icon || 'Package';
                    return (
                      <Card 
                        key={category.id}
                        className="cursor-pointer group border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white"
                        onClick={() => navigate(`/products?category=${category.id}`)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="mb-3 flex justify-center">
                            <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow`}>
                              {categoryIcons[category.slug as keyof typeof categoryIcons] ? 
                                React.cloneElement(categoryIcons[category.slug as keyof typeof categoryIcons], { 
                                  className: "w-6 h-6 text-white" 
                                }) : 
                                <Package className="w-6 h-6 text-white" />
                              }
                            </div>
                          </div>
                          <h3 className="font-semibold text-xs text-gray-800">{category.name}</h3>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
              
              {/* Property Categories Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 text-center mb-6">Property Categories</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {(propertyCategories.length > 0 ? propertyCategories : defaultPropertyCategories).map((category) => {
                    const color = category.metadata?.color || 'from-gray-500 to-gray-600';
                    return (
                      <Card 
                        key={category.id}
                        className="cursor-pointer group border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white"
                        onClick={() => navigate(`/properties?category=${category.id}`)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="mb-3 flex justify-center">
                            <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow`}>
                              {category.slug === 'residential' && <HomeIcon className="w-6 h-6 text-white" />}
                              {category.slug === 'commercial' && <Building className="w-6 h-6 text-white" />}
                              {category.slug === 'land' && <MapPin className="w-6 h-6 text-white" />}
                              {category.slug === 'rentals' && <HomeIcon className="w-6 h-6 text-white" />}
                              {category.slug === 'luxury' && <Star className="w-6 h-6 text-white" />}
                              {category.slug === 'investment' && <TrendingUp className="w-6 h-6 text-white" />}
                              {!['residential', 'commercial', 'land', 'rentals', 'luxury', 'investment'].includes(category.slug) && <Building className="w-6 h-6 text-white" />}
                            </div>
                          </div>
                          <h3 className="font-semibold text-xs text-gray-800">{category.name}</h3>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </SectionWrapper>

      {/* Featured Products */}
      {(featuredProducts.length > 0 || loading) && (
        <SectionWrapper className="py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold mb-2">Featured Listings</h2>
                <p className="text-lg text-muted-foreground">Handpicked products just for you</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
              >
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/products?featured=true')}
                  className="group"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </div>
            
            {loading ? (
              <ProductSkeletonGrid />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(Array.isArray(featuredProducts) ? featuredProducts : []).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <EnhancedProductCard product={product} variant="featured" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </SectionWrapper>
      )}

      {/* Featured Properties */}
      {(featuredProperties.length > 0 || loading) && (
        <SectionWrapper className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold mb-2">Featured Properties</h2>
                <p className="text-lg text-muted-foreground">Top properties from verified agents</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
              >
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/properties')}
                  className="group"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </div>

            {loading ? (
              <ProductSkeletonGrid />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => navigate(`/properties/${property.id}`)}>
                      <div className="relative">
                        {(() => {
                          try {
                            const imgs = Array.isArray(property.images) ? property.images : JSON.parse(property.images || '[]');
                            const imgUrl = imgs?.[0] || imgs?.[0]?.imageUrl || '/api/placeholder/300/200';
                            return (
                              <img src={imgUrl} alt={property.title} className="w-full h-48 object-cover rounded-t-lg" />
                            );
                          } catch {
                            return (
                              <img src={'/api/placeholder/300/200'} alt={property.title} className="w-full h-48 object-cover rounded-t-lg" />
                            );
                          }
                        })()}
                        <Badge className="absolute top-2 left-2 bg-blue-600">{property.type?.toUpperCase?.() || 'LISTING'}</Badge>
                      </div>
                      <CardContent className="p-4">
                        <CardTitle className="text-lg mb-2 line-clamp-2">{property.title}</CardTitle>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl font-bold text-blue-600">
                            ₦{Number(property.price || 0).toLocaleString()}
                          </span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {property.propertyType || 'property'}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {property.location || property.address || 'Nigeria'}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </SectionWrapper>
      )}

      {/* Platform-Specific Current Listings */}
      <SectionWrapper className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="text-3xl font-bold mb-2">
                {currentPlatform === 'realestate' ? 'Latest Properties' : currentPlatform === 'jobs' ? 'Latest Jobs' : 'Current Listings'}
              </h2>
              <p className="text-lg text-muted-foreground">
                {currentPlatform === 'realestate' ? 'Fresh properties from trusted agents' : currentPlatform === 'jobs' ? 'New job opportunities' : 'Fresh arrivals from our community'}
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} whileHover={{ scale: 1.05 }}>
              <Button 
                variant="outline" 
                className="group"
                onClick={() => navigate(currentPlatform === 'realestate' ? '/properties' : currentPlatform === 'jobs' ? '/jobs' : '/products')}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>

          {loading ? (
            <ProductSkeletonGrid />
          ) : currentPlatform === 'realestate' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property, index) => (
                <motion.div key={property.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                  <Card className="hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => navigate(`/properties/${property.id}`)}>
                    <div className="relative">
                      {(() => {
                        try {
                          const imgs = Array.isArray(property.images) ? property.images : JSON.parse(property.images || '[]');
                          const imgUrl = imgs?.[0] || imgs?.[0]?.imageUrl || '/api/placeholder/300/200';
                          return (<img src={imgUrl} alt={property.title} className="w-full h-48 object-cover rounded-t-lg" />);
                        } catch { return (<img src={'/api/placeholder/300/200'} alt={property.title} className="w-full h-48 object-cover rounded-t-lg" />); }
                      })()}
                    </div>
                    <CardContent className="p-4">
                      <CardTitle className="text-lg mb-2 line-clamp-2">{property.title}</CardTitle>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl font-bold text-blue-600">₦{Number(property.price || 0).toLocaleString()}</span>
                        <Badge variant="outline" className="text-xs capitalize">{(property as any).propertyType || 'property'}</Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {(property as any).location || (property as any).address || 'Nigeria'}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : currentPlatform === 'jobs' ? (
            <div className="space-y-4">
              {jobs.map((job, index) => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg mb-1">{job.title}</CardTitle>
                          <div className="text-sm text-gray-600">
                            {(job.employer?.companyName) || 'Company'} • {job.location?.city || ''} {job.location?.state || ''}
                          </div>
                        </div>
                        <Badge variant="secondary" className="capitalize">{job.jobType.replace('_',' ')}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(Array.isArray(recentProducts) ? recentProducts : []).map((product, index) => (
                <motion.div key={(product as any).id ?? index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                  <EnhancedProductCard product={product as any} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </SectionWrapper>

      {/* Stats Section with Enhanced Design */}
      <SectionWrapper className="py-16 bg-gradient-to-br from-primary via-accent to-primary text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 30% 70%, white 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Trusted by Thousands</h2>
            <p className="text-xl opacity-90">Join Nigeria's fastest-growing marketplace</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { value: "50,000+", label: "Active Users", description: "Growing every day" },
              { value: "1M+", label: "Successful Deals", description: "Completed transactions" },
              { value: "99.9%", label: "Trust Rating", description: "Customer satisfaction" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-xl mb-1">{stat.label}</div>
                <div className="text-sm opacity-80">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* CTA Section */}
      <SectionWrapper className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to start selling?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of successful sellers on Nigeria's most trusted marketplace
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white border-0 px-8 py-3 text-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Post Your First Ad
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                  Learn More
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>
    </MainLayout>
  );
};

export default EnhancedHomePage;
