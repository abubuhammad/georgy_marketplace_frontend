import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Search, Navigation, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PropertyMap } from './PropertyMap';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface LocationSuggestion {
  id: string;
  address: string;
  type: 'street' | 'landmark' | 'area' | 'city';
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value?: Location;
  onChange: (location: Location) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  mapHeight?: string;
  showMap?: boolean;
}

// Mock location suggestions - in real implementation, use a geocoding service
const mockSuggestions: LocationSuggestion[] = [
  {
    id: '1',
    address: 'Victoria Island, Lagos',
    type: 'area',
    lat: 6.4281,
    lng: 3.4219
  },
  {
    id: '2',
    address: 'Ikoyi, Lagos',
    type: 'area',
    lat: 6.4474,
    lng: 3.4553
  },
  {
    id: '3',
    address: 'Lekki Phase 1, Lagos',
    type: 'area',
    lat: 6.4449,
    lng: 3.5087
  },
  {
    id: '4',
    address: 'Ikeja GRA, Lagos',
    type: 'area',
    lat: 6.5927,
    lng: 3.3621
  },
  {
    id: '5',
    address: 'Surulere, Lagos',
    type: 'area',
    lat: 6.4969,
    lng: 3.3617
  },
  {
    id: '6',
    address: 'Eko Atlantic City, Lagos',
    type: 'landmark',
    lat: 6.4059,
    lng: 3.4026
  },
  {
    id: '7',
    address: 'National Theatre, Lagos',
    type: 'landmark',
    lat: 6.4641,
    lng: 3.3744
  },
  {
    id: '8',
    address: 'Lagos State University, Ojo',
    type: 'landmark',
    lat: 6.5107,
    lng: 3.1965
  }
];

export function LocationPicker({
  value,
  onChange,
  placeholder = "Enter location...",
  label = "Location",
  required = false,
  className,
  mapHeight = "300px",
  showMap = true
}: LocationPickerProps) {
  const [searchTerm, setSearchTerm] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(value);
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    if (value) {
      setSelectedLocation(value);
      setSearchTerm(value.address || `${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}`);
    }
  }, [value]);

  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Mock API call - in real implementation, call geocoding service
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.address.toLowerCase().includes(query.toLowerCase())
      );
      
      setSuggestions(filtered);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Location search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchLocations(value);
  };

  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    const location: Location = {
      lat: suggestion.lat,
      lng: suggestion.lng,
      address: suggestion.address
    };
    
    setSelectedLocation(location);
    setSearchTerm(suggestion.address);
    setShowSuggestions(false);
    onChange(location);
  };

  const handleMapLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    const address = location.address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
    setSearchTerm(address);
    onChange({
      ...location,
      address
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
          };
          
          setSelectedLocation(location);
          setSearchTerm(location.address);
          onChange(location);
          setIsLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLoading(false);
        }
      );
    }
  };

  const clearLocation = () => {
    setSelectedLocation(undefined);
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'landmark': return 'bg-purple-100 text-purple-700';
      case 'area': return 'bg-blue-100 text-blue-700';
      case 'street': return 'bg-green-100 text-green-700';
      case 'city': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Location Input */}
      <div className="space-y-2">
        <Label htmlFor="location-search">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        <div className="relative">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="location-search"
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              className="pl-9 pr-20"
              required={required}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              {selectedLocation && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={clearLocation}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={getCurrentLocation}
                disabled={isLoading}
                title="Use current location"
              >
                <Navigation className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between"
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <div>
                    <p className="font-medium">{suggestion.address}</p>
                    <p className="text-sm text-gray-500">
                      {suggestion.lat.toFixed(4)}, {suggestion.lng.toFixed(4)}
                    </p>
                  </div>
                  <Badge variant="outline" className={getLocationTypeColor(suggestion.type)}>
                    {suggestion.type}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Show Map Toggle */}
        {showMap && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowMapPicker(!showMapPicker)}
            >
              <MapPin className="h-4 w-4 mr-2" />
              {showMapPicker ? 'Hide Map' : 'Pick on Map'}
            </Button>
            
            {selectedLocation && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                Location selected
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Location Summary */}
      {selectedLocation && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium mb-1">Selected Location</h4>
                <p className="text-sm text-gray-600">
                  {selectedLocation.address || 'Custom location'}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearLocation}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Picker */}
      {showMapPicker && showMap && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pick Location on Map
            </CardTitle>
            <p className="text-sm text-gray-600">
              Click on the map to select a location
            </p>
          </CardHeader>
          <CardContent>
            <PropertyMap
              center={selectedLocation || { lat: 6.5244, lng: 3.3792 }}
              height={mapHeight}
              isSelectable={true}
              onLocationSelect={handleMapLocationSelect}
              className="border rounded-lg overflow-hidden"
            />
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            Searching...
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationPicker;
