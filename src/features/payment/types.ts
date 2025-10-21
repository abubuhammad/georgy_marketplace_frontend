// Payment & Revenue System Types

export type PaymentMethod = 'card' | 'bank_transfer' | 'mobile_money' | 'paystack' | 'flutterwave' | 'bank_ussd' | 'crypto' | 'cash_on_delivery';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded' | 'expired';
export type PaymentProvider = 'paystack' | 'flutterwave' | 'stripe' | 'razorpay' | 'internal';
export type TransactionType = 'payment' | 'refund' | 'payout' | 'fee' | 'commission' | 'transfer' | 'escrow_release' | 'escrow_hold';
export type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'on_hold';
export type RefundReason = 'customer_request' | 'order_cancelled' | 'product_unavailable' | 'delivery_failed' | 'quality_issue' | 'admin_action';

// Core Payment Types
export interface PaymentTransaction {
  id: string;
  orderId?: string;
  order?: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    customerId: string;
    sellerId: string;
  };
  referenceNumber: string;
  externalReference?: string;
  type: TransactionType;
  status: PaymentStatus;
  
  // Amount Information
  amount: number;
  currency: Currency;
  exchangeRate?: number;
  amountInBaseCurrency: number;
  
  // Payment Details
  paymentMethod: PaymentMethod;
  provider: PaymentProvider;
  providerTransactionId?: string;
  providerFee: number;
  platformFee: number;
  processingFee: number;
  
  // Parties
  payerId?: string;
  payer?: PaymentUser;
  payeeId?: string;
  payee?: PaymentUser;
  
  // Revenue Split
  revenueSplit: RevenueSplitDetails;
  
  // Metadata
  description: string;
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  
  // Timing
  initiatedAt: string;
  completedAt?: string;
  failedAt?: string;
  expiresAt?: string;
  
  // Callbacks & Webhooks
  callbackUrl?: string;
  webhookUrl?: string;
  webhookStatus?: 'pending' | 'sent' | 'delivered' | 'failed';
  
  // Failure Information
  failureReason?: string;
  failureCode?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface PaymentUser {
  id: string;
  type: 'customer' | 'seller' | 'admin' | 'delivery' | 'platform';
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface RevenueSplitDetails {
  platformCommission: RevenueSplitItem;
  sellerPayout: RevenueSplitItem;
  deliveryFee?: RevenueSplitItem;
  taxes?: RevenueSplitItem;
  additionalFees: RevenueSplitItem[];
}

export interface RevenueSplitItem {
  name: string;
  amount: number;
  percentage?: number;
  recipientId?: string;
  recipientType: 'platform' | 'seller' | 'delivery_partner' | 'tax_authority' | 'payment_processor';
  accountDetails?: PayoutAccount;
}

// Payment Gateway Integration
export interface PaymentGateway {
  id: string;
  name: string;
  provider: PaymentProvider;
  isActive: boolean;
  isDefault: boolean;
  supportedMethods: PaymentMethod[];
  supportedCurrencies: Currency[];
  configuration: PaymentGatewayConfig;
  fees: PaymentGatewayFees;
  limits: PaymentLimits;
  webhookUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentGatewayConfig {
  publicKey: string;
  secretKey: string;
  merchantId?: string;
  environment: 'sandbox' | 'production';
  apiVersion?: string;
  webhookSecret?: string;
  additionalSettings: Record<string, any>;
}

export interface PaymentGatewayFees {
  cardFeePercentage: number;
  cardFeeFixed: number;
  bankTransferFeePercentage: number;
  bankTransferFeeFixed: number;
  mobileFeePercentage: number;
  mobileFeeFixed: number;
  currency: Currency;
}

export interface PaymentLimits {
  minAmount: number;
  maxAmount: number;
  dailyLimit: number;
  monthlyLimit: number;
  currency: Currency;
}

// Revenue Sharing Configuration
export interface RevenueShareConfig {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isDefault: boolean;
  
  // Commission Structure
  platformCommissionPercentage: number;
  platformCommissionFixed: number;
  
  // Category-specific rates
  categoryRates: CategoryRevenueRate[];
  
  // User type rates
  userTypeRates: UserTypeRevenueRate[];
  
  // Delivery fee handling
  deliveryFeeHandling: 'platform_keeps' | 'partner_keeps' | 'split';
  deliveryFeeSplitPercentage?: number;
  
  // Tax handling
  taxHandling: 'platform_handles' | 'seller_handles' | 'split';
  taxPercentage?: number;
  
  // Minimum thresholds
  minimumPayout: number;
  minimumCommission: number;
  
  // Payout schedule
  payoutSchedule: 'instant' | 'daily' | 'weekly' | 'monthly';
  payoutDay?: number; // Day of week (1-7) or month (1-31)
  
  // Hold periods
  holdPeriodDays: number;
  disputeHoldDays: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRevenueRate {
  categoryId: string;
  categoryName: string;
  commissionPercentage: number;
  commissionFixed: number;
}

export interface UserTypeRevenueRate {
  userType: 'individual' | 'business' | 'premium' | 'verified';
  commissionPercentage: number;
  commissionFixed: number;
  minimumCommission: number;
  maximumCommission?: number;
}

// Payout Management
export interface Payout {
  id: string;
  payoutBatchId?: string;
  sellerId: string;
  seller?: {
    id: string;
    firstName: string;
    lastName: string;
    businessName?: string;
    email: string;
    phone: string;
  };
  
  // Amount Details
  amount: number;
  currency: Currency;
  fees: number;
  netAmount: number;
  
  // Source Transactions
  transactions: string[]; // Transaction IDs included in this payout
  sourceOrderIds: string[];
  
  // Payout Details
  status: PayoutStatus;
  method: 'bank_transfer' | 'mobile_money' | 'paypal' | 'crypto';
  account: PayoutAccount;
  
  // Reference Information
  referenceNumber: string;
  externalReference?: string;
  providerPayoutId?: string;
  
  // Timing
  scheduledAt?: string;
  initiatedAt?: string;
  completedAt?: string;
  failedAt?: string;
  
  // Failure Information
  failureReason?: string;
  failureCode?: string;
  retryCount: number;
  maxRetries: number;
  
  // Metadata
  notes?: string;
  metadata: Record<string, any>;
  
  createdAt: string;
  updatedAt: string;
}

export interface PayoutAccount {
  type: 'bank' | 'mobile_money' | 'paypal' | 'crypto_wallet';
  
  // Bank Account Details
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
  routingNumber?: string;
  swiftCode?: string;
  
  // Mobile Money Details
  provider?: string; // MTN, Airtel, etc.
  phoneNumber?: string;
  
  // PayPal Details
  paypalEmail?: string;
  
  // Crypto Details
  walletAddress?: string;
  cryptocurrency?: string;
  network?: string;
  
  // Verification
  isVerified: boolean;
  verifiedAt?: string;
  verificationDocuments?: string[];
}

// Refund Management
export interface Refund {
  id: string;
  transactionId: string;
  transaction?: PaymentTransaction;
  orderId?: string;
  
  // Refund Details
  amount: number;
  currency: Currency;
  reason: RefundReason;
  reasonDescription?: string;
  
  // Processing
  status: PaymentStatus;
  method: 'original_payment' | 'bank_transfer' | 'store_credit';
  provider: PaymentProvider;
  providerRefundId?: string;
  
  // Timing
  requestedAt: string;
  approvedAt?: string;
  processedAt?: string;
  completedAt?: string;
  
  // Parties
  requestedBy: string; // User ID
  approvedBy?: string; // Admin user ID
  
  // Reference
  referenceNumber: string;
  externalReference?: string;
  
  // Failure Information
  failureReason?: string;
  failureCode?: string;
  
  // Metadata
  notes?: string;
  metadata: Record<string, any>;
  
  createdAt: string;
  updatedAt: string;
}

// Invoice System
export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId?: string;
  order?: {
    id: string;
    orderNumber: string;
    items: any[];
  };
  
  // Invoice Details
  type: 'sale' | 'service' | 'subscription' | 'custom';
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  
  // Parties
  sellerId: string;
  seller?: PaymentUser;
  customerId: string;
  customer?: PaymentUser;
  
  // Financial Details
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  paidAmount: number;
  currency: Currency;
  
  // Line Items
  items: InvoiceItem[];
  
  // Payment Terms
  paymentTerms: string;
  dueDate: string;
  lateFeePercentage?: number;
  
  // Invoice Content
  description?: string;
  notes?: string;
  terms?: string;
  footerText?: string;
  
  // File References
  pdfUrl?: string;
  attachments?: string[];
  
  // Tracking
  sentAt?: string;
  viewedAt?: string;
  paidAt?: string;
  
  // Reminders
  remindersSent: number;
  lastReminderAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
  totalPrice: number;
  productId?: string;
  serviceId?: string;
}

// Financial Analytics
export interface PaymentAnalytics {
  period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate: string;
  endDate: string;
  
  // Transaction Metrics
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  successRate: number;
  
  // Revenue Metrics
  totalRevenue: number;
  platformRevenue: number;
  sellerRevenue: number;
  averageTransactionValue: number;
  
  // Payment Methods
  paymentMethodBreakdown: Record<PaymentMethod, PaymentMethodMetrics>;
  
  // Geographic Distribution
  revenueByCountry: Array<{ country: string; revenue: number; transactions: number }>;
  revenueByState: Array<{ state: string; revenue: number; transactions: number }>;
  
  // Time Series Data
  dailyRevenue: Array<{ date: string; revenue: number; transactions: number }>;
  hourlyDistribution: Array<{ hour: number; revenue: number; transactions: number }>;
  
  // Top Performers
  topSellers: Array<{ sellerId: string; revenue: number; transactions: number }>;
  topCustomers: Array<{ customerId: string; spent: number; transactions: number }>;
  
  // Fees and Costs
  totalFees: number;
  processingFees: number;
  platformFees: number;
  netRevenue: number;
  
  // Refunds and Disputes
  totalRefunds: number;
  refundRate: number;
  disputeCount: number;
  disputeRate: number;
}

export interface PaymentMethodMetrics {
  transactions: number;
  revenue: number;
  averageValue: number;
  successRate: number;
  fees: number;
}

// Escrow System
export interface EscrowTransaction {
  id: string;
  orderId: string;
  transactionId: string;
  
  // Escrow Details
  amount: number;
  currency: Currency;
  status: 'held' | 'released' | 'refunded' | 'disputed';
  
  // Parties
  buyerId: string;
  sellerId: string;
  
  // Conditions
  releaseConditions: EscrowCondition[];
  holdUntil: string;
  autoReleaseAfter?: string;
  
  // Actions
  releaseRequestedBy?: string;
  releaseRequestedAt?: string;
  releasedAt?: string;
  refundedAt?: string;
  
  // Dispute
  disputeId?: string;
  disputeReason?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface EscrowCondition {
  type: 'delivery_confirmed' | 'time_elapsed' | 'admin_approval' | 'milestone_completed';
  description: string;
  isMet: boolean;
  metAt?: string;
  evidence?: string[];
}

// Subscription & Recurring Payments
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  type: 'seller' | 'premium_listing' | 'advertising' | 'feature_access';
  
  // Pricing
  price: number;
  currency: Currency;
  billingCycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  setupFee?: number;
  
  // Features
  features: string[];
  limits: Record<string, number>;
  
  // Trial
  trialPeriodDays?: number;
  
  // Status
  isActive: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  planId: string;
  plan?: SubscriptionPlan;
  userId: string;
  user?: PaymentUser;
  
  // Subscription Details
  status: 'active' | 'cancelled' | 'expired' | 'suspended' | 'trial';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate?: string;
  
  // Pricing
  amount: number;
  currency: Currency;
  
  // Trial
  trialStart?: string;
  trialEnd?: string;
  
  // Cancellation
  cancelledAt?: string;
  cancellationReason?: string;
  
  // Payment
  paymentMethodId?: string;
  lastPaymentAt?: string;
  nextPaymentAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Form Data Types
export interface PaymentInitializationData {
  amount: number;
  currency: Currency;
  email: string;
  orderId?: string;
  customerId?: string;
  paymentMethod: PaymentMethod;
  callbackUrl?: string;
  metadata?: Record<string, any>;
  splitConfig?: RevenueSplitDetails;
}

export interface RefundRequestData {
  transactionId: string;
  amount?: number; // If not provided, full refund
  reason: RefundReason;
  reasonDescription?: string;
  method?: 'original_payment' | 'bank_transfer' | 'store_credit';
}

export interface PayoutRequestData {
  sellerId: string;
  amount?: number; // If not provided, all available balance
  account: PayoutAccount;
  notes?: string;
}

// Webhook Types
export interface PaymentWebhook {
  event: 'payment.success' | 'payment.failed' | 'refund.processed' | 'payout.completed' | 'dispute.created';
  data: PaymentTransaction | Refund | Payout;
  signature: string;
  timestamp: string;
  provider: PaymentProvider;
}

// Invoice Types
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

// Refund Types
export type RefundReason = 
  | 'defective_product'
  | 'wrong_item'
  | 'not_as_described'
  | 'damaged_shipping'
  | 'customer_request'
  | 'duplicate_order'
  | 'fraud'
  | 'other';

export interface RefundRequest {
  orderId: string;
  amount: number;
  reason: RefundReason;
  description: string;
  refundMethod: string;
}

export interface Refund {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  amount: number;
  reason: RefundReason;
  description: string;
  refundMethod: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  failureReason?: string;
}
