import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedDashboardHeader } from '@/components/enhanced/EnhancedDashboardHeader';
import { 
  Building,
  Users,
  TrendingUp,
  Calendar,
  MessageCircle,
  Eye,
  Phone,
  Mail,
  Clock,
  MapPin,
  BarChart3,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const HouseAgentDashboard: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    agencyListings: 0,
    personalPerformance: 0,
    clientInquiries: 0,
    scheduledViewings: 0,
    monthlyTargets: 0,
    commissionsEarned: 0,
    activeClients: 0,
    propertiesShown: 0
  });

  useEffect(() => {
    loadAgentData();
  }, []);

  const loadAgentData = async () => {
    // Mock data for development
    setDashboardData({
      agencyListings: 156,
      personalPerformance: 85, // percentage
      clientInquiries: 23,
      scheduledViewings: 8,
      monthlyTargets: 75, // percentage
      commissionsEarned: 4250000,
      activeClients: 15,
      propertiesShown: 45
    });
  };

  const agencyProperties = [
    { 
      id: '1', 
      title: '3BR Apartment in Ikoyi', 
      price: 95000000, 
      agent: 'John Doe',
      status: 'active', 
      views: 189, 
      inquiries: 7,
      location: 'Ikoyi, Lagos',
      assignedTo: 'me'
    },
    { 
      id: '2', 
      title: '4BR Duplex in Lekki', 
      price: 120000000, 
      agent: 'Jane Smith',
      status: 'under_negotiation', 
      views: 245, 
      inquiries: 12,
      location: 'Lekki, Lagos',
      assignedTo: 'other'
    },
    { 
      id: '3', 
      title: '2BR Flat in Victoria Island', 
      price: 75000000, 
      agent: 'You',
      status: 'viewing_scheduled', 
      views: 156, 
      inquiries: 5,
      location: 'Victoria Island, Lagos',
      assignedTo: 'me'
    }
  ];

  const clientInquiries = [
    { 
      id: '1', 
      client: 'Michael Brown', 
      property: '3BR Apartment in Ikoyi',
      type: 'viewing_request',
      priority: 'high',
      date: 'Today',
      status: 'pending'
    },
    { 
      id: '2', 
      client: 'Sarah Wilson', 
      property: '4BR Duplex in Lekki',
      type: 'price_inquiry',
      priority: 'medium',
      date: 'Yesterday',
      status: 'responded'
    },
    { 
      id: '3', 
      client: 'David Johnson', 
      property: '2BR Flat in VI',
      type: 'negotiation',
      priority: 'high',
      date: '2 days ago',
      status: 'in_progress'
    }
  ];

  const upcomingViewings = [
    { property: '3BR Apartment in Ikoyi', client: 'Michael Brown', date: '2024-01-16', time: '10:00 AM', status: 'confirmed' },
    { property: '2BR Flat in VI', client: 'Lisa Davis', date: '2024-01-16', time: '2:00 PM', status: 'confirmed' },
    { property: '4BR Duplex in Lekki', client: 'James Wilson', date: '2024-01-17', time: '11:00 AM', status: 'pending' }
  ];

  const teamPerformance = [
    { agent: 'John Doe', properties: 12, sales: 3, commission: 2100000, performance: 92 },
    { agent: 'Jane Smith', properties: 15, sales: 4, commission: 2800000, performance: 88 },
    { agent: 'You', properties: 8, sales: 2, commission: 1400000, performance: 85 },
    { agent: 'Mike Johnson', properties: 10, sales: 2, commission: 1750000, performance: 80 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced House Agent Dashboard Header */}
      <EnhancedDashboardHeader
        title="Property Agent Hub"
        subtitle={`Welcome, ${user?.firstName}! Connect clients with their dream homes`}
        user={user}
        actions={[
          {
            label: 'Add Property',
            icon: Building,
            onClick: () => navigate('/properties/add'),
            variant: 'default'
          },
          {
            label: 'Add Client',
            icon: Users,
            onClick: () => navigate('/clients/add')
          },
          {
            label: 'Performance Report',
            icon: BarChart3,
            onClick: () => navigate('/agent/performance')
          }
        ]}
        notifications={dashboardData.clientInquiries + dashboardData.scheduledViewings}
        messages={clientInquiries.filter(inquiry => inquiry.status === 'pending').length}
        stats={[
          {
            label: 'Performance',
            value: `${dashboardData.personalPerformance}%`,
            trend: 'up'
          },
          {
            label: 'Active Clients',
            value: dashboardData.activeClients,
            trend: 'up'
          },
          {
            label: 'Commission',
            value: `₦${(dashboardData.commissionsEarned / 1000000).toFixed(1)}M`,
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
                  <p className="text-sm font-medium text-gray-600">Agency Listings</p>
                  <p className="text-2xl font-bold">{dashboardData.agencyListings}</p>
                  <p className="text-xs text-blue-600">Total properties</p>
                </div>
                <Building className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Performance Score</p>
                  <p className="text-2xl font-bold">{dashboardData.personalPerformance}%</p>
                  <p className="text-xs text-green-600">Above target</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Clients</p>
                  <p className="text-2xl font-bold">{dashboardData.activeClients}</p>
                  <p className="text-xs text-purple-600">+2 this week</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Commissions</p>
                  <p className="text-2xl font-bold">₦{dashboardData.commissionsEarned.toLocaleString()}</p>
                  <p className="text-xs text-orange-600">This quarter</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className="font-medium text-orange-800">
                  {dashboardData.clientInquiries} pending client inquiries
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-blue-800">
                  {dashboardData.scheduledViewings} viewings scheduled today
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-green-800">
                  {dashboardData.monthlyTargets}% of monthly target achieved
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Agency Properties</TabsTrigger>
            <TabsTrigger value="inquiries">Client Inquiries</TabsTrigger>
            <TabsTrigger value="viewings">Viewings</TabsTrigger>
            <TabsTrigger value="performance">Team Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Client Inquiries */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Client Inquiries</CardTitle>
                  <CardDescription>Latest client requests requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clientInquiries.map((inquiry) => (
                      <div key={inquiry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <MessageCircle className={`w-6 h-6 ${
                            inquiry.priority === 'high' ? 'text-red-500' : 
                            inquiry.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
                          }`} />
                          <div>
                            <p className="font-medium">{inquiry.client}</p>
                            <p className="text-sm text-gray-500">{inquiry.property}</p>
                            <p className="text-xs text-gray-400">{inquiry.type} • {inquiry.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            inquiry.status === 'pending' ? 'destructive' :
                            inquiry.status === 'in_progress' ? 'secondary' : 'default'
                          }>
                            {inquiry.status.replace('_', ' ')}
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
                  <CardTitle>Today's Viewings</CardTitle>
                  <CardDescription>Scheduled property viewings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingViewings.slice(0, 3).map((viewing, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-6 h-6 text-blue-500" />
                          <div>
                            <p className="font-medium">{viewing.property}</p>
                            <p className="text-sm text-gray-500">Client: {viewing.client}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{viewing.time}</p>
                          <Badge variant={viewing.status === 'confirmed' ? 'default' : 'secondary'}>
                            {viewing.status}
                          </Badge>
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
                <CardTitle>Agency Property Listings</CardTitle>
                <CardDescription>All properties managed by your agency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agencyProperties.map((property) => (
                    <div key={property.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Building className="w-8 h-8 text-gray-400" />
                          <div>
                            <h3 className="font-semibold">{property.title}</h3>
                            <p className="text-sm text-gray-500 flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {property.location}
                            </p>
                            <p className="text-xs text-gray-400">Assigned to: {property.agent}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={property.assignedTo === 'me' ? 'default' : 'secondary'}
                            className="mb-2"
                          >
                            {property.assignedTo === 'me' ? 'Your Property' : 'Team Property'}
                          </Badge>
                          <br />
                          <Badge variant={
                            property.status === 'active' ? 'default' :
                            property.status === 'under_negotiation' ? 'secondary' : 'outline'
                          }>
                            {property.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">₦{property.price.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Price</p>
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
                        {property.assignedTo === 'me' && (
                          <>
                            <Button variant="outline" size="sm">Schedule Viewing</Button>
                            <Button size="sm">Manage</Button>
                          </>
                        )}
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
                <CardTitle>Client Inquiry Management</CardTitle>
                <CardDescription>Manage all client inquiries and responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{inquiry.client}</h3>
                          <p className="text-sm text-gray-500">{inquiry.property}</p>
                          <p className="text-xs text-gray-400">{inquiry.type} • {inquiry.date}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            inquiry.priority === 'high' ? 'destructive' :
                            inquiry.priority === 'medium' ? 'secondary' : 'default'
                          }>
                            {inquiry.priority} priority
                          </Badge>
                          <Badge variant={
                            inquiry.status === 'pending' ? 'destructive' :
                            inquiry.status === 'in_progress' ? 'secondary' : 'default'
                          }>
                            {inquiry.status.replace('_', ' ')}
                          </Badge>
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
                <CardDescription>Manage all property viewing appointments</CardDescription>
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
                        <Badge variant={viewing.status === 'confirmed' ? 'default' : 'secondary'}>
                          {viewing.status}
                        </Badge>
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

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Metrics</CardTitle>
                <CardDescription>Compare performance with other agents in your agency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamPerformance.map((agent, index) => (
                    <div key={index} className={`border rounded-lg p-6 ${agent.agent === 'You' ? 'border-blue-200 bg-blue-50' : ''}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{agent.agent}</h3>
                          <p className="text-sm text-gray-500">Performance: {agent.performance}%</p>
                        </div>
                        <Badge variant={agent.performance >= 90 ? 'default' : agent.performance >= 80 ? 'secondary' : 'outline'}>
                          {agent.performance >= 90 ? 'Excellent' : agent.performance >= 80 ? 'Good' : 'Needs Improvement'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-xl font-bold">{agent.properties}</p>
                          <p className="text-sm text-gray-500">Properties</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold">{agent.sales}</p>
                          <p className="text-sm text-gray-500">Sales</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold">₦{agent.commission.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Commission</p>
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

export default HouseAgentDashboard;
