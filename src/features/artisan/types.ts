// ArtisanConnect Types and Interfaces

export interface Artisan {
  id: string;
  user_id: string;
  business_name?: string;
  description: string;
  services: string[];
  specializations: string[];
  service_areas: string[];
  hourly_rate: number;
  experience_years: number;
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
  };
  portfolio: PortfolioItem[];
  certifications: Certification[];
  verification_status: 'pending' | 'verified' | 'rejected';
  rating: number;
  total_reviews: number;
  completed_jobs: number;
  response_time: number; // in minutes
  is_available: boolean;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  profile_image?: string;
  cover_image?: string;
  insurance_verified: boolean;
  background_check: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  completion_date: string;
  category: string;
  customer_review?: string;
  cost: number;
}

export interface Certification {
  id: string;
  name: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date?: string;
  certificate_url?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
}

export interface ServiceRequest {
  id: string;
  customer_id: string;
  category: string;
  title: string;
  description: string;
  images: string[];
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  budget_range: {
    min: number;
    max: number;
  };
  preferred_date: string;
  preferred_time?: string;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  status: 'open' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  requirements: string[];
  access_details?: string;
  contact_preference: 'chat' | 'call' | 'both';
  created_at: string;
  updated_at: string;
}

export interface ServiceQuote {
  id: string;
  service_request_id: string;
  artisan_id: string;
  quoted_price: number;
  estimated_duration: string;
  description: string;
  includes: string[];
  excludes?: string[];
  materials_cost?: number;
  labor_cost: number;
  valid_until: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
}

export interface ServiceJob {
  id: string;
  service_request_id: string;
  artisan_id: string;
  customer_id: string;
  quote_id: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  scheduled_date: string;
  scheduled_time: string;
  started_at?: string;
  completed_at?: string;
  payment_status: 'pending' | 'escrowed' | 'released' | 'disputed';
  total_amount: number;
  platform_fee: number;
  artisan_earnings: number;
  progress_updates: ProgressUpdate[];
  completion_photos?: string[];
  customer_notes?: string;
  artisan_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProgressUpdate {
  id: string;
  timestamp: string;
  status: string;
  message: string;
  images?: string[];
  updated_by: 'artisan' | 'customer' | 'system';
}

export interface ArtisanDashboard {
  overview: {
    total_jobs: number;
    active_jobs: number;
    pending_requests: number;
    total_earnings: number;
    rating: number;
    response_rate: number;
    completion_rate: number;
    repeat_customers: number;
  };
  recent_activity: ServiceActivity[];
  upcoming_appointments: ServiceJob[];
  earnings: {
    today: number;
    this_week: number;
    this_month: number;
    pending: number;
  };
  performance_metrics: {
    avg_response_time: number;
    job_completion_rate: number;
    customer_satisfaction: number;
    repeat_booking_rate: number;
  };
}

export interface ServiceActivity {
  id: string;
  type: 'request_received' | 'quote_sent' | 'job_started' | 'job_completed' | 'payment_received' | 'review_received';
  title: string;
  description: string;
  timestamp: string;
  related_id?: string;
  metadata?: any;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  base_price_range: {
    min: number;
    max: number;
  };
  is_emergency_available: boolean;
}

// Form interfaces
export interface CreateServiceRequestData {
  category: string;
  title: string;
  description: string;
  images: File[];
  urgency: string;
  budget_min: number;
  budget_max: number;
  preferred_date: string;
  preferred_time?: string;
  address: string;
  city: string;
  state: string;
  requirements: string[];
  access_details?: string;
  contact_preference: string;
}

export interface CreateQuoteData {
  service_request_id: string;
  quoted_price: number;
  estimated_duration: string;
  description: string;
  includes: string[];
  excludes?: string[];
  materials_cost?: number;
  labor_cost: number;
  valid_days: number;
}

export interface ArtisanRegistrationData {
  business_name?: string;
  description: string;
  services: string[];
  specializations: string[];
  service_areas: string[];
  hourly_rate: number;
  experience_years: number;
  certifications: Omit<Certification, 'id'>[];
  portfolio: Omit<PortfolioItem, 'id'>[];
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
  };
}

export type ArtisanStatus = 'active' | 'busy' | 'offline' | 'on_job';
export type JobStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
export type PaymentStatus = 'pending' | 'escrowed' | 'released' | 'disputed';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
