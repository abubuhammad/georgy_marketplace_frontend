import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  X,
  MapPin,
  DollarSign,
  Calendar,
  Star,
  Bookmark,
  History,
  Trending,
  ChevronDown,
  ChevronUp,
  Sliders
} from 'lucide-react';
import { toast } from 'sonner';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'category' | 'location' | 'brand';
  category?: string;
  count?: number;
}

interface SearchFilters {
  category: string;
  subcategory: string;
  condition: string[];
  priceRange: [number, number];
  location: string;
  radius: number;
  datePosted: string;
  brand: string[];
  features: string[];
  rating: number;
  verified: boolean;
  negotiable: boolean;
  featured: boolean;
}

interface SavedSearch {
  id: string;
  query: string;
  filters: Partial<SearchFilters>;
  name: string;
  alertsEnabled: boolean;
  createdAt: string;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: Partial<SearchFilters>) => void;
  initialQuery?: string;
  initialFilters?: Partial<SearchFilters>;
  showSaveSearch?: boolean;
  compact?: boolean;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  initialQuery = '',
  initialFilters = {},
  showSaveSearch = true,
  compact = false
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(!compact);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    subcategory: '',
    condition: [],
    priceRange: [0, 10000000],
    location: '',
    radius: 50,
    datePosted: '',
    brand: [],
    features: [],
    rating: 0,
    verified: false,
    negotiable: false,
    featured: false,
    ...initialFilters
  });

  // Mock data
  const mockSuggestions: SearchSuggestion[] = [
    { id: '1', text: 'iPhone 14 Pro Max', type: 'popular', category: 'Electronics', count: 234 },
    { id: '2', text: 'Samsung Galaxy S24', type: 'popular', category: 'Electronics', count: 189 },
    { id: '3', text: 'MacBook Pro M3', type: 'popular', category: 'Electronics', count: 156 },
    { id: '4', text: 'Toyota Corolla', type: 'popular', category: 'Vehicles', count: 98 },
    { id: '5', text: 'Lagos', type: 'location', count: 1234 },
    { id: '6', text: 'Abuja', type: 'location', count: 567 },
    { id: '7', text: 'Nike', type: 'brand', count: 345 },
    { id: '8', text: 'Adidas', type: 'brand', count: 289 }
  ];

  const mockRecentSearches = [
    'iPhone 14 Pro',
    '3 bedroom apartment Lagos',
    'Honda Accord 2020',
    'Gaming laptop'
  ];

  const mockSavedSearches: SavedSearch[] = [
    {
      id: '1',
      query: 'iPhone 14',
      filters: { category: 'Electronics', condition: ['New'], priceRange: [400000, 600000] },
      name: 'iPhone 14 under 600k',
      alertsEnabled: true,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      query: '3 bedroom Lagos',
      filters: { category: 'Real Estate', location: 'Lagos' },
      name: 'Lagos Properties',
      alertsEnabled: false,
      createdAt: '2024-01-12'
    }
  ];

  const categories = [
    'Electronics', 'Vehicles', 'Real Estate', 'Fashion', 'Home & Garden',
    'Sports & Outdoors', 'Health & Beauty', 'Jobs', 'Services'
  ];

  const conditions = ['New', 'Used', 'Refurbished'];
  const dateOptions = [
    { value: '', label: 'Any time' },
    { value: '1d', label: 'Last 24 hours' },
    { value: '3d', label: 'Last 3 days' },
    { value: '1w', label: 'Last week' },
    { value: '1m', label: 'Last month' }
  ];

  useEffect(() => {
    setSuggestions(mockSuggestions);
    setRecentSearches(mockRecentSearches);
    setSavedSearches(mockSavedSearches);
  }, []);

  // Filter suggestions based on query
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.text.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  const handleSearch = () => {
    if (!query.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    // Add to recent searches
    const updatedRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updatedRecent);
    
    // Hide suggestions
    setShowSuggestions(false);
    
    // Trigger search
    onSearch(query, filters);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    
    // Auto-apply category filter if suggestion has category
    if (suggestion.category) {
      setFilters(prev => ({ ...prev, category: suggestion.category! }));
    }
    
    onSearch(suggestion.text, filters);
  };

  const handleSaveSearch = () => {
    if (!saveSearchName.trim()) {
      toast.error('Please enter a name for your saved search');
      return;
    }

    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      query,
      filters,
      name: saveSearchName,
      alertsEnabled: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setSavedSearches(prev => [newSavedSearch, ...prev]);
    setSaveSearchName('');
    setShowSaveDialog(false);
    toast.success('Search saved successfully!');
  };

  const handleLoadSavedSearch = (savedSearch: SavedSearch) => {
    setQuery(savedSearch.query);
    setFilters(savedSearch.filters as SearchFilters);
    onSearch(savedSearch.query, savedSearch.filters);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      subcategory: '',
      condition: [],
      priceRange: [0, 10000000],
      location: '',
      radius: 50,
      datePosted: '',
      brand: [],
      features: [],
      rating: 0,
      verified: false,
      negotiable: false,
      featured: false
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.condition.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000) count++;
    if (filters.location) count++;
    if (filters.brand.length > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.verified) count++;
    if (filters.negotiable) count++;
    if (filters.featured) count++;
    return count;
  };

  return (
    <div className="w-full">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex rounded-lg border border-gray-300 overflow-hidden shadow-sm bg-white">
          <div className="relative flex-1">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="What are you looking for?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="border-0 focus:ring-0 text-lg py-3 px-4"
            />
            
            {/* Search Suggestions */}
            {showSuggestions && (query || recentSearches.length > 0 || savedSearches.length > 0) && (
              <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-b-lg shadow-lg max-h-96 overflow-y-auto">
                {/* Query-based suggestions */}
                {query && filteredSuggestions.length > 0 && (
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 mb-2 px-2">Suggestions</div>
                    {filteredSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer rounded"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex items-center space-x-2">
                          {suggestion.type === 'popular' && <Trending className="w-4 h-4 text-orange-500" />}
                          {suggestion.type === 'location' && <MapPin className="w-4 h-4 text-blue-500" />}
                          {suggestion.type === 'brand' && <Star className="w-4 h-4 text-purple-500" />}
                          <span>{suggestion.text}</span>
                          {suggestion.category && (
                            <Badge variant="outline" className="text-xs">
                              {suggestion.category}
                            </Badge>
                          )}
                        </div>
                        {suggestion.count && (
                          <span className="text-xs text-gray-400">{suggestion.count}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent Searches */}
                {!query && recentSearches.length > 0 && (
                  <div className="p-2 border-t">
                    <div className="text-xs font-medium text-gray-500 mb-2 px-2">Recent Searches</div>
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer rounded"
                        onClick={() => {
                          setQuery(search);
                          setShowSuggestions(false);
                          onSearch(search, filters);
                        }}
                      >
                        <History className="w-4 h-4 text-gray-400" />
                        <span>{search}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Saved Searches */}
                {!query && savedSearches.length > 0 && (
                  <div className="p-2 border-t">
                    <div className="text-xs font-medium text-gray-500 mb-2 px-2">Saved Searches</div>
                    {savedSearches.map((search) => (
                      <div
                        key={search.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer rounded"
                        onClick={() => handleLoadSavedSearch(search)}
                      >
                        <div className="flex items-center space-x-2">
                          <Bookmark className="w-4 h-4 text-green-500" />
                          <span>{search.name}</span>
                        </div>
                        {search.alertsEnabled && (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            Alerts On
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Filter Toggle */}
          <Button
            variant="outline"
            className="border-0 border-l rounded-none px-4"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Sliders className="w-4 h-4 mr-2" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
          
          {/* Search Button */}
          <Button onClick={handleSearch} className="rounded-none px-6">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Click outside to close suggestions */}
        {showSuggestions && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowSuggestions(false)}
          />
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Search Filters</CardTitle>
              <div className="flex space-x-2">
                {showSaveSearch && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveDialog(true)}
                  >
                    <Bookmark className="w-4 h-4 mr-1" />
                    Save Search
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Category */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Condition */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Condition</Label>
                <div className="space-y-2">
                  {conditions.map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={condition}
                        checked={filters.condition.includes(condition)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters(prev => ({
                              ...prev,
                              condition: [...prev.condition, condition]
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              condition: prev.condition.filter(c => c !== condition)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={condition} className="text-sm">
                        {condition}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Location</Label>
                <Input
                  placeholder="Enter city or state"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                />
                <div className="mt-2">
                  <Label className="text-xs text-gray-500">
                    Radius: {filters.radius} km
                  </Label>
                  <Slider
                    value={[filters.radius]}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, radius: value[0] }))}
                    max={200}
                    min={5}
                    step={5}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Price Range: ₦{filters.priceRange[0].toLocaleString()} - ₦{filters.priceRange[1].toLocaleString()}
              </Label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                max={10000000}
                min={0}
                step={10000}
                className="mt-2"
              />
            </div>

            {/* Additional Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Date Posted</Label>
                <Select
                  value={filters.datePosted}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, datePosted: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any time" />
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

              <div>
                <Label className="text-sm font-medium mb-2 block">Minimum Rating</Label>
                <Select
                  value={filters.rating.toString()}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, rating: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any rating</SelectItem>
                    <SelectItem value="1">1+ stars</SelectItem>
                    <SelectItem value="2">2+ stars</SelectItem>
                    <SelectItem value="3">3+ stars</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="5">5 stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={filters.verified}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, verified: !!checked }))}
                  />
                  <Label htmlFor="verified" className="text-sm">
                    Verified sellers only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="negotiable"
                    checked={filters.negotiable}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, negotiable: !!checked }))}
                  />
                  <Label htmlFor="negotiable" className="text-sm">
                    Negotiable price
                  </Label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={filters.featured}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, featured: !!checked }))}
                  />
                  <Label htmlFor="featured" className="text-sm">
                    Featured listings
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Save Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="searchName">Search Name</Label>
                <Input
                  id="searchName"
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  placeholder="e.g., iPhone 14 under 600k"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="enableAlerts" />
                <Label htmlFor="enableAlerts" className="text-sm">
                  Get email alerts for new matches
                </Label>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveSearch} className="flex-1">
                  Save Search
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
