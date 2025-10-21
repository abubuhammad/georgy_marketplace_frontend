import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { LatLng, Icon, Map as LeafletMap } from 'leaflet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Maximize, 
  Search, 
  Home,
  Car,
  Train,
  ShoppingBag,
  Hospital,
  GraduationCap,
  Camera
} from 'lucide-react';

// Fix for default markers in react-leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configure default marker
const DefaultIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconRetinaUrl: markerIcon2x,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface PropertyMarker extends Location {
  id: string;
  title: string;
  price: number;
  type: 'sale' | 'rent' | 'lease';
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  image?: string;
}

interface NearbyPlace {
  id: string;
  name: string;
  type: 'school' | 'hospital' | 'shopping' | 'transport' | 'restaurant';
  distance: number;
  lat: number;
  lng: number;
  rating?: number;
}

interface PropertyMapProps {
  center?: Location;
  zoom?: number;
  height?: string;
  properties?: PropertyMarker[];
  selectedProperty?: string;
  isSelectable?: boolean;
  showNearbyPlaces?: boolean;
  onLocationSelect?: (location: Location) => void;
  onPropertySelect?: (propertyId: string) => void;
  className?: string;
}

const NEARBY_PLACE_ICONS = {
  school: { icon: GraduationCap, color: 'text-blue-600' },
  hospital: { icon: Hospital, color: 'text-red-600' },
  shopping: { icon: ShoppingBag, color: 'text-purple-600' },
  transport: { icon: Train, color: 'text-green-600' },
  restaurant: { icon: Car, color: 'text-orange-600' }
};

