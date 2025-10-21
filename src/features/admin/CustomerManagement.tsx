import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Eye, MessageSquare, Ban, CheckCircle, 
  Star, TrendingUp, ShoppingBag, Heart, Gift, Award, MoreHorizontal,
  Phone, Mail, Calendar, DollarSign, Package, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  loyalty_level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  loyalty_points: number;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  last_order_date?: string;
  last_login?: string;
  created_at: string;
  location?: string;
  preferences?: {
    categories: string[];
    price_range: { min: number; max: number };
    notifications: boolean;
  };
  risk_score: number;
  lifetime_value: number;
  churn_probability: number;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  churningCustomers: number;
  averageLifetimeValue: number;
  customerSatisfactionScore: number;
}

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loyaltyFilter, setLoyaltyFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 15420,
    activeCustomers: 12890,
    newCustomersThisMonth: 1234,
    churningCustomers: 156,
    averageLifetimeValue: 85420,
    customerSatisfactionScore: 4.6
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      // Mock data for now
      const mockCustomers: Customer[] = [
        {
          id: '1',
          full_name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+234-801-234-5678',
          status: 'active',
          loyalty_level: 'gold',
          loyalty_points: 2450,
          total_orders: 23,
          total_spent: 145000,
          average_order_value: 6304,
          last_order_date: '2024-01-18T10:30:00Z',
          last_login: '2024-01-20T14:25:00Z',
          created_at: '2023-06-15T09:00:00Z',
          location: 'Lagos, Nigeria',
          preferences: {
            categories: ['electronics', 'fashion'],
            price_range: { min: 5000, max: 50000 },
            notifications: true
          },
          risk_score: 20,
          lifetime_value: 185000,
          churn_probability: 15
        },
        {
          id: '2',
          full_name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+234-802-345-6789',
          status: 'active',
          loyalty_level: 'platinum',
          loyalty_points: 5890,
          total_orders: 47,
          total_spent: 320000,
          average_order_value: 6808,
          last_order_date: '2024-01-19T16:45:00Z',
          last_login: '2024-01-20T09:15:00Z',
          created_at: '2023-03-20T11:30:00Z',
          location: 'Abuja, Nigeria',
          preferences: {
            categories: ['real_estate', 'automotive'],
            price_range: { min: 50000, max: 500000 },
            notifications: true
          },
          risk_score: 5,
          lifetime_value: 420000,
          churn_probability: 8
        },
        {
          id: '3',
          full_name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          status: 'inactive',
          loyalty_level: 'silver',
          loyalty_points: 890,
          total_orders: 8,
          total_spent: 45000,
          average_order_value: 5625,
          last_order_date: '2023-12-05T12:20:00Z',
          last_login: '2023-12-15T10:45:00Z',
          created_at: '2023-08-10T14:00:00Z',
          location: 'Port Harcourt, Nigeria',
          preferences: {
            categories: ['fashion', 'home'],
            price_range: { min: 2000, max: 25000 },
            notifications: false
          },
          risk_score: 85,
          lifetime_value: 55000,
          churn_probability: 78
        }
      ];

      setCustomers(mockCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesLoyalty = loyaltyFilter === 'all' || customer.loyalty_level === loyaltyFilter;
    
    return matchesSearch && matchesStatus && matchesLoyalty;
  });

  const handleCustomerAction = async (customerId: string, action: string) => {
    try {
      // TODO: Implement actual API calls
      console.log(`Performing ${action} on customer ${customerId}`);
      
      if (action === 'suspend' || action === 'activate') {
        setCustomers(prev => prev.map(customer => 
          customer.id === customerId 
            ? { ...customer, status: action === 'suspend' ? 'suspended' : 'active' as any }
            : customer
        ));
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLoyaltyBadge = (level: string) => {
    const levelColors = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-purple-100 text-purple-800',
      diamond: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge variant="secondary" className={levelColors[level as keyof typeof levelColors]}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { label: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (score <= 60) return { label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-600 mt-2">Manage customer relationships and analytics</p>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold">{stats.activeCustomers.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold">{stats.newCustomersThisMonth.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">At Risk</p>
                <p className="text-2xl font-bold">{stats.churningCustomers}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. LTV</p>
                <p className="text-2xl font-bold">₦{(stats.averageLifetimeValue / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold">{stats.customerSatisfactionScore}/5</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Database</CardTitle>
          <CardDescription>Manage and analyze customer relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={loyaltyFilter} onValueChange={setLoyaltyFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by loyalty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
                <SelectItem value="diamond">Diamond</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Loyalty Level</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => {
                  const riskLevel = getRiskLevel(customer.risk_score);
                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={customer.avatar_url} />
                            <AvatarFallback>
                              {customer.full_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{customer.full_name}</p>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                            {customer.location && (
                              <p className="text-xs text-gray-500">{customer.location}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLoyaltyBadge(customer.loyalty_level)}
                          <span className="text-sm text-gray-600">
                            {customer.loyalty_points} pts
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customer.total_orders}</p>
                          <p className="text-sm text-gray-600">
                            ₦{customer.average_order_value.toLocaleString()} avg
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">₦{customer.total_spent.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">
                          LTV: ₦{(customer.lifetime_value / 1000).toFixed(0)}K
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${riskLevel.bg} ${riskLevel.color}`}>
                          {riskLevel.label} ({customer.risk_score}%)
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {customer.last_login ? new Date(customer.last_login).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => {
                                  e.preventDefault();
                                  setSelectedCustomer(customer);
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </DialogTrigger>
                            </Dialog>
                            <DropdownMenuItem onClick={() => handleCustomerAction(customer.id, 'message')}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            {customer.status === 'active' ? (
                              <DropdownMenuItem onClick={() => handleCustomerAction(customer.id, 'suspend')}>
                                <Ban className="h-4 w-4 mr-2" />
                                Suspend Customer
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleCustomerAction(customer.id, 'activate')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate Customer
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No customers found matching your search criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customer Profile - {selectedCustomer.full_name}</DialogTitle>
              <DialogDescription>
                Complete customer information and analytics
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={selectedCustomer.avatar_url} />
                          <AvatarFallback className="text-lg">
                            {selectedCustomer.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{selectedCustomer.full_name}</h3>
                          <p className="text-gray-600">{selectedCustomer.email}</p>
                          {selectedCustomer.phone && (
                            <p className="text-gray-600">{selectedCustomer.phone}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Status</p>
                          {getStatusBadge(selectedCustomer.status)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Loyalty Level</p>
                          {getLoyaltyBadge(selectedCustomer.loyalty_level)}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-600">Location</p>
                        <p className="text-sm">{selectedCustomer.location || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-600">Member Since</p>
                        <p className="text-sm">{new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{selectedCustomer.total_orders}</p>
                          <p className="text-sm text-gray-600">Total Orders</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">₦{selectedCustomer.total_spent.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Total Spent</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                        <p className="text-xl font-semibold">₦{selectedCustomer.average_order_value.toLocaleString()}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-600">Lifetime Value</p>
                        <p className="text-xl font-semibold">₦{selectedCustomer.lifetime_value.toLocaleString()}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-600">Loyalty Points</p>
                        <p className="text-xl font-semibold">{selectedCustomer.loyalty_points.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Risk Score</span>
                          <span>{selectedCustomer.risk_score}%</span>
                        </div>
                        <Progress value={selectedCustomer.risk_score} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Churn Probability</span>
                          <span>{selectedCustomer.churn_probability}%</span>
                        </div>
                        <Progress value={selectedCustomer.churn_probability} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="orders" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Order history will be loaded here...</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Detailed analytics and insights will be displayed here...</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="communication" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Communication History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Customer communication logs will be shown here...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CustomerManagement;
