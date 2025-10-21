interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

interface DeliveryAgent {
  id: string;
  name: string;
  rating: number;
  isOnline: boolean;
  currentLocation: Location;
  vehicle: {
    type: 'bike' | 'scooter' | 'car' | 'van';
    capacity: number; // in kg
  };
  preferences: {
    maxDeliveryDistance: number; // in km
    workingHours: {
      start: string;
      end: string;
    };
    deliveryAreas: string[];
  };
  currentOrders: number;
  maxConcurrentOrders: number;
  completionRate: number;
  avgDeliveryTime: number; // in minutes
}

interface DeliveryRequest {
  orderId: string;
  customerId: string;
  sellerId: string;
  pickupLocation: Location;
  deliveryLocation: Location;
  items: {
    id: string;
    name: string;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    fragile: boolean;
    perishable: boolean;
  }[];
  priority: 'standard' | 'express' | 'urgent';
  scheduledPickup?: Date;
  requestedDelivery?: Date;
  specialInstructions?: string;
  totalValue: number;
  paymentMethod: string;
}

interface DeliveryMatch {
  agent: DeliveryAgent;
  estimatedDistance: number;
  estimatedTime: number;
  deliveryCost: number;
  confidence: number; // 0-100
  route: {
    pickupTime: Date;
    deliveryTime: Date;
    totalDistance: number;
    estimatedDuration: number;
  };
}

interface DeliveryPricing {
  baseFee: number;
  distanceFee: number; // per km
  timeFee: number; // per minute
  priorityMultiplier: {
    standard: 1;
    express: 1.5;
    urgent: 2;
  };
  vehicleMultiplier: {
    bike: 0.8;
    scooter: 1;
    car: 1.2;
    van: 1.5;
  };
}

export class DeliveryMatchingService {
  private static instance: DeliveryMatchingService;
  private apiBaseUrl: string;
  private pricing: DeliveryPricing;

  private constructor() {
    this.apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    this.pricing = {
      baseFee: 3.99,
      distanceFee: 0.5,
      timeFee: 0.1,
      priorityMultiplier: {
        standard: 1,
        express: 1.5,
        urgent: 2,
      },
      vehicleMultiplier: {
        bike: 0.8,
        scooter: 1,
        car: 1.2,
        van: 1.5,
      }
    };
  }

  static getInstance(): DeliveryMatchingService {
    if (!DeliveryMatchingService.instance) {
      DeliveryMatchingService.instance = new DeliveryMatchingService();
    }
    return DeliveryMatchingService.instance;
  }