// Component to handle map clicks
function LocationSelector({ onLocationSelect }: { onLocationSelect?: (location: Location) => void }) {
  useMapEvents({
    click: (e) => {
      if (onLocationSelect) {
        onLocationSelect({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      }
    }
  });
  return null;
}

// Component to handle map resize
function MapResizer() {
  const map = useMap();
  
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    
    const container = map.getContainer();
    if (container) {
      resizeObserver.observe(container);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [map]);
  
  return null;
}

export function PropertyMap({
  center = { lat: 6.5244, lng: 3.3792 }, // Lagos, Nigeria default
  zoom = 12,
  height = '400px',
  properties = [],
  selectedProperty,
  isSelectable = false,
  showNearbyPlaces = false,
  onLocationSelect,
  onPropertySelect,
  className
}: PropertyMapProps) {
  const [mapCenter, setMapCenter] = useState<Location>(center);
  const [searchAddress, setSearchAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const mapRef = useRef<LeafletMap>(null);

  // Mock nearby places data
  const mockNearbyPlaces: NearbyPlace[] = [
    {
      id: '1',
      name: 'Victoria Island Primary School',
      type: 'school',
      distance: 0.8,
      lat: center.lat + 0.01,
      lng: center.lng + 0.01,
      rating: 4.5
    },
    {
      id: '2',
      name: 'Lagos University Teaching Hospital',
      type: 'hospital',
      distance: 1.2,
      lat: center.lat - 0.015,
      lng: center.lng + 0.02,
      rating: 4.0
    },
    {
      id: '3',
      name: 'Palms Shopping Mall',
      type: 'shopping',
      distance: 2.1,
      lat: center.lat + 0.02,
      lng: center.lng - 0.01,
      rating: 4.8
    },
    {
      id: '4',
      name: 'BRT Station',
      type: 'transport',
      distance: 0.3,
      lat: center.lat - 0.005,
      lng: center.lng - 0.008,
      rating: 3.5
    }
  ];

  useEffect(() => {
    if (showNearbyPlaces) {
      setNearbyPlaces(mockNearbyPlaces);
    }
  }, [showNearbyPlaces, center]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) return;
    
    setIsSearching(true);
    try {
      // Mock geocoding - in real implementation, use a geocoding service
      // For now, just center on a mock location
      const mockLocation = {
        lat: 6.5244 + (Math.random() - 0.5) * 0.1,
        lng: 3.3792 + (Math.random() - 0.5) * 0.1,
        address: searchAddress
      };
      
      setMapCenter(mockLocation);
      if (mapRef.current) {
        mapRef.current.setView([mockLocation.lat, mockLocation.lng], 15);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMapCenter(location);
          if (mapRef.current) {
            mapRef.current.setView([location.lat, location.lng], 15);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  const handleFullscreen = () => {
    const element = document.querySelector('.map-container');
    if (element && element.requestFullscreen) {
      element.requestFullscreen();
    }
  };

  const getPropertyMarkerColor = (type: string) => {
    switch (type) {
      case 'sale': return '#dc2626'; // red
      case 'rent': return '#2563eb'; // blue
      case 'lease': return '#16a34a'; // green
      default: return '#6b7280'; // gray
    }
  };

  const createPropertyIcon = (property: PropertyMarker) => {
    const color = getPropertyMarkerColor(property.type);
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 0C6.7 0 0 6.7 0 15c0 15 15 25 15 25s15-10 15-25C30 6.7 23.3 0 15 0z" fill="${color}"/>
          <circle cx="15" cy="15" r="8" fill="white"/>
          <text x="15" y="19" text-anchor="middle" font-size="10" fill="${color}">₦</text>
        </svg>
      `)}`,
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -40]
    });
  };

  const createNearbyPlaceIcon = (place: NearbyPlace) => {
    const { color } = NEARBY_PLACE_ICONS[place.type];
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12.5" cy="12.5" r="12.5" fill="white" stroke="${color.replace('text-', '#')}" stroke-width="2"/>
          <circle cx="12.5" cy="12.5" r="6" fill="${color.replace('text-', '#')}"/>
        </svg>
      `)}`,
      iconSize: [25, 25],
      iconAnchor: [12.5, 12.5],
      popupAnchor: [0, -12.5]
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Map Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search for an address..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
          />
          <Button
            onClick={handleSearchAddress}
            disabled={isSearching}
            variant="outline"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={getUserLocation}
            variant="outline"
            size="icon"
            title="Get my location"
          >
            <Navigation className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleFullscreen}
            variant="outline"
            size="icon"
            title="Fullscreen"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div 
        className="map-container relative border rounded-lg overflow-hidden"
        style={{ height }}
      >
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapResizer />
          
          {isSelectable && (
            <LocationSelector onLocationSelect={handleLocationSelect} />
          )}

          {/* Selected Location Marker */}
          {selectedLocation && (
            <Marker
              position={[selectedLocation.lat, selectedLocation.lng]}
              icon={DefaultIcon}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-medium">Selected Location</h4>
                  <p className="text-sm text-gray-600">
                    {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                  {selectedLocation.address && (
                    <p className="text-sm">{selectedLocation.address}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Property Markers */}
          {properties.map((property) => (
            <Marker
              key={property.id}
              position={[property.lat, property.lng]}
              icon={createPropertyIcon(property)}
              eventHandlers={{
                click: () => onPropertySelect?.(property.id)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{property.title}</h4>
                    <Badge variant={property.type === 'sale' ? 'destructive' : 'default'}>
                      {property.type}
                    </Badge>
                  </div>
                  
                  {property.image && (
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                  )}
                  
                  <p className="text-lg font-bold text-red-600 mb-2">
                    ₦{property.price.toLocaleString()}
                    {property.type === 'rent' && '/month'}
                  </p>
                  
                  <div className="flex gap-4 text-sm text-gray-600">
                    {property.bedrooms && (
                      <span>{property.bedrooms} beds</span>
                    )}
                    {property.bathrooms && (
                      <span>{property.bathrooms} baths</span>
                    )}
                    {property.area && (
                      <span>{property.area} sqm</span>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => onPropertySelect?.(property.id)}
                  >
                    View Details
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Nearby Places Markers */}
          {showNearbyPlaces && nearbyPlaces.map((place) => (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={createNearbyPlaceIcon(place)}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-medium flex items-center gap-2">
                    {React.createElement(NEARBY_PLACE_ICONS[place.type].icon, {
                      className: `h-4 w-4 ${NEARBY_PLACE_ICONS[place.type].color}`
                    })}
                    {place.name}
                  </h4>
                  <p className="text-sm text-gray-600 capitalize">
                    {place.type} • {place.distance}km away
                  </p>
                  {place.rating && (
                    <p className="text-sm">
                      ⭐ {place.rating}/5
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Legend */}
        {(properties.length > 0 || showNearbyPlaces) && (
          <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
            <h4 className="font-medium mb-2">Legend</h4>
            
            {properties.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span>For Sale</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span>For Rent</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span>For Lease</span>
                </div>
              </div>
            )}
            
            {showNearbyPlaces && (
              <div className="space-y-1 mt-2 pt-2 border-t">
                {Object.entries(NEARBY_PLACE_ICONS).map(([type, config]) => (
                  <div key={type} className="flex items-center gap-2 text-sm">
                    {React.createElement(config.icon, {
                      className: `h-3 w-3 ${config.color}`
                    })}
                    <span className="capitalize">{type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Selected Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Latitude</Label>
                <p className="font-mono">{selectedLocation.lat.toFixed(6)}</p>
              </div>
              <div>
                <Label>Longitude</Label>
                <p className="font-mono">{selectedLocation.lng.toFixed(6)}</p>
              </div>
            </div>
            {selectedLocation.address && (
              <div className="mt-2">
                <Label>Address</Label>
                <p>{selectedLocation.address}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PropertyMap;
