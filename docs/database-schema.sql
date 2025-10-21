-- ==============================================
-- GEORGY MARKETPLACE DATABASE SCHEMA
-- Comprehensive Classified Ads Platform
-- ==============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- CORE USER MANAGEMENT
-- ==============================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin', 'delivery', 'realtor', 'house_agent', 'house_owner', 'employer', 'employee')),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    bio TEXT,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Nigeria',
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User documents for verification
CREATE TABLE user_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('identity_card', 'passport', 'drivers_license', 'business_license', 'real_estate_license', 'cv', 'certificate', 'other')),
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- CATEGORIES AND LISTINGS
-- ==============================================

-- Main categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    parent_id UUID REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product/Service listings
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES categories(id),
    subcategory_id UUID REFERENCES categories(id),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    price DECIMAL(12, 2) NOT NULL,
    original_price DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'NGN',
    condition VARCHAR(20) CHECK (condition IN ('new', 'used', 'refurbished')),
    brand VARCHAR(100),
    model VARCHAR(100),
    location_city VARCHAR(100),
    location_state VARCHAR(100),
    location_country VARCHAR(100) DEFAULT 'Nigeria',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_negotiable BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'reserved', 'expired')),
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listing images
CREATE TABLE listing_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_alt TEXT,
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- REAL ESTATE SPECIFIC TABLES
-- ==============================================

-- Real estate professionals
CREATE TABLE real_estate_professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    professional_type VARCHAR(20) NOT NULL CHECK (professional_type IN ('realtor', 'house_agent', 'house_owner')),
    license_number VARCHAR(100),
    agency_name VARCHAR(200),
    agency_address TEXT,
    specializations TEXT[],
    years_experience INTEGER,
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property listings
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES real_estate_professionals(id),
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('apartment', 'house', 'condo', 'townhouse', 'land', 'commercial', 'office', 'warehouse')),
    listing_type VARCHAR(20) NOT NULL CHECK (listing_type IN ('sale', 'rent', 'lease')),
    bedrooms INTEGER,
    bathrooms DECIMAL(3, 1),
    square_footage INTEGER,
    lot_size INTEGER,
    year_built INTEGER,
    parking_spaces INTEGER,
    furnishing_status VARCHAR(20) CHECK (furnishing_status IN ('furnished', 'semi_furnished', 'unfurnished')),
    features TEXT[],
    amenities TEXT[],
    virtual_tour_url TEXT,
    floor_plan_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property viewing appointments
CREATE TABLE property_viewings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES profiles(id),
    professional_id UUID REFERENCES real_estate_professionals(id),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- JOB MATCHING PLATFORM
-- ==============================================

-- Employer profiles
CREATE TABLE employers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    company_description TEXT,
    industry VARCHAR(100),
    company_size VARCHAR(20) CHECK (company_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    website_url TEXT,
    logo_url TEXT,
    founded_year INTEGER,
    headquarters_location VARCHAR(200),
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee profiles
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    current_title VARCHAR(200),
    years_experience INTEGER,
    education_level VARCHAR(50),
    skills TEXT[],
    certifications TEXT[],
    languages TEXT[],
    salary_expectation_min DECIMAL(12, 2),
    salary_expectation_max DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'NGN',
    availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'employed', 'not_looking')),
    preferred_work_type VARCHAR(20) CHECK (preferred_work_type IN ('full_time', 'part_time', 'contract', 'freelance', 'remote')),
    resume_url TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job postings
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[],
    responsibilities TEXT[],
    benefits TEXT[],
    job_type VARCHAR(20) NOT NULL CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship', 'freelance', 'remote')),
    experience_level VARCHAR(20) CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
    salary_min DECIMAL(12, 2),
    salary_max DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'NGN',
    location_city VARCHAR(100),
    location_state VARCHAR(100),
    location_country VARCHAR(100) DEFAULT 'Nigeria',
    is_remote BOOLEAN DEFAULT FALSE,
    application_deadline TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'filled', 'expired', 'cancelled')),
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job applications
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    cover_letter TEXT,
    resume_url TEXT,
    portfolio_url TEXT,
    additional_documents TEXT[],
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'shortlisted', 'interview_scheduled', 'rejected', 'withdrawn', 'hired')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- ORDERS AND TRANSACTIONS
-- ==============================================

-- Shopping cart
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id UUID REFERENCES profiles(id),
    seller_id UUID REFERENCES profiles(id),
    total_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    shipping_address JSONB,
    billing_address JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- DELIVERY AND LOGISTICS
-- ==============================================

-- Delivery partners
CREATE TABLE delivery_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    api_endpoint TEXT,
    api_key TEXT,
    service_areas TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery assignments
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES delivery_partners(id),
    delivery_type VARCHAR(20) DEFAULT 'standard' CHECK (delivery_type IN ('standard', 'express', 'overnight', 'scheduled')),
    pickup_address JSONB,
    delivery_address JSONB,
    tracking_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'returned')),
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    delivery_cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- REVIEWS AND RATINGS
-- ==============================================

