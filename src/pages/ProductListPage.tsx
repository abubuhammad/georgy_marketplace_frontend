import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Grid, List, MapPin, Star, Heart, SlidersHorizontal, 
  ChevronDown, ArrowUpDown, Eye, ShoppingCart 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAppContext } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import productService from '@/services/productService';
import categoryApiService, { Category as ApiCategory } from '@/services/categoryApiService';
import { Product, SearchFilters } from '@/types';

const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentPlatform, searchQuery, setSearchQuery } = useAppContext();
  const { user } = useAuthContext();
  const { addItem } = useCart();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined,
    priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'newest',
    sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
  });

  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  // Refresh on location change (browser back/forward)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setFilters({
      query: params.get('q') || '',
      category: params.get('category') || '',
      priceMin: params.get('priceMin') ? Number(params.get('priceMin')) : undefined,
      priceMax: params.get('priceMax') ? Number(params.get('priceMax')) : undefined,
      sortBy: (params.get('sortBy') as any) || 'newest',
      sortOrder: (params.get('sortOrder') as any) || 'desc',
    });
    setCurrentPage(params.get('page') ? Number(params.get('page')) : 1);
  }, [location.search]);

  useEffect(() => {
    loadProducts();
    updateURL();
  }, [filters, currentPage]);

  useEffect(() => {
    setFilters(prev => ({ ...prev, query: searchQuery }));
  }, [searchQuery]);

  const loadCategories = async () => {
    const { data } = await categoryApiService.getProductCategories();
    if (data) {
      setCategories(data);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const filtersWithPrice = {
        ...filters,
        priceMin: priceRange[0] > 0 ? priceRange[0] : undefined,
        priceMax: priceRange[1] < 1000000 ? priceRange[1] : undefined,
      };

      const result = await productService.getProducts(filtersWithPrice, currentPage, 20);
      
      // Normalize incoming products to match UI expectations
      const normalizeProduct = (p: any) => {
        if (!p) return p;
        const name = p.name || p.title || p.productName || '';
        const title = p.title || name;
        const imagesArray = Array.isArray(p.images) ? p.images : (Array.isArray(p.productImages) ? p.productImages : []);
        const images = imagesArray.map((img: any) =>
          typeof img === 'string' ? { image_url: img } : { image_url: img.image_url || img.imageUrl || img.url || img.src || '' }
        );
        return {
          ...p,
          name,
          title,
          images,
          price: Number(p.price || p.unitPrice || 0),
          rating: p.rating ?? 0,
          reviewCount: p.reviewCount ?? p.reviewsCount ?? 0,
          location_city: p.location_city || p.city || p.seller?.businessAddress?.city || '',
          location_state: p.location_state || p.state || p.seller?.businessAddress?.state || '',
          condition: p.condition || 'new',
          sku: p.sku || p.SKU || p.code || 'N/A',
        };
      };

      console.log('API result:', result);
      
      let list: any[] = [];
      if (result && result.data && Array.isArray(result.data.data)) {
        list = result.data.data as any[];
      } else if (result && Array.isArray((result as any).data)) {
        list = (result as any).data as any[];
      } else if (Array.isArray(result as any)) {
        list = result as any[];
      }
      setProducts(list.map(normalizeProduct));
      
      // Handle pagination with fallbacks
      if (result && result.data && result.data.pagination) {
        setTotalPages(result.data.pagination.pages || Math.ceil((result.data.pagination.total || 0) / 20));
        setTotalCount(result.data.pagination.total || 0);
      } else if (result && result.pagination) {
        setTotalPages(result.pagination.pages || Math.ceil((result.pagination.total || 0) / 20));
        setTotalCount(result.pagination.total || 0);
      } else {
        setTotalPages(1);
        const dataArray = Array.isArray(result?.data?.data) ? result.data.data : 
                         Array.isArray(result?.data) ? result.data : 
                         Array.isArray(result) ? result : [];
        setTotalCount(dataArray.length);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.category) params.set('category', filters.category);
    if (filters.priceMin) params.set('priceMin', filters.priceMin.toString());
    if (filters.priceMax) params.set('priceMax', filters.priceMax.toString());
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, query: searchQuery }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    // Convert 'all' to empty string for category filter
    if (key === 'category' && value === 'all') {
      value = '';
    }
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (newRange: number[]) => {
    setPriceRange(newRange);
    setFilters(prev => ({
      ...prev,
      priceMin: newRange[0] > 0 ? newRange[0] : undefined,
      priceMax: newRange[1] < 1000000 ? newRange[1] : undefined,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      priceMin: undefined,
      priceMax: undefined,
      sortBy: 'newest',
      sortOrder: 'desc',
    });
    setPriceRange([0, 1000000]);
    setSelectedConditions([]);
    setSelectedLocations([]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to your cart and place orders.',
        variant: 'destructive',
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/login')}
            className="border-white text-white hover:bg-white hover:text-red-600"
          >
            Sign In
          </Button>
        ),
      });
      return;
    }
    
    addItem(product);
    toast({
      title: 'Added to cart',
      description: `${product.title || product.name} has been added to your cart.`,
    });
  };

  const handleToggleFavorite = async (productId: string) => {
    if (!user) return;
    
    try {
      await productService.toggleFavorite(user.id, productId);
      // Refresh products to update favorite status
      loadProducts();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Category</h3>
                  <Select value={filters.category || 'all'} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold mb-3">Price Range (₦)</h3>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={handlePriceRangeChange}
                      max={1000000}
                      step={1000}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                      <span>₦{priceRange[0].toLocaleString()}</span>
                      <span>₦{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Condition Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Condition</h3>
                  <div className="space-y-2">
                    {['new', 'used', 'refurbished'].map(condition => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={condition}
                          checked={selectedConditions.includes(condition)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedConditions([...selectedConditions, condition]);
                            } else {
                              setSelectedConditions(selectedConditions.filter(c => c !== condition));
                            }
                          }}
                        />
                        <label htmlFor={condition} className="text-sm font-medium capitalize">
                          {condition}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Location</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lagos">Lagos</SelectItem>
                      <SelectItem value="abuja">Abuja</SelectItem>
                      <SelectItem value="port-harcourt">Port Harcourt</SelectItem>
                      <SelectItem value="kano">Kano</SelectItem>
                      <SelectItem value="ibadan">Ibadan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold">
                  {totalCount} results found
                </h2>
                {filters.query && (
                  <Badge variant="secondary">
                    "{filters.query}"
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort */}
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price">Price: Low to High</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex items-center space-x-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                {/* Mobile Filter */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>
                        Refine your search results
                      </SheetDescription>
                    </SheetHeader>
                    {/* Mobile filter content (same as sidebar) */}
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                {(Array.isArray(products) ? products : []).map((product) => (
                  <Card key={product.id} className={`hover:shadow-lg transition-shadow group ${
                    viewMode === 'list' ? 'flex flex-row' : ''
                  }`}>
                    <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                      <img
                        src={product.images?.[0]?.image_url || '/api/placeholder/300/200'}
                        alt={product.title}
                        className={`object-cover ${
                          viewMode === 'list' 
                            ? 'w-full h-full rounded-l-lg' 
                            : 'w-full h-48 rounded-t-lg'
                        }`}
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleToggleFavorite(product.id)}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className={viewMode === 'list' ? 'flex justify-between h-full' : ''}>
                        <div className={viewMode === 'list' ? 'flex-1' : ''}>
                          <Link to={`/product/${product.id}`}>
                            <CardTitle className="text-lg mb-2 line-clamp-2 hover:text-primary">
                              {product.title}
                            </CardTitle>
                          </Link>
                          
                          {viewMode === 'list' && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {product.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl font-bold text-primary">
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

                          {product.rating > 0 && (
                            <div className="flex items-center mb-3">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm ml-1">{product.rating}</span>
                              <span className="text-xs text-gray-500 ml-1">
                                ({product.reviewCount} reviews)
                              </span>
                            </div>
                          )}
                        </div>

                        <div className={`flex gap-2 ${
                          viewMode === 'list' ? 'flex-col justify-end ml-4' : 'w-full'
                        }`}>
                          <Link to={`/product/${product.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center mt-8 space-x-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (page > totalPages) return null;
                  
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}

            {/* No Results */}
            {!loading && (Array.isArray(products) ? products : []).length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or browse categories
                  </p>
                  <Button onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductListPage;
