import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, Truck, DollarSign, Shield, Bell, Users, 
  Globe, Lock, Database, RefreshCw, Save, Loader2,
  ChevronRight, AlertTriangle, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

interface PlatformSettings {
  maintenance_mode: boolean;
  registration_enabled: boolean;
  email_verification_required: boolean;
  phone_verification_required: boolean;
  auto_approve_customers: boolean;
  require_seller_approval: boolean;
}

interface PaymentSettings {
  default_currency: string;
  enable_escrow: boolean;
  escrow_release_hours: number;
  minimum_withdrawal: number;
  maximum_withdrawal: number;
  processing_fee_percent: number;
}

const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    maintenance_mode: false,
    registration_enabled: true,
    email_verification_required: true,
    phone_verification_required: false,
    auto_approve_customers: true,
    require_seller_approval: true
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    default_currency: 'NGN',
    enable_escrow: true,
    escrow_release_hours: 72,
    minimum_withdrawal: 1000,
    maximum_withdrawal: 500000,
    processing_fee_percent: 2.5
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const resp = await apiClient.get<any>('/admin/settings');
      if (resp?.platform) {
        setPlatformSettings(prev => ({ ...prev, ...resp.platform }));
      }
      if (resp?.payments) {
        setPaymentSettings(prev => ({ ...prev, ...resp.payments }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await apiClient.put<any>('/admin/settings', {
        platform: platformSettings,
        payments: paymentSettings
      });
      toast({
        title: 'Settings Saved',
        description: 'Platform settings have been updated successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const settingsSections = [
    {
      title: 'Delivery Settings',
      description: 'Manage delivery fees, zones, and pricing',
      icon: Truck,
      link: '/admin/delivery-settings',
      badge: 'New'
    },
    {
      title: 'Revenue & Commissions',
      description: 'Configure platform fees and seller payouts',
      icon: DollarSign,
      link: '/admin/revenue-config'
    },
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      link: '/admin/users'
    },
    {
      title: 'Payment Dashboard',
      description: 'View transactions and process refunds',
      icon: DollarSign,
      link: '/admin/payment-dashboard'
    },
    {
      title: 'Legal & Compliance',
      description: 'Manage terms, policies, and compliance',
      icon: Shield,
      link: '/admin/compliance'
    },
    {
      title: 'Data Protection',
      description: 'Privacy settings and data management',
      icon: Lock,
      link: '/admin/data-protection'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure platform settings and preferences
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsSections.map((section, index) => {
          const IconComponent = section.icon;
          return (
            <Link key={index} to={section.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <IconComponent className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{section.title}</h3>
                        {section.badge && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            {section.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Tabs defaultValue="platform" className="w-full">
        <TabsList>
          <TabsTrigger value="platform">
            <Globe className="h-4 w-4 mr-2" />
            Platform
          </TabsTrigger>
          <TabsTrigger value="payments">
            <DollarSign className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Platform Settings Tab */}
        <TabsContent value="platform" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                General platform configuration and features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Maintenance Mode */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Maintenance Mode</Label>
                  <p className="text-sm text-gray-500">
                    Temporarily disable the platform for maintenance
                  </p>
                </div>
                <Switch
                  checked={platformSettings.maintenance_mode}
                  onCheckedChange={(checked) => 
                    setPlatformSettings(prev => ({ ...prev, maintenance_mode: checked }))
                  }
                />
              </div>

              {platformSettings.maintenance_mode && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Platform is in maintenance mode. Users cannot access the site.
                  </p>
                </div>
              )}

              <Separator />

              {/* Registration Settings */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">User Registration</Label>
                  <p className="text-sm text-gray-500">
                    Allow new users to create accounts
                  </p>
                </div>
                <Switch
                  checked={platformSettings.registration_enabled}
                  onCheckedChange={(checked) => 
                    setPlatformSettings(prev => ({ ...prev, registration_enabled: checked }))
                  }
                />
              </div>

              <Separator />

              {/* Verification Settings */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Verification Required</Label>
                  <p className="text-sm text-gray-500">
                    Users must verify email before accessing features
                  </p>
                </div>
                <Switch
                  checked={platformSettings.email_verification_required}
                  onCheckedChange={(checked) => 
                    setPlatformSettings(prev => ({ ...prev, email_verification_required: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Phone Verification Required</Label>
                  <p className="text-sm text-gray-500">
                    Users must verify phone number
                  </p>
                </div>
                <Switch
                  checked={platformSettings.phone_verification_required}
                  onCheckedChange={(checked) => 
                    setPlatformSettings(prev => ({ ...prev, phone_verification_required: checked }))
                  }
                />
              </div>

              <Separator />

              {/* Approval Settings */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-approve Customers</Label>
                  <p className="text-sm text-gray-500">
                    Automatically approve customer accounts
                  </p>
                </div>
                <Switch
                  checked={platformSettings.auto_approve_customers}
                  onCheckedChange={(checked) => 
                    setPlatformSettings(prev => ({ ...prev, auto_approve_customers: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Require Seller Approval</Label>
                  <p className="text-sm text-gray-500">
                    Sellers must be approved by admin before selling
                  </p>
                </div>
                <Switch
                  checked={platformSettings.require_seller_approval}
                  onCheckedChange={(checked) => 
                    setPlatformSettings(prev => ({ ...prev, require_seller_approval: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure payment processing and financial settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Select 
                    value={paymentSettings.default_currency}
                    onValueChange={(value) => 
                      setPaymentSettings(prev => ({ ...prev, default_currency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Processing Fee (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={paymentSettings.processing_fee_percent}
                    onChange={(e) => 
                      setPaymentSettings(prev => ({ ...prev, processing_fee_percent: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Escrow</Label>
                  <p className="text-sm text-gray-500">
                    Hold payments in escrow until order delivery
                  </p>
                </div>
                <Switch
                  checked={paymentSettings.enable_escrow}
                  onCheckedChange={(checked) => 
                    setPaymentSettings(prev => ({ ...prev, enable_escrow: checked }))
                  }
                />
              </div>

              {paymentSettings.enable_escrow && (
                <div className="space-y-2">
                  <Label>Escrow Release Time (hours)</Label>
                  <Input
                    type="number"
                    value={paymentSettings.escrow_release_hours}
                    onChange={(e) => 
                      setPaymentSettings(prev => ({ ...prev, escrow_release_hours: Number(e.target.value) }))
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Time after delivery confirmation before releasing funds to seller
                  </p>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Minimum Withdrawal (₦)</Label>
                  <Input
                    type="number"
                    value={paymentSettings.minimum_withdrawal}
                    onChange={(e) => 
                      setPaymentSettings(prev => ({ ...prev, minimum_withdrawal: Number(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Maximum Withdrawal (₦)</Label>
                  <Input
                    type="number"
                    value={paymentSettings.maximum_withdrawal}
                    onChange={(e) => 
                      setPaymentSettings(prev => ({ ...prev, maximum_withdrawal: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure email and push notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Order Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Send notifications for new orders
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">User Registration Alerts</Label>
                  <p className="text-sm text-gray-500">
                    Alert admins when new users register
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Payment Alerts</Label>
                  <p className="text-sm text-gray-500">
                    Notify for successful payments and refunds
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">System Alerts</Label>
                  <p className="text-sm text-gray-500">
                    Critical system notifications
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
