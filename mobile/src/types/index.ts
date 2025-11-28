// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  userType: 'customer' | 'artisan' | 'admin';
  isVerified: boolean;
  location?: Location;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfile extends User {
  userType: 'customer';
  preferredCategories?: string[];
  deliveryAddress?: Address;
  paymentMethods?: PaymentMethod[];
}

export interface ArtisanProfile extends User {
  userType: 'artisan';
  skills: string[];
  categories: ServiceCategory[];
  rating: number;
  reviewCount: number;
  completedJobs: number;
  hourlyRate?: number;
  bio?: string;
  portfolio: PortfolioItem[];
  serviceAreas: Location[];
  availability: Availability;
  certifications: Certification[];
  isOnline: boolean;
}

// Location & Address
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

// Service Types
export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  subcategories?: ServiceSubcategory[];
}

export interface ServiceSubcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  categoryId: string;
  subcategoryId?: string;
  title: string;
  description: string;
  photos: string[];
  location: Location;
  preferredTime?: string;
  urgency: 'low' | 'medium' | 'high';
  budget?: {
    min: number;
    max: number;
  };
  status: 'pending' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  quotes: Quote[];
  selectedArtisanId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  artisanId: string;
  requestId: string;
  amount: number;
  estimatedDuration: string;
  description: string;
  startDate?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

// Job Management
export interface Job {
  id: string;
  requestId: string;
  customerId: string;
  artisanId: string;
  quoteId: string;
  title: string;
  description: string;
  amount: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  photos: JobPhoto[];
  updates: JobUpdate[];
  payment: Payment;
  review?: Review;
}

export interface JobPhoto {
  id: string;
  url: string;
  type: 'before' | 'progress' | 'completed';
  uploadedAt: string;
  uploadedBy: string;
}

export interface JobUpdate {
  id: string;
  message: string;
  photos: string[];
  createdAt: string;
  createdBy: string;
}

// Payment & Escrow
export interface Payment {
  id: string;
  jobId: string;
  amount: number;
  status: 'pending' | 'held_in_escrow' | 'released' | 'refunded';
  method: PaymentMethod;
  escrowReleaseDate?: string;
  transactionId?: string;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile_money' | 'bank_transfer';
  details: any; // Specific to payment type
  isDefault: boolean;
}

// Chat & Communication
export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  jobId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'voice' | 'file';
  fileUrl?: string;
  isRead: boolean;
  createdAt: string;
}

// Reviews & Ratings
export interface Review {
  id: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  photos?: string[];
  createdAt: string;
}

// Portfolio & Certifications
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  photos: string[];
  category: string;
  completedAt: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string;
  expiryDate?: string;
  documentUrl?: string;
  isVerified: boolean;
}

// Availability & Calendar
export interface Availability {
  schedule: WeeklySchedule;
  timeZone: string;
  bookedSlots: BookedSlot[];
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isAvailable: boolean;
  startTime?: string; // "09:00"
  endTime?: string;   // "17:00"
  breaks?: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface BookedSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  jobId: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
}

// Notifications
export interface Notification {
  id: string;
  userId: string;
  type: 'new_request' | 'quote_received' | 'job_update' | 'payment' | 'review' | 'chat';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Search & Filter Types
export interface SearchFilters {
  category?: string;
  subcategory?: string;
  location?: Location;
  radius?: number; // in kilometers
  minRating?: number;
  maxPrice?: number;
  availability?: 'available_now' | 'available_today' | 'available_this_week';
  sortBy?: 'rating' | 'price' | 'distance' | 'reviews';
  sortOrder?: 'asc' | 'desc';
}

export interface ArtisanSearchResult {
  artisan: ArtisanProfile;
  distance?: number;
  averageResponseTime?: string;
  isAvailableNow: boolean;
}
