import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RefundStats {
  totalRequests: number;
  pendingReview: number;
  approvedAmount: number;
  rejectedCount: number;
  averageProcessingTime: number;
  totalRefunded: number;
  monthlyTrend: number;
}

interface RefundSummary {
  id: string;
  orderId: string;
  customerName: string;
  productName: string;
  amount: number;
  reason: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'processed' | 'completed';
  requestedAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high';
}

interface RefundManagementProps {
  refunds: RefundSummary[];
  stats: RefundStats;
  onViewRefund: (id: string) => void;
  onExportData: () => void;
  userRole: 'admin' | 'seller' | 'customer';
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  processed: { label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle }
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', color: 'bg-orange-100 text-orange-700' },
  high: { label: 'High', color: 'bg-red-100 text-red-700' }
};

export function RefundManagement({ refunds, stats, onViewRefund, onExportData, userRole }: RefundManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('requestedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredRefunds = useMemo(() => {
    let filtered = refunds.filter(refund => {
      const matchesSearch = searchTerm === '' || 
        refund.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        refund.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        refund.productName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || refund.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof RefundSummary];
      let bValue = b[sortBy as keyof RefundSummary];
      
      if (sortBy === 'amount') {
        aValue = a.amount;
        bValue = b.amount;
      } else if (sortBy === 'requestedAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [refunds, searchTerm, statusFilter, priorityFilter, sortBy, sortOrder]);

  const getUrgentRefunds = () => {
    const urgentStatuses = ['pending', 'under_review'];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return refunds.filter(refund => 
      urgentStatuses.includes(refund.status) && 
      new Date(refund.requestedAt) < sevenDaysAgo
    );
  };

  const urgentRefunds = getUrgentRefunds();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Refund Management</h1>
          <p className="text-gray-500">Monitor and process refund requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{stats.totalRequests}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pendingReview}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Refunded</p>
                <p className="text-2xl font-bold">${stats.totalRefunded.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Processing</p>
                <p className="text-2xl font-bold">{stats.averageProcessingTime}d</p>
                <div className="flex items-center gap-1 mt-1">
                  {stats.monthlyTrend > 0 ? (
                    <TrendingDown className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-red-500" />
                  )}
                  <span className={cn(
                    "text-xs",
                    stats.monthlyTrend > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {Math.abs(stats.monthlyTrend)}% vs last month
                  </span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Alerts */}
      {urgentRefunds.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Urgent Attention Required ({urgentRefunds.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-3">
              The following refunds have been pending for more than 7 days:
            </p>
            <div className="space-y-2">
              {urgentRefunds.slice(0, 3).map((refund) => (
                <div key={refund.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <span className="font-medium">#{refund.orderId}</span>
                    <span className="text-gray-600 ml-2">{refund.customerName}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewRefund(refund.id)}
                  >
                    Review
                  </Button>
                </div>
              ))}
              {urgentRefunds.length > 3 && (
                <p className="text-sm text-orange-600">
                  ...and {urgentRefunds.length - 3} more
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by order ID, customer name, or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requestedAt">Request Date</SelectItem>
                  <SelectItem value="updatedAt">Last Updated</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="customerName">Customer</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refunds Table */}
      <Card>
        <CardHeader>
          <CardTitle>Refund Requests ({filteredRefunds.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRefunds.map((refund) => {
                  const StatusIcon = STATUS_CONFIG[refund.status].icon;
                  const isOverdue = new Date(refund.requestedAt) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  
                  return (
                    <TableRow key={refund.id} className={cn(isOverdue && "bg-red-50")}>
                      <TableCell className="font-medium">
                        #{refund.orderId}
                        {isOverdue && (
                          <AlertCircle className="inline h-3 w-3 text-red-500 ml-1" />
                        )}
                      </TableCell>
                      <TableCell>{refund.customerName}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {refund.productName}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${refund.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {refund.reason.replace('_', ' ')}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("px-2 py-1", STATUS_CONFIG[refund.status].color)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {STATUS_CONFIG[refund.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("px-2 py-1", PRIORITY_CONFIG[refund.priority].color)}>
                          {PRIORITY_CONFIG[refund.priority].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(refund.requestedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewRefund(refund.id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredRefunds.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No refund requests found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default RefundManagement;
