import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Navigation,
  Phone,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  XCircle,
  DollarSign,
  Calendar,
  Users,
  Route,
  Camera,
  FileText
} from 'lucide-react';
import { DeliveryDriver, Delivery, DeliveryAnalytics, DriverAnalytics } from './types';
import { DeliveryService } from '@/services/deliveryService';
import { useAuthContext } from '@/contexts/AuthContext';

interface DeliveryDashboardProps {
  driver: DeliveryDriver;
}

export const DeliveryDashboard: React.FC<DeliveryDashboardProps> = ({ driver }) => {
  const { user } = useAuthContext();
  const [analytics, setAnalytics] = useState<DriverAnalytics>({
    totalDeliveries: 0,
    successfulDeliveries: 0,
    averageDeliveryTime: 0,
    onTimeRate: 0,
    customerRating: 0,
    totalEarnings: 0,
    hoursWorked: 0,
    fuelConsumption: 0,
    deliverysByDay: [],
    earningsByWeek: [],
  });
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<Delivery[]>([]);
  const [isOnline, setIsOnline] = useState(driver.isOnline);
  const [isAvailable, setIsAvailable] = useState(driver.isAvailable);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  useEffect(() => {
    loadDashboardData();
    // Set up real-time location tracking if online
    if (isOnline) {
      startLocationTracking();
    }
  }, [driver.id, isOnline]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load driver analytics
      const analyticsData = await DeliveryService.getDriverAnalytics(driver.id);
      setAnalytics(analyticsData);

      // Load assigned deliveries
      const deliveriesData = await DeliveryService.getDeliveries({ driverId: driver.id });
      setDeliveries(deliveriesData);

      // Filter active deliveries
      const active = deliveriesData.filter(d => 
        ['picked_up', 'in_transit', 'out_for_delivery'].includes(d.status)
      );
      setActiveDeliveries(active);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          };
          
          try {
            await DeliveryService.updateDriverLocation(driver.id, location);
          } catch (error) {
            console.error('Error updating location:', error);
          }
        },
        (error) => {
          console.error('Location tracking error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const newOnlineStatus = !isOnline;
      const newAvailableStatus = newOnlineStatus ? isAvailable : false;
      
      await DeliveryService.updateDriverStatus(driver.id, newOnlineStatus, newAvailableStatus);
      setIsOnline(newOnlineStatus);
      setIsAvailable(newAvailableStatus);
      
      if (newOnlineStatus) {
        startLocationTracking();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const toggleAvailableStatus = async () => {
    if (!isOnline) return;
    
    try {
      const newAvailableStatus = !isAvailable;
      await DeliveryService.updateDriverStatus(driver.id, isOnline, newAvailableStatus);
      setIsAvailable(newAvailableStatus);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const updateDeliveryStatus = async (deliveryId: string, status: string, notes?: string) => {
    try {
      await DeliveryService.updateDeliveryStatus(deliveryId, status, notes);
      await loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const getDeliveryTypeIcon = (type: string) => {
    switch (type) {
      case 'express': return <TrendingUp className="h-4 w-4" />;
      case 'same_day': return <Clock className="h-4 w-4" />;
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Delivery Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {driver.user?.firstName} {driver.user?.lastName}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isOnline ? "default" : "secondary"}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          {isOnline && (
            <Badge variant={isAvailable ? "default" : "secondary"}>
              {isAvailable ? 'Available' : 'Busy'}
            </Badge>
          )}
          <Button
            variant={isOnline ? "outline" : "default"}
            onClick={toggleOnlineStatus}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </Button>
          {isOnline && (
            <Button
              variant={isAvailable ? "outline" : "default"}
              onClick={toggleAvailableStatus}
            >
              {isAvailable ? 'Set Busy' : 'Set Available'}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDeliveries.length}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalDeliveries} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.onTimeRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              On-time deliveries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driver.rating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {driver.reviewCount} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Deliveries</TabsTrigger>
          <TabsTrigger value="history">Delivery History</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Active Deliveries</h2>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Route className="mr-2 h-4 w-4" />
                Optimize Route
              </Button>
              <Button variant="outline">
                <Navigation className="mr-2 h-4 w-4" />
                Navigate
              </Button>
            </div>
          </div>
          
          {activeDeliveries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No active deliveries</h3>
                <p className="text-gray-600">
                  {isAvailable ? 'Waiting for new delivery assignments...' : 'Set yourself as available to receive deliveries'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeDeliveries.map((delivery) => (
                <Card key={delivery.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center">
                            {getDeliveryTypeIcon(delivery.deliveryType)}
                            <span className="ml-1 font-semibold">#{delivery.trackingNumber}</span>
                          </div>
                          <Badge className={getStatusColor(delivery.status)}>
                            {delivery.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {delivery.deliveryType}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Pickup</p>
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm">{delivery.pickupLocation.address}</p>
                                <p className="text-xs text-gray-600">
                                  {delivery.pickupLocation.contactPerson} • {delivery.pickupLocation.contactPhone}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-600">Delivery</p>
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm">{delivery.deliveryLocation.address}</p>
                                <p className="text-xs text-gray-600">
                                  {delivery.deliveryLocation.contactPerson} • {delivery.deliveryLocation.contactPhone}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>ETA: {formatTime(delivery.estimatedDeliveryTime)}</span>
                          </div>
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-1" />
                            <span>{delivery.packageInfo.weight}kg</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span>{formatCurrency(delivery.totalFee)}</span>
                          </div>
                        </div>

                        {delivery.specialInstructions && (
                          <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm font-medium text-yellow-800">Special Instructions:</p>
                            <p className="text-sm text-yellow-700">{delivery.specialInstructions}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        {delivery.status === 'pending_pickup' && (
                          <Button
                            size="sm"
                            onClick={() => updateDeliveryStatus(delivery.id, 'picked_up')}
                          >
                            Mark Picked Up
                          </Button>
                        )}
                        
                        {delivery.status === 'picked_up' && (
                          <Button
                            size="sm"
                            onClick={() => updateDeliveryStatus(delivery.id, 'in_transit')}
                          >
                            Start Transit
                          </Button>
                        )}
                        
                        {delivery.status === 'in_transit' && (
                          <Button
                            size="sm"
                            onClick={() => updateDeliveryStatus(delivery.id, 'out_for_delivery')}
                          >
                            Out for Delivery
                          </Button>
                        )}
                        
                        {delivery.status === 'out_for_delivery' && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedDelivery(delivery)}
                          >
                            Mark Delivered
                          </Button>
                        )}
                        
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        
                        <Button variant="outline" size="sm">
                          <Navigation className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <h2 className="text-xl font-semibold">Delivery History</h2>
          
          <div className="flex space-x-4 mb-4">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed_attempt">Failed</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
            
            <Input type="date" className="w-[180px]" />
            
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <Card key={delivery.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">#{delivery.trackingNumber}</p>
                        <p className="text-sm text-gray-600">{delivery.deliveryLocation.address}</p>
                      </div>
                      <Badge className={getStatusColor(delivery.status)}>
                        {delivery.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(delivery.totalFee)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(delivery.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Navigation & Route</h2>
            <Button>
              <Route className="mr-2 h-4 w-4" />
              Optimize Route
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">Interactive map would be here</p>
                  <p className="text-sm text-gray-500">
                    Shows current location, delivery points, and optimized route
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <h2 className="text-xl font-semibold">Earnings Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(1250)}</div>
                <p className="text-sm text-gray-600">4 deliveries</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.totalEarnings)}</div>
                <p className="text-sm text-gray-600">{analytics.totalDeliveries} deliveries</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(45000)}</div>
                <p className="text-sm text-gray-600">156 deliveries</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Weekly Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.earningsByWeek.map((week, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{week.week}</span>
                    <span className="font-medium">{formatCurrency(week.earnings)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delivery Completion Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Complete Delivery</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please confirm delivery of #{selectedDelivery.trackingNumber}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Recipient Name</label>
                <Input placeholder="Enter recipient name" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Recipient Relation</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Self</SelectItem>
                    <SelectItem value="family">Family Member</SelectItem>
                    <SelectItem value="neighbor">Neighbor</SelectItem>
                    <SelectItem value="security">Security Guard</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <Input placeholder="Delivery notes..." />
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
                <Button variant="outline" className="flex-1">
                  <FileText className="mr-2 h-4 w-4" />
                  Signature
                </Button>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedDelivery(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  updateDeliveryStatus(selectedDelivery.id, 'delivered');
                  setSelectedDelivery(null);
                }}
              >
                Complete Delivery
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
