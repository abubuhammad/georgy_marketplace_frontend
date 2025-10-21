import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { 
  Home, 
  Eye, 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp, 
  MapPin, 
  Plus, 
  Filter,
  Search,
  MoreVertical,
  RefreshCw,
  Building,
  Bed,
  Bath,
  Square,
  Phone,
  Mail,
  Camera,
  Star,
  Target,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DashboardStats {
  totalProperties: number;
  availableProperties: number;
  soldProperties: number;
  rentedProperties: number;
  totalViewings: number;
  pendingViewings: number;
  totalPropertyValue: number;
  avgPropertyValue: number;
}

interface Property {
  id: string;
  title: string;
  type: string;
  propertyType: string;
  price: number;
  location: string;
  images: string;
  status: string;
  createdAt: string;
  _count: {
    viewings: number;
  };
}

interface Viewing {
  id: string;
  scheduledAt: string;
  status: string;
  viewerId: string;
  property: {
    title: string;
    location: string;
    images: string;
  };
}

const RealtorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [upcomingViewings, setUpcomingViewings] = useState<Viewing[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/realtor/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setStats(data.stats);
      setRecentProperties(data.recentProperties);
      setUpcomingViewings(data.upcomingViewings);
      setMonthlyStats(data.monthlyStats);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      sold: 'bg-blue-100 text-blue-800',
      rented: 'bg-purple-100 text-purple-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getViewingStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Real Estate Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your properties and track performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProperties || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats?.availableProperties || 0} available</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Viewings</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalViewings || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">{stats?.pendingViewings || 0} upcoming</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalPropertyValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(stats?.avgPropertyValue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Performance</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.soldProperties || 0}</div>
            <p className="text-xs text-muted-foreground">
              Properties sold this month
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
              <TrendingUp className="w-5 h-5 mr-2" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'avgPrice' ? formatCurrency(Number(value)) : value,
                    name === 'properties' ? 'Properties' : 
                    name === 'sold' ? 'Sold' :
                    name === 'rented' ? 'Rented' : 'Avg Price'
                  ]}
                />
                <Bar dataKey="properties" fill="#dc2626" name="properties" />
                <Bar dataKey="sold" fill="#16a34a" name="sold" />
                <Bar dataKey="rented" fill="#7c3aed" name="rented" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Property Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Available</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{stats?.availableProperties || 0}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sold</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{stats?.soldProperties || 0}</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rented</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{stats?.rentedProperties || 0}</span>
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Properties and Upcoming Viewings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Home className="w-5 h-5 mr-2" />
              Recent Properties
            </CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProperties.map((property) => (
                <div key={property.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="relative">
                    <img
                      src={JSON.parse(property.images)[0] || '/placeholder.jpg'}
                      alt={property.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <Badge className={cn("absolute -top-1 -right-1 text-xs", getStatusColor(property.status))}>
                      {property.status}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{property.title}</h4>
                    <p className="text-sm text-gray-600">{formatCurrency(property.price)}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{property.location}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Eye className="w-3 h-3 mr-1" />
                      <span>{property._count.viewings} viewings</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Viewings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Upcoming Viewings
            </CardTitle>
            <Button variant="outline" size="sm">
              Schedule New
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingViewings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming viewings</p>
                  <p className="text-sm text-gray-400">Schedule viewings with clients</p>
                </div>
              ) : (
                upcomingViewings.map((viewing) => (
                  <div key={viewing.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="relative">
                      <img
                        src={JSON.parse(viewing.property.images)[0] || '/placeholder.jpg'}
                        alt={viewing.property.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{viewing.property.title}</h4>
                      <p className="text-sm text-gray-600">{viewing.property.location}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{new Date(viewing.scheduledAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={cn("text-xs", getViewingStatusColor(viewing.status))}>
                        {viewing.status}
                      </Badge>
                      <div className="mt-2">
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button className="h-16 bg-white border-2 border-red-200 text-red-600 hover:bg-red-50">
          <div className="text-center">
            <Plus className="w-6 h-6 mx-auto mb-1" />
            <span className="text-sm">Add Property</span>
          </div>
        </Button>
        <Button className="h-16 bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50">
          <div className="text-center">
            <Calendar className="w-6 h-6 mx-auto mb-1" />
            <span className="text-sm">Schedule Viewing</span>
          </div>
        </Button>
        <Button className="h-16 bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50">
          <div className="text-center">
            <Users className="w-6 h-6 mx-auto mb-1" />
            <span className="text-sm">Manage Clients</span>
          </div>
        </Button>
        <Button className="h-16 bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50">
          <div className="text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-1" />
            <span className="text-sm">Market Insights</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default RealtorDashboard;