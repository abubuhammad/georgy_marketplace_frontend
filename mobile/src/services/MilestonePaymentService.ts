import { PaymentGatewayService } from './PaymentGatewayService';

export interface PaymentMilestone {
  id: string;
  jobId: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  percentage: number;
  order: number;
  status: 'pending' | 'ready' | 'deposited' | 'released' | 'disputed';
  dueDate?: string;
  completedDate?: string;
  approvalRequired: boolean;
  evidenceRequired: string[]; // Types of evidence needed: 'photos', 'documents', 'customer_approval'
  estimatedDays?: number;
  dependencies?: string[]; // IDs of milestones that must be completed first
  customerId: string;
  artisanId: string;
  escrowId?: string;
  paymentId?: string;
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneEvidence {
  id: string;
  milestoneId: string;
  type: 'photo' | 'document' | 'video' | 'description';
  url?: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  approved?: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export interface MilestonePaymentPlan {
  jobId: string;
  totalAmount: number;
  currency: string;
  milestones: Omit<PaymentMilestone, 'id' | 'createdAt' | 'updatedAt'>[];
  customerId: string;
  artisanId: string;
  autoApproval: boolean;
  maxMilestoneAmount: number;
  commission: number; // Platform commission percentage
  escrowPeriod: number; // Days to hold funds after completion
}

export class MilestonePaymentService {
  private paymentGateway: PaymentGatewayService;

  constructor() {
    this.paymentGateway = new PaymentGatewayService();
  }

  // Create milestone payment plan for a job
  async createMilestonePaymentPlan(plan: MilestonePaymentPlan): Promise<{
    success: boolean;
    milestones: PaymentMilestone[];
    error?: string;
  }> {
    try {
      // Validate payment plan
      const validation = this.validatePaymentPlan(plan);
      if (!validation.valid) {
        return { success: false, milestones: [], error: validation.error };
      }

      // Create milestones
      const milestones: PaymentMilestone[] = plan.milestones.map((milestone, index) => ({
        ...milestone,
        id: `milestone_${plan.jobId}_${index + 1}`,
        jobId: plan.jobId,
        status: index === 0 ? 'ready' : 'pending', // First milestone is ready
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      // TODO: Save to backend API
      console.log('Creating milestone payment plan:', { plan, milestones });

      return { success: true, milestones };
    } catch (error) {
      return { 
        success: false, 
        milestones: [], 
        error: error instanceof Error ? error.message : 'Failed to create payment plan' 
      };
    }
  }

  // Validate milestone payment plan
  private validatePaymentPlan(plan: MilestonePaymentPlan): { valid: boolean; error?: string } {
    // Check total percentage adds up to 100%
    const totalPercentage = plan.milestones.reduce((sum, milestone) => sum + milestone.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return { valid: false, error: `Milestone percentages must total 100%, got ${totalPercentage}%` };
    }

    // Check total amount matches sum of milestone amounts
    const totalMilestoneAmount = plan.milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
    if (Math.abs(totalMilestoneAmount - plan.totalAmount) > 0.01) {
      return { valid: false, error: `Milestone amounts don't match total job amount` };
    }

    // Check milestone amounts don't exceed maximum
    const oversizedMilestone = plan.milestones.find(m => m.amount > plan.maxMilestoneAmount);
    if (oversizedMilestone) {
      return { valid: false, error: `Milestone "${oversizedMilestone.title}" exceeds maximum amount of ₦${plan.maxMilestoneAmount.toLocaleString()}` };
    }

    // Validate dependencies exist
    const milestoneIds = plan.milestones.map((_, index) => `milestone_${plan.jobId}_${index + 1}`);
    for (const milestone of plan.milestones) {
      if (milestone.dependencies) {
        const invalidDeps = milestone.dependencies.filter(dep => !milestoneIds.includes(dep));
        if (invalidDeps.length > 0) {
          return { valid: false, error: `Invalid milestone dependencies: ${invalidDeps.join(', ')}` };
        }
      }
    }

    return { valid: true };
  }

  // Deposit funds for a milestone (customer action)
  async depositMilestonePayment(
    milestoneId: string,
    paymentMethod: string,
    paymentDetails: any
  ): Promise<{ success: boolean; paymentId?: string; escrowId?: string; error?: string }> {
    try {
      const milestone = await this.getMilestone(milestoneId);
      if (!milestone) {
        return { success: false, error: 'Milestone not found' };
      }

      if (milestone.status !== 'ready') {
        return { success: false, error: `Milestone is not ready for payment. Status: ${milestone.status}` };
      }

      // Process payment through gateway
      const paymentResult = await this.paymentGateway.processPayment({
        amount: milestone.amount,
        currency: milestone.currency,
        method: paymentMethod,
        description: `Milestone payment: ${milestone.title}`,
        metadata: {
          type: 'milestone_payment',
          milestoneId: milestoneId,
          jobId: milestone.jobId,
          customerId: milestone.customerId,
          artisanId: milestone.artisanId,
        },
        ...paymentDetails,
      });

      if (!paymentResult.success) {
        return { success: false, error: paymentResult.error };
      }

      // Create escrow entry
      const escrowId = await this.createMilestoneEscrow(milestone, paymentResult.paymentId!);

      // Update milestone status
      await this.updateMilestoneStatus(milestoneId, 'deposited', {
        paymentId: paymentResult.paymentId,
        escrowId: escrowId,
      });

      return { 
        success: true, 
        paymentId: paymentResult.paymentId,
        escrowId: escrowId 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process milestone payment' 
      };
    }
  }

  // Submit milestone completion evidence (artisan action)
  async submitMilestoneEvidence(
    milestoneId: string,
    evidence: Omit<MilestoneEvidence, 'id' | 'milestoneId' | 'submittedAt'>
  ): Promise<{ success: boolean; evidenceId?: string; error?: string }> {
    try {
      const milestone = await this.getMilestone(milestoneId);
      if (!milestone) {
        return { success: false, error: 'Milestone not found' };
      }

      if (milestone.status !== 'deposited') {
        return { success: false, error: 'Milestone payment must be deposited before submitting evidence' };
      }

      const evidenceId = `evidence_${milestoneId}_${Date.now()}`;
      const evidenceRecord: MilestoneEvidence = {
        ...evidence,
        id: evidenceId,
        milestoneId: milestoneId,
        submittedAt: new Date().toISOString(),
      };

      // TODO: Save evidence to backend
      console.log('Submitting milestone evidence:', evidenceRecord);

      // Check if milestone is ready for approval
      const requiredEvidence = milestone.evidenceRequired;
      const submittedEvidence = await this.getMilestoneEvidence(milestoneId);
      
      const hasAllEvidence = requiredEvidence.every(type => {
        return submittedEvidence.some(ev => ev.type === type || ev.type === 'description');
      });

      if (hasAllEvidence && !milestone.approvalRequired) {
        // Auto-approve if no manual approval required
        await this.approveMilestone(milestoneId, 'system', 'Auto-approved based on evidence submission');
      }

      return { success: true, evidenceId };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to submit evidence' 
      };
    }
  }

  // Approve milestone completion (customer action)
  async approveMilestone(
    milestoneId: string,
    approvedBy: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const milestone = await this.getMilestone(milestoneId);
      if (!milestone) {
        return { success: false, error: 'Milestone not found' };
      }

      if (milestone.status !== 'deposited') {
        return { success: false, error: 'Milestone must be paid before approval' };
      }

      // Check if required evidence is submitted
      const requiredEvidence = milestone.evidenceRequired;
      const submittedEvidence = await this.getMilestoneEvidence(milestoneId);
      
      const missingEvidence = requiredEvidence.filter(type => {
        return !submittedEvidence.some(ev => ev.type === type);
      });

      if (missingEvidence.length > 0) {
        return { success: false, error: `Missing required evidence: ${missingEvidence.join(', ')}` };
      }

      // Release milestone payment to artisan
      await this.releaseMilestonePayment(milestoneId, approvedBy, notes);

      // Activate next milestone if exists
      await this.activateNextMilestone(milestone.jobId, milestone.order);

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to approve milestone' 
      };
    }
  }

  // Release milestone payment to artisan
  private async releaseMilestonePayment(
    milestoneId: string,
    approvedBy: string,
    notes?: string
  ): Promise<void> {
    const milestone = await this.getMilestone(milestoneId);
    if (!milestone || !milestone.escrowId) {
      throw new Error('Invalid milestone or missing escrow');
    }

    // Calculate commission
    const platformCommission = (milestone.amount * 0.10); // 10% commission
    const artisanPayout = milestone.amount - platformCommission;

    // Release payment through gateway
    await this.paymentGateway.releaseEscrowPayment(milestone.escrowId, {
      recipientId: milestone.artisanId,
      amount: artisanPayout,
      currency: milestone.currency,
      platformFee: platformCommission,
      notes: notes,
    });

    // Update milestone status
    await this.updateMilestoneStatus(milestoneId, 'released', {
      releasedAt: new Date().toISOString(),
      approvedBy: approvedBy,
    });

    // TODO: Send notification to artisan
    console.log(`Released milestone payment: ₦${artisanPayout.toLocaleString()} to artisan ${milestone.artisanId}`);
  }

  // Activate next milestone in sequence
  private async activateNextMilestone(jobId: string, completedOrder: number): Promise<void> {
    const milestones = await this.getJobMilestones(jobId);
    const nextMilestone = milestones.find(m => m.order === completedOrder + 1);
    
    if (nextMilestone && nextMilestone.status === 'pending') {
      // Check if dependencies are met
      if (nextMilestone.dependencies) {
        const dependenciesMet = nextMilestone.dependencies.every(depId => {
          const depMilestone = milestones.find(m => m.id === depId);
          return depMilestone?.status === 'released';
        });

        if (!dependenciesMet) {
          return; // Dependencies not yet met
        }
      }

      await this.updateMilestoneStatus(nextMilestone.id, 'ready');
      // TODO: Send notification to customer about next payment
    }
  }

  // Dispute milestone
  async disputeMilestone(
    milestoneId: string,
    disputedBy: string,
    reason: string,
    evidence?: string[]
  ): Promise<{ success: boolean; disputeId?: string; error?: string }> {
    try {
      const milestone = await this.getMilestone(milestoneId);
      if (!milestone) {
        return { success: false, error: 'Milestone not found' };
      }

      const disputeId = `dispute_${milestoneId}_${Date.now()}`;
      
      // Update milestone status
      await this.updateMilestoneStatus(milestoneId, 'disputed');

      // TODO: Create dispute record in backend
      console.log('Creating milestone dispute:', {
        disputeId,
        milestoneId,
        disputedBy,
        reason,
        evidence,
      });

      return { success: true, disputeId };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create dispute' 
      };
    }
  }

  // Get milestone details
  private async getMilestone(milestoneId: string): Promise<PaymentMilestone | null> {
    // TODO: Implement API call
    console.log(`Fetching milestone: ${milestoneId}`);
    return null; // Mock implementation
  }

  // Get all milestones for a job
  async getJobMilestones(jobId: string): Promise<PaymentMilestone[]> {
    // TODO: Implement API call
    console.log(`Fetching milestones for job: ${jobId}`);
    return []; // Mock implementation
  }

  // Get milestone evidence
  private async getMilestoneEvidence(milestoneId: string): Promise<MilestoneEvidence[]> {
    // TODO: Implement API call
    console.log(`Fetching evidence for milestone: ${milestoneId}`);
    return []; // Mock implementation
  }

  // Update milestone status
  private async updateMilestoneStatus(
    milestoneId: string,
    status: PaymentMilestone['status'],
    updates?: Partial<PaymentMilestone>
  ): Promise<void> {
    // TODO: Implement API call
    console.log(`Updating milestone ${milestoneId} status to ${status}`, updates);
  }

  // Create escrow entry for milestone
  private async createMilestoneEscrow(
    milestone: PaymentMilestone,
    paymentId: string
  ): Promise<string> {
    // TODO: Implement API call
    const escrowId = `escrow_${milestone.id}_${Date.now()}`;
    console.log(`Creating escrow ${escrowId} for milestone ${milestone.id}`);
    return escrowId;
  }

  // Generate recommended milestone breakdown
  generateRecommendedMilestones(
    jobAmount: number,
    jobType: string,
    estimatedDays: number
  ): Omit<PaymentMilestone, 'id' | 'jobId' | 'customerId' | 'artisanId' | 'createdAt' | 'updatedAt' | 'status'>[] {
    const baseMilestones = this.getMilestoneTemplate(jobType);
    
    return baseMilestones.map((template, index) => ({
      ...template,
      amount: Math.round(jobAmount * (template.percentage / 100)),
      order: index + 1,
      estimatedDays: Math.ceil(estimatedDays * (template.percentage / 100)),
      currency: 'NGN',
      approvalRequired: template.percentage >= 30, // Require approval for large milestones
      evidenceRequired: template.evidenceRequired || ['photos', 'description'],
    }));
  }

  // Get milestone templates by job type
  private getMilestoneTemplate(jobType: string): Array<{
    title: string;
    description: string;
    percentage: number;
    evidenceRequired?: string[];
  }> {
    const templates = {
      'plumbing': [
        { title: 'Material Purchase & Setup', description: 'Purchase materials and prepare work area', percentage: 30, evidenceRequired: ['photos', 'documents'] },
        { title: 'Main Installation Work', description: 'Complete primary plumbing installation', percentage: 50, evidenceRequired: ['photos', 'description'] },
        { title: 'Testing & Cleanup', description: 'Test system and clean work area', percentage: 20, evidenceRequired: ['photos', 'customer_approval'] },
      ],
      'electrical': [
        { title: 'Planning & Materials', description: 'Electrical planning and material acquisition', percentage: 25 },
        { title: 'Rough-in Work', description: 'Install wiring and rough electrical components', percentage: 40 },
        { title: 'Finish & Testing', description: 'Install fixtures and test all connections', percentage: 35 },
      ],
      'construction': [
        { title: 'Foundation & Materials', description: 'Site preparation and material delivery', percentage: 20 },
        { title: 'Structural Work', description: 'Main construction phase', percentage: 50 },
        { title: 'Finishing Work', description: 'Finishing touches and final inspection', percentage: 30 },
      ],
      'default': [
        { title: 'Project Start', description: 'Initial work and material preparation', percentage: 40 },
        { title: 'Project Completion', description: 'Complete work and final delivery', percentage: 60 },
      ],
    };

    return templates[jobType as keyof typeof templates] || templates.default;
  }
}

export default MilestonePaymentService;