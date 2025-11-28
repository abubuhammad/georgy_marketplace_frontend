export interface Dispute {
  id: string;
  type: 'payment' | 'quality' | 'delivery' | 'communication' | 'cancellation' | 'refund';
  status: 'open' | 'under_review' | 'mediation' | 'escalated' | 'resolved' | 'closed' | 'appealed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Parties involved
  customerId: string;
  artisanId: string;
  initiatedBy: 'customer' | 'artisan' | 'system' | 'admin';
  
  // Context
  jobId?: string;
  orderId?: string;
  transactionId?: string;
  milestoneId?: string;
  
  // Dispute details
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  
  // Financial impact
  disputedAmount: number;
  currency: string;
  refundRequested?: number;
  compensationRequested?: number;
  
  // Evidence and documentation
  evidence: DisputeEvidence[];
  chatMessages: DisputeChatMessage[];
  
  // Resolution tracking
  resolution?: DisputeResolution;
  mediatorId?: string;
  adminId?: string;
  
  // Timeline
  deadlines: {
    responseDeadline?: string;
    evidenceDeadline?: string;
    mediationDeadline?: string;
    finalResolutionDeadline?: string;
  };
  
  // System tracking
  escalationLevel: number;
  autoEscalationTriggers: string[];
  tags: string[];
  metadata: {
    sourceScreen?: string;
    userAgent?: string;
    previousDisputes?: number;
    satisfactionRating?: number;
    resolutionTime?: number;
  };
  
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface DisputeEvidence {
  id: string;
  disputeId: string;
  submittedBy: string;
  type: 'screenshot' | 'photo' | 'document' | 'video' | 'audio' | 'chat_log' | 'transaction_record';
  title: string;
  description?: string;
  fileUrl?: string;
  mimeType?: string;
  fileSize?: number;
  metadata: {
    timestamp?: string;
    location?: { lat: number; lng: number };
    deviceInfo?: string;
    verified?: boolean;
  };
  submittedAt: string;
}

export interface DisputeChatMessage {
  id: string;
  disputeId: string;
  senderId: string;
  senderRole: 'customer' | 'artisan' | 'mediator' | 'admin' | 'system';
  message: string;
  type: 'text' | 'system' | 'resolution_offer' | 'evidence_request' | 'deadline_warning';
  metadata?: {
    offerAmount?: number;
    acceptedBy?: string;
    rejectedBy?: string;
    systemAction?: string;
  };
  timestamp: string;
  editedAt?: string;
}

export interface DisputeResolution {
  id: string;
  type: 'refund' | 'partial_refund' | 'compensation' | 'redo_work' | 'mediation_agreement' | 'no_action';
  outcome: 'customer_favor' | 'artisan_favor' | 'mutual_agreement' | 'no_fault' | 'split_liability';
  
  // Financial resolution
  refundAmount?: number;
  compensationAmount?: number;
  feeWaivers?: {
    platformFee?: boolean;
    serviceFee?: boolean;
    transactionFee?: boolean;
  };
  
  // Actions taken
  actions: {
    refundProcessed?: boolean;
    compensationPaid?: boolean;
    workRedone?: boolean;
    accountSuspended?: boolean;
    ratingAdjusted?: boolean;
    trainingRequired?: boolean;
  };
  
  // Agreement terms
  terms?: string;
  conditions?: string[];
  followUpRequired?: boolean;
  followUpDate?: string;
  
  // Resolution details
  resolvedBy: string;
  resolutionMethod: 'automated' | 'mediation' | 'admin_decision' | 'mutual_agreement';
  reasoning: string;
  precedentCases?: string[];
  
  // Satisfaction tracking
  customerSatisfaction?: number;
  artisanSatisfaction?: number;
  resolutionTime: number; // minutes
  
  createdAt: string;
  implementedAt?: string;
}

export interface DisputeTemplate {
  id: string;
  type: Dispute['type'];
  category: string;
  subCategory: string;
  title: string;
  description: string;
  suggestedEvidence: string[];
  expectedResolutionTime: number; // hours
  escalationTriggers: string[];
  commonResolutions: {
    type: DisputeResolution['type'];
    description: string;
    successRate: number;
  }[];
}

export interface DisputeMetrics {
  period: string;
  totalDisputes: number;
  resolvedDisputes: number;
  averageResolutionTime: number;
  satisfactionRate: number;
  resolutionBreakdown: {
    automated: number;
    mediation: number;
    admin: number;
    mutual: number;
  };
  typeBreakdown: Record<string, number>;
  outcomeBreakdown: Record<string, number>;
  escalationRate: number;
  repeatDisputeRate: number;
}

export class DisputeResolutionService {
  private disputeTemplates: DisputeTemplate[] = [];
  
  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    this.disputeTemplates = [
      {
        id: 'payment_not_received',
        type: 'payment',
        category: 'Payment Issues',
        subCategory: 'Payment Not Received',
        title: 'Payment not received after job completion',
        description: 'Customer has not released payment despite job completion',
        suggestedEvidence: ['completion_photos', 'customer_approval', 'chat_messages'],
        expectedResolutionTime: 24,
        escalationTriggers: ['no_customer_response_48h', 'payment_overdue_72h'],
        commonResolutions: [
          { type: 'refund', description: 'Release escrowed payment', successRate: 85 },
          { type: 'mediation_agreement', description: 'Mediated resolution', successRate: 12 },
          { type: 'no_action', description: 'Insufficient evidence', successRate: 3 },
        ],
      },
      {
        id: 'work_quality_dispute',
        type: 'quality',
        category: 'Work Quality',
        subCategory: 'Unsatisfactory Work',
        title: 'Work quality below expectations',
        description: 'Customer is not satisfied with the quality of work delivered',
        suggestedEvidence: ['before_after_photos', 'specification_document', 'expert_opinion'],
        expectedResolutionTime: 48,
        escalationTriggers: ['quality_expert_needed', 'high_dispute_amount'],
        commonResolutions: [
          { type: 'redo_work', description: 'Redo work at no charge', successRate: 45 },
          { type: 'partial_refund', description: 'Partial refund for defects', successRate: 35 },
          { type: 'compensation', description: 'Additional compensation', successRate: 15 },
          { type: 'no_action', description: 'Work meets standards', successRate: 5 },
        ],
      },
      {
        id: 'service_not_delivered',
        type: 'delivery',
        category: 'Service Delivery',
        subCategory: 'No Show/Cancellation',
        title: 'Artisan did not show up or cancelled last minute',
        description: 'Artisan failed to provide service as agreed',
        suggestedEvidence: ['booking_confirmation', 'communication_logs', 'alternate_quotes'],
        expectedResolutionTime: 12,
        escalationTriggers: ['repeated_no_show', 'emergency_service'],
        commonResolutions: [
          { type: 'refund', description: 'Full refund of service fee', successRate: 70 },
          { type: 'compensation', description: 'Compensation for inconvenience', successRate: 25 },
          { type: 'no_action', description: 'Valid cancellation reason', successRate: 5 },
        ],
      },
    ];
  }

  async createDispute(disputeData: Omit<Dispute, 'id' | 'status' | 'escalationLevel' | 'createdAt' | 'updatedAt'>): Promise<{
    success: boolean;
    dispute?: Dispute;
    error?: string;
  }> {
    try {
      const dispute: Dispute = {
        ...disputeData,
        id: `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'open',
        escalationLevel: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Auto-populate suggested evidence and timeline based on template
      const template = this.getDisputeTemplate(dispute.type, dispute.category);
      if (template) {
        dispute.deadlines = {
          responseDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          evidenceDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
          finalResolutionDeadline: new Date(Date.now() + template.expectedResolutionTime * 60 * 60 * 1000).toISOString(),
        };
        dispute.autoEscalationTriggers = template.escalationTriggers;
      }

      // Check for automated resolution opportunities
      const autoResolution = await this.checkAutoResolution(dispute);
      if (autoResolution.canAutoResolve) {
        dispute.status = 'resolved';
        dispute.resolution = autoResolution.resolution;
        dispute.resolvedAt = new Date().toISOString();
      }

      // Save dispute
      await this.saveDispute(dispute);

      // Send notifications
      await this.sendDisputeNotifications(dispute, 'created');

      // Start auto-escalation timer
      this.scheduleAutoEscalation(dispute.id);

      return { success: true, dispute };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create dispute'
      };
    }
  }

  async submitEvidence(disputeId: string, evidence: Omit<DisputeEvidence, 'id' | 'disputeId' | 'submittedAt'>): Promise<{
    success: boolean;
    evidenceId?: string;
    error?: string;
  }> {
    try {
      const dispute = await this.getDispute(disputeId);
      if (!dispute) {
        return { success: false, error: 'Dispute not found' };
      }

      if (dispute.status === 'closed' || dispute.status === 'resolved') {
        return { success: false, error: 'Cannot submit evidence to closed dispute' };
      }

      const evidenceId = `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const evidenceRecord: DisputeEvidence = {
        ...evidence,
        id: evidenceId,
        disputeId,
        submittedAt: new Date().toISOString(),
      };

      // Validate evidence
      const validation = await this.validateEvidence(evidenceRecord);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Save evidence
      await this.saveEvidence(evidenceRecord);

      // Update dispute status if needed
      if (dispute.status === 'open') {
        await this.updateDisputeStatus(disputeId, 'under_review');
      }

      // Check if enough evidence for resolution
      const resolutionCheck = await this.checkResolutionReadiness(disputeId);
      if (resolutionCheck.ready) {
        await this.triggerResolutionProcess(disputeId);
      }

      return { success: true, evidenceId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit evidence'
      };
    }
  }

  async addChatMessage(disputeId: string, message: Omit<DisputeChatMessage, 'id' | 'disputeId' | 'timestamp'>): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const chatMessage: DisputeChatMessage = {
        ...message,
        id: messageId,
        disputeId,
        timestamp: new Date().toISOString(),
      };

      await this.saveChatMessage(chatMessage);

      // Check for resolution offers
      if (message.type === 'resolution_offer' && message.metadata?.offerAmount) {
        await this.processResolutionOffer(disputeId, chatMessage);
      }

      // Send real-time notification
      await this.sendChatNotification(disputeId, chatMessage);

      return { success: true, messageId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add message'
      };
    }
  }

  async escalateDispute(disputeId: string, reason: string, escalatedBy: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const dispute = await this.getDispute(disputeId);
      if (!dispute) {
        return { success: false, error: 'Dispute not found' };
      }

      if (dispute.status === 'escalated') {
        return { success: false, error: 'Dispute already escalated' };
      }

      // Update dispute status
      await this.updateDispute(disputeId, {
        status: 'escalated',
        escalationLevel: dispute.escalationLevel + 1,
        priority: this.calculateEscalatedPriority(dispute),
        updatedAt: new Date().toISOString(),
      });

      // Assign to appropriate resolver
      const assignmentResult = await this.assignEscalatedDispute(disputeId, dispute.escalationLevel + 1);
      
      // Add system message
      await this.addChatMessage(disputeId, {
        senderId: 'system',
        senderRole: 'system',
        message: `Dispute escalated to level ${dispute.escalationLevel + 1}. Reason: ${reason}`,
        type: 'system',
      });

      // Notify relevant parties
      await this.sendDisputeNotifications(dispute, 'escalated');

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to escalate dispute'
      };
    }
  }

  async resolveDispute(
    disputeId: string,
    resolution: Omit<DisputeResolution, 'id' | 'createdAt'>,
    resolvedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const dispute = await this.getDispute(disputeId);
      if (!dispute) {
        return { success: false, error: 'Dispute not found' };
      }

      if (dispute.status === 'resolved' || dispute.status === 'closed') {
        return { success: false, error: 'Dispute already resolved' };
      }

      const resolutionRecord: DisputeResolution = {
        ...resolution,
        id: `resolution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        resolvedBy,
        resolutionTime: Math.floor((Date.now() - new Date(dispute.createdAt).getTime()) / (1000 * 60)),
        createdAt: new Date().toISOString(),
      };

      // Implement resolution actions
      const implementationResult = await this.implementResolution(dispute, resolutionRecord);
      if (!implementationResult.success) {
        return { success: false, error: implementationResult.error };
      }

      // Update dispute
      await this.updateDispute(disputeId, {
        status: 'resolved',
        resolution: resolutionRecord,
        resolvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Add resolution message
      await this.addChatMessage(disputeId, {
        senderId: resolvedBy,
        senderRole: resolvedBy === 'system' ? 'system' : 'admin',
        message: `Dispute resolved: ${resolution.reasoning}`,
        type: 'system',
      });

      // Send notifications
      await this.sendDisputeNotifications(dispute, 'resolved');

      // Schedule follow-up if required
      if (resolution.followUpRequired && resolution.followUpDate) {
        this.scheduleFollowUp(disputeId, resolution.followUpDate);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resolve dispute'
      };
    }
  }

  async getDisputeMetrics(period: string): Promise<DisputeMetrics> {
    // TODO: Implement metrics calculation from database
    return {
      period,
      totalDisputes: 0,
      resolvedDisputes: 0,
      averageResolutionTime: 0,
      satisfactionRate: 0,
      resolutionBreakdown: { automated: 0, mediation: 0, admin: 0, mutual: 0 },
      typeBreakdown: {},
      outcomeBreakdown: {},
      escalationRate: 0,
      repeatDisputeRate: 0,
    };
  }

  // Auto-escalation system
  async processAutoEscalation(): Promise<void> {
    const openDisputes = await this.getOpenDisputes();
    
    for (const dispute of openDisputes) {
      const shouldEscalate = await this.checkEscalationTriggers(dispute);
      if (shouldEscalate.escalate) {
        await this.escalateDispute(dispute.id, shouldEscalate.reason, 'system');
      }
    }
  }

  private async checkAutoResolution(dispute: Dispute): Promise<{
    canAutoResolve: boolean;
    resolution?: DisputeResolution;
  }> {
    // Simple auto-resolution rules
    if (dispute.type === 'payment' && dispute.disputedAmount < 5000) {
      return {
        canAutoResolve: true,
        resolution: {
          id: '',
          type: 'refund',
          outcome: 'customer_favor',
          refundAmount: dispute.disputedAmount,
          actions: { refundProcessed: true },
          resolvedBy: 'system',
          resolutionMethod: 'automated',
          reasoning: 'Auto-resolved: Low amount payment dispute',
          resolutionTime: 0,
          createdAt: new Date().toISOString(),
        },
      };
    }

    return { canAutoResolve: false };
  }

  private async checkEscalationTriggers(dispute: Dispute): Promise<{
    escalate: boolean;
    reason: string;
  }> {
    const now = new Date();
    
    // Check response deadline
    if (dispute.deadlines.responseDeadline && new Date(dispute.deadlines.responseDeadline) < now) {
      return { escalate: true, reason: 'Response deadline exceeded' };
    }
    
    // Check evidence deadline
    if (dispute.deadlines.evidenceDeadline && new Date(dispute.deadlines.evidenceDeadline) < now) {
      return { escalate: true, reason: 'Evidence deadline exceeded' };
    }
    
    // Check custom triggers
    for (const trigger of dispute.autoEscalationTriggers) {
      const shouldTrigger = await this.evaluateTrigger(dispute, trigger);
      if (shouldTrigger) {
        return { escalate: true, reason: `Auto-escalation trigger: ${trigger}` };
      }
    }
    
    return { escalate: false, reason: '' };
  }

  // Helper methods
  private getDisputeTemplate(type: string, category: string): DisputeTemplate | undefined {
    return this.disputeTemplates.find(t => t.type === type && t.category === category);
  }

  private calculateEscalatedPriority(dispute: Dispute): Dispute['priority'] {
    if (dispute.disputedAmount > 100000) return 'urgent';
    if (dispute.disputedAmount > 50000) return 'high';
    return 'medium';
  }

  // Data access methods (to be implemented)
  private async saveDispute(dispute: Dispute): Promise<void> {
    console.log('Saving dispute:', dispute.id);
  }

  private async getDispute(disputeId: string): Promise<Dispute | null> {
    console.log('Fetching dispute:', disputeId);
    return null;
  }

  private async updateDispute(disputeId: string, updates: Partial<Dispute>): Promise<void> {
    console.log('Updating dispute:', disputeId, updates);
  }

  private async updateDisputeStatus(disputeId: string, status: Dispute['status']): Promise<void> {
    console.log('Updating dispute status:', disputeId, status);
  }

  private async saveEvidence(evidence: DisputeEvidence): Promise<void> {
    console.log('Saving evidence:', evidence.id);
  }

  private async saveChatMessage(message: DisputeChatMessage): Promise<void> {
    console.log('Saving chat message:', message.id);
  }

  private async getOpenDisputes(): Promise<Dispute[]> {
    console.log('Fetching open disputes');
    return [];
  }

  private async validateEvidence(evidence: DisputeEvidence): Promise<{ valid: boolean; error?: string }> {
    return { valid: true };
  }

  private async checkResolutionReadiness(disputeId: string): Promise<{ ready: boolean }> {
    return { ready: false };
  }

  private async triggerResolutionProcess(disputeId: string): Promise<void> {
    console.log('Triggering resolution process for dispute:', disputeId);
  }

  private async processResolutionOffer(disputeId: string, message: DisputeChatMessage): Promise<void> {
    console.log('Processing resolution offer:', disputeId);
  }

  private async assignEscalatedDispute(disputeId: string, level: number): Promise<{ success: boolean }> {
    console.log('Assigning escalated dispute:', disputeId, level);
    return { success: true };
  }

  private async implementResolution(dispute: Dispute, resolution: DisputeResolution): Promise<{ success: boolean; error?: string }> {
    console.log('Implementing resolution:', resolution.id);
    return { success: true };
  }

  private async evaluateTrigger(dispute: Dispute, trigger: string): Promise<boolean> {
    console.log('Evaluating trigger:', trigger);
    return false;
  }

  private async sendDisputeNotifications(dispute: Dispute, event: string): Promise<void> {
    console.log('Sending dispute notifications:', dispute.id, event);
  }

  private async sendChatNotification(disputeId: string, message: DisputeChatMessage): Promise<void> {
    console.log('Sending chat notification:', disputeId);
  }

  private scheduleAutoEscalation(disputeId: string): void {
    console.log('Scheduling auto-escalation for dispute:', disputeId);
  }

  private scheduleFollowUp(disputeId: string, followUpDate: string): void {
    console.log('Scheduling follow-up for dispute:', disputeId, followUpDate);
  }
}

export default DisputeResolutionService;