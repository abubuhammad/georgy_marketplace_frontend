import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useArtisan } from '@/contexts/ArtisanContext';
import { ServiceCategory } from '@/types';
import { cn } from '@/lib/utils';

interface ServiceCategoriesProps {
  onCategorySelect: (category: ServiceCategory) => void;
  selectedCategory?: ServiceCategory | null;
  showSearch?: boolean;
  showFilters?: boolean;
  layout?: 'grid' | 'list';
}

const popularCategories = [
  { icon: '🔧', name: 'Plumbing', description: 'Pipes, fixtures, water systems' },
  { icon: '⚡', name: 'Electrical', description: 'Wiring, outlets, lighting' },
  { icon: '🪚', name: 'Carpentry', description: 'Furniture, doors, windows' },
  { icon: '🎨', name: 'Painting', description: 'Interior, exterior painting' },
  { icon: '🧹', name: 'Cleaning', description: 'Home, office cleaning' },
  { icon: '💄', name: 'Beauty', description: 'Hair, nails, makeup' },
  { icon: '🚗', name: 'Automotive', description: 'Car repair, maintenance' },
  { icon: '🔨', name: 'Handyman', description: 'General repairs, fixes' },
];

export default function ServiceCategories({
  onCategorySelect,
  selectedCategory,
  showSearch = true,
  showFilters = true,
  layout = 'grid',
}: ServiceCategoriesProps) {
  const { serviceCategories, loadServiceCategories, isLoading } = useArtisan();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<ServiceCategory[]>([]);

  useEffect(() => {
    loadServiceCategories();
  }, [loadServiceCategories]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = serviceCategories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(serviceCategories);
    }
  }, [searchQuery, serviceCategories]);

  const handleCategoryClick = (category: ServiceCategory) => {
    onCategorySelect(category);
  };

  const CategoryCard = ({ category, isPopular = false }: { category: ServiceCategory | any; isPopular?: boolean }) => (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105",
        selectedCategory?.id === category.id && "ring-2 ring-red-500 bg-red-50"
      )}
      onClick={() => handleCategoryClick(category)}
    >
      <CardContent className="p-4 text-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="text-3xl">
            {isPopular ? category.icon : (category.icon || '🔧')}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
          </div>
          {isPopular && (
            <Badge variant="secondary" className="text-xs">
              Popular
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const EmergencyServices = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <h3 className="font-semibold text-red-800">Emergency Services</h3>
      </div>
      <p className="text-sm text-red-700 mb-3">
        Need urgent help? Connect with verified professionals available 24/7
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {['Emergency Plumbing', 'Electrical Issues', 'Locksmith', 'HVAC Repair'].map((service) => (
          <Button
            key={service}
            variant="outline"
            size="sm"
            className="text-red-700 border-red-300 hover:bg-red-100"
          >
            {service}
          </Button>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {showSearch && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {showFilters && (
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          )}
        </div>
      )}

      {/* Emergency Services Banner */}
      <EmergencyServices />

      {/* Popular Categories */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🔥</span>
          Popular Services
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {popularCategories.map((category, index) => (
            <CategoryCard key={index} category={category} isPopular />
          ))}
        </div>
      </div>

      {/* All Categories */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          All Services ({filteredCategories.length})
        </h2>
        
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">🔍</div>
            <p className="text-gray-600">No services found for "{searchQuery}"</p>
            <Button 
              variant="link" 
              onClick={() => setSearchQuery('')}
              className="text-red-600"
            >
              Clear search
            </Button>
          </div>
        ) : (
          <div className={cn(
            layout === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "space-y-2"
          )}>
            {filteredCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>

      {/* Location-based suggestion */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Find Services Near You</h3>
        </div>
        <p className="text-sm text-blue-700">
          Allow location access to discover artisans and services in your area
        </p>
      </div>
    </div>
  );
}
