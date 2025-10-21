import { apiClient } from '@/lib/apiClient';
import {
  DeliveryQuoteRequest,
  DeliveryQuoteResponse,
  ShipmentCreateRequest,
  ShipmentCreateResponse,
  Shipment,
  DeliveryStatusUpdate,
  AgentLocationUpdate,
  DeliveryAnalytics,
  DeliveryAgent,
  ShipmentStatus
} from '@/types/delivery';

class DeliveryApiService {
  // Get delivery quotes/rates
  async getDeliveryQuote(request: DeliveryQuoteRequest): Promise<DeliveryQuoteResponse> {
    try {
      const response = await apiClient.post('/delivery/quote', request);
      return response.data;
    } catch (error) {
      console.error('Error getting delivery quote:', error);
      throw new Error('Failed to get delivery rates');
    }
  }

  // Create shipment
  async createShipment(request: ShipmentCreateRequest): Promise<ShipmentCreateResponse> {
    try {
      const response = await apiClient.post('/delivery/shipments', request);
      return response.data;
    } catch (error) {
      console.error('Error creating shipment:', error);
      throw new Error('Failed to create shipment');
    }
  }

  // Get shipment tracking (for customers)
  async getShipmentTracking(shipmentId: string): Promise<{
    success: boolean;
    shipment?: Shipment;
    error?: string;
  }> {
    try {
      const response = await apiClient.get(`/delivery/shipments/${shipmentId}/track`);
      return response.data;
    } catch (error) {
      console.error('Error getting shipment tracking:', error);
      throw new Error('Failed to get tracking information');
    }
  }

