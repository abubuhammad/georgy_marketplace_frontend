import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, DollarSign, Package, Eye,
  Calendar, Download, Filter, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [analytics, setAnalytics] = useState({
    overview: {
      totalUsers: 15420,
      newUsers: 1234,
      totalRevenue: 245680.50,
      revenueGrowth: 15.3,
      totalOrders: 8934,
      orderGrowth: 8.2,
      activeListings: 3456,
      listingGrowth: 5.7
    },
    userMetrics: {
      signupsByDay: [120, 135, 98, 156, 142, 178, 165],
      activeUsersByDay: [890, 920, 885, 945, 932, 978, 965],
      userRetention: {
        day1: 85.2,
        day7: 68.4,
        day30: 42.1
      }
    },
    revenueMetrics: {
      dailyRevenue: [12500, 14200, 11800, 15600, 13900, 16800, 15200],
      revenueByCategory: [
        { name: 'Electronics', value: 45.2 },
        { name: 'Real Estate', value: 28.7 },
        { name: 'Jobs', value: 12.1 },
        { name: 'Fashion', value: 8.9 },
        { name: 'Others', value: 5.1 }
      ]
    },
    platformMetrics: {
      topCategories: [
        { name: 'Electronics', listings: 1245, growth: 12.5 },
        { name: 'Real Estate', listings: 789, growth: 8.9 },
        { name: 'Fashion', listings: 567, growth: 15.2 },
        { name: 'Jobs', listings: 432, growth: 22.1 },
        { name: 'Automotive', listings: 321, growth: 6.7 }
      ],
      conversionRates: {
        listingToInquiry: 23.4,
        inquiryToSale: 8.7,
        overallConversion: 2.1
      }
    }
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call based on timeRange
      // Mock data loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // TODO: Implement actual data export
    console.log('Exporting analytics data...');
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Platform insights and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{analytics.overview.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+{analytics.overview.newUsers} new this month</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">₦{analytics.overview.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+{analytics.overview.revenueGrowth}% growth</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{analytics.overview.totalOrders.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+{analytics.overview.orderGrowth}% growth</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold">{analytics.overview.activeListings.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+{analytics.overview.listingGrowth}% growth</p>
              </div>
              <div className="p-3 rounded-full bg-orange-50">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="platform">Platform Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Signups (Last 7 Days)</CardTitle>
                <CardDescription>Daily new user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.userMetrics.signupsByDay.map((signups, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-20 text-sm text-gray-600">
                        Day {index + 1}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(signups / Math.max(...analytics.userMetrics.signupsByDay)) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm font-medium">{signups}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>Percentage of users returning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">1-Day Retention</span>
                    <span className="font-medium">{analytics.userMetrics.userRetention.day1}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">7-Day Retention</span>
                    <span className="font-medium">{analytics.userMetrics.userRetention.day7}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">30-Day Retention</span>
                    <span className="font-medium">{analytics.userMetrics.userRetention.day30}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue (Last 7 Days)</CardTitle>
                <CardDescription>Revenue trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.revenueMetrics.dailyRevenue.map((revenue, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-20 text-sm text-gray-600">
                        Day {index + 1}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${(revenue / Math.max(...analytics.revenueMetrics.dailyRevenue)) * 100}%` }}
                        />
                      </div>
                      <div className="w-20 text-sm font-medium">₦{revenue.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Distribution of revenue across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.revenueMetrics.revenueByCategory.map((category, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-gray-600">{category.name}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-600 h-2 rounded-full" 
                          style={{ width: `${category.value}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm font-medium">{category.value}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platform" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
                <CardDescription>Most popular listing categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.platformMetrics.topCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-gray-600">{category.listings} listings</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">+{category.growth}%</p>
                        <p className="text-xs text-gray-500">growth</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rates</CardTitle>
                <CardDescription>Platform performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Listing to Inquiry</span>
                      <span className="font-medium">{analytics.platformMetrics.conversionRates.listingToInquiry}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${analytics.platformMetrics.conversionRates.listingToInquiry}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Inquiry to Sale</span>
                      <span className="font-medium">{analytics.platformMetrics.conversionRates.inquiryToSale}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${analytics.platformMetrics.conversionRates.inquiryToSale}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Overall Conversion</span>
                      <span className="font-medium">{analytics.platformMetrics.conversionRates.overallConversion}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${analytics.platformMetrics.conversionRates.overallConversion * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Platform health and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">2.3s</div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">0.1%</div>
                  <div className="text-sm text-gray-600">Error Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
