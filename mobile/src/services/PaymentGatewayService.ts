import { Alert } from 'react-native';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'mobile_money' | 'bank_transfer' | 'ussd';
  icon: string;
  description: string;
  enabled: boolean;
}

export interface CardPaymentDetails {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  pin?: string;
}

export interface MobileMoneyDetails {
  provider: 'mtn' | 'airtel' | 'glo' | '9mobile';
  phoneNumber: string;
  pin?: string;
}

export interface BankTransferDetails {
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  email: string;
  reference: string;
  description: string;
  metadata?: Record<string, any>;
  paymentMethod: PaymentMethod;
  paymentDetails: CardPaymentDetails | MobileMoneyDetails | BankTransferDetails;
}

export interface PaymentResponse {
  success: boolean;
  reference: string;
  transactionId: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  message: string;
  gatewayResponse?: any;
  redirectUrl?: string;
}

export interface PaymentVerification {
  reference: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  transactionId: string;
  paidAt?: string;
  channel: string;
  currency: string;
  gatewayResponse: any;
}

class PaymentGatewayService {
  private readonly PAYSTACK_PUBLIC_KEY = process.env.EXPO_PUBLIC_PAYSTACK_KEY || 'pk_test_xxx';
  private readonly FLUTTERWAVE_PUBLIC_KEY = process.env.EXPO_PUBLIC_FLUTTERWAVE_KEY || 'FLWPUBK_TEST-xxx';
  private readonly PAYSTACK_BASE_URL = 'https://api.paystack.co';
  private readonly FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

  private primaryGateway: 'paystack' | 'flutterwave' = 'paystack';

  /**
   * Get available payment methods for Nigerian users
   */
  getAvailablePaymentMethods(): PaymentMethod[] {
    return [
      {
        id: 'visa_mastercard',
        name: 'Card (Visa/Mastercard)',
        type: 'card',
        icon: 'card-outline',
        description: 'Pay with your debit/credit card',
        enabled: true,
      },
      {
        id: 'verve',
        name: 'Verve Card',
        type: 'card',
        icon: 'card-outline',
        description: 'Pay with your Verve card',
        enabled: true,
      },
      {
        id: 'mtn_momo',
        name: 'MTN Mobile Money',
        type: 'mobile_money',
        icon: 'phone-portrait-outline',
        description: 'Pay with MTN MoMo',
        enabled: true,
      },
      {
        id: 'airtel_money',
        name: 'Airtel Money',
        type: 'mobile_money',
        icon: 'phone-portrait-outline',
        description: 'Pay with Airtel Money',
        enabled: true,
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        type: 'bank_transfer',
        icon: 'business-outline',
        description: 'Direct bank transfer',
        enabled: true,
      },
      {
        id: 'ussd',
        name: 'USSD',
        type: 'ussd',
        icon: 'keypad-outline',
        description: 'Pay via USSD code',
        enabled: true,
      },
    ];
  }

  /**
   * Process payment using the configured gateway
   */
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Validate payment request
      this.validatePaymentRequest(paymentRequest);

      // Use primary gateway with fallback
      let response = await this.processWithGateway(paymentRequest, this.primaryGateway);
      
      // If primary gateway fails, try fallback
      if (!response.success && this.primaryGateway === 'paystack') {
        console.log('Paystack failed, trying Flutterwave...');
        response = await this.processWithGateway(paymentRequest, 'flutterwave');
      } else if (!response.success && this.primaryGateway === 'flutterwave') {
        console.log('Flutterwave failed, trying Paystack...');
        response = await this.processWithGateway(paymentRequest, 'paystack');
      }

      return response;
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        reference: paymentRequest.reference,
        transactionId: '',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  /**
   * Process payment with specific gateway
   */
  private async processWithGateway(
    paymentRequest: PaymentRequest,
    gateway: 'paystack' | 'flutterwave'
  ): Promise<PaymentResponse> {
    switch (gateway) {
      case 'paystack':
        return this.processWithPaystack(paymentRequest);
      case 'flutterwave':
        return this.processWithFlutterwave(paymentRequest);
      default:
        throw new Error('Unsupported gateway');
    }
  }

