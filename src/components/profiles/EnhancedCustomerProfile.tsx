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
  ShoppingCart, Package, Heart, CreditCard, MapPin, 
  Star, Clock, CheckCircle, Truck, Gift, TrendingUp,
  Plus, Eye, MessageCircle, Calendar
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
  trackingNumber?: string;
}

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  image?: string;
  inStock: boolean;
  seller: string;
}

interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  wishlistItems: number;
  loyaltyPoints: number;
  savedAddresses: number;
  reviewsWritten: number;
}

export const EnhancedCustomerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    totalOrders: 0,
    totalSpent: 0,
    wishlistItems: 0,
    loyaltyPoints: 0,
    savedAddresses: 0,
    reviewsWritten: 0
  });

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      
      // Load orders
      const ordersResponse = await apiClient.get('/api/customer/orders');
      if (ordersResponse.data) {
        setOrders(ordersResponse.data);
      }
      
      // Load wishlist
      const wishlistResponse = await apiClient.get('/api/customer/wishlist');
      if (wishlistResponse.data) {
        setWishlist(wishlistResponse.data);
      }
      
      // Load stats
      const statsResponse = await apiClient.get('/api/customer/stats');
      if (statsResponse.data) {
        setStats(statsResponse.data);
      }
      
    } catch (error) {
      console.error('Error loading customer data:', error);
      toast.error('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const customActions = [
    {
      label: 'Browse Products',
      icon: ShoppingCart,
      onClick: () => navigate('/products'),
      variant: 'default' as const
    },
    {
      label: 'My Orders',
      icon: Package,
      onClick: () => navigate('/orders')
    },
    {
      label: 'My Wishlist',
      icon: Heart,
      onClick: () => navigate('/wishlist')
    }
  ];

  const roleSpecificContent = (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+3 this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">Average: ${Math.round(stats.totalSpent / Math.max(stats.totalOrders, 1))}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wishlist Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.wishlistItems}</p>
              </div>
              <div className="p-2 bg-pink-50 rounded-lg">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">{Math.round(stats.wishlistItems * 0.3)} available</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Loyalty Points</p>
                <p className="text-2xl font-bold text-gray-900">{stats.loyaltyPoints.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Gift className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+${Math.round(stats.loyaltyPoints * 0.01)} value</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>
              Track your recent purchases and deliveries
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/orders')}>
            View All Orders
          </Button>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-4">Start shopping to see your orders here.</p>
              <Button onClick={() => navigate('/products')}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">Order #{order.orderNumber}</h3>
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.date).toLocaleDateString()}
                        </span>
                        <span>{order.items} items</span>
                        <span className="font-medium">${order.total}</span>
                        {order.trackingNumber && (
                          <span className="flex items-center gap-1">
                            <Truck className="w-4 h-4" />
                            Track: {order.trackingNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
              
              {orders.length > 5 && (
                <Button variant="outline" className="w-full" onClick={() => navigate('/orders')}>
                  View All Orders ({orders.length})
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wishlist */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Wishlist
            </CardTitle>
            <CardDescription>
              Items you've saved for later
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/wishlist')}>
            View All Items
          </Button>
        </CardHeader>
        <CardContent>
          {wishlist.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No wishlist items</h3>
              <p className="text-gray-500 mb-4">Save items you love to easily find them later.</p>
              <Button onClick={() => navigate('/products')}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.slice(0, 6).map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <h4 className="font-medium text-gray-900 mb-2">{item.name}</h4>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold">${item.price}</span>
                    <Badge variant={item.inStock ? 'default' : 'secondary'}>
                      {item.inStock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">By {item.seller}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" disabled={!item.inStock}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const additionalTabTriggers = (
    <>
      <TabsTrigger value="orders">Orders</TabsTrigger>
      <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
      <TabsTrigger value="reviews">Reviews</TabsTrigger>
      <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
    </>
  );

  const additionalTabsContent = (
    <>
      <TabsContent value="orders" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>View and manage all your past orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Detailed order history coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="wishlist" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Wishlist Management</CardTitle>
            <CardDescription>Organize and manage your saved items</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Advanced wishlist management coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reviews" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Reviews</CardTitle>
            <CardDescription>Reviews you've written for products and sellers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Review management coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="loyalty" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loyalty Program</CardTitle>
            <CardDescription>Track your points and rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">You have {stats.loyaltyPoints.toLocaleString()} points!</h3>
              <p className="text-gray-600 mb-6">
                Equivalent to ${(stats.loyaltyPoints * 0.01).toFixed(2)} in rewards
              </p>
              <Button>
                <Gift className="w-4 h-4 mr-2" />
                Redeem Points
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );

  return (
    <EnhancedProfile
      role="customer"
      customActions={customActions}
      roleSpecificContent={roleSpecificContent}
      additionalTabTriggers={additionalTabTriggers}
      additionalTabsContent={additionalTabsContent}
    />
  );
};