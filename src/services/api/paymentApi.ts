import apiClient from '../apiClient';

export interface PaymentCalculation {
  amount: number;
  fees: number;
  taxes: number;
  platformFee: number;
  sellerAmount: number;
  breakdown: {
    vat: number;
    serviceTax: number;
    withholdingTax: number;
    stampDuty: number;
    providerFee: number;
    platformCommission: number;
  };
}

export interface PaymentInitiation {
  amount: number;
  currency?: string;
  paymentMethod: string;
  provider: string;
  payeeId?: string;
  orderId?: string;
  serviceRequestId?: string;
  type?: 'purchase' | 'escrow';
  description?: string;
  metadata?: any;
}

export interface Payment {
  id: string;
  paymentReference: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  provider: string;
  status: string;
  type: string;
  description?: string;
  payerId: string;
  payeeId?: string;
  orderId?: string;
  serviceRequestId?: string;
  fees: number;
  taxes: number;
  platformFee: number;
  sellerAmount: number;
  metadata?: string;
  providerResponse?: string;
  escrowReleased: boolean;
  escrowReleasedAt?: string;
  refundedAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistory {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface EscrowRelease {
  paymentId: string;
  releaseReason: string;
}

export interface Invoice {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  customerId: string;
  sellerId?: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: string;
  dueDate?: string;
  paidAt?: string;
  metadata?: string;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface RefundRequest {
  amount: number;
  reason: string;
}

class PaymentApiService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient(API_CONFIG.payments);
  }

  // Calculate payment breakdown with taxes and fees
  async calculatePayment(data: {
    amount: number;
    category?: string;
    sellerTier?: 'standard' | 'premium' | 'enterprise';
    currency?: string;
  }): Promise<PaymentCalculation> {
    return this.apiClient.post('/calculate', data);
  }

  // Initiate a new payment
  async initiatePayment(data: PaymentInitiation): Promise<{
    payment: Payment;
    providerResponse: any;
  }> {
    return this.apiClient.post('/initiate', data);
  }

  // Verify payment status
  async verifyPayment(reference: string): Promise<Payment> {
    return this.apiClient.get(`/verify/${reference}`);
  }

  // Release escrow funds
  async releaseEscrow(data: EscrowRelease): Promise<Payment> {
    return this.apiClient.post('/escrow/release', data);
  }

  // Get payment history
  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<PaymentHistory> {
    return this.apiClient.get('/history', { params });
  }

  // Generate invoice for payment
  async generateInvoice(paymentId: string): Promise<Invoice> {
    return this.apiClient.post(`/invoice/${paymentId}`);
  }

  // Process refund
  async processRefund(paymentId: string, data: RefundRequest): Promise<any> {
    return this.apiClient.post(`/refund/${paymentId}`, data);
  }

  // Get payment details by ID
  async getPayment(paymentId: string): Promise<Payment> {
    return this.apiClient.get(`/${paymentId}`);
  }
}

export const paymentApi = new PaymentApiService();