  /**
   * Process payment with Paystack
   */
  private async processWithPaystack(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const { paymentMethod, paymentDetails, amount, email, reference } = paymentRequest;

      let endpoint = '';
      let payload: any = {
        email,
        amount: amount * 100, // Convert to kobo
        reference,
        currency: 'NGN',
        metadata: paymentRequest.metadata,
      };

      switch (paymentMethod.type) {
        case 'card':
          endpoint = '/transaction/initialize';
          const cardDetails = paymentDetails as CardPaymentDetails;
          payload.card = {
            number: cardDetails.cardNumber.replace(/\s/g, ''),
            cvv: cardDetails.cvv,
            expiry_month: cardDetails.expiryMonth,
            expiry_year: cardDetails.expiryYear,
            pin: cardDetails.pin,
          };
          break;

        case 'mobile_money':
          endpoint = '/transaction/initialize';
          const mobileDetails = paymentDetails as MobileMoneyDetails;
          payload.mobile_money = {
            phone: mobileDetails.phoneNumber,
            provider: mobileDetails.provider,
          };
          break;

        case 'bank_transfer':
          endpoint = '/transaction/initialize';
          payload.channels = ['bank_transfer'];
          break;

        case 'ussd':
          endpoint = '/transaction/initialize';
          payload.channels = ['ussd'];
          break;

        default:
          throw new Error('Unsupported payment method');
      }

      const response = await fetch(`${this.PAYSTACK_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.PAYSTACK_PUBLIC_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status && result.data) {
        return {
          success: true,
          reference: result.data.reference,
          transactionId: result.data.reference,
          status: 'pending',
          message: 'Payment initiated successfully',
          gatewayResponse: result,
          redirectUrl: result.data.authorization_url,
        };
      } else {
        throw new Error(result.message || 'Payment initialization failed');
      }
    } catch (error) {
      console.error('Paystack payment error:', error);
      throw error;
    }
  }

  /**
   * Process payment with Flutterwave
   */
  private async processWithFlutterwave(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const { paymentMethod, paymentDetails, amount, email, reference } = paymentRequest;

      const payload: any = {
        tx_ref: reference,
        amount,
        currency: 'NGN',
        payment_options: this.getFlutterwavePaymentOptions(paymentMethod),
        customer: {
          email,
          phone_number: (paymentDetails as any).phoneNumber || '',
          name: 'Customer',
        },
        customizations: {
          title: 'ArtisanConnect Payment',
          description: paymentRequest.description,
          logo: 'https://your-logo-url.com/logo.png',
        },
        meta: paymentRequest.metadata,
      };

      const response = await fetch(`${this.FLUTTERWAVE_BASE_URL}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.FLUTTERWAVE_PUBLIC_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === 'success' && result.data) {
        return {
          success: true,
          reference: result.data.tx_ref,
          transactionId: result.data.id?.toString() || '',
          status: 'pending',
          message: 'Payment initiated successfully',
          gatewayResponse: result,
          redirectUrl: result.data.link,
        };
      } else {
        throw new Error(result.message || 'Payment initialization failed');
      }
    } catch (error) {
      console.error('Flutterwave payment error:', error);
      throw error;
    }
  }

  /**
   * Verify payment transaction
   */
  async verifyPayment(reference: string, gateway?: 'paystack' | 'flutterwave'): Promise<PaymentVerification> {
    const targetGateway = gateway || this.primaryGateway;

    try {
      switch (targetGateway) {
        case 'paystack':
          return this.verifyPaystackPayment(reference);
        case 'flutterwave':
          return this.verifyFlutterwavePayment(reference);
        default:
          throw new Error('Unsupported gateway for verification');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  /**
   * Verify Paystack payment
   */
  private async verifyPaystackPayment(reference: string): Promise<PaymentVerification> {
    const response = await fetch(`${this.PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${this.PAYSTACK_PUBLIC_KEY}`,
      },
    });

    const result = await response.json();

    if (result.status && result.data) {
      return {
        reference: result.data.reference,
        amount: result.data.amount / 100, // Convert from kobo
        status: result.data.status === 'success' ? 'success' : 'failed',
        transactionId: result.data.id?.toString(),
        paidAt: result.data.paid_at,
        channel: result.data.channel,
        currency: result.data.currency,
        gatewayResponse: result,
      };
    } else {
      throw new Error(result.message || 'Payment verification failed');
    }
  }

  /**
   * Verify Flutterwave payment
   */
  private async verifyFlutterwavePayment(reference: string): Promise<PaymentVerification> {
    const response = await fetch(`${this.FLUTTERWAVE_BASE_URL}/transactions?tx_ref=${reference}`, {
      headers: {
        'Authorization': `Bearer ${this.FLUTTERWAVE_PUBLIC_KEY}`,
      },
    });

    const result = await response.json();

    if (result.status === 'success' && result.data?.length > 0) {
      const transaction = result.data[0];
      return {
        reference: transaction.tx_ref,
        amount: transaction.amount,
        status: transaction.status === 'successful' ? 'success' : 'failed',
        transactionId: transaction.id?.toString(),
        paidAt: transaction.created_at,
        channel: transaction.payment_type,
        currency: transaction.currency,
        gatewayResponse: result,
      };
    } else {
      throw new Error('Payment verification failed');
    }
  }

  /**
   * Get Nigerian banks list
   */
  async getNigerianBanks(): Promise<Array<{ name: string; code: string; }>> {
    try {
      const response = await fetch(`${this.PAYSTACK_BASE_URL}/bank`, {
        headers: {
          'Authorization': `Bearer ${this.PAYSTACK_PUBLIC_KEY}`,
        },
      });

      const result = await response.json();
      
      if (result.status && result.data) {
        return result.data
          .filter((bank: any) => bank.country === 'Nigeria')
          .map((bank: any) => ({
            name: bank.name,
            code: bank.code,
          }));
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch banks:', error);
      return [];
    }
  }

  /**
   * Resolve account number to get account name
   */
  async resolveAccountNumber(accountNumber: string, bankCode: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.PAYSTACK_BASE_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          headers: {
            'Authorization': `Bearer ${this.PAYSTACK_PUBLIC_KEY}`,
          },
        }
      );

      const result = await response.json();
      
      if (result.status && result.data) {
        return result.data.account_name;
      }

      return null;
    } catch (error) {
      console.error('Failed to resolve account:', error);
      return null;
    }
  }

  /**
   * Calculate transaction fees
   */
  calculateTransactionFee(amount: number, paymentMethod: PaymentMethod): number {
    // Nigerian payment gateway fees (approximate)
    switch (paymentMethod.type) {
      case 'card':
        // 1.5% + NGN 100 for card payments
        return Math.max(amount * 0.015 + 100, 100);
      case 'mobile_money':
        // Flat 1% for mobile money
        return amount * 0.01;
      case 'bank_transfer':
        // Flat NGN 50 for bank transfers
        return 50;
      case 'ussd':
        // Flat NGN 50 for USSD
        return 50;
      default:
        return 0;
    }
  }

  /**
   * Handle payment callback/webhook
   */
  async handlePaymentCallback(payload: any, gateway: 'paystack' | 'flutterwave'): Promise<boolean> {
    try {
      let reference = '';
      
      if (gateway === 'paystack') {
        reference = payload.data?.reference;
      } else if (gateway === 'flutterwave') {
        reference = payload.data?.tx_ref;
      }

      if (!reference) {
        throw new Error('No reference found in callback');
      }

      // Verify the payment
      const verification = await this.verifyPayment(reference, gateway);
      
      // TODO: Update your database with payment status
      console.log('Payment verified:', verification);

      return verification.status === 'success';
    } catch (error) {
      console.error('Payment callback error:', error);
      return false;
    }
  }

  // Private helper methods
  private validatePaymentRequest(request: PaymentRequest): void {
    if (request.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    if (!request.email || !this.isValidEmail(request.email)) {
      throw new Error('Valid email is required');
    }

    if (!request.reference) {
      throw new Error('Payment reference is required');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private getFlutterwavePaymentOptions(paymentMethod: PaymentMethod): string {
    switch (paymentMethod.type) {
      case 'card':
        return 'card';
      case 'mobile_money':
        return 'mobilemoney';
      case 'bank_transfer':
        return 'banktransfer';
      case 'ussd':
        return 'ussd';
      default:
        return 'card';
    }
  }

  /**
   * Set primary gateway preference
   */
  setPrimaryGateway(gateway: 'paystack' | 'flutterwave'): void {
    this.primaryGateway = gateway;
  }

  /**
   * Test payment gateway connection
   */
  async testGatewayConnection(gateway: 'paystack' | 'flutterwave'): Promise<boolean> {
    try {
      let url = '';
      let headers: Record<string, string> = {};

      if (gateway === 'paystack') {
        url = `${this.PAYSTACK_BASE_URL}/bank`;
        headers['Authorization'] = `Bearer ${this.PAYSTACK_PUBLIC_KEY}`;
      } else {
        url = `${this.FLUTTERWAVE_BASE_URL}/banks/NG`;
        headers['Authorization'] = `Bearer ${this.FLUTTERWAVE_PUBLIC_KEY}`;
      }

      const response = await fetch(url, { headers });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default new PaymentGatewayService();