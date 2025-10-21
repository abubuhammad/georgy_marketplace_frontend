import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Home,
  Heart,
  Eye,
  Star,
  ChevronDown,
  X
} from 'lucide-react';
import { Property, PropertySearchFilters, PropertyType, ListingType } from '../types';
import { RealEstateService } from '@/services/realEstateService';

interface PropertySearchProps {
  onPropertySelect?: (property: Property) => void;
  showFavorites?: boolean;
  className?: string;
}

export const PropertySearch: React.FC<PropertySearchProps> = ({
  onPropertySelect,
  showFavorites = true,
  className = '',
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm<PropertySearchFilters>({
    defaultValues: {
      sortBy: 'date',
      sortOrder: 'desc',
    },
  });

  const searchFilters = watch();

  useEffect(() => {
    performSearch();
  }, []);

  const performSearch = async (filters?: PropertySearchFilters) => {
    try {
      setLoading(true);
      const results = await RealEstateService.getProperties(filters);
      setProperties(results);
    } catch (error) {
      console.error('Error searching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: PropertySearchFilters) => {
    performSearch(data);
  };

  const clearFilters = () => {
    reset();
    performSearch();
  };

  const toggleFavorite = (propertyId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(propertyId)) {
      newFavorites.delete(propertyId);
    } else {
      newFavorites.add(propertyId);
    }
    setFavorites(newFavorites);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getListingTypeLabel = (listingType: ListingType) => {
    switch (listingType) {
      case 'sale': return 'For Sale';
      case 'rent': return 'For Rent';
      case 'lease': return 'For Lease';
      default: return listingType;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Property Search</h2>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Main Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by location, property type, or features..."
                    {...register('location')}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Select onValueChange={(value) => setValue('propertyType', value as PropertyType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any type</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Listing Type</Label>
                    <Select onValueChange={(value) => setValue('listingType', value as ListingType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any listing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any listing</SelectItem>
                        <SelectItem value="sale">For Sale</SelectItem>
                        <SelectItem value="rent">For Rent</SelectItem>
                        <SelectItem value="lease">For Lease</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Min Price</Label>
                    <Input
                      type="number"
                      placeholder="Min price"
                      {...register('priceMin', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Price</Label>
                    <Input
                      type="number"
                      placeholder="Max price"
                      {...register('priceMax', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Bedrooms</Label>
                    <Select onValueChange={(value) => setValue('bedrooms', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Bathrooms</Label>
                    <Select onValueChange={(value) => setValue('bathrooms', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Min Sq Ft</Label>
                    <Input
                      type="number"
                      placeholder="Min sq ft"
                      {...register('squareFootageMin', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select onValueChange={(value) => setValue('sortBy', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date Listed</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="size">Size</SelectItem>
                        <SelectItem value="popularity">Popularity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            {properties.length} properties found
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Searching properties...</div>
          </div>
        ) : properties.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No properties found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or browse all properties.
              </p>
              <Button onClick={() => performSearch()}>
                Browse All Properties
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Property Image */}
                    <div className="w-1/3 bg-gray-200 rounded-l-lg flex items-center justify-center">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0].imageUrl}
                          alt={property.images[0].imageAlt || property.title}
                          className="w-full h-48 object-cover rounded-l-lg"
                        />
                      ) : (
                        <Home className="h-12 w-12 text-gray-400" />
                      )}
                    </div>

                    {/* Property Details */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-semibold">{property.title}</h3>
                            <Badge variant="secondary">
                              {getListingTypeLabel(property.listingType)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>
                              {property.address.city}, {property.address.state}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-2xl font-bold text-red-600 mb-2">
                            <DollarSign className="h-5 w-5 mr-1" />
                            {formatCurrency(property.price, property.currency)}
                          </div>
                        </div>

                        {showFavorites && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(property.id)}
                            className="p-2"
                          >
                            <Heart
                              className={`h-5 w-5 ${
                                favorites.has(property.id)
                                  ? 'text-red-500 fill-red-500'
                                  : 'text-gray-400'
                              }`}
                            />
                          </Button>
                        )}
                      </div>

                      <p className="text-gray-700 mb-4 line-clamp-2">
                        {property.description}
                      </p>

                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                        {property.bedrooms && (
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            {property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''}
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            {property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}
                          </div>
                        )}
                        {property.squareFootage && (
                          <div>{property.squareFootage} sq ft</div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {property.viewCount} views
                          </div>
                          {property.professional && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1" />
                              {property.professional.rating.toFixed(1)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPropertySelect?.(property)}
                          >
                            View Details
                          </Button>
                          <Button size="sm">
                            Contact Agent
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
