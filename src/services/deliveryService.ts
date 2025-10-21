import { isDevMode } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { 
  DeliveryPartner,
  DeliveryDriver,
  DeliveryZone,
  Delivery,
  DeliveryPartnerRegistrationData,
  DeliveryDriverRegistrationData,
  DeliveryRequestData,
  DeliverySearchFilters,
  DeliveryAnalytics,
  DriverAnalytics,
  TrackingUpdate,
  DeliveryTimeline,
  ProofOfDelivery,
  NotificationLog,
  Location,
  RouteOptimization
} from '@/features/delivery/types';

export class DeliveryService {
  // Delivery Partner Management
  static async registerDeliveryPartner(data: DeliveryPartnerRegistrationData): Promise<DeliveryPartner> {
    if (isDevMode) {
      // Return mock partner for development
      return {
        id: `partner-${Date.now()}`,
        name: data.name,
        type: data.type,
        description: data.description,
        isActive: true,
        isVerified: false,
        rating: 0,
        reviewCount: 0,
        serviceAreas: data.serviceAreas,
        supportedVehicles: data.supportedVehicles,
        deliveryTypes: data.deliveryTypes,
        contactInfo: data.contactInfo,
        workingHours: data.workingHours,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as DeliveryPartner;
    }

    const partner = await prisma.deliveryPartner.create({
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        isActive: true,
        isVerified: false,
        rating: 0,
        reviewCount: 0,
        serviceAreas: data.serviceAreas,
        supportedVehicles: data.supportedVehicles,
        deliveryTypes: data.deliveryTypes,
        contactInfo: data.contactInfo,
        workingHours: data.workingHours,
      }
    });

    // Upload partner documents
    if (data.documents && data.documents.length > 0) {
      await this.uploadPartnerDocuments(partner.id, data.documents);
    }

    return partner as DeliveryPartner;
  }

  static async getDeliveryPartners(isActive = true): Promise<DeliveryPartner[]> {
    if (isDevMode) {
      return []; // Return empty for development
    }

    const partners = await prisma.deliveryPartner.findMany({
      where: isActive ? { isActive: true } : undefined,
      orderBy: { name: 'asc' }
    });

    return partners as DeliveryPartner[];
  }

  static async getDeliveryPartnerById(partnerId: string): Promise<DeliveryPartner | null> {
    if (isDevMode) {
      return null; // Return null for development
    }

    const partner = await prisma.deliveryPartner.findUnique({
      where: { id: partnerId }
    });

    return partner as DeliveryPartner | null;
  }

  static async updateDeliveryPartner(partnerId: string, updates: Partial<DeliveryPartner>): Promise<DeliveryPartner> {
    const partner = await prisma.deliveryPartner.update({
      where: { id: partnerId },
      data: {
        ...updates,
        updatedAt: new Date(),
      }
    });

    return partner as DeliveryPartner;
  }

