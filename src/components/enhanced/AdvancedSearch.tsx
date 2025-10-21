import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  Star,
  DollarSign,
  Calendar,
  Grid,
  List,
  ArrowUpDown,
  X,
  ChevronDown,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SearchFilters {
  query: string;
  category: string[];
  priceRange: [number, number];
  location: string;
  condition: string[];
  rating: number;
  datePosted: string;
  sortBy: string;
  viewType: 'grid' | 'list';
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  loading?: boolean;
  totalResults?: number;
  categories?: { id: string; name: string; slug: string }[];
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  loading = false,
  totalResults = 0,
  categories = []
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: [],
    priceRange: [0, 10000000],
    location: '',
    condition: [],
    rating: 0,
    datePosted: 'all',
    sortBy: 'relevance',
    viewType: 'grid'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const locations = [
    'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Benin City',
    'Jos', 'Ilorin', 'Kaduna', 'Enugu', 'Owerri', 'Warri', 'Abeokuta',
    'Onitsha', 'Calabar', 'Akure', 'Sokoto', 'Bauchi', 'Maiduguri'
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_low_high', label: 'Price: Low to High' },
    { value: 'price_high_low', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ];

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: '3months', label: 'Last 3 Months' }
  ];

  useEffect(() => {
    const active = [];
    if (filters.category.length > 0) active.push(`${filters.category.length} Categories`);
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000) active.push('Price Range');
    if (filters.location) active.push(filters.location);
    if (filters.condition.length > 0) active.push(`${filters.condition.length} Conditions`);
    if (filters.rating > 0) active.push(`${filters.rating}+ Stars`);
    if (filters.datePosted !== 'all') active.push('Date Filter');
    setActiveFilters(active);
  }, [filters]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      query: filters.query,
      category: [],
      priceRange: [0, 10000000] as [number, number],
      location: '',
      condition: [],
      rating: 0,
      datePosted: 'all',
      sortBy: 'relevance',
      viewType: filters.viewType
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case 'Categories':
        handleFilterChange('category', []);
        break;
      case 'Price Range':
        handleFilterChange('priceRange', [0, 10000000]);
        break;
      case 'Conditions':
        handleFilterChange('condition', []);
        break;
      case 'Date Filter':
        handleFilterChange('datePosted', 'all');
        break;
      default:
        if (locations.includes(filterType)) {
          handleFilterChange('location', '');
        } else if (filterType.includes('Stars')) {
          handleFilterChange('rating', 0);
        }
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Main Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for products, services, or anything..."
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-12 pr-4 py-6 text-lg border-2 border-gray-200 focus:border-primary rounded-xl"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-6 border-2 border-gray-200 hover:border-primary rounded-xl"
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filters
              {activeFilters.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
            
            <Button
              onClick={() => onSearch(filters)}
              disabled={loading}
              className="px-8 py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white border-0 rounded-xl font-semibold"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Active Filters */}
      <AnimatePresence>
        {activeFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 items-center"
          >
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {activeFilters.map((filter, index) => (
              <motion.div
                key={filter}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
              >
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => removeFilter(filter)}
                >
                  {filter}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              </motion.div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 text-xs text-muted-foreground hover:text-destructive"
            >
              Clear all
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Search Filters</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Categories */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Categories</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={category.id}
                            checked={filters.category.includes(category.id)}
                            onCheckedChange={(checked) => {
                              const newCategories = checked
                                ? [...filters.category, category.id]
                                : filters.category.filter(id => id !== category.id);
                              handleFilterChange('category', newCategories);
                            }}
                          />
                          <Label
                            htmlFor={category.id}
                            className="text-sm cursor-pointer hover:text-primary"
                          >
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Price Range (₦)</Label>
                    <div className="space-y-4">
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) => handleFilterChange('priceRange', value as [number, number])}
                        max={10000000}
                        step={10000}
                        className="w-full"
                      />
                      <div className="flex items-center space-x-2 text-sm">
                        <span>₦{filters.priceRange[0].toLocaleString()}</span>
                        <span>-</span>
                        <span>₦{filters.priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Location</Label>
                    <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Locations</SelectItem>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Additional Filters */}
                  <div className="space-y-4">
                    {/* Condition */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Condition</Label>
                      <div className="space-y-2">
                        {conditions.map((condition) => (
                          <div key={condition.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={condition.value}
                              checked={filters.condition.includes(condition.value)}
                              onCheckedChange={(checked) => {
                                const newConditions = checked
                                  ? [...filters.condition, condition.value]
                                  : filters.condition.filter(c => c !== condition.value);
                                handleFilterChange('condition', newConditions);
                              }}
                            />
                            <Label htmlFor={condition.value} className="text-sm cursor-pointer">
                              {condition.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Minimum Rating</Label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => handleFilterChange('rating', rating)}
                            className={`p-1 ${
                              filters.rating >= rating ? 'text-yellow-400' : 'text-gray-300'
                            } hover:text-yellow-400`}
                          >
                            <Star className={`h-4 w-4 ${filters.rating >= rating ? 'fill-current' : ''}`} />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">
                          {filters.rating > 0 ? `${filters.rating}+ stars` : 'Any rating'}
                        </span>
                      </div>
                    </div>

                    {/* Date Posted */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Date Posted</Label>
                      <Select value={filters.datePosted} onValueChange={(value) => handleFilterChange('datePosted', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dateOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Header */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            {totalResults > 0 ? `${totalResults.toLocaleString()} results found` : 'No results found'}
          </span>
          {loading && <span className="text-sm text-muted-foreground">Searching...</span>}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Sort */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Type */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button
              variant={filters.viewType === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleFilterChange('viewType', 'grid')}
              className="rounded-none border-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={filters.viewType === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleFilterChange('viewType', 'list')}
              className="rounded-none border-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
