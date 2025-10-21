import { getSocketClient } from '../lib/socketClient';

// ArtisanConnect-specific event types
export interface ServiceRequestEvent {
  type: 'service_request_created' | 'service_request_updated' | 'service_request_cancelled';
  data: {
    requestId: string;
    customerId: string;
    artisanId?: string;
    status: 'pending' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    title: string;
    category: string;
    message?: string;
    quote?: {
      amount: number;
      currency: string;
      estimatedDuration: string;
    };
    timestamp: string;
  };
}

export interface JobProgressEvent {
  type: 'job_progress_updated' | 'job_milestone_reached' | 'job_completed';
  data: {
    jobId: string;
    customerId: string;
    artisanId: string;
    milestone?: string;
    description: string;
    images: string[];
    hoursWorked?: number;
    completionPercentage?: number;
    timestamp: string;
  };
}

export interface QuoteEvent {
  type: 'quote_received' | 'quote_accepted' | 'quote_rejected';
  data: {
    quoteId: string;
    requestId: string;
    customerId: string;
    artisanId: string;
    amount: number;
    currency: string;
    estimatedDuration: string;
    validUntil: string;
    materials?: Array<{
      name: string;
      cost: number;
    }>;
    timestamp: string;
  };
}

export interface PaymentStatusEvent {
  type: 'service_fee_paid' | 'escrow_deposited' | 'payment_released' | 'commission_deducted';
  data: {
    paymentId: string;
    jobId: string;
    customerId: string;
    artisanId: string;
    type: 'service_fee' | 'escrow' | 'payout' | 'commission';
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    escrowBalance?: number;
    commissionAmount?: number;
    timestamp: string;
  };
}

export interface ArtisanLocationEvent {
  type: 'artisan_location_update' | 'artisan_arrival_notification';
  data: {
    artisanId: string;
    jobId: string;
    customerId: string;
    location: {
      lat: number;
      lng: number;
      accuracy?: number;
    };
    estimatedArrival?: string;
    status: 'en_route' | 'nearby' | 'arrived';
    timestamp: string;
  };
}

export interface DisputeEvent {
  type: 'dispute_created' | 'dispute_updated' | 'dispute_resolved';
  data: {
    disputeId: string;
    jobId: string;
    customerId: string;
    artisanId: string;
    type: 'payment' | 'quality' | 'completion' | 'behavior';
    status: 'open' | 'under_review' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    description?: string;
    resolution?: string;
    timestamp: string;
  };
}

export class ArtisanConnectSocketService {
  private socketClient = getSocketClient();

  // Service Request Events
  subscribeToServiceRequests(artisanId: string, callback: (event: ServiceRequestEvent) => void) {
    this.socketClient.emitEvent('subscribe:service_requests', { artisanId });
    return this.socketClient.on('service_request:update', callback);
  }

  subscribeToCustomerRequests(customerId: string, callback: (event: ServiceRequestEvent) => void) {
    this.socketClient.emitEvent('subscribe:customer_requests', { customerId });
    return this.socketClient.on('service_request:update', callback);
  }

  // Job Progress Events
  subscribeToJobProgress(jobId: string, callback: (event: JobProgressEvent) => void) {
    this.socketClient.emitEvent('subscribe:job_progress', { jobId });
    return this.socketClient.on('job_progress:update', callback);
  }

  emitJobProgress(progressUpdate: {
    jobId: string;
    milestone?: string;
    description: string;
    images: string[];
    hoursWorked?: number;
    completionPercentage?: number;
  }) {
    this.socketClient.emitEvent('job_progress:update', progressUpdate);
  }

  // Quote Events
  subscribeToQuotes(requestId: string, callback: (event: QuoteEvent) => void) {
    this.socketClient.emitEvent('subscribe:quotes', { requestId });
    return this.socketClient.on('quote:update', callback);
  }

  emitQuote(quote: {
    requestId: string;
    amount: number;
    currency: string;
    estimatedDuration: string;
    validUntil: string;
    materials?: Array<{ name: string; cost: number }>;
    notes?: string;
  }) {
    this.socketClient.emitEvent('quote:submit', quote);
  }

