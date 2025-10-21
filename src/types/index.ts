// Core entity types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
}

export type UserRole = 'customer' | 'seller' | 'admin' | 'delivery' | 'realtor' | 'house_agent' | 'house_owner' | 'employer' | 'job_seeker' | 'artisan';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: Category;
  subcategory?: string;
  brand?: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  sellerId: string;
  seller: Seller;
  specifications?: Record<string, string>;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  children?: Category[];
  isActive: boolean;
}

export interface Seller {
  id: string;
  userId: string;
  user: User;
  businessName: string;
  businessDescription?: string;
  businessAddress: Address;
  businessPhone: string;
  businessEmail: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  documents: Document[];
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  addedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  user: User;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingMethod: ShippingMethod;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  totalPrice: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'bank_transfer' | 'paystack' | 'cash_on_delivery';
export type ShippingMethod = 'standard' | 'express' | 'overnight';

export interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  price: number;
  currency: string;
  images: string[];
  address: Address;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  areaUnit: 'sqm' | 'sqft';
  features: string[];
  realtorId: string;
  realtor: Realtor;
  status: PropertyStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PropertyType = 'apartment' | 'house' | 'condo' | 'townhouse' | 'land' | 'commercial';
export type PropertyStatus = 'for_sale' | 'for_rent' | 'sold' | 'rented';

export interface Realtor {
  id: string;
  userId: string;
  user: User;
  licenseNumber: string;
  agency?: string;
  specializations: string[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: JobType;
  category: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  requirements: string[];
  benefits: string[];
  employerId: string;
  employer: Employer;
  status: JobStatus;
  applicationsCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'remote';
export type JobStatus = 'active' | 'paused' | 'closed' | 'expired';

export interface Employer {
  id: string;
  userId: string;
  user: User;
  companyName: string;
  companyDescription?: string;
  website?: string;
  industry: string;
  size: CompanySize;
  logo?: string;
  isVerified: boolean;
  createdAt: string;
}

export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';

export interface JobApplication {
  id: string;
  jobId: string;
  job: Job;
  applicantId: string;
  applicant: User;
  resume: string;
  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected';

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  role: UserRole;
}

export interface ProductForm {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  subcategory?: string;
  brand?: string;
  stockQuantity: number;
  images: File[];
  specifications?: Record<string, string>;
  tags: string[];
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  inStock?: boolean;
  sortBy?: 'price' | 'rating' | 'newest' | 'popular';
  sortOrder?: 'asc' | 'desc';
}

export interface PropertyFilters {
  type?: PropertyType;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  areaMin?: number;
  areaMax?: number;
  location?: string;
}

export interface JobFilters {
  type?: JobType;
  category?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  remote?: boolean;
}

// ArtisanConnect Types
export interface Artisan {
  id: string;
  userId: string;
  user: User;
  businessName: string;
  description: string;
  categories: ServiceCategory[];
  skills: string[];
  experience: number; // years
  hourlyRate: number;
  location: ArtisanLocation;
  serviceArea: number; // radius in km
  portfolio: PortfolioItem[];
  certifications: Certification[];
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseTime: number; // average response time in minutes
  availability: ArtisanAvailability;
  isVerified: boolean;
  isOnline: boolean;
  isActive: boolean;
  joinedAt: string;
  lastActive: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  parentId?: string;
  children?: ServiceCategory[];
  isActive: boolean;
}

export interface ArtisanLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  completedAt: string;
  clientReview?: string;
  clientRating?: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  number: string;
  issuedAt: string;
  expiresAt?: string;
  document: string; // URL to certificate document
  isVerified: boolean;
}

export interface ArtisanAvailability {
  schedule: DaySchedule[];
  unavailableDates: string[];
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
  };
  timezone: string;
}

export interface DaySchedule {
  day: string; // "monday", "tuesday", etc.
  isAvailable: boolean;
  slots: TimeSlot[];
}

export interface TimeSlot {
  start: string; // "09:00"
  end: string; // "10:00"
  isBooked: boolean;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  customer: User;
  title: string;
  description: string;
  category: ServiceCategory;
  location: ArtisanLocation;
  images: string[];
  urgency: RequestUrgency;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  preferredDate?: string;
  preferredTime?: string;
  requirements: string[];
  status: RequestStatus;
  assignedArtisanId?: string;
  assignedArtisan?: Artisan;
  quotes: ServiceQuote[];
  payment?: ServicePayment;
  chat?: ServiceChat;
  createdAt: string;
  updatedAt: string;
}

export type RequestUrgency = 'low' | 'normal' | 'high' | 'emergency';
export type RequestStatus = 'pending' | 'quoted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

export interface ServiceQuote {
  id: string;
  requestId: string;
  artisanId: string;
  artisan: Artisan;
  price: number;
  currency: string;
  description: string;
  estimatedDuration: number; // hours
  materials: QuoteMaterial[];
  availableFrom: string;
  expiresAt: string;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
}

export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface QuoteMaterial {
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

export interface ServicePayment {
  id: string;
  requestId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: ServicePaymentStatus;
  escrowStatus: EscrowStatus;
  platformFee: number;
  artisanAmount: number;
  paidAt?: string;
  releasedAt?: string;
  refundedAt?: string;
  transactionId?: string;
}

export type ServicePaymentStatus = 'pending' | 'paid' | 'released' | 'refunded' | 'disputed';
export type EscrowStatus = 'held' | 'released' | 'disputed' | 'refunded';

export interface ServiceChat {
  id: string;
  requestId: string;
  participants: string[]; // user IDs
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  sender: User;
  message: string;
  type: MessageType;
  attachments?: MessageAttachment[];
  readBy: string[]; // user IDs who have read this message
  sentAt: string;
}

export type MessageType = 'text' | 'image' | 'document' | 'location' | 'system';

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface ServiceReview {
  id: string;
  requestId: string;
  customerId: string;
  customer: User;
  artisanId: string;
  artisan: Artisan;
  rating: number;
  comment: string;
  images?: string[];
  qualities: ReviewQuality[];
  wouldRecommend: boolean;
  createdAt: string;
}

export interface ReviewQuality {
  name: string; // "punctuality", "quality", "communication", etc.
  rating: number;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  newRequests: boolean;
  newQuotes: boolean;
  messages: boolean;
  statusUpdates: boolean;
  promotions: boolean;
}

// Forms
export interface ArtisanRegistrationForm {
  businessName: string;
  description: string;
  categories: string[];
  skills: string[];
  experience: number;
  hourlyRate: number;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  serviceArea: number;
  workingHours: {
    start: string;
    end: string;
  };
  certifications: File[];
  portfolioImages: File[];
}

export interface ServiceRequestForm {
  title: string;
  description: string;
  categoryId: string;
  location: {
    address: string;
    city: string;
    state: string;
  };
  images: File[];
  urgency: RequestUrgency;
  budget: {
    min: number;
    max: number;
  };
  preferredDate?: string;
  preferredTime?: string;
  requirements: string[];
}

export interface ServiceQuoteForm {
  price: number;
  description: string;
  estimatedDuration: number;
  materials: QuoteMaterial[];
  availableFrom: string;
}

// Filters
export interface ArtisanFilters {
  categories?: string[];
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  rating?: number;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  availability?: string; // date
  isVerified?: boolean;
  experience?: number;
}

export interface ServiceRequestFilters {
  status?: RequestStatus;
  category?: string;
  urgency?: RequestUrgency;
  budgetMin?: number;
  budgetMax?: number;
  dateFrom?: string;
  dateTo?: string;
}

// Dashboard Analytics
export interface ArtisanAnalytics {
  totalEarnings: number;
  thisMonthEarnings: number;
  completedJobs: number;
  activeJobs: number;
  averageRating: number;
  responseRate: number;
  responseTime: number;
  repeatCustomers: number;
  earningsChart: ChartData[];
  jobsChart: ChartData[];
}

export interface ChartData {
  date: string;
  value: number;
  label?: string;
}

export interface CustomerAnalytics {
  totalSpent: number;
  servicesUsed: number;
  favoriteCategories: string[];
  recentRequests: number;
  averageSpending: number;
}