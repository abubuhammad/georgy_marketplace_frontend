import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle,
  User,
  Phone,
  MessageCircle,
  Navigation,
  RefreshCw,
  Share2,
  Star,
  AlertCircle
} from 'lucide-react';
import { Delivery, DeliveryTimeline, DeliveryDriver } from './types';
import { DeliveryService } from '@/services/deliveryService';

interface OrderTrackingProps {
  trackingNumber?: string;
  orderId?: string;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ trackingNumber: initialTrackingNumber, orderId }) => {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '');
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [timeline, setTimeline] = useState<DeliveryTimeline[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);

  useEffect(() => {
    if (trackingNumber) {
      trackDelivery();
    }
  }, [trackingNumber]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRealTimeEnabled && delivery && isActiveDelivery(delivery.status)) {
      interval = setInterval(() => {
        trackDelivery(false);
      }, 30000); // Update every 30 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRealTimeEnabled, delivery]);

  const trackDelivery = async (showLoading = true) => {
    if (!trackingNumber.trim()) return;
    
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const deliveryData = await DeliveryService.getDeliveryByTrackingNumber(trackingNumber);
      
      if (!deliveryData) {
        setError('Delivery not found. Please check your tracking number.');
        setDelivery(null);
        setTimeline([]);
        return;
      }
      
      setDelivery(deliveryData);
      
      // Load timeline
      const timelineData = await DeliveryService.getDeliveryTimeline(deliveryData.id);
      setTimeline(timelineData);
      
      // Enable real-time tracking for active deliveries
      if (isActiveDelivery(deliveryData.status)) {
        setIsRealTimeEnabled(true);
      }
    } catch (error) {
      console.error('Error tracking delivery:', error);
      setError('Failed to track delivery. Please try again.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const isActiveDelivery = (status: string) => {
    return ['picked_up', 'in_transit', 'out_for_delivery'].includes(status);
  };

  const getProgressPercentage = (status: string) => {
    const statusProgress = {
      'pending_pickup': 10,
      'picked_up': 25,
      'in_transit': 50,
      'out_for_delivery': 75,
      'delivered': 100,
      'failed_attempt': 60,
      'returned': 0,
      'cancelled': 0,
    };
    
    return statusProgress[status] || 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_pickup': return 'bg-yellow-100 text-yellow-800';
      case 'picked_up': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed_attempt': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_pickup': return <Clock className="h-5 w-5" />;
      case 'picked_up': return <Package className="h-5 w-5" />;
      case 'in_transit': return <Truck className="h-5 w-5" />;
      case 'out_for_delivery': return <Navigation className="h-5 w-5" />;
      case 'delivered': return <CheckCircle className="h-5 w-5" />;
      case 'failed_attempt': return <AlertCircle className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstimatedArrival = () => {
    if (!delivery) return 'N/A';
    
    const eta = new Date(delivery.estimatedDeliveryTime);
    const now = new Date();
    
    if (delivery.status === 'delivered') {
      return 'Delivered';
    }
    
    if (eta < now) {
      return 'Delayed';
    }
    
    const diffInMinutes = Math.floor((eta.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  const handleContactDriver = () => {
    if (delivery?.driver?.user?.phone) {
      window.open(`tel:${delivery.driver.user.phone}`);
    }
  };

  const handleShareTracking = async () => {
    if (navigator.share && trackingNumber) {
      try {
        await navigator.share({
          title: 'Track My Delivery',
          text: `Track delivery #${trackingNumber}`,
          url: `${window.location.origin}/track/${trackingNumber}`,
        });
      } catch (error) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(`${window.location.origin}/track/${trackingNumber}`);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Track Your Delivery</h1>
        <p className="text-gray-600">
          Enter your tracking number to get real-time updates on your delivery
        </p>
      </div>

      {/* Tracking Input */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <Input
              placeholder="Enter tracking number (e.g., TRK12345678)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
              className="flex-1"
            />
            <Button onClick={() => trackDelivery()} disabled={loading || !trackingNumber.trim()}>
              {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
              Track
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {delivery && (
        <>
          {/* Delivery Status Overview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    {getStatusIcon(delivery.status)}
                    <span>Delivery #{delivery.trackingNumber}</span>
                  </CardTitle>
                  <CardDescription>
                    Order #{delivery.order?.orderNumber} • {delivery.deliveryType} delivery
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  {isRealTimeEnabled && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Live Tracking
                    </Badge>
                  )}
                  <Badge className={getStatusColor(delivery.status)}>
                    {delivery.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span>Progress</span>
                    <span>{getProgressPercentage(delivery.status)}%</span>
                  </div>
                  <Progress value={getProgressPercentage(delivery.status)} className="h-2" />
                </div>

                {/* Key Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium">Estimated Arrival</p>
                    <p className="text-lg font-bold">{getEstimatedArrival()}</p>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm font-medium">Current Location</p>
                    <p className="text-lg font-bold">
                      {delivery.driver?.currentLocation ? 'On Route' : 'Processing'}
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Package className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm font-medium">Package Weight</p>
                    <p className="text-lg font-bold">{delivery.packageInfo.weight} kg</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Addresses */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Locations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Pickup Address</h4>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm">{delivery.pickupLocation.address}</p>
                      <p className="text-sm text-gray-600">
                        {delivery.pickupLocation.city}, {delivery.pickupLocation.state}
                      </p>
                      <p className="text-xs text-gray-500">
                        Contact: {delivery.pickupLocation.contactPerson}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm">{delivery.deliveryLocation.address}</p>
                      <p className="text-sm text-gray-600">
                        {delivery.deliveryLocation.city}, {delivery.deliveryLocation.state}
                      </p>
                      <p className="text-xs text-gray-500">
                        Contact: {delivery.deliveryLocation.contactPerson}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver Information */}
            {delivery.driver && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Delivery Partner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {delivery.driver.user?.avatar ? (
                        <img 
                          src={delivery.driver.user.avatar} 
                          alt="Driver"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {delivery.driver.user?.firstName} {delivery.driver.user?.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {delivery.driver.vehicleType.charAt(0).toUpperCase() + delivery.driver.vehicleType.slice(1)} Driver
                      </p>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm">{delivery.driver.rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-600 ml-1">
                          ({delivery.driver.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleContactDriver}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Call Driver
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </div>
                  
                  {delivery.driver.vehicleInfo && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">Vehicle Information</p>
                      <p className="text-sm text-gray-600">
                        {delivery.driver.vehicleInfo.color} {delivery.driver.vehicleInfo.make} {delivery.driver.vehicleInfo.model}
                      </p>
                      <p className="text-sm text-gray-600">
                        Plate: {delivery.driver.vehicleInfo.plateNumber}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Delivery Timeline */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Delivery Timeline</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => trackDelivery(false)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareTracking}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.length > 0 ? (
                  timeline.map((event, index) => (
                    <div key={event.id} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${
                          event.status === delivery.status ? 'bg-blue-600' : 'bg-gray-300'
                        }`} />
                        {index < timeline.length - 1 && (
                          <div className="w-0.5 h-6 bg-gray-200 ml-1 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{event.description}</p>
                          <time className="text-xs text-gray-500">
                            {formatTime(event.timestamp)}
                          </time>
                        </div>
                        {event.driverNotes && (
                          <p className="text-sm text-gray-600 mt-1">{event.driverNotes}</p>
                        )}
                        {event.location && (
                          <p className="text-xs text-gray-500 mt-1">
                            Location: {event.location.latitude.toFixed(4)}, {event.location.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No timeline updates available yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          {delivery.specialInstructions && (
            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">{delivery.specialInstructions}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Map (Placeholder) */}
          {isActiveDelivery(delivery.status) && (
            <Card>
              <CardHeader>
                <CardTitle>Live Tracking</CardTitle>
                <CardDescription>
                  Real-time location of your delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">Live tracking map would be here</p>
                    <p className="text-sm text-gray-500">
                      Shows driver location and estimated route
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
