import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Search, Filter, MapPin, Star, Heart, ShoppingCart, 
  Bed, Bath, Square, Eye, Plus, Building, Smartphone,
  Car, Shirt, Home as HomeIcon, Briefcase, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAppContext } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import productService from '@/services/productService';
import realEstateService from '@/services/realEstateService';
import { Product } from '@/types';
import { Property } from '@/features/realtor/types';

const categories = [
  { 
    id: 'electronics', 
    name: 'Electronics', 
    icon: <Smartphone className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600',
    description: 'Phones, Laptops, TV & More'
  },
  { 
    id: 'fashion', 
    name: 'Fashion', 
    icon: <Shirt className="w-6 h-6" />,
    color: 'from-pink-500 to-pink-600',
    description: 'Clothing, Shoes & Accessories'
  },
  { 
    id: 'vehicles', 
    name: 'Vehicles', 
    icon: <Car className="w-6 h-6" />,
    color: 'from-green-500 to-green-600',
    description: 'Cars, Bikes & More'
  },
  { 
    id: 'home-garden', 
    name: 'Home & Garden', 
    icon: <HomeIcon className="w-6 h-6" />,
    color: 'from-orange-500 to-orange-600',
    description: 'Furniture, Appliances & Decor'
  },
  { 
    id: 'real-estate', 
    name: 'Real Estate', 
    icon: <Building className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
    description: 'Houses, Apartments & Land'
  },
  { 
    id: 'jobs', 
    name: 'Jobs', 
    icon: <Briefcase className="w-6 h-6" />,
    color: 'from-indigo-500 to-indigo-600',
    description: 'Find Your Next Opportunity'
  }
];

const UnifiedMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useAppContext();
  const { user } = useAuthContext();
  const { addItem } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadData();
  }, [sortBy]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load products
      const productResult = await productService.getProducts({ sortBy: sortBy as any });
      if (productResult.data?.data) {
        setProducts(productResult.data.data.slice(0, 8)); // Show first 8 products
      }

      // Load properties
      const propertyResult = await realEstateService.searchProperties({ 
        sortBy: sortBy === 'newest' ? 'date' : sortBy as any,
        limit: 8 
      });
      if (propertyResult.properties) {
        setProperties(propertyResult.properties);
      }
    } catch (error) {
      console.error('Error loading marketplace data:', error);
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

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Nigeria's Largest Marketplace
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Buy and sell everything from electronics to real estate in one place
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex rounded-lg overflow-hidden shadow-lg bg-white">
              <Input
                type="text"
                placeholder="Search for products, properties, jobs and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 text-lg py-4 px-6 focus:ring-0"
              />
              <Button type="submit" size="lg" className="px-8">
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Categories Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Card 
                key={category.id} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-0 bg-gradient-to-br"
                onClick={() => navigate(`/category/${category.id}`)}
                style={{ background: `linear-gradient(135deg, ${category.color.split(' ')[1]}, ${category.color.split(' ')[3]})` }}
              >
                <CardContent className="p-6 text-center text-white">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                      {category.icon}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                  <p className="text-sm opacity-90">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-8">
            <TabsList className="grid w-fit grid-cols-3">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price">Price: Low to High</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              {user && (
                <Button onClick={() => navigate('/post-ad')} className="bg-gradient-to-r from-primary to-accent">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Ad
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="all" className="space-y-12">
            {/* Products Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Package className="w-6 h-6 mr-2 text-primary" />
                  Featured Products
                </h2>
                <Link to="/products">
                  <Button variant="outline">View All Products</Button>
                </Link>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array(4).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={product.images?.[0]?.image_url || '/api/placeholder/300/200'}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        {product.discount && (
                          <Badge className="absolute top-2 left-2 bg-red-500">
                            -{product.discount}%
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold text-primary">
                            {formatCurrency(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 mr-1" />
                          {product.seller?.businessAddress?.city}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm ml-1">{product.rating}</span>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleAddToCart(product)}
                            className="bg-gradient-to-r from-primary to-accent"
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <Separator className="my-8" />

            {/* Properties Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Building className="w-6 h-6 mr-2 text-blue-600" />
                  Featured Properties
                </h2>
                <Link to="/properties">
                  <Button variant="outline">View All Properties</Button>
                </Link>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array(4).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {properties.map((property) => (
                    <Card key={property.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={property.images?.find(img => img.isPrimary)?.imageUrl || property.images?.[0]?.imageUrl || '/api/placeholder/300/200'}
                          alt={property.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <Badge className="absolute top-2 left-2 bg-blue-500">
                          {property.listingType?.toUpperCase()}
                        </Badge>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <Link to={`/properties/${property.id}`}>
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                            {property.title}
                          </h3>
                        </Link>
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {formatCurrency(property.price)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 mr-1" />
                          {property.address?.city}, {property.address?.state}
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              <Bed className="w-4 h-4 mr-1" />
                              <span>{property.bedrooms || 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                              <Bath className="w-4 h-4 mr-1" />
                              <span>{property.bathrooms || 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                              <Square className="w-4 h-4 mr-1" />
                              <span>{property.squareFootage || 'N/A'}</span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            <span>{property.viewCount || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="products">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group hover:shadow-xl transition-all duration-300">
                  {/* Product card content same as above */}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="properties">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="group hover:shadow-xl transition-all duration-300">
                  {/* Property card content same as above */}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default UnifiedMarketplace;