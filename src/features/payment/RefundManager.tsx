import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { Refund, RefundRequest, RefundReason } from './types';
import { advancedPaymentService } from '@/services/advancedPaymentService';
import { toast } from 'sonner';

interface RefundManagerProps {
  orderId?: string;
  onRefundProcessed?: (refund: Refund) => void;
}

export const RefundManager: React.FC<RefundManagerProps> = ({ 
  orderId, 
  onRefundProcessed 
}) => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refundRequest, setRefundRequest] = useState<RefundRequest>({
    orderId: orderId || '',
    amount: 0,
    reason: 'defective_product',
    description: '',
    refundMethod: 'original_payment'
  });

  const refundReasons: { value: RefundReason; label: string }[] = [
    { value: 'defective_product', label: 'Defective Product' },
    { value: 'wrong_item', label: 'Wrong Item Received' },
    { value: 'not_as_described', label: 'Not as Described' },
    { value: 'damaged_shipping', label: 'Damaged During Shipping' },
    { value: 'customer_request', label: 'Customer Request' },
    { value: 'duplicate_order', label: 'Duplicate Order' },
    { value: 'fraud', label: 'Fraudulent Transaction' },
    { value: 'other', label: 'Other' }
  ];

  const refundMethods = [
    { value: 'original_payment', label: 'Original Payment Method' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'store_credit', label: 'Store Credit' },
    { value: 'cash', label: 'Cash' }
  ];

  useEffect(() => {
    loadRefunds();
  }, []);

  const loadRefunds = async () => {
    setLoading(true);
    try {
      const refundData = await advancedPaymentService.getRefunds();
      setRefunds(refundData);
    } catch (error) {
      toast.error('Failed to load refunds');
      console.error('Refund loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const processRefund = async () => {
    if (!refundRequest.orderId || !refundRequest.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const refund = await advancedPaymentService.processRefund(refundRequest);
      setRefunds(prev => [refund, ...prev]);
      onRefundProcessed?.(refund);
      toast.success('Refund processed successfully');
      
      // Reset form
      setRefundRequest({
        orderId: '',
        amount: 0,
        reason: 'defective_product',
        description: '',
        refundMethod: 'original_payment'
      });
    } catch (error) {
      toast.error('Failed to process refund');
      console.error('Refund processing error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRefundStatus = async (refundId: string, status: string) => {
    setLoading(true);
    try {
      await advancedPaymentService.updateRefundStatus(refundId, status);
      setRefunds(prev => prev.map(refund => 
        refund.id === refundId ? { ...refund, status } : refund
      ));
      toast.success('Refund status updated');
    } catch (error) {
      toast.error('Failed to update refund status');
    } finally {
      setLoading(false);
    }
  };

  const getRefundStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge variant="outline"><RefreshCw className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'completed':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = refund.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         refund.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportRefunds = async () => {
    try {
      const csvData = await advancedPaymentService.exportRefunds();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `refunds-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export refunds');
    }
  };

  return (
    <div className="space-y-6">
      {/* Process New Refund */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-6 h-6" />
            Process Refund
          </CardTitle>
          <CardDescription>
            Process a new refund request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="refundOrderId">Order ID</Label>
              <Input
                id="refundOrderId"
                value={refundRequest.orderId}
                onChange={(e) => setRefundRequest(prev => ({ ...prev, orderId: e.target.value }))}
                placeholder="Enter order ID"
              />
            </div>
            <div>
              <Label htmlFor="refundAmount">Refund Amount</Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                min="0"
                value={refundRequest.amount}
                onChange={(e) => setRefundRequest(prev => ({ ...prev, amount: Number(e.target.value) }))}
                placeholder="Enter refund amount"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="refundReason">Reason</Label>
              <Select 
                value={refundRequest.reason} 
                onValueChange={(value) => setRefundRequest(prev => ({ ...prev, reason: value as RefundReason }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {refundReasons.map(reason => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="refundMethod">Refund Method</Label>
              <Select 
                value={refundRequest.refundMethod} 
                onValueChange={(value) => setRefundRequest(prev => ({ ...prev, refundMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {refundMethods.map(method => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="refundDescription">Description</Label>
            <Textarea
              id="refundDescription"
              value={refundRequest.description}
              onChange={(e) => setRefundRequest(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter refund description or additional details"
              rows={3}
            />
          </div>

          <Button 
            onClick={processRefund} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Process Refund'}
          </Button>
        </CardContent>
      </Card>

      {/* Refund Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Refund Management
          </CardTitle>
          <CardDescription>
            View and manage all refund requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by order ID or customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportRefunds}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Refunds Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRefunds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-gray-500">
                      <RefreshCw className="w-8 h-8 mx-auto mb-2" />
                      No refunds found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRefunds.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell className="font-medium">{refund.orderId}</TableCell>
                    <TableCell>{refund.customerName}</TableCell>
                    <TableCell>₦{refund.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className="capitalize">
                        {refund.reason.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>{getRefundStatusBadge(refund.status)}</TableCell>
                    <TableCell>{new Date(refund.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {refund.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateRefundStatus(refund.id, 'processing')}
                              disabled={loading}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateRefundStatus(refund.id, 'cancelled')}
                              disabled={loading}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {refund.status === 'processing' && (
                          <Button
                            size="sm"
                            onClick={() => updateRefundStatus(refund.id, 'completed')}
                            disabled={loading}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Refunds</p>
                    <p className="text-2xl font-bold">{refunds.length}</p>
                  </div>
                  <RefreshCw className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold">
                      {refunds.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold">
                      {refunds.filter(r => r.status === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold">
                      ₦{refunds.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
