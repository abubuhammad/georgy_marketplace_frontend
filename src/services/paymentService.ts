import apiClient from './apiClient';

export interface PaymentResponse {
  success: boolean;
  message: string;
  data: {
    authorizationUrl: string;
    accessCode: string;
    reference: string;
  };
}

export interface PaymentInitializationData {
  amount: number;
  email: string;
  currency?: string;
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}

class PaymentService {
  // Initialize Paystack payment
  async initializePayment(data: PaymentInitializationData): Promise<PaymentResponse> {
    const response = await apiClient.post('/payments/initialize', {
      ...data,
      currency: data.currency || 'NGN',
      amount: data.amount * 100, // Convert to kobo
    });
    return response.data;
  }

  // Verify payment
  async verifyPayment(reference: string): Promise<unknown> {
    const response = await apiClient.get(`/payments/verify/${reference}`);
    return response.data;
  }

  // Get payment history
  async getPaymentHistory(userId: string): Promise<unknown> {
    const response = await apiClient.get(`/payments/history/${userId}`);
    return response.data;
  }

  // Process refund
  async processRefund(transactionId: string, amount?: number): Promise<unknown> {
    const response = await apiClient.post('/payments/refund', {
      transactionId,
      amount: amount ? amount * 100 : undefined, // Convert to kobo
    });
    return response.data;
  }
}

export default new PaymentService();