  // Delivery Driver Management
  static async registerDeliveryDriver(userId: string, data: DeliveryDriverRegistrationData): Promise<DeliveryDriver> {
    if (isDevMode) {
      // Return mock driver for development
      return {
        id: `driver-${Date.now()}`,
        userId: userId,
        licenseNumber: data.licenseNumber,
        vehicleType: data.vehicleType,
        vehicleInfo: data.vehicleInfo,
        isOnline: false,
        isAvailable: false,
        rating: 0,
        reviewCount: 0,
        totalDeliveries: 0,
        documentsVerified: false,
        backgroundCheckPassed: false,
        emergencyContact: data.emergencyContact,
        workingHours: data.workingHours,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as DeliveryDriver;
    }

    const driver = await prisma.deliveryDriver.create({
      data: {
        userId: userId,
        licenseNumber: data.licenseNumber,
        vehicleType: data.vehicleType,
        vehicleInfo: data.vehicleInfo,
        isOnline: false,
        isAvailable: false,
        rating: 0,
        reviewCount: 0,
        totalDeliveries: 0,
        documentsVerified: false,
        backgroundCheckPassed: false,
        emergencyContact: data.emergencyContact,
        workingHours: data.workingHours,
      },
      include: {
        user: true
      }
    });

    // Upload driver documents
    if (data.documents && data.documents.length > 0) {
      await this.uploadDriverDocuments(driver.id, data.documents);
    }

    return driver as DeliveryDriver;
  }

  static async getDeliveryDriverByUserId(userId: string): Promise<DeliveryDriver | null> {
    if (isDevMode) {
      return null; // Return null for development
    }

    const driver = await prisma.deliveryDriver.findUnique({
      where: { userId },
      include: {
        user: true,
        partner: true
      }
    });

    return driver as DeliveryDriver | null;
  }

  static async updateDriverLocation(driverId: string, location: Location): Promise<void> {
    await prisma.deliveryDriver.update({
      where: { id: driverId },
      data: {
        currentLocation: location,
        updatedAt: new Date(),
      }
    });

    // Also update real-time location tracking
    await this.updateRealTimeLocation(driverId, location);
  }

  static async updateDriverStatus(driverId: string, isOnline: boolean, isAvailable: boolean): Promise<DeliveryDriver> {
    const driver = await prisma.deliveryDriver.update({
      where: { id: driverId },
      data: {
        isOnline,
        isAvailable,
        updatedAt: new Date(),
      }
    });

    return driver as DeliveryDriver;
  }

  // Delivery Zone Management
  static async createDeliveryZone(zoneData: Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeliveryZone> {
    const zone = await prisma.deliveryZone.create({
      data: zoneData
    });

    return zone as DeliveryZone;
  }

  static async getDeliveryZones(isActive = true): Promise<DeliveryZone[]> {
    if (isDevMode) {
      return []; // Return empty for development
    }

    const zones = await prisma.deliveryZone.findMany({
      where: isActive ? { isActive: true } : undefined,
      include: {
        partner: true
      },
      orderBy: { name: 'asc' }
    });

    return zones as DeliveryZone[];
  }

  static async findDeliveryZoneByLocation(location: Location): Promise<DeliveryZone | null> {
    if (isDevMode) {
      return null; // Return null for development
    }

    // This would typically use PostGIS functions for polygon containment
    // For now, we'll implement a simplified version
    const zones = await prisma.deliveryZone.findMany({
      where: { isActive: true }
    });

    // Simple implementation - find the first zone that might contain the location
    const zone = zones?.find(zone => {
      // Simplified bounding box check
      if (zone.polygon && Array.isArray(zone.polygon) && zone.polygon.length > 0) {
        const lats = (zone.polygon as any[]).map((p: any) => p.latitude);
        const lngs = (zone.polygon as any[]).map((p: any) => p.longitude);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        return location.latitude >= minLat && location.latitude <= maxLat &&
               location.longitude >= minLng && location.longitude <= maxLng;
      }
      return false;
    });

    return zone as DeliveryZone || null;
  }

  // Delivery Management
  static async createDelivery(data: DeliveryRequestData): Promise<Delivery> {
    if (isDevMode) {
      // Return mock delivery for development
      const trackingNumber = this.generateTrackingNumber();
      return {
        id: `delivery-${Date.now()}`,
        orderId: data.orderId,
        trackingNumber,
        status: 'pending_pickup',
        deliveryType: data.deliveryType,
        priority: data.priority,
        paymentType: 'prepaid',
        partnerId: 'mock-partner-id',
        pickupLocation: data.pickupLocation,
        deliveryLocation: data.deliveryLocation,
        scheduledPickupTime: data.scheduledPickupTime,
        scheduledDeliveryTime: data.scheduledDeliveryTime,
        estimatedDeliveryTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        packageInfo: data.packageInfo,
        specialInstructions: data.specialInstructions,
        deliveryFee: 1500,
        additionalFees: [],
        totalFee: 1500,
        currency: 'NGN',
        attempts: 0,
        maxAttempts: 3,
        timeline: [],
        customerNotifications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Delivery;
    }

    // Find appropriate delivery partner and zone
    const pickupLocation = await this.geocodeAddress(`${data.pickupLocation.address}, ${data.pickupLocation.city}`);
    const deliveryLocation = await this.geocodeAddress(`${data.deliveryLocation.address}, ${data.deliveryLocation.city}`);
    
    const zone = await this.findDeliveryZoneByLocation(deliveryLocation);
    if (!zone) {
      throw new Error('Delivery location not in service area');
    }

    // Calculate delivery fee
    const deliveryFee = await this.calculateDeliveryFee(
      pickupLocation,
      deliveryLocation,
      data.packageInfo,
      data.deliveryType,
      zone.partnerId!
    );

    // Generate tracking number
    const trackingNumber = this.generateTrackingNumber();

    // Calculate estimated delivery time
    const estimatedDeliveryTime = this.calculateEstimatedDeliveryTime(
      data.deliveryType,
      zone.estimatedTime
    );

    const delivery = await prisma.delivery.create({
      data: {
        orderId: data.orderId,
        trackingNumber,
        status: 'pending_pickup',
        deliveryType: data.deliveryType,
        priority: data.priority,
        paymentType: 'prepaid',
        partnerId: zone.partnerId,
        pickupLocation: {
          ...data.pickupLocation,
          location: pickupLocation,
        },
        deliveryLocation: {
          ...data.deliveryLocation,
          location: deliveryLocation,
        },
        scheduledPickupTime: data.scheduledPickupTime,
        scheduledDeliveryTime: data.scheduledDeliveryTime,
        estimatedDeliveryTime,
        packageInfo: data.packageInfo,
        specialInstructions: data.specialInstructions,
        deliveryFee: deliveryFee.baseFee,
        additionalFees: deliveryFee.additionalFees,
        totalFee: deliveryFee.totalFee,
        currency: deliveryFee.currency,
        attempts: 0,
        maxAttempts: 3,
        timeline: [],
        customerNotifications: [],
      }
    });

    // Create initial timeline entry
    await this.addDeliveryTimelineEntry(delivery.id, 'pending_pickup', 'Delivery request created');

    // Send initial notification
    await this.sendDeliveryNotification(delivery.id, 'status_update', 'Your delivery has been scheduled');

    return delivery as Delivery;
  }

  // Utility Methods
  static generateTrackingNumber(): string {
    const prefix = 'TRK';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  static async geocodeAddress(address: string): Promise<Location> {
    // This would integrate with a geocoding service like Google Maps, MapBox, etc.
    // For now, return mock coordinates
    return {
      latitude: 6.5244 + (Math.random() - 0.5) * 0.1,
      longitude: 3.3792 + (Math.random() - 0.5) * 0.1,
      accuracy: 10,
      timestamp: new Date().toISOString(),
    };
  }

  static async calculateDeliveryFee(
    pickupLocation: Location,
    deliveryLocation: Location,
    packageInfo: any,
    deliveryType: string,
    partnerId: string
  ): Promise<{ baseFee: number; additionalFees: any[]; totalFee: number; currency: string }> {
    // Calculate distance (simplified)
    const distance = this.calculateDistance(pickupLocation, deliveryLocation);
    
    // Base fee calculation
    let baseFee = 1000; // Base fee in NGN
    
    // Distance multiplier
    if (distance > 5) {
      baseFee += (distance - 5) * 200;
    }
    
    // Delivery type multiplier
    const typeMultipliers: Record<string, number> = {
      standard: 1,
      express: 1.5,
      same_day: 2,
      scheduled: 1.2,
      overnight: 2.5,
    };
    
    baseFee *= typeMultipliers[deliveryType] || 1;
    
    // Weight surcharge
    const additionalFees = [];
    if (packageInfo.weight > 5) {
      const weightFee = (packageInfo.weight - 5) * 100;
      additionalFees.push({
        name: 'Heavy Package Surcharge',
        amount: weightFee,
        description: `Additional fee for packages over 5kg`,
      });
    }
    
    const totalAdditionalFees = additionalFees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalFee = baseFee + totalAdditionalFees;
    
    return {
      baseFee,
      additionalFees,
      totalFee,
      currency: 'NGN',
    };
  }

  static calculateDistance(location1: Location, location2: Location): number {
    // Haversine formula for calculating distance between two coordinates
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(location2.latitude - location1.latitude);
    const dLon = this.toRad(location2.longitude - location1.longitude);
    const lat1 = this.toRad(location1.latitude);
    const lat2 = this.toRad(location2.latitude);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance;
  }

  static toRad(value: number): number {
    return value * Math.PI / 180;
  }

  static calculateEstimatedDeliveryTime(deliveryType: string, baseTime: number): string {
    const multipliers: Record<string, number> = {
      standard: 1,
      express: 0.5,
      same_day: 0.25,
      scheduled: 1,
      overnight: 0.75,
    };
    
    const estimatedMinutes = baseTime * (multipliers[deliveryType] || 1);
    const deliveryTime = new Date(Date.now() + estimatedMinutes * 60000);
    
    return deliveryTime.toISOString();
  }

  static async uploadPartnerDocuments(partnerId: string, documents: File[]): Promise<string[]> {
    // Mock implementation - return placeholder paths
    return documents.map((file, index) => `partners/${partnerId}/${Date.now()}_${index}_${file.name}`);
  }

  static async uploadDriverDocuments(driverId: string, documents: File[]): Promise<string[]> {
    // Mock implementation - return placeholder paths
    return documents.map((file, index) => `drivers/${driverId}/${Date.now()}_${index}_${file.name}`);
  }

  static async addDeliveryTimelineEntry(
    deliveryId: string, 
    status: string, 
    description: string, 
    location?: Location,
    driverNotes?: string,
    imageUrl?: string
  ): Promise<DeliveryTimeline> {
    if (isDevMode) {
      // Return mock timeline entry for development
      return {
        id: `timeline-${Date.now()}`,
        deliveryId,
        status,
        description,
        location,
        driverNotes,
        imageUrl,
        customerNotified: false,
        timestamp: new Date().toISOString(),
      } as DeliveryTimeline;
    }

    const timelineEntry = await prisma.deliveryTimeline.create({
      data: {
        deliveryId,
        status,
        description,
        location,
        driverNotes,
        imageUrl,
        customerNotified: false,
        timestamp: new Date(),
      }
    });

    return timelineEntry as DeliveryTimeline;
  }

  static async sendDeliveryNotification(
    deliveryId: string,
    type: string,
    message: string,
    channels: string[] = ['push', 'email']
  ): Promise<void> {
    // Mock implementation for development
    console.log(`Delivery notification sent: ${message} for delivery ${deliveryId}`);
  }

  static async updateRealTimeLocation(driverId: string, location: Location): Promise<void> {
    // Mock implementation for real-time location updates
    console.log(`Driver ${driverId} location updated:`, location);
  }
}
