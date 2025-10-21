import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserDropdown } from '@/components/ui/user-dropdown';
import { EnhancedDashboardHeader } from '@/components/enhanced/EnhancedDashboardHeader';
import {
  Home,
  MapPin,
  Calendar,
  Users,
  Eye,
  Heart,
  Phone,
  Mail,
  Plus,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Camera,
  Video,
  Star,
  Clock,
  FileText,
  Upload
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const RealtorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { itemCount } = useCart();
  const [activeTab, setActiveTab] = useState('overview');

  const mockStats = {
    totalListings: 47,
    activeListings: 42,
    soldThisMonth: 8,
    totalViews: 15234,
    totalInquiries: 289,
    avgPrice: 12500000,
    commissionEarned: 8750000,
    scheduledViewings: 15
  };

  const mockProperties = [
    {
      id: '1',
      title: '4 Bedroom Duplex in Lekki',
      type: 'For Sale',
      price: 85000000,
      location: 'Lekki Phase 1, Lagos',
      bedrooms: 4,
      bathrooms: 5,
      sqft: 3200,
      images: ['/api/placeholder/400/300'],
      status: 'Active',
      views: 234,
      inquiries: 12,
      dateAdded: '2024-01-10',
      virtualTour: true,
      featured: true
    },
    {
      id: '2',
      title: '3 Bedroom Apartment for Rent',
      type: 'For Rent',
      price: 1500000,
      location: 'Victoria Island, Lagos',
      bedrooms: 3,
      bathrooms: 4,
      sqft: 2100,
      images: ['/api/placeholder/400/300'],
      status: 'Active',
      views: 189,
      inquiries: 8,
      dateAdded: '2024-01-08',
      virtualTour: false,
      featured: false
    },
    {
      id: '3',
      title: '5 Bedroom Mansion in Banana Island',
      type: 'For Sale',
      price: 350000000,
      location: 'Banana Island, Lagos',
      bedrooms: 5,
      bathrooms: 7,
      sqft: 5500,
      images: ['/api/placeholder/400/300'],
      status: 'Under Offer',
      views: 456,
      inquiries: 23,
      dateAdded: '2024-01-05',
      virtualTour: true,
      featured: true
    }
  ];

  const mockViewings = [
    {
      id: '1',
      property: '4 Bedroom Duplex in Lekki',
      client: 'John Adebayo',
      date: '2024-01-20',
      time: '10:00 AM',
      phone: '+234-801-234-5678',
      status: 'Confirmed'
    },
    {
      id: '2',
      property: '3 Bedroom Apartment for Rent',
      client: 'Sarah Okonkwo',
      date: '2024-01-20',
      time: '2:00 PM',
      phone: '+234-802-345-6789',
      status: 'Pending'
    },
    {
      id: '3',
      property: '5 Bedroom Mansion in Banana Island',
      client: 'David Chen',
      date: '2024-01-21',
      time: '11:00 AM',
      phone: '+234-803-456-7890',
      status: 'Confirmed'
    }
  ];

  const mockInquiries = [
    {
      id: '1',
      property: '4 Bedroom Duplex in Lekki',
      client: 'Ada Nnamdi',
      email: 'ada.nnamdi@email.com',
      phone: '+234-804-567-8901',
      message: 'Hi, I\'m interested in viewing this property. When is the earliest available time?',
      date: '2024-01-18',
      status: 'New'
    },
    {
      id: '2',
      property: '3 Bedroom Apartment for Rent',
      client: 'Michael Ojo',
      email: 'michael.ojo@email.com',
      phone: '+234-805-678-9012',
      message: 'Is the rent negotiable? Can I schedule a viewing for this weekend?',
      date: '2024-01-17',
      status: 'Responded'
    }
  ];

  if (!user || !['realtor', 'house_agent', 'house_owner'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="text-center">
            <Home className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You need realtor privileges to access this dashboard</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Realtor Dashboard Header */}
      <EnhancedDashboardHeader
        title="Property Command Center"
        subtitle={`Welcome, ${user?.firstName}! Manage your real estate empire`}
        user={user}
        actions={[
          {
            label: 'Add Property',
            icon: Plus,
            onClick: () => navigate('/properties/add'),
            variant: 'default'
          },
          {
            label: 'Virtual Tours',
            icon: Video,
            onClick: () => navigate('/properties/tours')
          },
          {
            label: 'Analytics',
            icon: TrendingUp,
            onClick: () => navigate('/realtor/analytics')
          }
        ]}
        notifications={mockViewings.filter(v => v.status === 'Pending').length}
        messages={mockInquiries.filter(i => i.status === 'New').length}
        stats={[
          {
            label: 'Active Listings',
            value: mockStats.activeListings,
            trend: 'up'
          },
          {
            label: 'This Month Sales',
            value: mockStats.soldThisMonth,
            trend: 'up'
          },
          {
            label: 'Commission Earned',
            value: `₦${(mockStats.commissionEarned / 1000000).toFixed(1)}M`,
            trend: 'up'
          }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Real Estate Dashboard</h1>
          <p className="text-gray-600">Manage your property listings and client relationships</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="viewings">Viewings</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Listings</p>
                      <p className="text-2xl font-bold">{mockStats.activeListings}</p>
                      <p className="text-sm text-green-600">+5 this month</p>
                    </div>
                    <Home className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Properties Sold</p>
                      <p className="text-2xl font-bold">{mockStats.soldThisMonth}</p>
                      <p className="text-sm text-green-600">This month</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Views</p>
                      <p className="text-2xl font-bold">{mockStats.totalViews.toLocaleString()}</p>
                      <p className="text-sm text-green-600">+12% this week</p>
                    </div>
                    <Eye className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Commission Earned</p>
                      <p className="text-2xl font-bold">₦{(mockStats.commissionEarned / 1000000).toFixed(1)}M</p>
                      <p className="text-sm text-green-600">This month</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button className="h-20 flex flex-col items-center justify-center" onClick={() => navigate('/properties/add')}>
                    <Plus className="w-6 h-6 mb-2" />
                    Add Property
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Calendar className="w-6 h-6 mb-2" />
                    Schedule Viewing
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Camera className="w-6 h-6 mb-2" />
                    Upload Photos
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <FileText className="w-6 h-6 mb-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Viewings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockViewings.slice(0, 3).map((viewing) => (
                      <div key={viewing.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-sm">{viewing.property}</h3>
                          <p className="text-sm text-gray-600">{viewing.client}</p>
                          <p className="text-xs text-gray-500">{viewing.date} at {viewing.time}</p>
                        </div>
                        <Badge variant={viewing.status === 'Confirmed' ? 'default' : 'secondary'}>
                          {viewing.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Inquiries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockInquiries.map((inquiry) => (
                      <div key={inquiry.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{inquiry.client}</h3>
                          <p className="text-sm text-gray-600">{inquiry.property}</p>
                          <p className="text-xs text-gray-500 mt-1">{inquiry.message.substring(0, 50)}...</p>
                        </div>
                        <Badge variant={inquiry.status === 'New' ? 'destructive' : 'default'}>
                          {inquiry.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Property Listings</h2>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Upload
                </Button>
                <Button onClick={() => navigate('/properties/add')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2 flex space-x-1">
                      <Badge variant="default" className="bg-blue-600">
                        {property.type}
                      </Badge>
                      {property.featured && (
                        <Badge variant="default" className="bg-orange-600">
                          Featured
                        </Badge>
                      )}
                      {property.virtualTour && (
                        <Badge variant="default" className="bg-purple-600">
                          <Video className="w-3 h-3 mr-1" />
                          360°
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant={property.status === 'Active' ? 'default' : 'secondary'}>
                        {property.status}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                    <p className="text-2xl font-bold text-red-600 mb-2">
                      ₦{property.price.toLocaleString()}
                      {property.type === 'For Rent' && '/year'}
                    </p>
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.location}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>{property.bedrooms} beds</span>
                      <span>{property.bathrooms} baths</span>
                      <span>{property.sqft} sqft</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {property.views} views
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {property.inquiries} inquiries
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="viewings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Property Viewings</h2>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule New Viewing
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Scheduled Viewings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockViewings.map((viewing) => (
                    <div key={viewing.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{viewing.property}</h3>
                        <p className="text-sm text-gray-600 mt-1">Client: {viewing.client}</p>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {viewing.date} at {viewing.time}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {viewing.phone}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={viewing.status === 'Confirmed' ? 'default' : 'secondary'}>
                          {viewing.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Client Inquiries</h2>
              <Badge variant="destructive">{mockInquiries.filter(i => i.status === 'New').length} New</Badge>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {mockInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{inquiry.client}</h3>
                          <p className="text-sm text-gray-600">{inquiry.property}</p>
                          <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {inquiry.email}
                            </div>
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {inquiry.phone}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {inquiry.date}
                            </div>
                          </div>
                        </div>
                        <Badge variant={inquiry.status === 'New' ? 'destructive' : 'default'}>
                          {inquiry.status}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-4">{inquiry.message}</p>
                      <div className="flex space-x-2">
                        <Button size="sm">
                          <Mail className="w-4 h-4 mr-1" />
                          Reply
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          Schedule Viewing
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Performance Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Eye className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Average Views</h3>
                  <p className="text-2xl font-bold">324</p>
                  <p className="text-sm text-gray-600">Per property</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Client Rating</h3>
                  <p className="text-2xl font-bold">4.8</p>
                  <p className="text-sm text-gray-600">Out of 5 stars</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Avg. Response Time</h3>
                  <p className="text-2xl font-bold">2.5hrs</p>
                  <p className="text-sm text-gray-600">To inquiries</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RealtorDashboard;
