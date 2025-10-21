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
  MapPin, 
  Phone, 
  Mail, 
  Camera,
  ShoppingBag,
  Heart,
  Bell,
  CreditCard,
  Gift,
  Star,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Download,
  Eye
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  orderDate: string;
  items: Array<{
    id: string;
    productTitle: string;
    productImage: string;
    quantity: number;
    price: number;
    seller: string;
  }>;
}

interface CustomerProfile {
  id: string;
  userId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    avatar?: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    sameAsShipping: boolean;
  };
  preferences: {
    language: string;
    currency: string;
    timezone: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
  };
  loyaltyProgram: {
    points: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    lifetimeSpent: number;
    nextTierRequirement: number;
  };
  paymentMethods: Array<{
    id: string;
    type: 'card' | 'bank' | 'mobile';
    name: string;
    last4: string;
    isDefault: boolean;
    verified: boolean;
  }>;
  orderHistory: CustomerOrder[];
  wishlist: Array<{
    id: string;
    productId: string;
    productTitle: string;
    productImage: string;
    price: number;
    addedAt: string;
    inStock: boolean;
  }>;
  reviews: Array<{
    id: string;
    orderId: string;
    productId: string;
    productTitle: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  statistics: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    favoriteCategory: string;
    memberSince: string;
  };
}

