// Payment & Revenue Sharing Types for Georgy Marketplace

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'paid' 
  | 'failed' 
  | 'cancelled' 
  | 'refunded' 
  | 'partially_refunded';

export type PaymentMethod = 
  | 'card' 
  | 'bank_transfer' 
  | 'mobile_money' 
  | 'cod' 
  | 'wallet' 
  | 'ussd';

export type PayoutStatus = 
  | 'scheduled' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export type TaxType = 
  | 'vat' 
  | 'service_tax' 
  | 'withholding_tax' 
  | 'stamp_duty' 
  | 'custom';

export type EscrowStatus = 
  | 'held' 
  | 'released' 
  | 'disputed' 
  | 'refunded';

export interface PaymentBreakdown {
  subtotal: number;
  taxes: TaxBreakdown[];
  fees: FeeBreakdown[];
  discount: number;
  total: number;
  platformCut: number;
  sellerNet: number;
}

export interface TaxBreakdown {
  type: TaxType;
  name: string;
  rate: number;
  amount: number;
  threshold?: number;
}

export interface FeeBreakdown {
  type: string;
  name: string;
  rate?: number;
  amount: number;
  fixed?: boolean;
}

export interface TaxRule {
  id: string;
  name: string;
  type: TaxType;
  rate: number; // Percentage or fixed amount
  threshold?: number; // Minimum amount for tax to apply
  appliesTo: string[]; // Product categories or user types
  country: string;
  validFrom: string;
  validTo?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface RevenueShareScheme {
  id: string;
  sellerId?: string; // null for default scheme
  tier: string; // 'default', 'premium', 'vip'
  rate: number; // Platform percentage (e.g., 5.0 for 5%)
  effectiveFrom: string;
  effectiveTo?: string;
  createdBy: string;
  metadata?: Record<string, any>;
}

export interface Payment {
  id: string;
  reference: string;
  userId: string;
  sellerId?: string;
  orderId?: string;
  serviceRequestId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  breakdown: PaymentBreakdown;
  escrow: {
    enabled: boolean;
    status?: EscrowStatus;
    releasedAt?: string;
    expectedReleaseDate?: string;
  };
  gateway: {
    provider: string;
    transactionId?: string;
    authorizationCode?: string;
    metadata?: Record<string, any>;
  };
  refunds: PaymentRefund[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRefund {
  id: string;
  amount: number;
  reason: string;
  status: 'pending' | 'completed' | 'failed';
  processedAt?: string;
  gatewayRefundId?: string;
}

export interface Payout {
  id: string;
  sellerId: string;
  batchId: string;
  totalAmount: number;
  currency: string;
  status: PayoutStatus;
  scheduledFor: string;
  processedAt?: string;
  settledAt?: string;
  items: PayoutItem[];
  gatewayTransferId?: string;
  metadata?: Record<string, any>;
}

export interface PayoutItem {
  id: string;
  paymentId: string;
  amount: number;
  fee: number;
  netAmount: number;
}

export interface Invoice {
  id: string;
  paymentId: string;
  number: string;
  type: 'invoice' | 'receipt' | 'credit_note';
  pdfUrl?: string;
  emailSent: boolean;
  issuedAt: string;
  dueDate?: string;
}

export interface PaymentConfig {
  taxRules: TaxRule[];
  revenueShares: RevenueShareScheme[];
  paymentMethods: PaymentMethodConfig[];
  fees: PlatformFeeConfig;
  limits: PaymentLimits;
  currencies: Currency[];
}

export interface PaymentMethodConfig {
  method: PaymentMethod;
  name: string;
  description: string;
  enabled: boolean;
  fees: {
    percentage?: number;
    fixed?: number;
    currency: string;
  };
  limits: {
    min: number;
    max: number;
    currency: string;
  };
  metadata?: Record<string, any>;
}

export interface PlatformFeeConfig {
  default: {
    percentage: number;
    fixed?: number;
  };
  tiers: {
    [tier: string]: {
      percentage: number;
      fixed?: number;
      minVolume?: number;
    };
  };
}

export interface PaymentLimits {
  daily: {
    individual: number;
    business: number;
  };
  monthly: {
    individual: number;
    business: number;
  };
  single: {
    min: number;
    max: number;
  };
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  enabled: boolean;
}

// Payment Initialization Types
export interface PaymentInitRequest {
  orderId?: string;
  serviceRequestId?: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  description?: string;
  escrow?: boolean;
  metadata?: Record<string, any>;
}

export interface PaymentInitResponse {
  success: boolean;
  payment?: {
    reference: string;
    amount: number;
    breakdown: PaymentBreakdown;
    redirectUrl?: string;
    instructions?: string;
    qrCode?: string;
  };
  error?: string;
}

// Financial Analytics Types
export interface FinancialReport {
  period: {
    start: string;
    end: string;
  };
  metrics: {
    totalRevenue: number;
    platformRevenue: number;
    sellerRevenue: number;
    taxesCollected: number;
    refundsIssued: number;
    escrowHeld: number;
    payoutsCompleted: number;
  };
  breakdown: {
    byCategory: Array<{
      category: string;
      revenue: number;
      count: number;
    }>;
    byPaymentMethod: Array<{
      method: PaymentMethod;
      revenue: number;
      count: number;
    }>;
    byTax: Array<{
      type: TaxType;
      collected: number;
      rate: number;
    }>;
  };
}

export interface SellerFinancials {
  sellerId: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalSales: number;
    platformFees: number;
    taxes: number;
    netEarnings: number;
    pendingPayouts: number;
    escrowHeld: number;
  };
  transactions: Payment[];
  payouts: Payout[];
}

// Webhook Types
export interface PaymentWebhookPayload {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    gatewayResponse: Record<string, any>;
  };
}

// Error Types
export interface PaymentError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Utility Types
export type PaymentCalculationInput = {
  amount: number;
  currency: string;
  sellerId?: string;
  category?: string;
  userType?: string;
  escrow?: boolean;
};

export type PaymentCalculationResult = {
  breakdown: PaymentBreakdown;
  authorizedAmount: number;
  errors?: PaymentError[];
};
