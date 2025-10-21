import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin,
  Navigation,
  Clock,
  Truck,
  Phone,
  MessageSquare,
  Eye,
  Share2,
  AlertCircle,
  CheckCircle,
  Radio,
  Zap,
  User,
  Package,
  Target,
  Activity,
  Bell,
  Search
} from 'lucide-react';
import { Shipment, DeliveryAgent, GeoLocation, TrackingEvent } from '@/types/delivery';

interface RealTimeTrackingProps {
  shipmentId?: string;
  isAdmin?: boolean;
}

interface LiveShipment extends Shipment {
  estimatedTimeToDelivery?: number;
  distanceToDestination?: number;
  speed?: number;
  lastLocationUpdate?: string;
}

interface TrackingState {
  isLive: boolean;
  lastUpdate: string;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  updateCount: number;
}

export const RealTimeTracking: React.FC<RealTimeTrackingProps> = ({
  shipmentId,
  isAdmin = false
}) => {
  const [selectedShipment, setSelectedShipment] = useState<LiveShipment | null>(null);
  const [liveShipments, setLiveShipments] = useState<LiveShipment[]>([]);
  const [trackingState, setTrackingState] = useState<TrackingState>({
    isLive: false,
    lastUpdate: '',
    connectionStatus: 'disconnected',
    updateCount: 0
  });
  const [searchTrackingNumber, setSearchTrackingNumber] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (shipmentId) {
      loadShipmentDetails(shipmentId);
    } else {
      loadLiveShipments();
    }

    return () => {
      disconnectLiveTracking();
    };
  }, [shipmentId]);

  const loadShipmentDetails = async (id: string) => {
    try {
      // Mock API call to load specific shipment
      const mockShipment: LiveShipment = {
        id: id,
        orderId: 'ORD-12345',
        trackingNumber: 'TRK987654',
        status: 'IN_TRANSIT',
        deliveryType: 'EXPRESS',
        pickupAddress: {
          line1: '123 Warehouse Street',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
          latitude: 6.5244,
          longitude: 3.3792,
          contactName: 'Warehouse Team',
          contactPhone: '+234-801-111-1111'
        },
        deliveryAddress: {
          line1: '456 Customer Avenue',
          city: 'Lagos',
          state: 'Lagos', 
          country: 'Nigeria',
          latitude: 6.5355,
          longitude: 3.3947,
          contactName: 'John Doe',
          contactPhone: '+234-802-222-2222'
        },
        weight: 2.5,
        fragile: false,
        packageValue: 35000,
        description: 'Electronics Package',
        fee: 1500,
        estimatedDelivery: new Date(Date.now() + 30*60000).toISOString(),
        currentLocation: {
          latitude: 6.5299,
          longitude: 3.3869,
          accuracy: 15,
          timestamp: new Date().toISOString()
        },
        agent: {
          id: 'agent-001',
          userId: 'user-001',
          employeeId: 'EMP001',
          firstName: 'Ahmed',
          lastName: 'Ibrahim',
          email: 'ahmed@delivery.com',
          phone: '+234-803-456-7890',
          vehicleType: 'BIKE',
          vehicleModel: 'Honda CB125',
          plateNumber: 'ABC-123-XY',
          active: true,
          verified: true,
          rating: 4.8,
          totalDeliveries: 234,
          completedDeliveries: 218,
          failedDeliveries: 6,
          availability: {
            isOnline: true,
            workingHours: {},
            currentCapacity: 2,
            maxCapacity: 5
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        events: [
          {
            id: 'event-1',
            shipmentId: id,
            eventType: 'ORDER_CREATED',
            eventCode: 'CREATED',
            description: 'Order created and payment confirmed',
            recordedAt: new Date(Date.now() - 2*60*60000).toISOString(),
            createdAt: new Date(Date.now() - 2*60*60000).toISOString()
          },
          {
            id: 'event-2', 
            shipmentId: id,
            eventType: 'PICKED_UP',
            eventCode: 'PICKED_UP',
            description: 'Package picked up from warehouse',
            location: {
              latitude: 6.5244,
              longitude: 3.3792,
              accuracy: 10,
              timestamp: new Date(Date.now() - 60*60000).toISOString()
            },
            recordedAt: new Date(Date.now() - 60*60000).toISOString(),
            createdAt: new Date(Date.now() - 60*60000).toISOString()
          },
          {
            id: 'event-3',
            shipmentId: id,
            eventType: 'IN_TRANSIT',
            eventCode: 'IN_TRANSIT',
            description: 'Package is on the way to destination',
            location: {
              latitude: 6.5299,
              longitude: 3.3869,
              accuracy: 15,
              timestamp: new Date(Date.now() - 10*60000).toISOString()
            },
            recordedAt: new Date(Date.now() - 10*60000).toISOString(),
            createdAt: new Date(Date.now() - 10*60000).toISOString()
          }
        ],
        estimatedTimeToDelivery: 25, // minutes
        distanceToDestination: 2.1, // km
        speed: 35, // km/h
        lastLocationUpdate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setSelectedShipment(mockShipment);
      setLiveShipments([mockShipment]);
    } catch (error) {
      console.error('Error loading shipment details:', error);
    }
  };

  const loadLiveShipments = async () => {
    try {
      // Mock API call to load active shipments
      const mockShipments: LiveShipment[] = [
        {
          id: 'ship-001',
          orderId: 'ORD-001',
          trackingNumber: 'TRK123001',
          status: 'OUT_FOR_DELIVERY',
          deliveryType: 'EXPRESS',
          pickupAddress: {
            line1: '789 Store Road',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria',
            contactName: 'Store Manager',
            contactPhone: '+234-801-111-1111'
          },
          deliveryAddress: {
            line1: '321 Home Street',
            city: 'Lagos', 
            state: 'Lagos',
            country: 'Nigeria',
            latitude: 6.6018,
            longitude: 3.3515,
            contactName: 'Jane Smith',
            contactPhone: '+234-802-222-2222'
          },
          weight: 1.5,
          fragile: false,
          packageValue: 15000,
          description: 'Fashion Items',
          fee: 1200,
          estimatedDelivery: new Date(Date.now() + 15*60000).toISOString(),
          currentLocation: {
            latitude: 6.5955,
            longitude: 3.3480,
            accuracy: 12,
            timestamp: new Date().toISOString()
          },
          estimatedTimeToDelivery: 12,
          distanceToDestination: 0.8,
          speed: 28,
          lastLocationUpdate: new Date(Date.now() - 2*60000).toISOString(),
          events: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'ship-002',
          orderId: 'ORD-002', 
          trackingNumber: 'TRK123002',
          status: 'IN_TRANSIT',
          deliveryType: 'STANDARD',
          pickupAddress: {
            line1: '456 Warehouse Ave',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria',
            contactName: 'Warehouse Staff',
            contactPhone: '+234-803-333-3333'
          },
          deliveryAddress: {
            line1: '654 Office Plaza',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria',
            latitude: 6.4485,
            longitude: 3.3915,
            contactName: 'Mike Johnson',
            contactPhone: '+234-804-444-4444'
          },
          weight: 3.2,
          fragile: true,
          packageValue: 28000,
          description: 'Office Supplies',
          fee: 1800,
          estimatedDelivery: new Date(Date.now() + 45*60000).toISOString(),
          currentLocation: {
            latitude: 6.4920,
            longitude: 3.3654,
            accuracy: 18,
            timestamp: new Date().toISOString()
          },
          estimatedTimeToDelivery: 38,
          distanceToDestination: 4.3,
          speed: 42,
          lastLocationUpdate: new Date(Date.now() - 1*60000).toISOString(),
          events: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setLiveShipments(mockShipments);
      if (!selectedShipment && mockShipments.length > 0) {
        setSelectedShipment(mockShipments[0]);
      }
    } catch (error) {
      console.error('Error loading live shipments:', error);
    }
  };

  const connectLiveTracking = () => {
    if (trackingState.isLive) return;

    setTrackingState(prev => ({ ...prev, connectionStatus: 'connecting' }));

    // Simulate WebSocket connection
    setTimeout(() => {
      setTrackingState(prev => ({
        ...prev,
        isLive: true,
        connectionStatus: 'connected',
        lastUpdate: new Date().toISOString()
      }));

      // Start mock location updates
      updateIntervalRef.current = setInterval(() => {
        updateShipmentLocations();
      }, 5000); // Update every 5 seconds

      addNotification('Live tracking started');
    }, 1000);
  };

  const disconnectLiveTracking = () => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setTrackingState({
      isLive: false,
      connectionStatus: 'disconnected',
      lastUpdate: '',
      updateCount: 0
    });
  };

  const updateShipmentLocations = () => {
    setLiveShipments(prev => prev.map(shipment => {
      if (shipment.status === 'DELIVERED' || shipment.status === 'CANCELLED') {
        return shipment;
      }

      // Simulate movement towards destination
      const currentLat = shipment.currentLocation?.latitude || 0;
      const currentLng = shipment.currentLocation?.longitude || 0;
      const destLat = shipment.deliveryAddress.latitude || 0;
      const destLng = shipment.deliveryAddress.longitude || 0;

      // Move 10% closer to destination
      const newLat = currentLat + (destLat - currentLat) * 0.1;
      const newLng = currentLng + (destLng - currentLng) * 0.1;
      
      const updatedShipment: LiveShipment = {
        ...shipment,
        currentLocation: {
          latitude: newLat,
          longitude: newLng,
          accuracy: 10 + Math.random() * 10,
          timestamp: new Date().toISOString()
        },
        lastLocationUpdate: new Date().toISOString(),
        distanceToDestination: Math.max(0.1, (shipment.distanceToDestination || 0) - 0.2),
        estimatedTimeToDelivery: Math.max(1, (shipment.estimatedTimeToDelivery || 0) - 1)
      };

      return updatedShipment;
    }));

    setTrackingState(prev => ({
      ...prev,
      lastUpdate: new Date().toISOString(),
      updateCount: prev.updateCount + 1
    }));

    // Randomly add tracking events
    if (Math.random() < 0.3) {
      addNotification('Location updated for active deliveries');
    }
  };

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev.slice(0, 4)]);
  };

  const searchByTrackingNumber = async () => {
    if (!searchTrackingNumber.trim()) return;

    // Mock search functionality
    const foundShipment = liveShipments.find(s => 
      s.trackingNumber.toLowerCase().includes(searchTrackingNumber.toLowerCase())
    );

    if (foundShipment) {
      setSelectedShipment(foundShipment);
      addNotification(`Found shipment: ${foundShipment.trackingNumber}`);
    } else {
      addNotification(`No shipment found with tracking number: ${searchTrackingNumber}`);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'PICKED_UP': return 'bg-purple-100 text-purple-800';
      case 'IN_TRANSIT': return 'bg-indigo-100 text-indigo-800';
      case 'OUT_FOR_DELIVERY': return 'bg-orange-100 text-orange-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (trackingState.connectionStatus) {
      case 'connected':
        return <Radio className="h-4 w-4 text-green-600" />;
      case 'connecting':
        return <Activity className="h-4 w-4 text-yellow-600 animate-pulse" />;
      default:
        return <Radio className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Live Status */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Tracking</h1>
          <p className="text-gray-600 mt-1">
            Live delivery tracking and monitoring
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {getConnectionStatusIcon()}
            <span className="text-sm font-medium">
              {trackingState.connectionStatus === 'connected' ? 'Live' : 
               trackingState.connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
            </span>
            {trackingState.isLive && (
              <Badge variant="outline" className="text-green-800 bg-green-50">
                {trackingState.updateCount} updates
              </Badge>
            )}
          </div>
          <Button 
            onClick={trackingState.isLive ? disconnectLiveTracking : connectLiveTracking}
            variant={trackingState.isLive ? "outline" : "default"}
          >
            {trackingState.isLive ? 'Stop Live Tracking' : 'Start Live Tracking'}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Enter tracking number to search..."
                value={searchTrackingNumber}
                onChange={(e) => setSearchTrackingNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchByTrackingNumber()}
              />
            </div>
            <Button onClick={searchByTrackingNumber}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipments List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Active Shipments</CardTitle>
              <CardDescription>{liveShipments.length} shipments being tracked</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2 p-4">
                {liveShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedShipment?.id === shipment.id 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedShipment(shipment)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-sm">{shipment.trackingNumber}</p>
                        <p className="text-xs text-gray-600">{shipment.orderId}</p>
                      </div>
                      <Badge className={getStatusColor(shipment.status)}>
                        {shipment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-gray-400" />
                        <span>{shipment.deliveryAddress.contactName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>ETA: {shipment.estimatedTimeToDelivery || 'N/A'} min</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-3 w-3 text-gray-400" />
                        <span>{shipment.distanceToDestination?.toFixed(1) || 'N/A'} km away</span>
                      </div>
                    </div>
                    
                    {trackingState.isLive && shipment.lastLocationUpdate && (
                      <div className="flex items-center space-x-1 mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600">
                          Updated {formatTimeAgo(shipment.lastLocationUpdate)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Live Notifications */}
          {notifications.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Live Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {notifications.map((notification, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Bell className="h-3 w-3 text-blue-600" />
                      <span className="text-gray-700">{notification}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Tracking Display */}
        <div className="lg:col-span-2">
          {selectedShipment ? (
            <Tabs defaultValue="map" className="space-y-4">
              <TabsList>
                <TabsTrigger value="map">Live Map</TabsTrigger>
                <TabsTrigger value="details">Shipment Details</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="agent">Delivery Agent</TabsTrigger>
              </TabsList>

              <TabsContent value="map">
                <Card>
                  <CardHeader>
                    <CardTitle>Live Location</CardTitle>
                    <CardDescription>
                      Real-time tracking for {selectedShipment.trackingNumber}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Mock Map Container */}
                    <div className="h-96 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">Live Interactive Map</h3>
                        <p className="text-gray-600 mb-4">
                          Real-time location tracking with route visualization
                        </p>
                        {selectedShipment.currentLocation && (
                          <div className="text-sm text-gray-500">
                            <p>Current Position: {selectedShipment.currentLocation.latitude.toFixed(4)}, {selectedShipment.currentLocation.longitude.toFixed(4)}</p>
                            <p>Accuracy: ±{selectedShipment.currentLocation.accuracy}m</p>
                            <p>Last Updated: {formatTimeAgo(selectedShipment.currentLocation.timestamp)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Live Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <p className="text-sm font-medium">ETA</p>
                        <p className="text-lg font-bold">
                          {selectedShipment.estimatedTimeToDelivery || 'N/A'} min
                        </p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="text-sm font-medium">Distance</p>
                        <p className="text-lg font-bold">
                          {selectedShipment.distanceToDestination?.toFixed(1) || 'N/A'} km
                        </p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Zap className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <p className="text-sm font-medium">Speed</p>
                        <p className="text-lg font-bold">{selectedShipment.speed || 'N/A'} km/h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Shipment Details</CardTitle>
                    <CardDescription>{selectedShipment.trackingNumber}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(selectedShipment.status)}>
                        {selectedShipment.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">{selectedShipment.deliveryType}</Badge>
                      {selectedShipment.fragile && (
                        <Badge variant="outline" className="text-yellow-800 bg-yellow-50">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Fragile
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Pickup Address</h4>
                        <div className="space-y-2 text-sm">
                          <p>{selectedShipment.pickupAddress.line1}</p>
                          <p>{selectedShipment.pickupAddress.city}, {selectedShipment.pickupAddress.state}</p>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{selectedShipment.pickupAddress.contactName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{selectedShipment.pickupAddress.contactPhone}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Delivery Address</h4>
                        <div className="space-y-2 text-sm">
                          <p>{selectedShipment.deliveryAddress.line1}</p>
                          <p>{selectedShipment.deliveryAddress.city}, {selectedShipment.deliveryAddress.state}</p>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{selectedShipment.deliveryAddress.contactName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{selectedShipment.deliveryAddress.contactPhone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Weight</p>
                        <p className="text-lg font-semibold">{selectedShipment.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Package Value</p>
                        <p className="text-lg font-semibold">₦{selectedShipment.packageValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Delivery Fee</p>
                        <p className="text-lg font-semibold">₦{selectedShipment.fee}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">ETA</p>
                        <p className="text-lg font-semibold">
                          {new Date(selectedShipment.estimatedDelivery!).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline">
                        <Phone className="mr-2 h-4 w-4" />
                        Call Customer
                      </Button>
                      <Button variant="outline">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                      <Button variant="outline">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Tracking
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Timeline</CardTitle>
                    <CardDescription>Real-time tracking events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedShipment.events.map((event, index) => (
                        <div key={event.id} className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                              <CheckCircle className="h-4 w-4" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{event.description}</h4>
                              <span className="text-sm text-gray-500">
                                {formatTimeAgo(event.recordedAt)}
                              </span>
                            </div>
                            {event.location && (
                              <p className="text-sm text-gray-600 mt-1">
                                Location: {event.location.latitude.toFixed(4)}, {event.location.longitude.toFixed(4)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="agent">
                {selectedShipment.agent && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Agent</CardTitle>
                      <CardDescription>Current agent handling this delivery</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">
                            {selectedShipment.agent.firstName} {selectedShipment.agent.lastName}
                          </h3>
                          <p className="text-gray-600">{selectedShipment.agent.employeeId}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Contact</p>
                              <p className="text-sm">{selectedShipment.agent.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Vehicle</p>
                              <p className="text-sm">{selectedShipment.agent.vehicleModel} ({selectedShipment.agent.plateNumber})</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Rating</p>
                              <p className="text-sm">{selectedShipment.agent.rating}/5.0 ({selectedShipment.agent.totalDeliveries} deliveries)</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Status</p>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm">Online & Available</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-2 mt-4">
                            <Button size="sm">
                              <Phone className="mr-2 h-4 w-4" />
                              Call Agent
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No shipment selected</h3>
                <p className="text-gray-600">
                  Select a shipment from the list to view real-time tracking details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