const CustomerProfile: React.FC = () => {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
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
      
      // Mock customer profile data
      const mockProfile: CustomerProfile = {
        id: 'customer-profile-1',
        userId: user!.id,
        personalInfo: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: user?.email || 'sarah.johnson@example.com',
          phone: '+234-801-234-5678',
          dateOfBirth: '1990-05-15',
          gender: 'female',
          avatar: '/api/placeholder/100/100'
        },
        shippingAddress: {
          street: '45 Admiralty Way',
          city: 'Lekki',
          state: 'Lagos State',
          postalCode: '105102',
          country: 'Nigeria',
          isDefault: true
        },
        billingAddress: {
          street: '45 Admiralty Way',
          city: 'Lekki', 
          state: 'Lagos State',
          postalCode: '105102',
          country: 'Nigeria',
          sameAsShipping: true
        },
        preferences: {
          language: 'en',
          currency: 'NGN',
          timezone: 'Africa/Lagos',
          emailNotifications: true,
          smsNotifications: true,
          pushNotifications: true,
          marketingEmails: false
        },
        loyaltyProgram: {
          points: 2450,
          tier: 'silver',
          lifetimeSpent: 485000,
          nextTierRequirement: 500000
        },
        paymentMethods: [
          {
            id: 'pm-1',
            type: 'card',
            name: 'Visa ending in 4532',
            last4: '4532',
            isDefault: true,
            verified: true
          },
          {
            id: 'pm-2',
            type: 'mobile',
            name: 'Paystack Wallet',
            last4: '5678',
            isDefault: false,
            verified: true
          }
        ],
        orderHistory: [
          {
            id: 'order-1',
            orderNumber: 'ORD-2024-001',
            status: 'delivered',
            totalAmount: 125000,
            orderDate: '2024-01-15',
            items: [
              {
                id: 'item-1',
                productTitle: 'iPhone 14 Pro Max',
                productImage: '/api/placeholder/80/80',
                quantity: 1,
                price: 125000,
                seller: 'Tech Store Lagos'
              }
            ]
          },
          {
            id: 'order-2',
            orderNumber: 'ORD-2024-002',
            status: 'shipped',
            totalAmount: 35000,
            orderDate: '2024-01-20',
            items: [
              {
                id: 'item-2',
                productTitle: 'Wireless Headphones',
                productImage: '/api/placeholder/80/80',
                quantity: 2,
                price: 17500,
                seller: 'Audio World'
              }
            ]
          }
        ],
        wishlist: [
          {
            id: 'wish-1',
            productId: 'prod-1',
            productTitle: 'MacBook Pro M3',
            productImage: '/api/placeholder/80/80',
            price: 850000,
            addedAt: '2024-01-10',
            inStock: true
          },
          {
            id: 'wish-2',
            productId: 'prod-2',
            productTitle: 'Gaming Console',
            productImage: '/api/placeholder/80/80',
            price: 320000,
            addedAt: '2024-01-12',
            inStock: false
          }
        ],
        reviews: [
          {
            id: 'review-1',
            orderId: 'order-1',
            productId: 'prod-1',
            productTitle: 'iPhone 14 Pro Max',
            rating: 5,
            comment: 'Excellent product, fast delivery!',
            createdAt: '2024-01-18'
          }
        ],
        statistics: {
          totalOrders: 15,
          totalSpent: 485000,
          averageOrderValue: 32333,
          favoriteCategory: 'Electronics',
          memberSince: '2023-06-15'
        }
      };

      setProfile(mockProfile);
    } catch (error) {
      toast.error('Failed to load profile');
      console.error('Profile loading error:', error);
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
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (updates: Partial<CustomerProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'shipped':
        return <Package className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'text-purple-600';
      case 'gold':
        return 'text-yellow-600';
      case 'silver':
        return 'text-gray-600';
      default:
        return 'text-orange-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p>Profile not found</p>
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
                  alt="Profile"
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
                <p className="text-gray-600">{profile.personalInfo.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Gift className={`w-4 h-4 ${getTierColor(profile.loyaltyProgram.tier)}`} />
                    <span className={`text-sm font-medium capitalize ${getTierColor(profile.loyaltyProgram.tier)}`}>
                      {profile.loyaltyProgram.tier} Member
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">
                      {profile.loyaltyProgram.points.toLocaleString()} points
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Data
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
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your basic account information</CardDescription>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profile.personalInfo.dateOfBirth}
                      onChange={(e) => updateProfile({
                        personalInfo: { ...profile.personalInfo, dateOfBirth: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={profile.personalInfo.gender}
                      onValueChange={(value) => updateProfile({
                        personalInfo: { ...profile.personalInfo, gender: value as any }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loyalty Program */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Loyalty Program
                </CardTitle>
                <CardDescription>Your membership status and rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {profile.loyaltyProgram.points.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Points</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold capitalize ${getTierColor(profile.loyaltyProgram.tier)}`}>
                      {profile.loyaltyProgram.tier}
                    </p>
                    <p className="text-sm text-gray-600">Tier</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      ₦{profile.loyaltyProgram.lifetimeSpent.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Lifetime Spent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      ₦{(profile.loyaltyProgram.nextTierRequirement - profile.loyaltyProgram.lifetimeSpent).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">To Next Tier</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
                <CardDescription>Your default shipping address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={profile.shippingAddress.street}
                    onChange={(e) => updateProfile({
                      shippingAddress: { ...profile.shippingAddress, street: e.target.value }
                    })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profile.shippingAddress.city}
                      onChange={(e) => updateProfile({
                        shippingAddress: { ...profile.shippingAddress, city: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={profile.shippingAddress.state}
                      onChange={(e) => updateProfile({
                        shippingAddress: { ...profile.shippingAddress, state: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={profile.shippingAddress.postalCode}
                      onChange={(e) => updateProfile({
                        shippingAddress: { ...profile.shippingAddress, postalCode: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Order History
                </CardTitle>
                <CardDescription>Your recent purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.orderHistory.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{order.orderNumber}</h3>
                          <Badge className={getOrderStatusColor(order.status)}>
                            <div className="flex items-center gap-1">
                              {getOrderStatusIcon(order.status)}
                              <span className="capitalize">{order.status}</span>
                            </div>
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₦{order.totalAmount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 text-sm">
                            <img
                              src={item.productImage}
                              alt={item.productTitle}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{item.productTitle}</p>
                              <p className="text-gray-600">Quantity: {item.quantity} • ₦{item.price.toLocaleString()} each</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        {order.status === 'delivered' && (
                          <Button size="sm" variant="outline">
                            Leave Review
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Wishlist
                </CardTitle>
                <CardDescription>Items you want to buy later</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.wishlist.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        className="w-full h-40 object-cover rounded mb-3"
                      />
                      <h3 className="font-medium mb-2">{item.productTitle}</h3>
                      <p className="text-lg font-bold text-primary mb-2">
                        ₦{item.price.toLocaleString()}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" disabled={!item.inStock}>
                          {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>Manage your payment options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <div className="flex items-center gap-2">
                            {method.isDefault && (
                              <Badge variant="secondary" className="text-xs">Default</Badge>
                            )}
                            {method.verified && (
                              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Remove</Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Control how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive order updates via email</p>
                    </div>
                    <Switch
                      checked={profile.preferences.emailNotifications}
                      onCheckedChange={(checked) => updateProfile({
                        preferences: { ...profile.preferences, emailNotifications: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Receive SMS updates for important events</p>
                    </div>
                    <Switch
                      checked={profile.preferences.smsNotifications}
                      onCheckedChange={(checked) => updateProfile({
                        preferences: { ...profile.preferences, smsNotifications: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                    </div>
                    <Switch
                      checked={profile.preferences.pushNotifications}
                      onCheckedChange={(checked) => updateProfile({
                        preferences: { ...profile.preferences, pushNotifications: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-gray-600">Receive promotional emails and offers</p>
                    </div>
                    <Switch
                      checked={profile.preferences.marketingEmails}
                      onCheckedChange={(checked) => updateProfile({
                        preferences: { ...profile.preferences, marketingEmails: checked }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>General account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={profile.preferences.currency}
                      onValueChange={(value) => updateProfile({
                        preferences: { ...profile.preferences, currency: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                  <p className="text-xs text-gray-600 mt-1">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerProfile;