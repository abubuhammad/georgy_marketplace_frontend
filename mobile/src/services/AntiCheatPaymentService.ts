import { Alert } from 'react-native';

export interface ServiceFeePayment {
  id: string;
  requestId: string;
  customerId: string;
  artisanId: string;
  amount: number; // Always 2000 for service fee
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'mobile_money' | 'bank_transfer';
  transactionRef: string;
  paidAt?: string;
  createdAt: string;
}

export interface EscrowPayment {
  id: string;
  serviceRequestId: string;
  customerId: string;
  artisanId: string;
  totalAmount: number;
  platformFee: number; // 10% commission
  artisanAmount: number; // 90% after commission
  serviceFeeId: string; // Reference to the upfront service fee
  status: 'pending' | 'escrowed' | 'released' | 'disputed' | 'refunded';
  milestones?: EscrowMilestone[];
  paymentMethod: 'card' | 'mobile_money' | 'bank_transfer';
  transactionRef: string;
  escrowedAt?: string;
  releasedAt?: string;
  createdAt: string;
}

export interface EscrowMilestone {
  id: string;
  title: string;
  amount: number;
  status: 'pending' | 'completed' | 'released';
  completedAt?: string;
  releasedAt?: string;
}

export interface ArtisanContactInfo {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  isRevealed: boolean;
  revealedAt?: string;
}

export interface PaymentFlowState {
  stage: 'quote_review' | 'service_fee_pending' | 'service_fee_paid' | 'escrow_pending' | 'escrow_deposited' | 'contact_revealed' | 'job_active' | 'completed';
  canRevealContact: boolean;
  canStartJob: boolean;
  payments: {
    serviceFee?: ServiceFeePayment;
    escrow?: EscrowPayment;
  };
}

class AntiCheatPaymentService {
  private readonly SERVICE_FEE_AMOUNT = 2000; // ₦2,000
  private readonly PLATFORM_COMMISSION_RATE = 0.10; // 10%
  
  /**
   * Initialize payment flow when customer accepts a quote
   */
  async initiatePaymentFlow(
    requestId: string,
    customerId: string,
    artisanId: string,
    quoteAmount: number
  ): Promise<PaymentFlowState> {
    try {
      const platformFee = Math.round(quoteAmount * this.PLATFORM_COMMISSION_RATE);
      const artisanAmount = quoteAmount - platformFee;

      // Create service fee payment record
      const serviceFee: ServiceFeePayment = {
        id: `sf_${Date.now()}`,
        requestId,
        customerId,
        artisanId,
        amount: this.SERVICE_FEE_AMOUNT,
        status: 'pending',
        paymentMethod: 'card', // Default, user can change
        transactionRef: `sf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };

      // Create escrow payment record
      const escrow: EscrowPayment = {
        id: `esc_${Date.now()}`,
        serviceRequestId: requestId,
        customerId,
        artisanId,
        totalAmount: quoteAmount,
        platformFee,
        artisanAmount,
        serviceFeeId: serviceFee.id,
        status: 'pending',
        paymentMethod: 'card',
        transactionRef: `esc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };

      // TODO: Save to backend
      console.log('Payment flow initiated:', { serviceFee, escrow });

      return {
        stage: 'quote_review',
        canRevealContact: false,
        canStartJob: false,
        payments: {
          serviceFee,
          escrow,
        },
      };
    } catch (error) {
      console.error('Error initiating payment flow:', error);
      throw new Error('Failed to initialize payment flow');
    }
  }

