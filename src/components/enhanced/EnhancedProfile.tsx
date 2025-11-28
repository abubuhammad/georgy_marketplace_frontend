import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedDashboardHeader } from './EnhancedDashboardHeader';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User, Edit, Camera, Phone, Mail, MapPin, Calendar, 
  Shield, Key, Bell, CreditCard, Activity, BarChart3,
  Settings, Download, Upload, Trash2, Star, Award,
  TrendingUp, Clock, Package, Heart, MessageCircle, Plus
} from 'lucide-react';

interface ProfileData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    bio?: string;
    avatar?: string;
    location?: string;
  };
  addresses: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    type: 'shipping' | 'billing';
  }[];
  preferences: {
    language: string;
    currency: string;
    timezone: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    loginHistory: Array<{
      date: string;
      location: string;
      device: string;
    }>;
  };
  stats: {
    memberSince: string;
    totalActivity: number;
    profileViews: number;
    completionRate: number;
  };
}

interface EnhancedProfileProps {
  role?: string;
  customActions?: any[];
  additionalTabTriggers?: React.ReactNode;
  additionalTabsContent?: React.ReactNode;
  roleSpecificContent?: React.ReactNode;
}

export const EnhancedProfile: React.FC<EnhancedProfileProps> = ({
  role,
  customActions = [],
  additionalTabTriggers,
  additionalTabsContent,
  roleSpecificContent
}) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
    type: 'shipping' as const
  });
  const [show2FAForm, setShow2FAForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [twoFASetup, setTwoFASetup] = useState({
    qrCodeDataUrl: '' as string,
    secret: '' as string,
    otpauthUrl: '' as string,
    code: '' as string,
    loading: false,
    error: '' as string,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [profileData, setProfileData] = useState<ProfileData>({
    personalInfo: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
      dateOfBirth: '',
      bio: '',
      avatar: user?.avatar || '',
      location: '',
    },
    addresses: [],
    preferences: {
      language: 'en',
      currency: 'USD',
      timezone: 'UTC',
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      marketingEmails: false,
    },
    security: {
      twoFactorEnabled: false,
      lastPasswordChange: '2024-01-01',
      loginHistory: []
    },
    stats: {
      memberSince: user?.createdAt || '2024-01-01',
      totalActivity: 0,
      profileViews: 0,
      completionRate: 45
    }
  });

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      
      // Convert to base64 or upload directly
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        // Update local state
        setProfileData(prev => ({
          ...prev,
          personalInfo: { ...prev.personalInfo, avatar: base64 }
        }));
        
        toast.success('Profile image updated! Click "Save Changes" to save.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to update profile image');
    } finally {
      setSaving(false);
    }
  };

  // Handle address add/edit
  const handleAddAddress = () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state) {
      toast.error('Please fill in all address fields');
      return;
    }

    try {
      if (editingAddressIndex !== null) {
        // Update existing address
        setProfileData(prev => ({
          ...prev,
          addresses: prev.addresses.map((addr, idx) =>
            idx === editingAddressIndex ? newAddress : addr
          )
        }));
        toast.success('Address updated! Click "Save Changes" to save.');
      } else {
        // Add new address
        setProfileData(prev => ({
          ...prev,
          addresses: [...prev.addresses, newAddress]
        }));
        toast.success('Address added! Click "Save Changes" to save.');
      }
      
      setShowAddressForm(false);
      setEditingAddressIndex(null);
      setNewAddress({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Nigeria',
        type: 'shipping'
      });
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  // Handle address delete
  const handleDeleteAddress = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, idx) => idx !== index)
    }));
    toast.success('Address removed! Click "Save Changes" to save.');
  };

  // Handle address edit
  const handleEditAddress = (index: number) => {
    setNewAddress(profileData.addresses[index]);
    setEditingAddressIndex(index);
    setShowAddressForm(true);
  };

  // Handle two-factor authentication toggle
  const handleToggle2FA = async () => {
    try {
      if (profileData.security.twoFactorEnabled) {
        // Disable 2FA via backend
        const result = await apiClient.disableTwoFactor(true);
        if (!result.success) {
          toast.error(result.error || 'Failed to disable two-factor authentication');
          return;
        }

        setProfileData(prev => ({
          ...prev,
          security: { ...prev.security, twoFactorEnabled: false },
        }));
        toast.success('Two-Factor Authentication disabled');
      } else {
        // Start 2FA setup via backend
        setTwoFASetup(prev => ({ ...prev, loading: true, error: '' }));
        const result = await apiClient.startTwoFactorSetup();
        if (!result.success || !result.data) {
          setTwoFASetup(prev => ({ ...prev, loading: false }));
          toast.error(result.error || 'Failed to start two-factor setup');
          return;
        }

        setTwoFASetup({
          qrCodeDataUrl: result.data.qrCodeDataUrl,
          secret: result.data.secret,
          otpauthUrl: result.data.otpauthUrl,
          code: '',
          loading: false,
          error: '',
        });
        setShow2FAForm(true);
      }
    } catch (error) {
      console.error('2FA toggle error:', error);
      toast.error('Failed to update two-factor authentication');
      setTwoFASetup(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle 2FA setup confirmation
  const handleConfirm2FA = async () => {
    try {
      if (!twoFASetup.code || twoFASetup.code.length !== 6) {
        setTwoFASetup(prev => ({ ...prev, error: 'Please enter the 6-digit code from your authenticator app.' }));
        return;
      }

      setTwoFASetup(prev => ({ ...prev, loading: true, error: '' }));
      const result = await apiClient.verifyTwoFactor(twoFASetup.code);
      if (!result.success || !result.data?.twoFactorAuth) {
        setTwoFASetup(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Invalid verification code. Please try again.',
        }));
        return;
      }

      setProfileData(prev => ({
        ...prev,
        security: { ...prev.security, twoFactorEnabled: true },
      }));
      toast.success('Two-Factor Authentication enabled!');
      setShow2FAForm(false);
      setTwoFASetup({
        qrCodeDataUrl: '',
        secret: '',
        otpauthUrl: '',
        code: '',
        loading: false,
        error: '',
      });
    } catch (error) {
      console.error('2FA confirm error:', error);
      setTwoFASetup(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to enable two-factor authentication. Please try again.',
      }));
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      // In production, this would call the backend API
      // await apiClient.changePassword(passwordData);
      
      setProfileData(prev => ({
        ...prev,
        security: { ...prev.security, lastPasswordChange: new Date().toISOString() }
      }));
      
      toast.success('Password changed successfully! Click "Save Changes" to save.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const getRoleActions = () => {
    const baseActions = [
      {
        label: 'Edit Profile',
        icon: Edit,
        onClick: () => setIsEditing(true),
      },
      {
        label: 'Settings',
        icon: Settings,
        onClick: () => setActiveTab('settings')
      }
    ];

    const roleSpecificActions = {
      customer: [
        { label: 'My Orders', icon: Package, onClick: () => navigate('/orders') },
        { label: 'Wishlist', icon: Heart, onClick: () => navigate('/wishlist') }
      ],
      seller: [
        { label: 'My Products', icon: Package, onClick: () => navigate('/seller/products') },
        { label: 'Analytics', icon: BarChart3, onClick: () => navigate('/seller/analytics') }
      ],
      employer: [
        { label: 'Post Job', icon: Plus, onClick: () => navigate('/jobs/post') },
        { label: 'View Applications', icon: MessageCircle, onClick: () => navigate('/employer/applications') }
      ],
      job_seeker: [
        { label: 'My Applications', icon: Package, onClick: () => navigate('/job-seeker/applications') },
        { label: 'Update Resume', icon: Upload, onClick: () => navigate('/resume/upload') }
      ],
    };

    return [
      ...baseActions,
      ...(roleSpecificActions[role as keyof typeof roleSpecificActions] || []),
      ...customActions
    ];
  };

  const getProfileStats = () => {
    const baseStats = [
      { label: 'Profile Views', value: profileData.stats.profileViews, trend: 'up' as const },
      { label: 'Completion', value: `${profileData.stats.completionRate}%`, trend: 'neutral' as const }
    ];

    const roleStats = {
      seller: [
        { label: 'Products', value: 0, trend: 'up' as const },
        { label: 'Sales', value: 0, trend: 'up' as const }
      ],
      employer: [
        { label: 'Jobs Posted', value: 0, trend: 'neutral' as const },
        { label: 'Applications', value: 0, trend: 'up' as const }
      ]
    };

    return [
      ...baseStats,
      ...(roleStats[role as keyof typeof roleStats] || [])
    ];
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const result = await apiClient.updateProfile(profileData.personalInfo);
      
      if (result.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const calculateCompletionRate = () => {
    const fields = [
      profileData.personalInfo.firstName,
      profileData.personalInfo.lastName,
      profileData.personalInfo.phone,
      profileData.personalInfo.bio,
      profileData.personalInfo.location,
      profileData.addresses.length > 0
    ];
    
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  useEffect(() => {
    const completionRate = calculateCompletionRate();
    setProfileData(prev => ({
      ...prev,
      stats: { ...prev.stats, completionRate }
    }));
  }, [profileData.personalInfo, profileData.addresses]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <CardContent>
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
            <Button onClick={() => navigate('/login')}>Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedDashboardHeader
        title={`${user.firstName}'s Profile`}
        subtitle="Manage your account and preferences"
        user={user}
        actions={getRoleActions()}
        stats={getProfileStats()}
        notifications={3}
        messages={2}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            {additionalTabTriggers}
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profileData.personalInfo.avatar} />
                    <AvatarFallback className="text-2xl">
                      {profileData.personalInfo.firstName?.charAt(0)}
                      {profileData.personalInfo.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setProfileData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, avatar: '' }
                      }))}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.personalInfo.firstName}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, firstName: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.personalInfo.lastName}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, lastName: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.personalInfo.email}
                      disabled={true}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.personalInfo.phone}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, phone: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={profileData.personalInfo.bio}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, bio: e.target.value }
                    }))}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Profile Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Your profile is {profileData.stats.completionRate}% complete
                    </span>
                    <Badge variant={profileData.stats.completionRate >= 80 ? "default" : "secondary"}>
                      {profileData.stats.completionRate >= 80 ? "Excellent" : "Needs Work"}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${profileData.stats.completionRate}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {roleSpecificContent}
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about your account
                      </p>
                    </div>
                    <Switch
                      checked={profileData.preferences.emailNotifications}
                      onCheckedChange={(checked) => setProfileData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, emailNotifications: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get text messages for urgent updates
                      </p>
                    </div>
                    <Switch
                      checked={profileData.preferences.smsNotifications}
                      onCheckedChange={(checked) => setProfileData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, smsNotifications: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive promotional emails and offers
                      </p>
                    </div>
                    <Switch
                      checked={profileData.preferences.marketingEmails}
                      onCheckedChange={(checked) => setProfileData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, marketingEmails: checked }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your account security and privacy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Two-Factor Authentication */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                      {profileData.security.twoFactorEnabled && (
                        <p className="text-sm text-green-600 mt-1">✓ Enabled</p>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleToggle2FA}
                    >
                      {profileData.security.twoFactorEnabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>

                  {/* 2FA Setup Form */}
                  <AnimatePresence>
                    {show2FAForm && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="border rounded-lg p-4 bg-blue-50"
                      >
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium mb-2">Set Up Two-Factor Authentication</h5>
                            <p className="text-sm text-gray-600 mb-2">
                              Step 1: Scan this QR code with Google Authenticator, Authy, or any TOTP-compatible app.
                            </p>
                            {twoFASetup.qrCodeDataUrl && (
                              <div className="flex justify-center mb-3">
                                <img
                                  src={twoFASetup.qrCodeDataUrl}
                                  alt="2FA QR Code"
                                  className="h-40 w-40 rounded bg-white p-2 shadow"
                                />
                              </div>
                            )}
                            <p className="text-sm text-gray-600 mb-1">
                              Step 2: If you can&apos;t scan the QR code, enter this key manually in your app:
                            </p>
                            {twoFASetup.secret && (
                              <div className="font-mono text-sm break-all bg-white/70 rounded px-2 py-1 border inline-block">
                                {twoFASetup.secret}
                              </div>
                            )}
                            <p className="text-sm text-gray-600 mt-3">
                              Step 3: Enter the 6-digit code from your authenticator app to verify and enable 2FA.
                            </p>
                          </div>
                          <div>
                            <Input
                              placeholder="000000"
                              maxLength={6}
                              value={twoFASetup.code}
                              onChange={(e) =>
                                setTwoFASetup(prev => ({
                                  ...prev,
                                  code: e.target.value.replace(/[^0-9]/g, '').slice(0, 6),
                                }))
                              }
                              className="text-center font-mono text-lg tracking-widest bg-white"
                            />
                            {twoFASetup.error && (
                              <p className="text-xs text-red-600 mt-1">{twoFASetup.error}</p>
                            )}
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShow2FAForm(false);
                                setTwoFASetup({
                                  qrCodeDataUrl: '',
                                  secret: '',
                                  otpauthUrl: '',
                                  code: '',
                                  loading: false,
                                  error: '',
                                });
                              }}
                              disabled={twoFASetup.loading}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleConfirm2FA}
                              disabled={twoFASetup.loading}
                            >
                              {twoFASetup.loading ? 'Verifying...' : 'Verify & Enable'}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Change Password */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Change Password</h4>
                      <p className="text-sm text-muted-foreground">
                        Last changed: {new Date(profileData.security.lastPasswordChange).toLocaleDateString()}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Change
                    </Button>
                  </div>

                  {/* Password Change Form */}
                  <AnimatePresence>
                    {showPasswordForm && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="border rounded-lg p-4 bg-blue-50"
                      >
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="current-pwd">Current Password</Label>
                            <Input
                              id="current-pwd"
                              type="password"
                              placeholder="Enter current password"
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({
                                ...passwordData,
                                currentPassword: e.target.value
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-pwd">New Password</Label>
                            <Input
                              id="new-pwd"
                              type="password"
                              placeholder="Enter new password (min 8 characters)"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-pwd">Confirm Password</Label>
                            <Input
                              id="confirm-pwd"
                              type="password"
                              placeholder="Confirm new password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value
                              })}
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowPasswordForm(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleChangePassword}
                            >
                              Change Password
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Account Activity
                </CardTitle>
                <CardDescription>View your recent account activity and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {new Date(profileData.stats.memberSince).getFullYear()}
                      </div>
                      <div className="text-sm text-gray-600">Member Since</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {profileData.stats.totalActivity}
                      </div>
                      <div className="text-sm text-gray-600">Total Activity</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {profileData.stats.profileViews}
                      </div>
                      <div className="text-sm text-gray-600">Profile Views</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="space-y-6">
            {/* Address Form Modal */}
            <AnimatePresence>
              {showAddressForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {editingAddressIndex !== null ? 'Edit Address' : 'Add New Address'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="street">Street Address</Label>
                          <Input
                            id="street"
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                            placeholder="123 Main St"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            placeholder="Lagos"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            placeholder="Lagos"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postal">Postal Code</Label>
                          <Input
                            id="postal"
                            value={newAddress.postalCode}
                            onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                            placeholder="100001"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Address Type</Label>
                        <select
                          id="type"
                          value={newAddress.type}
                          onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value as 'shipping' | 'billing' })}
                          className="w-full border rounded px-3 py-2"
                        >
                          <option value="shipping">Shipping</option>
                          <option value="billing">Billing</option>
                        </select>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddressIndex(null);
                            setNewAddress({
                              street: '',
                              city: '',
                              state: '',
                              postalCode: '',
                              country: 'Nigeria',
                              type: 'shipping'
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddAddress}>
                          {editingAddressIndex !== null ? 'Update Address' : 'Add Address'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Addresses
                </CardTitle>
                <CardDescription>Manage your shipping and billing addresses</CardDescription>
              </CardHeader>
              <CardContent>
                {profileData.addresses.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses added</h3>
                    <p className="text-gray-500 mb-4">Add your shipping and billing addresses for faster checkout.</p>
                    <Button onClick={() => setShowAddressForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profileData.addresses.map((address, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={address.type === 'shipping' ? 'default' : 'secondary'}>
                                {address.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {address.street}<br />
                              {address.city}, {address.state} {address.postalCode}<br />
                              {address.country}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditAddress(index)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteAddress(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowAddressForm(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Address
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>Manage your account preferences and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Language</h4>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred language
                      </p>
                    </div>
                    <select 
                      value={profileData.preferences.language}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, language: e.target.value }
                      }))}
                      className="border rounded px-3 py-1 text-sm"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Timezone</h4>
                      <p className="text-sm text-muted-foreground">
                        Set your local timezone
                      </p>
                    </div>
                    <select 
                      value={profileData.preferences.timezone}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, timezone: e.target.value }
                      }))}
                      className="border rounded px-3 py-1 text-sm"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="CST">Central Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="GMT">GMT (London)</option>
                      <option value="WAT">WAT (West Africa Time)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Currency</h4>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred currency
                      </p>
                    </div>
                    <select 
                      value={profileData.preferences.currency}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, currency: e.target.value }
                      }))}
                      className="border rounded px-3 py-1 text-sm"
                    >
                      <option value="NGN">NGN (₦) - Nigerian Naira</option>
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                      <option value="CAD">CAD ($) - Canadian Dollar</option>
                      <option value="AUD">AUD ($) - Australian Dollar</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {additionalTabsContent}
        </Tabs>
      </div>
    </div>
  );
};