  /**
   * Calculate distance between two locations using Haversine formula
   */
  private calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degreesToRadians(loc2.latitude - loc1.latitude);
    const dLon = this.degreesToRadians(loc2.longitude - loc1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(loc1.latitude)) * 
      Math.cos(this.degreesToRadians(loc2.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate delivery cost based on distance, time, priority, and vehicle type
   */
  private calculateDeliveryCost(
    distance: number,
    estimatedTime: number,
    priority: DeliveryRequest['priority'],
    vehicleType: DeliveryAgent['vehicle']['type']
  ): number {
    const baseCost = this.pricing.baseFee;
    const distanceCost = distance * this.pricing.distanceFee;
    const timeCost = estimatedTime * this.pricing.timeFee;
    const priorityMultiplier = this.pricing.priorityMultiplier[priority];
    const vehicleMultiplier = this.pricing.vehicleMultiplier[vehicleType];

    return (baseCost + distanceCost + timeCost) * priorityMultiplier * vehicleMultiplier;
  }

  /**
   * Estimate delivery time based on distance and vehicle type
   */
  private estimateDeliveryTime(distance: number, vehicleType: DeliveryAgent['vehicle']['type']): number {
    const speedMap = {
      bike: 15, // km/h
      scooter: 25,
      car: 30,
      van: 25
    };

    const speed = speedMap[vehicleType];
    const timeInHours = distance / speed;
    const timeInMinutes = timeInHours * 60;
    
    // Add buffer time for traffic and stops
    const bufferTime = Math.max(5, timeInMinutes * 0.2);
    
    return Math.round(timeInMinutes + bufferTime);
  }

  /**
   * Check if agent is available for delivery
   */
  private isAgentAvailable(agent: DeliveryAgent, request: DeliveryRequest): boolean {
    // Check if agent is online
    if (!agent.isOnline) return false;

    // Check if agent has capacity
    if (agent.currentOrders >= agent.maxConcurrentOrders) return false;

    // Check if total weight exceeds vehicle capacity
    const totalWeight = request.items.reduce((sum, item) => sum + item.weight, 0);
    if (totalWeight > agent.vehicle.capacity) return false;

    // Check if delivery location is within agent's preferred areas
    const deliveryCity = request.deliveryLocation.city.toLowerCase();
    const hasAreaMatch = agent.preferences.deliveryAreas.some(area => 
      deliveryCity.includes(area.toLowerCase()) || area.toLowerCase().includes(deliveryCity)
    );
    if (!hasAreaMatch) return false;

    // Check distance constraint
    const distanceToPickup = this.calculateDistance(agent.currentLocation, request.pickupLocation);
    if (distanceToPickup > agent.preferences.maxDeliveryDistance) return false;

    // Check working hours
    const now = new Date();
    const currentHour = now.getHours();
    const startHour = parseInt(agent.preferences.workingHours.start.split(':')[0]);
    const endHour = parseInt(agent.preferences.workingHours.end.split(':')[0]);
    
    if (currentHour < startHour || currentHour >= endHour) return false;

    return true;
  }

  /**
   * Calculate confidence score for agent-request match
   */
  private calculateConfidence(agent: DeliveryAgent, request: DeliveryRequest, distance: number): number {
    let confidence = 100;

    // Distance factor (closer is better)
    const distancePenalty = Math.min(distance * 2, 30);
    confidence -= distancePenalty;

    // Agent rating factor
    const ratingBonus = (agent.rating - 3) * 10; // 3-5 star range
    confidence += ratingBonus;

    // Completion rate factor
    const completionBonus = (agent.completionRate - 80) * 0.5;
    confidence += completionBonus;

    // Current load factor (less busy is better)
    const loadPenalty = (agent.currentOrders / agent.maxConcurrentOrders) * 20;
    confidence -= loadPenalty;

    // Vehicle suitability for items
    const hasFragileItems = request.items.some(item => item.fragile);
    const hasPerishableItems = request.items.some(item => item.perishable);
    
    if (hasFragileItems && ['car', 'van'].includes(agent.vehicle.type)) {
      confidence += 10;
    }
    
    if (hasPerishableItems && ['bike', 'scooter'].includes(agent.vehicle.type)) {
      confidence += 5; // Faster for perishable items
    }

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Get available delivery agents from API
   */
  private async getAvailableAgents(): Promise<DeliveryAgent[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/delivery/agents/available`);
      if (!response.ok) {
        throw new Error('Failed to fetch available agents');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching available agents:', error);
      // Return mock data for development
      return this.getMockAgents();
    }
  }

  /**
   * Mock data for development/testing
   */
  private getMockAgents(): DeliveryAgent[] {
    return [
      {
        id: '1',
        name: 'John Doe',
        rating: 4.8,
        isOnline: true,
        currentLocation: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001'
        },
        vehicle: { type: 'bike', capacity: 15 },
        preferences: {
          maxDeliveryDistance: 10,
          workingHours: { start: '08:00', end: '20:00' },
          deliveryAreas: ['Manhattan', 'Brooklyn']
        },
        currentOrders: 1,
        maxConcurrentOrders: 3,
        completionRate: 95,
        avgDeliveryTime: 25
      },
      {
        id: '2',
        name: 'Sarah Wilson',
        rating: 4.9,
        isOnline: true,
        currentLocation: {
          latitude: 40.7589,
          longitude: -73.9851,
          address: '456 Park Ave',
          city: 'New York',
          state: 'NY',
          postalCode: '10022'
        },
        vehicle: { type: 'car', capacity: 50 },
        preferences: {
          maxDeliveryDistance: 15,
          workingHours: { start: '09:00', end: '22:00' },
          deliveryAreas: ['Manhattan', 'Queens', 'Brooklyn']
        },
        currentOrders: 0,
        maxConcurrentOrders: 4,
        completionRate: 98,
        avgDeliveryTime: 30
      }
    ];
  }

  /**
   * Find best delivery matches for a request
   */
  async findDeliveryMatches(request: DeliveryRequest): Promise<DeliveryMatch[]> {
    try {
      // Get available agents
      const agents = await this.getAvailableAgents();
      
      // Filter available agents
      const availableAgents = agents.filter(agent => this.isAgentAvailable(agent, request));
      
      if (availableAgents.length === 0) {
        throw new Error('No available delivery agents found for this location and time');
      }

      // Calculate matches for each available agent
      const matches: DeliveryMatch[] = [];

      for (const agent of availableAgents) {
        const distanceToPickup = this.calculateDistance(agent.currentLocation, request.pickupLocation);
        const deliveryDistance = this.calculateDistance(request.pickupLocation, request.deliveryLocation);
        const totalDistance = distanceToPickup + deliveryDistance;
        
        const estimatedTime = this.estimateDeliveryTime(deliveryDistance, agent.vehicle.type);
        const deliveryCost = this.calculateDeliveryCost(
          totalDistance,
          estimatedTime,
          request.priority,
          agent.vehicle.type
        );
        
        const confidence = this.calculateConfidence(agent, request, distanceToPickup);

        // Calculate pickup and delivery times
        const now = new Date();
        const travelTimeToPickup = this.estimateDeliveryTime(distanceToPickup, agent.vehicle.type);
        const pickupTime = new Date(now.getTime() + travelTimeToPickup * 60000);
        const deliveryTime = new Date(pickupTime.getTime() + estimatedTime * 60000);

        matches.push({
          agent,
          estimatedDistance: totalDistance,
          estimatedTime,
          deliveryCost,
          confidence,
          route: {
            pickupTime,
            deliveryTime,
            totalDistance,
            estimatedDuration: travelTimeToPickup + estimatedTime
          }
        });
      }

      // Sort by confidence score (highest first)
      matches.sort((a, b) => b.confidence - a.confidence);
      
      return matches.slice(0, 5); // Return top 5 matches
      
    } catch (error) {
      console.error('Error finding delivery matches:', error);
      throw error;
    }
  }

  /**
   * Assign delivery to the best available agent
   */
  async assignDelivery(request: DeliveryRequest): Promise<{
    success: boolean;
    assignedAgent?: DeliveryAgent;
    trackingId?: string;
    estimatedDelivery?: Date;
    deliveryCost?: number;
    error?: string;
  }> {
    try {
      const matches = await this.findDeliveryMatches(request);
      
      if (matches.length === 0) {
        return {
          success: false,
          error: 'No available delivery agents found'
        };
      }

      // Select the best match (highest confidence)
      const bestMatch = matches[0];
      
      // Create delivery assignment
      const assignmentData = {
        orderId: request.orderId,
        agentId: bestMatch.agent.id,
        pickupLocation: request.pickupLocation,
        deliveryLocation: request.deliveryLocation,
        items: request.items,
        priority: request.priority,
        estimatedPickup: bestMatch.route.pickupTime,
        estimatedDelivery: bestMatch.route.deliveryTime,
        deliveryCost: bestMatch.deliveryCost,
        specialInstructions: request.specialInstructions
      };

      // Send assignment to backend
      const response = await fetch(`${this.apiBaseUrl}/api/delivery/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData)
      });

      if (!response.ok) {
        throw new Error('Failed to assign delivery');
      }

      const result = await response.json();
      
      return {
        success: true,
        assignedAgent: bestMatch.agent,
        trackingId: result.trackingId,
        estimatedDelivery: bestMatch.route.deliveryTime,
        deliveryCost: bestMatch.deliveryCost
      };
      
    } catch (error) {
      console.error('Error assigning delivery:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get delivery cost estimate without assignment
   */
  async getDeliveryEstimate(
    pickupLocation: Location,
    deliveryLocation: Location,
    items: DeliveryRequest['items'],
    priority: DeliveryRequest['priority'] = 'standard'
  ): Promise<{
    estimatedCost: number;
    estimatedTime: number;
    availableAgents: number;
  }> {
    try {
      const agents = await this.getAvailableAgents();
      const mockRequest: DeliveryRequest = {
        orderId: 'estimate',
        customerId: 'estimate',
        sellerId: 'estimate',
        pickupLocation,
        deliveryLocation,
        items,
        priority,
        totalValue: 0,
        paymentMethod: 'card'
      };

      const availableAgents = agents.filter(agent => this.isAgentAvailable(agent, mockRequest));
      
      if (availableAgents.length === 0) {
        throw new Error('No available agents for this delivery');
      }

      // Calculate average estimates from available agents
      const estimates = availableAgents.map(agent => {
        const distance = this.calculateDistance(pickupLocation, deliveryLocation);
        const time = this.estimateDeliveryTime(distance, agent.vehicle.type);
        const cost = this.calculateDeliveryCost(distance, time, priority, agent.vehicle.type);
        
        return { cost, time };
      });

      const avgCost = estimates.reduce((sum, est) => sum + est.cost, 0) / estimates.length;
      const avgTime = estimates.reduce((sum, est) => sum + est.time, 0) / estimates.length;

      return {
        estimatedCost: Math.round(avgCost * 100) / 100,
        estimatedTime: Math.round(avgTime),
        availableAgents: availableAgents.length
      };
      
    } catch (error) {
      console.error('Error getting delivery estimate:', error);
      throw error;
    }
  }

  /**
   * Track delivery status
   */
  async trackDelivery(trackingId: string): Promise<{
    status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
    agent: DeliveryAgent;
    currentLocation?: Location;
    estimatedArrival?: Date;
    deliveryHistory: Array<{
      timestamp: Date;
      status: string;
      location?: Location;
      notes?: string;
    }>;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/delivery/track/${trackingId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch delivery status');
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('Error tracking delivery:', error);
      throw error;
    }
  }
}