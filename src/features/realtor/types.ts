// Real Estate types - Phase 2 Implementation

// Core types
export type RealEstateProfessionalType = 'realtor' | 'house_agent' | 'house_owner';
export type PropertyType = 'apartment' | 'house' | 'condo' | 'townhouse' | 'land' | 'commercial' | 'office' | 'warehouse' | 'duplex' | 'studio';
export type ListingType = 'sale' | 'rent' | 'lease' | 'shortlet';
export type PropertyStatus = 'active' | 'pending' | 'sold' | 'rented' | 'inactive' | 'under_review' | 'expired';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'expired';
export type ViewingStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';

export interface RealEstateProfessional {
  id: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  professionalType: RealEstateProfessionalType;
  
  // License and verification
  licenseNumber?: string;
  licenseState?: string;
  licenseExpiryDate?: string;
  verificationStatus: VerificationStatus;
  verificationDocuments?: string[];
  isVerified: boolean;
  verifiedAt?: string;
  rejectionReason?: string;
  
  // Agency information
  agencyName?: string;
  agencyAddress?: string;
  agencyPhone?: string;
  agencyEmail?: string;
  agencyWebsite?: string;
  agencyLicense?: string;
  
  // Professional details
  specializations: string[];
  servingAreas: string[];
  languages: string[];
  yearsExperience: number;
  education?: string;
  certifications?: string[];
  
  // Performance metrics
  rating: number;
  reviewCount: number;
  totalSales?: number;
  totalListings?: number;
  avgDaysOnMarket?: number;
  commissionRate?: number;
  
  // Business settings
  isActive: boolean;
  acceptingNewClients: boolean;
  businessHours?: BusinessHours;
  contactPreferences: ContactPreferences;
  
  // Social and marketing
  bio?: string;
  profileCompleteness: number;
  socialMedia?: SocialMedia;
  marketingBudget?: number;
  
  timestamps: {
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
  };
}

// Supporting interfaces
export interface BusinessHours {
  monday: { open: string; close: string; isOpen: boolean };
  tuesday: { open: string; close: string; isOpen: boolean };
  wednesday: { open: string; close: string; isOpen: boolean };
  thursday: { open: string; close: string; isOpen: boolean };
  friday: { open: string; close: string; isOpen: boolean };
  saturday: { open: string; close: string; isOpen: boolean };
  sunday: { open: string; close: string; isOpen: boolean };
}

export interface ContactPreferences {
  preferredMethod: 'phone' | 'email' | 'sms' | 'whatsapp';
  phoneCallsAllowed: boolean;
  textMessagesAllowed: boolean;
  emailAllowed: boolean;
  maxResponseTime: number; // in hours
}

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  website?: string;
}

export interface Property {
  id: string;
  listingId: string; // Auto-generated unique identifier
  professionalId: string;
  professional?: RealEstateProfessional;
  
  // Basic information
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  subType?: string; // e.g., "Detached", "Semi-detached", "Terraced"
  
  // Pricing
  price: number;
  currency: string;
  pricePerSqft?: number;
  negotiable: boolean;
  priceHistory?: PriceHistory[];
  
  // Property details
  bedrooms?: number;
  bathrooms?: number;
  halfBathrooms?: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  renovatedYear?: number;
  floors?: number;
  parkingSpaces?: number;
  garageType?: 'attached' | 'detached' | 'carport' | 'none';
  
  // Condition and furnishing
  condition: 'new' | 'excellent' | 'good' | 'fair' | 'needs_work';
  furnishingStatus: 'furnished' | 'semi_furnished' | 'unfurnished';
  occupancyStatus: 'vacant' | 'owner_occupied' | 'tenant_occupied';
  
  // Features and amenities
  features: string[];
  amenities: string[];
  appliances: string[];
  utilities: string[];
  
  // Media
  images: PropertyImage[];
  videos?: PropertyVideo[];
  virtualTourUrl?: string;
  floorPlanUrl?: string;
  documents?: PropertyDocument[];
  
  // Location
  address: PropertyAddress;
  locationFeatures: LocationFeatures;
  