  /**
   * Process the upfront service fee payment
   */
  async processServiceFeePayment(
    serviceFeeId: string,
    paymentMethod: 'card' | 'mobile_money' | 'bank_transfer',
    paymentDetails: any
  ): Promise<ServiceFeePayment> {
    try {
      // TODO: Integrate with actual payment gateway (Paystack, Flutterwave, etc.)
      const paymentResult = await this.processPayment(
        this.SERVICE_FEE_AMOUNT,
        paymentMethod,
        paymentDetails,
        'Service booking fee'
      );

      if (paymentResult.status === 'success') {
        const updatedServiceFee: ServiceFeePayment = {
          id: serviceFeeId,
          requestId: paymentResult.requestId,
          customerId: paymentResult.customerId,
          artisanId: paymentResult.artisanId,
          amount: this.SERVICE_FEE_AMOUNT,
          status: 'paid',
          paymentMethod,
          transactionRef: paymentResult.transactionRef,
          paidAt: new Date().toISOString(),
          createdAt: paymentResult.createdAt,
        };

        // TODO: Update backend
        console.log('Service fee paid successfully:', updatedServiceFee);
        return updatedServiceFee;
      } else {
        throw new Error(paymentResult.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Service fee payment failed:', error);
      throw error;
    }
  }

  /**
   * Process escrow deposit after service fee is paid
   */
  async processEscrowDeposit(
    escrowId: string,
    paymentMethod: 'card' | 'mobile_money' | 'bank_transfer',
    paymentDetails: any
  ): Promise<EscrowPayment> {
    try {
      // Get escrow details
      const escrowPayment = await this.getEscrowPayment(escrowId);
      
      const paymentResult = await this.processPayment(
        escrowPayment.totalAmount,
        paymentMethod,
        paymentDetails,
        'Job payment escrow'
      );

      if (paymentResult.status === 'success') {
        const updatedEscrow: EscrowPayment = {
          ...escrowPayment,
          status: 'escrowed',
          paymentMethod,
          transactionRef: paymentResult.transactionRef,
          escrowedAt: new Date().toISOString(),
        };

        // TODO: Update backend
        console.log('Escrow deposit successful:', updatedEscrow);
        return updatedEscrow;
      } else {
        throw new Error(paymentResult.error || 'Escrow deposit failed');
      }
    } catch (error) {
      console.error('Escrow deposit failed:', error);
      throw error;
    }
  }

  /**
   * Reveal artisan contact information after payments
   */
  async revealArtisanContact(
    serviceFeeId: string,
    escrowId: string,
    artisanId: string
  ): Promise<ArtisanContactInfo> {
    try {
      // Verify both payments are completed
      const serviceFee = await this.getServiceFeePayment(serviceFeeId);
      const escrow = await this.getEscrowPayment(escrowId);

      if (serviceFee.status !== 'paid' || escrow.status !== 'escrowed') {
        throw new Error('Payments not completed. Cannot reveal contact information.');
      }

      // TODO: Get actual artisan details from backend
      const contactInfo: ArtisanContactInfo = {
        name: 'John Doe', // From backend
        phone: '+234-806-123-4567',
        email: 'john.doe@example.com',
        address: '123 Artisan Street, Lagos, Nigeria',
        isRevealed: true,
        revealedAt: new Date().toISOString(),
      };

      // Log contact reveal for audit
      console.log('Contact information revealed:', {
        artisanId,
        serviceFeeId,
        escrowId,
        revealedAt: contactInfo.revealedAt,
      });

      return contactInfo;
    } catch (error) {
      console.error('Error revealing contact:', error);
      throw error;
    }
  }

  /**
   * Release escrow payment upon job completion
   */
  async releaseEscrowPayment(
    escrowId: string,
    customerId: string,
    completionProof?: {
      rating: number;
      review?: string;
      images?: string[];
    }
  ): Promise<EscrowPayment> {
    try {
      const escrow = await this.getEscrowPayment(escrowId);
      
      if (escrow.status !== 'escrowed') {
        throw new Error('Escrow not in valid state for release');
      }

      // TODO: Transfer artisanAmount to artisan's account
      // TODO: Keep platformFee in platform account
      
      const updatedEscrow: EscrowPayment = {
        ...escrow,
        status: 'released',
        releasedAt: new Date().toISOString(),
      };

      // TODO: Update backend
      console.log('Escrow payment released:', {
        escrowId,
        artisanAmount: escrow.artisanAmount,
        platformFee: escrow.platformFee,
        completionProof,
      });

      return updatedEscrow;
    } catch (error) {
      console.error('Error releasing escrow:', error);
      throw error;
    }
  }

  /**
   * Create milestone payments for large jobs
   */
  async createMilestonePayments(
    escrowId: string,
    milestones: Array<{ title: string; percentage: number }>
  ): Promise<EscrowPayment> {
    try {
      const escrow = await this.getEscrowPayment(escrowId);
      
      const escrowMilestones: EscrowMilestone[] = milestones.map((milestone, index) => ({
        id: `ms_${escrowId}_${index}`,
        title: milestone.title,
        amount: Math.round(escrow.totalAmount * (milestone.percentage / 100)),
        status: 'pending',
      }));

      const updatedEscrow: EscrowPayment = {
        ...escrow,
        milestones: escrowMilestones,
      };

      // TODO: Update backend
      console.log('Milestone payments created:', updatedEscrow);
      return updatedEscrow;
    } catch (error) {
      console.error('Error creating milestones:', error);
      throw error;
    }
  }

  /**
   * Release milestone payment
   */
  async releaseMilestonePayment(
    escrowId: string,
    milestoneId: string,
    customerId: string
  ): Promise<void> {
    try {
      const escrow = await this.getEscrowPayment(escrowId);
      const milestone = escrow.milestones?.find(m => m.id === milestoneId);
      
      if (!milestone) {
        throw new Error('Milestone not found');
      }

      // TODO: Release milestone amount to artisan
      console.log('Milestone payment released:', {
        escrowId,
        milestoneId,
        amount: milestone.amount,
      });
    } catch (error) {
      console.error('Error releasing milestone:', error);
      throw error;
    }
  }

  /**
   * Get current payment flow state
   */
  async getPaymentFlowState(requestId: string): Promise<PaymentFlowState> {
    try {
      // TODO: Get from backend
      const serviceFee = await this.getServiceFeeByRequestId(requestId);
      const escrow = await this.getEscrowByRequestId(requestId);

      let stage: PaymentFlowState['stage'] = 'quote_review';
      let canRevealContact = false;
      let canStartJob = false;

      if (serviceFee?.status === 'paid' && escrow?.status === 'escrowed') {
        stage = 'contact_revealed';
        canRevealContact = true;
        canStartJob = true;
      } else if (serviceFee?.status === 'paid') {
        stage = 'service_fee_paid';
      } else if (serviceFee?.status === 'pending') {
        stage = 'service_fee_pending';
      }

      return {
        stage,
        canRevealContact,
        canStartJob,
        payments: {
          serviceFee,
          escrow,
        },
      };
    } catch (error) {
      console.error('Error getting payment flow state:', error);
      throw error;
    }
  }

  /**
   * Calculate total cost including platform fees
   */
  calculateTotalCost(quoteAmount: number): {
    subtotal: number;
    serviceFee: number;
    escrowAmount: number;
    platformFee: number;
    artisanEarnings: number;
    totalCustomerPayment: number;
  } {
    const serviceFee = this.SERVICE_FEE_AMOUNT;
    const platformFee = Math.round(quoteAmount * this.PLATFORM_COMMISSION_RATE);
    const artisanEarnings = quoteAmount - platformFee;
    const totalCustomerPayment = serviceFee + quoteAmount;

    return {
      subtotal: quoteAmount,
      serviceFee,
      escrowAmount: quoteAmount,
      platformFee,
      artisanEarnings,
      totalCustomerPayment,
    };
  }

  // Private helper methods
  private async processPayment(
    amount: number,
    method: string,
    details: any,
    description: string
  ): Promise<any> {
    // TODO: Integrate with payment gateway
    // This is a mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'success',
          transactionRef: `txn_${Date.now()}`,
          requestId: details.requestId,
          customerId: details.customerId,
          artisanId: details.artisanId,
          createdAt: new Date().toISOString(),
        });
      }, 2000);
    });
  }

  private async getServiceFeePayment(id: string): Promise<ServiceFeePayment> {
    // TODO: Implement backend call
    throw new Error('Method not implemented');
  }

  private async getEscrowPayment(id: string): Promise<EscrowPayment> {
    // TODO: Implement backend call
    throw new Error('Method not implemented');
  }

  private async getServiceFeeByRequestId(requestId: string): Promise<ServiceFeePayment | null> {
    // TODO: Implement backend call
    return null;
  }

  private async getEscrowByRequestId(requestId: string): Promise<EscrowPayment | null> {
    // TODO: Implement backend call
    return null;
  }
}

export default new AntiCheatPaymentService();