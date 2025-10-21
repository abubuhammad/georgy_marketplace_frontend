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
  private basePath = '/admin';

  // Revenue Share Schemes Management
  async createRevenueShareScheme(data: Omit<RevenueShareScheme, 'id' | 'createdAt' | 'updatedAt'>): Promise<RevenueShareScheme> {
    const response = await apiClient.post(`${this.basePath}/revenue-schemes`, data);
    return response.data.data;
  }

  async getRevenueShareSchemes(): Promise<RevenueShareScheme[]> {
    const response = await apiClient.get(`${this.basePath}/revenue-schemes`);
    return response.data.data;
  }

  async updateRevenueShareScheme(id: string, data: Partial<RevenueShareScheme>): Promise<RevenueShareScheme> {
    const response = await apiClient.put(`${this.basePath}/revenue-schemes/${id}`, data);
    return response.data.data;
  }

  async deleteRevenueShareScheme(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/revenue-schemes/${id}`);
  }

  // Tax Rules Management
  async createTaxRule(data: Omit<TaxRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaxRule> {
    const response = await apiClient.post(`${this.basePath}/tax-rules`, data);
    return response.data.data;
  }

  async getTaxRules(): Promise<TaxRule[]> {
    const response = await apiClient.get(`${this.basePath}/tax-rules`);
    return response.data.data;
  }

  async updateTaxRule(id: string, data: Partial<TaxRule>): Promise<TaxRule> {
    const response = await apiClient.put(`${this.basePath}/tax-rules/${id}`, data);
    return response.data.data;
  }

  async deleteTaxRule(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/tax-rules/${id}`);
  }

  // Financial Analytics
  async getPaymentAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<PaymentAnalytics> {
    const response = await apiClient.get(`${this.basePath}/analytics/payments`, { params });
    return response.data.data;
  }

  async getRevenueBreakdown(params?: {
    period?: string;
  }): Promise<RevenueBreakdown> {
    const response = await apiClient.get(`${this.basePath}/analytics/revenue`, { params });
    return response.data.data;
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
    const response = await apiClient.get(`${this.basePath}/payouts/pending`, { params });
    return response.data.data;
  }

  async processPayouts(payoutIds: string[]): Promise<Array<{
    payoutId: string;
    success: boolean;
    payout?: Payout;
    error?: string;
  }>> {
    const response = await apiClient.post(`${this.basePath}/payouts/process`, { payoutIds });
    return response.data.data;
  }

  // System Configuration
  async getPaymentConfig(): Promise<PaymentConfig> {
    const response = await apiClient.get(`${this.basePath}/config/payment`);
    return response.data.data;
  }

  async updatePaymentConfig(config: Partial<PaymentConfig>): Promise<void> {
    await apiClient.put(`${this.basePath}/config/payment`, { config });
  }
}

export const adminApiService = new AdminApiService();
