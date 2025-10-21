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
  Home, DollarSign, Users, Calendar, Wrench, AlertTriangle,
  TrendingUp, Plus, Eye, Edit, CheckCircle, Clock,
  FileText, Phone, Mail, MapPin, Star, BarChart3
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  address: string;
  type: 'single_family' | 'apartment' | 'condo' | 'townhouse';
  status: 'vacant' | 'occupied' | 'maintenance' | 'for_rent' | 'for_sale';
  monthlyRent?: number;
  currentTenant?: {
    name: string;
    phone: string;
    email: string;
    leaseStart: string;
    leaseEnd: string;
  };
  lastInspection: string;
  images: string[];
}

interface MaintenanceRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  tenantName: string;
  issue: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  submittedDate: string;
  estimatedCost?: number;
}

interface FinancialRecord {
  id: string;
  propertyId: string;
  type: 'rent' | 'expense' | 'maintenance' | 'tax' | 'insurance';
  amount: number;
  description: string;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
}

interface OwnerStats {
  totalProperties: number;
  occupiedProperties: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingMaintenance: number;
  overduePayments: number;
  occupancyRate: number;
  avgRent: number;
}

export const EnhancedHouseOwnerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [stats, setStats] = useState<OwnerStats>({
    totalProperties: 0,
    occupiedProperties: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    pendingMaintenance: 0,
    overduePayments: 0,
    occupancyRate: 0,
    avgRent: 0
  });

  useEffect(() => {
    loadOwnerData();
  }, []);

  const loadOwnerData = async () => {
    try {
      setLoading(true);
      
      // Load properties
      const propertiesResponse = await apiClient.get('/api/house-owner/properties');
      if (propertiesResponse.data) {
        setProperties(propertiesResponse.data);
      }
      
      // Load maintenance requests
      const maintenanceResponse = await apiClient.get('/api/house-owner/maintenance');
      if (maintenanceResponse.data) {
        setMaintenanceRequests(maintenanceResponse.data);
      }
      
      // Load financial records
      const financialResponse = await apiClient.get('/api/house-owner/financials');
      if (financialResponse.data) {
        setFinancialRecords(financialResponse.data);
      }
      
      // Load stats
      const statsResponse = await apiClient.get('/api/house-owner/stats');
      if (statsResponse.data) {
        setStats(statsResponse.data);
      }
      
    } catch (error) {
      console.error('Error loading house owner data:', error);
      toast.error('Failed to load house owner data');
    } finally {
      setLoading(false);
    }
  };

  const getPropertyStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'occupied': return 'bg-green-100 text-green-800 border-green-200';
      case 'vacant': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance': return 'bg-red-100 text-red-800 border-red-200';
      case 'for_rent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'for_sale': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: MaintenanceRequest['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const customActions = [
    {
      label: 'Add Property',
      icon: Plus,
      onClick: () => navigate('/house-owner/properties/new'),
      variant: 'default' as const
    },
    {
      label: 'My Properties',
      icon: Home,
      onClick: () => navigate('/house-owner/properties')
    },
    {
      label: 'Financials',
      icon: BarChart3,
      onClick: () => navigate('/house-owner/financials')
    }
  ];

  const roleSpecificContent = (
    <div className="space-y-6">
      {/* Owner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">{stats.occupancyRate}% occupied</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-gray-900">${stats.monthlyIncome.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">Avg ${stats.avgRent.toLocaleString()} per property</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                <p className="text-2xl font-bold text-gray-900">${stats.monthlyExpenses.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">Net: ${(stats.monthlyIncome - stats.monthlyExpenses).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingMaintenance}</p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <Wrench className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              {stats.pendingMaintenance > 0 ? (
                <span className="text-orange-600">Needs attention</span>
              ) : (
                <span className="text-green-600">All caught up</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              My Properties
            </CardTitle>
            <CardDescription>
              Manage your property portfolio and tenant information
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/house-owner/properties/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties added</h3>
              <p className="text-gray-500 mb-4">Start by adding your first property to manage.</p>
              <Button onClick={() => navigate('/house-owner/properties/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Property
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        {property.status.replace('_', ' ')}
                      </Badge>
                      {property.monthlyRent && (
                        <span className="text-lg font-bold text-green-600">
                          ${property.monthlyRent.toLocaleString()}/mo
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{property.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.address}
                    </p>
                    
                    {property.currentTenant && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <h4 className="font-medium text-blue-900 mb-1">Current Tenant</h4>
                        <p className="text-sm text-blue-700">{property.currentTenant.name}</p>
                        <p className="text-xs text-blue-600">
                          Lease: {new Date(property.currentTenant.leaseStart).toLocaleDateString()} - 
                          {new Date(property.currentTenant.leaseEnd).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Last inspected: {new Date(property.lastInspection).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
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

      {/* Maintenance Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Maintenance Requests
            </CardTitle>
            <CardDescription>
              Recent maintenance requests from your tenants
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/house-owner/maintenance')}>
            View All Requests
          </Button>
        </CardHeader>
        <CardContent>
          {maintenanceRequests.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance requests</h3>
              <p className="text-gray-500">All your properties are in good shape!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {maintenanceRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                        <Badge variant="outline">
                          {request.status}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">{request.issue}</h3>
                      <p className="text-sm text-gray-600 mb-2">{request.propertyTitle}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Tenant: {request.tenantName}</span>
                        <span>Submitted: {new Date(request.submittedDate).toLocaleDateString()}</span>
                        {request.estimatedCost && (
                          <span className="font-medium">Est. cost: ${request.estimatedCost}</span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
              
              {maintenanceRequests.length > 5 && (
                <Button variant="outline" className="w-full" onClick={() => navigate('/house-owner/maintenance')}>
                  View All Requests ({maintenanceRequests.length})
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
      <TabsTrigger value="tenants">Tenants</TabsTrigger>
      <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
      <TabsTrigger value="financials">Financials</TabsTrigger>
    </>
  );

  const additionalTabsContent = (
    <>
      <TabsContent value="properties" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Management</CardTitle>
            <CardDescription>Detailed property management and portfolio overview</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Advanced property management coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tenants" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Management</CardTitle>
            <CardDescription>Manage tenant relationships and lease agreements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Tenant management system coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="maintenance" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Management</CardTitle>
            <CardDescription>Track and manage maintenance requests and schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Maintenance tracking system coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="financials" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Management</CardTitle>
            <CardDescription>Track income, expenses, and financial performance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Financial management dashboard coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );

  return (
    <EnhancedProfile
      role="house_owner"
      customActions={customActions}
      roleSpecificContent={roleSpecificContent}
      additionalTabTriggers={additionalTabTriggers}
      additionalTabsContent={additionalTabsContent}
    />
  );
};