import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Package,
  Star,
  Clock,
  Target,
  Award,
  Eye,
  Download,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { SellerPerformanceMetrics } from './types';
import { sellerService } from '@/services/sellerService';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SellerAnalytics: React.FC = () => {
  const { user } = useAuthContext();
  const [metrics, setMetrics] = useState<SellerPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [comparisonPeriod, setComparisonPeriod] = useState<'previous' | 'last_year'>('previous');

  useEffect(() => {
    if (user?.id) {
      loadMetrics();
    }
  }, [user?.id, selectedPeriod]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const metricsData = await sellerService.getPerformanceMetrics(user!.id, selectedPeriod);
      setMetrics(metricsData);
    } catch (error) {
      toast.error('Failed to load analytics data');
      console.error('Analytics loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number, includeSign = true) => {
    const sign = includeSign && value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'bg-green-500' };
    if (score >= 80) return { level: 'Good', color: 'bg-blue-500' };
    if (score >= 70) return { level: 'Average', color: 'bg-yellow-500' };
    if (score >= 60) return { level: 'Below Average', color: 'bg-orange-500' };
    return { level: 'Poor', color: 'bg-red-500' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p>Failed to load analytics data</p>
          <Button onClick={loadMetrics} className="mt-4">
            Retry
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Seller Analytics</h1>
              <p className="text-gray-600">Comprehensive performance insights and reporting</p>
            </div>
            <div className="flex gap-3">
              <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={loadMetrics}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.sales.totalRevenue)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getGrowthIcon(metrics.sales.salesGrowth)}
                    <span className={`text-sm ${getGrowthColor(metrics.sales.salesGrowth)}`}>
                      {formatPercentage(metrics.sales.salesGrowth)}
                    </span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">{metrics.sales.totalOrders.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    Avg: {formatCurrency(metrics.sales.averageOrderValue)}
                  </p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold">{formatPercentage(metrics.products.conversionRate, false)}</p>
                  <p className="text-sm text-gray-500">
                    {metrics.products.averageViews} avg views
                  </p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                  <p className="text-2xl font-bold">{metrics.operations.customerSatisfaction.toFixed(1)}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-500">out of 5.0</span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Overall Performance Score
                  </CardTitle>
                  <CardDescription>Your overall seller performance rating</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      { metric: 'Sales Performance', score: 85, weight: '30%' },
                      { metric: 'Customer Satisfaction', score: 92, weight: '25%' },
                      { metric: 'Order Fulfillment', score: 88, weight: '20%' },
                      { metric: 'Product Quality', score: 90, weight: '15%' },
                      { metric: 'Communication', score: 87, weight: '10%' }
                    ].map((item, index) => {
                      const performance = getPerformanceLevel(item.score);
                      return (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{item.metric}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500">{item.weight}</span>
                              <Badge className={performance.color}>{performance.level}</Badge>
                              <span className="font-semibold">{item.score}%</span>
                            </div>
                          </div>
                          <Progress value={item.score} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                  <CardDescription>Revenue and profit breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Gross Revenue</span>
                      <span className="font-semibold">{formatCurrency(metrics.financial.grossProfit)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Expenses</span>
                      <span className="font-semibold text-red-600">
                        -{formatCurrency(metrics.financial.totalExpenses)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="font-semibold">Net Profit</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(metrics.financial.netProfit)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Profit Margin</span>
                      <span className="font-semibold">{formatPercentage(metrics.financial.profitMargin, false)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Pending Payout</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(metrics.financial.pendingPayout)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Competition Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Market Position</CardTitle>
                <CardDescription>How you compare to other sellers in your category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{formatPercentage(metrics.competition.marketShare, false)}</p>
                    <p className="text-sm text-gray-600">Market Share</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">#{metrics.competition.rankingPosition}</p>
                    <p className="text-sm text-gray-600">Category Ranking</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{metrics.competition.competitorCount}</p>
                    <p className="text-sm text-gray-600">Competitors</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercentage(metrics.competition.priceAdvantage)}
                    </p>
                    <p className="text-sm text-gray-600">Price Advantage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Sales Trends</CardTitle>
                  <CardDescription>Daily sales performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Chart placeholder */}
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Sales chart will be implemented here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sales by Channel</CardTitle>
                  <CardDescription>Revenue breakdown by source</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics.sales.salesByChannel.map((channel, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{channel.channel}</span>
                          <span className="text-sm text-gray-600">{formatPercentage(channel.percentage, false)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={channel.percentage} className="flex-1" />
                          <span className="text-sm font-semibold">{formatCurrency(channel.revenue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Sales Metrics</CardTitle>
                <CardDescription>Detailed sales performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{metrics.sales.bestSellingCategory}</p>
                    <p className="text-sm text-gray-600">Best Category</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{metrics.sales.peakSalesHour}:00</p>
                    <p className="text-sm text-gray-600">Peak Sales Hour</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatPercentage(metrics.sales.salesGrowth)}</p>
                    <p className="text-sm text-gray-600">Growth Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                  <CardDescription>Key product metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{metrics.products.totalProducts}</p>
                      <p className="text-sm text-gray-600">Total Products</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{metrics.products.newProducts}</p>
                      <p className="text-sm text-gray-600">New This Period</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{metrics.products.outOfStock}</p>
                      <p className="text-sm text-gray-600">Out of Stock</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{metrics.products.lowStock}</p>
                      <p className="text-sm text-gray-600">Low Stock</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Engagement</CardTitle>
                  <CardDescription>How customers interact with your products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Views per Product</span>
                      <span className="font-semibold">{metrics.products.averageViews}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Conversion Rate</span>
                      <span className="font-semibold">{formatPercentage(metrics.products.conversionRate, false)}</span>
                    </div>
                    <div className="text-center pt-4">
                      <Progress value={metrics.products.conversionRate} className="mb-2" />
                      <p className="text-sm text-gray-600">
                        {metrics.products.conversionRate >= 3 ? 'Excellent' : 
                         metrics.products.conversionRate >= 2 ? 'Good' : 'Needs Improvement'} conversion rate
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Best and Worst Performers would go here */}
            <Card>
              <CardHeader>
                <CardTitle>Product Performance Analysis</CardTitle>
                <CardDescription>Best and underperforming products</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Detailed product performance analysis will be implemented here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Metrics</CardTitle>
                  <CardDescription>Customer acquisition and retention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{metrics.customers.totalCustomers}</p>
                      <p className="text-sm text-gray-600">Total Customers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{metrics.customers.newCustomers}</p>
                      <p className="text-sm text-gray-600">New Customers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{metrics.customers.returningCustomers}</p>
                      <p className="text-sm text-gray-600">Returning</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatPercentage(metrics.customers.customerRetentionRate, false)}</p>
                      <p className="text-sm text-gray-600">Retention Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Value</CardTitle>
                  <CardDescription>Revenue per customer analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">
                        {formatCurrency(metrics.customers.averageCustomerValue)}
                      </p>
                      <p className="text-sm text-gray-600">Average Customer Value</p>
                    </div>
                    <div className="pt-4">
                      <Progress value={75} className="mb-2" />
                      <p className="text-sm text-gray-600 text-center">
                        Above market average
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{metrics.operations.orderFulfillmentTime}h</p>
                  <p className="text-sm text-gray-600">Avg Fulfillment Time</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Package className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{formatPercentage(metrics.operations.shippingAccuracy, false)}</p>
                  <p className="text-sm text-gray-600">Shipping Accuracy</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <RefreshCw className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{formatPercentage(metrics.operations.returnRate, false)}</p>
                  <p className="text-sm text-gray-600">Return Rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{metrics.operations.responseTime}h</p>
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Operational Excellence</CardTitle>
                <CardDescription>Key operational performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { 
                      metric: 'Order Fulfillment', 
                      value: metrics.operations.shippingAccuracy, 
                      target: 95,
                      unit: '%'
                    },
                    { 
                      metric: 'Customer Satisfaction', 
                      value: metrics.operations.customerSatisfaction * 20, // Convert to percentage
                      target: 90,
                      unit: '%'
                    },
                    { 
                      metric: 'Response Time', 
                      value: Math.max(0, 100 - metrics.operations.responseTime * 10), // Convert to score
                      target: 80,
                      unit: '%'
                    },
                    { 
                      metric: 'Dispute Rate', 
                      value: Math.max(0, 100 - metrics.operations.disputeRate * 20), // Convert to score
                      target: 95,
                      unit: '%'
                    }
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{item.metric}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">Target: {item.target}{item.unit}</span>
                          <span className="font-semibold">{item.value.toFixed(1)}{item.unit}</span>
                        </div>
                      </div>
                      <Progress value={item.value} className="h-2" />
                      {item.value >= item.target && (
                        <p className="text-sm text-green-600 mt-1">✓ Target achieved</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerAnalytics;
