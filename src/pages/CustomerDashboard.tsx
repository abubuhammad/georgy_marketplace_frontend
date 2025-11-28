import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ToastContainer } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedDashboardHeader } from '@/components/enhanced/EnhancedDashboardHeader';
import { 
  ShoppingCart, 
  Heart, 
  Eye, 
  Star, 
  Package, 
  TrendingUp,
  MessageCircle,
  Bell,
  Settings,
  User,
  Plus,
  BarChart3,
  Loader2
} from 'lucide-react';
import { 
  fetchCustomerDashboard,
  fetchActivityMetrics,
  type CustomerDashboard as CustomerDashboardType
} from '@/services/customerDashboardService';

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const { toast, toasts, removeToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<CustomerDashboardType | null>(null);
  const [activityMetrics, setActivityMetrics] = useState({
    itemsViewedThisWeek: 0,
    searchesPerformed: 0,
    messagesSent: 0,
    reviewsWritten: 0
  });
  const [error, setError] = useState<string | null>(null);

  // Refresh on location change (browser back/forward or direct navigation)
  useEffect(() => {
    loadDashboardData();
  }, [location.key]);

  useEffect(() => {
    // Load customer data
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard data and activity metrics in parallel
      const [dashData, activityData] = await Promise.all([
        fetchCustomerDashboard(),
        fetchActivityMetrics()
      ]);

      setDashboardData(dashData);
      setActivityMetrics(activityData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      toast.error('Failed to load dashboard data');
      
      // Set fallback data to prevent UI breaking
      setDashboardData({
        totalOrders: 0,
        favoriteItems: 0,
        profileViews: 0,
        reviewsGiven: 0,
        recentOrders: [],
        activityMetrics: {
          itemsViewedThisWeek: 0,
          searchesPerformed: 0,
          messagesSent: 0,
          reviewsWritten: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Dashboard Header */}
      <EnhancedDashboardHeader
        title="Customer Dashboard"
        subtitle={`Welcome back, ${user?.firstName}!`}
        user={user}
        actions={[
          {
            label: 'View Orders',
            icon: Package,
            onClick: () => navigate('/orders')
          },
          {
            label: 'Wishlist',
            icon: Heart,
            onClick: () => navigate('/wishlist')
          },
          {
            label: 'Settings',
            icon: Settings,
            onClick: () => navigate('/profile')
          }
        ]}
        notifications={5}
        messages={3}
        stats={[
          {
            label: 'Total Orders',
            value: dashboardData?.totalOrders || 0,
            trend: 'up'
          },
          {
            label: 'Favorites',
            value: dashboardData?.favoriteItems || 0,
            trend: 'neutral'
          },
          {
            label: 'Profile Views',
            value: dashboardData?.profileViews || 0,
            trend: 'up'
          }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600">Loading dashboard...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="border-red-200 bg-red-50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-red-900">Error Loading Dashboard</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
                <Button size="sm" onClick={loadDashboardData}>Retry</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        {!loading && dashboardData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold">{dashboardData.totalOrders}</p>
                    </div>
                    <ShoppingCart className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Favorite Items</p>
                      <p className="text-2xl font-bold">{dashboardData.favoriteItems}</p>
                    </div>
                    <Heart className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Profile Views</p>
                      <p className="text-2xl font-bold">{dashboardData.profileViews}</p>
                    </div>
                    <Eye className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Reviews Given</p>
                      <p className="text-2xl font-bold">{dashboardData.reviewsGiven}</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="orders">My Orders</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Orders */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Orders</CardTitle>
                      <CardDescription>Your latest purchase activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dashboardData.recentOrders.length > 0 ? (
                          dashboardData.recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <Package className="w-8 h-8 text-gray-400" />
                                <div>
                                  <p className="font-medium">{order.title}</p>
                                  <p className="text-sm text-gray-500">{order.date}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">₦{order.amount.toLocaleString()}</p>
                                <Badge variant={
                                  order.status === 'delivered' ? 'default' :
                                  order.status === 'shipped' ? 'secondary' : 'outline'
                                }>
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500">No orders yet</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity Summary</CardTitle>
                      <CardDescription>Your marketplace activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Items viewed this week</span>
                          <span className="font-semibold">{activityMetrics.itemsViewedThisWeek}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Searches performed</span>
                          <span className="font-semibold">{activityMetrics.searchesPerformed}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Messages sent</span>
                          <span className="font-semibold">{activityMetrics.messagesSent}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Reviews written</span>
                          <span className="font-semibold">{activityMetrics.reviewsWritten}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>All your orders and their current status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.recentOrders.length > 0 ? (
                        dashboardData.recentOrders.map((order) => (
                          <div key={order.id} className="border rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="font-semibold">{order.title}</h3>
                                <p className="text-sm text-gray-500">Order #{order.id} • {order.date}</p>
                              </div>
                              <Badge variant={
                                order.status === 'delivered' ? 'default' :
                                order.status === 'shipped' ? 'secondary' : 'outline'
                              }>
                                {order.status}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold">₦{order.amount.toLocaleString()}</span>
                              <div className="space-x-2">
                                <Button variant="outline" size="sm" onClick={() => toast.info('View order details - coming soon!')}>View Details</Button>
                                {order.status === 'delivered' && (
                                  <Button size="sm" onClick={() => toast.info('Review system coming soon!')}>Write Review</Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No orders yet</p>
                          <Button className="mt-4" onClick={() => navigate('/products')}>Browse Products</Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="favorites">
                <Card>
                  <CardHeader>
                    <CardTitle>Favorite Items</CardTitle>
                    <CardDescription>Items you've saved for later</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">You haven't added any favorites yet</p>
                      <Button className="mt-4" onClick={() => navigate('/products')}>Browse Products</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Manage your account settings and preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{user?.firstName} {user?.lastName}</h3>
                          <p className="text-gray-500">{user?.email}</p>
                          <Badge variant="secondary">Customer</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" onClick={() => navigate('/profile')}>Edit Profile</Button>
                        <Button variant="outline" onClick={() => toast.info('Security settings coming soon!')}>Security Settings</Button>
                        <Button variant="outline" onClick={() => toast.info('Notification preferences coming soon!')}>Notification Preferences</Button>
                        <Button variant="outline" onClick={() => toast.info('Privacy settings coming soon!')}>Privacy Settings</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
