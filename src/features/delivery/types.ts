// Delivery & Logistics Platform Types

export type DeliveryStatus = 'pending_pickup' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed_attempt' | 'returned' | 'cancelled';
export type DeliveryType = 'standard' | 'express' | 'same_day' | 'scheduled' | 'overnight';
export type DeliveryPriority = 'low' | 'normal' | 'high' | 'urgent';
export type VehicleType = 'bike' | 'car' | 'van' | 'truck' | 'drone';
export type DeliveryPartnerType = 'internal' | 'external' | 'freelance';
export type PaymentType = 'prepaid' | 'cod' | 'card_on_delivery';

// Core Delivery Types
export interface DeliveryPartner {
  id: string;
  name: string;
  type: DeliveryPartnerType;
  logo?: string;
  description: string;
  isActive: boolean;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  serviceAreas: string[];
  supportedVehicles: VehicleType[];
  deliveryTypes: DeliveryType[];
  apiEndpoint?: string;
  apiKey?: string;
  webhookUrl?: string;
  pricing: DeliveryPricing[];
  workingHours: WorkingHours;
  contactInfo: ContactInfo;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryDriver {
  id: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  partnerId: string;
  partner?: DeliveryPartner;
  licenseNumber: string;
  vehicleType: VehicleType;
  vehicleInfo: VehicleInfo;
  isOnline: boolean;
  isAvailable: boolean;
  currentLocation?: Location;
  rating: number;
  reviewCount: number;
  totalDeliveries: number;
  documentsVerified: boolean;
  backgroundCheckPassed: boolean;
  emergencyContact: EmergencyContact;
  workingHours: WorkingHours;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  description: string;
  polygon: Location[];
  isActive: boolean;
  partnerId?: string;
  partner?: DeliveryPartner;
  deliveryTypes: DeliveryType[];
  baseFee: number;
  currency: string;
  estimatedTime: number; // in minutes
  maxWeight: number; // in kg
  maxDistance: number; // in km
  workingHours: WorkingHours;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  order?: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    items: any[];
    customerId: string;
    sellerId: string;
  };
  trackingNumber: string;
  status: DeliveryStatus;
  deliveryType: DeliveryType;
  priority: DeliveryPriority;
  paymentType: PaymentType;
  
  // Partner & Driver Info
  partnerId: string;
  partner?: DeliveryPartner;
  driverId?: string;
  driver?: DeliveryDriver;
  
  // Locations
  pickupLocation: DeliveryLocation;
  deliveryLocation: DeliveryLocation;
  currentLocation?: Location;
  
  // Timing
  scheduledPickupTime?: string;
  scheduledDeliveryTime?: string;
  estimatedDeliveryTime: string;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  
  // Package Info
  packageInfo: PackageInfo;
  specialInstructions?: string;
  
  // Pricing
  deliveryFee: number;
  additionalFees: AdditionalFee[];
  totalFee: number;
  currency: string;
  
  // Tracking
  timeline: DeliveryTimeline[];
  proofOfDelivery?: ProofOfDelivery;
  
  // Customer Communication
  customerNotifications: NotificationLog[];
  
  // Metadata
  attempts: number;
  maxAttempts: number;
  failureReason?: string;
  returnReason?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  location: Location;
  contactPerson: string;
  contactPhone: string;
  landmarks?: string;
  accessInstructions?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
}

export interface PackageInfo {
  weight: number; // in kg
  dimensions: {
    length: number; // in cm
    width: number;
    height: number;
  };
  value: number;
  currency: string;
  isFragile: boolean;
  requiresSignature: boolean;
  requiresRefrigeration: boolean;
  contents: string;
  itemCount: number;
}

export interface DeliveryTimeline {
  id: string;
  deliveryId: string;
  status: DeliveryStatus;
  timestamp: string;
  location?: Location;
  description: string;
  driverNotes?: string;
  customerNotified: boolean;
  imageUrl?: string;
}

export interface ProofOfDelivery {
  id: string;
  deliveryId: string;
  signatureUrl?: string;
  photoUrl?: string;
  recipientName: string;
  recipientRelation: string;
  deliveredAt: string;
  driverNotes?: string;
  customerRating?: number;
  customerFeedback?: string;
}

