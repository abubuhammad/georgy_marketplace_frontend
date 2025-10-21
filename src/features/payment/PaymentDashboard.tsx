import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users,
  RefreshCw,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Smartphone,
  Building,
  Truck
} from 'lucide-react';
import { PaymentAnalytics, PaymentTransaction, Payout, Refund } from './types';
import { AdvancedPaymentService } from '@/services/advancedPaymentService';

export const PaymentDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load analytics
      const analyticsData = await AdvancedPaymentService.getPaymentAnalytics(
        dateRange.start,
        dateRange.end
      );
      setAnalytics(analyticsData);

      // Load recent transactions (mock data for now)
      setTransactions([
        {
          id: '1',
          referenceNumber: 'PAY1234567890',
          type: 'payment',
          status: 'completed',
          amount: 50000,
          currency: 'NGN',
          amountInBaseCurrency: 50000,
          paymentMethod: 'card',
          provider: 'paystack',
          providerFee: 750,
          platformFee: 500,
          processingFee: 0,
          revenueSplit: {
            platformCommission: {
              name: 'Platform Commission',
              amount: 2500,
              recipientType: 'platform'
            },
            sellerPayout: {
              name: 'Seller Payout',
              amount: 47500,
              recipientType: 'seller'
            },
            additionalFees: []
          },
          description: 'Payment for order ORD-001',
          metadata: {},
          initiatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        // Add more mock transactions...
      ]);

      // Load recent payouts (mock data)
      setPayouts([]);

      // Load recent refunds (mock data)
      setRefunds([]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <RefreshCw className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'refunded': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer': return <Building className="h-4 w-4" />;
      case 'mobile_money': return <Smartphone className="h-4 w-4" />;
      case 'cash_on_delivery': return <Truck className="h-4 w-4" />;
      default: return <Banknote className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading payment dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor transactions, revenue, and financial performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-auto"
            />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-auto"
            />
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={loadDashboardData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">
                  <ArrowUpRight className="inline h-3 w-3 mr-1" />
                  +12.5%
                </span>
                from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalTransactions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">
                  <ArrowUpRight className="inline h-3 w-3 mr-1" />
                  +8.2%
                </span>
                from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(analytics.successRate)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">
                  <ArrowUpRight className="inline h-3 w-3 mr-1" />
                  +2.1%
                </span>
                from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.platformRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">
                  <ArrowUpRight className="inline h-3 w-3 mr-1" />
                  +15.3%
                </span>
                from last period
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Methods Performance */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Performance by payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.paymentMethodBreakdown).map(([method, data]) => (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getPaymentMethodIcon(method)}
                      <span className="font-medium capitalize">{method.replace('_', ' ')}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(data.revenue)}</div>
                      <div className="text-sm text-gray-600">
                        {data.transactions} transactions • {formatPercentage(data.successRate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Platform vs seller revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <span className="font-semibold">{formatCurrency(analytics.totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Platform Commission</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(analytics.platformRevenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Seller Payouts</span>
                  <span className="font-semibold">{formatCurrency(analytics.sellerRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Processing Fees</span>
                  <span className="font-semibold text-red-600">
                    -{formatCurrency(analytics.processingFees)}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Net Platform Revenue</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(analytics.platformRevenue - analytics.processingFees)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <div className="flex space-x-2">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input placeholder="Search transactions..." className="w-64" />
              </div>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Reference</th>
                      <th className="text-left p-4">Amount</th>
                      <th className="text-left p-4">Method</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{transaction.referenceNumber}</div>
                            <div className="text-sm text-gray-600">{transaction.description}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Fee: {formatCurrency(transaction.providerFee + transaction.platformFee)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getPaymentMethodIcon(transaction.paymentMethod)}
                            <span className="capitalize">
                              {transaction.paymentMethod.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(transaction.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(transaction.status)}
                              <span>{transaction.status}</span>
                            </div>
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            {new Date(transaction.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Seller Payouts</h2>
            <Button>Process Pending Payouts</Button>
          </div>
          
          <Card>
            <CardContent className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No payouts to display</h3>
              <p className="text-gray-600">Payout data will appear here when available</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Refund Requests</h2>
            <div className="flex space-x-2">
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card>
            <CardContent className="text-center py-8">
              <RefreshCw className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No refunds to display</h3>
              <p className="text-gray-600">Refund requests will appear here when submitted</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-semibold">Financial Analytics</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Daily revenue over selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600">Revenue chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>Transaction count over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600">Transaction volume chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
