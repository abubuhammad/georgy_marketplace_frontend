import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Shield, 
  Settings, 
  Users,
  Activity,
  BarChart3,
  Database,
  Key,
  Bell,
  FileText,
  Lock,
  Globe,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  Camera,
  Download,
  Upload,
  RefreshCcw,
  Trash2,
  Edit
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AdminProfile {
  id: string;
  userId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string;
    department: string;
    position: string;
    employeeId: string;
  };
  permissions: {
    userManagement: boolean;
    sellerManagement: boolean;
    orderManagement: boolean;
    categoryManagement: boolean;
    contentManagement: boolean;
    systemSettings: boolean;
    reportAccess: boolean;
    auditLogs: boolean;
    paymentManagement: boolean;
    supportTickets: boolean;
  };
  systemSettings: {
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    sellerOnboarding: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    automaticBackups: boolean;
    securityAlerts: boolean;
    analyticsEnabled: boolean;
  };
  statistics: {
    totalUsers: number;
    totalSellers: number;
    totalOrders: number;
    totalRevenue: number;
    activeDisputes: number;
    pendingApprovals: number;
    systemUptime: string;
    lastLogin: string;
  };
  activityLog: Array<{
    id: string;
    action: string;
    resource: string;
    timestamp: string;
    ipAddress: string;
    userAgent: string;
  }>;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    dashboardLayout: 'compact' | 'comfortable' | 'spacious';
    notifications: {
      email: boolean;
      browser: boolean;
      mobile: boolean;
    };
  };
}

