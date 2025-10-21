import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Users, Truck, Package, TrendingUp, Clock, MapPin,
  Star, DollarSign, Calendar, Search, Filter, Plus,
  Eye, Edit, Trash2, CheckCircle, XCircle, AlertTriangle,
  Phone, Mail, Navigation, BarChart3, PieChart, Activity,
  RefreshCw, Download, Upload, Settings, Bell, MessageSquare
} from 'lucide-react';

interface DeliveryAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  rating: number;
  totalDeliveries: number;
  completionRate: number;
  earnings: number;
  joinDate: string;
  lastActive: string;
  vehicleType: string;
  licensePlate: string;
  serviceAreas: string[];
  availability: 'available' | 'busy' | 'offline';
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

interface DeliveryAssignment {
  id: string;
  orderId: string;
  agentId: string;
  agentName: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  seller: {
    name: string;
    address: string;
  };
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  priority: 'standard' | 'express' | 'urgent';
  estimatedDelivery: string;
  actualDelivery?: string;
  items: {
    name: string;
    quantity: number;
  }[];
  totalValue: number;
  deliveryFee: number;
  createdAt: string;
  distance: number;
}

interface PerformanceMetrics {
  totalRevenue: number;
  totalDeliveries: number;
  activeAgents: number;
  avgDeliveryTime: number;
  customerSatisfaction: number;
  completionRate: number;
  revenueGrowth: number;
  newAgentsThisMonth: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export const DeliveryAgencyDashboard: React.FC = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();

