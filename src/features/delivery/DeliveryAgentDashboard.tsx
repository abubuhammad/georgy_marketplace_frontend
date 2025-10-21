import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Navigation, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Phone,
  Star,
  Route,
  Timer,
  Target,
  Zap,
  Calendar,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DashboardStats {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  totalEarnings: number;
  todayDeliveries: number;
  rating: number;
  completionRate: number;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  recipientName: string;
  recipientPhone: string;
  estimatedDelivery: string;
  deliveryFee: number;
  packageDetails: any;
}

interface AgentInfo {
  isVerified: boolean;
  isAvailable: boolean;
  vehicleType: string;
  currentLocation: any;
}

const DeliveryAgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/delivery-agent/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setStats(data.stats);
      setShipments(data.recentShipments);
      setAgentInfo(data.agentInfo);
      setWeeklyStats(data.weeklyStats);
      setIsAvailable(data.agentInfo?.isAvailable || false);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityToggle = async (available: boolean) => {
    try {
      const response = await fetch('/api/delivery-agent/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ isAvailable: available }),
      });

      if (!response.ok) {
        throw new Error('Failed to update availability');
      }

      setIsAvailable(available);
      toast.success(`Availability ${available ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const updateShipmentStatus = async (shipmentId: string, status: string) => {
    try {
      const response = await fetch(`/api/delivery-agent/shipments/${shipmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update shipment status');
      }

      await fetchDashboardData();
      toast.success('Shipment status updated');
    } catch (error) {
      toast.error('Failed to update shipment status');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      assigned: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-yellow-100 text-yellow-800',
      in_transit: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getNextAction = (status: string) => {
    const actions = {
      assigned: 'picked_up',
      picked_up: 'in_transit',
      in_transit: 'delivered',
    };
    return actions[status as keyof typeof actions];
  };

  const getActionLabel = (status: string) => {
    const labels = {
      assigned: 'Mark as Picked Up',
      picked_up: 'Mark as In Transit',
      in_transit: 'Mark as Delivered',
    };
    return labels[status as keyof typeof labels];
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Availability Toggle */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Delivery Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your deliveries and track performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={isAvailable}
              onCheckedChange={handleAvailabilityToggle}
            />
            <span className={cn(
              "text-sm font-medium",
              isAvailable ? "text-green-600" : "text-gray-600"
            )}>
              {isAvailable ? "Available" : "Offline"}
            </span>
          </div>
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDeliveries || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                +{stats?.todayDeliveries || 0} today
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completionRate?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.completedDeliveries || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalEarnings || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {stats?.rating?.toFixed(1) || 0}
              <Star className="w-5 h-5 text-yellow-500 ml-1" fill="currentColor" />
            </div>
            <p className="text-xs text-muted-foreground">
              Customer rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Weekly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'earnings' ? formatCurrency(Number(value)) : value,
                    name === 'earnings' ? 'Earnings' : 'Deliveries'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="deliveries" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Availability</span>
              <Badge className={cn(
                isAvailable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              )}>
                {isAvailable ? "Online" : "Offline"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Vehicle</span>
              <span className="text-sm font-medium">{agentInfo?.vehicleType || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Verified</span>
              <Badge className={cn(
                agentInfo?.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              )}>
                {agentInfo?.isVerified ? "Verified" : "Pending"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-sm font-medium">{stats?.pendingDeliveries || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Shipments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Active Shipments
          </CardTitle>
          <Button variant="outline" size="sm">
            <Route className="w-4 h-4 mr-2" />
            Optimize Route
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shipments.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active shipments</p>
                <p className="text-sm text-gray-400">New shipments will appear here</p>
              </div>
            ) : (
              shipments.map((shipment) => (
                <div key={shipment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Package className="w-12 h-12 text-gray-400" />
                      <div className="absolute -top-1 -right-1">
                        <Badge className={cn("text-xs", getStatusColor(shipment.status))}>
                          {shipment.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">#{shipment.trackingNumber}</h4>
                      <p className="text-sm text-gray-600">{shipment.recipientName}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="truncate max-w-[200px]">{shipment.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Phone className="w-3 h-3 mr-1" />
                        <span>{shipment.recipientPhone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(shipment.deliveryFee)}</p>
                    <p className="text-xs text-gray-500">
                      Due: {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                    </p>
                    {getNextAction(shipment.status) && (
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => updateShipmentStatus(shipment.id, getNextAction(shipment.status)!)}
                      >
                        {getActionLabel(shipment.status)}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button className="h-16 bg-white border-2 border-red-200 text-red-600 hover:bg-red-50">
          <div className="text-center">
            <MapPin className="w-6 h-6 mx-auto mb-1" />
            <span className="text-sm">Update Location</span>
          </div>
        </Button>
        <Button className="h-16 bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50">
          <div className="text-center">
            <Route className="w-6 h-6 mx-auto mb-1" />
            <span className="text-sm">View Route</span>
          </div>
        </Button>
        <Button className="h-16 bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50">
          <div className="text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-1" />
            <span className="text-sm">Earnings</span>
          </div>
        </Button>
        <Button className="h-16 bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50">
          <div className="text-center">
            <Activity className="w-6 h-6 mx-auto mb-1" />
            <span className="text-sm">Performance</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default DeliveryAgentDashboard;