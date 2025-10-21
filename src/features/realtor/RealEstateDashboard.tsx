import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Building, Users, Calendar, MessageSquare, TrendingUp,
  Eye, Heart, Phone, Mail, MapPin, Star, Plus, Filter,
  BarChart3, DollarSign, Clock, CheckCircle, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAuthContext } from '@/contexts/AuthContext';
import realEstateService from '@/services/realEstateServiceEnhanced';
import { 
  PropertyDashboard, 
  RealEstateProfessional, 
  Property, 
  PropertyViewing, 
  PropertyInquiry,
  DashboardActivity,
  PerformanceMetrics
} from './types';

const RealEstateDashboard: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  
  const [professional, setProfessional] = useState<RealEstateProfessional | null>(null);
  const [dashboardData, setDashboardData] = useState<PropertyDashboard | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [recentViewings, setRecentViewings] = useState<PropertyViewing[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<PropertyInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load professional profile
      const professionalData = await realEstateService.getProfessionalProfile(user.id);
      setProfessional(professionalData);

      if (professionalData) {
        // Load dashboard data
        const [dashboard, propertiesData] = await Promise.all([
          realEstateService.getProfessionalDashboard(professionalData.id),
          realEstateService.getPropertiesByProfessional(professionalData.id, { limit: 10 })
        ]);
        
        setDashboardData(dashboard);
        setProperties(propertiesData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProfessionalTypeDisplay = (type: string) => {
    switch (type) {
      case 'realtor': return 'Licensed Realtor';
      case 'house_agent': return 'House Agent';
      case 'house_owner': return 'House Owner';
      default: return type;
    }
  };

  const renderDashboardOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.overview.totalListings || 0}
              </p>
              <p className="text-sm text-gray-500">
                {dashboardData?.overview.activeListings || 0} active
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.overview.totalViews || 0}
              </p>
              <p className="text-sm text-gray-500">This month</p>
            </div>
            <div className="p-3 rounded-full bg-green-50">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.overview.totalInquiries || 0}
              </p>
              <p className="text-sm text-gray-500">All time</p>
            </div>
            <div className="p-3 rounded-full bg-purple-50">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Viewings</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.overview.totalViewings || 0}
              </p>
              <p className="text-sm text-gray-500">Scheduled</p>
            </div>
            <div className="p-3 rounded-full bg-orange-50">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformanceMetrics = () => {
    if (!dashboardData?.performanceMetrics) return null;

    const metrics = dashboardData.performanceMetrics;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Compare this month's performance with last month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">This Month</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Listings</span>
                  <span className="font-medium">{metrics.thisMonth.listings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Views</span>
                  <span className="font-medium">{metrics.thisMonth.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Inquiries</span>
                  <span className="font-medium">{metrics.thisMonth.inquiries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Viewings</span>
                  <span className="font-medium">{metrics.thisMonth.viewings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Closed Deals</span>
                  <span className="font-medium">{metrics.thisMonth.closedDeals}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Last Month</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Listings</span>
                  <span className="font-medium">{metrics.lastMonth.listings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Views</span>
                  <span className="font-medium">{metrics.lastMonth.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Inquiries</span>
                  <span className="font-medium">{metrics.lastMonth.inquiries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Viewings</span>
                  <span className="font-medium">{metrics.lastMonth.viewings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Closed Deals</span>
                  <span className="font-medium">{metrics.lastMonth.closedDeals}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Change</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Listings</span>
                  <span className={`font-medium ${metrics.trends.listingsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.trends.listingsChange >= 0 ? '+' : ''}{metrics.trends.listingsChange}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Views</span>
                  <span className={`font-medium ${metrics.trends.viewsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.trends.viewsChange >= 0 ? '+' : ''}{metrics.trends.viewsChange}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Inquiries</span>
                  <span className={`font-medium ${metrics.trends.inquiriesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.trends.inquiriesChange >= 0 ? '+' : ''}{metrics.trends.inquiriesChange}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Viewings</span>
                  <span className={`font-medium ${metrics.trends.viewingsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.trends.viewingsChange >= 0 ? '+' : ''}{metrics.trends.viewingsChange}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Closed Deals</span>
                  <span className={`font-medium ${metrics.trends.closedDealsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.trends.closedDealsChange >= 0 ? '+' : ''}{metrics.trends.closedDealsChange}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRecentProperties = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Properties</CardTitle>
            <CardDescription>Your latest property listings</CardDescription>
          </div>
          <Button onClick={() => navigate('/realtor/properties')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {properties.length > 0 ? (
          <div className="space-y-4">
            {properties.slice(0, 5).map((property) => (
              <div key={property.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                <img
                  src={property.images?.[0]?.imageUrl || '/api/placeholder/80/60'}
                  alt={property.title}
                  className="w-20 h-15 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 line-clamp-1">{property.title}</h4>
                  <p className="text-sm text-gray-600">
                    {property.address.city}, {property.address.state}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-lg font-semibold text-primary">
                      {property.currency}{property.price.toLocaleString()}
                    </span>
                    <Badge className={getStatusColor(property.status)}>
                      {property.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div className="flex items-center space-x-2 mb-1">
                    <Eye className="w-4 h-4" />
                    <span>{property.viewCount}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>{property.inquiryCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
            <p className="text-gray-600 mb-4">
              Start by adding your first property listing
            </p>
            <Button onClick={() => navigate('/realtor/properties/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Property
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderMarketInsights = () => {
    if (!dashboardData?.marketInsights) return null;

    const insights = dashboardData.marketInsights;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Market Insights
          </CardTitle>
          <CardDescription>
            Local market trends and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Price</span>
                <span className="font-medium">₦{insights.averagePriceInArea.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Days on Market</span>
                <span className="font-medium">{insights.medianDaysOnMarket} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Market Trend</span>
                <Badge className={
                  insights.marketTrend === 'rising' ? 'bg-green-100 text-green-800' :
                  insights.marketTrend === 'declining' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }>
                  {insights.marketTrend}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Competitors</span>
                <span className="font-medium">{insights.competitorCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Demand Level</span>
                <Badge className={
                  insights.demandLevel === 'high' ? 'bg-green-100 text-green-800' :
                  insights.demandLevel === 'low' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }>
                  {insights.demandLevel}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
            <div className="space-y-2">
              {insights.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600 mb-6">
            You need to complete your real estate professional profile to access the dashboard.
          </p>
          <Button onClick={() => navigate('/realtor/register')} size="lg">
            Complete Profile
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={professional.user?.avatar} />
                <AvatarFallback>
                  {professional.user?.firstName?.[0]}{professional.user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {professional.user?.firstName}!
                </h1>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">{getProfessionalTypeDisplay(professional.professionalType)}</span>
                  {professional.isVerified && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{professional.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({professional.reviewCount})</span>
                </div>
                <div className="text-sm text-gray-600">
                  Profile {professional.profileCompleteness}% complete
                </div>
              </div>
              <Progress value={professional.profileCompleteness} className="w-16 h-2" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        {renderDashboardOverview()}

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderRecentProperties()}
              {renderMarketInsights()}
            </div>
            {renderPerformanceMetrics()}
          </TabsContent>

          <TabsContent value="properties">
            {renderRecentProperties()}
          </TabsContent>

          <TabsContent value="analytics">
            {renderPerformanceMetrics()}
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendar & Viewings</CardTitle>
                <CardDescription>Manage your property viewings and schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Calendar Feature</h3>
                  <p className="text-gray-600">
                    Advanced calendar management coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RealEstateDashboard;
