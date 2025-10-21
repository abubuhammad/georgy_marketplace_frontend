import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnhancedProfile } from '../enhanced/EnhancedProfile';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Truck, MapPin, Clock, DollarSign, Package, Navigation,
  Star, TrendingUp, CheckCircle, AlertTriangle, Phone,
  Mail, Calendar, Route, Fuel, Award, BarChart3, Target
} from 'lucide-react';

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  pickup: {
    address: string;
    businessName: string;
    phone: string;
  };
  items: {
    count: number;
    description: string;
    weight?: number;
  };
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  priority: 'standard' | 'express' | 'urgent';
  estimatedDelivery: string;
  distance: number; // in km
  earnings: number;
  assignedDate: string;
}

interface Vehicle {
  id: string;
  type: 'bike' | 'scooter' | 'car' | 'van';
  model: string;
  licensePlate: string;
  isActive: boolean;
  fuelType: 'gasoline' | 'electric' | 'hybrid';
  lastMaintenance: string;
}

interface DeliveryStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  activeOrders: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  rating: number;
  completionRate: number;
  avgDeliveryTime: number;
  totalDistance: number;
}

export const EnhancedDeliveryAgentProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [stats, setStats] = useState<DeliveryStats>({
    totalDeliveries: 0,
    successfulDeliveries: 0,
    activeOrders: 0,
    todayEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    rating: 0,
    completionRate: 0,
    avgDeliveryTime: 0,
    totalDistance: 0
  });

  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    loadDeliveryAgentData();
  }, []);

  const loadDeliveryAgentData = async () => {
    try {
      setLoading(true);
      
      // Load delivery orders
      const ordersResponse = await apiClient.get('/api/delivery-agent/orders');
      if (ordersResponse.data) {
        setOrders(ordersResponse.data);
      }
      
      // Load vehicle info
      const vehicleResponse = await apiClient.get('/api/delivery-agent/vehicle');
      if (vehicleResponse.data) {
        setVehicle(vehicleResponse.data);
      }
      
      // Load stats
      const statsResponse = await apiClient.get('/api/delivery-agent/stats');
      if (statsResponse.data) {
        setStats(statsResponse.data);
      }
      
      // Load online status
      const statusResponse = await apiClient.get('/api/delivery-agent/status');
      if (statusResponse.data) {
        setIsOnline(statusResponse.data.isOnline);
      }
      
    } catch (error) {
      console.error('Error loading delivery agent data:', error);
      toast.error('Failed to load delivery agent data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: DeliveryOrder['status']) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'picked_up': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_transit': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: DeliveryOrder['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'express': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'standard': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const response = await apiClient.post('/api/delivery-agent/toggle-status', {
        isOnline: !isOnline
      });
      
      if (response.success) {
        setIsOnline(!isOnline);
        toast.success(isOnline ? 'You are now offline' : 'You are now online');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const customActions = [
    {
      label: isOnline ? 'Go Offline' : 'Go Online',
      icon: isOnline ? Target : Navigation,
      onClick: toggleOnlineStatus,
      variant: isOnline ? 'destructive' as const : 'default' as const
    },
    {
      label: 'Active Orders',
      icon: Package,
      onClick: () => navigate('/delivery-agent/orders')
    },
    {
      label: 'Earnings',
      icon: DollarSign,
      onClick: () => navigate('/delivery-agent/earnings')
    }
  ];

  const roleSpecificContent = (
    <div className="space-y-6">
      {/* Online Status Banner */}
      <Card className={isOnline ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">
                You are currently {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
              <span className="text-sm text-gray-600">
                {isOnline ? 'Ready to receive orders' : 'Not receiving orders'}
              </span>
            </div>
            <Button 
              onClick={toggleOnlineStatus}
              variant={isOnline ? 'destructive' : 'default'}
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${stats.todayEarnings.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+${(stats.todayEarnings * 0.15).toFixed(2)} vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">{stats.totalDeliveries} total deliveries</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rating.toFixed(1)}</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">{stats.completionRate}% completion rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Delivery Time</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgDeliveryTime}min</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Route className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-gray-500">{stats.totalDistance}km driven</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Active Orders
            </CardTitle>
            <CardDescription>
              Orders assigned to you and ready for delivery
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/delivery-agent/orders')}>
            View All Orders
          </Button>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active orders</h3>
              <p className="text-gray-500 mb-4">
                {isOnline ? 'New orders will appear here when assigned to you.' : 'Go online to receive orders.'}
              </p>
              {!isOnline && (
                <Button onClick={toggleOnlineStatus}>
                  <Navigation className="w-4 h-4 mr-2" />
                  Go Online
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900">#{order.orderNumber}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      +${order.earnings.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">Pickup</p>
                          <p className="text-gray-600">{order.pickup.businessName}</p>
                          <p className="text-gray-500">{order.pickup.address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">Delivery</p>
                          <p className="text-gray-600">{order.customer.name}</p>
                          <p className="text-gray-500">{order.customer.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {order.items.count} items
                      </span>
                      <span className="flex items-center gap-1">
                        <Route className="w-4 h-4" />
                        {order.distance}km
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        ETA: {new Date(order.estimatedDelivery).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Assigned: {new Date(order.assignedDate).toLocaleString()}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Navigation className="w-4 h-4 mr-2" />
                        Navigate
                      </Button>
                      <Button size="sm">
                        Update Status
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {orders.length > 5 && (
                <Button variant="outline" className="w-full" onClick={() => navigate('/delivery-agent/orders')}>
                  View All Orders ({orders.length})
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      {vehicle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Vehicle Information
            </CardTitle>
            <CardDescription>
              Your registered delivery vehicle details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Vehicle Type</p>
                <p className="text-lg capitalize">{vehicle.type}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Model</p>
                <p className="text-lg">{vehicle.model}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">License Plate</p>
                <p className="text-lg font-mono">{vehicle.licensePlate}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Fuel Type</p>
                <p className="text-lg capitalize">{vehicle.fuelType}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <Badge variant={vehicle.isActive ? 'default' : 'secondary'}>
                  {vehicle.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Last Maintenance</p>
                <p className="text-lg">{new Date(vehicle.lastMaintenance).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const additionalTabTriggers = (
    <>
      <TabsTrigger value="orders">Active Orders</TabsTrigger>
      <TabsTrigger value="earnings">Earnings</TabsTrigger>
      <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
      <TabsTrigger value="analytics">Analytics</TabsTrigger>
    </>
  );

  const additionalTabsContent = (
    <>
      <TabsContent value="orders" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>Manage all your delivery orders and track progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Advanced order management interface coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="earnings" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Earnings Dashboard</CardTitle>
            <CardDescription>Track your earnings and payment history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${stats.todayEarnings.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Today</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${stats.weeklyEarnings.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">This Week</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ${stats.monthlyEarnings.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">This Month</div>
              </div>
            </div>
            <p className="text-center text-gray-500 py-8">
              Detailed earnings breakdown coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="vehicle" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Management</CardTitle>
            <CardDescription>Manage your vehicle information and maintenance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Vehicle management system coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Analytics</CardTitle>
            <CardDescription>Track your delivery performance and optimize routes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Performance analytics coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );

  return (
    <EnhancedProfile
      role="delivery_agent"
      customActions={customActions}
      roleSpecificContent={roleSpecificContent}
      additionalTabTriggers={additionalTabTriggers}
      additionalTabsContent={additionalTabsContent}
    />
  );
};