  // Listing management
  status: PropertyStatus;
  isActive: boolean;
  isFeatured: boolean;
  listingExpiryDate?: string;
  daysOnMarket: number;
  
  // Engagement metrics
  viewCount: number;
  inquiryCount: number;
  viewingCount: number;
  favoriteCount: number;
  shareCount: number;
  
  // Marketing
  marketingDescription?: string;
  keywords: string[];
  targetAudience?: string[];
  
  // Financial details
  taxes?: PropertyTaxes;
  hoa?: HOAInformation;
  utilities?: UtilityCosts;
  
  // Legal and compliance
  propertyId?: string; // Government property ID
  titleType?: string;
  zoning?: string;
  restrictions?: string[];
  
  timestamps: {
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    soldAt?: string;
    lastModifiedAt: string;
  };
}

// Property media interfaces
export interface PropertyImage {
  id: string;
  propertyId: string;
  imageUrl: string;
  imageAlt?: string;
  sortOrder: number;
  isPrimary: boolean;
  category?: 'exterior' | 'interior' | 'kitchen' | 'bathroom' | 'bedroom' | 'living_room' | 'other';
  uploadedAt: string;
}

export interface PropertyVideo {
  id: string;
  propertyId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  duration?: number; // in seconds
  category: 'tour' | 'walkthrough' | 'drone' | 'neighborhood' | 'other';
  uploadedAt: string;
}

export interface PropertyDocument {
  id: string;
  propertyId: string;
  documentUrl: string;
  documentType: 'floorplan' | 'survey' | 'inspection' | 'disclosure' | 'other';
  title: string;
  description?: string;
  uploadedAt: string;
}

export interface PropertyAddress {
  street: string;
  street2?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  neighborhood?: string;
  subdivision?: string;
  county?: string;
  displayAddress?: string; // For privacy (e.g., "Near Main St")
  isAddressPublic: boolean;
}

// Property financial interfaces
export interface PriceHistory {
  id: string;
  propertyId: string;
  price: number;
  priceChangeReason: string;
  changedAt: string;
  changedBy: string;
}

export interface PropertyTaxes {
  annualAmount: number;
  assessedValue: number;
  lastAssessmentYear: number;
  taxRate: number;
  exemptions?: string[];
}

export interface HOAInformation {
  hasHOA: boolean;
  monthlyFee?: number;
  annualFee?: number;
  hoaName?: string;
  hoaContact?: string;
  amenitiesIncluded?: string[];
  restrictions?: string[];
}

export interface UtilityCosts {
  electricity?: { provider: string; avgMonthly?: number };
  gas?: { provider: string; avgMonthly?: number };
  water?: { provider: string; avgMonthly?: number };
  internet?: { provider: string; avgMonthly?: number };
  cable?: { provider: string; avgMonthly?: number };
  waste?: { provider: string; avgMonthly?: number };
}

export interface LocationFeatures {
  walkScore?: number;
  transitScore?: number;
  bikeScore?: number;
  schools: SchoolInfo[];
  hospitals: NearbyPlace[];
  shopping: NearbyPlace[];
  restaurants: NearbyPlace[];
  parks: NearbyPlace[];
  transportation: NearbyPlace[];
  crimeRating?: number;
  floodZone?: string;
  earthquakeZone?: string;
}

export interface SchoolInfo {
  name: string;
  type: 'elementary' | 'middle' | 'high' | 'university' | 'private';
  rating?: number;
  distance: number; // in miles/km
  district?: string;
}

export interface NearbyPlace {
  name: string;
  type: string;
  distance: number; // in miles/km
  rating?: number;
}

// Property viewing and inquiry interfaces
export interface PropertyViewing {
  id: string;
  propertyId: string;
  property?: Property;
  requesterId: string;
  requester?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  professionalId: string;
  professional?: RealEstateProfessional;
  
  // Scheduling details
  scheduledAt: string;
  durationMinutes: number;
  meetingLocation: 'property' | 'office' | 'virtual';
  virtualMeetingUrl?: string;
  
  // Status and workflow
  status: ViewingStatus;
  confirmationRequired: boolean;
  remindersSent: number;
  
  // Additional information
  viewingType: 'private' | 'open_house' | 'group';
  attendeeCount: number;
  attendees?: ViewingAttendee[];
  specialRequests?: string;
  accessInstructions?: string;
  
