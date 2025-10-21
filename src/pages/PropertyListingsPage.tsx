import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart, 
  Filter, 
  Search,
  DollarSign,
  Building,
  Home,
  Calendar,
  Plus
} from 'lucide-react';
import { Property, PropertySearchFilters } from '@/services/propertyService';
import { propertyService } from '@/services/propertyService';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

const PropertyListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuthContext();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PropertySearchFilters>({
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Refresh on location change (browser back/forward)
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setFilters(prev => ({ ...prev, category }));
    }
    loadProperties();
  }, [location.key, searchParams]);

  useEffect(() => {
    loadProperties();
  }, [filters]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const result = await propertyService.getProperties(filters);
      if (result.data?.data) {
        setProperties(result.data.data);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, location: searchQuery }));
  };

  const handleFilterChange = (key: keyof PropertySearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'house': return <Home className="h-4 w-4" />;
      case 'apartment': return <Building className="h-4 w-4" />;
      case 'condo': return <Building className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-green-100 text-green-800';
      case 'rent': return 'bg-blue-100 text-blue-800';
      case 'lease': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading properties...</div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Properties</h1>
          <p className="text-gray-600">Find your perfect property</p>
        </div>
        
        {/* Add Property Button - Only show for agents/realtors */}
        {user && (user.role === 'realtor' || user.role === 'house_agent' || user.role === 'house_owner') && (
          <Button
            onClick={() => navigate('/properties/add')}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search Location */}
            <div className="lg:col-span-2">
              <div className="flex">
                <Input
                  placeholder="Search location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-r-none"
                />
                <Button 
                  onClick={handleSearch}
                  className="rounded-l-none"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Property Type Filter */}
            <Select onValueChange={(value) => handleFilterChange('propertyType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>

            {/* Listing Type Filter */}
            <Select onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Listing Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
                <SelectItem value="lease">For Lease</SelectItem>
              </SelectContent>
            </Select>

            {/* Price Range */}
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Min Price"
                onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Max Price"
                onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
              />
            </div>

            {/* Sort */}
            <Select onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Newest First</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="size">Size</SelectItem>
                <SelectItem value="popularity">Most Viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          {properties.length} properties found
        </p>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No properties found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card 
              key={property.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/properties/${property.id}`)}
            >
              <div className="relative">
                {(() => {
                  try {
                    const images = property.images ? JSON.parse(property.images) : [];
                    return images.length > 0 ? (
                      <img
                        src={images[0]}
                        alt={property.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-lg">
                        <Building className="h-12 w-12 text-gray-400" />
                      </div>
                    );
                  } catch (error) {
                    return (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-lg">
                        <Building className="h-12 w-12 text-gray-400" />
                      </div>
                    );
                  }
                })()}
                
                <div className="absolute top-2 left-2">
                  <Badge className={getListingTypeColor(property.type)}>
                    {property.type.toUpperCase()}
                  </Badge>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle favorite toggle
                  }}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg truncate">{property.title}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    {getPropertyTypeIcon(property.propertyType)}
                    <span className="ml-1 capitalize">{property.propertyType}</span>
                  </div>
                </div>

                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm truncate">
                    {property.location}
                  </span>
                </div>

                <div className="flex items-center text-2xl font-bold text-red-600 mb-3">
                  <DollarSign className="h-5 w-5" />
                  {formatCurrency(property.price)}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    <span>{property.bedrooms || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    <span>{property.bathrooms || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <Square className="h-4 w-4 mr-1" />
                    <span>{property.area || 'N/A'} sq ft</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Listed {new Date(property.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span>View Details</span>
                  </div>
                </div>

                {property.owner && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {property.owner.firstName} {property.owner.lastName}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Owner
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Floating Action Button for mobile */}
      {user && (user.role === 'realtor' || user.role === 'house_agent' || user.role === 'house_owner') && (
        <Button
          onClick={() => navigate('/properties/add')}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg md:hidden z-50"
          size="sm"
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}
      </div>
    </MainLayout>
  );
};

export default PropertyListingsPage;