  emitQuoteResponse(response: {
    quoteId: string;
    action: 'accept' | 'reject';
    reason?: string;
  }) {
    this.socketClient.emitEvent('quote:respond', response);
  }

  // Payment Events
  subscribeToPaymentUpdates(jobId: string, callback: (event: PaymentStatusEvent) => void) {
    this.socketClient.emitEvent('subscribe:payment_updates', { jobId });
    return this.socketClient.on('payment:status_update', callback);
  }

  // Location Events
  subscribeToArtisanLocation(jobId: string, callback: (event: ArtisanLocationEvent) => void) {
    this.socketClient.emitEvent('subscribe:artisan_location', { jobId });
    return this.socketClient.on('artisan:location_update', callback);
  }

  emitLocationUpdate(locationUpdate: {
    jobId: string;
    location: {
      lat: number;
      lng: number;
      accuracy?: number;
    };
    status: 'en_route' | 'nearby' | 'arrived';
  }) {
    this.socketClient.emitEvent('artisan:location_update', locationUpdate);
  }

  // Dispute Events
  subscribeToDisputes(userId: string, callback: (event: DisputeEvent) => void) {
    this.socketClient.emitEvent('subscribe:disputes', { userId });
    return this.socketClient.on('dispute:update', callback);
  }

  emitDisputeCreation(dispute: {
    jobId: string;
    type: 'payment' | 'quality' | 'completion' | 'behavior';
    description: string;
    evidence?: string[];
  }) {
    this.socketClient.emitEvent('dispute:create', dispute);
  }

  // Real-time Status Updates
  subscribeToArtisanStatus(artisanId: string, callback: (data: any) => void) {
    this.socketClient.emitEvent('subscribe:artisan_status', { artisanId });
    return this.socketClient.on('artisan:status_update', callback);
  }

  emitArtisanStatusUpdate(status: {
    availability: 'available' | 'busy' | 'offline';
    currentLocation?: {
      lat: number;
      lng: number;
    };
    activeJobs: number;
  }) {
    this.socketClient.emitEvent('artisan:status_update', status);
  }

  // Emergency Alerts
  subscribeToEmergencyAlerts(callback: (data: any) => void) {
    return this.socketClient.on('emergency:alert', callback);
  }

  emitEmergencyAlert(alert: {
    type: 'safety' | 'medical' | 'security';
    location: {
      lat: number;
      lng: number;
    };
    description: string;
    jobId?: string;
  }) {
    this.socketClient.emitEvent('emergency:alert', alert);
  }

  // Rating and Review Events
  subscribeToReviewUpdates(artisanId: string, callback: (data: any) => void) {
    this.socketClient.emitEvent('subscribe:reviews', { artisanId });
    return this.socketClient.on('review:update', callback);
  }

  emitReviewSubmission(review: {
    jobId: string;
    artisanId: string;
    rating: number;
    comment: string;
    categories: Record<string, number>;
  }) {
    this.socketClient.emitEvent('review:submit', review);
  }

  // Subscription Management
  unsubscribeFromJob(jobId: string) {
    this.socketClient.emitEvent('unsubscribe:job', { jobId });
  }

  unsubscribeFromRequest(requestId: string) {
    this.socketClient.emitEvent('unsubscribe:request', { requestId });
  }

  unsubscribeFromArtisan(artisanId: string) {
    this.socketClient.emitEvent('unsubscribe:artisan', { artisanId });
  }

  // Connection status
  isConnected(): boolean {
    return this.socketClient.isConnected();
  }
}

// Singleton instance
let artisanConnectSocketService: ArtisanConnectSocketService;

export const getArtisanConnectSocketService = (): ArtisanConnectSocketService => {
  if (!artisanConnectSocketService) {
    artisanConnectSocketService = new ArtisanConnectSocketService();
  }
  return artisanConnectSocketService;
};

export default ArtisanConnectSocketService;