import { API_BASE_URL } from '@/config';

export interface AnalyticsTimeframe {
  start: string;
  end: string;
}

export interface AnalyticsFilters {
  partnerId?: string;
  agentId?: string;
  zoneId?: string;
  deliveryType?: string;
  status?: string;
}

export interface DeliveryMetrics {
  totalShipments: number;
  deliveredShipments: number;
  failedShipments: number;
  inTransitShipments: number;
  deliveryRate: number;
  averageDeliveryTime: number;
  totalRevenue: number;
  totalCOD: number;
  averageRating: number;
  onTimeDeliveryRate: number;
  costPerDelivery: number;
  revenuePerDelivery: number;
  returnRate: number;
}

export interface AgentPerformanceData {
  agentId: string;
  agentName: string;
  employeeId: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  successRate: number;
  averageDeliveryTime: number;
  totalDistance: number;
  averageRating: number;
  totalEarnings: number;
  hoursWorked: number;
  deliveriesPerHour: number;
  fuelEfficiency?: number;
  customerComplaints: number;
  onTimeDeliveries: number;
  onTimeRate: number;
  vehicleType: string;
  activeHours: number;
  lastDelivery: string | null;
  performanceTrend: 'up' | 'down' | 'stable';
}

export interface ZonePerformanceData {
  zoneId: string;
  zoneName: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  averageDeliveryTime: number;
  successRate: number;
  totalRevenue: number;
  averageDistance: number;
  coverage: number;
  activeAgents: number;
  peakHours: string[];
  demandDensity: number;
  costEfficiency: number;
}

export interface TimeSeriesData {
  date: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageDeliveryTime: number;
  totalRevenue: number;
  onTimeDeliveries: number;
  customerSatisfaction: number;
  activeAgents: number;
}

export interface DeliveryInsight {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
  category: 'performance' | 'efficiency' | 'cost' | 'customer';
  metadata?: any;
}

export interface ComprehensiveAnalytics {
  metrics: DeliveryMetrics;
  agentPerformance: AgentPerformanceData[];
  zonePerformance: ZonePerformanceData[];
  timeSeriesData: TimeSeriesData[];
  insights: DeliveryInsight[];
}

export interface RealtimeMetrics {
  activeDeliveries: number;
  agentsOnline: number;
  avgDeliveryTime: number;
  successRateToday: number;
  revenueToday: number;
}

class DeliveryAnalyticsApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = `${API_BASE_URL}/delivery-analytics`;
    // Get token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` })
    };
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object' && !Array.isArray(value)) {
          // Handle nested objects like timeframe
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (subValue !== undefined && subValue !== null) {
              searchParams.append(`${key}.${subKey}`, String(subValue));
            }
          });
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    return searchParams.toString();
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const queryString = params ? `?${this.buildQueryString(params)}` : '';
      const url = `${this.baseURL}${endpoint}${queryString}`;
      
      console.log('Making API request to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized - redirect to login or refresh token
          throw new Error('Unauthorized access - please login again');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data.data;
    } catch (error) {
      console.error(`Error in ${endpoint}:`, error);
      
      // Return mock data if API is not available (for development)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('API not available, returning mock data');
        return this.getMockData(endpoint) as T;
      }
      
      throw error;
    }
  }

  // Get comprehensive delivery analytics
  async getDeliveryAnalytics(
    timeframe?: AnalyticsTimeframe,
    filters?: AnalyticsFilters
  ): Promise<ComprehensiveAnalytics> {
    const params = {
      ...(timeframe && { timeframe }),
      ...filters
    };

    return this.makeRequest<ComprehensiveAnalytics>('/', params);
  }

  // Get core delivery metrics only
  async getDeliveryMetrics(
    timeframe?: AnalyticsTimeframe,
    filters?: AnalyticsFilters
  ): Promise<DeliveryMetrics> {
    const params = {
      ...(timeframe && { timeframe }),
      ...filters
    };

    return this.makeRequest<DeliveryMetrics>('/metrics', params);
  }

  // Get agent performance data
  async getAgentPerformance(
    timeframe?: AnalyticsTimeframe,
    options?: {
      agentId?: string;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{ data: AgentPerformanceData[]; total: number }> {
    const params = {
      ...(timeframe && { timeframe }),
      ...options
    };

    const response = await this.makeRequest<any>('/agents', params);
    return {
      data: response.data || response,
      total: response.total || response.length || 0
    };
  }

  // Get zone performance data
  async getZonePerformance(
    timeframe?: AnalyticsTimeframe,
    options?: {
      zoneId?: string;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{ data: ZonePerformanceData[]; total: number }> {
    const params = {
      ...(timeframe && { timeframe }),
      ...options
    };

    const response = await this.makeRequest<any>('/zones', params);
    return {
      data: response.data || response,
      total: response.total || response.length || 0
    };
  }

  // Get time series data for trends
  async getTrendsData(
    timeframe?: AnalyticsTimeframe,
    filters?: AnalyticsFilters,
    granularity: 'daily' | 'hourly' | 'weekly' = 'daily'
  ): Promise<TimeSeriesData[]> {
    const params = {
      ...(timeframe && { timeframe }),
      ...filters,
      granularity
    };

    return this.makeRequest<TimeSeriesData[]>('/trends', params);
  }

  // Get AI-powered delivery insights
  async getInsights(
    timeframe?: AnalyticsTimeframe,
    filters?: AnalyticsFilters & {
      category?: string;
      priority?: string;
    }
  ): Promise<DeliveryInsight[]> {
    const params = {
      ...(timeframe && { timeframe }),
      ...filters
    };

    return this.makeRequest<DeliveryInsight[]>('/insights', params);
  }

  // Get real-time delivery metrics
  async getRealtimeMetrics(): Promise<RealtimeMetrics> {
    return this.makeRequest<RealtimeMetrics>('/realtime');
  }

  // Get detailed analytics for a specific agent
  async getAgentAnalytics(
    agentId: string,
    timeframe?: AnalyticsTimeframe
  ): Promise<{
    agent: AgentPerformanceData;
    trends: TimeSeriesData[];
  }> {
    const params = {
      ...(timeframe && { timeframe })
    };

    return this.makeRequest<any>(`/agent/${agentId}`, params);
  }

  // Get detailed analytics for a specific zone
  async getZoneAnalytics(
    zoneId: string,
    timeframe?: AnalyticsTimeframe
  ): Promise<{
    zone: ZonePerformanceData;
    trends: TimeSeriesData[];
    agents: AgentPerformanceData[];
  }> {
    const params = {
      ...(timeframe && { timeframe })
    };

    return this.makeRequest<any>(`/zone/${zoneId}`, params);
  }

  // Export analytics data
  async exportData(
    timeframe?: AnalyticsTimeframe,
    filters?: AnalyticsFilters,
    format: 'csv' | 'excel' = 'csv'
  ): Promise<{ filename: string; url: string }> {
    try {
      const params = {
        ...(timeframe && { timeframe }),
        ...filters,
        format
      };

      const queryString = this.buildQueryString(params);
      const url = `${this.baseURL}/export?${queryString}`;

      // Create a temporary link to download the file
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 
                     `delivery_analytics_${new Date().toISOString().split('T')[0]}.${format}`;

      const downloadUrl = URL.createObjectURL(blob);

      return { filename, url: downloadUrl };
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  // Update auth token
  updateToken(token: string) {
    this.token = token;
  }

  // Mock data for development when API is not available
  private getMockData(endpoint: string): any {
    const mockMetrics: DeliveryMetrics = {
      totalShipments: 1247,
      deliveredShipments: 1174,
      failedShipments: 40,
      inTransitShipments: 33,
      deliveryRate: 94.2,
      averageDeliveryTime: 127,
      totalRevenue: 1808300,
      totalCOD: 892650,
      averageRating: 4.6,
      onTimeDeliveryRate: 87.5,
      costPerDelivery: 850,
      revenuePerDelivery: 1540,
      returnRate: 1.8
    };

    const mockAgentPerformance: AgentPerformanceData[] = [
      {
        agentId: 'agent-001',
        agentName: 'Ahmed Ibrahim',
        employeeId: 'DLV001',
        totalDeliveries: 156,
        successfulDeliveries: 152,
        failedDeliveries: 4,
        successRate: 97.4,
        averageDeliveryTime: 89,
        totalDistance: 2340,
        averageRating: 4.8,
        totalEarnings: 124800,
        hoursWorked: 142,
        deliveriesPerHour: 1.1,
        customerComplaints: 0,
        onTimeDeliveries: 145,
        onTimeRate: 92.9,
        vehicleType: 'BIKE',
        activeHours: 142,
        lastDelivery: '2024-01-15T14:30:00Z',
        performanceTrend: 'up'
      }
    ];

    const mockZonePerformance: ZonePerformanceData[] = [
      {
        zoneId: 'zone-001',
        zoneName: 'Lagos Island',
        totalDeliveries: 298,
        successfulDeliveries: 290,
        averageDeliveryTime: 95,
        successRate: 97.3,
        totalRevenue: 431700,
        averageDistance: 8.2,
        coverage: 98.5,
        activeAgents: 12,
        peakHours: ['09:00-11:00', '14:00-16:00', '18:00-20:00'],
        demandDensity: 9.9,
        costEfficiency: 172680
      }
    ];

    const mockTimeSeriesData: TimeSeriesData[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      mockTimeSeriesData.push({
        date: date.toISOString().split('T')[0],
        totalDeliveries: Math.floor(Math.random() * 30) + 25,
        successfulDeliveries: Math.floor(Math.random() * 25) + 23,
        failedDeliveries: Math.floor(Math.random() * 3) + 1,
        averageDeliveryTime: Math.floor(Math.random() * 40) + 90,
        totalRevenue: Math.floor(Math.random() * 15000) + 35000,
        onTimeDeliveries: Math.floor(Math.random() * 22) + 20,
        customerSatisfaction: 4.2 + Math.random() * 0.8,
        activeAgents: Math.floor(Math.random() * 5) + 8
      });
    }

    const mockInsights: DeliveryInsight[] = [
      {
        type: 'success',
        title: 'Peak Performance',
        description: 'Delivery success rate increased by 2.1% this month, exceeding target',
        actionable: false,
        priority: 'low',
        category: 'performance'
      },
      {
        type: 'warning',
        title: 'Attention Needed',
        description: 'Lekki zone showing 12% longer delivery times - consider route optimization',
        actionable: true,
        priority: 'medium',
        category: 'efficiency'
      }
    ];

    const mockRealtimeMetrics: RealtimeMetrics = {
      activeDeliveries: 43,
      agentsOnline: 18,
      avgDeliveryTime: 124,
      successRateToday: 96.2,
      revenueToday: 87350
    };

    // Return appropriate mock data based on endpoint
    if (endpoint === '/') {
      return {
        metrics: mockMetrics,
        agentPerformance: mockAgentPerformance,
        zonePerformance: mockZonePerformance,
        timeSeriesData: mockTimeSeriesData,
        insights: mockInsights
      };
    } else if (endpoint === '/metrics') {
      return mockMetrics;
    } else if (endpoint === '/agents') {
      return mockAgentPerformance;
    } else if (endpoint === '/zones') {
      return mockZonePerformance;
    } else if (endpoint === '/trends') {
      return mockTimeSeriesData;
    } else if (endpoint === '/insights') {
      return mockInsights;
    } else if (endpoint === '/realtime') {
      return mockRealtimeMetrics;
    }

    return {};
  }
}

// Create and export a singleton instance
export const deliveryAnalyticsApi = new DeliveryAnalyticsApiService();

// Also export the class for testing or custom instances
export { DeliveryAnalyticsApiService };

// Helper functions for common operations
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const getTimeframeOptions = () => [
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
  { value: '6m', label: 'Last 6 months', days: 180 },
  { value: '1y', label: 'Last year', days: 365 },
  { value: 'custom', label: 'Custom range', days: 0 }
];

export const createTimeframe = (option: string): AnalyticsTimeframe => {
  const end = new Date();
  const start = new Date();

  switch (option) {
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    case '6m':
      start.setMonth(start.getMonth() - 6);
      break;
    case '1y':
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setDate(start.getDate() - 30);
  }

  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
};