-- Reviews (for listings, users, properties, jobs)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID REFERENCES profiles(id),
    reviewee_id UUID REFERENCES profiles(id),
    listing_id UUID REFERENCES listings(id),
    property_id UUID REFERENCES properties(id),
    job_id UUID REFERENCES job_postings(id),
    order_id UUID REFERENCES orders(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- COMMUNICATIONS
-- ==============================================

-- Messages between users
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES profiles(id),
    recipient_id UUID REFERENCES profiles(id),
    listing_id UUID REFERENCES listings(id),
    property_id UUID REFERENCES properties(id),
    job_id UUID REFERENCES job_postings(id),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- FAVORITES AND SAVED ITEMS
-- ==============================================

-- Saved listings
CREATE TABLE saved_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- Saved searches
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    search_criteria JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- ANALYTICS AND TRACKING
-- ==============================================

-- Page views tracking
CREATE TABLE page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    listing_id UUID REFERENCES listings(id),
    property_id UUID REFERENCES properties(id),
    job_id UUID REFERENCES job_postings(id),
    page_type VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Profile indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_location ON profiles(city, state, country);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- Listing indexes
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_location ON listings(location_city, location_state);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_created_at ON listings(created_at);
CREATE INDEX idx_listings_user_id ON listings(user_id);

-- Property indexes
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_listing_type ON properties(listing_type);
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX idx_properties_price ON properties(bedrooms, bathrooms);

-- Job indexes
CREATE INDEX idx_jobs_employer ON job_postings(employer_id);
CREATE INDEX idx_jobs_location ON job_postings(location_city, location_state);
CREATE INDEX idx_jobs_type ON job_postings(job_type);
CREATE INDEX idx_jobs_status ON job_postings(status);
CREATE INDEX idx_jobs_created_at ON job_postings(created_at);

-- Order indexes
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Listing policies
CREATE POLICY "Anyone can view active listings" ON listings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can manage their own listings" ON listings
    FOR ALL USING (auth.uid() = user_id);

-- Order policies
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Message policies
CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- ==============================================
-- FUNCTIONS AND TRIGGERS
-- ==============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update timestamp trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- SAMPLE DATA CATEGORIES
-- ==============================================

-- Insert main categories
INSERT INTO categories (name, slug, description, icon) VALUES
('Electronics', 'electronics', 'Phones, computers, gadgets and electronic devices', '📱'),
('Vehicles', 'vehicles', 'Cars, motorcycles, trucks and automotive', '🚗'),
('Real Estate', 'real-estate', 'Houses, apartments, land and property', '🏠'),
('Fashion', 'fashion', 'Clothing, shoes, accessories and beauty', '👗'),
('Home & Garden', 'home-garden', 'Furniture, appliances, tools and garden items', '🏡'),
('Sports & Recreation', 'sports-recreation', 'Sports equipment, fitness and outdoor gear', '⚽'),
('Jobs', 'jobs', 'Employment opportunities and career listings', '💼'),
('Services', 'services', 'Professional services and skilled trades', '🔧'),
('Education', 'education', 'Books, courses, tutoring and educational materials', '📚'),
('Health & Beauty', 'health-beauty', 'Health products, beauty items and wellness', '💄');

-- Insert electronics subcategories
INSERT INTO categories (name, slug, description, parent_id) VALUES
('Mobile Phones', 'mobile-phones', 'Smartphones and mobile devices', (SELECT id FROM categories WHERE slug = 'electronics')),
('Computers', 'computers', 'Laptops, desktops and computer accessories', (SELECT id FROM categories WHERE slug = 'electronics')),
('Audio & Video', 'audio-video', 'Headphones, speakers, cameras and entertainment', (SELECT id FROM categories WHERE slug = 'electronics')),
('Gaming', 'gaming', 'Video games, consoles and gaming accessories', (SELECT id FROM categories WHERE slug = 'electronics'));

-- Insert vehicle subcategories
INSERT INTO categories (name, slug, description, parent_id) VALUES
('Cars', 'cars', 'Sedans, SUVs, hatchbacks and luxury vehicles', (SELECT id FROM categories WHERE slug = 'vehicles')),
('Motorcycles', 'motorcycles', 'Bikes, scooters and motorcycle accessories', (SELECT id FROM categories WHERE slug = 'vehicles')),
('Trucks & Commercial', 'trucks-commercial', 'Trucks, vans and commercial vehicles', (SELECT id FROM categories WHERE slug = 'vehicles')),
('Auto Parts', 'auto-parts', 'Vehicle parts, accessories and maintenance', (SELECT id FROM categories WHERE slug = 'vehicles'));

-- Insert real estate subcategories
INSERT INTO categories (name, slug, description, parent_id) VALUES
('Houses for Sale', 'houses-sale', 'Residential houses and properties for purchase', (SELECT id FROM categories WHERE slug = 'real-estate')),
('Houses for Rent', 'houses-rent', 'Rental properties and apartments', (SELECT id FROM categories WHERE slug = 'real-estate')),
('Land & Plots', 'land-plots', 'Land, plots and development opportunities', (SELECT id FROM categories WHERE slug = 'real-estate')),
('Commercial Property', 'commercial-property', 'Office spaces, shops and commercial real estate', (SELECT id FROM categories WHERE slug = 'real-estate'));

-- Insert job subcategories
INSERT INTO categories (name, slug, description, parent_id) VALUES
('Technology', 'technology-jobs', 'IT, software development and tech roles', (SELECT id FROM categories WHERE slug = 'jobs')),
('Healthcare', 'healthcare-jobs', 'Medical, nursing and healthcare positions', (SELECT id FROM categories WHERE slug = 'jobs')),
('Education', 'education-jobs', 'Teaching, training and educational roles', (SELECT id FROM categories WHERE slug = 'jobs')),
('Sales & Marketing', 'sales-marketing-jobs', 'Sales, marketing and business development', (SELECT id FROM categories WHERE slug = 'jobs')),
('Finance', 'finance-jobs', 'Banking, accounting and financial services', (SELECT id FROM categories WHERE slug = 'jobs'));