  // State management
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAgent, setSelectedAgent] = useState<DeliveryAgent | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);

  // Data state
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalRevenue: 0,
    totalDeliveries: 0,
    activeAgents: 0,
    avgDeliveryTime: 0,
    customerSatisfaction: 0,
    completionRate: 0,
    revenueGrowth: 0,
    newAgentsThisMonth: 0
  });

  // Filter state
  const [agentFilter, setAgentFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [agentsRes, assignmentsRes, metricsRes] = await Promise.all([
        apiClient.get('/api/delivery/agents'),
        apiClient.get(`/api/delivery/assignments?dateRange=${dateRange}`),
        apiClient.get(`/api/delivery/metrics?dateRange=${dateRange}`)
      ]);

      if (agentsRes.success) setAgents(agentsRes.data);
      if (assignmentsRes.success) setAssignments(assignmentsRes.data);
      if (metricsRes.success) setMetrics(metricsRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAgentStatusChange = async (agentId: string, status: DeliveryAgent['status']) => {
    try {
      const response = await apiClient.put(`/api/delivery/agents/${agentId}/status`, { status });
      if (response.success) {
        setAgents(prev => prev.map(agent =>
          agent.id === agentId ? { ...agent, status } : agent
        ));
        toast.success(`Agent status updated to ${status}`);
      }
    } catch (error) {
      console.error('Error updating agent status:', error);
      toast.error('Failed to update agent status');
    }
  };

  const handleAssignmentUpdate = async (assignmentId: string, updates: Partial<DeliveryAssignment>) => {
    try {
      const response = await apiClient.put(`/api/delivery/assignments/${assignmentId}`, updates);
      if (response.success) {
        setAssignments(prev => prev.map(assignment =>
          assignment.id === assignmentId ? { ...assignment, ...updates } : assignment
        ));
        toast.success('Assignment updated successfully');
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update assignment');
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesFilter = agentFilter === 'all' || agent.status === agentFilter;
    const matchesSearch = searchQuery === '' || 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredAssignments = assignments.filter(assignment => {
    const matchesFilter = assignmentFilter === 'all' || assignment.status === assignmentFilter;
    const matchesSearch = searchQuery === '' ||
      assignment.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'delivered': case 'available':
        return 'bg-green-100 text-green-800';
      case 'pending': case 'assigned': case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended': case 'failed': case 'offline':
        return 'bg-red-100 text-red-800';
      case 'in_transit': case 'picked_up':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'express':
        return 'bg-orange-100 text-orange-800';
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +{metrics.revenueGrowth}% from last period
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold">{metrics.totalDeliveries.toLocaleString()}</p>
                <p className="text-sm text-blue-600 flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {Math.round(metrics.completionRate)}% completion rate
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Agents</p>
                <p className="text-2xl font-bold">{metrics.activeAgents}</p>
                <p className="text-sm text-purple-600 flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  {metrics.newAgentsThisMonth} new this month
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customer Rating</p>
                <p className="text-2xl font-bold">{metrics.customerSatisfaction.toFixed(1)}</p>
                <p className="text-sm text-yellow-600 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  Avg delivery: {metrics.avgDeliveryTime} min
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Revenue Chart Placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Delivery Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Status Distribution Chart Placeholder</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignments.slice(0, 5).map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Order #{assignment.orderId}</p>
                    <p className="text-sm text-gray-600">
                      Assigned to {assignment.agentName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(assignment.status)}>
                    {assignment.status.replace('_', ' ')}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(assignment.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAgents = () => (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search agents..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={agentFilter} onValueChange={setAgentFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Agent
        </Button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-sm text-gray-600">{agent.vehicleType}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(agent.status)}>
                  {agent.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{agent.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Deliveries</span>
                  <span>{agent.totalDeliveries}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completion</span>
                  <span>{agent.completionRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Earnings</span>
                  <span>${agent.earnings.toLocaleString()}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedAgent(agent);
                      setShowAgentModal(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
                <Select
                  value={agent.status}
                  onValueChange={(status) => handleAgentStatusChange(agent.id, status as DeliveryAgent['status'])}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search assignments..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="picked_up">Picked Up</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Agent</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Priority</th>
                  <th className="p-4 font-medium">Value</th>
                  <th className="p-4 font-medium">ETA</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">#{assignment.orderId}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(assignment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="font-medium">{assignment.agentName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{assignment.customer.name}</p>
                        <p className="text-sm text-gray-600">{assignment.customer.phone}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={getPriorityColor(assignment.priority)}>
                        {assignment.priority}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">${assignment.totalValue}</p>
                        <p className="text-sm text-gray-600">
                          Fee: ${assignment.deliveryFee}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">
                        {new Date(assignment.estimatedDelivery).toLocaleString()}
                      </p>
                      {assignment.actualDelivery && (
                        <p className="text-sm text-green-600">
                          Delivered: {new Date(assignment.actualDelivery).toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Navigation className="w-4 h-4" />
                        </Button>
                        <Select
                          value={assignment.status}
                          onValueChange={(status) => 
                            handleAssignmentUpdate(assignment.id, { status: status as DeliveryAssignment['status'] })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="assigned">Assigned</SelectItem>
                            <SelectItem value="picked_up">Picked Up</SelectItem>
                            <SelectItem value="in_transit">In Transit</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics & Reports</h2>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Average Delivery Time</span>
                <span className="font-medium">{metrics.avgDeliveryTime} min</span>
              </div>
              <Progress value={75} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>On-Time Delivery Rate</span>
                <span className="font-medium">{metrics.completionRate}%</span>
              </div>
              <Progress value={metrics.completionRate} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Customer Satisfaction</span>
                <span className="font-medium">{metrics.customerSatisfaction.toFixed(1)}/5</span>
              </div>
              <Progress value={(metrics.customerSatisfaction / 5) * 100} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Revenue Analytics Chart Placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Agent Performance Chart Placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Geographic Map Placeholder</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Agency Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agencyName">Agency Name</Label>
              <Input id="agencyName" placeholder="Your Agency Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input id="contactEmail" type="email" placeholder="contact@agency.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Assignment Alerts</p>
                <p className="text-sm text-gray-600">Get notified of new delivery assignments</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Performance Reports</p>
                <p className="text-sm text-gray-600">Weekly performance summary emails</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Agent Status Changes</p>
                <p className="text-sm text-gray-600">Alerts when agents change status</p>
              </div>
              <input type="checkbox" className="toggle" />
            </div>
            <Button>Update Preferences</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Delivery Agency Dashboard</h1>
              <p className="text-gray-600">Manage your delivery network and track performance</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={loadDashboardData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button>
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            {renderAgents()}
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            {renderAssignments()}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {renderAnalytics()}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {renderSettings()}
          </TabsContent>
        </Tabs>
      </div>

      {/* Agent Detail Modal */}
      <Dialog open={showAgentModal} onOpenChange={setShowAgentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agent Details</DialogTitle>
            <DialogDescription>
              View and manage agent information
            </DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="font-medium">{selectedAgent.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedAgent.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="font-medium">{selectedAgent.phone}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedAgent.status)}>
                    {selectedAgent.status}
                  </Badge>
                </div>
                <div>
                  <Label>Vehicle</Label>
                  <p className="font-medium">{selectedAgent.vehicleType} - {selectedAgent.licensePlate}</p>
                </div>
                <div>
                  <Label>Rating</Label>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{selectedAgent.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div>
                <Label>Service Areas</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedAgent.serviceAreas.map((area, index) => (
                    <Badge key={index} variant="outline">{area}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};