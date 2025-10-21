import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedDashboardHeader } from '@/components/enhanced/EnhancedDashboardHeader';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Eye,
  MessageCircle,
  Star,
  AlertCircle,
  Plus,
  BarChart3,
  Settings
} from 'lucide-react';
import { sellerService } from '@/services/sellerService';
import orderService from '@/services/orderService';

const EnhancedSellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const [dashboardData, setDashboardData] = useState({
    totalListings: 0,
    activeListings: 0,
    inactiveListings: 0,
    totalViews: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    newMessages: 0
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any | null>(null);

  // Refresh on location change (browser back/forward or direct navigation)
  useEffect(() => {
    loadSellerData();
  }, [location.key]);

  useEffect(() => {
    loadSellerData();
  }, []);

  const loadSellerData = async () => {
    if (!user?.firstName && !user?.id) return; // basic guard
    try {
      const sellerId = (user as any)?.id;
      if (!sellerId) return;
      const [analytics, alerts, ordersRes, perf, inventory] = await Promise.all([
        sellerService.getSellerAnalytics(sellerId, '30d'),
        sellerService.getStockAlerts(sellerId),
        orderService.getUserOrders(sellerId),
        sellerService.getPerformanceMetrics(sellerId, '30d'),
        sellerService.getInventory(sellerId)
      ]);

      const invTotal = inventory?.length || 0;
      const invActive = inventory?.filter((i: any) => (i.availableQuantity ?? i.quantity) > 0).length || 0;
      const invLowStock = inventory?.filter((i: any) => i.quantity === 0 || i.quantity <= i.reorderLevel).length || 0;

      setDashboardData({
        totalListings: analytics.totalProducts || invTotal,
        activeListings: analytics.activeProducts || invActive,
        inactiveListings: Math.max((analytics.totalProducts || invTotal) - (analytics.activeProducts || invActive), 0),
        totalViews: (analytics.topSellingProducts || []).reduce((sum, p) => sum + (p.viewCount || 0), 0),
        totalOrders: analytics.totalOrders,
        totalRevenue: analytics.totalRevenue,
        averageRating: analytics.customerRating,
        pendingOrders: analytics.pendingOrders,
        lowStockItems: (analytics.inventoryMetrics?.lowStockProducts || 0) + (analytics.inventoryMetrics?.outOfStockProducts || 0) || invLowStock,
        newMessages: 0
      });

      const topFromAnalytics = (analytics.topSellingProducts || []).map(p => ({
        name: p.productName,
        sales: p.totalSold,
        revenue: p.revenue,
        views: p.viewCount
      }));

      const topFromInventory = (inventory || [])
        .slice(0, 5)
        .map((it: any) => ({
          name: it.product?.title || 'Product',
          sales: 0,
          revenue: (it.product?.price || 0) * (it.quantity || 0),
          views: 0
        }));

      setTopProducts(topFromAnalytics.length > 0 ? topFromAnalytics : topFromInventory);

      const mappedOrders = (ordersRes?.data || [])
        .slice(0, 3)
        .map((o: any) => ({
          id: o.id,
          customer: o.userId || '—',
          product: o.items?.[0]?.product?.title || `${o.items?.length || 0} items`,
          amount: o.totalAmount,
          status: o.status,
          date: new Date(o.createdAt).toLocaleDateString()
        }));
      setRecentOrders(mappedOrders);

      setPerformance(perf || null);
    } catch (err) {
      console.error('Failed to load seller dashboard data', err);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Seller Dashboard Header */}
      <EnhancedDashboardHeader
        title="Seller Dashboard"
        subtitle={`Welcome back, ${user?.firstName}! Manage your store and grow your business.`}
        user={user}
        actions={[
          {
            label: 'Add Product',
            icon: Plus,
            onClick: () => navigate('/seller/products/add'),
            variant: 'default'
          },
          {
            label: 'Analytics',
            icon: BarChart3,
            onClick: () => navigate('/seller/analytics')
          },
          {
            label: 'Settings',
            icon: Settings,
            onClick: () => navigate('/seller/profile')
          }
        ]}
        notifications={dashboardData.pendingOrders + dashboardData.lowStockItems}
        messages={dashboardData.newMessages}
        stats={[
          {
            label: 'Revenue',
            value: `₦${(dashboardData.totalRevenue / 1000000).toFixed(1)}M`,
            trend: 'up'
          },
          {
            label: 'Orders',
            value: dashboardData.totalOrders,
            trend: 'up'
          },
          {
            label: 'Products',
            value: dashboardData.activeListings,
            trend: 'neutral'
          }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">₦{dashboardData.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+12% from last month</p>
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
                  <p className="text-2xl font-bold">{dashboardData.totalOrders}</p>
                  <p className="text-xs text-blue-600">+8% from last month</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold">{dashboardData.activeListings}</p>
                  <p className="text-xs text-gray-500">of {dashboardData.totalListings} total</p>
                </div>
                <Package className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold">{dashboardData.averageRating}</p>
                  <p className="text-xs text-yellow-600">★★★★★</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(dashboardData.pendingOrders > 0 || dashboardData.lowStockItems > 0 || dashboardData.newMessages > 0) && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardData.pendingOrders > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-orange-800">
                      {dashboardData.pendingOrders} pending orders need attention
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {dashboardData.lowStockItems > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-red-800">
                      {dashboardData.lowStockItems} items are low in stock
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {dashboardData.newMessages > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-blue-800">
                      {dashboardData.newMessages} new customer messages
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Sales Analytics</TabsTrigger>
            <TabsTrigger value="orders">Order Management</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest customer orders requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.length === 0 ? (
                      <div className="text-center text-gray-500 py-6">No recent orders</div>
                    ) : (
                      recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{order.product}</p>
                            <p className="text-sm text-gray-500">{order.customer} • {order.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₦{order.amount.toLocaleString()}</p>
                            <Badge variant={
                              order.status === 'pending' ? 'destructive' :
                              order.status === 'processing' ? 'secondary' : 'default'
                            }>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Products</CardTitle>
                  <CardDescription>Your best selling items this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.sales} sales • {product.views} views</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₦{product.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Sales Analytics</CardTitle>
                  <CardDescription>Revenue and sales trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Sales chart would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <span className="font-semibold">{(Number.isFinite((dashboardData.totalOrders && dashboardData.totalViews) ? (dashboardData.totalOrders / Math.max(dashboardData.totalViews, 1) * 100) : 0) ? (dashboardData.totalOrders / Math.max(dashboardData.totalViews, 1) * 100).toFixed(1) : '0.0')}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Order Value</span>
                      <span className="font-semibold">₦{Math.round((dashboardData.totalOrders ? (dashboardData.totalRevenue / Math.max(dashboardData.totalOrders, 1)) : 0)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cancelled Rate</span>
                      <span className="font-semibold">—</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Customer Rating</span>
                      <span className="font-semibold">{dashboardData.averageRating}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Manage all your customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No orders found</p>
                  ) : (
                    recentOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">{order.product}</h3>
                            <p className="text-sm text-gray-500">Order #{order.id} • Customer: {order.customer}</p>
                          </div>
                          <Badge variant={
                            order.status === 'pending' ? 'destructive' :
                            order.status === 'processing' ? 'secondary' : 'default'
                          }>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">₦{order.amount.toLocaleString()}</span>
                          <div className="space-x-2">
                            <Button variant="outline" size="sm" onClick={() => console.log('View order details:', order.id)}>View Details</Button>
                            <Button size="sm" onClick={() => console.log('Update order status:', order.id)}>Update Status</Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Tracking</CardTitle>
                <CardDescription>Monitor your product stock levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Inventory management interface would be displayed here</p>
                  <Button className="mt-4">Manage Inventory</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Track your seller performance and customer satisfaction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Customer Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Customer Value</span>
                        <span className="font-medium">₦{(performance?.customers?.averageCustomerValue || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Retention Rate</span>
                        <span className="font-medium">{(performance?.customers?.customerRetentionRate || 0).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">New Customers</span>
                        <span className="font-medium">{performance?.customers?.newCustomers || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Operational Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Fulfillment Time</span>
                        <span className="font-medium">{performance?.operations?.orderFulfillmentTime || 0} hrs avg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Shipping Accuracy</span>
                        <span className="font-medium">{(performance?.operations?.shippingAccuracy || 0).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Return Rate</span>
                        <span className="font-medium">{(performance?.operations?.returnRate || 0).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedSellerDashboard;
