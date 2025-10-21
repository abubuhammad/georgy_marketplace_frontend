import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  formatCurrency, 
  formatTime, 
  formatPercentage,
  type TimeSeriesData,
  type ZonePerformanceData,
  type AgentPerformanceData
} from '@/services/deliveryAnalyticsApi';
import { APP_CONFIG } from '@/config';

interface TrendChartProps {
  data: TimeSeriesData[];
  title: string;
  description?: string;
  height?: number;
  showGrid?: boolean;
}

interface ZoneChartProps {
  data: ZonePerformanceData[];
  title: string;
  description?: string;
  height?: number;
}

interface AgentChartProps {
  data: AgentPerformanceData[];
  title: string;
  description?: string;
  height?: number;
  maxAgents?: number;
}

interface StatusDistributionProps {
  delivered: number;
  inTransit: number;
  failed: number;
  title?: string;
  height?: number;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {formatter ? formatter(entry.value, entry.name) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Delivery Trends Chart
export const DeliveryTrendsChart: React.FC<TrendChartProps> = ({
  data,
  title,
  description,
  height = 300,
  showGrid = true
}) => {
  const chartData = useMemo(() => 
    data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      successRate: ((item.successfulDeliveries / item.totalDeliveries) * 100) || 0
    })), 
    [data]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              content={<CustomTooltip formatter={(value: number, name: string) => {
                if (name === 'totalRevenue') return formatCurrency(value);
                if (name === 'averageDeliveryTime') return formatTime(value);
                if (name === 'successRate') return formatPercentage(value);
                return value;
              }} />}
            />
            <Legend />
            
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="totalDeliveries"
              stroke={APP_CONFIG.UI.PRIMARY_COLOR}
              strokeWidth={2}
              name="Total Deliveries"
              dot={{ fill: APP_CONFIG.UI.PRIMARY_COLOR, r: 4 }}
            />
            
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="successfulDeliveries"
              stroke={APP_CONFIG.UI.SUCCESS_COLOR}
              strokeWidth={2}
              name="Successful"
              dot={{ fill: APP_CONFIG.UI.SUCCESS_COLOR, r: 4 }}
            />
            
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="successRate"
              stroke={APP_CONFIG.UI.INFO_COLOR}
              strokeWidth={2}
              name="Success Rate (%)"
              dot={{ fill: APP_CONFIG.UI.INFO_COLOR, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Revenue Trends Chart
export const RevenueTrendsChart: React.FC<TrendChartProps> = ({
  data,
  title,
  description,
  height = 300
}) => {
  const chartData = useMemo(() => 
    data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      avgRevenuePerDelivery: item.totalDeliveries > 0 ? 
        item.totalRevenue / item.totalDeliveries : 0
    })), 
    [data]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              content={<CustomTooltip formatter={(value: number) => formatCurrency(value)} />}
            />
            <Legend />
            
            <Area
              type="monotone"
              dataKey="totalRevenue"
              stackId="1"
              stroke={APP_CONFIG.UI.WARNING_COLOR}
              fill={APP_CONFIG.UI.WARNING_COLOR}
              fillOpacity={0.6}
              name="Daily Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Zone Performance Chart
export const ZonePerformanceChart: React.FC<ZoneChartProps> = ({
  data,
  title,
  description,
  height = 300
}) => {
  const chartData = useMemo(() => 
    data.map(zone => ({
      name: zone.zoneName,
      successRate: zone.successRate,
      deliveries: zone.totalDeliveries,
      revenue: zone.totalRevenue,
      avgTime: zone.averageDeliveryTime
    })), 
    [data]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              content={<CustomTooltip formatter={(value: number, name: string) => {
                if (name === 'revenue') return formatCurrency(value);
                if (name === 'avgTime') return formatTime(value);
                if (name === 'successRate') return formatPercentage(value);
                return value;
              }} />}
            />
            <Legend />
            
            <Bar
              yAxisId="left"
              dataKey="deliveries"
              fill={APP_CONFIG.UI.PRIMARY_COLOR}
              name="Total Deliveries"
            />
            
            <Bar
              yAxisId="right"
              dataKey="successRate"
              fill={APP_CONFIG.UI.SUCCESS_COLOR}
              name="Success Rate (%)"
            />
            
            <ReferenceLine 
              yAxisId="right" 
              y={90} 
              stroke={APP_CONFIG.UI.WARNING_COLOR} 
              strokeDasharray="5 5" 
              label="Target 90%"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Agent Performance Chart
export const AgentPerformanceChart: React.FC<AgentChartProps> = ({
  data,
  title,
  description,
  height = 400,
  maxAgents = 10
}) => {
  const chartData = useMemo(() => 
    data
      .slice(0, maxAgents)
      .map(agent => ({
        name: agent.agentName,
        successRate: agent.successRate,
        totalDeliveries: agent.totalDeliveries,
        earnings: agent.totalEarnings,
        avgTime: agent.averageDeliveryTime,
        rating: agent.averageRating,
        efficiency: agent.deliveriesPerHour
      })), 
    [data, maxAgents]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData} layout="horizontal" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip 
              content={<CustomTooltip formatter={(value: number, name: string) => {
                if (name === 'earnings') return formatCurrency(value);
                if (name === 'avgTime') return formatTime(value);
                if (name === 'successRate') return formatPercentage(value);
                if (name === 'rating') return `${value.toFixed(1)}/5.0`;
                return value;
              }} />}
            />
            <Legend />
            
            <Bar
              dataKey="successRate"
              fill={APP_CONFIG.UI.SUCCESS_COLOR}
              name="Success Rate (%)"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Status Distribution Pie Chart
export const StatusDistributionChart: React.FC<StatusDistributionProps> = ({
  delivered,
  inTransit,
  failed,
  title = "Delivery Status Distribution",
  height = 300
}) => {
  const total = delivered + inTransit + failed;
  const data = [
    { name: 'Delivered', value: delivered, percentage: (delivered / total) * 100 },
    { name: 'In Transit', value: inTransit, percentage: (inTransit / total) * 100 },
    { name: 'Failed', value: failed, percentage: (failed / total) * 100 }
  ];

  const colors = [
    APP_CONFIG.UI.SUCCESS_COLOR,
    APP_CONFIG.UI.WARNING_COLOR,
    APP_CONFIG.UI.ERROR_COLOR
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              content={<CustomTooltip formatter={(value: number) => `${value} deliveries`} />}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Status badges */}
        <div className="flex justify-center space-x-4 mt-4">
          {data.map((item, index) => (
            <div key={item.name} className="text-center">
              <Badge 
                variant="outline" 
                className="mb-1"
                style={{ borderColor: colors[index] }}
              >
                {item.name}
              </Badge>
              <p className="text-sm font-medium">{item.value}</p>
              <p className="text-xs text-gray-500">{formatPercentage(item.percentage)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Performance Heatmap (simplified version using bars)
export const PerformanceHeatmapChart: React.FC<{
  data: { zone: string; hour: string; deliveries: number; successRate: number }[];
  title: string;
  height?: number;
}> = ({ data, title, height = 400 }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Delivery performance by zone and time of day</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip 
              content={<CustomTooltip formatter={(value: number, name: string) => {
                if (name === 'successRate') return formatPercentage(value);
                return value;
              }} />}
            />
            <Legend />
            
            <Bar
              dataKey="deliveries"
              fill={APP_CONFIG.UI.PRIMARY_COLOR}
              name="Deliveries"
            />
            
            <Bar
              dataKey="successRate"
              fill={APP_CONFIG.UI.SUCCESS_COLOR}
              name="Success Rate (%)"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Compact metric card with mini chart
export const MetricCardWithChart: React.FC<{
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  chartData: { name: string; value: number }[];
  color?: string;
}> = ({ title, value, change, trend, chartData, color = APP_CONFIG.UI.PRIMARY_COLOR }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className={`text-sm flex items-center ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change}
            </p>
          </div>
          
          <div className="w-24 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  fill={color}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Export all chart components
export {
  CustomTooltip
};
