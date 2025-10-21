import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  MapPin,
  Star,
  Eye,
  Phone,
  Mail,
  Clock,
  Building,
  PieChart
} from 'lucide-react';

const RealtorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [dashboardData, setDashboardData] = useState({
    totalProperties: 0,
    activeListings: 0,
    soldProperties: 0,
    totalCommission: 0,
    activeClients: 0,
    scheduledViewings: 0,
    averageRating: 0,
    propertiesViewed: 0
  });

  useEffect(() => {
    loadRealtorData();
  }, []);

  const loadRealtorData = async () => {
    // Mock data for development
    setDashboardData({
      totalProperties: 45,
      activeListings: 32,
      soldProperties: 13,
      totalCommission: 15750000,
      activeClients: 28,
      scheduledViewings: 12,
      averageRating: 4.8,
      propertiesViewed: 856
    });
  };

  const recentProperties = [
    { 
      id: '1', 
      title: '4BR Duplex in Lekki', 
      price: 85000000, 
      status: 'active', 
      views: 245, 
      inquiries: 8,
      type: 'sale',
      location: 'Lekki, Lagos'
    },
    { 
      id: '2', 
      title: '3BR Apartment in Victoria Island', 
      price: 120000000, 
      status: 'under_offer', 
      views: 189, 
      inquiries: 12,
      type: 'sale',
      location: 'Victoria Island, Lagos'
    },
    { 
      id: '3', 
      title: '5BR House in Abuja', 
      price: 200000000, 
      status: 'sold', 
      views: 320, 
      inquiries: 15,
      type: 'sale',
      location: 'Maitama, Abuja'
    }
  ];

  const activeClients = [
    { name: 'John Doe', type: 'Buyer', budget: '₦50M-80M', status: 'active', lastContact: '2 days ago' },
    { name: 'Jane Smith', type: 'Seller', property: '3BR Apartment', status: 'negotiating', lastContact: '1 day ago' },
    { name: 'Mike Johnson', type: 'Buyer', budget: '₦100M-150M', status: 'viewing', lastContact: 'Today' }
  ];

  const upcomingViewings = [
    { property: '4BR Duplex in Lekki', client: 'Sarah Wilson', date: '2024-01-16', time: '10:00 AM' },
    { property: '3BR Apartment in VI', client: 'David Brown', date: '2024-01-16', time: '2:00 PM' },
    { property: '5BR House in Abuja', client: 'Mary Johnson', date: '2024-01-17', time: '11:00 AM' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Realtor Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/properties/add')}
                className="bg-red-600 hover:bg-red-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Add Property
              </Button>
              <Button variant="outline" onClick={() => console.log('Add client functionality')}>
                <Users className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Commission</p>
                  <p className="text-2xl font-bold">₦{dashboardData.totalCommission.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+15% from last month</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold">{dashboardData.activeListings}</p>
                  <p className="text-xs text-blue-600">of {dashboardData.totalProperties} total</p>
                </div>
                <Building className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Clients</p>
                  <p className="text-2xl font-bold">{dashboardData.activeClients}</p>
                  <p className="text-xs text-purple-600">+3 new this week</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Properties Sold</p>
                  <p className="text-2xl font-bold">{dashboardData.soldProperties}</p>
                  <p className="text-xs text-orange-600">This quarter</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Property Portfolio</TabsTrigger>
            <TabsTrigger value="clients">Client Management</TabsTrigger>
            <TabsTrigger value="analytics">Market Analytics</TabsTrigger>
            <TabsTrigger value="viewings">Viewings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Properties */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Properties</CardTitle>
                  <CardDescription>Your latest property listings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentProperties.map((property) => (
                      <div key={property.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Home className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="font-medium">{property.title}</p>
                            <p className="text-sm text-gray-500">{property.location}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500 flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {property.views}
                              </span>
                              <span className="text-xs text-gray-500">
                                {property.inquiries} inquiries
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₦{property.price.toLocaleString()}</p>
                          <Badge variant={
                            property.status === 'active' ? 'default' :
                            property.status === 'under_offer' ? 'secondary' : 'outline'
                          }>
                            {property.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Viewings */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Viewings</CardTitle>
                  <CardDescription>Scheduled property viewings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingViewings.map((viewing, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-6 h-6 text-blue-500" />
                          <div>
                            <p className="font-medium">{viewing.property}</p>
                            <p className="text-sm text-gray-500">Client: {viewing.client}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{viewing.date}</p>
                          <p className="text-sm text-gray-500">{viewing.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>Property Portfolio Management</CardTitle>
                <CardDescription>Manage all your property listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProperties.map((property) => (
                    <div key={property.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{property.title}</h3>
                          <p className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {property.location}
                          </p>
                        </div>
                        <Badge variant={
                          property.status === 'active' ? 'default' :
                          property.status === 'under_offer' ? 'secondary' : 'outline'
                        }>
                          {property.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">₦{property.price.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Asking Price</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{property.views}</p>
                          <p className="text-sm text-gray-500">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{property.inquiries}</p>
                          <p className="text-sm text-gray-500">Inquiries</p>
                        </div>
                      </div>
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

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>Manage your buyer and seller relationships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeClients.map((client, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{client.name}</h3>
                            <p className="text-sm text-gray-500">{client.type}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{client.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            {client.type === 'Buyer' ? 'Budget Range' : 'Property'}
                          </p>
                          <p className="font-medium">
                            {client.type === 'Buyer' ? client.budget : client.property}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Last Contact</p>
                          <p className="font-medium flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {client.lastContact}
                          </p>
                        </div>
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
                        <Button size="sm">View Profile</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market Analytics</CardTitle>
                  <CardDescription>Real estate market trends and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Market analytics chart would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Days on Market</span>
                      <span className="font-semibold">45 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Sale Price</span>
                      <span className="font-semibold">₦85.5M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Client Satisfaction</span>
                      <span className="font-semibold">96%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Repeat Clients</span>
                      <span className="font-semibold">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Commission Rate</span>
                      <span className="font-semibold">2.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
        </Tabs>
      </div>
    </div>
  );
};

export default RealtorDashboard;
