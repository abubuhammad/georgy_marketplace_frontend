// Seller Management Types

export interface SellerAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalProducts: number;
  activeProducts: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  conversionRate: number;
  customerRating: number;
  totalReviews: number;
  revenueGrowth: number;
  orderGrowth: number;
  topSellingProducts: ProductSalesData[];
  revenueByMonth: MonthlyRevenue[];
  ordersByStatus: OrderStatusCount[];
  customerMetrics: CustomerMetrics;
  inventoryMetrics: InventoryMetrics;
}

export interface ProductSalesData {
  productId: string;
  productName: string;
  imageUrl?: string;
  totalSold: number;
  revenue: number;
  averageRating: number;
  viewCount: number;
  conversionRate: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
  percentage: number;
}

export interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  averageCustomerValue: number;
}

export interface InventoryMetrics {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  averageStockLevel: number;
  stockTurnoverRate: number;
}

// Inventory Management Types
export interface InventoryItem {
  id: string;
  productId: string;
  product: {
    id: string;
    title: string;
    sku: string;
    images: Array<{ image_url: string }>;
    price: number;
    category: string;
  };
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderLevel: number;
  reorderQuantity: number;
  supplier?: string;
  cost: number;
  location?: string;
  lastUpdated: string;
  movements: InventoryMovement[];
}

export interface InventoryMovement {
  id: string;
  type: 'in' | 'out' | 'adjustment' | 'reserve' | 'release';
  quantity: number;
  reason: string;
  reference?: string; // Order ID, Purchase ID, etc.
  timestamp: string;
  userId: string;
  notes?: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  severity: 'low' | 'critical' | 'out_of_stock';
  createdAt: string;
  acknowledged: boolean;
}

// Seller Profile & Verification Types
export interface SellerProfile {
  id: string;
  userId: string;
  businessName: string;
  businessDescription: string;
  businessType: 'individual' | 'small_business' | 'corporation' | 'nonprofit';
  businessAddress: SellerAddress;
  contactInfo: SellerContactInfo;
  bankDetails: SellerBankDetails;
  taxInfo: SellerTaxInfo;
  socialMedia: SellerSocialMedia;
  branding: SellerBranding;
  verification: SellerVerification;
  settings: SellerSettings;
  statistics: SellerStatistics;
  createdAt: string;
  updatedAt: string;
}

export interface SellerAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface SellerContactInfo {
  primaryPhone: string;
  secondaryPhone?: string;
  businessEmail: string;
  supportEmail?: string;
  website?: string;
  whatsapp?: string;
}

export interface SellerBankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  routingNumber?: string;
  swiftCode?: string;
  verified: boolean;
}

export interface SellerTaxInfo {
  taxId?: string;
  vatNumber?: string;
  businessLicense?: string;
  taxExempt: boolean;
}

export interface SellerSocialMedia {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

export interface SellerBranding {
  logo?: string;
  coverImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  slogan?: string;
}

export interface SellerVerification {
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  level: 'basic' | 'standard' | 'premium' | 'enterprise';
  documentsSubmitted: VerificationDocument[];
  verifiedAt?: string;
  expiresAt?: string;
  rejectionReason?: string;
  badges: VerificationBadge[];
}

export interface VerificationDocument {
  id: string;
  type: 'business_license' | 'tax_id' | 'identity' | 'address_proof' | 'bank_statement';
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  reviewedAt?: string;
  notes?: string;
}

export interface VerificationBadge {
  id: string;
  type: 'verified_business' | 'top_seller' | 'fast_shipping' | 'excellent_service' | 'eco_friendly';
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface SellerSettings {
  autoAcceptOrders: boolean;
  autoConfirmPayment: boolean;
  enableNotifications: boolean;
  workingHours: WorkingHours[];
  shippingPolicies: ShippingPolicy[];
  returnPolicy: ReturnPolicy;
  customPolicies: CustomPolicy[];
  languages: string[];
  currency: string;
  timezone: string;
}

export interface WorkingHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface ShippingPolicy {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: number;
  regions: string[];
  active: boolean;
}

export interface ReturnPolicy {
  acceptReturns: boolean;
  returnWindow: number; // days
  restockingFee: number;
  conditions: string[];
  instructions: string;
}

export interface CustomPolicy {
  id: string;
  title: string;
  content: string;
  type: 'warranty' | 'privacy' | 'terms' | 'other';
  active: boolean;
}

export interface SellerStatistics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageRating: number;
  totalReviews: number;
  responseTime: number; // hours
  orderFulfillmentRate: number; // percentage
  onTimeDeliveryRate: number; // percentage
}

// Customer Communication Types
export interface CustomerMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'customer' | 'seller';
  recipientId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  attachments: MessageAttachment[];
  timestamp: string;
  readAt?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface Conversation {
  id: string;
  customerId: string;
  sellerId: string;
  orderId?: string;
  productId?: string;
  subject: string;
  status: 'active' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lastMessage: CustomerMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

// Performance Analytics Types
export interface SellerPerformanceMetrics {
  period: {
    startDate: string;
    endDate: string;
  };
  sales: SalesMetrics;
  products: ProductMetrics;
  customers: CustomerMetrics;
  operations: OperationalMetrics;
  financial: FinancialMetrics;
  competition: CompetitionMetrics;
}

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  salesGrowth: number;
  bestSellingCategory: string;
  peakSalesHour: number;
  salesByChannel: ChannelSales[];
  salesTrends: DailySales[];
}

export interface ProductMetrics {
  totalProducts: number;
  newProducts: number;
  bestPerformers: ProductSalesData[];
  underPerformers: ProductSalesData[];
  outOfStock: number;
  lowStock: number;
  averageViews: number;
  conversionRate: number;
}

export interface OperationalMetrics {
  orderFulfillmentTime: number; // average hours
  shippingAccuracy: number; // percentage
  returnRate: number; // percentage
  customerSatisfaction: number; // rating
  responseTime: number; // average hours
  disputeRate: number; // percentage
}

export interface FinancialMetrics {
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  totalExpenses: number;
  payoutReceived: number;
  pendingPayout: number;
  refundTotal: number;
  chargebackTotal: number;
}

export interface CompetitionMetrics {
  marketShare: number;
  priceCompetitiveness: number;
  rankingPosition: number;
  competitorCount: number;
  priceAdvantage: number;
}

export interface ChannelSales {
  channel: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface DailySales {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

// Seller Onboarding Types
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  required: boolean;
  order: number;
  estimatedTime: number; // minutes
}

export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  progressPercentage: number;
  steps: OnboardingStep[];
  startedAt: string;
  completedAt?: string;
}

export interface SellerApplication {
  id: string;
  userId: string;
  businessDetails: BusinessDetails;
  documents: ApplicationDocument[];
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

export interface BusinessDetails {
  businessName: string;
  businessType: string;
  businessDescription: string;
  businessAddress: SellerAddress;
  contactInfo: SellerContactInfo;
  expectedVolume: string;
  categories: string[];
}

export interface ApplicationDocument {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  required: boolean;
  verified: boolean;
  uploadedAt: string;
}
