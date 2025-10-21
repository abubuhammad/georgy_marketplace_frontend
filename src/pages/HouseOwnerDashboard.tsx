import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedDashboardHeader } from '@/components/enhanced/EnhancedDashboardHeader';
import { 
  Home,
  DollarSign,
  MessageCircle,
  Calendar,
  Eye,
  TrendingUp,
  MapPin,
  Clock,
  Users,
  Wrench,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail
} from 'lucide-react';

const HouseOwnerDashboard: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalProperties: 0,
    rentedProperties: 0,
    vacantProperties: 0,
    totalRentalIncome: 0,
    pendingInquiries: 0,
    scheduledViewings: 0,
    maintenanceRequests: 0,
    totalViews: 0
  });

  useEffect(() => {
    loadOwnerData();
  }, []);

  const loadOwnerData = async () => {
    // Mock data for development
    setDashboardData({
      totalProperties: 5,
      rentedProperties: 3,
      vacantProperties: 2,
      totalRentalIncome: 2450000,
      pendingInquiries: 8,
      scheduledViewings: 6,
      maintenanceRequests: 2,
      totalViews: 432
    });
  };

  const properties = [
    { 
      id: '1', 
      address: '15 Admiralty Way, Lekki Phase 1', 
      type: 'rental', 
      status: 'rented', 
      rent: 800000, 
      tenant: 'John Adebayo',
      nextPayment: '2024-02-15',
      views: 156
    },
    { 
      id: '2', 
      address: '23 Victoria Garden City, Ajah', 
      type: 'sale', 
      status: 'vacant', 
      price: 45000000, 
      inquiries: 12,
      views: 245
    },
    { 
      id: '3', 
      address: '8 Chevron Drive, Lekki', 
      type: 'rental', 
      status: 'rented', 
      rent: 650000, 
      tenant: 'Sarah Okafor',
      nextPayment: '2024-01-30',
      views: 89
    }
  ];

  const inquiries = [
    { name: 'David Williams', property: '23 Victoria Garden City', type: 'Purchase', date: '2024-01-15', priority: 'high' },
    { name: 'Emma Johnson', property: '15 Admiralty Way', type: 'Rental', date: '2024-01-14', priority: 'medium' },
    { name: 'Michael Brown', property: '8 Chevron Drive', type: 'Rental', date: '2024-01-13', priority: 'low' }
  ];

  const upcomingViewings = [
    { property: '23 Victoria Garden City, Ajah', client: 'David Williams', date: '2024-01-17', time: '2:00 PM' },
    { property: '15 Admiralty Way, Lekki', client: 'Emma Johnson', date: '2024-01-18', time: '10:00 AM' },
    { property: '8 Chevron Drive, Lekki', client: 'Michael Brown', date: '2024-01-18', time: '3:00 PM' }
  ];

  const maintenanceItems = [
    { property: '15 Admiralty Way', issue: 'Air conditioning repair', priority: 'high', date: '2024-01-14', status: 'pending' },
    { property: '8 Chevron Drive', issue: 'Plumbing maintenance', priority: 'medium', date: '2024-01-12', status: 'in_progress' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced House Owner Dashboard Header */}
      <EnhancedDashboardHeader
        title="Property Portfolio Manager"
        subtitle={`Welcome, ${user?.firstName}! Maximize your rental investments`}
        user={user}
        actions={[
          {
            label: 'Add Property',
            icon: Home,
            onClick: () => navigate('/properties/add'),
            variant: 'default'
          },
          {
            label: 'Schedule Viewing',
            icon: Calendar,
            onClick: () => navigate('/viewings/schedule')
          },
          {
            label: 'Maintenance',
            icon: Wrench,
            onClick: () => navigate('/maintenance')
          }
        ]}
        notifications={dashboardData.maintenanceRequests + dashboardData.pendingInquiries}
        messages={dashboardData.pendingInquiries}
        stats={[
          {
            label: 'Monthly Income',
            value: `₦${(dashboardData.totalRentalIncome / 1000000).toFixed(1)}M`,
            trend: 'up'
          },
          {
            label: 'Properties',
            value: dashboardData.totalProperties,
            trend: 'neutral'
          },
          {
            label: 'Occupancy Rate',
            value: `${Math.round((dashboardData.rentedProperties / dashboardData.totalProperties) * 100)}%`,
            trend: 'up'
          }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Rental Income</p>
                  <p className="text-2xl font-bold">₦{dashboardData.totalRentalIncome.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+8% from last month</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold">{dashboardData.totalProperties}</p>
                  <p className="text-xs text-blue-600">{dashboardData.rentedProperties} rented, {dashboardData.vacantProperties} vacant</p>
                </div>
                <Home className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Inquiries</p>
                  <p className="text-2xl font-bold">{dashboardData.pendingInquiries}</p>
                  <p className="text-xs text-purple-600">+2 new today</p>
                </div>
                <MessageCircle className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled Viewings</p>
                  <p className="text-2xl font-bold">{dashboardData.scheduledViewings}</p>
                  <p className="text-xs text-orange-600">This week</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">My Properties</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            <TabsTrigger value="viewings">Viewings</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Property Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Overview</CardTitle>
                  <CardDescription>Your property portfolio status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {properties.slice(0, 3).map((property) => (
                      <div key={property.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Home className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="font-medium">{property.address}</p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              {property.views} views
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ₦{(property.rent || property.price)?.toLocaleString()}
                            {property.type === 'rental' ? '/month' : ''}
                          </p>
                          <Badge variant={property.status === 'rented' ? 'default' : 'secondary'}>
                            {property.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Inquiries */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Inquiries</CardTitle>
                  <CardDescription>New inquiries from potential tenants/buyers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inquiries.map((inquiry, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Users className="w-6 h-6 text-blue-500" />
                          <div>
                            <p className="font-medium">{inquiry.name}</p>
                            <p className="text-sm text-gray-500">{inquiry.property}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={inquiry.priority === 'high' ? 'destructive' : inquiry.priority === 'medium' ? 'secondary' : 'outline'}>
                            {inquiry.priority}
                          </Badge>
                          <p className="text-sm text-gray-500 mt-1">{inquiry.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>Property Portfolio</CardTitle>
                <CardDescription>Manage all your properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div key={property.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{property.address}</h3>
                          <p className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {property.type === 'rental' ? 'For Rent' : 'For Sale'}
                          </p>
                        </div>
                        <Badge variant={property.status === 'rented' ? 'default' : 'secondary'}>
                          {property.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            ₦{(property.rent || property.price)?.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {property.type === 'rental' ? 'Monthly Rent' : 'Asking Price'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{property.views}</p>
                          <p className="text-sm text-gray-500">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{property.inquiries || 0}</p>
                          <p className="text-sm text-gray-500">Inquiries</p>
                        </div>
                      </div>
                      {property.tenant && (
                        <div className="bg-gray-50 p-3 rounded mb-4">
                          <p className="text-sm text-gray-600">Current Tenant: <span className="font-medium">{property.tenant}</span></p>
                          <p className="text-sm text-gray-600">Next Payment: <span className="font-medium">{property.nextPayment}</span></p>
                        </div>
                      )}
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button size="sm">Manage</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries">
            <Card>
              <CardHeader>
                <CardTitle>Inquiry Management</CardTitle>
                <CardDescription>Manage inquiries from potential tenants and buyers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inquiries.map((inquiry, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{inquiry.name}</h3>
                            <p className="text-sm text-gray-500">{inquiry.type} Inquiry</p>
                          </div>
                        </div>
                        <Badge variant={inquiry.priority === 'high' ? 'destructive' : inquiry.priority === 'medium' ? 'secondary' : 'outline'}>
                          {inquiry.priority} priority
                        </Badge>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">Property: <span className="font-medium">{inquiry.property}</span></p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Received: {inquiry.date}
                        </p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </Button>
                        <Button size="sm">Respond</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="viewings">
            <Card>
              <CardHeader>
                <CardTitle>Viewing Schedule</CardTitle>
                <CardDescription>Manage property viewing appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingViewings.map((viewing, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{viewing.property}</h3>
                          <p className="text-sm text-gray-500">Client: {viewing.client}</p>
                        </div>
                        <Badge variant="secondary">Scheduled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {viewing.date}
                          </span>
                          <span className="text-sm text-gray-600 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {viewing.time}
                          </span>
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">Reschedule</Button>
                          <Button size="sm">Contact Client</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance & Repairs</CardTitle>
                <CardDescription>Track property maintenance requests and reminders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Wrench className="w-6 h-6 text-blue-500" />
                          <div>
                            <h3 className="font-semibold">{item.issue}</h3>
                            <p className="text-sm text-gray-500">{item.property}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'}>
                            {item.priority}
                          </Badge>
                          <Badge variant={item.status === 'pending' ? 'outline' : 'default'}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Reported: {item.date}
                        </p>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">Update Status</Button>
                          <Button size="sm">View Details</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finances">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rental Income Tracking</CardTitle>
                  <CardDescription>Monthly rental income overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">January 2024</span>
                      <span className="font-semibold">₦2,450,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">December 2023</span>
                      <span className="font-semibold">₦2,450,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">November 2023</span>
                      <span className="font-semibold">₦2,270,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">October 2023</span>
                      <span className="font-semibold">₦2,270,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Value Estimates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Portfolio Value</span>
                      <span className="font-semibold">₦285M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Monthly Yield</span>
                      <span className="font-semibold">1.03%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Annual Yield</span>
                      <span className="font-semibold">10.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Market Appreciation</span>
                      <span className="font-semibold text-green-600">+8.5%</span>
                    </div>
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

export default HouseOwnerDashboard;
