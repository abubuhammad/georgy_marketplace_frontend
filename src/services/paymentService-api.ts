import { apiClient } from '@/lib/apiClient';
import {
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentCalculationInput,
  PaymentCalculationResult,
  PaymentConfig,
  Payment,
  PaymentBreakdown,
  SellerFinancials,
  FinancialReport
} from '@/types/payment';

class PaymentApiService {
  // Get payment configuration
  async getPaymentConfig(): Promise<PaymentConfig> {
    try {
      const response = await apiClient.get('/payments/config');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment config:', error);
      throw new Error('Failed to fetch payment configuration');
    }
  }

  // Calculate payment breakdown
  async calculateBreakdown(input: PaymentCalculationInput): Promise<PaymentCalculationResult> {
    try {
      const response = await apiClient.post('/payments/calculate', input);
      return {
        breakdown: response.data.breakdown,
        authorizedAmount: response.data.breakdown.total
      };
    } catch (error) {
      console.error('Error calculating payment breakdown:', error);
      throw new Error('Failed to calculate payment breakdown');
    }
  }

  // Initialize payment
  async initiatePayment(request: PaymentInitRequest): Promise<PaymentInitResponse> {
    try {
      const response = await apiClient.post('/payments/initiate', request);
      return response.data;
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw new Error('Failed to initiate payment');
    }
  }

  // Get payment by reference
  async getPayment(reference: string): Promise<Payment> {
    try {
      const response = await apiClient.get(`/payments/${reference}`);
      return response.data.payment;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw new Error('Failed to fetch payment details');
    }
  }

  // Get user payments
  async getUserPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    method?: string;
  }): Promise<{
    payments: Payment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const response = await apiClient.get('/payments/user/payments', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user payments:', error);
      throw new Error('Failed to fetch user payments');
    }
  }

  // Get seller financials
  async getSellerFinancials(sellerId: string): Promise<SellerFinancials> {
    try {
      const response = await apiClient.get(`/payments/seller/${sellerId}/financials`);
      return response.data;
    } catch (error) {
      console.error('Error fetching seller financials:', error);
      throw new Error('Failed to fetch seller financials');
    }
  }

  // Get seller payouts
  async getSellerPayouts(sellerId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<any> {
    try {
      const response = await apiClient.get(`/payments/seller/${sellerId}/payouts`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching seller payouts:', error);
      throw new Error('Failed to fetch seller payouts');
    }
  }

  // Release escrow payment
  async releaseEscrow(paymentId: string): Promise<boolean> {
    try {
      await apiClient.post(`/payments/${paymentId}/escrow/release`);
      return true;
    } catch (error) {
      console.error('Error releasing escrow:', error);
      throw new Error('Failed to release escrow payment');
    }
  }

  // Process refund
  async processRefund(paymentId: string, amount: number, reason: string): Promise<boolean> {
    try {
      await apiClient.post(`/payments/${paymentId}/refund`, { amount, reason });
      return true;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }

  // Get financial reports (admin)
  async getFinancialReports(params: {
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  }): Promise<FinancialReport> {
    try {
      const response = await apiClient.get('/payments/reports/financial', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching financial reports:', error);
      throw new Error('Failed to fetch financial reports');
    }
  }

  // Payment method specific operations

  // Initialize Paystack payment
  async initializePaystackPayment(reference: string, email: string, amount: number): Promise<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }> {
    try {
      // This would integrate with Paystack API
      // For now, return mock data
      return {
        authorization_url: `https://checkout.paystack.com/${reference}`,
        access_code: `access_${reference}`,
        reference
      };
    } catch (error) {
      console.error('Error initializing Paystack payment:', error);
      throw new Error('Failed to initialize card payment');
    }
  }

  // Verify Paystack payment
  async verifyPaystackPayment(reference: string): Promise<{
    status: string;
    data: any;
  }> {
    try {
      // This would verify with Paystack API
      // For now, return mock data
      return {
        status: 'success',
        data: {
          reference,
          amount: 0,
          status: 'success'
        }
      };
    } catch (error) {
      console.error('Error verifying Paystack payment:', error);
      throw new Error('Failed to verify payment');
    }
  }

  // Generate bank transfer details
  async generateBankTransferDetails(reference: string, amount: number): Promise<{
    bank: string;
    accountNumber: string;
    accountName: string;
    reference: string;
    amount: number;
    expiresAt: string;
  }> {
    try {
      // This would generate dynamic bank details or use dedicated virtual accounts
      return {
        bank: 'GTBank',
        accountNumber: '0123456789',
        accountName: 'Georgy Marketplace Escrow',
        reference,
        amount,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };
    } catch (error) {
      console.error('Error generating bank transfer details:', error);
      throw new Error('Failed to generate bank transfer details');
    }
  }

  // Generate USSD codes
  generateUSSDCodes(reference: string, amount: number): {
    [bank: string]: string;
  } {
    return {
      'GTBank': `*737*1*${amount}*${reference}#`,
      'Access Bank': `*901*1*${amount}*${reference}#`,
      'Zenith Bank': `*966*1*${amount}*${reference}#`,
      'First Bank': `*894*1*${amount}*${reference}#`,
      'UBA': `*919*1*${amount}*${reference}#`,
      'Sterling Bank': `*822*1*${amount}*${reference}#`
    };
  }

  // Mobile money integration
  async initializeMobileMoneyPayment(reference: string, phoneNumber: string, amount: number): Promise<{
    provider: string;
    instructions: string;
    reference: string;
  }> {
    try {
      // Detect provider from phone number
      const provider = this.detectMobileMoneyProvider(phoneNumber);
      
      return {
        provider,
        instructions: `Pay ₦${amount} using your ${provider} wallet. Reference: ${reference}`,
        reference
      };
    } catch (error) {
      console.error('Error initializing mobile money payment:', error);
      throw new Error('Failed to initialize mobile money payment');
    }
  }

  private detectMobileMoneyProvider(phoneNumber: string): string {
    // Simple provider detection based on phone number prefix
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    if (cleanNumber.startsWith('0803') || cleanNumber.startsWith('0806') || cleanNumber.startsWith('0813')) {
      return 'Airtel Money';
    } else if (cleanNumber.startsWith('0805') || cleanNumber.startsWith('0807') || cleanNumber.startsWith('0815')) {
      return 'GTB Mobile Money';
    } else if (cleanNumber.startsWith('0802') || cleanNumber.startsWith('0808') || cleanNumber.startsWith('0812')) {
      return 'Palmpay';
    } else {
      return 'Mobile Money';
    }
  }
}

export const paymentApiService = new PaymentApiService();
export default paymentApiService;
