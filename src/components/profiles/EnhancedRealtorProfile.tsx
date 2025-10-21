import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnhancedProfile } from '../enhanced/EnhancedProfile';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home, Users, MapPin, Calendar, DollarSign, TrendingUp,
  Phone, Mail, Star, Eye, Plus, Edit, Clock, CheckCircle,
  BarChart3, FileText, Camera, MessageCircle, Award
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  type: 'sale' | 'rent';
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: 'active' | 'pending' | 'sold' | 'rented' | 'draft';
  address: string;
  images: string[];
  listedDate: string;
  views: number;
  inquiries: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'buyer' | 'seller' | 'tenant' | 'landlord';
  status: 'active' | 'completed' | 'inactive';
  totalTransactions: number;
  lastContact: string;
}

interface RealtorStats {
  totalProperties: number;
  activeListings: number;
  soldProperties: number;
  totalCommission: number;
  activeClients: number;
  avgDaysOnMarket: number;
  successRate: number;
  profileViews: number;
}

export const EnhancedRealtorProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<RealtorStats>({
    totalProperties: 0,
    activeListings: 0,
    soldProperties: 0,
    totalCommission: 0,
    activeClients: 0,
    avgDaysOnMarket: 0,
    successRate: 0,
    profileViews: 0
  });

  useEffect(() => {
    loadRealtorData();
  }, []);

  const loadRealtorData = async () => {
    try {
      setLoading(true);
      
      // Load properties
      const propertiesResponse = await apiClient.get('/api/realtor/properties');
      if (propertiesResponse.data) {
        setProperties(propertiesResponse.data);
      }
      
      // Load clients
      const clientsResponse = await apiClient.get('/api/realtor/clients');
      if (clientsResponse.data) {
        setClients(clientsResponse.data);
      }
      
      // Load stats
      const statsResponse = await apiClient.get('/api/realtor/stats');
      if (statsResponse.data) {
        setStats(statsResponse.data);
      }
      
    } catch (error) {
      console.error('Error loading realtor data:', error);
      toast.error('Failed to load realtor data');
    } finally {
      setLoading(false);
    }
  };

  const getPropertyStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sold': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rented': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const customActions = [
    {
      label: 'Add Property',
      icon: Plus,
      onClick: () => navigate('/realtor/properties/new'),
      variant: 'default' as const
    },
    {
      label: 'My Listings',
      icon: Home,
      onClick: () => navigate('/realtor/properties')
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      onClick: () => navigate('/realtor/analytics')
    }
  ];

  const roleSpecificContent = (
    <div className="space-y-6">
      {/* Realtor Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <Home className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">{stats.totalProperties} total</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commission Earned</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalCommission.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">From {stats.soldProperties} sales</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeClients}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <MessageCircle className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-gray-500">Requiring attention</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">Avg {stats.avgDaysOnMarket} days on market</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Listings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Recent Properties
            </CardTitle>
            <CardDescription>
              Your latest property listings and their performance
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/realtor/properties/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties listed</h3>
              <p className="text-gray-500 mb-4">Start by adding your first property listing.</p>
              <Button onClick={() => navigate('/realtor/properties/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Property
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.slice(0, 6).map((property) => (
                <div key={property.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {property.images.length > 0 ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getPropertyStatusColor(property.status)}>
                        {property.status}
                      </Badge>
                      <span className="text-lg font-bold text-blue-600">
                        ${property.price.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{property.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.address}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{property.bedrooms} beds</span>
                      <span>{property.bathrooms} baths</span>
                      <span>{property.area} sq ft</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {property.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {property.inquiries}
                        </span>
                      </div>
                      <span className="text-gray-400">
                        Listed {new Date(property.listedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Clients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Recent Clients
            </CardTitle>
            <CardDescription>
              Your active clients and their status
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/realtor/clients')}>
            View All Clients
          </Button>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
              <p className="text-gray-500 mb-4">Start building your client base.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clients.slice(0, 5).map((client) => (
                <div key={client.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{client.name}</h3>
                        <Badge variant="outline">{client.type}</Badge>
                        <Badge 
                          variant={client.status === 'active' ? 'default' : 'secondary'}
                        >
                          {client.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {client.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {client.phone}
                        </span>
                        <span>{client.totalTransactions} transactions</span>
                        <span>Last contact: {new Date(client.lastContact).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {clients.length > 5 && (
                <Button variant="outline" className="w-full" onClick={() => navigate('/realtor/clients')}>
                  View All Clients ({clients.length})
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const additionalTabTriggers = (
    <>
      <TabsTrigger value="properties">Properties</TabsTrigger>
      <TabsTrigger value="clients">Clients</TabsTrigger>
      <TabsTrigger value="analytics">Analytics</TabsTrigger>
      <TabsTrigger value="marketing">Marketing</TabsTrigger>
    </>
  );

  const additionalTabsContent = (
    <>
      <TabsContent value="properties" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Management</CardTitle>
            <CardDescription>Manage all your property listings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Advanced property management coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="clients" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Management</CardTitle>
            <CardDescription>Manage your client relationships and communications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              CRM system coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Analytics</CardTitle>
            <CardDescription>Track your sales performance and market insights</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Analytics dashboard coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="marketing" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Marketing Tools</CardTitle>
            <CardDescription>Promote your listings and build your brand</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Marketing tools coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );

  return (
    <EnhancedProfile
      role="realtor"
      customActions={customActions}
      roleSpecificContent={roleSpecificContent}
      additionalTabTriggers={additionalTabTriggers}
      additionalTabsContent={additionalTabsContent}
    />
  );
};