import { apiClient } from '@/lib/apiClient';
import { DeliveryAgent, Shipment } from '@/types/delivery';

export interface DeliveryAssignment {
  id: string;
  shipmentId: string;
  agentId: string;
  score: number;
  estimatedPickupTime: string;
  estimatedDeliveryTime: string;
  distance: number;
  confidence: number;
  factors: AssignmentFactor[];
  status: 'pending' | 'accepted' | 'declined' | 'assigned' | 'expired';
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  declinedAt?: string;
  reason?: string;
}

export interface AssignmentFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface AssignmentSettings {
  algorithm: 'distance_first' | 'capacity_first' | 'balanced' | 'priority_first';
  maxAssignmentDistance: number;
  considerTraffic: boolean;
  requireVehicleMatch: boolean;
  prioritizeRating: boolean;
  autoAssign: boolean;
  assignmentTimeout: number;
  maxSimultaneousOffers: number;
  minAgentRating: number;
  weightFactors: {
    distance: number;
    capacity: number;
    vehicleMatch: number;
    rating: number;
    availability: number;
    successRate: number;
  };
}

export interface AgentRecommendation {
  agent: DeliveryAgent;
  score: number;
  distance: number;
  estimatedTime: number;
  capacityMatch: number;
  factors: AssignmentFactor[];
  isRecommended: boolean;
  rank: number;
  confidence: number;
}

export interface AssignmentRequest {
  shipmentId: string;
  agentId?: string; // If not provided, will auto-assign to best agent
  settings?: Partial<AssignmentSettings>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  requiredBy?: string; // ISO timestamp
  notes?: string;
}

export interface AssignmentResponse {
  success: boolean;
  assignment?: DeliveryAssignment;
  recommendations?: AgentRecommendation[];
  message?: string;
  error?: string;
}

export interface BulkAssignmentRequest {
  shipmentIds: string[];
  settings?: Partial<AssignmentSettings>;
  maxConcurrency?: number;
}

export interface BulkAssignmentResponse {
  success: boolean;
  assignments: DeliveryAssignment[];
  failed: Array<{
    shipmentId: string;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    avgScore: number;
    avgDistance: number;
  };
}

export interface AssignmentAnalytics {
  timeframe: {
    start: string;
    end: string;
  };
  metrics: {
    totalAssignments: number;
    successfulAssignments: number;
    failedAssignments: number;
    avgAssignmentTime: number; // seconds
    avgAcceptanceTime: number; // seconds
    acceptanceRate: number; // percentage
    avgScore: number;
    avgDistance: number;
  };
  breakdown: {
    byAlgorithm: Array<{
      algorithm: string;
      assignments: number;
      successRate: number;
      avgScore: number;
    }>;
    byAgent: Array<{
      agentId: string;
      agentName: string;
      assignments: number;
      acceptanceRate: number;
      avgScore: number;
      avgDistance: number;
    }>;
    byShipmentType: Array<{
      deliveryType: string;
      assignments: number;
      avgScore: number;
      avgDistance: number;
    }>;
    byTimeOfDay: Array<{
      hour: number;
      assignments: number;
      avgScore: number;
      acceptanceRate: number;
    }>;
  };
}

class SmartAssignmentService {
  // Get agent recommendations for a shipment
  async getAgentRecommendations(
    shipmentId: string, 
    settings?: Partial<AssignmentSettings>
  ): Promise<{
    success: boolean;
    recommendations?: AgentRecommendation[];
    error?: string;
  }> {
    try {
      const response = await apiClient.post('/delivery/smart-assignment/recommendations', {
        shipmentId,
        settings
      });
      return response.data;
    } catch (error) {
      console.error('Error getting agent recommendations:', error);
      throw new Error('Failed to get agent recommendations');
    }
  }

  // Create assignment (manual or auto)
  async createAssignment(request: AssignmentRequest): Promise<AssignmentResponse> {
    try {
      const response = await apiClient.post('/delivery/smart-assignment/assign', request);
      return response.data;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw new Error('Failed to create assignment');
    }
  }

  // Bulk assignment for multiple shipments
  async bulkAssign(request: BulkAssignmentRequest): Promise<BulkAssignmentResponse> {
    try {
      const response = await apiClient.post('/delivery/smart-assignment/bulk-assign', request);
      return response.data;
    } catch (error) {
      console.error('Error with bulk assignment:', error);
      throw new Error('Failed to perform bulk assignment');
    }
  }

