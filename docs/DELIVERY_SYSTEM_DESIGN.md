# Georgy's Marketplace - Delivery System Design
## Makurdi, Benue State Local Delivery Service

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Database Schema Extensions](#2-database-schema-extensions)
3. [Delivery Agent Onboarding](#3-delivery-agent-onboarding)
4. [Delivery Zones & Pricing](#4-delivery-zones--pricing)
5. [Order Delivery Workflow](#5-order-delivery-workflow)
6. [Real-Time Tracking System](#6-real-time-tracking-system)
7. [Admin Control Panel](#7-admin-control-panel)
8. [API Endpoints](#8-api-endpoints)
9. [Mobile App Integration](#9-mobile-app-integration)
10. [Security & Compliance](#10-security--compliance)

---

## 1. System Overview

### 1.1 Service Area
- **Primary Coverage**: Makurdi, Benue State, Nigeria
- **Initial Zones**: 
  - High Density: North Bank, Wurukum, Modern Market, Logo I & II
  - Medium Density: BIPC, Ankpa Quarters, Kanshio, Wadata
  - Extended: University of Agriculture Area, Industrial Layout

### 1.2 Core Components
```
┌─────────────────────────────────────────────────────────────────┐
│                    DELIVERY SYSTEM ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   CUSTOMER   │    │    SELLER    │    │    ADMIN     │       │
│  │   Frontend   │    │   Dashboard  │    │    Panel     │       │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
│         │                   │                   │                │
│         └───────────────────┼───────────────────┘                │
│                             │                                    │
│                    ┌────────▼────────┐                          │
│                    │   API GATEWAY   │                          │
│                    │  (Express.js)   │                          │
│                    └────────┬────────┘                          │
│                             │                                    │
│         ┌───────────────────┼───────────────────┐               │
│         │                   │                   │                │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐         │
│  │  Delivery   │    │   Pricing   │    │  Tracking   │         │
│  │   Service   │    │   Engine    │    │   Service   │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                   │                   │                │
│         └───────────────────┼───────────────────┘               │
│                             │                                    │
│                    ┌────────▼────────┐                          │
│                    │    MongoDB      │                          │
│                    │   (Prisma)      │                          │
│                    └─────────────────┘                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  DELIVERY AGENT APP                       │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │   │
│  │  │ Orders  │  │  GPS    │  │ Status  │  │Earnings │     │   │
│  │  │  Queue  │  │Tracking │  │ Update  │  │ Report  │     │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema Extensions

### 2.1 Enhanced DeliveryAgent Model
```prisma
model DeliveryAgent {
  id                String   @id @default(cuid()) @map("_id")
  userId            String   @unique
  
  // Personal Information
  businessName      String?
  dateOfBirth       DateTime?
  gender            String?
  address           String?  // JSON: street, area, landmark
  
  // Vehicle Information
  vehicleType       String   // bike, tricycle, car, van
  vehicleMake       String?
  vehicleModel      String?
  vehicleYear       Int?
  licensePlate      String?
  vehicleColor      String?
  
  // Verification Documents
  licenseNumber     String?
  licenseExpiry     DateTime?
  ninNumber         String?  // National ID
  guarantorInfo     String?  // JSON: name, phone, address, relationship
  documents         String?  // JSON array of document URLs
  
  // Contact
  phoneNumber       String
  alternatePhone    String?
  emergencyContact  String?  // JSON: name, phone, relationship
  
  // Banking
  bankDetails       String?  // JSON: bankName, accountNumber, accountName
  
  // Service Configuration
  serviceAreas      String   // JSON array of zone IDs
  maxDeliveryRadius Float    @default(15) // km
  workingHours      String?  // JSON: { mon: {start, end}, tue: ... }
  
  // Availability & Status
  isVerified        Boolean  @default(false)
  verificationStatus String  @default("pending") // pending, under_review, approved, rejected
  verificationNotes String?
  verifiedAt        DateTime?
  verifiedBy        String?
  isAvailable       Boolean  @default(false)
  isOnline          Boolean  @default(false)
  currentLocation   String?  // JSON: { lat, lng, timestamp, accuracy }
  lastLocationUpdate DateTime?
  
  // Performance Metrics
  rating            Float?   @default(0)
  totalRatings      Int      @default(0)
  totalDeliveries   Int      @default(0)
  completedDeliveries Int    @default(0)
  cancelledDeliveries Int    @default(0)
  failedDeliveries  Int      @default(0)
  onTimeRate        Float    @default(100)
  acceptanceRate    Float    @default(100)
  
  // Earnings
  totalEarnings     Float    @default(0)
  pendingEarnings   Float    @default(0)
  withdrawnEarnings Float    @default(0)
  currentBalance    Float    @default(0)
  
  // Status
  status            String   @default("pending") // pending, active, suspended, inactive, banned
  suspensionReason  String?
  suspendedAt       DateTime?
  suspendedUntil    DateTime?
  
  // Timestamps
  joinedAt          DateTime @default(now())
  lastActiveAt      DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  shipments         Shipment[]
  earnings          DeliveryEarning[]
  reviews           DeliveryReview[]
  violations        AgentViolation[]

  @@map("delivery_agents")
}
```

### 2.2 New Models

```prisma
// Makurdi Delivery Zones
model MakurdiDeliveryZone {
  id              String   @id @default(cuid()) @map("_id")
  name            String   // e.g., "North Bank", "Wurukum"
  code            String   @unique // e.g., "MKD-NB", "MKD-WK"
  description     String?
  
  // Geographic boundaries (GeoJSON polygon)
  boundaries      String   // JSON GeoJSON polygon
  centerPoint     String   // JSON: { lat, lng }
  
  // Pricing
  baseFee         Float    // Base delivery fee within zone
  perKmFee        Float    @default(50) // Additional fee per km
  minFee          Float    @default(300) // Minimum delivery fee
  maxFee          Float?   // Maximum delivery fee cap
  
  // Cross-zone pricing
  crossZoneFees   String?  // JSON: { "MKD-WK": 200, "MKD-LG": 300 }
  
  // Operational
  isActive        Boolean  @default(true)
  priority        Int      @default(0) // Higher = more important
  estimatedTime   Int      @default(45) // Minutes for standard delivery
  
  // Coverage hours
  operatingHours  String?  // JSON: { start: "08:00", end: "20:00" }
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("makurdi_delivery_zones")
}

// Delivery Pricing Rules (Admin configurable)
model DeliveryPricingRule {
  id              String   @id @default(cuid()) @map("_id")
  name            String
  description     String?
  
  // Rule type
  ruleType        String   // base, distance, weight, time, surge, promo
  
  // Conditions (JSON)
  conditions      String   // { minDistance: 0, maxDistance: 5, zones: [], timeRange: {} }
  
  // Pricing
  feeType         String   // fixed, percentage, per_unit
  feeValue        Float
  
  // Applicability
  priority        Int      @default(0)
  isActive        Boolean  @default(true)
  validFrom       DateTime?
  validTo         DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("delivery_pricing_rules")
}

// Delivery Earnings (Agent payouts)
model DeliveryEarning {
  id              String   @id @default(cuid()) @map("_id")
  agentId         String
  shipmentId      String?
  
  // Earning details
  type            String   // delivery, bonus, tip, adjustment, penalty
  amount          Float
  description     String?
  
  // Status
  status          String   @default("pending") // pending, approved, paid, cancelled
  
  // Payment
  paymentMethod   String?
  paymentRef      String?
  paidAt          DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  agent           DeliveryAgent @relation(fields: [agentId], references: [id], onDelete: Cascade)

  @@map("delivery_earnings")
}

// Delivery Reviews (Customer feedback)
model DeliveryReview {
  id              String   @id @default(cuid()) @map("_id")
  shipmentId      String   @unique
  agentId         String
  customerId      String
  
  // Ratings (1-5)
  overallRating   Int
  punctualityRating Int?
  professionalismRating Int?
  packageConditionRating Int?
  
  // Feedback
  comment         String?
  tags            String?  // JSON array: ["fast", "polite", "careful"]
  
  // Response
  agentResponse   String?
  respondedAt     DateTime?
  
  // Moderation
  isVisible       Boolean  @default(true)
  flagged         Boolean  @default(false)
  flagReason      String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  agent           DeliveryAgent @relation(fields: [agentId], references: [id], onDelete: Cascade)

  @@map("delivery_reviews")
}

// Agent Violations (For accountability)
model AgentViolation {
  id              String   @id @default(cuid()) @map("_id")
  agentId         String
  
  // Violation details
  type            String   // late_delivery, package_damage, misconduct, fraud, no_show
  severity        String   // minor, moderate, major, critical
  description     String
  evidence        String?  // JSON array of evidence URLs
  
  // Related
  shipmentId      String?
  reportedBy      String?  // customer ID or "system"
  
  // Resolution
  status          String   @default("pending") // pending, investigating, resolved, dismissed
  resolution      String?
  resolvedBy      String?
  resolvedAt      DateTime?
  
  // Penalty
  penaltyType     String?  // warning, fine, suspension, termination
  penaltyAmount   Float?
  penaltyApplied  Boolean  @default(false)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  agent           DeliveryAgent @relation(fields: [agentId], references: [id], onDelete: Cascade)

  @@map("agent_violations")
}

// Enhanced Shipment Model (extends existing)
model ShipmentStatusHistory {
  id              String   @id @default(cuid()) @map("_id")
  shipmentId      String
  
  // Status change
  fromStatus      String?
  toStatus        String
  
  // Context
  changedBy       String   // user ID or "system"
  changedByRole   String   // customer, seller, agent, admin, system
  reason          String?
  notes           String?
  
  // Location at time of change
  location        String?  // JSON: { lat, lng, address }
  
  createdAt       DateTime @default(now())

  @@map("shipment_status_history")
}
```

---

## 3. Delivery Agent Onboarding

### 3.1 Registration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT ONBOARDING FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: Basic Registration                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Full Name                                              │   │
│  │  • Phone Number (OTP verification)                        │   │
│  │  • Email Address                                          │   │
│  │  • Password                                               │   │
│  │  • Residential Address in Makurdi                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  Step 2: Vehicle Information                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Vehicle Type (Bike/Tricycle/Car/Van)                   │   │
│  │  • Vehicle Make & Model                                   │   │
│  │  • License Plate Number                                   │   │
│  │  • Vehicle Color                                          │   │
│  │  • Vehicle Photo (front, back, side)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  Step 3: Document Verification                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • National ID (NIN) - Photo upload                       │   │
│  │  • Driver's License - Photo upload                        │   │
│  │  • Passport Photo                                         │   │
│  │  • Proof of Address (Utility bill)                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  Step 4: Guarantor Information                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Guarantor Full Name                                    │   │
│  │  • Guarantor Phone Number                                 │   │
│  │  • Guarantor Address                                      │   │
│  │  • Relationship to Agent                                  │   │
│  │  • Guarantor ID Photo                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  Step 5: Banking Details                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Bank Name                                              │   │
│  │  • Account Number                                         │   │
│  │  • Account Name (auto-verified)                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  Step 6: Service Area Selection                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Select zones in Makurdi to cover                       │   │
│  │  • Set maximum delivery radius                            │   │
│  │  • Set working hours/availability                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  Step 7: Agreement & Submission                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Read & Accept Terms of Service                         │   │
│  │  • Read & Accept Delivery Partner Agreement               │   │
│  │  • Submit Application                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  Admin Review & Approval                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Document verification                                  │   │
│  │  • Background check                                       │   │
│  │  • Vehicle inspection (optional)                          │   │
│  │  • Approval/Rejection with notes                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Agent Profile Structure

```typescript
interface DeliveryAgentProfile {
  id: string;
  userId: string;
  
  // Personal
  personal: {
    fullName: string;
    dateOfBirth: Date;
    gender: 'male' | 'female';
    address: {
      street: string;
      area: string;
      landmark: string;
      city: 'Makurdi';
      state: 'Benue';
    };
    phone: string;
    alternatePhone?: string;
    email: string;
  };
  
  // Vehicle
  vehicle: {
    type: 'bike' | 'tricycle' | 'car' | 'van';
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
    photos: string[];
  };
  
  // Documents
  documents: {
    nin: { number: string; image: string; verified: boolean };
    driversLicense: { number: string; image: string; expiry: Date; verified: boolean };
    passport: { image: string; verified: boolean };
    proofOfAddress: { image: string; verified: boolean };
  };
  
  // Guarantor
  guarantor: {
    fullName: string;
    phone: string;
    address: string;
    relationship: string;
    idImage: string;
    verified: boolean;
  };
  
  // Banking
  banking: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    verified: boolean;
  };
  
  // Service Configuration
  serviceConfig: {
    zones: string[]; // Zone IDs
    maxRadius: number; // km
    workingHours: {
      [day: string]: { start: string; end: string; active: boolean };
    };
  };
  
  // Status
  status: {
    verification: 'pending' | 'under_review' | 'approved' | 'rejected';
    active: boolean;
    online: boolean;
    available: boolean;
    suspendedUntil?: Date;
  };
  
  // Metrics
  metrics: {
    rating: number;
    totalDeliveries: number;
    completedDeliveries: number;
    onTimeRate: number;
    acceptanceRate: number;
  };
  
  // Earnings
  earnings: {
    total: number;
    pending: number;
    available: number;
  };
}
```

---

## 4. Delivery Zones & Pricing

### 4.1 Makurdi Zone Configuration

```typescript
const MAKURDI_ZONES = [
  {
    code: 'MKD-NB',
    name: 'North Bank',
    baseFee: 400,
    perKmFee: 50,
    minFee: 400,
    estimatedTime: 30, // minutes
    areas: ['North Bank', 'Gyado Villa', 'Behind CBN']
  },
  {
    code: 'MKD-WK',
    name: 'Wurukum',
    baseFee: 350,
    perKmFee: 50,
    minFee: 350,
    estimatedTime: 25,
    areas: ['Wurukum', 'Modern Market', 'High Level']
  },
  {
    code: 'MKD-LG',
    name: 'Logo/Kanshio',
    baseFee: 400,
    perKmFee: 50,
    minFee: 400,
    estimatedTime: 35,
    areas: ['Logo I', 'Logo II', 'Kanshio', 'Naka Road']
  },
  {
    code: 'MKD-WD',
    name: 'Wadata',
    baseFee: 350,
    perKmFee: 50,
    minFee: 350,
    estimatedTime: 25,
    areas: ['Wadata', 'Ankpa Quarters']
  },
  {
    code: 'MKD-UA',
    name: 'UAM Area',
    baseFee: 500,
    perKmFee: 60,
    minFee: 500,
    estimatedTime: 45,
    areas: ['University of Agriculture', 'Agbadu', 'Single Quarters']
  },
  {
    code: 'MKD-IL',
    name: 'Industrial Layout',
    baseFee: 450,
    perKmFee: 55,
    minFee: 450,
    estimatedTime: 40,
    areas: ['Industrial Layout', 'BIPC']
  },
  {
    code: 'MKD-MM',
    name: 'Modern Market Area',
    baseFee: 300,
    perKmFee: 45,
    minFee: 300,
    estimatedTime: 20,
    areas: ['Modern Market', 'Railway', 'Gaadi']
  }
];
```

### 4.2 Pricing Engine

```typescript
interface DeliveryPriceCalculation {
  // Input
  pickupZone: string;
  deliveryZone: string;
  distance: number; // km
  weight?: number; // kg
  packageValue: number;
  deliveryType: 'standard' | 'express' | 'same_day' | 'scheduled';
  
  // Output
  breakdown: {
    baseFee: number;
    distanceFee: number;
    weightFee: number;
    crossZoneFee: number;
    expressMultiplier: number;
    insuranceFee: number;
    platformFee: number;
  };
  totalFee: number;
  agentEarning: number;
  platformCommission: number;
  estimatedTime: string;
}

class DeliveryPricingEngine {
  
  calculateDeliveryFee(params: {
    pickupLocation: { lat: number; lng: number; zone?: string };
    deliveryLocation: { lat: number; lng: number; zone?: string };
    weight?: number;
    packageValue: number;
    deliveryType: string;
  }): DeliveryPriceCalculation {
    
    // 1. Determine zones
    const pickupZone = this.determineZone(params.pickupLocation);
    const deliveryZone = this.determineZone(params.deliveryLocation);
    
    // 2. Calculate distance
    const distance = this.calculateDistance(
      params.pickupLocation,
      params.deliveryLocation
    );
    
    // 3. Get zone pricing
    const zoneConfig = this.getZoneConfig(deliveryZone);
    
    // 4. Calculate base fee
    let baseFee = zoneConfig.baseFee;
    
    // 5. Distance fee
    const distanceFee = distance > 3 ? (distance - 3) * zoneConfig.perKmFee : 0;
    
    // 6. Weight fee (if applicable)
    const weightFee = params.weight && params.weight > 5 
      ? (params.weight - 5) * 100 
      : 0;
    
    // 7. Cross-zone fee
    const crossZoneFee = pickupZone !== deliveryZone 
      ? this.getCrossZoneFee(pickupZone, deliveryZone) 
      : 0;
    
    // 8. Express multiplier
    const expressMultiplier = this.getExpressMultiplier(params.deliveryType);
    
    // 9. Insurance fee (for high-value items)
    const insuranceFee = params.packageValue > 50000 
      ? params.packageValue * 0.01 
      : 0;
    
    // 10. Calculate subtotal
    const subtotal = (baseFee + distanceFee + weightFee + crossZoneFee) * expressMultiplier;
    
    // 11. Platform fee (15%)
    const platformFee = subtotal * 0.15;
    
    // 12. Total
    const totalFee = Math.max(
      subtotal + insuranceFee + platformFee,
      zoneConfig.minFee
    );
    
    // 13. Agent earning (85% of subtotal)
    const agentEarning = subtotal * 0.85;
    
    return {
      pickupZone,
      deliveryZone,
      distance,
      weight: params.weight,
      packageValue: params.packageValue,
      deliveryType: params.deliveryType as any,
      breakdown: {
        baseFee,
        distanceFee,
        weightFee,
        crossZoneFee,
        expressMultiplier,
        insuranceFee,
        platformFee
      },
      totalFee: Math.round(totalFee),
      agentEarning: Math.round(agentEarning),
      platformCommission: Math.round(platformFee),
      estimatedTime: this.getEstimatedTime(params.deliveryType, distance)
    };
  }
  
  private getExpressMultiplier(type: string): number {
    switch (type) {
      case 'same_day': return 1.5;
      case 'express': return 1.3;
      case 'scheduled': return 1.0;
      default: return 1.0;
    }
  }
  
  private getEstimatedTime(type: string, distance: number): string {
    const baseMinutes = Math.max(20, distance * 5);
    switch (type) {
      case 'same_day': return `${baseMinutes}-${baseMinutes + 30} mins`;
      case 'express': return `${baseMinutes + 15}-${baseMinutes + 45} mins`;
      default: return `${baseMinutes + 30}-${baseMinutes + 90} mins`;
    }
  }
}
```

### 4.3 Admin Pricing Controls

```typescript
interface AdminPricingControls {
  // Global settings
  globalSettings: {
    minDeliveryFee: number;
    maxDeliveryFee: number;
    platformCommissionRate: number;
    insuranceThreshold: number;
    insuranceRate: number;
  };
  
  // Zone management
  zoneManagement: {
    createZone(zone: ZoneConfig): Promise<Zone>;
    updateZone(zoneId: string, updates: Partial<ZoneConfig>): Promise<Zone>;
    deactivateZone(zoneId: string): Promise<void>;
    setZonePricing(zoneId: string, pricing: ZonePricing): Promise<void>;
  };
  
  // Surge pricing
  surgePricing: {
    enableSurge(multiplier: number, duration: number, zones?: string[]): Promise<void>;
    disableSurge(): Promise<void>;
    scheduleSurge(schedule: SurgeSchedule): Promise<void>;
  };
  
  // Promotions
  promotions: {
    createPromo(promo: PromoConfig): Promise<Promo>;
    applyPromoToOrder(orderId: string, promoCode: string): Promise<Discount>;
  };
  
  // Override
  override: {
    setCustomFee(orderId: string, fee: number, reason: string): Promise<void>;
    waiveFee(orderId: string, reason: string): Promise<void>;
  };
}
```

---

## 5. Order Delivery Workflow

### 5.1 Complete Order-to-Delivery Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORDER DELIVERY WORKFLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  1. CUSTOMER PLACES ORDER                                 │   │
│  │     • Selects products                                    │   │
│  │     • Enters delivery address                             │   │
│  │     • System calculates delivery fee                      │   │
│  │     • Customer pays (product + delivery)                  │   │
│  └─────────────────────────┬────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  2. ORDER CONFIRMED                                       │   │
│  │     • Payment verified                                    │   │
│  │     • Seller notified                                     │   │
│  │     • Order status: PENDING                               │   │
│  └─────────────────────────┬────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  3. SELLER PREPARES ORDER                                 │   │
│  │     • Seller confirms order                               │   │
│  │     • Packages product                                    │   │
│  │     • Marks as "Ready for Pickup"                         │   │
│  │     • Order status: PROCESSING                            │   │
│  └─────────────────────────┬────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  4. AUTO-ASSIGN DELIVERY AGENT                            │   │
│  │     ┌────────────────────────────────────────────────┐   │   │
│  │     │  Assignment Algorithm:                          │   │   │
│  │     │  1. Find agents in seller's zone               │   │   │
│  │     │  2. Filter by: online, available, verified     │   │   │
│  │     │  3. Calculate proximity to pickup location     │   │   │
│  │     │  4. Consider agent's current load              │   │   │
│  │     │  5. Factor in rating & performance             │   │   │
│  │     │  6. Select best match                          │   │   │
│  │     └────────────────────────────────────────────────┘   │   │
│  │     • Agent receives notification                         │   │
│  │     • 2-minute window to accept                           │   │
│  │     • If declined/timeout → next agent                    │   │
│  │     • Order status: ASSIGNED                              │   │
│  └─────────────────────────┬────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  5. AGENT PICKS UP ORDER                                  │   │
│  │     • Agent navigates to seller location                  │   │
│  │     • Verifies package with seller                        │   │
│  │     • Takes photo of package                              │   │
│  │     • Confirms pickup in app                              │   │
│  │     • Customer notified: "Order picked up"                │   │
│  │     • Order status: PICKED_UP                             │   │
│  └─────────────────────────┬────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  6. IN TRANSIT                                            │   │
│  │     • Agent's location tracked in real-time               │   │
│  │     • Customer can view agent on map                      │   │
│  │     • ETA updates automatically                           │   │
│  │     • Order status: IN_TRANSIT                            │   │
│  └─────────────────────────┬────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  7. DELIVERY ATTEMPT                                      │   │
│  │     • Agent arrives at delivery address                   │   │
│  │     • Contacts customer if needed                         │   │
│  │     • Hands over package                                  │   │
│  │     • Order status: DELIVERED                             │   │
│  │                                                           │   │
│  │     If delivery fails:                                    │   │
│  │     • Record failure reason                               │   │
│  │     • Reschedule or return to seller                      │   │
│  │     • Order status: FAILED / RESCHEDULED                  │   │
│  └─────────────────────────┬────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  8. DELIVERY CONFIRMATION                                 │   │
│  │     • Agent uploads proof of delivery:                    │   │
│  │       - Photo of delivered package                        │   │
│  │       - Customer signature (optional)                     │   │
│  │       - Delivery notes                                    │   │
│  │     • Customer confirms receipt in app                    │   │
│  │     • Customer can rate & review agent                    │   │
│  │     • Agent earning credited                              │   │
│  │     • Order status: COMPLETED                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Agent Assignment Algorithm

```typescript
class AgentAssignmentService {
  
  async assignAgent(shipment: Shipment): Promise<DeliveryAgent | null> {
    const pickupLocation = JSON.parse(shipment.pickupAddress);
    const deliveryLocation = JSON.parse(shipment.deliveryAddress);
    
    // Step 1: Get eligible agents
    const eligibleAgents = await prisma.deliveryAgent.findMany({
      where: {
        status: 'active',
        isVerified: true,
        isOnline: true,
        isAvailable: true,
        // Agent covers pickup zone
        serviceAreas: {
          contains: pickupLocation.zone
        }
      },
      include: {
        shipments: {
          where: {
            status: {
              in: ['assigned', 'picked_up', 'in_transit']
            }
          }
        }
      }
    });
    
    if (eligibleAgents.length === 0) {
      return null; // No available agents
    }
    
    // Step 2: Score each agent
    const scoredAgents = eligibleAgents.map(agent => {
      let score = 100;
      
      // Proximity score (closer is better)
      const agentLocation = JSON.parse(agent.currentLocation || '{}');
      const distance = this.calculateDistance(
        agentLocation,
        pickupLocation
      );
      score -= distance * 5; // -5 points per km
      
      // Current load (fewer active deliveries is better)
      const activeDeliveries = agent.shipments.length;
      score -= activeDeliveries * 15; // -15 points per active delivery
      
      // Rating bonus
      score += (agent.rating || 3) * 5; // Up to +25 points
      
      // On-time rate bonus
      score += (agent.onTimeRate / 100) * 10; // Up to +10 points
      
      // Experience bonus
      if (agent.totalDeliveries > 100) score += 10;
      else if (agent.totalDeliveries > 50) score += 5;
      
      return { agent, score, distance };
    });
    
    // Step 3: Sort by score and select best
    scoredAgents.sort((a, b) => b.score - a.score);
    
    // Step 4: Try to assign to top agent
    for (const { agent, distance } of scoredAgents) {
      // Skip if too far (> 10km for bikes, > 20km for cars)
      const maxDistance = agent.vehicleType === 'bike' ? 10 : 20;
      if (distance > maxDistance) continue;
      
      // Send assignment request to agent
      const accepted = await this.requestAgentAcceptance(agent.id, shipment.id);
      
      if (accepted) {
        // Update shipment with assigned agent
        await prisma.shipment.update({
          where: { id: shipment.id },
          data: {
            agentId: agent.id,
            status: 'assigned',
            assignedAt: new Date()
          }
        });
        
        // Mark agent as unavailable if at capacity
        if (agent.shipments.length + 1 >= this.getMaxCapacity(agent.vehicleType)) {
          await prisma.deliveryAgent.update({
            where: { id: agent.id },
            data: { isAvailable: false }
          });
        }
        
        return agent;
      }
    }
    
    return null; // No agent accepted
  }
  
  private getMaxCapacity(vehicleType: string): number {
    switch (vehicleType) {
      case 'bike': return 2;
      case 'tricycle': return 4;
      case 'car': return 5;
      case 'van': return 10;
      default: return 2;
    }
  }
  
  async requestAgentAcceptance(agentId: string, shipmentId: string): Promise<boolean> {
    // Send push notification to agent
    await this.sendAgentNotification(agentId, {
      type: 'new_delivery',
      shipmentId,
      message: 'New delivery request! Accept within 2 minutes.',
      timeout: 120000 // 2 minutes
    });
    
    // Wait for response (implement with WebSocket or polling)
    return new Promise((resolve) => {
      // Timeout after 2 minutes
      const timeout = setTimeout(() => resolve(false), 120000);
      
      // Listen for agent response
      this.onAgentResponse(agentId, shipmentId, (accepted: boolean) => {
        clearTimeout(timeout);
        resolve(accepted);
      });
    });
  }
}
```

### 5.3 Manual Reassignment (Admin)

```typescript
interface AdminReassignmentControls {
  // View current assignment
  getShipmentAssignment(shipmentId: string): Promise<{
    shipment: Shipment;
    currentAgent: DeliveryAgent | null;
    availableAgents: DeliveryAgent[];
  }>;
  
  // Reassign to specific agent
  reassignToAgent(
    shipmentId: string, 
    newAgentId: string, 
    reason: string
  ): Promise<void>;
  
  // Unassign and put back in queue
  unassignShipment(shipmentId: string, reason: string): Promise<void>;
  
  // Force assign (bypass availability check)
  forceAssign(
    shipmentId: string, 
    agentId: string, 
    adminNotes: string
  ): Promise<void>;
}
```

---

## 6. Real-Time Tracking System

### 6.1 Tracking Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REAL-TIME TRACKING SYSTEM                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │   Agent App  │         │ Customer App │                      │
│  │              │         │              │                      │
│  │  GPS Module  │         │  Map View    │                      │
│  └──────┬───────┘         └──────▲───────┘                      │
│         │                        │                               │
│         │ Location Updates       │ Location Broadcasts           │
│         │ (every 10 seconds)     │                               │
│         │                        │                               │
│         ▼                        │                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    WebSocket Server                      │    │
│  │                                                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │    │
│  │  │ Agent Room  │  │ Order Room  │  │ Admin Room  │     │    │
│  │  │ agent:{id}  │  │ order:{id}  │  │ admin:all   │     │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Redis Cache                           │    │
│  │                                                          │    │
│  │  agent:location:{id}  → { lat, lng, timestamp }         │    │
│  │  shipment:status:{id} → { status, location, eta }       │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Tracking Events

```typescript
// Status update events that customers can track
enum TrackingEventType {
  ORDER_PLACED = 'order_placed',
  ORDER_CONFIRMED = 'order_confirmed',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  AGENT_ASSIGNED = 'agent_assigned',
  AGENT_HEADING_TO_PICKUP = 'agent_heading_to_pickup',
  AGENT_ARRIVED_AT_PICKUP = 'agent_arrived_at_pickup',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  NEARBY = 'nearby', // Within 500m of delivery
  ARRIVED = 'arrived',
  DELIVERED = 'delivered',
  DELIVERY_ATTEMPTED = 'delivery_attempted',
  RESCHEDULED = 'rescheduled',
  CANCELLED = 'cancelled'
}

interface TrackingEvent {
  id: string;
  shipmentId: string;
  eventType: TrackingEventType;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  description: string;
  metadata?: {
    agentName?: string;
    agentPhone?: string;
    estimatedArrival?: string;
    photo?: string;
    notes?: string;
  };
}
```

### 6.3 Customer Tracking Interface

```typescript
interface CustomerTrackingView {
  // Order info
  order: {
    id: string;
    items: string[];
    total: number;
    deliveryFee: number;
  };
  
  // Current status
  currentStatus: {
    stage: TrackingEventType;
    message: string;
    timestamp: Date;
  };
  
  // Agent info (when assigned)
  agent?: {
    name: string;
    photo?: string;
    rating: number;
    vehicleType: string;
    vehicleColor: string;
    licensePlate: string;
    phone: string; // Masked: ***-***-**89
  };
  
  // Real-time location
  liveLocation?: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    lastUpdate: Date;
  };
  
  // ETA
  eta?: {
    minutes: number;
    arrivalTime: Date;
    distance: number; // km
  };
  
  // Timeline of events
  timeline: TrackingEvent[];
  
  // Actions available to customer
  actions: {
    canContactAgent: boolean;
    canContactSupport: boolean;
    canCancelOrder: boolean;
    canReschedule: boolean;
  };
}
```

### 6.4 Agent Status Updates Interface

```typescript
interface AgentDeliveryInterface {
  // Current delivery
  currentDelivery?: {
    id: string;
    status: string;
    pickup: {
      name: string;
      address: string;
      phone: string;
      location: { lat: number; lng: number };
    };
    delivery: {
      name: string;
      address: string;
      phone: string;
      location: { lat: number; lng: number };
    };
    package: {
      description: string;
      value: number;
      notes?: string;
    };
    earning: number;
  };
  
  // Actions agent can perform
  actions: {
    // At pickup
    confirmArrivalAtPickup(): Promise<void>;
    confirmPickup(photo: string): Promise<void>;
    reportPickupIssue(reason: string): Promise<void>;
    
    // In transit
    updateLocation(lat: number, lng: number): Promise<void>;
    reportIssue(type: string, description: string): Promise<void>;
    
    // At delivery
    confirmArrivalAtDelivery(): Promise<void>;
    confirmDelivery(proof: DeliveryProof): Promise<void>;
    reportDeliveryFailed(reason: string): Promise<void>;
    
    // Communication
    callCustomer(): void;
    messageCustomer(message: string): Promise<void>;
    callSupport(): void;
  };
}

interface DeliveryProof {
  photo: string; // Base64 or URL
  signature?: string; // Base64 signature image
  receiverName: string;
  notes?: string;
}
```

---

## 7. Admin Control Panel

### 7.1 Admin Dashboard Overview

```typescript
interface AdminDeliveryDashboard {
  // Real-time metrics
  liveMetrics: {
    activeDeliveries: number;
    onlineAgents: number;
    pendingOrders: number;
    avgDeliveryTime: number; // minutes
    todayCompletedDeliveries: number;
    todayRevenue: number;
  };
  
  // Map view
  mapView: {
    agents: AgentMapMarker[];
    activeDeliveries: DeliveryMapMarker[];
    zones: ZoneBoundary[];
  };
  
  // Alerts
  alerts: {
    delayedDeliveries: Shipment[];
    unassignedOrders: Order[];
    agentIssues: AgentAlert[];
  };
}
```

### 7.2 Agent Management

```typescript
interface AdminAgentManagement {
  // Agent listing
  getAgents(filters: AgentFilters): Promise<PaginatedAgents>;
  
  // Agent details
  getAgentDetails(agentId: string): Promise<AgentFullProfile>;
  
  // Verification
  approveAgent(agentId: string, notes?: string): Promise<void>;
  rejectAgent(agentId: string, reason: string): Promise<void>;
  requestMoreDocuments(agentId: string, documents: string[]): Promise<void>;
  
  // Status management
  suspendAgent(agentId: string, reason: string, duration?: number): Promise<void>;
  unsuspendAgent(agentId: string): Promise<void>;
  deactivateAgent(agentId: string, reason: string): Promise<void>;
  banAgent(agentId: string, reason: string): Promise<void>;
  
  // Performance
  getAgentPerformance(agentId: string, period: string): Promise<AgentPerformanceReport>;
  
  // Earnings
  getAgentEarnings(agentId: string, period: string): Promise<AgentEarningsReport>;
  processAgentPayout(agentId: string, amount: number): Promise<void>;
  adjustAgentEarning(agentId: string, amount: number, reason: string): Promise<void>;
}

interface AgentFilters {
  status?: 'pending' | 'active' | 'suspended' | 'inactive';
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  zone?: string;
  vehicleType?: string;
  isOnline?: boolean;
  search?: string;
  sortBy?: 'rating' | 'deliveries' | 'joinedAt' | 'earnings';
}
```

### 7.3 Pricing Management

```typescript
interface AdminPricingManagement {
  // Zone pricing
  getZonePricing(): Promise<ZonePricing[]>;
  updateZonePricing(zoneId: string, pricing: ZonePricingUpdate): Promise<void>;
  
  // Global settings
  getGlobalSettings(): Promise<GlobalPricingSettings>;
  updateGlobalSettings(settings: Partial<GlobalPricingSettings>): Promise<void>;
  
  // Surge pricing
  getSurgeStatus(): Promise<SurgeStatus>;
  enableSurge(config: SurgeConfig): Promise<void>;
  disableSurge(): Promise<void>;
  
  // Promotions
  getPromotions(): Promise<Promotion[]>;
  createPromotion(promo: PromotionCreate): Promise<Promotion>;
  updatePromotion(promoId: string, updates: PromotionUpdate): Promise<void>;
  deactivatePromotion(promoId: string): Promise<void>;
  
  // Price override
  overrideOrderPrice(orderId: string, newPrice: number, reason: string): Promise<void>;
}

interface GlobalPricingSettings {
  minDeliveryFee: number;
  maxDeliveryFee: number;
  basePerKmRate: number;
  platformCommission: number; // percentage
  agentCommission: number; // percentage
  insuranceThreshold: number;
  insuranceRate: number;
  weightSurchargePerKg: number;
  weightFreeLimit: number;
  expressMultiplier: number;
  sameDayMultiplier: number;
}
```

### 7.4 Delivery Monitoring

```typescript
interface AdminDeliveryMonitoring {
  // All deliveries
  getDeliveries(filters: DeliveryFilters): Promise<PaginatedDeliveries>;
  
  // Delivery details
  getDeliveryDetails(shipmentId: string): Promise<DeliveryFullDetails>;
  
  // Real-time monitoring
  getLiveDeliveries(): Promise<LiveDelivery[]>;
  
  // Interventions
  reassignDelivery(shipmentId: string, newAgentId: string, reason: string): Promise<void>;
  cancelDelivery(shipmentId: string, reason: string): Promise<void>;
  forceCompleteDelivery(shipmentId: string, notes: string): Promise<void>;
  
  // Disputes
  getDeliveryDisputes(): Promise<DeliveryDispute[]>;
  resolveDispute(disputeId: string, resolution: DisputeResolution): Promise<void>;
  
  // Reports
  generateDeliveryReport(params: ReportParams): Promise<DeliveryReport>;
}

interface DeliveryFilters {
  status?: string[];
  dateRange?: { start: Date; end: Date };
  zone?: string;
  agentId?: string;
  customerId?: string;
  sellerId?: string;
  hasIssue?: boolean;
  search?: string;
}
```

### 7.5 Analytics & Reports

```typescript
interface AdminDeliveryAnalytics {
  // Dashboard metrics
  getDashboardMetrics(period: string): Promise<DashboardMetrics>;
  
  // Performance analytics
  getDeliveryPerformance(period: string): Promise<{
    totalDeliveries: number;
    completedDeliveries: number;
    failedDeliveries: number;
    avgDeliveryTime: number;
    onTimeRate: number;
    customerSatisfaction: number;
  }>;
  
  // Agent analytics
  getAgentAnalytics(period: string): Promise<{
    totalAgents: number;
    activeAgents: number;
    avgAgentRating: number;
    topPerformers: Agent[];
    underperformers: Agent[];
  }>;
  
  // Zone analytics
  getZoneAnalytics(period: string): Promise<{
    deliveriesByZone: { zone: string; count: number }[];
    avgTimeByZone: { zone: string; avgTime: number }[];
    revenueByZone: { zone: string; revenue: number }[];
  }>;
  
  // Revenue analytics
  getRevenueAnalytics(period: string): Promise<{
    totalRevenue: number;
    platformEarnings: number;
    agentPayouts: number;
    avgOrderValue: number;
    avgDeliveryFee: number;
  }>;
  
  // Export reports
  exportReport(type: string, format: 'csv' | 'pdf' | 'excel', params: any): Promise<string>;
}
```

---

## 8. API Endpoints

### 8.1 Delivery Agent Endpoints

```typescript
// Agent Registration & Profile
POST   /api/delivery/agent/register           // Register as delivery agent
GET    /api/delivery/agent/profile            // Get own profile
PUT    /api/delivery/agent/profile            // Update profile
POST   /api/delivery/agent/documents          // Upload verification documents
GET    /api/delivery/agent/verification-status // Check verification status

// Availability & Status
PUT    /api/delivery/agent/availability       // Toggle online/offline
PUT    /api/delivery/agent/location           // Update current location
GET    /api/delivery/agent/zones              // Get assigned zones

// Deliveries
GET    /api/delivery/agent/deliveries         // Get assigned deliveries
GET    /api/delivery/agent/deliveries/:id     // Get delivery details
POST   /api/delivery/agent/deliveries/:id/accept    // Accept delivery request
POST   /api/delivery/agent/deliveries/:id/decline   // Decline delivery request
PUT    /api/delivery/agent/deliveries/:id/status    // Update delivery status
POST   /api/delivery/agent/deliveries/:id/pickup    // Confirm pickup
POST   /api/delivery/agent/deliveries/:id/deliver   // Confirm delivery
POST   /api/delivery/agent/deliveries/:id/failed    // Report delivery failed

// Earnings
GET    /api/delivery/agent/earnings           // Get earnings summary
GET    /api/delivery/agent/earnings/history   // Get earnings history
POST   /api/delivery/agent/earnings/withdraw  // Request withdrawal

// Performance
GET    /api/delivery/agent/performance        // Get performance metrics
GET    /api/delivery/agent/reviews            // Get customer reviews
```

### 8.2 Customer Endpoints

```typescript
// Delivery Quote
POST   /api/delivery/quote                    // Get delivery quote

// Tracking
GET    /api/delivery/track/:trackingNumber    // Track by tracking number
GET    /api/delivery/orders/:orderId/tracking // Track order delivery
GET    /api/delivery/orders/:orderId/live     // Get live agent location

// Feedback
POST   /api/delivery/orders/:orderId/rate     // Rate delivery
POST   /api/delivery/orders/:orderId/report   // Report delivery issue
```

### 8.3 Admin Endpoints

```typescript
// Agent Management
GET    /api/admin/delivery/agents                    // List all agents
GET    /api/admin/delivery/agents/:id                // Get agent details
PUT    /api/admin/delivery/agents/:id                // Update agent
POST   /api/admin/delivery/agents/:id/verify         // Approve/reject agent
PUT    /api/admin/delivery/agents/:id/suspend        // Suspend agent
PUT    /api/admin/delivery/agents/:id/unsuspend      // Unsuspend agent
DELETE /api/admin/delivery/agents/:id                // Deactivate agent

// Zone Management
GET    /api/admin/delivery/zones                     // List all zones
POST   /api/admin/delivery/zones                     // Create zone
PUT    /api/admin/delivery/zones/:id                 // Update zone
DELETE /api/admin/delivery/zones/:id                 // Deactivate zone

// Pricing Management
GET    /api/admin/delivery/pricing                   // Get pricing settings
PUT    /api/admin/delivery/pricing                   // Update pricing settings
POST   /api/admin/delivery/pricing/surge             // Enable surge pricing
DELETE /api/admin/delivery/pricing/surge             // Disable surge pricing

// Delivery Management
GET    /api/admin/delivery/shipments                 // List all shipments
GET    /api/admin/delivery/shipments/:id             // Get shipment details
PUT    /api/admin/delivery/shipments/:id/reassign    // Reassign to different agent
PUT    /api/admin/delivery/shipments/:id/cancel      // Cancel shipment
PUT    /api/admin/delivery/shipments/:id/override    // Override price

// Analytics
GET    /api/admin/delivery/analytics/dashboard       // Dashboard metrics
GET    /api/admin/delivery/analytics/performance     // Performance report
GET    /api/admin/delivery/analytics/revenue         // Revenue report
GET    /api/admin/delivery/analytics/agents          // Agent performance report
POST   /api/admin/delivery/analytics/export          // Export report

// Payouts
GET    /api/admin/delivery/payouts                   // List pending payouts
POST   /api/admin/delivery/payouts/process           // Process payout batch
GET    /api/admin/delivery/payouts/history           // Payout history
```

---

## 9. Mobile App Integration

### 9.1 Agent Mobile App Features

```typescript
interface AgentMobileApp {
  // Authentication
  auth: {
    login(phone: string, password: string): Promise<AuthResponse>;
    register(data: AgentRegistrationData): Promise<void>;
    verifyOTP(phone: string, otp: string): Promise<void>;
    resetPassword(phone: string): Promise<void>;
  };
  
  // Dashboard
  dashboard: {
    getStats(): Promise<AgentDashboardStats>;
    getNotifications(): Promise<Notification[]>;
  };
  
  // Availability
  availability: {
    goOnline(): Promise<void>;
    goOffline(): Promise<void>;
    getStatus(): Promise<AvailabilityStatus>;
  };
  
  // Location
  location: {
    startTracking(): void;
    stopTracking(): void;
    updateLocation(lat: number, lng: number): Promise<void>;
  };
  
  // Deliveries
  deliveries: {
    getPending(): Promise<Delivery[]>;
    getActive(): Promise<Delivery>;
    getHistory(page: number): Promise<PaginatedDeliveries>;
    acceptDelivery(id: string): Promise<void>;
    declineDelivery(id: string, reason: string): Promise<void>;
    updateStatus(id: string, status: string, data?: any): Promise<void>;
    getRoute(id: string): Promise<RouteInfo>;
  };
  
  // Proof of Delivery
  proofOfDelivery: {
    capturePhoto(): Promise<string>;
    captureSignature(): Promise<string>;
    submitProof(deliveryId: string, proof: DeliveryProof): Promise<void>;
  };
  
  // Earnings
  earnings: {
    getSummary(): Promise<EarningsSummary>;
    getHistory(page: number): Promise<PaginatedEarnings>;
    requestWithdrawal(amount: number, method: string): Promise<void>;
  };
  
  // Communication
  communication: {
    callCustomer(deliveryId: string): void;
    messageCustomer(deliveryId: string, message: string): Promise<void>;
    callSupport(): void;
  };
  
  // Profile
  profile: {
    get(): Promise<AgentProfile>;
    update(data: Partial<AgentProfile>): Promise<void>;
    uploadDocument(type: string, file: File): Promise<void>;
    updateBankDetails(details: BankDetails): Promise<void>;
  };
}
```

### 9.2 Push Notification Types

```typescript
enum AgentNotificationType {
  // Delivery
  NEW_DELIVERY_REQUEST = 'new_delivery_request',
  DELIVERY_ASSIGNED = 'delivery_assigned',
  DELIVERY_CANCELLED = 'delivery_cancelled',
  DELIVERY_RESCHEDULED = 'delivery_rescheduled',
  
  // Customer
  CUSTOMER_MESSAGE = 'customer_message',
  CUSTOMER_UNAVAILABLE = 'customer_unavailable',
  
  // Earnings
  EARNING_CREDITED = 'earning_credited',
  PAYOUT_PROCESSED = 'payout_processed',
  
  // Account
  VERIFICATION_APPROVED = 'verification_approved',
  VERIFICATION_REJECTED = 'verification_rejected',
  ACCOUNT_SUSPENDED = 'account_suspended',
  DOCUMENT_EXPIRING = 'document_expiring',
  
  // System
  ZONE_SURGE = 'zone_surge',
  SYSTEM_ANNOUNCEMENT = 'system_announcement'
}

interface PushNotification {
  type: AgentNotificationType;
  title: string;
  body: string;
  data: {
    deliveryId?: string;
    action?: string;
    [key: string]: any;
  };
  priority: 'high' | 'normal';
  sound?: string;
}
```

---

## 10. Security & Compliance

### 10.1 Data Protection

```typescript
// Sensitive data handling
interface DataProtection {
  // Customer data
  customerData: {
    // Phone numbers masked in agent view
    maskPhone(phone: string): string; // ***-***-**89
    
    // Full address only shown during active delivery
    getDeliveryAddress(deliveryId: string, agentId: string): Promise<Address | null>;
    
    // Data retention
    purgeDeliveryHistory(olderThan: Date): Promise<void>;
  };
  
  // Agent data
  agentData: {
    // Documents encrypted at rest
    encryptDocument(document: Buffer): Promise<string>;
    decryptDocument(encrypted: string): Promise<Buffer>;
    
    // Bank details tokenized
    tokenizeBankDetails(details: BankDetails): Promise<string>;
  };
  
  // Location data
  locationData: {
    // Location history limited retention (30 days)
    purgeOldLocations(): Promise<void>;
    
    // Customer can't see agent location after delivery
    revokeLocationAccess(deliveryId: string): Promise<void>;
  };
}
```

### 10.2 Fraud Prevention

```typescript
interface FraudPrevention {
  // Agent verification
  verifyAgent: {
    validateNIN(nin: string): Promise<NINValidationResult>;
    validateDriversLicense(license: string): Promise<LicenseValidationResult>;
    validateBankAccount(details: BankDetails): Promise<BankValidationResult>;
    verifyGuarantor(phone: string): Promise<void>;
  };
  
  // Delivery verification
  verifyDelivery: {
    validatePickupLocation(deliveryId: string, location: Location): Promise<boolean>;
    validateDeliveryLocation(deliveryId: string, location: Location): Promise<boolean>;
    verifyProofOfDelivery(proof: DeliveryProof): Promise<VerificationResult>;
  };
  
  // Anomaly detection
  detectAnomalies: {
    unusualLocationPattern(agentId: string): Promise<boolean>;
    rapidStatusChanges(deliveryId: string): Promise<boolean>;
    suspiciousEarningsPattern(agentId: string): Promise<boolean>;
  };
}
```

### 10.3 Dispute Resolution

```typescript
interface DeliveryDisputeResolution {
  // Customer initiated
  reportIssue(params: {
    deliveryId: string;
    issueType: 'not_delivered' | 'damaged' | 'wrong_item' | 'late' | 'agent_misconduct';
    description: string;
    evidence?: string[];
  }): Promise<Dispute>;
  
  // Admin resolution
  investigateDispute(disputeId: string): Promise<Investigation>;
  resolveDispute(params: {
    disputeId: string;
    resolution: 'refund' | 'redeliver' | 'partial_refund' | 'no_action';
    agentPenalty?: 'warning' | 'fine' | 'suspension';
    notes: string;
  }): Promise<void>;
}
```

---

## Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema updates
- [ ] Agent registration API
- [ ] Basic agent profile management
- [ ] Zone configuration for Makurdi

### Phase 2: Core Delivery (Week 3-4)
- [ ] Pricing engine implementation
- [ ] Agent assignment algorithm
- [ ] Order-to-delivery workflow
- [ ] Status update system

### Phase 3: Real-Time Features (Week 5-6)
- [ ] WebSocket integration
- [ ] Live location tracking
- [ ] Customer tracking interface
- [ ] Push notifications

### Phase 4: Admin Panel (Week 7-8)
- [ ] Agent management dashboard
- [ ] Pricing controls
- [ ] Delivery monitoring
- [ ] Analytics & reports

### Phase 5: Mobile App Integration (Week 9-10)
- [ ] Agent app API endpoints
- [ ] Location services
- [ ] Proof of delivery features
- [ ] Earnings management

### Phase 6: Security & Polish (Week 11-12)
- [ ] Data protection implementation
- [ ] Fraud prevention measures
- [ ] Dispute resolution system
- [ ] Testing & QA
- [ ] Documentation

---

## Appendix

### A. Makurdi Zone Coordinates (Sample)

```json
{
  "MKD-NB": {
    "name": "North Bank",
    "center": { "lat": 7.7500, "lng": 8.5167 },
    "boundaries": {
      "type": "Polygon",
      "coordinates": [[[8.50, 7.74], [8.54, 7.74], [8.54, 7.76], [8.50, 7.76], [8.50, 7.74]]]
    }
  },
  "MKD-WK": {
    "name": "Wurukum",
    "center": { "lat": 7.7333, "lng": 8.5333 },
    "boundaries": {
      "type": "Polygon",
      "coordinates": [[[8.52, 7.72], [8.55, 7.72], [8.55, 7.75], [8.52, 7.75], [8.52, 7.72]]]
    }
  }
}
```

### B. Sample Pricing Configuration

```json
{
  "global": {
    "minDeliveryFee": 300,
    "maxDeliveryFee": 5000,
    "platformCommission": 0.15,
    "insuranceThreshold": 50000,
    "insuranceRate": 0.01
  },
  "zones": {
    "MKD-NB": { "baseFee": 400, "perKmFee": 50 },
    "MKD-WK": { "baseFee": 350, "perKmFee": 50 },
    "MKD-UA": { "baseFee": 500, "perKmFee": 60 }
  },
  "multipliers": {
    "standard": 1.0,
    "express": 1.3,
    "same_day": 1.5
  }
}
```

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Author: Georgy's Marketplace Development Team*