  // Feedback and follow-up
  notes?: string;
  feedback?: ViewingFeedback;
  followUpRequired: boolean;
  followUpCompleted: boolean;
  
  // Communication
  messages?: ViewingMessage[];
  
  timestamps: {
    createdAt: string;
    updatedAt: string;
    confirmedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
  };
}

export interface ViewingAttendee {
  name: string;
  email?: string;
  phone?: string;
  relationship: 'primary' | 'spouse' | 'family' | 'agent' | 'other';
}

export interface ViewingFeedback {
  rating: number; // 1-5
  liked: string[];
  disliked: string[];
  concerns: string[];
  overallImpression: string;
  likelihood: number; // 1-10 likelihood to purchase/rent
  timeframe: 'immediate' | 'within_month' | 'within_3months' | 'within_6months' | 'just_looking';
  budgetFeedback?: string;
}

export interface ViewingMessage {
  id: string;
  senderId: string;
  senderType: 'requester' | 'professional';
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface PropertyInquiry {
  id: string;
  propertyId: string;
  property?: Property;
  inquirerId: string;
  inquirer?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  professionalId: string;
  
  // Inquiry details
  subject: string;
  message: string;
  inquiryType: 'general' | 'viewing_request' | 'price_inquiry' | 'availability' | 'financing' | 'other';
  priority: 'low' | 'medium' | 'high';
  
  // Status and responses
  status: 'new' | 'read' | 'responded' | 'closed' | 'follow_up_required';
  responses: InquiryResponse[];
  
  // Lead qualification
  buyerQualification?: BuyerQualification;
  isQualifiedLead: boolean;
  leadScore: number;
  
  // Follow-up
  followUpRequired: boolean;
  nextFollowUpAt?: string;
  followUpCount: number;
  
  // Source tracking
  source: 'website' | 'email' | 'phone' | 'walk_in' | 'referral' | 'social_media' | 'other';
  sourceDetails?: string;
  
  timestamps: {
    createdAt: string;
    updatedAt: string;
    firstResponseAt?: string;
    lastResponseAt?: string;
    closedAt?: string;
  };
}

export interface InquiryResponse {
  id: string;
  inquiryId: string;
  responderId: string;
  responderType: 'professional' | 'system';
  message: string;
  isAutoResponse: boolean;
  timestamp: string;
}

export interface BuyerQualification {
  budget: {
    min: number;
    max: number;
    currency: string;
    isPreApproved: boolean;
    lenderName?: string;
  };
  timeframe: 'immediate' | 'within_month' | 'within_3months' | 'within_6months' | 'over_6months';
  motivation: 'first_time_buyer' | 'upgrade' | 'downsize' | 'investment' | 'relocation' | 'other';
  currentSituation: 'renting' | 'own_need_to_sell' | 'own_will_keep' | 'living_with_family' | 'other';
  hasRealtor: boolean;
  realtorName?: string;
  needsFinancing: boolean;
  cashBuyer: boolean;
}

export interface RealtorRegistrationData {
  professionalType: RealEstateProfessionalType;
  licenseNumber?: string;
  agencyName?: string;
  agencyAddress?: string;
  specializations: string[];
  yearsExperience: number;
  documents: File[];
}

export interface PropertyFormData {
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  currency: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  parkingSpaces?: number;
  furnishingStatus?: 'furnished' | 'semi_furnished' | 'unfurnished';
  features: string[];
  amenities: string[];
  virtualTourUrl?: string;
  images: File[];
}

export interface PropertySearchFilters {
  propertyType?: PropertyType;
  listingType?: ListingType;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFootageMin?: number;
  squareFootageMax?: number;
  location?: string;
  features?: string[];
  sortBy?: 'price' | 'date' | 'size' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

// Dashboard and analytics interfaces
export interface PropertyDashboard {
  professionalId: string;
  overview: {
    totalListings: number;
    activeListings: number;
    pendingListings: number;
    soldListings: number;
    totalViews: number;
    totalInquiries: number;
    totalViewings: number;
    avgDaysOnMarket: number;
  };
  recentActivity: DashboardActivity[];
  performanceMetrics: PerformanceMetrics;
  marketInsights: MarketInsights;
}

export interface DashboardActivity {
  id: string;
  type: 'new_inquiry' | 'viewing_scheduled' | 'property_viewed' | 'price_updated' | 'status_changed';
  propertyId?: string;
  propertyTitle?: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

export interface PerformanceMetrics {
  thisMonth: {
    listings: number;
    views: number;
    inquiries: number;
    viewings: number;
    closedDeals: number;
  };
  lastMonth: {
    listings: number;
    views: number;
    inquiries: number;
    viewings: number;
    closedDeals: number;
  };
  trends: {
    listingsChange: number;
    viewsChange: number;
    inquiriesChange: number;
    viewingsChange: number;
    closedDealsChange: number;
  };
}

export interface MarketInsights {
  averagePriceInArea: number;
  medianDaysOnMarket: number;
  marketTrend: 'rising' | 'stable' | 'declining';
  competitorCount: number;
  demandLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
}

// Property comparison and recommendations
export interface PropertyComparison {
  targetProperty: Property;
  comparableProperties: ComparableProperty[];
  analysisDate: string;
  priceRecommendation: {
    suggestedPrice: number;
    minPrice: number;
    maxPrice: number;
    reasoning: string;
  };
}

export interface ComparableProperty {
  property: Property;
  similarityScore: number;
  differences: PropertyDifference[];
  pricePerSqft: number;
  daysOnMarket: number;
}

export interface PropertyDifference {
  field: string;
  targetValue: any;
  comparableValue: any;
  impact: 'positive' | 'negative' | 'neutral';
}

// Calendar and scheduling
export interface ViewingCalendar {
  professionalId: string;
  date: string;
  availability: TimeSlot[];
  scheduledViewings: PropertyViewing[];
  blockedTimes: BlockedTime[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  viewingId?: string;
}

export interface BlockedTime {
  id: string;
  startTime: string;
  endTime: string;
  reason: string;
  isRecurring: boolean;
  recurrencePattern?: string;
}

// Open house management
export interface OpenHouse {
  id: string;
  propertyId: string;
  property?: Property;
  professionalId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  maxAttendees?: number;
  registeredAttendees: OpenHouseAttendee[];
  walkInAttendees: OpenHouseAttendee[];
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  isPublic: boolean;
  registrationRequired: boolean;
  specialInstructions?: string;
  marketingChannels: string[];
  feedback: OpenHouseFeedback[];
  createdAt: string;
  updatedAt: string;
}

export interface OpenHouseAttendee {
  id: string;
  openHouseId: string;
  name: string;
  email: string;
  phone?: string;
  attendeeType: 'registered' | 'walk_in';
  checkInTime?: string;
  isQualifiedBuyer: boolean;
  feedback?: OpenHouseFeedback;
  followUpRequired: boolean;
}

export interface OpenHouseFeedback {
  attendeeId: string;
  rating: number;
  liked: string[];
  disliked: string[];
  interestedInViewing: boolean;
  priceOpinion: 'too_high' | 'fair' | 'good_value';
  likelihood: number;
  comments?: string;
}

// Marketing and lead generation
export interface MarketingCampaign {
  id: string;
  propertyId: string;
  property?: Property;
  professionalId: string;
  name: string;
  description: string;
  type: 'social_media' | 'email' | 'print' | 'online_ads' | 'direct_mail' | 'other';
  status: 'draft' | 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  targetAudience: TargetAudience;
  metrics: CampaignMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface TargetAudience {
  ageRange?: { min: number; max: number };
  income?: { min: number; max: number };
  location?: string[];
  interests?: string[];
  buyerType?: string[];
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  inquiries: number;
  viewings: number;
  costPerLead: number;
  conversionRate: number;
}

// Reports and analytics
export interface PropertyReport {
  propertyId: string;
  property?: Property;
  reportType: 'performance' | 'market_analysis' | 'pricing' | 'marketing';
  generatedAt: string;
  period: {
    startDate: string;
    endDate: string;
  };
  data: any; // Flexible structure based on report type
  recommendations: string[];
  exportFormats: string[];
}
