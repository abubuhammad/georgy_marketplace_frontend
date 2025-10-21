import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, ShoppingBag, DollarSign, TrendingUp, 
  Package, MapPin, AlertTriangle, BarChart3,
  Settings, Shield, FileText, Activity, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { adminService, PlatformStats, ActivityItem } from '@/services/adminService';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeListings: 0,
    pendingVerifications: 0,
    reportedIssues: 0
  });
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [pendingActions, setPendingActions] = useState({
    pendingVerifications: 0,
    reportedIssues: 0,
    paymentDisputes: 0
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const loadAdminData = async () => {
    try {
      const [stats, activities, actions] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getRecentActivities(8),
        adminService.getPendingActions()
      ]);
      
      setPlatformStats(stats);
      setRecentActivities(activities);
      setPendingActions(actions);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  // Set up real-time data updates
  const { refresh } = useRealTimeData(loadAdminData, {
    enabled: true,
    interval: 30000, // 30 seconds
    onUpdate: () => {
      console.log('Admin data updated at:', new Date().toLocaleTimeString());
    }
  });

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await loadAdminData();
      setLoading(false);
    };
    
    initializeData();
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch (error) {
      console.error('Manual refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const adminStats = [
    {
      title: 'Total Users',
      value: platformStats.totalUsers.toLocaleString(),
      change: '+12.5%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Orders',
      value: platformStats.totalOrders.toLocaleString(),
      change: '+8.2%',
      icon: ShoppingBag,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Total Revenue',
      value: `₦${platformStats.totalRevenue.toLocaleString()}`,
      change: '+15.3%',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Active Listings',
      value: platformStats.activeListings.toLocaleString(),
      change: '+5.7%',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const pendingActionsList = [
    {
      title: 'User Verifications',
      count: pendingActions.pendingVerifications,
      description: 'Users pending identity verification',
      action: 'Review',
      priority: 'high',
      link: '/admin/verifications'
    },
    {
      title: 'Reported Issues',
      count: pendingActions.reportedIssues,
      description: 'Content moderation required',
      action: 'Moderate',
      priority: 'medium',
      link: '/admin/moderation'
    },
    {
      title: 'Payment Disputes',
      count: pendingActions.paymentDisputes,
      description: 'Financial disputes to resolve',
      action: 'Resolve',
      priority: 'high',
      link: '/admin/disputes'
    }
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      link: '/admin/users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Customer Management',
      description: 'Customer relationship management and analytics',
      icon: Users,
      link: '/admin/customers',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Content Moderation',
      description: 'Review flagged content and listings',
      icon: Shield,
      link: '/admin/moderation',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Analytics',
      description: 'View platform analytics and reports',
      icon: BarChart3,
      link: '/admin/analytics',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Revenue Sharing',
      description: 'Configure commission and payouts',
      icon: DollarSign,
      link: '/admin/revenue',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'System Settings',
      description: 'Platform configuration and settings',
      icon: Settings,
      link: '/admin/settings',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      title: 'Legal Compliance',
      description: 'Manage terms, policies, and compliance',
      icon: FileText,
      link: '/admin/legal',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.full_name}. Here's your platform overview.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button
          onClick={handleManualRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Pending Actions
              </CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingActionsList.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{action.title}</h4>
                      <Badge variant={action.priority === 'high' ? 'destructive' : 'secondary'}>
                        {action.count}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                  <Link to={action.link}>
                    <Button size="sm" variant="outline">
                      {action.action}
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used admin functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <Link key={index} to={action.link}>
                      <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${action.bgColor}`}>
                            <IconComponent className={`h-5 w-5 ${action.color}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{action.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Platform Activity
          </CardTitle>
          <CardDescription>Latest system events and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link to="/admin/activity">
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
