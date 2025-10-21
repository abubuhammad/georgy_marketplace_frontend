import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  Eye, 
  MessageCircle, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Edit3, 
  Trash2,
  MapPin,
  DollarSign,
  Home,
  PiggyBank,
  UserCheck
} from 'lucide-react';
import { RealEstateProfessional, Property, PropertyViewing, PropertyInquiry } from '../types';
import { RealEstateService } from '@/services/realEstateService';
import { useAuthContext } from '@/contexts/AuthContext';

interface HouseOwnerDashboardProps {
  professional: RealEstateProfessional;
}

interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalViews: number;
  totalInquiries: number;
  scheduledViewings: number;
  rentalIncome: number;
  tenantCount: number;
}

export const HouseOwnerDashboard: React.FC<HouseOwnerDashboardProps> = ({ professional }) => {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeProperties: 0,
    totalViews: 0,
    totalInquiries: 0,
    scheduledViewings: 0,
    rentalIncome: 0,
    tenantCount: 0,
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [viewings, setViewings] = useState<PropertyViewing[]>([]);
  const [inquiries, setInquiries] = useState<PropertyInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [professional.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load analytics
      const analyticsData = await RealEstateService.getProfessionalAnalytics(professional.id);
      setStats(analyticsData);

      // Load properties
      const propertiesData = await RealEstateService.getPropertiesByProfessional(professional.id);
      setProperties(propertiesData);

      // Load viewings
      const viewingsData = await RealEstateService.getViewingsByProfessional(professional.id);
      setViewings(viewingsData);

      // Load inquiries
      const inquiriesData = await RealEstateService.getInquiriesByProfessional(professional.id);
      setInquiries(inquiriesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'rented': return 'bg-purple-100 text-purple-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Property Owner Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {professional.user?.firstName} {professional.user?.lastName}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {professional.isVerified && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Verified Owner
            </Badge>
          )}
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProperties} for sale/rent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.rentalIncome)}</div>
            <p className="text-xs text-muted-foreground">
              From rentals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenants</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tenantCount}</div>
            <p className="text-xs text-muted-foreground">
              Active tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Viewings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledViewings}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="properties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="viewings">Viewings</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Properties</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Property
            </Button>
          </div>
          
          {properties.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No properties yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first property listing.</p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {properties.map((property) => (
                <Card key={property.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{property.title}</h3>
                          <Badge className={getStatusColor(property.status)}>
                            {property.status}
                          </Badge>
                          {property.listingType === 'rent' && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              Rental Property
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            {property.address.street}, {property.address.city}, {property.address.state}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-600 mb-2">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">
                            {formatCurrency(property.price, property.currency)}
                            {property.listingType === 'rent' && '/month'}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            • {property.propertyType} • {property.listingType}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {property.viewCount} views
                          </div>
                          <div>
                            {property.bedrooms} bed • {property.bathrooms} bath
                          </div>
                          <div>
                            {property.squareFootage} sq ft
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="viewings" className="space-y-4">
          <h2 className="text-xl font-semibold">Scheduled Viewings</h2>
          
          {viewings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No scheduled viewings</h3>
                <p className="text-gray-600">Viewings will appear here when potential buyers/tenants schedule them.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {viewings.map((viewing) => (
                <Card key={viewing.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{viewing.property?.title}</h3>
                        <p className="text-gray-600 mb-2">
                          with {viewing.requester?.firstName} {viewing.requester?.lastName}
                        </p>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(viewing.scheduledAt)} • {viewing.durationMinutes} minutes
                        </div>
                      </div>
                      <Badge className={getStatusColor(viewing.status)}>
                        {viewing.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inquiries" className="space-y-4">
          <h2 className="text-xl font-semibold">Property Inquiries</h2>
          
          {inquiries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No inquiries yet</h3>
                <p className="text-gray-600">Inquiries from interested buyers/tenants will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inquiry) => (
                <Card key={inquiry.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{inquiry.subject}</h3>
                          <Badge className={getStatusColor(inquiry.status)}>
                            {inquiry.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">
                          From: {inquiry.inquirer?.firstName} {inquiry.inquirer?.lastName}
                        </p>
                        <p className="text-gray-600 mb-2">
                          Property: {inquiry.property?.title}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {inquiry.message}
                        </p>
                        <div className="text-xs text-gray-500">
                          {formatDate(inquiry.createdAt)}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tenants" className="space-y-4">
          <h2 className="text-xl font-semibold">Tenant Management</h2>
          
          <Card>
            <CardContent className="text-center py-8">
              <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Tenant management coming soon</h3>
              <p className="text-gray-600">Track rental payments, tenant communications, and lease agreements.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
