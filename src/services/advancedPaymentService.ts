import { isDevMode } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { 
  PaymentTransaction,
  PaymentGateway,
  RevenueShareConfig,
  Payout,
  Refund,
  Invoice,
  PaymentAnalytics,
  EscrowTransaction,
  Subscription,
  PaymentInitializationData,
  RefundRequestData,
  PayoutRequestData,
  PaymentWebhook,
  PaymentMethod,
  Currency,
  PaymentStatus,
  RevenueSplitDetails,
  RefundRequest
} from '@/features/payment/types';

export class AdvancedPaymentService {
  // Payment Gateway Management
  static async getPaymentGateways(isActive = true): Promise<PaymentGateway[]> {
    let query = supabase.from('payment_gateways').select('*');
    
    if (isActive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.order('is_default', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getDefaultPaymentGateway(): Promise<PaymentGateway | null> {
    const { data, error } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('is_active', true)
      .eq('is_default', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  // Payment Processing
  static async initializePayment(data: PaymentInitializationData): Promise<PaymentTransaction> {
    // Generate reference number
    const referenceNumber = this.generateReference();
    
    // Get default gateway or specific gateway for payment method
    const gateway = await this.getGatewayForPaymentMethod(data.paymentMethod);
    if (!gateway) {
      throw new Error(`No active gateway found for payment method: ${data.paymentMethod}`);
    }

    // Calculate fees and revenue split
    const fees = await this.calculateFees(data.amount, data.paymentMethod, gateway);
    const revenueSplit = await this.calculateRevenueSplit(data.amount, data.customerId, data.orderId);

    // Create payment transaction record
    const { data: transaction, error } = await supabase
      .from('payment_transactions')
      .insert([
        {
          order_id: data.orderId,
          reference_number: referenceNumber,
          type: 'payment',
          status: 'pending',
          amount: data.amount,
          currency: data.currency,
          amount_in_base_currency: await this.convertToBaseCurrency(data.amount, data.currency),
          payment_method: data.paymentMethod,
          provider: gateway.provider,
          provider_fee: fees.providerFee,
          platform_fee: fees.platformFee,
          processing_fee: fees.processingFee,
          payer_id: data.customerId,
          revenue_split: revenueSplit,
          description: `Payment for order ${data.orderId || 'N/A'}`,
          metadata: data.metadata || {},
          callback_url: data.callbackUrl,
          expires_at: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes
          initiated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Initialize payment with provider
    try {
      const providerResponse = await this.initializeWithProvider(transaction, gateway, data);
      
      // Update transaction with provider details
      await supabase
        .from('payment_transactions')
        .update({
          external_reference: providerResponse.reference,
          provider_transaction_id: providerResponse.transactionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      return { ...transaction, ...providerResponse };
    } catch (error) {
      // Mark transaction as failed
      await supabase
        .from('payment_transactions')
        .update({
          status: 'failed',
          failure_reason: error.message,
          failed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      throw error;
    }
  }

  static async verifyPayment(referenceNumber: string): Promise<PaymentTransaction> {
    // Get transaction
    const { data: transaction, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('reference_number', referenceNumber)
      .single();

    if (error) throw error;

    // Get gateway
    const gateway = await this.getGatewayByProvider(transaction.provider);
    if (!gateway) {
      throw new Error(`Gateway not found for provider: ${transaction.provider}`);
    }

    // Verify with provider
    const verification = await this.verifyWithProvider(transaction, gateway);

    // Update transaction status
    const updateData: any = {
      status: verification.status,
      updated_at: new Date().toISOString(),
    };

    if (verification.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      
      // Process revenue split if payment is successful
      await this.processRevenueSplit(transaction);
    } else if (verification.status === 'failed') {
      updateData.failed_at = new Date().toISOString();
      updateData.failure_reason = verification.failureReason;
    }

    const { data: updatedTransaction, error: updateError } = await supabase
      .from('payment_transactions')
      .update(updateData)
      .eq('id', transaction.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return updatedTransaction;
  }

  // Revenue Sharing
  static async getRevenueShareConfig(configId?: string): Promise<RevenueShareConfig | null> {
    let query = supabase.from('revenue_share_configs').select('*');
    
    if (configId) {
      query = query.eq('id', configId);
    } else {
      query = query.eq('is_default', true).eq('is_active', true);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  static async calculateRevenueSplit(
    amount: number, 
    customerId?: string, 
    orderId?: string,
    configId?: string
  ): Promise<RevenueSplitDetails> {
    const config = await this.getRevenueShareConfig(configId);
    if (!config) {
      throw new Error('No revenue share configuration found');
    }

    // Get order details if orderId provided
    let order = null;
    if (orderId) {
      const { data } = await supabase
        .from('orders')
        .select('*, seller:sellers(*)')
        .eq('id', orderId)
        .single();
      order = data;
    }

    // Calculate platform commission
    let platformCommission = (amount * config.platformCommissionPercentage) / 100;
    platformCommission += config.platformCommissionFixed;

    // Apply category-specific rates if order exists
    if (order && order.items) {
      // This would need more complex logic based on product categories
    }

    // Apply user type rates
    if (order?.seller) {
      const userTypeRate = config.userTypeRates.find(rate => 
        rate.userType === order.seller.userType
      );
      if (userTypeRate) {
        platformCommission = Math.max(
          (amount * userTypeRate.commissionPercentage) / 100 + userTypeRate.commissionFixed,
          userTypeRate.minimumCommission
        );
      }
    }

    // Ensure minimum commission
    platformCommission = Math.max(platformCommission, config.minimumCommission);

    const sellerPayout = amount - platformCommission;

    return {
      platformCommission: {
        name: 'Platform Commission',
        amount: platformCommission,
        percentage: (platformCommission / amount) * 100,
        recipientType: 'platform',
      },
      sellerPayout: {
        name: 'Seller Payout',
        amount: sellerPayout,
        percentage: (sellerPayout / amount) * 100,
        recipientId: order?.seller?.id,
        recipientType: 'seller',
      },
      additionalFees: [],
    };
  }

  static async processRevenueSplit(transaction: PaymentTransaction): Promise<void> {
    const revenueSplit = transaction.revenue_split;
    
    // Create platform revenue record
    await supabase.from('platform_revenue').insert([
      {
        transaction_id: transaction.id,
        amount: revenueSplit.platformCommission.amount,
        currency: transaction.currency,
        type: 'commission',
        source: 'transaction',
        created_at: new Date().toISOString(),
      },
    ]);

    // Create seller payout record (if seller exists)
    if (revenueSplit.sellerPayout.recipientId) {
      await supabase.from('seller_balances').upsert([
        {
          seller_id: revenueSplit.sellerPayout.recipientId,
          available_balance: revenueSplit.sellerPayout.amount,
          currency: transaction.currency,
          updated_at: new Date().toISOString(),
        },
      ], {
        onConflict: 'seller_id,currency',
        ignoreDuplicates: false,
      });

      // Create payout record
      await supabase.from('pending_payouts').insert([
        {
          seller_id: revenueSplit.sellerPayout.recipientId,
          transaction_id: transaction.id,
          amount: revenueSplit.sellerPayout.amount,
          currency: transaction.currency,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ]);
    }
  }

  // Payout Management
  static async createPayout(data: PayoutRequestData): Promise<Payout> {
    // Get seller balance
    const { data: balance } = await supabase
      .from('seller_balances')
      .select('*')
      .eq('seller_id', data.sellerId)
      .single();

    if (!balance || balance.available_balance < (data.amount || 0)) {
      throw new Error('Insufficient balance for payout');
    }

    const payoutAmount = data.amount || balance.available_balance;
    const fees = await this.calculatePayoutFees(payoutAmount, data.account.type);
    const netAmount = payoutAmount - fees;

    // Generate reference
    const referenceNumber = this.generatePayoutReference();

    const { data: payout, error } = await supabase
      .from('payouts')
      .insert([
        {
          seller_id: data.sellerId,
          amount: payoutAmount,
          currency: balance.currency,
          fees: fees,
          net_amount: netAmount,
          status: 'pending',
          method: data.account.type,
          account: data.account,
          reference_number: referenceNumber,
          notes: data.notes,
          retry_count: 0,
          max_retries: 3,
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Process payout with provider
    try {
      await this.processPayoutWithProvider(payout);
    } catch (error) {
      // Mark payout as failed
      await supabase
        .from('payouts')
        .update({
          status: 'failed',
          failure_reason: error.message,
          failed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', payout.id);

      throw error;
    }

    return payout;
  }

  static async getSellerBalance(sellerId: string, currency = 'NGN'): Promise<number> {
    const { data, error } = await supabase
      .from('seller_balances')
      .select('available_balance')
      .eq('seller_id', sellerId)
      .eq('currency', currency)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return 0;
      throw error;
    }

    return data.available_balance || 0;
  }

  // Refund Management
  static async requestRefund(data: RefundRequestData): Promise<Refund> {
    // Get original transaction
    const { data: transaction, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('id', data.transactionId)
      .single();

    if (error) throw error;

    if (transaction.status !== 'completed') {
      throw new Error('Can only refund completed transactions');
    }

    const refundAmount = data.amount || transaction.amount;
    
    if (refundAmount > transaction.amount) {
      throw new Error('Refund amount cannot exceed original transaction amount');
    }

    // Generate reference
    const referenceNumber = this.generateRefundReference();

    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .insert([
        {
          transaction_id: data.transactionId,
          order_id: transaction.order_id,
          amount: refundAmount,
          currency: transaction.currency,
          reason: data.reason,
          reason_description: data.reasonDescription,
          status: 'pending',
          method: data.method || 'original_payment',
          provider: transaction.provider,
          reference_number: referenceNumber,
          requested_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (refundError) throw refundError;

    // Process refund with provider
    try {
      await this.processRefundWithProvider(refund, transaction);
    } catch (error) {
      // Mark refund as failed
      await supabase
        .from('refunds')
        .update({
          status: 'failed',
          failure_reason: error.message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', refund.id);

      throw error;
    }

    return refund;
  }

  // Analytics
  static async getPaymentAnalytics(
    startDate: string,
    endDate: string,
    sellerId?: string
  ): Promise<PaymentAnalytics> {
    let query = supabase
      .from('payment_transactions')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (sellerId) {
      // Filter by seller through orders
      query = query.eq('payee_id', sellerId);
    }

    const { data: transactions, error } = await query;
    if (error) throw error;

    // Calculate metrics
    const totalTransactions = transactions?.length || 0;
    const successfulTransactions = transactions?.filter(t => t.status === 'completed').length || 0;
    const failedTransactions = transactions?.filter(t => t.status === 'failed').length || 0;
    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;

    const totalRevenue = transactions?.reduce((sum, t) => 
      t.status === 'completed' ? sum + t.amount : sum, 0) || 0;
    
    const platformRevenue = transactions?.reduce((sum, t) => 
      t.status === 'completed' ? sum + (t.revenue_split?.platformCommission?.amount || 0) : sum, 0) || 0;
    
    const sellerRevenue = totalRevenue - platformRevenue;
    const averageTransactionValue = successfulTransactions > 0 ? totalRevenue / successfulTransactions : 0;

    // Payment method breakdown
    const paymentMethodBreakdown = transactions?.reduce((acc, t) => {
      if (t.status === 'completed') {
        if (!acc[t.payment_method]) {
          acc[t.payment_method] = {
            transactions: 0,
            revenue: 0,
            averageValue: 0,
            successRate: 0,
            fees: 0,
          };
        }
        acc[t.payment_method].transactions += 1;
        acc[t.payment_method].revenue += t.amount;
        acc[t.payment_method].fees += t.provider_fee + t.platform_fee + t.processing_fee;
      }
      return acc;
    }, {} as Record<string, any>) || {};

    // Calculate averages and success rates for payment methods
    Object.keys(paymentMethodBreakdown).forEach(method => {
      const methodData = paymentMethodBreakdown[method];
      methodData.averageValue = methodData.transactions > 0 ? methodData.revenue / methodData.transactions : 0;
      
      const methodTransactions = transactions?.filter(t => t.payment_method === method) || [];
      const methodSuccessful = methodTransactions.filter(t => t.status === 'completed').length;
      methodData.successRate = methodTransactions.length > 0 ? (methodSuccessful / methodTransactions.length) * 100 : 0;
    });

    return {
      period: 'custom',
      startDate,
      endDate,
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      successRate,
      totalRevenue,
      platformRevenue,
      sellerRevenue,
      averageTransactionValue,
      paymentMethodBreakdown,
      revenueByCountry: [], // Would need additional data
      revenueByState: [], // Would need additional data
      dailyRevenue: [], // Would need grouping by date
      hourlyDistribution: [], // Would need grouping by hour
      topSellers: [], // Would need seller data
      topCustomers: [], // Would need customer data
      totalFees: platformRevenue,
      processingFees: transactions?.reduce((sum, t) => sum + (t.processing_fee || 0), 0) || 0,
      platformFees: transactions?.reduce((sum, t) => sum + (t.platform_fee || 0), 0) || 0,
      netRevenue: totalRevenue - platformRevenue,
      totalRefunds: 0, // Would need refund data
      refundRate: 0,
      disputeCount: 0,
      disputeRate: 0,
    };
  }

  // Utility Methods
  static generateReference(): string {
    const prefix = 'PAY';
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  static generatePayoutReference(): string {
    const prefix = 'PO';
    const timestamp = Date.now().toString().slice(-10);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  static generateRefundReference(): string {
    const prefix = 'REF';
    const timestamp = Date.now().toString().slice(-10);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  static async convertToBaseCurrency(amount: number, fromCurrency: Currency): Promise<number> {
    // In a real implementation, this would use an exchange rate service
    const rates = { NGN: 1, USD: 1600, EUR: 1750, GBP: 2000, CAD: 1200, AUD: 1100 };
    return amount * (rates[fromCurrency] || 1);
  }

  static async calculateFees(amount: number, paymentMethod: PaymentMethod, gateway: PaymentGateway) {
    const fees = gateway.fees;
    let providerFee = 0;
    let platformFee = 0;
    let processingFee = 0;

    switch (paymentMethod) {
      case 'card':
        providerFee = (amount * fees.cardFeePercentage) / 100 + fees.cardFeeFixed;
        break;
      case 'bank_transfer':
        providerFee = (amount * fees.bankTransferFeePercentage) / 100 + fees.bankTransferFeeFixed;
        break;
      case 'mobile_money':
        providerFee = (amount * fees.mobileFeePercentage) / 100 + fees.mobileFeeFixed;
        break;
      default:
        providerFee = fees.cardFeeFixed; // Default fee
    }

    // Platform fee (can be configured)
    platformFee = amount * 0.01; // 1% platform fee

    return { providerFee, platformFee, processingFee };
  }

  static async calculatePayoutFees(amount: number, method: string): Promise<number> {
    // Different fees for different payout methods
    const feeRates = {
      bank_transfer: 100, // Fixed fee in kobo
      mobile_money: 50,
      paypal: amount * 0.02, // 2% for PayPal
      crypto_wallet: 0, // No fee for crypto
    };

    return feeRates[method] || 100;
  }

  // Provider Integration Methods (these would integrate with actual payment providers)
  private static async getGatewayForPaymentMethod(paymentMethod: PaymentMethod): Promise<PaymentGateway | null> {
    const { data, error } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('is_active', true)
      .contains('supported_methods', [paymentMethod])
      .order('is_default', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  private static async getGatewayByProvider(provider: string): Promise<PaymentGateway | null> {
    const { data, error } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('provider', provider)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  private static async initializeWithProvider(
    transaction: PaymentTransaction, 
    gateway: PaymentGateway, 
    data: PaymentInitializationData
  ): Promise<any> {
    // This would integrate with actual payment providers like Paystack, Flutterwave, etc.
    // For now, return mock response
    return {
      reference: `${gateway.provider}_${transaction.reference_number}`,
      transactionId: `${gateway.provider}_${Date.now()}`,
      authorizationUrl: `https://${gateway.provider}.com/pay/${transaction.reference_number}`,
      accessCode: `access_${transaction.reference_number}`,
    };
  }

  private static async verifyWithProvider(transaction: PaymentTransaction, gateway: PaymentGateway): Promise<any> {
    // This would integrate with actual payment providers
    // For now, return mock verification
    return {
      status: Math.random() > 0.1 ? 'completed' : 'failed',
      failureReason: Math.random() > 0.1 ? null : 'Insufficient funds',
    };
  }

  private static async processPayoutWithProvider(payout: Payout): Promise<void> {
    // This would integrate with actual payout providers
    // For now, simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update payout status
    await supabase
      .from('payouts')
      .update({
        status: 'completed',
        external_reference: `payout_${payout.reference_number}`,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', payout.id);
  }

  private static async processRefundWithProvider(refund: Refund, originalTransaction: PaymentTransaction): Promise<void> {
    // This would integrate with actual payment providers for refunds
    // For now, simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update refund status
    await supabase
      .from('refunds')
      .update({
        status: 'completed',
        external_reference: `refund_${refund.reference_number}`,
        processed_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', refund.id);
  }

  // Invoice Management
  async generateInvoice(orderId: string): Promise<Invoice> {
    // Implementation would generate invoice from order
    return Promise.resolve({
      id: 'inv_' + Date.now(),
      invoiceNumber: 'INV-' + Date.now(),
      orderId,
      customerId: 'cust_123',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerAddress: '123 Main St, Lagos, Nigeria',
      items: [
        {
          id: 'item_1',
          description: 'Sample Product',
          quantity: 2,
          unitPrice: 25.99,
          total: 51.98
        }
      ],
      subtotal: 51.98,
      tax: 3.90,
      shipping: 5.00,
      total: 60.88,
      status: 'draft',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async downloadInvoicePDF(invoiceId: string): Promise<Blob> {
    // Implementation would generate and return PDF blob
    return Promise.resolve(new Blob(['PDF content'], { type: 'application/pdf' }));
  }

  async sendInvoiceEmail(invoiceId: string): Promise<void> {
    // Implementation would send invoice via email
    return Promise.resolve();
  }

  // Refund Management
  async getRefunds(): Promise<Refund[]> {
    // Implementation would fetch refunds from API
    return Promise.resolve([
      {
        id: 'ref_1',
        orderId: 'ORDER_123',
        customerId: 'cust_123',
        customerName: 'John Doe',
        amount: 29.99,
        reason: 'defective_product',
        description: 'Product was damaged on arrival',
        refundMethod: 'original_payment',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  }

  async processRefund(request: RefundRequest): Promise<Refund> {
    // Implementation would process refund request
    return Promise.resolve({
      id: 'ref_' + Date.now(),
      orderId: request.orderId,
      customerId: 'cust_123',
      customerName: 'John Doe',
      amount: request.amount,
      reason: request.reason,
      description: request.description,
      refundMethod: request.refundMethod,
      status: 'processing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async updateRefundStatus(refundId: string, status: string): Promise<void> {
    // Implementation would update refund status
    return Promise.resolve();
  }

  async exportRefunds(): Promise<string> {
    // Implementation would export refunds as CSV
    return Promise.resolve('Order ID,Amount,Reason,Status,Date\nORDER_123,29.99,defective_product,pending,2024-01-15');
  }

  async getRevenueShareConfig(): Promise<any> {
    // Implementation would fetch revenue share configuration
    return Promise.resolve({
      defaultPlatformFee: 5,
      defaultSellerShare: 95,
      rules: [],
      payoutSchedule: 'weekly',
      minimumPayout: 10,
      autoPayoutEnabled: true,
      taxHandling: 'platform'
    });
  }

  async updateRevenueShareConfig(config: any): Promise<void> {
    // Implementation would update revenue share configuration
    return Promise.resolve();
  }
}

export const advancedPaymentService = new AdvancedPaymentService();
