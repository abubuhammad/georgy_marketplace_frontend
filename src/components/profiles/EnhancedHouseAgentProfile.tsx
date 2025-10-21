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
  Search, Users, Home, MapPin, Phone, Mail, Calendar,
  DollarSign, TrendingUp, Eye, MessageCircle, Plus,
  Star, Clock, CheckCircle, FileText, BarChart3, Award
} from 'lucide-react';

interface PropertyMatch {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: 'sale' | 'rent';
  matchScore: number;
  clientId: string;
  clientName: string;
  status: 'new' | 'shown' | 'interested' | 'declined';
  images: string[];
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'buyer' | 'renter';
  budget: {
    min: number;
    max: number;
  };
  preferences: {
    bedrooms: number;
    bathrooms: number;
    location: string;
    propertyType: string;
  };
  status: 'active' | 'inactive' | 'completed';
  lastContact: string;
  propertiesViewed: number;
}

interface AgentStats {
  activeClients: number;
  propertiesMatched: number;
  viewingsScheduled: number;
  dealsCompleted: number;
  avgResponseTime: number;
  clientSatisfaction: number;
  monthlyCommission: number;
  totalEarnings: number;
}

export const EnhancedHouseAgentProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [propertyMatches, setPropertyMatches] = useState<PropertyMatch[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<AgentStats>({
    activeClients: 0,
    propertiesMatched: 0,
    viewingsScheduled: 0,
    dealsCompleted: 0,
    avgResponseTime: 0,
    clientSatisfaction: 0,
    monthlyCommission: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    loadAgentData();
  }, []);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      
      // Load property matches
      const matchesResponse = await apiClient.get('/api/house-agent/matches');
      if (matchesResponse.data) {
        setPropertyMatches(matchesResponse.data);
      }
      
      // Load clients
      const clientsResponse = await apiClient.get('/api/house-agent/clients');
      if (clientsResponse.data) {
        setClients(clientsResponse.data);
      }
      
      // Load stats
      const statsResponse = await apiClient.get('/api/house-agent/stats');
      if (statsResponse.data) {
        setStats(statsResponse.data);
      }
      
    } catch (error) {
      console.error('Error loading house agent data:', error);
      toast.error('Failed to load house agent data');
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: PropertyMatch['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shown': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'interested': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const customActions = [
    {
      label: 'Find Properties',
      icon: Search,
      onClick: () => navigate('/house-agent/search'),
      variant: 'default' as const
    },
    {
      label: 'My Clients',
      icon: Users,
      onClick: () => navigate('/house-agent/clients')
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      onClick: () => navigate('/house-agent/analytics')
    }
  ];

  const roleSpecificContent = (
    <div className="space-y-6">
      {/* Agent Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeClients}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">{stats.propertiesMatched} matches</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Commission</p>
                <p className="text-2xl font-bold text-gray-900">${stats.monthlyCommission.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">${stats.totalEarnings.toLocaleString()} total</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deals Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.dealsCompleted}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">{stats.viewingsScheduled} viewings scheduled</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{stats.clientSatisfaction}%</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">{stats.avgResponseTime}h avg response</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Matches */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Recent Property Matches
            </CardTitle>
            <CardDescription>
              AI-powered property matches for your clients
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/house-agent/search')}>
            <Search className="w-4 h-4 mr-2" />
            Find More Properties
          </Button>
        </CardHeader>
        <CardContent>
          {propertyMatches.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No property matches yet</h3>
              <p className="text-gray-500 mb-4">Start by searching for properties that match your clients' needs.</p>
              <Button onClick={() => navigate('/house-agent/search')}>
                <Search className="w-4 h-4 mr-2" />
                Search Properties
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {propertyMatches.slice(0, 6).map((match) => (
                <div key={match.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {match.images.length > 0 ? (
                    <img 
                      src={match.images[0]} 
                      alt={match.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(match.status)}>
                          {match.status}
                        </Badge>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMatchScoreColor(match.matchScore)}`}>
                          {match.matchScore}% match
                        </span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        ${match.price.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{match.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {match.address}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{match.bedrooms} beds</span>
                      <span>{match.bathrooms} baths</span>
                      <span>{match.area} sq ft</span>
                      <Badge variant="outline">{match.type}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">For: {match.clientName}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Clients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Clients
            </CardTitle>
            <CardDescription>
              Clients currently looking for properties
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/house-agent/clients')}>
            View All Clients
          </Button>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active clients</h3>
              <p className="text-gray-500 mb-4">Start building your client base to help them find properties.</p>
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
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {client.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {client.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">
                          Budget: ${client.budget.min.toLocaleString()} - ${client.budget.max.toLocaleString()}
                        </span>
                        <span>{client.preferences.bedrooms} bed, {client.preferences.bathrooms} bath</span>
                        <span>{client.propertiesViewed} properties viewed</span>
                        <span>Last contact: {new Date(client.lastContact).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {clients.length > 5 && (
                <Button variant="outline" className="w-full" onClick={() => navigate('/house-agent/clients')}>
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
      <TabsTrigger value="matches">Property Matches</TabsTrigger>
      <TabsTrigger value="clients">Client Management</TabsTrigger>
      <TabsTrigger value="viewings">Viewings</TabsTrigger>
      <TabsTrigger value="analytics">Performance</TabsTrigger>
    </>
  );

  const additionalTabsContent = (
    <>
      <TabsContent value="matches" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Matching System</CardTitle>
            <CardDescription>AI-powered property recommendations for your clients</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Advanced matching algorithm coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="clients" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Relationship Management</CardTitle>
            <CardDescription>Manage client preferences, communication, and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Advanced CRM system coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="viewings" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Viewing Management</CardTitle>
            <CardDescription>Schedule and manage property viewings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Viewing scheduler coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Analytics</CardTitle>
            <CardDescription>Track your success metrics and client satisfaction</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Performance dashboard coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );

  return (
    <EnhancedProfile
      role="house_agent"
      customActions={customActions}
      roleSpecificContent={roleSpecificContent}
      additionalTabTriggers={additionalTabTriggers}
      additionalTabsContent={additionalTabsContent}
    />
  );
};