  // Track by tracking number (public)
  async trackByNumber(trackingNumber: string): Promise<{
    success: boolean;
    shipment?: Shipment;
    error?: string;
  }> {
    try {
      const response = await apiClient.get(`/delivery/track/${trackingNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error tracking by number:', error);
      throw new Error('Failed to track shipment');
    }
  }

  // DELIVERY AGENT METHODS

  // Register as delivery agent
  async registerDeliveryAgent(agentData: {
    employeeId?: string;
    vehicleType: string;
    vehicleModel?: string;
    plateNumber?: string;
    capacityKg?: number;
    maxCapacity?: number;
  }): Promise<{
    success: boolean;
    agent?: DeliveryAgent;
    error?: string;
  }> {
    try {
      const response = await apiClient.post('/delivery/agent/register', agentData);
      return response.data;
    } catch (error) {
      console.error('Error registering delivery agent:', error);
      throw new Error('Failed to register as delivery agent');
    }
  }

  // Get agent profile
  async getAgentProfile(): Promise<{
    success: boolean;
    agent?: DeliveryAgent;
    error?: string;
  }> {
    try {
      const response = await apiClient.get('/delivery/agent/profile');
      return response.data;
    } catch (error) {
      console.error('Error getting agent profile:', error);
      throw new Error('Failed to get agent profile');
    }
  }

  // Toggle agent availability
  async toggleAgentAvailability(isOnline: boolean): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await apiClient.post('/delivery/agent/availability', { isOnline });
      return response.data;
    } catch (error) {
      console.error('Error toggling agent availability:', error);
      throw new Error('Failed to update availability');
    }
  }

  // Get agent's assigned deliveries
  async getAgentDeliveries(status?: ShipmentStatus): Promise<{
    success: boolean;
    shipments?: Shipment[];
    error?: string;
  }> {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get('/delivery/agent/deliveries', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting agent deliveries:', error);
      throw new Error('Failed to get assigned deliveries');
    }
  }

  // Update agent location (real-time tracking)
  async updateAgentLocation(location: {
    latitude: number;
    longitude: number;
  }): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await apiClient.post('/delivery/agent/location', location);
      return response.data;
    } catch (error) {
      console.error('Error updating agent location:', error);
      throw new Error('Failed to update location');
    }
  }

  // Update shipment status (delivery agents)
  async updateShipmentStatus(
    shipmentId: string,
    update: {
      status: ShipmentStatus;
      location?: {
        latitude: number;
        longitude: number;
      };
      notes?: string;
      proofOfDelivery?: {
        signature?: string;
        photo?: string;
        deliveredTo: string;
      };
      failedReason?: string;
      codCollected?: number;
    }
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await apiClient.patch(`/delivery/shipments/${shipmentId}/status`, update);
      return response.data;
    } catch (error) {
      console.error('Error updating shipment status:', error);
      throw new Error('Failed to update shipment status');
    }
  }

  // ADMIN METHODS

  // Get all shipments (admin)
  async getAllShipments(params?: {
    page?: number;
    limit?: number;
    status?: ShipmentStatus;
    partnerId?: string;
  }): Promise<{
    success: boolean;
    shipments?: Shipment[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    error?: string;
  }> {
    try {
      const response = await apiClient.get('/delivery/admin/shipments', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting all shipments:', error);
      throw new Error('Failed to get shipments');
    }
  }

  // Get delivery analytics (admin)
  async getDeliveryAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    success: boolean;
    analytics?: DeliveryAnalytics;
    error?: string;
  }> {
    try {
      const response = await apiClient.get('/delivery/admin/analytics', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting delivery analytics:', error);
      throw new Error('Failed to get delivery analytics');
    }
  }

  // UTILITY METHODS

  // Get estimated delivery time
  getEstimatedDeliveryTime(deliveryType: string): string {
    switch (deliveryType) {
      case 'SAME_DAY':
        return 'Today';
      case 'NEXT_DAY':
        return 'Tomorrow';
      case 'EXPRESS':
        return '1-2 business days';
      case 'STANDARD':
        return '2-3 business days';
      default:
        return '2-3 business days';
    }
  }

  // Format delivery status for display
  formatDeliveryStatus(status: ShipmentStatus): {
    label: string;
    color: string;
    description: string;
  } {
    const statusMap = {
      PENDING: {
        label: 'Pending',
        color: 'orange',
        description: 'Shipment is being prepared'
      },
      CONFIRMED: {
        label: 'Confirmed',
        color: 'blue',
        description: 'Shipment confirmed and ready for pickup'
      },
      PICKED_UP: {
        label: 'Picked Up',
        color: 'purple',
        description: 'Package has been picked up'
      },
      IN_TRANSIT: {
        label: 'In Transit',
        color: 'indigo',
        description: 'Package is on the way'
      },
      OUT_FOR_DELIVERY: {
        label: 'Out for Delivery',
        color: 'yellow',
        description: 'Package is out for delivery'
      },
      DELIVERED: {
        label: 'Delivered',
        color: 'green',
        description: 'Package has been delivered'
      },
      FAILED: {
        label: 'Failed',
        color: 'red',
        description: 'Delivery attempt failed'
      },
      RETURNING: {
        label: 'Returning',
        color: 'gray',
        description: 'Package is being returned'
      },
      RETURNED: {
        label: 'Returned',
        color: 'gray',
        description: 'Package has been returned'
      },
      CANCELLED: {
        label: 'Cancelled',
        color: 'red',
        description: 'Shipment has been cancelled'
      }
    };

    return statusMap[status] || statusMap.PENDING;
  }

  // Calculate delivery progress percentage
  getDeliveryProgress(status: ShipmentStatus): number {
    const progressMap = {
      PENDING: 10,
      CONFIRMED: 20,
      PICKED_UP: 40,
      IN_TRANSIT: 60,
      OUT_FOR_DELIVERY: 80,
      DELIVERED: 100,
      FAILED: 0,
      RETURNING: 50,
      RETURNED: 100,
      CANCELLED: 0
    };

    return progressMap[status] || 0;
  }

  // Get delivery type options
  getDeliveryTypeOptions(): Array<{
    value: string;
    label: string;
    description: string;
    estimatedTime: string;
  }> {
    return [
      {
        value: 'STANDARD',
        label: 'Standard Delivery',
        description: 'Regular delivery within 2-3 business days',
        estimatedTime: '2-3 days'
      },
      {
        value: 'EXPRESS',
        label: 'Express Delivery',
        description: 'Faster delivery within 1-2 business days',
        estimatedTime: '1-2 days'
      },
      {
        value: 'NEXT_DAY',
        label: 'Next Day Delivery',
        description: 'Delivery by next business day',
        estimatedTime: '1 day'
      },
      {
        value: 'SAME_DAY',
        label: 'Same Day Delivery',
        description: 'Delivery within the same day (Lagos only)',
        estimatedTime: '4-8 hours'
      }
    ];
  }

  // Get vehicle type options for agents
  getVehicleTypeOptions(): Array<{
    value: string;
    label: string;
    capacity: string;
    icon: string;
  }> {
    return [
      {
        value: 'BIKE',
        label: 'Motorcycle',
        capacity: 'Up to 20kg',
        icon: '🏍️'
      },
      {
        value: 'CAR',
        label: 'Car',
        capacity: 'Up to 50kg',
        icon: '🚗'
      },
      {
        value: 'VAN',
        label: 'Van',
        capacity: 'Up to 200kg',
        icon: '🚐'
      },
      {
        value: 'TRUCK',
        label: 'Truck',
        capacity: 'Up to 1000kg',
        icon: '🚛'
      }
    ];
  }

  // Start location tracking for agents
  startLocationTracking(options?: {
    interval?: number; // in milliseconds, default 30 seconds
    enableHighAccuracy?: boolean;
  }): {
    start: () => void;
    stop: () => void;
    isTracking: () => boolean;
  } {
    let watchId: number | null = null;
    let trackingInterval: NodeJS.Timeout | null = null;
    const interval = options?.interval || 30000; // 30 seconds default

    const start = () => {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const updateLocation = (position: GeolocationPosition) => {
        this.updateAgentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }).catch(error => {
          console.error('Failed to update location:', error);
        });
      };

      const handleError = (error: GeolocationPositionError) => {
        console.error('Geolocation error:', error);
      };

      // Start continuous tracking
      watchId = navigator.geolocation.watchPosition(
        updateLocation,
        handleError,
        {
          enableHighAccuracy: options?.enableHighAccuracy ?? true,
          timeout: 10000,
          maximumAge: 60000
        }
      );

      // Also update at regular intervals
      trackingInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(updateLocation, handleError);
      }, interval);
    };

    const stop = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
      }
    };

    const isTracking = () => {
      return watchId !== null;
    };

    return { start, stop, isTracking };
  }
}

export const deliveryApiService = new DeliveryApiService();
export default deliveryApiService;
