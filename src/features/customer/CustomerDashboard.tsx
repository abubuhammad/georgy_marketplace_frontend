import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Package, Heart, MapPin, User, Settings, ShoppingBag,
    Star, TrendingUp, Clock, CreditCard, Bell, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import productService from '@/services/productService';
import customerService from '@/services/customerService';
import { Product } from '@/types';
import { CustomerStats, CustomerActivity } from '@/features/customer/types';

const CustomerDashboard: React.FC = () => {
    const { user } = useAuthContext();
    const { currentPlatform } = useAppContext();

    const [stats, setStats] = useState<CustomerStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<Array<{
        id: string; 
        order_number: string; 
        status: string; 
        total_amount: number; 
        created_at: string;
        items?: Array<{ listing?: { title?: string; images?: Array<{ image_url: string }> } }>;
    }>>([]);
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
    const [recentActivity, setRecentActivity] = useState<CustomerActivity[]>([]);
    const [recommendations, setRecommendations] = useState<Array<{
        id: string;
        title: string;
        price: number;
        location_city: string;
        images?: Array<{ image_url: string }>;
    }>>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const loadDashboardData = useCallback(async () => {
        if (!user) return;

        const isRefresh = !loading;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            // Load all dashboard data in parallel for better performance
            const [
                statsResult,
                ordersResult,
                favoritesResult,
                activityResult,
                recommendationsResult
            ] = await Promise.allSettled([
                customerService.getCustomerStats(user.id),
                customerService.getRecentOrders(user.id),
                productService.getUserFavorites(user.id),
                customerService.getCustomerActivity(user.id),
                customerService.getCustomerRecommendations(user.id)
            ]);

            // Handle stats
            if (statsResult.status === 'fulfilled') {
                setStats(statsResult.value);
            }

            // Handle orders
            if (ordersResult.status === 'fulfilled') {
                setRecentOrders(ordersResult.value);
            }

            // Handle favorites
            if (favoritesResult.status === 'fulfilled' && favoritesResult.value.data) {
                setFavoriteProducts(favoritesResult.value.data.slice(0, 4));
            }

            // Handle activity
            if (activityResult.status === 'fulfilled') {
                setRecentActivity(activityResult.value);
            }

            // Handle recommendations
            if (recommendationsResult.status === 'fulfilled') {
                setRecommendations(recommendationsResult.value.slice(0, 4));
            }

            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, loading]);

    // Set up real-time data updates
    const { refresh } = useRealTimeData(loadDashboardData, {
        enabled: !!user,
        interval: 30000, // Update every 30 seconds
        onUpdate: () => setLastUpdated(new Date())
    });

    useEffect(() => {
        if (user) {
            loadDashboardData();
        }
    }, [user, loadDashboardData]);

    const handleManualRefresh = async () => {
        try {
            await refresh();
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
        }
    };

    const dashboardStats = [
        {
            title: 'Active Orders',
            value: stats?.activeOrders?.toString() || '0',
            description: 'Orders in progress',
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Saved Items',
            value: stats?.savedItems?.toString() || favoriteProducts.length.toString(),
            description: 'Items in wishlist',
            icon: Heart,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        },
        {
            title: 'Total Spent',
            value: `₦${stats?.totalSpent?.toLocaleString() || '0'}`,
            description: 'All time',
            icon: CreditCard,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        },
        {
            title: 'Reviews Given',
            value: stats?.reviewsGiven?.toString() || '0',
            description: 'Product reviews',
            icon: Star,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
        }
    ];

    const quickActions = [
        {
            title: 'Browse Products',
            description: 'Discover new items',
            icon: ShoppingBag,
            href: '/products',
            color: 'bg-primary'
        },
        {
            title: 'View Wishlist',
            description: 'See saved items',
            icon: Heart,
            href: '/wishlist',
            color: 'bg-red-500'
        },
        {
            title: 'Order History',
            description: 'Track your orders',
            icon: Package,
            href: '/orders',
            color: 'bg-blue-500'
        },
        {
            title: 'Account Settings',
            description: 'Manage your account',
            icon: Settings,
            href: '/settings',
            color: 'bg-gray-500'
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array(4).fill(0).map((_, i) => (
                                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Welcome back, {user?.firstName}!
                            </h1>
                            <p className="text-gray-600">
                                Manage your orders, wishlist, and account settings
                            </p>
                            {stats && (
                                <div className="flex items-center gap-4 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                        {stats.membershipLevel} Member
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                        {stats.loyaltyPoints.toLocaleString()} loyalty points
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleManualRefresh}
                                    disabled={refreshing}
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                                <p className="text-xs text-gray-500 mt-1">
                                    Last updated: {lastUpdated.toLocaleTimeString()}
                                </p>
                            </div>
                            <Button variant="outline">
                                <Bell className="w-4 h-4 mr-2" />
                                Notifications
                            </Button>
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback>
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {dashboardStats.map((stat, index) => (
                        <Card key={index}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            {stat.title}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stat.value}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {stat.description}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common tasks and shortcuts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickActions.map((action, index) => (
                                <Link key={index} to={action.href}>
                                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                        <CardContent className="p-4 text-center">
                                            <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                                                <action.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="font-semibold mb-1">{action.title}</h3>
                                            <p className="text-sm text-gray-600">{action.description}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="orders">Recent Orders</TabsTrigger>
                        <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Activity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Clock className="w-5 h-5 mr-2" />
                                        Recent Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {recentActivity.length > 0 ? (
                                        recentActivity.slice(0, 3).map((activity) => (
                                            <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                <div className={`w-2 h-2 rounded-full ${activity.status === 'completed' ? 'bg-green-500' :
                                                        activity.status === 'pending' ? 'bg-blue-500' :
                                                            activity.status === 'action' ? 'bg-yellow-500' : 'bg-gray-500'
                                                    }`}></div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{activity.title}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(activity.timestamp).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4">
                                            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No recent activity</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recommended Products */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <TrendingUp className="w-5 h-5 mr-2" />
                                        Recommended for You
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recommendations.length > 0 ? (
                                            recommendations.map((product) => (
                                                <Link key={product.id} to={`/product/${product.id}`}>
                                                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                                        <img
                                                            src={product.images?.[0]?.image_url || '/api/placeholder/60/60'}
                                                            alt={product.title}
                                                            className="w-12 h-12 object-cover rounded"
                                                        />
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-sm line-clamp-1">{product.title}</h4>
                                                            <p className="text-sm text-primary font-semibold">₦{product.price?.toLocaleString()}</p>
                                                            <p className="text-xs text-gray-500">{product.location_city}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="text-center py-4">
                                                <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-500">No recommendations available</p>
                                                <Link to="/products">
                                                    <Button variant="outline" size="sm" className="mt-2">
                                                        Browse Products
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="orders">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Orders</CardTitle>
                                <CardDescription>
                                    Your order history and tracking information
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentOrders.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentOrders.map((order) => (
                                            <div key={order.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-semibold">Order #{order.order_number}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge variant={
                                                            order.status === 'delivered' ? 'default' :
                                                                order.status === 'shipped' ? 'secondary' :
                                                                    order.status === 'processing' ? 'outline' : 'destructive'
                                                        }>
                                                            {order.status}
                                                        </Badge>
                                                        <p className="text-sm font-semibold text-primary mt-1">
                                                            ₦{order.total_amount?.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {order.items?.slice(0, 3).map((item, index: number) => (
                                                        <img
                                                            key={index}
                                                            src={item.listing?.images?.[0]?.image_url || '/api/placeholder/40/40'}
                                                            alt={item.listing?.title || 'Product'}
                                                            className="w-10 h-10 object-cover rounded"
                                                        />
                                                    ))}
                                                    {order.items?.length > 3 && (
                                                        <span className="text-sm text-gray-500">
                                                            +{order.items.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                                        <p className="text-gray-600 mb-4">
                                            Start shopping to see your orders here
                                        </p>
                                        <Link to="/products">
                                            <Button>
                                                <ShoppingBag className="w-4 h-4 mr-2" />
                                                Browse Products
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="wishlist">
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Wishlist</CardTitle>
                                <CardDescription>
                                    Items you've saved for later
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {favoriteProducts.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {favoriteProducts.map((product) => (
                                            <Card key={product.id} className="hover:shadow-lg transition-shadow">
                                                <div className="relative">
                                                    <img
                                                        src={product.images?.[0]?.image_url || '/api/placeholder/300/200'}
                                                        alt={product.title}
                                                        className="w-full h-48 object-cover rounded-t-lg"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="absolute top-2 right-2"
                                                    >
                                                        <Heart className="w-4 h-4 fill-current text-red-500" />
                                                    </Button>
                                                </div>
                                                <CardContent className="p-4">
                                                    <Link to={`/product/${product.id}`}>
                                                        <CardTitle className="text-lg mb-2 line-clamp-2 hover:text-primary">
                                                            {product.title}
                                                        </CardTitle>
                                                    </Link>
                                                    <div className="text-xl font-bold text-primary mb-2">
                                                        ₦{product.price.toLocaleString()}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600 mb-3">
                                                        <MapPin className="w-4 h-4 mr-1" />
                                                        {product.location_city}
                                                    </div>
                                                    <Button className="w-full" size="sm">
                                                        View Details
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No saved items</h3>
                                        <p className="text-gray-600 mb-4">
                                            Save items you're interested in to view them later
                                        </p>
                                        <Link to="/products">
                                            <Button>
                                                <ShoppingBag className="w-4 h-4 mr-2" />
                                                Browse Products
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="activity">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Activity</CardTitle>
                                <CardDescription>
                                    Your recent actions and platform interactions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentActivity.length > 0 ? (
                                        recentActivity.map((activity) => {
                                            const getIcon = () => {
                                                switch (activity.type) {
                                                    case 'order_delivered':
                                                    case 'order_placed':
                                                        return Package;
                                                    case 'review_submitted':
                                                        return Star;
                                                    case 'item_saved':
                                                        return Heart;
                                                    default:
                                                        return Bell;
                                                }
                                            };

                                            const getIconColor = () => {
                                                switch (activity.status) {
                                                    case 'completed':
                                                        return 'bg-green-100 text-green-600';
                                                    case 'pending':
                                                        return 'bg-blue-100 text-blue-600';
                                                    case 'action':
                                                        return 'bg-yellow-100 text-yellow-600';
                                                    default:
                                                        return 'bg-gray-100 text-gray-600';
                                                }
                                            };

                                            const Icon = getIcon();

                                            return (
                                                <div key={activity.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconColor()}`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{activity.title}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            {activity.description}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(activity.timestamp).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className="capitalize">
                                                        {activity.status}
                                                    </Badge>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8">
                                            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                                            <p className="text-gray-600 mb-4">
                                                Start using the platform to see your activity here
                                            </p>
                                            <Link to="/products">
                                                <Button>
                                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                                    Browse Products
                                                </Button>
                                            </Link>
                                        </div>
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

export default CustomerDashboard;
