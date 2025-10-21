// Customer feature types

// Core customer types
export interface CustomerStats {
  activeOrders: number;
  savedItems: number;
  totalSpent: number;
  reviewsGiven: number;
  loyaltyPoints: number;
  membershipLevel: string;
  accountAge: number; // in days
  lastActivity: string;
}

export interface CustomerActivity {
  id: string;
  type: 'order_placed' | 'order_delivered' | 'item_saved' | 'review_submitted' | 'payment_made' | 
        'account_created' | 'profile_updated' | 'wishlist_shared' | 'referral_made' | 'milestone_reached';
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'action' | 'info';
  metadata?: Record<string, any>;
  points?: number; // loyalty points earned
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  totalAmount: number;
  itemCount: number;
  orderDate: string;
  deliveryDate?: string;
  trackingNumber?: string;
  items: CustomerOrderItem[];
  paymentMethod: string;
  shippingAddress: CustomerAddress;
  billingAddress?: CustomerAddress;
  notes?: string;
  estimatedDelivery?: string;
}

export interface CustomerOrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  quantity: number;
  price: number;
  totalPrice: number;
  sellerId: string;
  sellerName: string;
  reviewId?: string; // if customer reviewed this item
}

export interface CustomerPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
    securityAlerts: boolean;
    priceDrops: boolean;
    backInStock: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showOnlineStatus: boolean;
    allowMessages: boolean;
    shareActivity: boolean;
    allowDataAnalytics: boolean;
  };
  display: {
    currency: string;
    language: string;
    timeZone: string;
    theme: 'light' | 'dark' | 'auto';
    listingView: 'grid' | 'list';
    itemsPerPage: number;
  };
  shopping: {
    autoSaveCart: boolean;
    quickBuy: boolean;
    priceAlerts: boolean;
    recommendationsEnabled: boolean;
    defaultPaymentMethod?: string;
    defaultShippingAddress?: string;
  };
}

// Onboarding and engagement types
export interface CustomerOnboarding {
  id: string;
  customerId: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  skipppedSteps: string[];
  startedAt: string;
  completedAt?: string;
  isCompleted: boolean;
  progress: number; // percentage
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  isRequired: boolean;
  isCompleted: boolean;
  isSkippable: boolean;
  order: number;
  estimatedTime: number; // in minutes
  rewards?: {
    points: number;
    badge?: string;
  };
}

export interface CustomerEngagement {
  customerId: string;
  loyaltyLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  totalPoints: number;
  availablePoints: number;
  lifetimeSpent: number;
  referralCount: number;
  reviewCount: number;
  avgRating: number;
  streakDays: number; // consecutive login days
  lastEngagement: string;
  badges: CustomerBadge[];
  milestones: CustomerMilestone[];
}

export interface CustomerBadge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: string;
  category: 'purchase' | 'engagement' | 'social' | 'achievement' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface CustomerMilestone {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  isCompleted: boolean;
  completedAt?: string;
  reward: {
    points: number;
    discount?: number;
    freeShipping?: boolean;
    badge?: string;
  };
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  instructions?: string;
}

export interface CustomerWishlist {
  id: string;
  customerId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
  sharedWith?: string[]; // user IDs
}

export interface WishlistItem {
  id: string;
  productId: string;
  addedAt: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  priceAlert?: {
    enabled: boolean;
    targetPrice: number;
  };
}

export interface CustomerSupport {
  id: string;
  customerId: string;
  subject: string;
  category: 'order' | 'payment' | 'shipping' | 'product' | 'account' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  messages: SupportMessage[];
  assignedTo?: string; // support agent ID
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'customer' | 'agent' | 'system';
  message: string;
  attachments?: string[];
  timestamp: string;
  isRead: boolean;
}

export interface CustomerNotification {
  id: string;
  customerId: string;
  type: 'order' | 'promotion' | 'system' | 'social' | 'security';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  scheduledFor?: string;
  sentAt?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface CustomerRecommendation {
  id: string;
  customerId: string;
  type: 'product' | 'category' | 'seller' | 'bundle';
  title: string;
  description: string;
  items: RecommendationItem[];
  algorithm: 'collaborative' | 'content' | 'hybrid' | 'trending' | 'personalized';
  confidence: number; // 0-1
  reason: string;
  createdAt: string;
  expiresAt?: string;
  isViewed: boolean;
  isClicked: boolean;
}

export interface RecommendationItem {
  productId: string;
  score: number;
  reason: string;
}

// Analytics and insights
export interface CustomerInsights {
  customerId: string;
  shoppingBehavior: {
    preferredCategories: string[];
    avgOrderValue: number;
    purchaseFrequency: number; // orders per month
    seasonalTrends: Record<string, number>;
    timeOfDayPreference: string;
    devicePreference: 'mobile' | 'desktop' | 'tablet';
  };
  engagement: {
    sessionDuration: number; // average in minutes
    pagesPerSession: number;
    bounceRate: number;
    conversionRate: number;
    returnRate: number;
  };
  preferences: {
    priceRange: { min: number; max: number };
    brandAffinity: string[];
    colorPreferences: string[];
    sizePreferences: string[];
  };
  predictions: {
    nextPurchaseDate?: string;
    churnRisk: 'low' | 'medium' | 'high';
    lifetimeValue: number;
    recommendedProducts: string[];
  };
}