const AdminProfile: React.FC = () => {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Mock admin profile data
      const mockProfile: AdminProfile = {
        id: 'admin-profile-1',
        userId: user!.id,
        personalInfo: {
          firstName: 'Administrator',
          lastName: 'User',
          email: user?.email || 'admin@marketplace.com',
          phone: '+234-900-000-0001',
          avatar: '/api/placeholder/100/100',
          department: 'Technology',
          position: 'System Administrator',
          employeeId: 'EMP-ADM-001'
        },
        permissions: {
          userManagement: true,
          sellerManagement: true,
          orderManagement: true,
          categoryManagement: true,
          contentManagement: true,
          systemSettings: true,
          reportAccess: true,
          auditLogs: true,
          paymentManagement: true,
          supportTickets: true
        },
        systemSettings: {
          maintenanceMode: false,
          registrationEnabled: true,
          sellerOnboarding: true,
          emailNotifications: true,
          smsNotifications: true,
          automaticBackups: true,
          securityAlerts: true,
          analyticsEnabled: true
        },
        statistics: {
          totalUsers: 15847,
          totalSellers: 1205,
          totalOrders: 89234,
          totalRevenue: 2450000000, // 2.45 billion naira
          activeDisputes: 23,
          pendingApprovals: 47,
          systemUptime: '99.94%',
          lastLogin: new Date().toISOString()
        },
        activityLog: [
          {
            id: 'log-1',
            action: 'Updated system settings',
            resource: 'System Configuration',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          {
            id: 'log-2',
            action: 'Approved seller verification',
            resource: 'Seller Management',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          {
            id: 'log-3',
            action: 'Generated monthly report',
            resource: 'Reports',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        ],
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'Africa/Lagos',
          dashboardLayout: 'comfortable',
          notifications: {
            email: true,
            browser: true,
            mobile: true
          }
        }
      };

      setProfile(mockProfile);
    } catch (error) {
      toast.error('Failed to load admin profile');
      console.error('Admin profile loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      // Mock save - in real app this would call API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Admin profile updated successfully');
    } catch (error) {
      toast.error('Failed to update admin profile');
      console.error('Admin profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (updates: Partial<AdminProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  const getPermissionStatus = (hasPermission: boolean) => {
    return hasPermission ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertTriangle className="w-4 h-4 text-red-500" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Loading admin profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p>Admin profile not found</p>
          <Button onClick={loadProfile} className="mt-4">
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
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={profile.personalInfo.avatar || '/api/placeholder/80/80'}
                  alt="Admin Avatar"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.personalInfo.firstName} {profile.personalInfo.lastName}
                </h1>
                <p className="text-gray-600">{profile.personalInfo.position}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Super Admin</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span className="text-sm">System Uptime: {profile.statistics.systemUptime}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your admin account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.personalInfo.firstName}
                      onChange={(e) => updateProfile({
                        personalInfo: { ...profile.personalInfo, firstName: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.personalInfo.lastName}
                      onChange={(e) => updateProfile({
                        personalInfo: { ...profile.personalInfo, lastName: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.personalInfo.email}
                      onChange={(e) => updateProfile({
                        personalInfo: { ...profile.personalInfo, email: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.personalInfo.phone}
                      onChange={(e) => updateProfile({
                        personalInfo: { ...profile.personalInfo, phone: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={profile.personalInfo.department}
                      onChange={(e) => updateProfile({
                        personalInfo: { ...profile.personalInfo, department: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={profile.personalInfo.position}
                      onChange={(e) => updateProfile({
                        personalInfo: { ...profile.personalInfo, position: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      value={profile.personalInfo.employeeId}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  System Statistics
                </CardTitle>
                <CardDescription>Platform overview and key metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {profile.statistics.totalUsers.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {profile.statistics.totalSellers.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Active Sellers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {profile.statistics.totalOrders.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      ₦{(profile.statistics.totalRevenue / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {profile.statistics.activeDisputes}
                    </p>
                    <p className="text-sm text-gray-600">Active Disputes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {profile.statistics.pendingApprovals}
                    </p>
                    <p className="text-sm text-gray-600">Pending Approvals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {profile.statistics.systemUptime}
                    </p>
                    <p className="text-sm text-gray-600">System Uptime</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-600">
                      {new Date(profile.statistics.lastLogin).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">Last Login</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Administrative Permissions
                </CardTitle>
                <CardDescription>Control access to various system features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(profile.permissions).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getPermissionStatus(value)}
                      <div>
                        <p className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {key === 'userManagement' && 'Manage user accounts and profiles'}
                          {key === 'sellerManagement' && 'Approve and manage seller accounts'}
                          {key === 'orderManagement' && 'View and manage all orders'}
                          {key === 'categoryManagement' && 'Manage product categories'}
                          {key === 'contentManagement' && 'Manage site content and pages'}
                          {key === 'systemSettings' && 'Access system configuration'}
                          {key === 'reportAccess' && 'Generate and view reports'}
                          {key === 'auditLogs' && 'Access system audit logs'}
                          {key === 'paymentManagement' && 'Manage payment processing'}
                          {key === 'supportTickets' && 'Handle customer support tickets'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => updateProfile({
                        permissions: { ...profile.permissions, [key]: checked }
                      })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>Global system settings and toggles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(profile.systemSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {key === 'maintenanceMode' && 'Put system in maintenance mode'}
                        {key === 'registrationEnabled' && 'Allow new user registrations'}
                        {key === 'sellerOnboarding' && 'Enable seller account creation'}
                        {key === 'emailNotifications' && 'Send system email notifications'}
                        {key === 'smsNotifications' && 'Send SMS notifications'}
                        {key === 'automaticBackups' && 'Enable automatic database backups'}
                        {key === 'securityAlerts' && 'Send security-related alerts'}
                        {key === 'analyticsEnabled' && 'Enable system analytics tracking'}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => updateProfile({
                        systemSettings: { ...profile.systemSettings, [key]: checked }
                      })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="flex flex-col gap-2 h-auto py-4">
                    <RefreshCcw className="w-5 h-5" />
                    <span className="text-sm">Refresh Cache</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-auto py-4">
                    <Database className="w-5 h-5" />
                    <span className="text-sm">Backup Data</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-auto py-4">
                    <Users className="w-5 h-5" />
                    <span className="text-sm">User Report</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col gap-2 h-auto py-4">
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-sm">Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your recent administrative actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.activityLog.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-gray-600">Resource: {log.resource}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(log.timestamp).toLocaleString()} • IP: {log.ipAddress}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  System Reports
                </CardTitle>
                <CardDescription>Generate and download system reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">User Report</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Comprehensive user registration and activity report
                    </p>
                    <Button size="sm" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Sales Report</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Revenue, orders, and seller performance metrics
                    </p>
                    <Button size="sm" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Security Report</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Security events, failed logins, and alerts
                    </p>
                    <Button size="sm" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">System Health</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Server performance and system status report
                    </p>
                    <Button size="sm" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Personal Preferences
                </CardTitle>
                <CardDescription>Customize your admin interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={profile.preferences.theme}
                      onValueChange={(value) => updateProfile({
                        preferences: { ...profile.preferences, theme: value as any }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={profile.preferences.language}
                      onValueChange={(value) => updateProfile({
                        preferences: { ...profile.preferences, language: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="yo">Yoruba</SelectItem>
                        <SelectItem value="ha">Hausa</SelectItem>
                        <SelectItem value="ig">Igbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="dashboardLayout">Dashboard Layout</Label>
                  <Select
                    value={profile.preferences.dashboardLayout}
                    onValueChange={(value) => updateProfile({
                      preferences: { ...profile.preferences, dashboardLayout: value as any }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Control how you receive admin notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive admin alerts via email</p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.email}
                    onCheckedChange={(checked) => updateProfile({
                      preferences: {
                        ...profile.preferences,
                        notifications: { ...profile.preferences.notifications, email: checked }
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Browser Notifications</Label>
                    <p className="text-sm text-gray-600">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.browser}
                    onCheckedChange={(checked) => updateProfile({
                      preferences: {
                        ...profile.preferences,
                        notifications: { ...profile.preferences.notifications, browser: checked }
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mobile Notifications</Label>
                    <p className="text-sm text-gray-600">Receive mobile app notifications</p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.mobile}
                    onCheckedChange={(checked) => updateProfile({
                      preferences: {
                        ...profile.preferences,
                        notifications: { ...profile.preferences.notifications, mobile: checked }
                      }
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="w-4 h-4 mr-2" />
                  Active Sessions
                </Button>
                
                <div className="pt-4 border-t">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      As an administrator, always use strong passwords and enable two-factor authentication.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminProfile;