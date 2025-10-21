import apiClient from '../apiClient';

export interface RevenueShareScheme {
  id: string;
  name: string;
  category?: string;
  platformFeeRate: number;
  paymentFeeRate: number;
  taxRate: number;
  isActive: boolean;
  sellerTier?: string;
  minimumThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaxRule {
  id: string;
  name: string;
  type: 'vat' | 'service_tax' | 'withholding_tax' | 'stamp_duty';
  rate: number;
  fixedAmount: number;
  threshold: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentAnalytics {
  totalRevenue: number;
  totalTransactions: number;
  averageTransaction: number;
  platformRevenue: number;
  sellerPayouts: number;
  refunds: number;
  chartData: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
}

export interface RevenueBreakdown {
  platformFees: number;
  paymentFees: number;
  taxes: number;
  sellerPayouts: number;
  refunds: number;
  byCategory: Record<string, number>;
  byPaymentMethod: Record<string, number>;
  trends: Array<{
    period: string;
    revenue: number;
    growth: number;
  }>;
}

export interface Payout {
  id: string;
  sellerId: string;
  totalAmount: number;
  currency: string;
  status: string;
  payoutMethod: string;
  bankDetails?: string;
  reference: string;
  scheduledAt?: string;
  processedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  payoutItems: Array<{
    id: string;
    amount: number;
    description?: string;
    payment: {
      paymentReference: string;
      amount: number;
    };
  }>;
}

export interface PaymentConfig {
  supportedCurrencies: string[];
  paymentMethods: Array<{
    id: string;
    name: string;
    enabled: boolean;
  }>;
  providers: Array<{
    id: string;
    name: string;
    enabled: boolean;
  }>;
  escrowSettings: {
    enabled: boolean;
    autoReleaseHours: number;
    disputeWindow: number;
  };
}

class AdminApiService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient(API_CONFIG.admin);
  }

  // Revenue Share Schemes Management
  async createRevenueShareScheme(data: Omit<RevenueShareScheme, 'id' | 'createdAt' | 'updatedAt'>): Promise<RevenueShareScheme> {
    return this.apiClient.post('/revenue-schemes', data);
  }

  async getRevenueShareSchemes(): Promise<RevenueShareScheme[]> {
    return this.apiClient.get('/revenue-schemes');
  }

  async updateRevenueShareScheme(id: string, data: Partial<RevenueShareScheme>): Promise<RevenueShareScheme> {
    return this.apiClient.put(`/revenue-schemes/${id}`, data);
  }

  async deleteRevenueShareScheme(id: string): Promise<void> {
    return this.apiClient.delete(`/revenue-schemes/${id}`);
  }

  // Tax Rules Management
  async createTaxRule(data: Omit<TaxRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaxRule> {
    return this.apiClient.post('/tax-rules', data);
  }

  async getTaxRules(): Promise<TaxRule[]> {
    return this.apiClient.get('/tax-rules');
  }

  async updateTaxRule(id: string, data: Partial<TaxRule>): Promise<TaxRule> {
    return this.apiClient.put(`/tax-rules/${id}`, data);
  }

  async deleteTaxRule(id: string): Promise<void> {
    return this.apiClient.delete(`/tax-rules/${id}`);
  }

  // Financial Analytics
  async getPaymentAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<PaymentAnalytics> {
    return this.apiClient.get('/analytics/payments', { params });
  }

  async getRevenueBreakdown(params?: {
    period?: string;
  }): Promise<RevenueBreakdown> {
    return this.apiClient.get('/analytics/revenue', { params });
  }

  // Payout Management
  async getPendingPayouts(params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    payouts: Payout[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  }> {
    return this.apiClient.get('/payouts/pending', { params });
  }

  async processPayouts(payoutIds: string[]): Promise<Array<{
    payoutId: string;
    success: boolean;
    payout?: Payout;
    error?: string;
  }>> {
    return this.apiClient.post('/payouts/process', { payoutIds });
  }

  // System Configuration
  async getPaymentConfig(): Promise<PaymentConfig> {
    return this.apiClient.get('/config/payment');
  }

  async updatePaymentConfig(config: Partial<PaymentConfig>): Promise<void> {
    return this.apiClient.put('/config/payment', { config });
  }
}

export const adminApi = new AdminApiService();
