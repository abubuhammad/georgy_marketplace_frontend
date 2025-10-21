import React, { useState, useEffect } from 'react';
import { 
  Truck, Package, MapPin, Clock, CheckCircle, AlertCircle,
  Search, Filter, Eye, Phone, MessageSquare, Navigation
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface DeliveryOrder {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  pickup_address: string;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  priority: 'standard' | 'express' | 'urgent';
  estimated_delivery: string;
  actual_delivery?: string;
  tracking_number: string;
  delivery_partner: string;
  driver_name: string;
  driver_phone: string;
  items: Array<{
    name: string;
    quantity: number;
    value: number;
  }>;
  notes?: string;
  created_at: string;
}

interface DeliveryStats {
  totalDeliveries: number;
  pendingDeliveries: number;
  completedToday: number;
  onTimeDeliveryRate: number;
  averageDeliveryTime: string;
}

const DeliveryTracking: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);
  const [stats, setStats] = useState<DeliveryStats>({
    totalDeliveries: 234,
    pendingDeliveries: 45,
    completedToday: 28,
    onTimeDeliveryRate: 92.5,
    averageDeliveryTime: '2.3 hours'
  });

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      // Mock data for now
      const mockDeliveries: DeliveryOrder[] = [
        {
          id: '1',
          order_id: 'ORD001',
          customer_name: 'John Doe',
          customer_phone: '+234-801-234-5678',
          delivery_address: '123 Main St, Lagos, Nigeria',
          pickup_address: 'Electronics Store, Victoria Island',
          status: 'in_transit',
          priority: 'express',
          estimated_delivery: '2024-01-20T16:30:00Z',
          tracking_number: 'TRK001234',
          delivery_partner: 'Express Logistics',
          driver_name: 'Mike Johnson',
          driver_phone: '+234-801-987-6543',
          items: [
            { name: 'iPhone 13 Pro', quantity: 1, value: 450000 },
            { name: 'AirPods Pro', quantity: 1, value: 75000 }
          ],
          notes: 'Fragile items - handle with care',
          created_at: '2024-01-20T10:00:00Z'
        },
        {
          id: '2',
          order_id: 'ORD002',
          customer_name: 'Jane Smith',
          customer_phone: '+234-802-345-6789',
          delivery_address: '456 Oak Ave, Abuja, Nigeria',
          pickup_address: 'Fashion Boutique, Wuse 2',
          status: 'delivered',
          priority: 'standard',
          estimated_delivery: '2024-01-19T18:00:00Z',
          actual_delivery: '2024-01-19T17:45:00Z',
          tracking_number: 'TRK001235',
          delivery_partner: 'City Courier',
          driver_name: 'Sarah Williams',
          driver_phone: '+234-803-456-7890',
          items: [
            { name: 'Summer Dress', quantity: 2, value: 25000 },
            { name: 'Handbag', quantity: 1, value: 15000 }
          ],
          created_at: '2024-01-19T12:00:00Z'
        }
      ];

      setDeliveries(mockDeliveries);
    } catch (error) {
      console.error('Error loading deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.order_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || delivery.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const updateDeliveryStatus = async (deliveryId: string, newStatus: string) => {
    try {
      setDeliveries(prev => prev.map(delivery => 
        delivery.id === deliveryId 
          ? { 
              ...delivery, 
              status: newStatus as any,
              actual_delivery: newStatus === 'delivered' ? new Date().toISOString() : delivery.actual_delivery
            }
          : delivery
      ));
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Assigned</Badge>;
      case 'picked_up':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Picked Up</Badge>;
      case 'in_transit':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">In Transit</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'express':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Express</Badge>;
      case 'standard':
        return <Badge variant="secondary">Standard</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'picked_up':
        return <Truck className="h-4 w-4 text-yellow-600" />;
      case 'in_transit':
        return <Navigation className="h-4 w-4 text-orange-600" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Delivery Tracking</h1>
        <p className="text-gray-600 mt-2">Monitor and manage delivery operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold">{stats.totalDeliveries}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingDeliveries}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold">{stats.completedToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
                <p className="text-2xl font-bold">{stats.onTimeDeliveryRate}%</p>
              </div>
              <Truck className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                <p className="text-2xl font-bold">{stats.averageDeliveryTime}</p>
              </div>
              <Clock className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Deliveries</CardTitle>
          <CardDescription>Track and manage delivery orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by tracking number, customer, or order ID..."
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
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="express">Express</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{delivery.tracking_number}</p>
                        <p className="text-sm text-gray-600">{delivery.order_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{delivery.customer_name}</p>
                        <p className="text-sm text-gray-600">{delivery.customer_phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{delivery.driver_name}</p>
                        <p className="text-sm text-gray-600">{delivery.delivery_partner}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(delivery.status)}
                        {getStatusBadge(delivery.status)}
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(delivery.priority)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(delivery.estimated_delivery).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedDelivery(delivery)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDeliveries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No deliveries found matching your search criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Details Dialog */}
      {selectedDelivery && (
        <Dialog open={!!selectedDelivery} onOpenChange={() => setSelectedDelivery(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Delivery Details - {selectedDelivery.tracking_number}</DialogTitle>
              <DialogDescription>
                Order {selectedDelivery.order_id} for {selectedDelivery.customer_name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedDelivery.status)}
                  {getStatusBadge(selectedDelivery.status)}
                </div>
                {getPriorityBadge(selectedDelivery.priority)}
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Pickup Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedDelivery.pickup_address}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Delivery Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedDelivery.delivery_address}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Customer Contact</h4>
                  <p className="text-sm text-gray-600">{selectedDelivery.customer_name}</p>
                  <p className="text-sm text-gray-600">{selectedDelivery.customer_phone}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Driver Contact</h4>
                  <p className="text-sm text-gray-600">{selectedDelivery.driver_name}</p>
                  <p className="text-sm text-gray-600">{selectedDelivery.driver_phone}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-medium mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedDelivery.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₦{item.value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Estimated Delivery</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedDelivery.estimated_delivery).toLocaleString()}
                  </p>
                </div>
                {selectedDelivery.actual_delivery && (
                  <div>
                    <h4 className="font-medium mb-2">Actual Delivery</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedDelivery.actual_delivery).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedDelivery.notes && (
                <div>
                  <h4 className="font-medium mb-2">Special Notes</h4>
                  <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                    {selectedDelivery.notes}
                  </p>
                </div>
              )}

              {/* Status Update */}
              {selectedDelivery.status !== 'delivered' && selectedDelivery.status !== 'failed' && (
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const nextStatus = 
                        selectedDelivery.status === 'assigned' ? 'picked_up' :
                        selectedDelivery.status === 'picked_up' ? 'in_transit' :
                        'delivered';
                      updateDeliveryStatus(selectedDelivery.id, nextStatus);
                      setSelectedDelivery(null);
                    }}
                  >
                    Update Status
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      updateDeliveryStatus(selectedDelivery.id, 'failed');
                      setSelectedDelivery(null);
                    }}
                  >
                    Mark as Failed
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DeliveryTracking;
