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
  private basePath = '/payments';

  // Calculate payment breakdown with taxes and fees
  async calculatePayment(data: {
    amount: number;
    category?: string;
    sellerTier?: 'standard' | 'premium' | 'enterprise';
    currency?: string;
  }): Promise<PaymentCalculation> {
    const response = await apiClient.post(`${this.basePath}/calculate`, data);
    return response.data.data;
  }

  // Initiate a new payment
  async initiatePayment(data: PaymentInitiation): Promise<{
    payment: Payment;
    providerResponse: any;
  }> {
    const response = await apiClient.post(`${this.basePath}/initiate`, data);
    return response.data.data;
  }

  // Verify payment status
  async verifyPayment(reference: string): Promise<Payment> {
    const response = await apiClient.get(`${this.basePath}/verify/${reference}`);
    return response.data.data;
  }

  // Release escrow funds
  async releaseEscrow(data: EscrowRelease): Promise<Payment> {
    const response = await apiClient.post(`${this.basePath}/escrow/release`, data);
    return response.data.data;
  }

  // Get payment history
  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<PaymentHistory> {
    const response = await apiClient.get(`${this.basePath}/history`, { params });
    return response.data.data;
  }

  // Generate invoice for payment
  async generateInvoice(paymentId: string): Promise<Invoice> {
    const response = await apiClient.post(`${this.basePath}/invoice/${paymentId}`);
    return response.data.data;
  }

  // Process refund
  async processRefund(paymentId: string, data: RefundRequest): Promise<any> {
    const response = await apiClient.post(`${this.basePath}/refund/${paymentId}`, data);
    return response.data.data;
  }

  // Get payment details by ID
  async getPayment(paymentId: string): Promise<Payment> {
    const response = await apiClient.get(`${this.basePath}/${paymentId}`);
    return response.data.data;
  }
}

export const paymentApiService = new PaymentApiService();
