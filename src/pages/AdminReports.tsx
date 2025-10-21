import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package, 
  ShoppingCart,
  Calendar,
  Download
} from 'lucide-react';

const AdminReports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const reportSections = [
    {
      title: 'Sales Reports',
      icon: <DollarSign className="w-5 h-5" />,
      reports: [
        { name: 'Revenue Overview', description: 'Total revenue and trends', status: 'ready' },
        { name: 'Top Products', description: 'Best selling products', status: 'ready' },
        { name: 'Sales by Category', description: 'Category performance', status: 'ready' },
        { name: 'Geographic Sales', description: 'Sales by location', status: 'processing' }
      ]
    },
    {
      title: 'User Analytics',
      icon: <Users className="w-5 h-5" />,
      reports: [
        { name: 'User Growth', description: 'New user registrations', status: 'ready' },
        { name: 'User Engagement', description: 'Activity and retention', status: 'ready' },
        { name: 'Demographics', description: 'User demographics breakdown', status: 'ready' }
      ]
    },
    {
      title: 'Order Reports',
      icon: <ShoppingCart className="w-5 h-5" />,
      reports: [
        { name: 'Order Volume', description: 'Order trends and patterns', status: 'ready' },
        { name: 'Fulfillment Status', description: 'Delivery performance', status: 'ready' },
        { name: 'Return Analysis', description: 'Return rates and reasons', status: 'processing' }
      ]
    },
    {
      title: 'Inventory Reports',
      icon: <Package className="w-5 h-5" />,
      reports: [
        { name: 'Stock Levels', description: 'Current inventory status', status: 'ready' },
        { name: 'Low Stock Alert', description: 'Items running low', status: 'ready' },
        { name: 'Product Performance', description: 'Inventory turnover', status: 'ready' }
      ]
    }
  ];

  const quickStats = [
    { label: 'Total Reports', value: '24', change: '+3', icon: BarChart3 },
    { label: 'Generated Today', value: '8', change: '+2', icon: Calendar },
    { label: 'Users Accessed', value: '156', change: '+12', icon: Users },
    { label: 'Downloads', value: '89', change: '+7', icon: Download }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Reports</h1>
          <p className="text-gray-600">Generate and manage business intelligence reports</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <div className="flex items-center">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <span className="ml-2 text-sm text-green-600 font-medium">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <stat.icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Period Selection */}
        <div className="mb-6">
          <div className="flex gap-2">
            {['7d', '30d', '90d', '1y'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period === '7d' && '7 Days'}
                {period === '30d' && '30 Days'}
                {period === '90d' && '90 Days'}
                {period === '1y' && '1 Year'}
              </Button>
            ))}
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {reportSections.map((section, sectionIndex) => (
            <Card key={sectionIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {section.icon}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.reports.map((report, reportIndex) => (
                    <div key={reportIndex} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{report.name}</h3>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Generate New Report */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Generate Custom Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option>Sales Report</option>
                  <option>User Analytics</option>
                  <option>Inventory Report</option>
                  <option>Financial Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Custom range</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button className="w-full">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;