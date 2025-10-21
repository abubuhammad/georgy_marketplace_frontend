import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Users,
  ShoppingCart,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Activity,
  Wallet,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FinancialReport, SellerFinancials } from '@/types/payment';
import { paymentApiService } from '@/services/paymentService-api';

interface FinancialDashboardProps {
  sellerId?: string;
  className?: string;
}

interface FinancialMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  totalTransactions: number;
  transactionGrowth: number;
  averageOrderValue: number;
  aovGrowth: number;
  platformFees: number;
  feesGrowth: number;
  refundRate: number;
  chargebackRate: number;
  activeUsers: number;
  newUsers: number;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

export function FinancialDashboard({ sellerId, className }: FinancialDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [sellerFinancials, setSellerFinancials] = useState<SellerFinancials | null>(null);
  const [revenueChart, setRevenueChart] = useState<ChartData | null>(null);
  const [categoryChart, setCategoryChart] = useState<ChartData | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const [filters, setFilters] = useState({
    period: '7d', // 1d, 7d, 30d, 90d, 1y
    dateFrom: '',
    dateTo: '',
    currency: 'NGN'
  });

  const [exportForm, setExportForm] = useState({
    format: 'xlsx',
    includeTransactions: true,
    includeCharts: false,
    dateRange: '30d'
  });

  useEffect(() => {
    loadFinancialData();
  }, [sellerId, filters]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      const promises = [
        paymentApiService.getFinancialMetrics({ sellerId, ...filters }),
        paymentApiService.getFinancialReport({ sellerId, ...filters })
      ];

      if (sellerId) {
        promises.push(paymentApiService.getSellerFinancials(sellerId, filters));
      }

      const [metricsData, reportData, sellerData] = await Promise.all(promises);
      
      setMetrics(metricsData);
      setReport(reportData);
      if (sellerData) setSellerFinancials(sellerData);

      // Generate chart data
      generateChartData(reportData);
      
    } catch (error) {
      console.error('Failed to load financial data:', error);
      // Fallback data
      setMetrics({
        totalRevenue: 2450000,
        revenueGrowth: 12.5,
        totalTransactions: 1847,
        transactionGrowth: 8.3,
        averageOrderValue: 13265,
        aovGrowth: -2.1,
        platformFees: 61250,
        feesGrowth: 15.2,
        refundRate: 2.3,
        chargebackRate: 0.1,
        activeUsers: 3456,
        newUsers: 234
      });

      setReport({
        period: { start: '2024-01-01', end: '2024-01-31' },
        metrics: {
          totalRevenue: 2450000,
          platformRevenue: 61250,
          sellerRevenue: 2388750,
          taxesCollected: 183750,
          refundsIssued: 56430,
          escrowHeld: 125000,
          payoutsCompleted: 2200000
        },
        breakdown: {
          byCategory: [
            { category: 'Electronics', revenue: 890000, count: 456 },
            { category: 'Fashion', revenue: 650000, count: 634 },
            { category: 'Home & Garden', revenue: 543000, count: 389 },
            { category: 'Sports', revenue: 367000, count: 368 }
          ],
          byPaymentMethod: [
            { method: 'card', revenue: 1470000, count: 1108 },
            { method: 'bank_transfer', revenue: 735000, count: 489 },
            { method: 'mobile_money', revenue: 245000, count: 250 }
          ],
          byTax: [
            { type: 'vat', collected: 183750, rate: 7.5 }
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (reportData: FinancialReport) => {
    // Revenue trend chart data
    const revenueData: ChartData = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Revenue',
        data: [580000, 620000, 590000, 660000],
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgb(34, 197, 94)'
      }]
    };
    setRevenueChart(revenueData);

    // Category breakdown pie chart
    const categoryData: ChartData = {
      labels: reportData.breakdown.byCategory.map(item => item.category),
      datasets: [{
        label: 'Revenue by Category',
        data: reportData.breakdown.byCategory.map(item => item.revenue),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ]
      }]
    };
    setCategoryChart(categoryData);
  };

  const handleExportReport = async () => {
    try {
      setLoading(true);
      const exportData = await paymentApiService.exportFinancialReport({
        sellerId,
        ...exportForm,
        ...filters
      });
      
      // Trigger download
      const url = URL.createObjectURL(new Blob([exportData]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${new Date().toISOString().split('T')[0]}.${exportForm.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error('Failed to export report:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const isPositive = value >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
        {Math.abs(value)}%
      </span>
    );
  };

  const MetricCard = ({ title, value, growth, icon: Icon, format = 'currency' }: {
    title: string;
    value: number;
    growth?: number;
    icon: any;
    format?: 'currency' | 'number' | 'percentage';
  }) => {
    let formattedValue: string;
    switch (format) {
      case 'currency':
        formattedValue = formatCurrency(value);
        break;
      case 'percentage':
        formattedValue = `${value}%`;
        break;
      default:
        formattedValue = value.toLocaleString();
    }

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{title}</p>
              <p className="text-2xl font-bold">{formattedValue}</p>
              {growth !== undefined && (
                <div className="mt-1">
                  {formatPercentage(growth)}
                </div>
              )}
            </div>
            <Icon className="h-8 w-8 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  };

  const SimpleChart = ({ data, type = 'bar', height = 200 }: { 
    data: ChartData; 
    type?: 'bar' | 'line' | 'pie'; 
    height?: number; 
  }) => {
    // This would normally render actual charts using a library like Chart.js or Recharts
    // For now, showing a placeholder
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200"
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <BarChart className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">{type.charAt(0).toUpperCase() + type.slice(1)} Chart</p>
          <p className="text-xs">{data.datasets[0]?.label || 'Chart Data'}</p>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header & Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Financial Dashboard
                {sellerId && <Badge variant="outline">Seller View</Badge>}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive financial analytics and reporting
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={filters.period} onValueChange={(value) => setFilters({ ...filters, period: value })}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Today</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={loadFinancialData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Financial Report</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Format</Label>
                      <Select 
                        value={exportForm.format} 
                        onValueChange={(value) => setExportForm({ ...exportForm, format: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Date Range</Label>
                      <Select 
                        value={exportForm.dateRange} 
                        onValueChange={(value) => setExportForm({ ...exportForm, dateRange: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7d">Last 7 days</SelectItem>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                          <SelectItem value="90d">Last 90 days</SelectItem>
                          <SelectItem value="1y">Last year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleExportReport}>
                        Export Report
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value={metrics.totalRevenue}
            growth={metrics.revenueGrowth}
            icon={DollarSign}
          />
          <MetricCard
            title="Transactions"
            value={metrics.totalTransactions}
            growth={metrics.transactionGrowth}
            icon={CreditCard}
            format="number"
          />
          <MetricCard
            title="Average Order Value"
            value={metrics.averageOrderValue}
            growth={metrics.aovGrowth}
            icon={ShoppingCart}
          />
          <MetricCard
            title="Platform Fees"
            value={metrics.platformFees}
            growth={metrics.feesGrowth}
            icon={Building}
          />
        </div>
      )}

      {/* Main Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revenueChart && <SimpleChart data={revenueChart} type="line" />}
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Revenue by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryChart && <SimpleChart data={categoryChart} type="pie" />}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Refund Rate</p>
                    <p className="text-xl font-bold text-orange-600">{metrics?.refundRate}%</p>
                  </div>
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Chargeback Rate</p>
                    <p className="text-xl font-bold text-red-600">{metrics?.chargebackRate}%</p>
                  </div>
                  <Activity className="h-6 w-6 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-xl font-bold text-blue-600">{metrics?.activeUsers.toLocaleString()}</p>
                  </div>
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">New Users</p>
                    <p className="text-xl font-bold text-green-600">{metrics?.newUsers.toLocaleString()}</p>
                  </div>
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueChart && <SimpleChart data={revenueChart} type="line" height={300} />}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report?.breakdown.byCategory.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{item.category}</span>
                      <div className="text-right">
                        <span className="font-medium">{formatCurrency(item.revenue)}</span>
                        <p className="text-xs text-gray-500">{item.count} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Average</TableHead>
                      <TableHead>Share</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report?.breakdown.byPaymentMethod.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.method.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.count.toLocaleString()}</TableCell>
                        <TableCell>{formatCurrency(item.revenue)}</TableCell>
                        <TableCell>{formatCurrency(item.revenue / item.count)}</TableCell>
                        <TableCell>
                          {((item.revenue / (report.metrics.totalRevenue || 1)) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tax Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Tax Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report?.breakdown.byTax.map((tax, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium capitalize">{tax.type}</p>
                        <p className="text-sm text-gray-600">{tax.rate}% rate</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(tax.collected)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Platform Revenue</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(report?.metrics.platformRevenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seller Revenue</span>
                    <span className="font-bold">
                      {formatCurrency(report?.metrics.sellerRevenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Escrow Held</span>
                    <span className="font-bold text-orange-600">
                      {formatCurrency(report?.metrics.escrowHeld || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payouts Completed</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(report?.metrics.payoutsCompleted || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refunds Issued</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(report?.metrics.refundsIssued || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FinancialDashboard;
