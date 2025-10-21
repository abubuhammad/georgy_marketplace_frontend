import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserDropdown } from '@/components/ui/user-dropdown';
import { EnhancedDashboardHeader } from '@/components/enhanced/EnhancedDashboardHeader';
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Shield,
  Settings,
  FileText,
  Eye,
  Plus,
  ShoppingCart,
  BarChart3,
  UserCheck,
  Ban,
  Flag
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { itemCount } = useCart();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    activeDisputes: 0,
    flaggedContent: 0
  });

  // Mock admin data
  const mockStats = {
    totalUsers: 15234,
    totalListings: 8956,
    totalRevenue: 2850000000, // 2.85B NGN
    pendingVerifications: 45,
    activeDisputes: 12,
    flaggedContent: 8,
    monthlyGrowth: 12.5,
    revenueGrowth: 18.3
  };

  const mockRecentActivity = [
    { id: '1', type: 'user_registered', user: 'John Doe', time: '2 minutes ago', action: 'New user registration' },
    { id: '2', type: 'listing_flagged', user: 'Admin System', time: '5 minutes ago', action: 'Listing flagged for review' },
    { id: '3', type: 'dispute_opened', user: 'Jane Smith', time: '10 minutes ago', action: 'Payment dispute opened' },
    { id: '4', type: 'verification_requested', user: 'Mike Johnson', time: '15 minutes ago', action: 'Seller verification requested' }
  ];

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

  useEffect(() => {
    // Load admin stats
    setStats(mockStats);
  }, []);

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
        notifications={mockStats.pendingVerifications + mockStats.activeDisputes}
        messages={mockStats.flaggedContent}
        stats={[
          {
            label: 'Total Users',
            value: `${(mockStats.totalUsers / 1000).toFixed(1)}K`,
            trend: 'up'
          },
          {
            label: 'Revenue',
            value: `₦${(mockStats.totalRevenue / 1000000000).toFixed(1)}B`,
            trend: 'up'
          },
          {
            label: 'Active Issues',
            value: mockStats.activeDisputes + mockStats.flaggedContent,
            trend: 'down'
          }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</p>
                      <p className="text-sm text-green-600">+{mockStats.monthlyGrowth}% this month</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Listings</p>
                      <p className="text-2xl font-bold">{mockStats.totalListings.toLocaleString()}</p>
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
                      <p className="text-2xl font-bold">₦{(mockStats.totalRevenue / 1000000000).toFixed(2)}B</p>
                      <p className="text-sm text-green-600">+{mockStats.revenueGrowth}% this month</p>
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
                      <p className="text-2xl font-bold">{mockStats.activeDisputes + mockStats.flaggedContent}</p>
                      <p className="text-sm text-red-600">Requires attention</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-gray-600">by {activity.user}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
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
                  <Badge variant="destructive">{mockPendingVerifications.length}</Badge>
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
                Flagged Content ({mockStats.flaggedContent})
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <ShoppingBag className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Listings</h3>
                  <p className="text-2xl font-bold">{mockStats.totalListings.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total active listings</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Flag className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Flagged</h3>
                  <p className="text-2xl font-bold">{mockStats.flaggedContent}</p>
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
              <Badge variant="destructive">{mockDisputes.length} Active</Badge>
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
