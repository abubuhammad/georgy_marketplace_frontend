import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Bell,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw
} from 'lucide-react';
import { SellerAnalytics, ProductSalesData, MonthlyRevenue, StockAlert } from './types';
import { sellerService } from '@/services/sellerService';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useRealTimeData } from '@/hooks/useRealTimeData';

const SellerDashboard: React.FC = () => {
  const { user } = useAuthContext();
  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id, selectedPeriod]);

  // Set up real-time data updates
  const { refresh } = useRealTimeData(
    loadDashboardData,
    {
      enabled: !!user?.id && !loading,
      interval: 60000, // Update every minute
      onUpdate: () => setLastUpdated(new Date())
    }
  );

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, alertsData] = await Promise.all([
        sellerService.getSellerAnalytics(user!.id, selectedPeriod),
        sellerService.getStockAlerts(user!.id)
      ]);
      
      setAnalytics(analyticsData);
      setStockAlerts(alertsData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard loading error:', error);
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

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'low':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'out_of_stock':
        return <Package className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p>Failed to load dashboard data</p>
          <Button onClick={loadDashboardData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
                {lastUpdated && (
                  <p className="text-sm text-gray-500">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refresh()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <div className="flex gap-2">
              {['7d', '30d', '90d', '1y'].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period as any)}
                >
                  {period === '7d' ? '7 Days' : 
                   period === '30d' ? '30 Days' : 
                   period === '90d' ? '90 Days' : '1 Year'}
                </Button>
              ))}
                </div>
                </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getGrowthIcon(analytics.revenueGrowth)}
                    <span className={`text-sm ${getGrowthColor(analytics.revenueGrowth)}`}>
                      {formatPercentage(analytics.revenueGrowth)}
                    </span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">{analytics.totalOrders.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getGrowthIcon(analytics.orderGrowth)}
                    <span className={`text-sm ${getGrowthColor(analytics.orderGrowth)}`}>
                      {formatPercentage(analytics.orderGrowth)}
                    </span>
                  </div>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Products</p>
                  <p className="text-2xl font-bold">{analytics.activeProducts}</p>
                  <p className="text-sm text-gray-500">of {analytics.totalProducts} total</p>
                </div>
                <Package className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer Rating</p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold">{analytics.customerRating.toFixed(1)}</p>
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  </div>
                  <p className="text-sm text-gray-500">{analytics.totalReviews} reviews</p>
                </div>
                <Users className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Revenue Overview
                  </CardTitle>
                  <CardDescription>Monthly revenue for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.revenueByMonth.map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                          <span className="font-medium">{month.month}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(month.revenue)}</p>
                          <p className="text-sm text-gray-500">{month.orders} orders</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Order Status
                  </CardTitle>
                  <CardDescription>Distribution of order statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Completed
                      </span>
                      <div className="text-right">
                        <span className="font-semibold">{analytics.completedOrders}</span>
                        <Progress value={70} className="w-20 mt-1" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        Pending
                      </span>
                      <div className="text-right">
                        <span className="font-semibold">{analytics.pendingOrders}</span>
                        <Progress value={20} className="w-20 mt-1" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Cancelled
                      </span>
                      <div className="text-right">
                        <span className="font-semibold">{analytics.cancelledOrders}</span>
                        <Progress value={10} className="w-20 mt-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Selling Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Your best performing products this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topSellingProducts.slice(0, 5).map((product, index) => (
                    <div key={product.productId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{product.productName}</h4>
                          <p className="text-sm text-gray-600">{product.totalSold} sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{product.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Manage your latest orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order management component would go here */}
                  <p className="text-center text-gray-500 py-8">
                    Order management component will be implemented next
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>Manage your product inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Product management component would go here */}
                  <p className="text-center text-gray-500 py-8">
                    Product management component will be implemented next
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customer Insights</CardTitle>
                <CardDescription>View customer analytics and communication</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analytics.customerMetrics.totalCustomers}</p>
                    <p className="text-sm text-gray-600">Total Customers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analytics.customerMetrics.newCustomers}</p>
                    <p className="text-sm text-gray-600">New This Period</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analytics.customerMetrics.customerRetentionRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Retention Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Stock Alerts
                </CardTitle>
                <CardDescription>Monitor inventory levels and stock alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stockAlerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-gray-500">No stock alerts at the moment</p>
                    </div>
                  ) : (
                    stockAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getAlertIcon(alert.severity)}
                          <div>
                            <h4 className="font-semibold">{alert.productName}</h4>
                            <p className="text-sm text-gray-600">
                              Current stock: {alert.currentStock} (Reorder at: {alert.reorderLevel})
                            </p>
                          </div>
                        </div>
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'}>
                          {alert.severity.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerDashboard;
