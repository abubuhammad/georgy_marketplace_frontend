import { apiClient } from '@/lib/apiClient';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_5b40d0de8f21e3541640e00e21c156c725724643';

export interface PaystackConfig {
  key: string;
  email: string;
  amount: number; // in kobo (multiply naira by 100)
  currency?: string;
  ref?: string;
  metadata?: {
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string | number;
    }>;
    [key: string]: any;
  };
  callback?: (response: PaystackResponse) => void;
  onClose?: () => void;
  channels?: ('card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer')[];
}

export interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string;
  trxref: string;
}

export interface PaymentInitResponse {
  success: boolean;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
  error?: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    channel: string;
    customer: {
      email: string;
      first_name: string;
      last_name: string;
    };
  };
  error?: string;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

class PaystackService {
  private scriptLoaded: boolean = false;
  private scriptLoading: boolean = false;

  // Load Paystack inline script
  async loadScript(): Promise<boolean> {
    if (this.scriptLoaded) return true;
    if (this.scriptLoading) {
      // Wait for script to load
      return new Promise((resolve) => {
        const checkLoaded = setInterval(() => {
          if (this.scriptLoaded) {
            clearInterval(checkLoaded);
            resolve(true);
          }
        }, 100);
      });
    }

    this.scriptLoading = true;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      
      script.onload = () => {
        this.scriptLoaded = true;
        this.scriptLoading = false;
        resolve(true);
      };
      
      script.onerror = () => {
        this.scriptLoading = false;
        reject(new Error('Failed to load Paystack script'));
      };

      document.body.appendChild(script);
    });
  }

  // Generate unique reference
  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `GMP_${timestamp}_${random}`;
  }

  // Initialize payment via backend (recommended for security)
  async initializePayment(data: {
    email: string;
    amount: number; // in Naira
    orderId?: string;
    metadata?: Record<string, any>;
  }): Promise<PaymentInitResponse> {
    try {
      const response = await apiClient.post<any>('/payments/initiate', {
        email: data.email,
        amount: data.amount,
        currency: 'NGN',
        orderId: data.orderId,
        method: 'card',
        metadata: {
          orderId: data.orderId,
          ...data.metadata
        }
      });

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to initialize payment'
      };
    } catch (error) {
      console.error('Payment initialization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initialization failed'
      };
    }
  }

  // Pay with Paystack Popup (client-side)
  async payWithPopup(config: {
    email: string;
    amount: number; // in Naira
    reference?: string;
    orderId?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    onSuccess: (response: PaystackResponse) => void;
    onCancel: () => void;
  }): Promise<void> {
    await this.loadScript();

    const reference = config.reference || this.generateReference();
    const amountInKobo = Math.round(config.amount * 100);

    const paystackConfig: PaystackConfig = {
      key: PAYSTACK_PUBLIC_KEY,
      email: config.email,
      amount: amountInKobo,
      currency: 'NGN',
      ref: reference,
      channels: ['card', 'bank', 'ussd', 'bank_transfer', 'mobile_money'],
      metadata: {
        custom_fields: [
          {
            display_name: 'Order ID',
            variable_name: 'order_id',
            value: config.orderId || 'N/A'
          },
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: `${config.firstName || ''} ${config.lastName || ''}`.trim() || 'N/A'
          },
          {
            display_name: 'Phone',
            variable_name: 'phone',
            value: config.phone || 'N/A'
          }
        ],
        orderId: config.orderId
      },
      callback: (response) => {
        config.onSuccess(response);
      },
      onClose: () => {
        config.onCancel();
      }
    };

    const handler = window.PaystackPop.setup(paystackConfig);
    handler.openIframe();
  }

  // Verify payment
  async verifyPayment(reference: string): Promise<PaymentVerifyResponse> {
    try {
      const response = await apiClient.get<any>(`/payments/verify/${reference}`);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data
        };
      }

      return {
        success: false,
        error: response.error || 'Payment verification failed'
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment verification failed'
      };
    }
  }

  // Get payment history
  async getPaymentHistory(page: number = 1, limit: number = 20): Promise<any> {
    try {
      const response = await apiClient.get<any>(`/payments/history?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return { success: false, data: [] };
    }
  }
}

export const paystackService = new PaystackService();
export default paystackService;
