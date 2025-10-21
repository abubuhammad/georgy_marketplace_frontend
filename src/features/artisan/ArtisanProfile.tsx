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
  Wrench,
  Calendar,
  Clock,
  Star,
  Award,
  Image,
  Settings,
  CreditCard,
  FileText,
  Shield,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ArtisanService {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  duration: number; // in minutes
  images: string[];
  isActive: boolean;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  completedDate: string;
  clientName?: string;
  rating?: number;
  category: string;
}

interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  clientName: string;
  clientPhone: string;
  scheduledDate: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  totalAmount: number;
  notes?: string;
}

interface ArtisanProfile {
  id: string;
  userId: string;
  businessInfo: {
    businessName: string;
    businessDescription: string;
    category: string;
    specialties: string[];
    yearsExperience: number;
    avatar?: string;
    coverImage?: string;
  };
  contactInfo: {
    primaryPhone: string;
    businessEmail: string;
    whatsapp?: string;
    website?: string;
  };
  businessAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    serviceRadius: number; // in kilometers
  };
  services: ArtisanService[];
  portfolio: PortfolioItem[];
  bookings: Booking[];
  availability: {
    workingHours: Array<{
      day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    }>;
    isAvailableForEmergency: boolean;
    emergencyRate: number; // percentage increase
  };
  verification: {
    status: 'pending' | 'verified' | 'rejected';
    documentsSubmitted: Array<{
      id: string;
      type: 'identity' | 'certification' | 'insurance' | 'business_license';
      fileName: string;
      fileUrl: string;
      status: 'pending' | 'approved' | 'rejected';
      uploadedAt: string;
    }>;
    badges: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      earnedAt: string;
    }>;
  };
  ratings: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  statistics: {
    totalJobs: number;
    completedJobs: number;
    totalEarnings: number;
    responseTime: number; // in minutes
    completionRate: number; // percentage
    clientRetentionRate: number; // percentage
  };
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
    verified: boolean;
  };
  settings: {
    autoAcceptBookings: boolean;
    sendSmsNotifications: boolean;
    requireDeposit: boolean;
    depositPercentage: number;
    cancellationPolicy: string;
  };
}

