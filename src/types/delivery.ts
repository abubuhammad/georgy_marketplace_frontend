// Delivery & Logistics Types for Georgy Marketplace

export type ShippingOption = 
  | 'STANDARD'
  | 'EXPRESS' 
  | 'SCHEDULED'
  | 'SAME_DAY'
  | 'NEXT_DAY';

export type ShipmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURNING'
  | 'RETURNED'
  | 'CANCELLED';

export type VehicleType = 
  | 'BIKE'
  | 'VAN'
  | 'TRUCK'
  | 'CAR';

export type DeliveryEventType =
  | 'ORDER_CREATED'
  | 'SHIPMENT_CREATED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERY_ATTEMPTED'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURNED'
  | 'CANCELLED';

export interface DeliveryPartner {
  id: string;
  name: string;
  code: string; // 'GIGL', 'DHL_NG', 'KWIK', 'SENDBOX'
  supportsCOD: boolean;
  supportsScheduled: boolean;
  supportsTracking: boolean;
  trackingUrl?: string;
  callbackUrl?: string;
  apiKey?: string;
  active: boolean;
  coverage: string[]; // States/cities covered
  pricing: DeliveryPricing;
  features: DeliveryFeatures;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryPricing {
  baseFee: number;
  feePerKm: number;
  weightMultiplier: number;
  expressMultiplier: number;
  scheduledFee: number;
  codFee: number;
  currency: string;
}

export interface DeliveryFeatures {
  realTimeTracking: boolean;
  proofOfDelivery: boolean;
  signatureCapture: boolean;
  photoEvidence: boolean;
  smsNotifications: boolean;
  callNotifications: boolean;
  packageInsurance: boolean;
  fragileHandling: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  partnerId?: string;
  geoJson: GeoJSONPolygon;
  baseFee: number;
  feePerKm?: number;
  etaMinutes?: number;
  maxWeight?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GeoJSONPolygon {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
}

export interface Shipment {
  id: string;
  orderId: string;
  trackingNumber?: string;
  partnerId?: string;
  partner?: DeliveryPartner;
  agentId?: string;
  agent?: DeliveryAgent;
  status: ShipmentStatus;
  deliveryType: ShippingOption;
  
  // Addresses
  pickupAddress: DeliveryAddress;
  deliveryAddress: DeliveryAddress;
  
  // Package details
  weight?: number;
  dimensions?: PackageDimensions;
  fragile: boolean;
  packageValue: number;
  description: string;
  
  // Delivery details
  fee: number;
  codAmount?: number;
  estimatedPickup?: string;
  estimatedDelivery?: string;
  actualPickup?: string;
  actualDelivery?: string;
  scheduledAt?: string;
  
  // Status tracking
  instructions?: string;
  failedReason?: string;
  returnReason?: string;
  proofOfDelivery?: ProofOfDelivery;
  
  // Events and tracking
  events: TrackingEvent[];
  currentLocation?: GeoLocation;
  
