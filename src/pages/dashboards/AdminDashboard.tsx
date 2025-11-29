import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedDashboardHeader } from '@/components/enhanced/EnhancedDashboardHeader';
import {
  Users,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Shield,
  Settings,
  FileText,
  Eye,
  Plus,
  BarChart3,
  UserCheck,
  Ban,
  Flag,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { adminService, PlatformStats, ActivityItem } from '@/services/adminService';

interface DashboardStats extends PlatformStats {
  monthlyGrowth: number;
  revenueGrowth: number;
  flaggedContent: number;
  activeDisputes: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeListings: 0,
    pendingVerifications: 0,
    reportedIssues: 0,
    monthlyGrowth: 0,
    revenueGrowth: 0,
    flaggedContent: 0,
    activeDisputes: 0
  });

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [pendingActions, setPendingActions] = useState({
    pendingVerifications: 0,
    reportedIssues: 0,
    paymentDisputes: 0
  });

  // Fetch dashboard data from backend
  const fetchDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch all data in parallel
      const [platformStats, activities, pending] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getRecentActivities(10),
        adminService.getPendingActions()
      ]);

      // Update stats with fetched data
      setStats({
        ...platformStats,
        monthlyGrowth: 12.5, // TODO: Calculate from historical data
        revenueGrowth: 18.3, // TODO: Calculate from historical data
        flaggedContent: pending.reportedIssues,
        activeDisputes: pending.paymentDisputes
      });

      setRecentActivity(activities);
      setPendingActions(pending);

      console.log('📊 Dashboard data loaded successfully');
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Using cached data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `₦${(amount / 1000000000).toFixed(2)}B`;
    } else if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(1)}K`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  // Mock data for sections not yet connected to backend
  const mockPendingVerifications = [
    { id: '1', name: 'Electronics Plus Store', type: 'Seller', submitted: '2024-01-15', documents: 3 },
    { id: '2', name: 'Lagos Properties Ltd', type: 'Realtor', submitted: '2024-01-14', documents: 5 },
    { id: '3', name: 'TechRecruit Nigeria', type: 'Employer', submitted: '2024-01-13', documents: 4 }
  ];

  const mockDisputes = [
    { id: '1', plaintiff: 'Customer A', defendant: 'Seller B', amount: 45000, status: 'Under Review', date: '2024-01-15' },
    { id: '2', plaintiff: 'Customer C', defendant: 'Seller D', amount: 120000, status: 'Escalated', date: '2024-01-14' },
    { id: '3', plaintiff: 'Customer E', defendant: 'Seller F', amount: 75000, status: 'Pending', date: '2024-01-13' }
  ];

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You need admin privileges to access this dashboard</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Admin Dashboard Header */}
      <EnhancedDashboardHeader
        title="Admin Control Center"
        subtitle="Master platform operations with supreme authority"
        user={user}
        actions={[
          {
            label: 'User Management',
            icon: Users,
            onClick: () => navigate('/admin/users')
          },
          {
            label: 'Reports',
            icon: BarChart3,
            onClick: () => navigate('/admin/reports')
          },
          {
            label: 'System Settings',
            icon: Settings,
            onClick: () => navigate('/admin/settings')
          }
        ]}
        notifications={stats.pendingVerifications + stats.activeDisputes}
        messages={stats.flaggedContent}
        stats={[
          {
            label: 'Total Users',
            value: formatNumber(stats.totalUsers),
            trend: 'up'
          },
          {
            label: 'Revenue',
            value: formatCurrency(stats.totalRevenue),
            trend: 'up'
          },
          {
            label: 'Active Issues',
            value: stats.activeDisputes + stats.flaggedContent,
            trend: 'down'
          }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
            <p className="text-yellow-800">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchDashboardData(true)}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview - Now using dynamic data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                      <p className="text-sm text-green-600">+{stats.monthlyGrowth}% this month</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Listings</p>
                      <p className="text-2xl font-bold">{stats.activeListings.toLocaleString()}</p>
                      <p className="text-sm text-green-600">+8.2% this month</p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                      <p className="text-sm text-green-600">+{stats.revenueGrowth}% this month</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Issues</p>
                      <p className="text-2xl font-bold">{stats.activeDisputes + stats.flaggedContent}</p>
                      <p className="text-sm text-red-600">Requires attention</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                      <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
                    </div>
                    <UserCheck className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Reported Issues</p>
                      <p className="text-2xl font-bold">{stats.reportedIssues}</p>
                    </div>
                    <Flag className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity - Now using dynamic data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Activity
                  {recentActivity.length > 0 && (
                    <Badge variant="outline">{recentActivity.length} items</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.status === 'success' ? 'bg-green-500' :
                            activity.status === 'warning' ? 'bg-yellow-500' :
                            activity.status === 'error' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}></div>
                          <div>
                            <p className="font-medium">{activity.description}</p>
                            <p className="text-sm text-gray-600">{activity.type.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{activity.timestamp}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent activity to display</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Export Users
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            {/* Pending Verifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Pending Verifications
                  <Badge variant="destructive">{pendingActions.pendingVerifications}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPendingVerifications.map((verification) => (
                    <div key={verification.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{verification.name}</h3>
                        <p className="text-sm text-gray-600">{verification.type} • {verification.documents} documents</p>
                        <p className="text-sm text-gray-500">Submitted {verification.submitted}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        <Button variant="outline" size="sm">
                          <UserCheck className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button variant="outline" size="sm">
                          <Ban className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Content Moderation</h2>
              <Button variant="outline">
                <Flag className="w-4 h-4 mr-2" />
                Flagged Content ({stats.flaggedContent})
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <ShoppingBag className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Listings</h3>
                  <p className="text-2xl font-bold">{stats.activeListings.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total active listings</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Flag className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Flagged</h3>
                  <p className="text-2xl font-bold">{stats.flaggedContent}</p>
                  <p className="text-sm text-gray-600">Require review</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <UserCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Verified</h3>
                  <p className="text-2xl font-bold">95%</p>
                  <p className="text-sm text-gray-600">Content approval rate</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="disputes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Dispute Management</h2>
              <Badge variant="destructive">{pendingActions.paymentDisputes} Active</Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active Disputes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDisputes.map((dispute) => (
                    <div key={dispute.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{dispute.plaintiff} vs {dispute.defendant}</h3>
                        <p className="text-sm text-gray-600">Amount: ₦{dispute.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Opened {dispute.date}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={dispute.status === 'Escalated' ? 'destructive' : 'default'}
                        >
                          {dispute.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Platform Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>User Registration</span>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Auto-approve Listings</span>
                    <input type="checkbox" className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Maintenance Mode</span>
                    <input type="checkbox" className="toggle" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    System Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Platform Version</span>
                    <span className="font-mono">v2.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database Status</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Backup</span>
                    <span>2 hours ago</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