  // Agent accepts assignment
  async acceptAssignment(assignmentId: string, notes?: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await apiClient.post(`/delivery/smart-assignment/${assignmentId}/accept`, {
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error accepting assignment:', error);
      throw new Error('Failed to accept assignment');
    }
  }

  // Agent declines assignment
  async declineAssignment(
    assignmentId: string, 
    reason: string, 
    notes?: string
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await apiClient.post(`/delivery/smart-assignment/${assignmentId}/decline`, {
        reason,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error declining assignment:', error);
      throw new Error('Failed to decline assignment');
    }
  }

  // Get pending assignments for an agent
  async getAgentAssignments(
    agentId: string,
    status?: 'pending' | 'accepted' | 'declined' | 'expired'
  ): Promise<{
    success: boolean;
    assignments?: DeliveryAssignment[];
    error?: string;
  }> {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get(`/delivery/smart-assignment/agent/${agentId}`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error getting agent assignments:', error);
      throw new Error('Failed to get agent assignments');
    }
  }

  // Get assignment by ID
  async getAssignment(assignmentId: string): Promise<{
    success: boolean;
    assignment?: DeliveryAssignment;
    error?: string;
  }> {
    try {
      const response = await apiClient.get(`/delivery/smart-assignment/${assignmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting assignment:', error);
      throw new Error('Failed to get assignment');
    }
  }

  // Cancel assignment
  async cancelAssignment(assignmentId: string, reason: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await apiClient.post(`/delivery/smart-assignment/${assignmentId}/cancel`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling assignment:', error);
      throw new Error('Failed to cancel assignment');
    }
  }

  // Get unassigned shipments
  async getUnassignedShipments(filters?: {
    deliveryType?: string;
    priority?: string;
    zone?: string;
    maxAge?: number; // hours
  }): Promise<{
    success: boolean;
    shipments?: Shipment[];
    error?: string;
  }> {
    try {
      const response = await apiClient.get('/delivery/smart-assignment/unassigned', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error getting unassigned shipments:', error);
      throw new Error('Failed to get unassigned shipments');
    }
  }

  // Get available agents
  async getAvailableAgents(filters?: {
    vehicleType?: string;
    maxDistance?: number;
    minRating?: number;
    zone?: string;
  }): Promise<{
    success: boolean;
    agents?: DeliveryAgent[];
    error?: string;
  }> {
    try {
      const response = await apiClient.get('/delivery/smart-assignment/available-agents', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error getting available agents:', error);
      throw new Error('Failed to get available agents');
    }
  }

  // Get assignment settings
  async getSettings(): Promise<{
    success: boolean;
    settings?: AssignmentSettings;
    error?: string;
  }> {
    try {
      const response = await apiClient.get('/delivery/smart-assignment/settings');
      return response.data;
    } catch (error) {
      console.error('Error getting assignment settings:', error);
      throw new Error('Failed to get assignment settings');
    }
  }

  // Update assignment settings
  async updateSettings(settings: Partial<AssignmentSettings>): Promise<{
    success: boolean;
    settings?: AssignmentSettings;
    error?: string;
  }> {
    try {
      const response = await apiClient.put('/delivery/smart-assignment/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating assignment settings:', error);
      throw new Error('Failed to update assignment settings');
    }
  }

  // Get assignment analytics
  async getAnalytics(
    startDate: string,
    endDate: string,
    filters?: {
      agentId?: string;
      algorithm?: string;
      deliveryType?: string;
    }
  ): Promise<{
    success: boolean;
    analytics?: AssignmentAnalytics;
    error?: string;
  }> {
    try {
      const response = await apiClient.get('/delivery/smart-assignment/analytics', {
        params: {
          startDate,
          endDate,
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting assignment analytics:', error);
      throw new Error('Failed to get assignment analytics');
    }
  }

  // Test assignment algorithm
  async testAssignment(
    shipmentId: string,
    settings: AssignmentSettings
  ): Promise<{
    success: boolean;
    recommendations?: AgentRecommendation[];
    simulation?: {
      scenarios: Array<{
        algorithm: string;
        topAgent: AgentRecommendation;
        avgScore: number;
        expectedOutcome: string;
      }>;
    };
    error?: string;
  }> {
    try {
      const response = await apiClient.post('/delivery/smart-assignment/test', {
        shipmentId,
        settings
      });
      return response.data;
    } catch (error) {
      console.error('Error testing assignment:', error);
      throw new Error('Failed to test assignment');
    }
  }

  // Get assignment history for a shipment
  async getShipmentAssignmentHistory(shipmentId: string): Promise<{
    success: boolean;
    assignments?: DeliveryAssignment[];
    error?: string;
  }> {
    try {
      const response = await apiClient.get(`/delivery/smart-assignment/shipment/${shipmentId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error getting assignment history:', error);
      throw new Error('Failed to get assignment history');
    }
  }

  // Real-time assignment monitoring (WebSocket connection)
  connectToAssignmentUpdates(
    callback: (update: {
      type: 'assignment_created' | 'assignment_accepted' | 'assignment_declined' | 'assignment_expired';
      assignment: DeliveryAssignment;
      timestamp: string;
    }) => void
  ): {
    disconnect: () => void;
  } {
    // Mock WebSocket connection for now
    const mockUpdates = [
      'assignment_created',
      'assignment_accepted', 
      'assignment_declined',
      'assignment_expired'
    ];

    const interval = setInterval(() => {
      // Simulate random assignment update
      if (Math.random() < 0.1) { // 10% chance every interval
        const updateType = mockUpdates[Math.floor(Math.random() * mockUpdates.length)];
        callback({
          type: updateType as any,
          assignment: {
            id: `assign-${Date.now()}`,
            shipmentId: `ship-${Date.now()}`,
            agentId: `agent-${Date.now()}`,
            score: Math.floor(Math.random() * 100),
            estimatedPickupTime: new Date().toISOString(),
            estimatedDeliveryTime: new Date().toISOString(),
            distance: Math.floor(Math.random() * 20),
            confidence: Math.random(),
            factors: [],
            status: 'pending',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 5*60000).toISOString()
          },
          timestamp: new Date().toISOString()
        });
      }
    }, 5000); // Check every 5 seconds

    return {
      disconnect: () => clearInterval(interval)
    };
  }

  // Utility methods
  calculateOptimalSettings(
    historicalData: {
      assignments: DeliveryAssignment[];
      timeframe: { start: string; end: string };
    }
  ): AssignmentSettings {
    // Analyze historical data to suggest optimal settings
    const { assignments } = historicalData;
    
    // Calculate success rates by algorithm
    const algorithmPerformance = assignments.reduce((acc, assignment) => {
      const alg = 'balanced'; // Would get from assignment data
      if (!acc[alg]) acc[alg] = { total: 0, successful: 0 };
      acc[alg].total++;
      if (assignment.status === 'accepted') acc[alg].successful++;
      return acc;
    }, {} as Record<string, { total: number; successful: number }>);

    // Find best performing algorithm
    const bestAlgorithm = Object.entries(algorithmPerformance)
      .sort(([,a], [,b]) => (b.successful/b.total) - (a.successful/a.total))[0]?.[0] || 'balanced';

    // Calculate optimal distance threshold
    const successfulAssignments = assignments.filter(a => a.status === 'accepted');
    const avgSuccessDistance = successfulAssignments.length > 0
      ? successfulAssignments.reduce((sum, a) => sum + a.distance, 0) / successfulAssignments.length
      : 10;

    return {
      algorithm: bestAlgorithm as any,
      maxAssignmentDistance: Math.ceil(avgSuccessDistance * 1.2), // 20% buffer
      considerTraffic: true,
      requireVehicleMatch: true,
      prioritizeRating: true,
      autoAssign: false,
      assignmentTimeout: 5,
      maxSimultaneousOffers: 3,
      minAgentRating: 4.0,
      weightFactors: {
        distance: 30,
        capacity: 20,
        vehicleMatch: 15,
        rating: 15,
        availability: 10,
        successRate: 10
      }
    };
  }

  // Format assignment for display
  formatAssignmentStatus(assignment: DeliveryAssignment): {
    statusText: string;
    color: string;
    icon: string;
    description: string;
  } {
    switch (assignment.status) {
      case 'pending':
        return {
          statusText: 'Pending Response',
          color: 'yellow',
          icon: 'clock',
          description: `Expires in ${Math.ceil((new Date(assignment.expiresAt).getTime() - Date.now()) / 60000)} minutes`
        };
      case 'accepted':
        return {
          statusText: 'Accepted',
          color: 'green',
          icon: 'check-circle',
          description: 'Agent has accepted the assignment'
        };
      case 'declined':
        return {
          statusText: 'Declined',
          color: 'red',
          icon: 'x-circle',
          description: assignment.reason || 'Agent declined the assignment'
        };
      case 'assigned':
        return {
          statusText: 'Assigned',
          color: 'blue',
          icon: 'user-check',
          description: 'Assignment completed successfully'
        };
      case 'expired':
        return {
          statusText: 'Expired',
          color: 'gray',
          icon: 'clock',
          description: 'Assignment offer has expired'
        };
      default:
        return {
          statusText: 'Unknown',
          color: 'gray',
          icon: 'help-circle',
          description: 'Unknown assignment status'
        };
    }
  }

  // Get assignment confidence level
  getAssignmentConfidence(score: number, factors: AssignmentFactor[]): {
    level: 'low' | 'medium' | 'high';
    description: string;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    
    if (score >= 80) {
      return {
        level: 'high',
        description: 'Excellent match with high probability of success',
        recommendations: ['Assign immediately', 'Expected quick acceptance']
      };
    } else if (score >= 60) {
      // Check specific factors for recommendations
      const lowFactors = factors.filter(f => f.score < 50);
      lowFactors.forEach(factor => {
        switch (factor.name.toLowerCase()) {
          case 'distance':
            recommendations.push('Consider agents closer to pickup location');
            break;
          case 'rating':
            recommendations.push('Agent has lower rating - monitor closely');
            break;
          case 'capacity':
            recommendations.push('Vehicle capacity is near limit');
            break;
        }
      });

      return {
        level: 'medium',
        description: 'Good match with moderate probability of success',
        recommendations: recommendations.length > 0 ? recommendations : ['Monitor assignment closely']
      };
    } else {
      return {
        level: 'low',
        description: 'Poor match with low probability of success',
        recommendations: [
          'Consider alternative agents',
          'Review assignment criteria',
          'May need manual intervention'
        ]
      };
    }
  }
}

export const smartAssignmentService = new SmartAssignmentService();
export default smartAssignmentService;