const ArtisanProfile: React.FC = () => {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<ArtisanProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('business');

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Mock artisan profile data
      const mockProfile: ArtisanProfile = {
        id: 'artisan-profile-1',
        userId: user!.id,
        businessInfo: {
          businessName: 'Master Craft Plumbing',
          businessDescription: 'Professional plumbing and pipe fitting services with over 10 years of experience. We handle residential and commercial projects with quality guarantee.',
          category: 'Plumbing',
          specialties: ['Pipe Installation', 'Leak Repair', 'Drain Cleaning', 'Water Heater Service'],
          yearsExperience: 10,
          avatar: '/api/placeholder/100/100',
          coverImage: '/api/placeholder/800/300'
        },
        contactInfo: {
          primaryPhone: '+234-803-123-4567',
          businessEmail: 'info@mastercraftplumbing.com',
          whatsapp: '+234-803-123-4567',
          website: 'https://mastercraftplumbing.com'
        },
        businessAddress: {
          street: '15 Mechanic Village',
          city: 'Ikeja',
          state: 'Lagos State',
          postalCode: '100271',
          country: 'Nigeria',
          serviceRadius: 25
        },
        services: [
          {
            id: 'service-1',
            title: 'Pipe Installation & Repair',
            description: 'Complete pipe installation and repair services for residential and commercial properties',
            category: 'Plumbing',
            price: 15000,
            duration: 120,
            images: ['/api/placeholder/300/200'],
            isActive: true
          },
          {
            id: 'service-2',
            title: 'Drain Cleaning',
            description: 'Professional drain cleaning and unclogging services',
            category: 'Plumbing',
            price: 8000,
            duration: 60,
            images: ['/api/placeholder/300/200'],
            isActive: true
          }
        ],
        portfolio: [
          {
            id: 'portfolio-1',
            title: 'Commercial Kitchen Installation',
            description: 'Complete plumbing system installation for restaurant kitchen',
            images: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
            completedDate: '2024-01-15',
            clientName: 'Lagos Restaurant',
            rating: 5,
            category: 'Commercial Plumbing'
          },
          {
            id: 'portfolio-2',
            title: 'Residential Bathroom Renovation',
            description: 'Full bathroom plumbing renovation including new fixtures',
            images: ['/api/placeholder/300/200'],
            completedDate: '2024-01-10',
            clientName: 'Mr. Johnson',
            rating: 5,
            category: 'Residential Plumbing'
          }
        ],
        bookings: [
          {
            id: 'booking-1',
            serviceId: 'service-1',
            serviceName: 'Pipe Installation & Repair',
            clientName: 'Sarah Williams',
            clientPhone: '+234-801-234-5678',
            scheduledDate: '2024-02-01T10:00:00Z',
            status: 'confirmed',
            totalAmount: 15000,
            notes: 'Kitchen sink pipe replacement'
          },
          {
            id: 'booking-2',
            serviceId: 'service-2',
            serviceName: 'Drain Cleaning',
            clientName: 'David Chen',
            clientPhone: '+234-802-345-6789',
            scheduledDate: '2024-02-02T14:00:00Z',
            status: 'pending',
            totalAmount: 8000,
            notes: 'Blocked bathroom drain'
          }
        ],
        availability: {
          workingHours: [
            { day: 'monday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
            { day: 'tuesday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
            { day: 'wednesday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
            { day: 'thursday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
            { day: 'friday', isOpen: true, openTime: '08:00', closeTime: '17:00' },
            { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '15:00' },
            { day: 'sunday', isOpen: false, openTime: '', closeTime: '' }
          ],
          isAvailableForEmergency: true,
          emergencyRate: 50 // 50% increase for emergency calls
        },
        verification: {
          status: 'verified',
          documentsSubmitted: [
            {
              id: 'doc-1',
              type: 'identity',
              fileName: 'national_id.pdf',
              fileUrl: '/documents/national_id.pdf',
              status: 'approved',
              uploadedAt: new Date().toISOString()
            },
            {
              id: 'doc-2',
              type: 'certification',
              fileName: 'plumbing_certificate.pdf',
              fileUrl: '/documents/plumbing_cert.pdf',
              status: 'approved',
              uploadedAt: new Date().toISOString()
            }
          ],
          badges: [
            {
              id: 'badge-1',
              type: 'verified_artisan',
              title: 'Verified Artisan',
              description: 'Identity and skills verified by our team',
              earnedAt: new Date().toISOString()
            }
          ]
        },
        ratings: {
          averageRating: 4.8,
          totalReviews: 47,
          ratingDistribution: {
            5: 38,
            4: 7,
            3: 2,
            2: 0,
            1: 0
          }
        },
        statistics: {
          totalJobs: 156,
          completedJobs: 149,
          totalEarnings: 2340000,
          responseTime: 15, // 15 minutes average
          completionRate: 95.5,
          clientRetentionRate: 78.2
        },
        bankDetails: {
          accountName: 'Master Craft Plumbing',
          accountNumber: '1234567890',
          bankName: 'First Bank of Nigeria',
          bankCode: '011',
          verified: true
        },
        settings: {
          autoAcceptBookings: false,
          sendSmsNotifications: true,
          requireDeposit: true,
          depositPercentage: 30,
          cancellationPolicy: 'Free cancellation up to 24 hours before scheduled time'
        }
      };

      setProfile(mockProfile);
    } catch (error) {
      toast.error('Failed to load artisan profile');
      console.error('Artisan profile loading error:', error);
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
      toast.success('Artisan profile updated successfully');
    } catch (error) {
      toast.error('Failed to update artisan profile');
      console.error('Artisan profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (updates: Partial<ArtisanProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
      case 'cancelled':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Wrench className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Loading artisan profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p>Artisan profile not found</p>
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
                  src={profile.businessInfo.avatar || '/api/placeholder/80/80'}
                  alt="Business Avatar"
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
                  {profile.businessInfo.businessName}
                </h1>
                <p className="text-gray-600">{profile.businessInfo.category} • {profile.businessInfo.yearsExperience} years experience</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Shield className={`w-4 h-4 ${profile.verification.status === 'verified' ? 'text-green-500' : 'text-yellow-500'}`} />
                    <span className={`text-sm font-medium capitalize ${profile.verification.status === 'verified' ? 'text-green-700' : 'text-yellow-700'}`}>
                      {profile.verification.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm">
                      {profile.ratings.averageRating.toFixed(1)} ({profile.ratings.totalReviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview Profile
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Business Information
                </CardTitle>
                <CardDescription>Your artisan business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={profile.businessInfo.businessName}
                      onChange={(e) => updateProfile({
                        businessInfo: { ...profile.businessInfo, businessName: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={profile.businessInfo.category}
                      onValueChange={(value) => updateProfile({
                        businessInfo: { ...profile.businessInfo, category: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Plumbing">Plumbing</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                        <SelectItem value="Carpentry">Carpentry</SelectItem>
                        <SelectItem value="Painting">Painting</SelectItem>
                        <SelectItem value="Welding">Welding</SelectItem>
                        <SelectItem value="Air Conditioning">Air Conditioning</SelectItem>
                        <SelectItem value="Roofing">Roofing</SelectItem>
                        <SelectItem value="Tiling">Tiling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessDescription">Business Description</Label>
                  <Textarea
                    id="businessDescription"
                    value={profile.businessInfo.businessDescription}
                    onChange={(e) => updateProfile({
                      businessInfo: { ...profile.businessInfo, businessDescription: e.target.value }
                    })}
                    rows={4}
                    placeholder="Describe your business and services..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="yearsExperience">Years of Experience</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      value={profile.businessInfo.yearsExperience}
                      onChange={(e) => updateProfile({
                        businessInfo: { ...profile.businessInfo, yearsExperience: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceRadius">Service Radius (km)</Label>
                    <Input
                      id="serviceRadius"
                      type="number"
                      value={profile.businessAddress.serviceRadius}
                      onChange={(e) => updateProfile({
                        businessAddress: { ...profile.businessAddress, serviceRadius: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Specialties</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.businessInfo.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Specialty
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>How clients can reach you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryPhone">Primary Phone</Label>
                    <Input
                      id="primaryPhone"
                      value={profile.contactInfo.primaryPhone}
                      onChange={(e) => updateProfile({
                        contactInfo: { ...profile.contactInfo, primaryPhone: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessEmail">Business Email</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={profile.contactInfo.businessEmail}
                      onChange={(e) => updateProfile({
                        contactInfo: { ...profile.contactInfo, businessEmail: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={profile.contactInfo.whatsapp || ''}
                      onChange={(e) => updateProfile({
                        contactInfo: { ...profile.contactInfo, whatsapp: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profile.contactInfo.website || ''}
                      onChange={(e) => updateProfile({
                        contactInfo: { ...profile.contactInfo, website: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Performance Statistics
                </CardTitle>
                <CardDescription>Your business metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {profile.statistics.totalJobs}
                    </p>
                    <p className="text-sm text-gray-600">Total Jobs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {profile.statistics.completionRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      ₦{profile.statistics.totalEarnings.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Earnings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {profile.statistics.responseTime} min
                    </p>
                    <p className="text-sm text-gray-600">Avg Response</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Services Offered
                </CardTitle>
                <CardDescription>Manage your service offerings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.services.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{service.title}</h3>
                            <Badge variant={service.isActive ? 'default' : 'secondary'}>
                              {service.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-medium">₦{service.price.toLocaleString()}</span>
                            <span className="text-gray-500">{service.duration} minutes</span>
                            <Badge variant="outline">{service.category}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Portfolio
                </CardTitle>
                <CardDescription>Showcase your completed work</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.portfolio.map((item) => (
                    <div key={item.id} className="border rounded-lg overflow-hidden">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-medium mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="outline">{item.category}</Badge>
                          {item.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span>{item.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">Add portfolio item</p>
                    <Button size="sm">Upload Images</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Bookings
                </CardTitle>
                <CardDescription>Manage your service bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{booking.serviceName}</h3>
                          <p className="text-sm text-gray-600">
                            Client: {booking.clientName} • {booking.clientPhone}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.scheduledDate).toLocaleDateString()} at {new Date(booking.scheduledDate).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(booking.status)}
                            <span className="capitalize">{booking.status}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      {booking.notes && (
                        <p className="text-sm text-gray-600 mb-3">Note: {booking.notes}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="font-medium">₦{booking.totalAmount.toLocaleString()}</span>
                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline">Accept</Button>
                              <Button size="sm" variant="outline">Decline</Button>
                            </>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Working Hours
                </CardTitle>
                <CardDescription>Set your availability schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.availability.workingHours.map((schedule) => (
                  <div key={schedule.day} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={schedule.isOpen}
                        onCheckedChange={(checked) => {
                          const updatedHours = profile.availability.workingHours.map(h =>
                            h.day === schedule.day ? { ...h, isOpen: checked } : h
                          );
                          updateProfile({
                            availability: { ...profile.availability, workingHours: updatedHours }
                          });
                        }}
                      />
                      <span className="font-medium capitalize">{schedule.day}</span>
                    </div>
                    {schedule.isOpen && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={schedule.openTime}
                          className="w-24"
                          onChange={(e) => {
                            const updatedHours = profile.availability.workingHours.map(h =>
                              h.day === schedule.day ? { ...h, openTime: e.target.value } : h
                            );
                            updateProfile({
                              availability: { ...profile.availability, workingHours: updatedHours }
                            });
                          }}
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={schedule.closeTime}
                          className="w-24"
                          onChange={(e) => {
                            const updatedHours = profile.availability.workingHours.map(h =>
                              h.day === schedule.day ? { ...h, closeTime: e.target.value } : h
                            );
                            updateProfile({
                              availability: { ...profile.availability, workingHours: updatedHours }
                            });
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Emergency Services</Label>
                    <p className="text-sm text-gray-600">Available for emergency calls outside business hours</p>
                  </div>
                  <Switch
                    checked={profile.availability.isAvailableForEmergency}
                    onCheckedChange={(checked) => updateProfile({
                      availability: { ...profile.availability, isAvailableForEmergency: checked }
                    })}
                  />
                </div>
                
                {profile.availability.isAvailableForEmergency && (
                  <div>
                    <Label htmlFor="emergencyRate">Emergency Rate Increase (%)</Label>
                    <Input
                      id="emergencyRate"
                      type="number"
                      value={profile.availability.emergencyRate}
                      onChange={(e) => updateProfile({
                        availability: { ...profile.availability, emergencyRate: parseInt(e.target.value) || 0 }
                      })}
                      className="mt-1"
                    />
                  </div>
                )}
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
                <CardDescription>Complete verification to build client trust</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Current Status</h3>
                      <p className="text-sm text-gray-600">Your verification level</p>
                    </div>
                    <Badge variant={profile.verification.status === 'verified' ? 'default' : 'secondary'} className="capitalize">
                      {profile.verification.status}
                    </Badge>
                  </div>

                  {/* Documents */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Documents</h4>
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

                  {/* Badges */}
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
                      <Label>Auto Accept Bookings</Label>
                      <p className="text-sm text-gray-600">Automatically accept new bookings</p>
                    </div>
                    <Switch
                      checked={profile.settings.autoAcceptBookings}
                      onCheckedChange={(checked) => updateProfile({
                        settings: { ...profile.settings, autoAcceptBookings: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Send SMS updates to clients</p>
                    </div>
                    <Switch
                      checked={profile.settings.sendSmsNotifications}
                      onCheckedChange={(checked) => updateProfile({
                        settings: { ...profile.settings, sendSmsNotifications: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Deposit</Label>
                      <p className="text-sm text-gray-600">Require upfront payment for bookings</p>
                    </div>
                    <Switch
                      checked={profile.settings.requireDeposit}
                      onCheckedChange={(checked) => updateProfile({
                        settings: { ...profile.settings, requireDeposit: checked }
                      })}
                    />
                  </div>
                </div>

                {profile.settings.requireDeposit && (
                  <div>
                    <Label htmlFor="depositPercentage">Deposit Percentage (%)</Label>
                    <Input
                      id="depositPercentage"
                      type="number"
                      value={profile.settings.depositPercentage}
                      onChange={(e) => updateProfile({
                        settings: { ...profile.settings, depositPercentage: parseInt(e.target.value) || 0 }
                      })}
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                  <Textarea
                    id="cancellationPolicy"
                    value={profile.settings.cancellationPolicy}
                    onChange={(e) => updateProfile({
                      settings: { ...profile.settings, cancellationPolicy: e.target.value }
                    })}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bank Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
                <CardDescription>Where you want to receive payments</CardDescription>
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
                    />
                  </div>
                </div>

                {profile.bankDetails.verified && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your bank details have been verified and are ready for payments.
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

export default ArtisanProfile;