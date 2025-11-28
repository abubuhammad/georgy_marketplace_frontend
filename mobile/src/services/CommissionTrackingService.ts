export interface CommissionRate {
  id: string;
  userId: string;
  userType: 'artisan' | 'seller';
  tier: 'standard' | 'premium' | 'enterprise';
  rate: number; // Percentage (e.g., 10 for 10%)
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionTransaction {
  id: string;
  transactionId: string; // Reference to payment transaction
  jobId?: string;
  orderId?: string;
  artisanId?: string;
  sellerId?: string;
  customerId: string;
  transactionType: 'service_payment' | 'product_sale' | 'milestone_payment' | 'escrow_release';
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  currency: string;
  status: 'pending' | 'calculated' | 'deducted' | 'paid_out' | 'disputed' | 'refunded';
  calculatedAt: string;
  deductedAt?: string;
  paidOutAt?: string;
  metadata: {
    paymentMethod?: string;
    escrowId?: string;
    milestoneId?: string;
    subscriptionTier?: string;
    promotionalRate?: number;
    notes?: string;
  };
  auditTrail: CommissionAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CommissionAuditEntry {
  id: string;
  action: 'calculated' | 'deducted' | 'adjusted' | 'refunded' | 'disputed' | 'resolved';
  performedBy: string;
  performedAt: string;
  previousState?: any;
  newState: any;
  reason?: string;
  automatedAction: boolean;
}

export interface CommissionSummary {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  userId: string;
  userType: 'artisan' | 'seller';
  totalTransactions: number;
  totalGrossAmount: number;
  totalCommissionAmount: number;
  totalNetAmount: number;
  averageCommissionRate: number;
  currency: string;
  breakdown: {
    servicePayments?: CommissionBreakdown;
    productSales?: CommissionBreakdown;
    milestonePayments?: CommissionBreakdown;
  };
  trends: {
    transactionGrowth: number;
    commissionGrowth: number;
    averageTransactionSize: number;
  };
}

export interface CommissionBreakdown {
  count: number;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  averageRate: number;
}

export interface CommissionDispute {
  id: string;
  commissionTransactionId: string;
  disputedBy: string;
  disputeType: 'rate_error' | 'calculation_error' | 'unauthorized_deduction' | 'refund_request';
  reason: string;
  requestedAdjustment: number;
  status: 'open' | 'under_review' | 'resolved' | 'rejected';
  evidence: string[];
  resolution?: {
    adjustmentAmount: number;
    resolvedBy: string;
    resolvedAt: string;
    resolutionNotes: string;
  };
  createdAt: string;
  updatedAt: string;
}

export class CommissionTrackingService {
  private defaultCommissionRates = {
    standard: 10, // 10% for standard artisans
    premium: 8,   // 8% for premium tier
    enterprise: 6 // 6% for enterprise tier
  };

  // Calculate commission for a transaction
  async calculateCommission(transaction: {
    transactionId: string;
    userId: string;
    userType: 'artisan' | 'seller';
    transactionType: CommissionTransaction['transactionType'];
    grossAmount: number;
    currency: string;
    jobId?: string;
    orderId?: string;
    customerId: string;
    metadata?: any;
  }): Promise<{ success: boolean; commission?: CommissionTransaction; error?: string }> {
    try {
      // Get user's current commission rate
      const commissionRate = await this.getUserCommissionRate(transaction.userId, transaction.userType);
      
      // Apply any promotional rates or adjustments
      const effectiveRate = await this.applyRateAdjustments(
        commissionRate.rate, 
        transaction.userId, 
        transaction.transactionType,
        transaction.metadata
      );

      // Calculate commission amounts
      const commissionAmount = Math.round((transaction.grossAmount * effectiveRate) / 100);
      const netAmount = transaction.grossAmount - commissionAmount;

      // Create commission transaction record
      const commissionTransaction: CommissionTransaction = {
        id: `comm_${transaction.transactionId}`,
        transactionId: transaction.transactionId,
        jobId: transaction.jobId,
        orderId: transaction.orderId,
        artisanId: transaction.userType === 'artisan' ? transaction.userId : undefined,
        sellerId: transaction.userType === 'seller' ? transaction.userId : undefined,
        customerId: transaction.customerId,
        transactionType: transaction.transactionType,
        grossAmount: transaction.grossAmount,
        commissionRate: effectiveRate,
        commissionAmount: commissionAmount,
        netAmount: netAmount,
        currency: transaction.currency,
        status: 'calculated',
        calculatedAt: new Date().toISOString(),
        metadata: {
          ...transaction.metadata,
          subscriptionTier: commissionRate.tier,
          promotionalRate: effectiveRate !== commissionRate.rate ? effectiveRate : undefined,
        },
        auditTrail: [{
          id: `audit_${Date.now()}`,
          action: 'calculated',
          performedBy: 'system',
          performedAt: new Date().toISOString(),
          newState: {
            grossAmount: transaction.grossAmount,
            commissionRate: effectiveRate,
            commissionAmount: commissionAmount,
            netAmount: netAmount,
          },
          automatedAction: true,
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save commission transaction
      await this.saveCommissionTransaction(commissionTransaction);

      return { success: true, commission: commissionTransaction };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate commission'
      };
    }
  }

  // Deduct commission from payment
  async deductCommission(
    commissionTransactionId: string,
    deductedBy: string = 'system'
  ): Promise<{ success: boolean; deductedAmount?: number; error?: string }> {
    try {
      const commission = await this.getCommissionTransaction(commissionTransactionId);
      if (!commission) {
        return { success: false, error: 'Commission transaction not found' };
      }

      if (commission.status !== 'calculated') {
        return { success: false, error: `Cannot deduct commission in status: ${commission.status}` };
      }

      // Process the deduction (integrate with payment gateway)
      const deductionResult = await this.processCommissionDeduction(commission);
      if (!deductionResult.success) {
        return { success: false, error: deductionResult.error };
      }

      // Update commission status
      commission.status = 'deducted';
      commission.deductedAt = new Date().toISOString();
      commission.updatedAt = new Date().toISOString();

      // Add audit entry
      commission.auditTrail.push({
        id: `audit_${Date.now()}`,
        action: 'deducted',
        performedBy: deductedBy,
        performedAt: new Date().toISOString(),
        previousState: { status: 'calculated' },
        newState: { status: 'deducted', deductedAt: commission.deductedAt },
        automatedAction: deductedBy === 'system',
      });

      await this.updateCommissionTransaction(commission);

      return { success: true, deductedAmount: commission.commissionAmount };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deduct commission'
      };
    }
  }

  // Pay out net amount to user
  async payoutNetAmount(
    commissionTransactionId: string,
    paymentDetails: {
      recipientId: string;
      paymentMethod: string;
      bankAccount?: string;
      mobileWallet?: string;
    }
  ): Promise<{ success: boolean; payoutId?: string; error?: string }> {
    try {
      const commission = await this.getCommissionTransaction(commissionTransactionId);
      if (!commission) {
        return { success: false, error: 'Commission transaction not found' };
      }

      if (commission.status !== 'deducted') {
        return { success: false, error: 'Commission must be deducted before payout' };
      }

      // Process payout through payment gateway
      const payoutResult = await this.processUserPayout(commission, paymentDetails);
      if (!payoutResult.success) {
        return { success: false, error: payoutResult.error };
      }

      // Update commission status
      commission.status = 'paid_out';
      commission.paidOutAt = new Date().toISOString();
      commission.updatedAt = new Date().toISOString();

      // Add audit entry
      commission.auditTrail.push({
        id: `audit_${Date.now()}`,
        action: 'paid_out',
        performedBy: 'system',
        performedAt: new Date().toISOString(),
        previousState: { status: 'deducted' },
        newState: { 
          status: 'paid_out', 
          paidOutAt: commission.paidOutAt,
          payoutId: payoutResult.payoutId 
        },
        automatedAction: true,
      });

      await this.updateCommissionTransaction(commission);

      return { success: true, payoutId: payoutResult.payoutId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process payout'
      };
    }
  }

  // Get user's commission summary
  async getCommissionSummary(
    userId: string,
    userType: 'artisan' | 'seller',
    period: CommissionSummary['period'],
    startDate?: string,
    endDate?: string
  ): Promise<CommissionSummary | null> {
    try {
      // Calculate date range based on period
      const dateRange = this.calculateDateRange(period, startDate, endDate);
      
      // Fetch commission transactions for the period
      const transactions = await this.getCommissionTransactions(userId, userType, dateRange);
      
      if (transactions.length === 0) {
        return null;
      }

      // Calculate summary statistics
      const totalTransactions = transactions.length;
      const totalGrossAmount = transactions.reduce((sum, t) => sum + t.grossAmount, 0);
      const totalCommissionAmount = transactions.reduce((sum, t) => sum + t.commissionAmount, 0);
      const totalNetAmount = transactions.reduce((sum, t) => sum + t.netAmount, 0);
      const averageCommissionRate = transactions.reduce((sum, t) => sum + t.commissionRate, 0) / totalTransactions;

      // Calculate breakdown by transaction type
      const breakdown = this.calculateBreakdown(transactions);
      
      // Calculate trends (compare with previous period)
      const trends = await this.calculateTrends(userId, userType, dateRange);

      const summary: CommissionSummary = {
        period,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        userId,
        userType,
        totalTransactions,
        totalGrossAmount,
        totalCommissionAmount,
        totalNetAmount,
        averageCommissionRate,
        currency: transactions[0]?.currency || 'NGN',
        breakdown,
        trends,
      };

      return summary;
    } catch (error) {
      console.error('Failed to get commission summary:', error);
      return null;
    }
  }

  // Create commission dispute
  async createCommissionDispute(dispute: Omit<CommissionDispute, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<{
    success: boolean;
    disputeId?: string;
    error?: string;
  }> {
    try {
      const disputeId = `dispute_comm_${Date.now()}`;
      
      const commissionDispute: CommissionDispute = {
        ...dispute,
        id: disputeId,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save dispute
      await this.saveCommissionDispute(commissionDispute);

      // Update commission transaction status
      const commission = await this.getCommissionTransaction(dispute.commissionTransactionId);
      if (commission) {
        commission.status = 'disputed';
        commission.auditTrail.push({
          id: `audit_${Date.now()}`,
          action: 'disputed',
          performedBy: dispute.disputedBy,
          performedAt: new Date().toISOString(),
          previousState: { status: commission.status },
          newState: { status: 'disputed', disputeId },
          reason: dispute.reason,
          automatedAction: false,
        });
        await this.updateCommissionTransaction(commission);
      }

      return { success: true, disputeId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create dispute'
      };
    }
  }

  // Get transparent fee breakdown for display
  getTransparentFeeBreakdown(grossAmount: number, commissionRate: number, currency: string = 'NGN') {
    const commissionAmount = Math.round((grossAmount * commissionRate) / 100);
    const netAmount = grossAmount - commissionAmount;

    return {
      grossAmount: {
        amount: grossAmount,
        display: `${currency === 'NGN' ? '₦' : currency} ${grossAmount.toLocaleString()}`,
        description: 'Total job amount',
      },
      platformFee: {
        amount: commissionAmount,
        rate: commissionRate,
        display: `${currency === 'NGN' ? '₦' : currency} ${commissionAmount.toLocaleString()}`,
        description: `Platform fee (${commissionRate}%)`,
      },
      netAmount: {
        amount: netAmount,
        display: `${currency === 'NGN' ? '₦' : currency} ${netAmount.toLocaleString()}`,
        description: 'You receive',
      },
      breakdown: [
        { label: 'Job Payment', amount: grossAmount, type: 'positive' as const },
        { label: 'Platform Fee', amount: -commissionAmount, type: 'negative' as const },
        { label: 'Net Earnings', amount: netAmount, type: 'total' as const },
      ],
    };
  }

  // Private helper methods
  private async getUserCommissionRate(userId: string, userType: 'artisan' | 'seller'): Promise<CommissionRate> {
    // TODO: Implement API call to get user's current commission rate
    // For now, return default rate based on subscription tier
    return {
      id: `rate_${userId}`,
      userId,
      userType,
      tier: 'standard',
      rate: this.defaultCommissionRates.standard,
      effectiveFrom: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private async applyRateAdjustments(
    baseRate: number,
    userId: string,
    transactionType: string,
    metadata?: any
  ): Promise<number> {
    // Apply promotional rates, bulk discounts, etc.
    // TODO: Implement rate adjustment logic
    return baseRate;
  }

  private async processCommissionDeduction(commission: CommissionTransaction): Promise<{
    success: boolean;
    error?: string;
  }> {
    // TODO: Integrate with payment gateway to deduct commission
    console.log(`Deducting commission: ₦${commission.commissionAmount.toLocaleString()}`);
    return { success: true };
  }

  private async processUserPayout(commission: CommissionTransaction, paymentDetails: any): Promise<{
    success: boolean;
    payoutId?: string;
    error?: string;
  }> {
    // TODO: Integrate with payment gateway to pay out net amount
    const payoutId = `payout_${Date.now()}`;
    console.log(`Processing payout: ₦${commission.netAmount.toLocaleString()} to ${paymentDetails.recipientId}`);
    return { success: true, payoutId };
  }

  private calculateDateRange(period: string, startDate?: string, endDate?: string) {
    // TODO: Implement date range calculation
    return {
      startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: endDate || new Date().toISOString(),
    };
  }

  private calculateBreakdown(transactions: CommissionTransaction[]) {
    // TODO: Implement breakdown calculation by transaction type
    return {};
  }

  private async calculateTrends(userId: string, userType: string, dateRange: any) {
    // TODO: Implement trend calculation
    return {
      transactionGrowth: 0,
      commissionGrowth: 0,
      averageTransactionSize: 0,
    };
  }

  // Data access methods (to be implemented with API calls)
  private async saveCommissionTransaction(commission: CommissionTransaction): Promise<void> {
    console.log('Saving commission transaction:', commission.id);
  }

  private async updateCommissionTransaction(commission: CommissionTransaction): Promise<void> {
    console.log('Updating commission transaction:', commission.id);
  }

  private async getCommissionTransaction(id: string): Promise<CommissionTransaction | null> {
    console.log('Fetching commission transaction:', id);
    return null; // TODO: Implement API call
  }

  private async getCommissionTransactions(userId: string, userType: string, dateRange: any): Promise<CommissionTransaction[]> {
    console.log('Fetching commission transactions for user:', userId);
    return []; // TODO: Implement API call
  }

  private async saveCommissionDispute(dispute: CommissionDispute): Promise<void> {
    console.log('Saving commission dispute:', dispute.id);
  }
}

export default CommissionTrackingService;