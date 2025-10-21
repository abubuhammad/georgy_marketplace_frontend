import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  Clock,
  MapPin,
  Star,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Target,
  Zap,
  Activity,
  PieChart,
  LineChart,
  Settings,
  Bell,
  Truck
} from 'lucide-react';
import { DeliveryAnalytics } from '@/types/delivery';
import { 
  deliveryAnalyticsApi, 
  formatCurrency, 
  formatTime, 
  formatPercentage,
  getTimeframeOptions,
  createTimeframe,
  type AnalyticsTimeframe,
  type AnalyticsFilters,
  type DeliveryMetrics,
  type AgentPerformanceData,
  type ZonePerformanceData,
  type TimeSeriesData,
  type DeliveryInsight,
  type RealtimeMetrics
} from '@/services/deliveryAnalyticsApi';
import { ANALYTICS_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/config';

interface DeliveryAnalyticsDashboardProps {
  timeframe?: AnalyticsTimeframe;
  filters?: AnalyticsFilters;
  onTimeframeChange?: (timeframe: AnalyticsTimeframe) => void;
  onFiltersChange?: (filters: AnalyticsFilters) => void;
  showExportButton?: boolean;
  showRealTimeUpdates?: boolean;
  className?: string;
}

export const DeliveryAnalyticsDashboard: React.FC<DeliveryAnalyticsDashboardProps> = ({
  timeframe: initialTimeframe,
  filters: initialFilters = {},
  onTimeframeChange,
  onFiltersChange,
  showExportButton = true,
  showRealTimeUpdates = true,
  className
}) => {
  // State for analytics data
  const [metrics, setMetrics] = useState<DeliveryMetrics | null>(null);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformanceData[]>([]);
  const [zonePerformance, setZonePerformance] = useState<ZonePerformanceData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [insights, setInsights] = useState<DeliveryInsight[]>([]);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(ANALYTICS_CONFIG.DEFAULT_TIMEFRAME);
  const [selectedView, setSelectedView] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);
  
  // Filters state
  const [currentTimeframe, setCurrentTimeframe] = useState<AnalyticsTimeframe>(
    initialTimeframe || createTimeframe(ANALYTICS_CONFIG.DEFAULT_TIMEFRAME)
  );
  const [currentFilters, setCurrentFilters] = useState<AnalyticsFilters>(initialFilters);

  // Load analytics data from API
  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load comprehensive analytics data
      const analyticsResponse = await deliveryAnalyticsApi.getDeliveryAnalytics(
        currentTimeframe,
        currentFilters
      );

      setMetrics(analyticsResponse.metrics);
      setAgentPerformance(analyticsResponse.agentPerformance);
      setZonePerformance(analyticsResponse.zonePerformance);
      setTimeSeriesData(analyticsResponse.timeSeriesData);
      setInsights(analyticsResponse.insights);

    } catch (error) {
      console.error('Error loading analytics data:', error);
      setError(error instanceof Error ? error.message : ERROR_MESSAGES.CHART_LOAD_ERROR);
      toast({
        title: 'Error',
        description: ERROR_MESSAGES.CHART_LOAD_ERROR,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentTimeframe, currentFilters]);

  // Load real-time metrics
  const loadRealtimeMetrics = useCallback(async () => {
    if (!showRealTimeUpdates) return;
    
    try {
      const realtime = await deliveryAnalyticsApi.getRealtimeMetrics();
      setRealtimeMetrics(realtime);
    } catch (error) {
      console.error('Error loading realtime metrics:', error);
    }
  }, [showRealTimeUpdates]);

  // Effect for initial data load
  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  // Effect for real-time updates
  useEffect(() => {
    if (showRealTimeUpdates) {
      loadRealtimeMetrics();
      const interval = setInterval(loadRealtimeMetrics, ANALYTICS_CONFIG.CHARTS.REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [loadRealtimeMetrics, showRealTimeUpdates]);

  // Event handlers
  const handleTimeframeChange = useCallback((option: string) => {
    setSelectedTimeRange(option);
    if (option !== 'custom') {
      const newTimeframe = createTimeframe(option);
      setCurrentTimeframe(newTimeframe);
      onTimeframeChange?.(newTimeframe);
    }
  }, [onTimeframeChange]);

  const handleFiltersChange = useCallback((newFilters: AnalyticsFilters) => {
    setCurrentFilters(newFilters);
    onFiltersChange?.(newFilters);
  }, [onFiltersChange]);

  const handleExport = useCallback(async (format: 'csv' | 'excel' = 'csv') => {
    try {
      setIsExporting(true);
      const result = await deliveryAnalyticsApi.exportData(currentTimeframe, currentFilters, format);
      
      // Create download link
      const link = document.createElement('a');
      link.href = result.url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup URL
      URL.revokeObjectURL(result.url);
      
      toast({
        title: 'Success',
        description: SUCCESS_MESSAGES.DATA_EXPORTED,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: ERROR_MESSAGES.EXPORT_FAILED,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  }, [currentTimeframe, currentFilters]);

  // Memoized values
  const timeframeOptions = useMemo(() => getTimeframeOptions(), []);
  
  const getTrendIcon = useCallback((trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  }, []);

  const getPerformanceColor = useCallback((value: number, threshold: { good: number; warning: number }) => {
    if (value >= threshold.good) return 'text-green-600';
    if (value >= threshold.warning) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  const getInsightIcon = useCallback((type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'danger':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Target className="h-5 w-5 text-blue-600" />;
    }
  }, []);

  // Early returns for loading and error states
  if (loading && !metrics) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={loadAnalyticsData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Delivery Analytics</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into delivery performance and operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Real-time indicator */}
          {showRealTimeUpdates && realtimeMetrics && (
            <div className="flex items-center space-x-1 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          )}
          
          {/* Timeframe selector */}
          <Select value={selectedTimeRange} onValueChange={handleTimeframeChange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeframeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          
          {/* Export dropdown */}
          {showExportButton && (
            <div className="relative">
              <Button 
                variant="outline" 
                onClick={() => handleExport('csv')}
                disabled={isExporting}
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            </div>
          )}
          
          <Button onClick={loadAnalyticsData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                <p className="text-3xl font-bold">{metrics?.totalShipments.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.3% from last period</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold">{formatPercentage(metrics?.deliveryRate || 0)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+2.1% from last period</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Delivery Time</p>
                <p className="text-3xl font-bold">{formatTime(metrics?.averageDeliveryTime || 0)}</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">-8.5% faster</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold">{formatCurrency(metrics?.totalRevenue || 0)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+18.7% from last period</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="zones">Zone Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends & Insights</TabsTrigger>
          <TabsTrigger value="operational">Operational Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Status Distribution</CardTitle>
                <CardDescription>Current status of all deliveries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.breakdown.byStatus.map((status) => (
                    <div key={status.status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${
                          status.status === 'DELIVERED' ? 'bg-green-500' :
                          status.status === 'IN_TRANSIT' ? 'bg-blue-500' : 'bg-red-500'
                        }`}></div>
                        <span className="font-medium capitalize">{status.status.toLowerCase().replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{status.count}</p>
                        <p className="text-sm text-gray-600">{formatPercentage(status.percentage)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Key metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">Interactive trend chart</p>
                    <p className="text-sm text-gray-500">
                      Shows delivery volume, success rate, and avg delivery time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partner Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Partner Performance</CardTitle>
                <CardDescription>Delivery performance by partner</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.breakdown.byPartner.map((partner) => (
                    <div key={partner.partnerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{partner.partnerName}</p>
                        <p className="text-sm text-gray-600">{partner.shipments} deliveries</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPercentage(partner.deliveryRate)}</p>
                        <p className="text-sm text-gray-600">{formatCurrency(partner.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Zone Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle>Zone Performance Heatmap</CardTitle>
                <CardDescription>Delivery performance by geographic zone</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">Interactive zone map</p>
                    <p className="text-sm text-gray-500">
                      Color-coded performance by delivery zones
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Leaderboard</CardTitle>
              <CardDescription>Individual agent performance metrics and rankings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentPerformance.map((agent, index) => (
                  <div key={agent.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{agent.name}</h3>
                            <Badge variant={index < 3 ? "default" : "secondary"}>
                              #{index + 1}
                            </Badge>
                            {getTrendIcon(agent.trend)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{agent.totalDeliveries} deliveries</span>
                            <span>•</span>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 mr-1" />
                              <span>{agent.rating}</span>
                            </div>
                            <span>•</span>
                            <span>{formatTime(agent.hoursWorked * 60)} worked</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(agent.earnings)}</p>
                        <p className="text-sm text-gray-600">Total earnings</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className={`text-lg font-semibold ${getPerformanceColor(agent.successRate, { good: 95, warning: 90 })}`}>
                          {formatPercentage(agent.successRate)}
                        </p>
                        <p className="text-xs text-gray-600">Success Rate</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className={`text-lg font-semibold ${getPerformanceColor(120 - agent.avgDeliveryTime, { good: 30, warning: 15 })}`}>
                          {formatTime(agent.avgDeliveryTime)}
                        </p>
                        <p className="text-xs text-gray-600">Avg Time</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className={`text-lg font-semibold ${getPerformanceColor(agent.efficiency, { good: 90, warning: 80 })}`}>
                          {formatPercentage(agent.efficiency)}
                        </p>
                        <p className="text-xs text-gray-600">Efficiency</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-lg font-semibold">
                          ₦{(agent.earnings / agent.hoursWorked).toFixed(0)}
                        </p>
                        <p className="text-xs text-gray-600">Per Hour</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Zone Performance Summary</CardTitle>
                <CardDescription>Performance metrics by delivery zones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {zonePerformance.map((zone) => (
                    <div key={zone.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{zone.name}</h3>
                        <Badge variant="outline">{zone.deliveries} deliveries</Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className={`text-lg font-semibold ${getPerformanceColor(zone.successRate, { good: 95, warning: 90 })}`}>
                            {formatPercentage(zone.successRate)}
                          </p>
                          <p className="text-xs text-gray-600">Success Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold">{formatTime(zone.avgDeliveryTime)}</p>
                          <p className="text-xs text-gray-600">Avg Time</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold">{formatCurrency(zone.revenue)}</p>
                          <p className="text-xs text-gray-600">Revenue</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-between text-sm text-gray-600">
                        <span>Coverage: {formatPercentage(zone.coverage)}</span>
                        <span>Avg Distance: {zone.avgDistance}km</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zone Comparison Chart</CardTitle>
                <CardDescription>Visual comparison of zone performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">Interactive zone comparison</p>
                    <p className="text-sm text-gray-500">
                      Bar chart comparing success rates, avg times, and revenue
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Volume Trends</CardTitle>
                <CardDescription>Daily delivery volumes over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">Volume trend chart</p>
                    <p className="text-sm text-gray-500">
                      Shows daily delivery volumes with trend analysis
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>AI-powered insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Peak Performance</p>
                      <p className="text-sm text-green-700">
                        Delivery success rate increased by 2.1% this month, exceeding target
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Attention Needed</p>
                      <p className="text-sm text-yellow-700">
                        Lekki zone showing 12% longer delivery times - consider route optimization
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Optimization Opportunity</p>
                      <p className="text-sm text-blue-700">
                        Adding 2 more agents in Victoria Island could reduce avg delivery time by 15%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-800">Cost Efficiency</p>
                      <p className="text-sm text-purple-700">
                        Revenue per delivery increased by 18.7% while maintaining quality standards
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Time Series Analysis</CardTitle>
                <CardDescription>Detailed trends over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">Multi-series time chart</p>
                    <p className="text-sm text-gray-500">
                      Shows deliveries, success rate, avg time, and revenue trends
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operational">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Operational KPIs */}
            <Card>
              <CardHeader>
                <CardTitle>Operational KPIs</CardTitle>
                <CardDescription>Key operational performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">On-Time Delivery Rate</p>
                      <p className="text-sm text-gray-600">Target: ≥ 85%</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${getPerformanceColor(performanceMetrics.onTimeRate, { good: 85, warning: 75 })}`}>
                        {formatPercentage(performanceMetrics.onTimeRate)}
                      </p>
                      <TrendingUp className="h-4 w-4 text-green-500 inline" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Customer Satisfaction</p>
                      <p className="text-sm text-gray-600">Target: ≥ 4.5</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${getPerformanceColor(performanceMetrics.customerSatisfaction, { good: 4.5, warning: 4.0 })}`}>
                        {performanceMetrics.customerSatisfaction.toFixed(1)}/5.0
                      </p>
                      <Star className="h-4 w-4 text-yellow-500 inline" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Cost per Delivery</p>
                      <p className="text-sm text-gray-600">Target: ≤ ₦1,000</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${getPerformanceColor(1000 - performanceMetrics.costPerDelivery, { good: 150, warning: 50 })}`}>
                        {formatCurrency(performanceMetrics.costPerDelivery)}
                      </p>
                      <TrendingDown className="h-4 w-4 text-green-500 inline" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Return Rate</p>
                      <p className="text-sm text-gray-600">Target: ≤ 2%</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${getPerformanceColor(2 - performanceMetrics.returnRate, { good: 0.5, warning: 0.2 })}`}>
                        {formatPercentage(performanceMetrics.returnRate)}
                      </p>
                      <TrendingDown className="h-4 w-4 text-green-500 inline" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fleet Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Fleet Utilization</CardTitle>
                <CardDescription>Vehicle and agent utilization rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Truck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Bikes</p>
                        <p className="text-sm text-gray-600">12 active / 15 total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">80%</p>
                      <p className="text-sm text-gray-600">Utilization</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Truck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Cars</p>
                        <p className="text-sm text-gray-600">8 active / 10 total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">80%</p>
                      <p className="text-sm text-gray-600">Utilization</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Truck className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Vans</p>
                        <p className="text-sm text-gray-600">5 active / 6 total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">83%</p>
                      <p className="text-sm text-gray-600">Utilization</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-800">Fleet Insight</p>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Peak utilization detected. Consider adding 2 more bikes for optimal coverage.
                    </p>
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
