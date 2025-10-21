import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Clock, Shield, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useArtisan } from '@/contexts/ArtisanContext';
import { useLocation } from '@/hooks/useLocation';
import { Artisan, ArtisanFilters } from '@/types';
import { cn } from '@/lib/utils';

interface ArtisanDiscoveryProps {
  onArtisanSelect: (artisan: Artisan) => void;
  categoryId?: string;
  location?: { latitude: number; longitude: number };
}

export default function ArtisanDiscovery({
  onArtisanSelect,
  categoryId,
  location: initialLocation,
}: ArtisanDiscoveryProps) {
  const { searchResults, nearbyArtisans, searchArtisans, findNearbyArtisans, isLoading } = useArtisan();
  const { coordinates, getCurrentLocation, calculateDistance } = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ArtisanFilters>({
    categories: categoryId ? [categoryId] : [],
    rating: 4,
    hourlyRateMin: 0,
    hourlyRateMax: 50000,
    isVerified: false,
    experience: 0,
  });

  const location = initialLocation || coordinates;

  useEffect(() => {
    if (location) {
      findNearbyArtisans(location, 10); // 10km radius
    }
  }, [location, findNearbyArtisans]);

  useEffect(() => {
    if (categoryId) {
      setFilters(prev => ({ ...prev, categories: [categoryId] }));
    }
  }, [categoryId]);

  const handleSearch = async () => {
    const searchFilters: ArtisanFilters = {
      ...filters,
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 20, // 20km search radius
      } : undefined,
    };

    await searchArtisans(searchFilters);
  };

  const getLocationAndSearch = async () => {
    try {
      await getCurrentLocation();
      // Location effect will trigger search automatically
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const artisansToShow = searchQuery ? searchResults : nearbyArtisans;

  const ArtisanCard = ({ artisan }: { artisan: Artisan }) => {
    const distance = location 
      ? calculateDistance(
          location.latitude,
          location.longitude,
          artisan.location.latitude,
          artisan.location.longitude
        )
      : null;

    return (
      <Card 
        className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
        onClick={() => onArtisanSelect(artisan)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={artisan.user.avatar} alt={artisan.businessName} />
                <AvatarFallback>
                  {artisan.businessName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{artisan.businessName}</CardTitle>
                <p className="text-sm text-gray-600">{artisan.user.firstName} {artisan.user.lastName}</p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              {artisan.isVerified && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
              {artisan.isOnline && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Online
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Rating and Reviews */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{artisan.rating.toFixed(1)}</span>
                <span className="text-gray-500">({artisan.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500">
                <Clock className="h-4 w-4" />
                <span>~{artisan.responseTime}min response</span>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-1">
              {artisan.categories.slice(0, 3).map((category, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {category.name}
                </Badge>
              ))}
              {artisan.categories.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{artisan.categories.length - 3} more
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2">
              {artisan.description}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-gray-500">
                  {artisan.experience} years exp.
                </span>
                <span className="text-gray-500">
                  {artisan.completedJobs} jobs completed
                </span>
              </div>
              <div className="font-semibold text-red-600">
                ₦{artisan.hourlyRate.toLocaleString()}/hr
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1 text-gray-500">
                <MapPin className="h-4 w-4" />
                <span>{artisan.location.city}, {artisan.location.state}</span>
              </div>
              {distance && (
                <span className="text-gray-500">
                  {distance.toFixed(1)}km away
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const FilterSheet = () => (
    <Sheet open={showFilters} onOpenChange={setShowFilters}>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Artisans</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Rating Filter */}
          <div>
            <Label className="text-sm font-medium">Minimum Rating</Label>
            <div className="mt-2">
              <Slider
                value={[filters.rating || 0]}
                onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value[0] }))}
                max={5}
                min={0}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Any</span>
                <span>{filters.rating}+ stars</span>
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium">Hourly Rate (₦)</Label>
            <div className="mt-2 space-y-2">
              <Slider
                value={[filters.hourlyRateMin || 0, filters.hourlyRateMax || 50000]}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  hourlyRateMin: value[0],
                  hourlyRateMax: value[1]
                }))}
                max={50000}
                min={0}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>₦{filters.hourlyRateMin?.toLocaleString()}</span>
                <span>₦{filters.hourlyRateMax?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Experience */}
          <div>
            <Label className="text-sm font-medium">Minimum Experience</Label>
            <Select
              value={filters.experience?.toString()}
              onValueChange={(value) => setFilters(prev => ({ ...prev, experience: parseInt(value) }))}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Any experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any experience</SelectItem>
                <SelectItem value="1">1+ years</SelectItem>
                <SelectItem value="2">2+ years</SelectItem>
                <SelectItem value="5">5+ years</SelectItem>
                <SelectItem value="10">10+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verified Only */}
          <div className="flex items-center space-x-2">
            <Switch
              id="verified"
              checked={filters.isVerified || false}
              onCheckedChange={(checked) => setFilters(prev => ({ ...prev, isVerified: checked }))}
            />
            <Label htmlFor="verified" className="text-sm font-medium">
              Verified artisans only
            </Label>
          </div>

          {/* Apply Filters */}
          <div className="space-y-2">
            <Button onClick={handleSearch} className="w-full">
              Apply Filters
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setFilters({ categories: categoryId ? [categoryId] : [] })}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search artisans by name, skill, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex space-x-2">
            <FilterSheet />
            <Button onClick={handleSearch} disabled={isLoading}>
              Search
            </Button>
          </div>
        </div>

        {/* Location prompt */}
        {!location && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Find artisans near you</p>
                  <p className="text-sm text-blue-600">Enable location to see nearby artisans</p>
                </div>
              </div>
              <Button 
                onClick={getLocationAndSearch}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-300"
              >
                Enable Location
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {searchQuery ? 'Search Results' : 'Artisans Near You'} ({artisansToShow.length})
        </h2>
        <Select defaultValue="distance">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">Nearest first</SelectItem>
            <SelectItem value="rating">Highest rated</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="experience">Most experienced</SelectItem>
            <SelectItem value="response_time">Fastest response</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Artisan Grid */}
      {!isLoading && artisansToShow.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artisansToShow.map((artisan) => (
            <ArtisanCard key={artisan.id} artisan={artisan} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && artisansToShow.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No artisans found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? "Try adjusting your search or filters"
              : "No artisans available in your area"
            }
          </p>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
            <Button onClick={() => setFilters({ categories: categoryId ? [categoryId] : [] })}>
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
