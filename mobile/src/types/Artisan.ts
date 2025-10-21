export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface Artisan {
  id: string;
  user_id: string;
  business_name: string;
  description: string;
  service_categories: string[];
  location: string;
  rating: number;
  completed_jobs: number;
  hourly_rate: number;
  availability_status: 'available' | 'busy' | 'offline';
  profile_image?: string;
  verified: boolean;
  phone: string;
  email: string;
  portfolio_images?: string[];
  certifications?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ServiceRequest {
  id: string;
  customer_id: string;
  artisan_id?: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget_min?: number;
  budget_max?: number;
  preferred_date?: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  request_id: string;
  artisan_id: string;
  price: number;
  estimated_duration: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  request_id: string;
  quote_id: string;
  customer_id: string;
  artisan_id: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string;
  completion_date?: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
}