  // Metadata
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAddress {
  id?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  instructions?: string;
}

export interface PackageDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'inch';
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  eventType: DeliveryEventType;
  eventCode: string;
  description: string;
  location?: GeoLocation;
  city?: string;
  state?: string;
  country?: string;
  agentId?: string;
  agentName?: string;
  metadata?: Record<string, any>;
  recordedAt: string;
  createdAt: string;
}

export interface ProofOfDelivery {
  deliveredTo: string;
  deliveredAt: string;
  signature?: string; // Base64 image
  photo?: string; // Base64 image
  notes?: string;
  verificationCode?: string;
}

export interface DeliveryAgent {
  id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleType: VehicleType;
  vehicleModel?: string;
  plateNumber?: string;
  capacityKg?: number;
  active: boolean;
  verified: boolean;
  currentLocation?: GeoLocation;
  lastOnline?: string;
  rating: number;
  totalDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  availability: AgentAvailability;
  createdAt: string;
  updatedAt: string;
}

export interface AgentAvailability {
  isOnline: boolean;
  workingHours: {
    [day: string]: {
      start: string;
      end: string;
      available: boolean;
    };
  };
  currentCapacity: number;
  maxCapacity: number;
}

export interface DeliveryRate {
  partnerId?: string;
  partnerName: string;
  deliveryType: ShippingOption;
  fee: number;
  currency: string;
  estimatedDays: number;
  estimatedHours: number;
  features: string[];
  available: boolean;
  codSupported: boolean;
  message?: string;
}

export interface DeliveryQuoteRequest {
  pickupAddress: DeliveryAddress;
  deliveryAddress: DeliveryAddress;
  weight?: number;
  dimensions?: PackageDimensions;
  packageValue: number;
  deliveryType?: ShippingOption;
  scheduledDate?: string;
  fragile?: boolean;
  cod?: boolean;
}

export interface DeliveryQuoteResponse {
  rates: DeliveryRate[];
  zones: {
    pickup: string;
    delivery: string;
  };
  distance?: number;
  duration?: number;
  success: boolean;
  error?: string;
}

export interface ShipmentCreateRequest {
  orderId: string;
  partnerId?: string;
  deliveryType: ShippingOption;
  pickupAddress: DeliveryAddress;
  deliveryAddress: DeliveryAddress;
  weight?: number;
  dimensions?: PackageDimensions;
  fragile: boolean;
  packageValue: number;
  description: string;
  codAmount?: number;
  scheduledAt?: string;
  instructions?: string;
  metadata?: Record<string, any>;
}

export interface ShipmentCreateResponse {
  success: boolean;
  shipment?: Shipment;
  trackingNumber?: string;
  estimatedDelivery?: string;
  labelUrl?: string;
  error?: string;
}

// Carrier Integration Types
export interface CarrierAdapter {
  createShipment(request: CarrierShipmentRequest): Promise<CarrierShipmentResponse>;
  cancelShipment(trackingNumber: string): Promise<CarrierCancelResponse>;
  getTracking(trackingNumber: string): Promise<CarrierTrackingResponse>;
  getRate(request: CarrierRateRequest): Promise<CarrierRateResponse>;
  validateAddress(address: DeliveryAddress): Promise<CarrierAddressValidation>;
}

export interface CarrierShipmentRequest {
  reference: string;
  pickup: DeliveryAddress;
  delivery: DeliveryAddress;
  package: {
    weight: number;
    dimensions?: PackageDimensions;
    value: number;
    description: string;
    fragile: boolean;
  };
  service: ShippingOption;
  cod?: {
    amount: number;
    currency: string;
  };
  scheduled?: string;
  instructions?: string;
}

export interface CarrierShipmentResponse {
  success: boolean;
  trackingNumber?: string;
  labelUrl?: string;
  estimatedDelivery?: string;
  cost?: number;
  error?: string;
  carrierData?: any;
}

export interface CarrierTrackingResponse {
  success: boolean;
  status: ShipmentStatus;
  events: CarrierTrackingEvent[];
  currentLocation?: GeoLocation;
  estimatedDelivery?: string;
  error?: string;
}

export interface CarrierTrackingEvent {
  code: string;
  description: string;
  location?: string;
  timestamp: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface CarrierRateRequest {
  pickup: DeliveryAddress;
  delivery: DeliveryAddress;
  weight: number;
  dimensions?: PackageDimensions;
  value: number;
  service: ShippingOption;
  cod: boolean;
}

export interface CarrierRateResponse {
  success: boolean;
  rate?: number;
  currency?: string;
  estimatedDays?: number;
  available?: boolean;
  error?: string;
}

export interface CarrierCancelResponse {
  success: boolean;
  refund?: number;
  error?: string;
}

export interface CarrierAddressValidation {
  valid: boolean;
  corrected?: DeliveryAddress;
  suggestions?: DeliveryAddress[];
  error?: string;
}

// COD and Reconciliation Types
export interface CODCollection {
  id: string;
  shipmentId: string;
  agentId: string;
  amount: number;
  currency: string;
  collectedAt: string;
  verificationCode?: string;
  evidencePhoto?: string;
  customerSignature?: string;
  notes?: string;
  reconciled: boolean;
  reconciledAt?: string;
  discrepancy?: number;
  createdAt: string;
}

export interface CODReconciliation {
  id: string;
  batchId: string;
  agentId: string;
  totalExpected: number;
  totalCollected: number;
  totalDiscrepancy: number;
  collections: CODCollection[];
  status: 'pending' | 'reconciled' | 'disputed';
  processedAt?: string;
  processedBy?: string;
  notes?: string;
  createdAt: string;
}

// Delivery Analytics Types
export interface DeliveryAnalytics {
  period: {
    start: string;
    end: string;
  };
  metrics: {
    totalShipments: number;
    deliveredShipments: number;
    failedShipments: number;
    deliveryRate: number;
    averageDeliveryTime: number;
    totalRevenue: number;
    totalCOD: number;
    averageRating: number;
  };
  breakdown: {
    byPartner: Array<{
      partnerId: string;
      partnerName: string;
      shipments: number;
      deliveryRate: number;
      revenue: number;
    }>;
    byZone: Array<{
      zoneName: string;
      shipments: number;
      deliveryRate: number;
      averageTime: number;
    }>;
    byStatus: Array<{
      status: ShipmentStatus;
      count: number;
      percentage: number;
    }>;
  };
}

// Webhook and Real-time Types
export interface DeliveryWebhookPayload {
  event: string;
  shipmentId?: string;
  trackingNumber?: string;
  status?: ShipmentStatus;
  location?: GeoLocation;
  timestamp: string;
  carrier?: string;
  data?: any;
}

export interface DeliveryNotification {
  type: 'delivery_status_update' | 'delivery_failed' | 'cod_collected' | 'agent_assigned';
  shipmentId: string;
  orderId: string;
  userId: string;
  title: string;
  message: string;
  data?: any;
  timestamp: string;
}

// Error Types
export interface DeliveryError {
  code: string;
  message: string;
  details?: any;
  shipmentId?: string;
  partnerId?: string;
}

// Route Optimization Types
export interface RouteOptimizationRequest {
  agentId: string;
  shipments: string[];
  constraints?: {
    maxDistance?: number;
    maxTime?: number;
    vehicleCapacity?: number;
  };
}

export interface RouteOptimizationResponse {
  success: boolean;
  route?: {
    stops: RouteStop[];
    totalDistance: number;
    totalTime: number;
    efficiency: number;
  };
  error?: string;
}

export interface RouteStop {
  shipmentId: string;
  address: DeliveryAddress;
  type: 'pickup' | 'delivery';
  estimatedArrival: string;
  estimatedDuration: number;
  sequence: number;
}