export interface DeliveryPricing {
  id: string;
  partnerId: string;
  deliveryType: DeliveryType;
  zoneId?: string;
  baseFee: number;
  weightTiers: WeightTier[];
  distanceTiers: DistanceTier[];
  surcharges: Surcharge[];
  currency: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface WeightTier {
  minWeight: number;
  maxWeight: number;
  rate: number;
}

export interface DistanceTier {
  minDistance: number;
  maxDistance: number;
  rate: number;
}

export interface Surcharge {
  name: string;
  type: 'fixed' | 'percentage';
  value: number;
  condition: string;
  isActive: boolean;
}

export interface AdditionalFee {
  name: string;
  amount: number;
  description: string;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isWorking: boolean;
  startTime: string; // HH:mm format
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  capacity: number; // in kg
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  insuranceExpiry: string;
  inspectionExpiry: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website?: string;
  supportHours: WorkingHours;
}

export interface NotificationLog {
  id: string;
  deliveryId: string;
  type: 'sms' | 'email' | 'push' | 'whatsapp';
  status: 'sent' | 'delivered' | 'failed';
  message: string;
  sentAt: string;
  deliveredAt?: string;
  failureReason?: string;
}

// Form Data Types
export interface DeliveryPartnerRegistrationData {
  name: string;
  type: DeliveryPartnerType;
  description: string;
  serviceAreas: string[];
  supportedVehicles: VehicleType[];
  deliveryTypes: DeliveryType[];
  contactInfo: ContactInfo;
  workingHours: WorkingHours;
  documents: File[];
}

export interface DeliveryDriverRegistrationData {
  licenseNumber: string;
  vehicleType: VehicleType;
  vehicleInfo: VehicleInfo;
  emergencyContact: EmergencyContact;
  workingHours: WorkingHours;
  documents: File[];
}

export interface DeliveryRequestData {
  orderId: string;
  deliveryType: DeliveryType;
  priority: DeliveryPriority;
  scheduledPickupTime?: string;
  scheduledDeliveryTime?: string;
  specialInstructions?: string;
  packageInfo: PackageInfo;
  pickupLocation: Omit<DeliveryLocation, 'location'>;
  deliveryLocation: Omit<DeliveryLocation, 'location'>;
}

export interface DeliverySearchFilters {
  status?: DeliveryStatus;
  deliveryType?: DeliveryType;
  partnerId?: string;
  driverId?: string;
  zoneId?: string;
  dateFrom?: string;
  dateTo?: string;
  trackingNumber?: string;
  orderNumber?: string;
  sortBy?: 'created_at' | 'scheduled_delivery' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Analytics Types
export interface DeliveryAnalytics {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  customerSatisfactionScore: number;
  totalRevenue: number;
  deliverysByStatus: Record<DeliveryStatus, number>;
  deliverysByType: Record<DeliveryType, number>;
  topPerformingDrivers: Array<{ driverId: string; deliveries: number; rating: number }>;
  busyHours: Array<{ hour: number; deliveries: number }>;
  popularZones: Array<{ zoneId: string; deliveries: number }>;
}

export interface DriverAnalytics {
  totalDeliveries: number;
  successfulDeliveries: number;
  averageDeliveryTime: number;
  onTimeRate: number;
  customerRating: number;
  totalEarnings: number;
  hoursWorked: number;
  fuelConsumption: number;
  deliverysByDay: Array<{ date: string; deliveries: number }>;
  earningsByWeek: Array<{ week: string; earnings: number }>;
}

// Real-time Tracking Types
export interface TrackingUpdate {
  deliveryId: string;
  location: Location;
  status: DeliveryStatus;
  timestamp: string;
  estimatedArrival?: string;
  message?: string;
}

export interface RouteOptimization {
  driverId: string;
  deliveries: string[];
  optimizedRoute: Location[];
  estimatedDuration: number;
  estimatedDistance: number;
  fuelEstimate: number;
}

// Notification Types
export interface DeliveryNotification {
  id: string;
  deliveryId: string;
  customerId: string;
  type: 'status_update' | 'delivery_attempt' | 'delivery_complete' | 'delivery_failed';
  title: string;
  message: string;
  channels: ('sms' | 'email' | 'push' | 'whatsapp')[];
  scheduledAt?: string;
  sentAt?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
}
