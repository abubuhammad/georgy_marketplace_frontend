import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnhancedProfile } from '../enhanced/EnhancedProfile';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Package, ShoppingCart, DollarSign, TrendingUp, Eye,
  Star, Users, BarChart3, AlertTriangle, CheckCircle,
  Plus, Edit, Trash2, Upload, Download, Clock,
  Box, Truck, CreditCard, Award, MessageCircle
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  stock: number;
  sold: number;
  status: 'active' | 'paused' | 'out_of_stock' | 'draft';
  createdDate: string;
  rating: number;
  reviewCount: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: number;
  total: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
}

interface SellerStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  rating: number;
  reviewCount: number;
  profileViews: number;
}

interface ShopProfile {
  name: string;
  description: string;
  category: string;
  logo?: string;
  banner?: string;
  location: string;
  established: string;
  policies: {
    shipping: string;
    returns: string;
    payment: string;
  };
}

export const EnhancedSellerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<SellerStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    rating: 0,
    reviewCount: 0,
    profileViews: 0
  });
  
  const [shopProfile, setShopProfile] = useState<ShopProfile>({
    name: '',
    description: '',
    category: '',
    location: '',
    established: '',
    policies: {
      shipping: '',
      returns: '',
      payment: ''
    }
  });

  useEffect(() => {
    loadSellerData();
  }, []);

  const loadSellerData = async () => {
    try {
      setLoading(true);
      
      // Load products
      const productsResponse = await apiClient.get('/api/seller/products');
      if (productsResponse.data) {
        setProducts(productsResponse.data);
      }
      
      // Load orders
      const ordersResponse = await apiClient.get('/api/seller/orders');
      if (ordersResponse.data) {
        setOrders(ordersResponse.data);
      }
      
      // Load stats
      const statsResponse = await apiClient.get('/api/seller/stats');
      if (statsResponse.data) {
        setStats(statsResponse.data);
      }
      
      // Load shop profile
      const shopResponse = await apiClient.get('/api/seller/shop-profile');
      if (shopResponse.data) {
        setShopProfile(shopResponse.data);
      }
      
    } catch (error) {
      console.error('Error loading seller data:', error);
      toast.error('Failed to load seller data');
    } finally {
      setLoading(false);
    }
  };

  const getProductStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'out_of_stock': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
      label: 'Add Product',
      icon: Plus,
      onClick: () => navigate('/seller/products/new'),
      variant: 'default' as const
    },
    {
      label: 'View Orders',
      icon: ShoppingCart,
      onClick: () => navigate('/seller/orders')
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      onClick: () => navigate('/seller/analytics')
    }
  ];

  const roleSpecificContent = (
    <div className="space-y-6">
      {/* Shop Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Shop Information
          </CardTitle>
          <CardDescription>
            Manage your shop profile and details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={shopProfile.logo} />
              <AvatarFallback className="text-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                {shopProfile.name?.charAt(0) || 'S'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{shopProfile.name || 'Shop Name'}</h3>
              <p className="text-gray-600">{shopProfile.category || 'Category not specified'}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {stats.rating ? stats.rating.toFixed(1) : '0.0'} ({stats.reviewCount} reviews)
                </span>
                <span>•</span>
                <span>Est. {shopProfile.established || 'N/A'}</span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit Shop
            </Button>
          </div>
          
          {shopProfile.description && (
            <div>
              <h4 className="font-medium mb-2">About Shop</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {shopProfile.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">{stats.activeProducts} active</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Clock className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-gray-600">{stats.pendingOrders} pending</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+${stats.monthlyRevenue.toLocaleString()} this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.rating ? stats.rating.toFixed(1) : '0.0'}
                </p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <MessageCircle className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-gray-600">{stats.reviewCount} reviews</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Management
            </CardTitle>
            <CardDescription>
              Manage your product listings and inventory
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/seller/products/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500 mb-4">Start selling by adding your first product.</p>
              <Button onClick={() => navigate('/seller/products/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <Badge className={getProductStatusColor(product.status)}>
                            {product.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          <span>{product.category}</span>
                          <span>•</span>
                          <span className="font-medium">${product.price}</span>
                          <span>•</span>
                          <span>Stock: {product.stock}</span>
                          <span>•</span>
                          <span>Sold: {product.sold}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                          </span>
                          <span>Created {new Date(product.createdDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {products.length > 5 && (
                <Button variant="outline" className="w-full" onClick={() => navigate('/seller/products')}>
                  View All Products ({products.length})
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>
              Track and manage your customer orders
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/seller/orders')}>
            View All Orders
          </Button>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-4">Orders will appear here once customers start purchasing your products.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">#{order.orderNumber}</h3>
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{order.customerName}</span>
                        <span>•</span>
                        <span>{order.items} items</span>
                        <span>•</span>
                        <span className="font-medium">${order.total}</span>
                        <span>•</span>
                        <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Order
                    </Button>
                  </div>
                </div>
              ))}
              
              {orders.length > 5 && (
                <Button variant="outline" className="w-full" onClick={() => navigate('/seller/orders')}>
                  View All Orders ({orders.length})
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const additionalTabTriggers = (
    <>
      <TabsTrigger value="products">Products</TabsTrigger>
      <TabsTrigger value="orders">Orders</TabsTrigger>
      <TabsTrigger value="analytics">Analytics</TabsTrigger>
      <TabsTrigger value="shop">Shop Profile</TabsTrigger>
    </>
  );

  const additionalTabsContent = (
    <>
      <TabsContent value="products" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Management</CardTitle>
            <CardDescription>Manage all your products and inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Advanced product management coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="orders" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>Process and fulfill customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Order management interface coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Analytics</CardTitle>
            <CardDescription>View detailed sales reports and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Analytics dashboard coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="shop" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Shop Profile Settings</CardTitle>
            <CardDescription>Update your shop information and branding</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Shop profile editor coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );

  return (
    <EnhancedProfile
      role="seller"
      customActions={customActions}
      roleSpecificContent={roleSpecificContent}
      additionalTabTriggers={additionalTabTriggers}
      additionalTabsContent={additionalTabsContent}
    />
  );
};