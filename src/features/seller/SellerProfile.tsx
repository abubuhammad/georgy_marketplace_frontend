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
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Camera,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  Upload,
  Star,
  Award,
  Settings,
  CreditCard,
  FileText,
  Eye,
  Download
} from 'lucide-react';
import { SellerProfile as SellerProfileType, VerificationDocument, VerificationBadge } from './types';
import { sellerService } from '@/services/sellerService';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SellerProfile: React.FC = () => {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<SellerProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    console.log('SellerProfile useEffect - user:', user);
    if (user?.id) {
      console.log('Loading profile for user ID:', user.id);
      loadProfile();
    } else {
      console.log('No user ID available');
    }
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      console.log('Starting profile load for user:', user?.id);
      setLoading(true);
      const profileData = await sellerService.getSellerProfile(user!.id);
      console.log('Profile data received:', profileData);
      setProfile(profileData);
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
      await sellerService.updateSellerProfile(user!.id, profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (updates: Partial<SellerProfileType>) => {
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  const getVerificationStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  const getVerificationProgress = () => {
    if (!profile?.verification) return 0;
    
    const totalDocuments = 5; // business_license, tax_id, identity, address_proof, bank_statement
    const approvedDocuments = profile.verification.documentsSubmitted
      .filter(doc => doc.status === 'approved').length;
    
    return (approvedDocuments / totalDocuments) * 100;
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
                  src={profile.branding?.logo || '/api/placeholder/80/80'}
                  alt="Business Logo"
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
                <h1 className="text-2xl font-bold text-gray-900">{profile.businessName}</h1>
                <p className="text-gray-600">{profile.businessDescription}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    {getVerificationStatusIcon(profile.verification.status)}
                    <span className="text-sm font-medium capitalize">
                      {profile.verification.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm">{profile.statistics.averageRating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">
                      ({profile.statistics.totalReviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={loadProfile}>
                <Eye className="w-4 h-4 mr-2" />
                Preview Store
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="contact">Contact & Address</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Business Information
                </CardTitle>
                <CardDescription>Basic information about your business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={profile.businessName}
                      onChange={(e) => updateProfile({ businessName: e.target.value })}
                      placeholder="Your business name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select 
                      value={profile.businessType} 
                      onValueChange={(value) => updateProfile({ businessType: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="small_business">Small Business</SelectItem>
                        <SelectItem value="corporation">Corporation</SelectItem>
                        <SelectItem value="nonprofit">Nonprofit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="businessDescription">Business Description</Label>
                  <Textarea
                    id="businessDescription"
                    value={profile.businessDescription}
                    onChange={(e) => updateProfile({ businessDescription: e.target.value })}
                    placeholder="Describe your business..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                      id="taxId"
                      value={profile.taxInfo.taxId || ''}
                      onChange={(e) => updateProfile({
                        taxInfo: { ...profile.taxInfo, taxId: e.target.value }
                      })}
                      placeholder="Your tax identification number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessLicense">Business License</Label>
                    <Input
                      id="businessLicense"
                      value={profile.taxInfo.businessLicense || ''}
                      onChange={(e) => updateProfile({
                        taxInfo: { ...profile.taxInfo, businessLicense: e.target.value }
                      })}
                      placeholder="Business license number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle>Business Statistics</CardTitle>
                <CardDescription>Your business performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      ₦{profile.statistics.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{profile.statistics.totalOrders}</p>
                    <p className="text-sm text-gray-600">Total Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{profile.statistics.totalCustomers}</p>
                    <p className="text-sm text-gray-600">Customers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{profile.statistics.onTimeDeliveryRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">On-time Delivery</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>How customers can reach you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessEmail">Business Email</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={profile.contactInfo.businessEmail}
                      onChange={(e) => updateProfile({
                        contactInfo: { ...profile.contactInfo, businessEmail: e.target.value }
                      })}
                      placeholder="business@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={profile.contactInfo.supportEmail || ''}
                      onChange={(e) => updateProfile({
                        contactInfo: { ...profile.contactInfo, supportEmail: e.target.value }
                      })}
                      placeholder="support@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryPhone">Primary Phone</Label>
                    <Input
                      id="primaryPhone"
                      value={profile.contactInfo.primaryPhone}
                      onChange={(e) => updateProfile({
                        contactInfo: { ...profile.contactInfo, primaryPhone: e.target.value }
                      })}
                      placeholder="+234 xxx xxx xxxx"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={profile.contactInfo.whatsapp || ''}
                      onChange={(e) => updateProfile({
                        contactInfo: { ...profile.contactInfo, whatsapp: e.target.value }
                      })}
                      placeholder="+234 xxx xxx xxxx"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profile.contactInfo.website || ''}
                    onChange={(e) => updateProfile({
                      contactInfo: { ...profile.contactInfo, website: e.target.value }
                    })}
                    placeholder="https://www.yourwebsite.com"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Business Address
                </CardTitle>
                <CardDescription>Your physical business location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={profile.businessAddress.street}
                    onChange={(e) => updateProfile({
                      businessAddress: { ...profile.businessAddress, street: e.target.value }
                    })}
                    placeholder="123 Business Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profile.businessAddress.city}
                      onChange={(e) => updateProfile({
                        businessAddress: { ...profile.businessAddress, city: e.target.value }
                      })}
                      placeholder="Lagos"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={profile.businessAddress.state}
                      onChange={(e) => updateProfile({
                        businessAddress: { ...profile.businessAddress, state: e.target.value }
                      })}
                      placeholder="Lagos State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={profile.businessAddress.postalCode}
                      onChange={(e) => updateProfile({
                        businessAddress: { ...profile.businessAddress, postalCode: e.target.value }
                      })}
                      placeholder="100001"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Verification Status
                </CardTitle>
                <CardDescription>Complete verification to build customer trust</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Verification Progress</h3>
                      <p className="text-sm text-gray-600">
                        {profile.verification.documentsSubmitted.filter(d => d.status === 'approved').length} of 5 documents verified
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={profile.verification.status === 'verified' ? 'default' : 'secondary'}>
                        {profile.verification.status}
                      </Badge>
                    </div>
                  </div>

                  <Progress value={getVerificationProgress()} className="w-full" />

                  {/* Documents */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Required Documents</h4>
                    {profile.verification.documentsSubmitted.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium capitalize">{doc.type.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-600">{doc.fileName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            doc.status === 'approved' ? 'default' : 
                            doc.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {doc.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Verification Badges */}
                  {profile.verification.badges.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Earned Badges</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.verification.badges.map((badge) => (
                          <div key={badge.id} className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <Award className="w-8 h-8 text-green-600" />
                            <div>
                              <p className="font-medium">{badge.title}</p>
                              <p className="text-sm text-gray-600">{badge.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Brand Identity
                </CardTitle>
                <CardDescription>Customize how your brand appears to customers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Business Logo</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <img
                        src={profile.branding?.logo || '/api/placeholder/100/100'}
                        alt="Logo"
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Cover Image</Label>
                    <div className="mt-2">
                      <div className="w-full h-20 bg-gray-100 rounded-lg border-2 border-dashed flex items-center justify-center">
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Cover
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={profile.branding?.primaryColor || '#DC2626'}
                      onChange={(e) => updateProfile({
                        branding: { ...profile.branding || {}, primaryColor: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={profile.branding?.secondaryColor || '#FF6B35'}
                      onChange={(e) => updateProfile({
                        branding: { ...profile.branding || {}, secondaryColor: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="slogan">Business Slogan</Label>
                  <Input
                    id="slogan"
                    value={profile.branding?.slogan || ''}
                    onChange={(e) => updateProfile({
                      branding: { ...profile.branding || {}, slogan: e.target.value }
                    })}
                    placeholder="Your business slogan or tagline"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Business Settings
                </CardTitle>
                <CardDescription>Configure your business operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Accept Orders</Label>
                      <p className="text-sm text-gray-600">Automatically accept incoming orders</p>
                    </div>
                    <Switch
                      checked={profile.settings.autoAcceptOrders}
                      onCheckedChange={(checked) => updateProfile({
                        settings: { ...profile.settings, autoAcceptOrders: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Confirm Payment</Label>
                      <p className="text-sm text-gray-600">Automatically confirm payment receipt</p>
                    </div>
                    <Switch
                      checked={profile.settings.autoConfirmPayment}
                      onCheckedChange={(checked) => updateProfile({
                        settings: { ...profile.settings, autoConfirmPayment: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Notifications</Label>
                      <p className="text-sm text-gray-600">Receive email and SMS notifications</p>
                    </div>
                    <Switch
                      checked={profile.settings.enableNotifications}
                      onCheckedChange={(checked) => updateProfile({
                        settings: { ...profile.settings, enableNotifications: checked }
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Preferred Currency</Label>
                    <Select 
                      value={profile.settings.currency} 
                      onValueChange={(value) => updateProfile({
                        settings: { ...profile.settings, currency: value }
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
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={profile.settings.timezone} 
                      onValueChange={(value) => updateProfile({
                        settings: { ...profile.settings, timezone: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Lagos">West Africa Time (WAT)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payout Information
                </CardTitle>
                <CardDescription>Where you want to receive your payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input
                      id="accountName"
                      value={profile.bankDetails.accountName}
                      onChange={(e) => updateProfile({
                        bankDetails: { ...profile.bankDetails, accountName: e.target.value }
                      })}
                      placeholder="Account holder name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={profile.bankDetails.accountNumber}
                      onChange={(e) => updateProfile({
                        bankDetails: { ...profile.bankDetails, accountNumber: e.target.value }
                      })}
                      placeholder="Account number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={profile.bankDetails.bankName}
                      onChange={(e) => updateProfile({
                        bankDetails: { ...profile.bankDetails, bankName: e.target.value }
                      })}
                      placeholder="Your bank name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankCode">Bank Code</Label>
                    <Input
                      id="bankCode"
                      value={profile.bankDetails.bankCode}
                      onChange={(e) => updateProfile({
                        bankDetails: { ...profile.bankDetails, bankCode: e.target.value }
                      })}
                      placeholder="Bank routing code"
                    />
                  </div>
                </div>

                {profile.bankDetails.verified && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your bank details have been verified and are ready for payouts.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerProfile;
