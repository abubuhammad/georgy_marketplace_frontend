import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  MapPin,
  Truck,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Package,
  User,
  Route,
  Timer,
  Zap
} from 'lucide-react';
import io, { Socket } from 'socket.io-client';

// Types
interface DeliveryLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'BIKE' | 'CAR' | 'VAN' | 'TRUCK';
  vehicleNumber?: string;
  rating: number;
  currentLocation?: DeliveryLocation;
  isOnline: boolean;
}

interface DeliveryStatus {
  deliveryId: string;
  trackingNumber: string;
  status: 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  currentLocation?: DeliveryLocation;
  estimatedDelivery: string;
  agent?: DeliveryAgent;
  customer: {
    name: string;
    address: string;
    phone: string;
    location: DeliveryLocation;
  };
  pickup: {
    address: string;
    location: DeliveryLocation;
    completedAt?: string;
  };
  events: DeliveryEvent[];
  eta?: string;
  distance?: number;
  route?: DeliveryLocation[];
}

interface DeliveryEvent {
  id: string;
  type: string;
  description: string;
  location?: DeliveryLocation;
  timestamp: string;
  agentName?: string;
}

interface RealTimeDeliveryTrackerProps {
  deliveryId: string;
  trackingNumber?: string;
  onStatusUpdate?: (status: DeliveryStatus) => void;
  showAgentContact?: boolean;
  showRoute?: boolean;
  enableSound?: boolean;
  className?: string;
}

export const RealTimeDeliveryTracker: React.FC<RealTimeDeliveryTrackerProps> = ({
  deliveryId,
  trackingNumber,
  onStatusUpdate,
  showAgentContact = true,
  showRoute = true,
  enableSound = true,
  className
}) => {
  // State
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [estimatedProgress, setEstimatedProgress] = useState(0);

  // WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError('Authentication required for real-time tracking');
      return;
    }

    const newSocket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to real-time delivery tracking');
      setIsConnected(true);
      setError(null);
      
      // Start tracking this delivery
      newSocket.emit('delivery:track', deliveryId);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from real-time tracking');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setError('Failed to connect to real-time tracking');
      setIsConnected(false);
    });

    // Real-time delivery updates
    newSocket.on('delivery:current_status', (status: DeliveryStatus) => {
      console.log('📍 Current delivery status:', status);
      setDeliveryStatus(status);
      setLastUpdate(new Date());
      onStatusUpdate?.(status);
      
      if (enableSound) {
        playNotificationSound('update');
      }
    });

    newSocket.on('delivery:location_update', (data: {
      deliveryId: string;
      agentId: string;
      location: DeliveryLocation;
      eta?: string;
    }) => {
      if (data.deliveryId === deliveryId) {
        console.log('📍 Agent location update:', data);
        setDeliveryStatus(prev => prev ? {
          ...prev,
          currentLocation: data.location,
          eta: data.eta || prev.eta,
          agent: prev.agent ? {
            ...prev.agent,
            currentLocation: data.location
          } : prev.agent
        } : null);
        setLastUpdate(new Date());
        
        if (enableSound) {
          playNotificationSound('location');
        }
      }
    });

    newSocket.on('delivery:status_update', (data: {
      deliveryId: string;
      status: string;
      location?: DeliveryLocation;
      eta?: string;
      event: DeliveryEvent;
    }) => {
      if (data.deliveryId === deliveryId) {
        console.log('🚚 Delivery status update:', data);
        setDeliveryStatus(prev => prev ? {
          ...prev,
          status: data.status as any,
          currentLocation: data.location || prev.currentLocation,
          eta: data.eta || prev.eta,
          events: [data.event, ...prev.events]
        } : null);
        setLastUpdate(new Date());
        
        if (enableSound) {
          playNotificationSound('status');
        }
      }
    });

    newSocket.on('delivery:eta_update', (data: {
      deliveryId: string;
      eta: string;
    }) => {
      if (data.deliveryId === deliveryId) {
        console.log('⏱️ ETA update:', data);
        setDeliveryStatus(prev => prev ? {
          ...prev,
          eta: data.eta
        } : null);
        setLastUpdate(new Date());
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('delivery:stop_tracking', deliveryId);
      newSocket.disconnect();
    };
  }, [deliveryId, enableSound, onStatusUpdate]);

  // Calculate progress
  useEffect(() => {
    if (deliveryStatus) {
      const progress = calculateDeliveryProgress(deliveryStatus.status);
      setEstimatedProgress(progress);
    }
  }, [deliveryStatus?.status]);

  // Sound notifications
  const playNotificationSound = useCallback((type: 'update' | 'location' | 'status') => {
    if (!enableSound) return;
    
    try {
      const audio = new Audio();
      switch (type) {
        case 'status':
          audio.src = '/sounds/delivery-status-update.mp3';
          break;
        case 'location':
          audio.src = '/sounds/location-update.mp3';
          break;
        default:
          audio.src = '/sounds/notification.mp3';
      }
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore audio play errors (browser restrictions)
      });
    } catch (error) {
      // Ignore audio errors
    }
  }, [enableSound]);

  // Helper functions
  const calculateDeliveryProgress = (status: string): number => {
    const statusProgress = {
      'PENDING': 0,
      'PICKED_UP': 25,
      'IN_TRANSIT': 50,
      'OUT_FOR_DELIVERY': 75,
      'DELIVERED': 100,
      'FAILED': 0
    };
    return statusProgress[status as keyof typeof statusProgress] || 0;
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      'PENDING': 'bg-gray-500',
      'PICKED_UP': 'bg-blue-500',
      'IN_TRANSIT': 'bg-purple-500',
      'OUT_FOR_DELIVERY': 'bg-orange-500',
      'DELIVERED': 'bg-green-500',
      'FAILED': 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'BIKE': return '🏍️';
      case 'CAR': return '🚗';
      case 'VAN': return '🚐';
      case 'TRUCK': return '🚛';
      default: return '🚚';
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const formatETA = (eta?: string): string => {
    if (!eta) return 'Calculating...';
    
    try {
      const etaDate = new Date(eta);
      const now = new Date();
      const diffMs = etaDate.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffMinutes < 0) return 'Overdue';
      if (diffMinutes < 60) return `${diffMinutes} minutes`;
      if (diffMinutes < 1440) {
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        return `${hours}h ${minutes}m`;
      }
      
      return etaDate.toLocaleDateString() + ' ' + etaDate.toLocaleTimeString();
    } catch {
      return eta;
    }
  };

  const refreshTracking = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('delivery:track', deliveryId);
    }
  }, [socket, isConnected, deliveryId]);

  // Contact agent
  const contactAgent = useCallback((method: 'call' | 'message') => {
    if (!deliveryStatus?.agent?.phone) return;
    
    if (method === 'call') {
      window.open(`tel:${deliveryStatus.agent.phone}`);
    } else {
      // This would typically open a chat interface
      console.log('Opening chat with agent:', deliveryStatus.agent.id);
    }
  }, [deliveryStatus?.agent]);

  // Render loading state
  if (!deliveryStatus && !error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p>Loading delivery tracking...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={refreshTracking} 
            className="mt-4"
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {isConnected ? 'Live Tracking Active' : 'Connection Lost'}
              </span>
              {lastUpdate && (
                <span className="text-xs text-gray-500">
                  Last update: {formatTimeAgo(lastUpdate.toISOString())}
                </span>
              )}
            </div>
            <Button 
              onClick={refreshTracking} 
              size="sm" 
              variant="ghost"
              disabled={!isConnected}
            >
              <RefreshCw className={`h-4 w-4 ${!isConnected ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Tracking Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Package Tracking</span>
              </CardTitle>
              <CardDescription>
                {trackingNumber || deliveryStatus!.trackingNumber}
              </CardDescription>
            </div>
            <Badge 
              variant="secondary" 
              className={`${getStatusColor(deliveryStatus!.status)} text-white`}
            >
              {deliveryStatus!.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Delivery Progress</span>
              <span>{estimatedProgress}%</span>
            </div>
            <Progress value={estimatedProgress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Pending</span>
              <span>In Transit</span>
              <span>Delivered</span>
            </div>
          </div>

          {/* ETA Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Estimated Delivery</p>
                <p className="text-xs text-gray-600">{formatETA(deliveryStatus!.eta)}</p>
              </div>
            </div>
            {deliveryStatus!.distance && (
              <div className="flex items-center space-x-2">
                <Route className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Distance Remaining</p>
                  <p className="text-xs text-gray-600">{deliveryStatus!.distance.toFixed(1)} km</p>
                </div>
              </div>
            )}
          </div>

          {/* Agent Information */}
          {deliveryStatus!.agent && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <User className="h-10 w-10 p-2 bg-blue-100 rounded-full text-blue-600" />
                    {deliveryStatus!.agent.isOnline && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{deliveryStatus!.agent.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{getVehicleIcon(deliveryStatus!.agent.vehicleType)}</span>
                      <span>{deliveryStatus!.agent.vehicleType}</span>
                      {deliveryStatus!.agent.vehicleNumber && (
                        <span>• {deliveryStatus!.agent.vehicleNumber}</span>
                      )}
                      <div className="flex items-center">
                        <span>⭐ {deliveryStatus!.agent.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Buttons */}
                {showAgentContact && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => contactAgent('call')}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => contactAgent('message')}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                )}
              </div>

              {/* Agent Location */}
              {deliveryStatus!.agent.currentLocation && (
                <div className="text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>
                      Last seen: {formatTimeAgo(deliveryStatus!.agent.currentLocation.timestamp)}
                    </span>
                    {deliveryStatus!.agent.currentLocation.accuracy && (
                      <span>• Accuracy: {deliveryStatus!.agent.currentLocation.accuracy}m</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delivery Route */}
          {showRoute && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center">
                <Navigation className="h-4 w-4 mr-2" />
                Delivery Route
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-3 p-2 bg-blue-50 rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <p className="font-medium">Pickup Location</p>
                    <p className="text-gray-600">{deliveryStatus!.pickup.address}</p>
                    {deliveryStatus!.pickup.completedAt && (
                      <p className="text-xs text-green-600">
                        ✓ Picked up {formatTimeAgo(deliveryStatus!.pickup.completedAt)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-2 bg-green-50 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="font-medium">Delivery Address</p>
                    <p className="text-gray-600">{deliveryStatus!.customer.address}</p>
                    <p className="text-xs text-gray-600">
                      Customer: {deliveryStatus!.customer.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Timer className="h-5 w-5" />
            <span>Delivery Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deliveryStatus!.events.map((event, index) => (
              <div key={event.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{event.description}</p>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(event.timestamp)}
                    </span>
                  </div>
                  {event.agentName && (
                    <p className="text-xs text-gray-600">by {event.agentName}</p>
                  )}
                  {event.location && (
                    <p className="text-xs text-gray-500">
                      📍 {event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Additional component for embedding in other pages
export const MiniDeliveryTracker: React.FC<{
  deliveryId: string;
  onExpand?: () => void;
}> = ({ deliveryId, onExpand }) => {
  const [status, setStatus] = useState<DeliveryStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const socket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:5000', {
      auth: { token }
    });

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('delivery:track', deliveryId);
    });

    socket.on('delivery:current_status', setStatus);
    socket.on('disconnect', () => setIsConnected(false));

    return () => socket.disconnect();
  }, [deliveryId]);

  if (!status) {
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading tracking...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 cursor-pointer hover:bg-gray-50" onClick={onExpand}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
          <div>
            <p className="font-medium text-sm">{status.trackingNumber}</p>
            <p className="text-xs text-gray-600">{status.status.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600">ETA</p>
          <p className="text-sm font-medium">
            {status.eta ? new Date(status.eta).toLocaleTimeString() : 'Calculating...'}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default RealTimeDeliveryTracker;
