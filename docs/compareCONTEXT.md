# Classified Ads Web Application Documentation


## Introduction
This document provides a detailed guide for creating a classified ads web application. The site features:

- A homepage with prominent search functionality and category shortcuts
- A grid/list of recent or popular listings
- Individual listing pages with images, descriptions, and seller contact details
- User accounts for posting and managing ads
- A responsive design compatible with desktop and mobile devices
- Specialized real estate listings for Realtors, House Agents, and House Owners

## Project Overview
This web application is designed for users to buy and sell various items (electronics, vehicles, properties, etc.) and for real estate professionals to list properties. Key objectives include:

- Ease of navigation with top-level categories and a prominent search bar
- Intuitive listing creation and management for sellers
- Responsive and modern UI with consistent branding and layout
- Secure user authentication to protect user data
- Specialized real estate listing forms for different user types

## Design & Layout

### Color Scheme
Based on the screenshot, the dominant color is Green (#00B907 or a similar shade), complemented by White (#FFFFFF) and shades of Gray for text and backgrounds.

- **Primary color**: Green (for header, main buttons, etc.)
- **Secondary color**: White (backgrounds, cards)
- **Accent color**: Light gray (#F8F8F8 or #F0F0F0) for sections or hover states

### Typography
- Clean, sans-serif font (e.g., Open Sans, Roboto, or Helvetica)
- Bold headings with slightly larger size than body text
- Medium weight body text for readability

### Layout Structure

#### Header
- Logo (left)
- Search bar (center)
- Profile/Sign In and "Post Ad" button (right)

#### Category Section
- Display category icons or text-based category links horizontally

#### Main Content
- Grid or list view of featured/recent listings (thumbnail, title, price)
- Pagination or infinite scroll for additional listings

#### Footer
- Quick links (Help Center, Contact, Terms & Conditions, etc.)
- Social media icons
- Copyright

## Core Features

### Homepage & Navigation
- Prominent Search Bar with a placeholder like "What are you looking for?"
- Category Icons/Links for quick navigation
- Featured Listings or newly added listings displayed in a card-based grid

### Category Browsing
- Users can click on a category to filter listings (e.g., Vehicles, Properties, Electronics)
- Subcategories or advanced filters (e.g., location, price range, brand) can be shown on the sidebar

### Search Functionality
- Search input in the header or a dedicated search bar on the homepage
- Autocomplete suggestions for categories or popular searches (optional)
- Search results page showing matching listings with filters to refine results

### Product/Listing Pages
- Listing image gallery (at least one main image, plus optional additional images)
- Listing details: Title, Price, Description, Location, Contact
- Seller/Poster details (user profile link, phone number or chat functionality)

### User Authentication & Profiles
- Sign Up: Email, phone number, or social login (optional)
- Sign In: Existing credentials
- User Profile: View posted listings, edit personal information, manage favorites, etc.
- Specialized user types: seller, Employer, Employee, Realtor, House Agent, House Owner

### Posting and Managing Listings
- Post Ad form:
  - Title, Category, Price, Location, Description, Images
  - Option to mark item as new/used or highlight special features
- Edit Ad: Ability to update or remove existing listings
- Dashboard: An overview of all user's active/inactive listings
- Specialized real estate listing forms for Realtors, House Agents, and House Owners

### Footer & Extra Pages
- Footer Links: About Us, Terms & Conditions, Privacy Policy, Safety Tips, etc.
- Contact Page: A simple form to send messages or inquiries
- Help/FAQ: Common user questions and guides

### Services Section
- Job Matching Platform
  - Employer and Employee matching system
  - Job listing and candidate search
  - Interview and communication tools
  - Employment terms management

#### Job Matching Features
- **Employer Portal**
  - Job posting creation with detailed requirements
  - Candidate search and filtering
  - Interview scheduling
  - Employment terms management
  - Profile verification tools

- **Employee Portal**
  - Profile creation and management
  - Job search and application system
  - Document upload (resumes, certificates)
  - Interview scheduling
  - Application tracking

#### Key Functionalities & Considerations

##### Forms & Profiles
- **Employer Form**
  - Role requirements
  - Age range preferences
  - Employment duration
  - Location specifications
  - Salary range
  - Required qualifications

- **Employee Form**
  - Personal information
  - Work experience
  - Educational background
  - Skills and certifications
  - Availability
  - Salary expectations

##### Job Listing & Matching
- Comprehensive job posting system
- Advanced candidate search with filters
- Automated matching algorithms
- Application tracking system
- Candidate shortlisting tools

##### Communication Platform
- In-platform messaging system
- Interview scheduling
- Document sharing
- Status updates
- Notification system

##### Employment Terms
- Contract duration specification
- Salary negotiation tools
- Terms and conditions management
- Agreement tracking
- Document signing system

##### Security & Protection
- Background check integration
- Identity verification
- Secure document storage
- Privacy controls
- Reporting system for issues

##### Legal Framework
- Terms of Service
- Privacy Policy
- Liability disclaimers
- User agreements
- Dispute resolution guidelines

## Real Estate Management

### User Types
- **Realtor**: Licensed real estate professionals who can list multiple properties
- **House Agent**: Representatives of real estate agencies who can list properties on behalf of clients
- **House Owner**: Individual property owners who can list their own properties

### Property Listing Types
- **House Sale**: Properties available for purchase
- **House Lease**: Properties available for long-term rental
- **House Rent**: Properties available for short-term rental

### Specialized Listing Forms
- **Realtor Listing Form**:
  - Property details (type, size, bedrooms, bathrooms, etc.)
  - Location information with map integration
  - Pricing details (listing price, negotiable status)
  - Property features and amenities
  - Virtual tour links
  - Agent contact information
  - Commission structure
  - Multiple image upload with categorization
  - Property status (available, under contract, sold)

- **House Agent Listing Form**:
  - Agency information
  - Property details (type, size, bedrooms, bathrooms, etc.)
  - Location information with map integration
  - Pricing details (listing price, negotiable status)
  - Property features and amenities
  - Virtual tour links
  - Agency contact information
  - Multiple image upload with categorization
  - Property status (available, under contract, sold/rented)

- **House Owner Listing Form**:
  - Property details (type, size, bedrooms, bathrooms, etc.)
  - Location information with map integration
  - Pricing details (listing price, negotiable status)
  - Property features and amenities
  - Owner contact information
  - Multiple image upload with categorization
  - Property status (available, under contract, sold/rented)

### Property Management Features
- **Property Dashboard**:
  - Overview of all listed properties
  - Status tracking (active, pending, sold/rented)
  - Inquiry management
  - Viewing scheduling
  - Analytics and performance metrics

- **Inquiry Management**:
  - Track and respond to property inquiries
  - Schedule viewings
  - Send property details
  - Follow-up reminders

- **Property Analytics**:
  - View counts
  - Inquiry conversion rates
  - Time on market
  - Comparison with similar properties

### Property Search and Filtering
- Advanced search filters for properties:
  - Property type (house, apartment, condo, etc.)
  - Price range
  - Location
  - Number of bedrooms/bathrooms
  - Square footage
  - Year built
  - Property features (garage, pool, etc.)
  - Listing type (sale, lease, rent)

### Property Verification
- Verification badges for Realtors and House Agents
- Property ownership verification for House Owners
- Document upload for verification (license, ID, property documents)

## Technical Architecture

### Technology Stack
Modern web application stack using PHP and MySQL

- **Frontend**: 
  - HTML5, CSS3, JavaScript
  - Bootstrap for responsive design
  - jQuery for DOM manipulation
  - AJAX for asynchronous requests
- **Backend & Database**: 
  - PHP 8.x
  - MySQL 8.x (via XAMPP)
  - Apache web server
  - phpMyAdmin for database management
- **Development Tools**:
  - XAMPP for local development
  - Git for version control
  - Composer for PHP dependencies
  - VS Code or PHPStorm for IDE

### Key Technical Features
- Local development environment with XAMPP
- MySQL database management via phpMyAdmin
- RESTful API architecture
- Secure authentication system
- File upload and storage management
- Real-time notifications
- Payment gateway integration
- Delivery tracking system

### Local Development Setup
1. Install XAMPP
2. Configure Apache and MySQL
3. Set up virtual hosts
4. Configure database connections
5. Set up development environment variables

### Database Management
- Use phpMyAdmin for database operations
- Regular database backups
- Database optimization
- Query performance monitoring
- Security best practices

### Database Schema (MySQL)

#### Users Table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    role ENUM('employer', 'employee', 'admin', 'seller', 'artisan', 'realtor', 'house_agent', 'house_owner') NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    location VARCHAR(255),
    preferences JSON,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active'
);
```

#### Profiles Table
```sql
CREATE TABLE profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    bio TEXT,
    skills JSON,
    experience JSON,
    education JSON,
    certifications JSON,
    languages JSON,
    availability JSON,
    salary_expectations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Real Estate Profiles Table
```sql
CREATE TABLE real_estate_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    license_number VARCHAR(100),
    agency_name VARCHAR(255),
    agency_address TEXT,
    years_of_experience INT,
    specialties JSON,
    service_areas JSON,
    website VARCHAR(255),
    social_media JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Properties Table
```sql
CREATE TABLE properties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    property_type ENUM('house', 'apartment', 'condo', 'townhouse', 'land', 'commercial') NOT NULL,
    listing_type ENUM('sale', 'lease', 'rent') NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    negotiable BOOLEAN DEFAULT TRUE,
    location VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Nigeria',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    bedrooms INT,
    bathrooms DECIMAL(3,1),
    square_feet DECIMAL(10,2),
    lot_size DECIMAL(10,2),
    year_built INT,
    property_features JSON,
    amenities JSON,
    images JSON,
    virtual_tour_url VARCHAR(255),
    status ENUM('available', 'under_contract', 'sold', 'rented') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Property Inquiries Table
```sql
CREATE TABLE property_inquiries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT,
    preferred_contact_method ENUM('email', 'phone', 'both') DEFAULT 'both',
    preferred_contact_time VARCHAR(100),
    status ENUM('new', 'contacted', 'scheduled', 'completed', 'cancelled') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Property Viewings Table
```sql
CREATE TABLE property_viewings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    user_id INT NOT NULL,
    viewing_date DATETIME NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Job Listings Table
```sql
CREATE TABLE job_listings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employer_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements JSON,
    salary_range JSON,
    location VARCHAR(255),
    employment_type ENUM('full-time', 'part-time', 'contract', 'temporary') NOT NULL,
    duration VARCHAR(50),
    status ENUM('active', 'filled', 'closed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES users(id)
);
```

#### Applications Table
```sql
CREATE TABLE applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    applicant_id INT NOT NULL,
    status ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'hired') DEFAULT 'pending',
    cover_letter TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (job_id) REFERENCES job_listings(id),
    FOREIGN KEY (applicant_id) REFERENCES users(id)
);
```

#### Messages Table
```sql
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    related_job_id INT,
    related_property_id INT,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (related_job_id) REFERENCES job_listings(id),
    FOREIGN KEY (related_property_id) REFERENCES properties(id)
);
```

#### Documents Table
```sql
CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('resume', 'certificate', 'portfolio', 'license', 'property_document', 'other') NOT NULL,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Products Table
```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    stock_quantity INT NOT NULL,
    images JSON,
    specifications JSON,
    status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id)
);
```

#### Orders Table
```sql
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    seller_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address JSON NOT NULL,
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
);
```

#### Order Items Table
```sql
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

#### Payments Table
```sql
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

#### Revenue Sharing Table
```sql
CREATE TABLE revenue_sharing (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    platform_percentage DECIMAL(5,2) NOT NULL,
    seller_percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id)
);
```

#### Delivery Tracking Table
```sql
CREATE TABLE delivery_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    estimated_delivery TIMESTAMP,
    actual_delivery TIMESTAMP,
    tracking_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

#### seller Settings Table
```sql
CREATE TABLE seller_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    delivery_options JSON,
    payment_methods JSON,
    notification_preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id)
);
```

#### Delivery Partners Table
```sql
CREATE TABLE delivery_partners (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    contact_info JSON,
    service_areas JSON,
    rates JSON,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### seller Delivery Zones Table
```sql
CREATE TABLE seller_delivery_zones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    zone_name VARCHAR(100) NOT NULL,
    delivery_cost DECIMAL(10,2),
    estimated_delivery_time VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id)
);
```

#### Financial Transactions Table
```sql
CREATE TABLE financial_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    seller_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type ENUM('sale', 'refund', 'commission', 'payout') NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
);
```

#### seller Documents Table
```sql
CREATE TABLE seller_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    document_url VARCHAR(255) NOT NULL,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id)
);
```

#### Employers Table
```sql
CREATE TABLE IF NOT EXISTS employers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_description TEXT,
    company_website VARCHAR(255),
    company_logo VARCHAR(255),
    location VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Jobs Table
```sql
CREATE TABLE IF NOT EXISTS jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employer_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    employment_type ENUM('full_time', 'part_time', 'contract', 'internship', 'temporary') NOT NULL,
    experience_level VARCHAR(50),
    status ENUM('active', 'filled', 'expired', 'closed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES employers(id)
);
```

#### Job Categories Table
```sql
CREATE TABLE IF NOT EXISTS job_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

#### Job Skills Table
```sql
CREATE TABLE IF NOT EXISTS job_skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    skill_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);
```

#### Skills Table
```sql
CREATE TABLE IF NOT EXISTS skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Experience Requirements Table
```sql
CREATE TABLE IF NOT EXISTS experience_requirements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    years INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);
```

#### Education Requirements Table
```sql
CREATE TABLE IF NOT EXISTS education_requirements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    degree VARCHAR(100) NOT NULL,
    field VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);
```

#### Salary Ranges Table
```sql
CREATE TABLE IF NOT EXISTS salary_ranges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    salary_min DECIMAL(12,2) NOT NULL,
    salary_max DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);
```

#### Job Applications Table
```sql
CREATE TABLE IF NOT EXISTS job_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    applicant_id INT NOT NULL,
    status ENUM('pending', 'reviewing', 'shortlisted', 'interviewed', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (applicant_id) REFERENCES users(id)
);
```

## New Features Implementation

### Delivery and Logistics Integration

#### Seamless Order Fulfillment
- Integration with local delivery partners
- Automated order processing system
- Real-time inventory management
- Delivery zone configuration
- Multiple delivery options (standard, express, scheduled)

#### Order Tracking & Notifications
- Real-time order status updates
- GPS tracking integration
- Automated notifications for:
  - Order confirmation
  - Payment receipt
  - Shipping updates
  - Delivery confirmation
  - Customer feedback requests

#### seller Delivery Preferences
- Customizable delivery zones
- Multiple delivery partner integration
- Delivery cost calculation
- Delivery time slot management
- Special handling instructions

### Payment and Revenue Sharing System

#### Multi-Method Payment Gateway
- Credit/Debit card processing
- Mobile money integration
- Bank transfer support
- Cash on delivery option
- Payment verification system

#### Admin-Controlled Revenue Sharing
- Dynamic revenue sharing configuration
- seller-specific commission rates
- Category-based commission structure
- Special promotion handling
- Revenue analytics dashboard

#### Automated Payment Splitting
- Real-time payment distribution
- Commission calculation
- seller payout scheduling
- Transaction history tracking
- Financial reporting system

#### Financial Management
- Automated invoice generation
- Refund processing system
- Financial analytics dashboard
- Tax calculation and reporting
- Payment reconciliation tools

### seller and Artisan Management

#### Registration & Profiles
- Detailed seller profiles
- Category-specific registration forms
- Document verification system
- Business license management
- Profile completion tracking

#### seller Dashboard
- Sales analytics
- Order management
- Inventory tracking
- Customer communication
- Performance metrics

#### Inventory & Communication
- Real-time stock updates
- Bulk product management
- Customer messaging system
- Order notifications
- Feedback management

### Real Estate Management System

#### User Type-Specific Features
- **Realtor Dashboard**:
  - Property portfolio management
  - Client management
  - Commission tracking
  - Market analytics
  - Property comparison tools

- **House Agent Dashboard**:
  - Agency property listings
  - Agent performance metrics
  - Client inquiry management
  - Viewing scheduling
  - Property status tracking

- **House Owner Dashboard**:
  - Personal property listings
  - Inquiry management
  - Viewing scheduling
  - Property status tracking
  - Rental payment tracking (for rental properties)

#### Property Listing Management
- **Listing Creation**:
  - User type-specific forms
  - Property details input
  - Image upload and management
  - Location mapping
  - Pricing and terms

- **Listing Updates**:
  - Status changes
  - Price adjustments
  - Feature updates
  - Image management
  - Availability updates

#### Property Search and Discovery
- Advanced search filters
- Saved searches
- Property alerts
- Similar property recommendations
- Map-based property search

#### Property Viewing Management
- Viewing scheduling
- Calendar integration
- Automated reminders
- Feedback collection
- Follow-up tracking

### Systematic Liability Protection

#### Legal Framework
- Comprehensive terms of service
- Privacy policy
- User agreements
- Dispute resolution guidelines
- Data protection measures

#### User Safety Measures
- Identity verification
- Background checks
- Secure messaging system
- Meeting guidelines
- Emergency contact system

#### Platform Disclaimers
- Clear liability limitations
- User responsibility statements
- Transaction disclaimers
- Service limitations
- Risk acknowledgment forms

## Implementation Steps

1. **Project Setup**
   - Initialize repository
   - Set up development environment
   - Configure build tools

2. **Backend Development**
   - Set up Express server
   - Configure MongoDB connection
   - Implement API endpoints

3. **Frontend Development**
   - Create React application
   - Implement UI components
   - Set up routing

4. **User Authentication & Sessions**
   - Implement JWT authentication
   - Create user management system
   - Set up protected routes

5. **Listings Management**
   - Create listing CRUD operations
   - Implement image upload
   - Add search and filtering

6. **Search & Filtering**
   - Implement search functionality
   - Add category filtering
   - Create advanced filters

7. **Real Estate Module**
   - Create user type-specific forms
   - Implement property management
   - Add property search and filtering
   - Develop viewing scheduling system

8. **Final Touches & Deployment**
   - Testing and bug fixes
   - Performance optimization
   - Deployment preparation

## Security & Best Practices
- Implement input validation
- Use HTTPS
- Secure password handling
- Regular security audits
- Follow OWASP guidelines

## Performance Optimization
- Image optimization
- Code splitting
- Caching strategies
- Database indexing
- CDN implementation

## Future Improvements
- Mobile app development
- Real-time chat
- Payment integration
- Advanced analytics
- AI-powered recommendations

## Conclusion
This documentation provides a comprehensive guide for building a classified ads web application with specialized real estate functionality. Follow the implementation steps and best practices to create a secure, performant, and user-friendly platform. 

## Delivery and Logistics

### Seamless Order Fulfillment
- Integration with local delivery partners
- Automated order processing system
- Real-time inventory management
- Delivery zone configuration
- Multiple delivery options (standard, express, scheduled)

### Order Tracking & Notifications
- Real-time order status updates
- GPS tracking integration
- Automated notifications for:
  - Order confirmation
  - Payment receipt
  - Shipping updates
  - Delivery confirmation
  - Customer feedback requests

### seller Delivery Preferences
- Customizable delivery zones
- Multiple delivery partner integration
- Delivery cost calculation
- Delivery time slot management
- Special handling instructions

## Payment and Revenue

### Multi-Method Payment Gateway
- Credit/Debit card processing
- Mobile money integration
- Bank transfer support
- Cash on delivery option
- Payment verification system

### Admin-Controlled Revenue Sharing
- Dynamic revenue sharing configuration
- seller-specific commission rates
- Category-based commission structure
- Special promotion handling
- Revenue analytics dashboard

### Automated Payment Splitting
- Real-time payment distribution
- Commission calculation
- seller payout scheduling
- Transaction history tracking
- Financial reporting system

### Financial Management
- Automated invoice generation
- Refund processing system
- Financial analytics dashboard
- Tax calculation and reporting
- Payment reconciliation tools

## seller Management

### Registration & Profiles
- Detailed seller profiles
- Category-specific registration forms
- Document verification system
- Business license management
- Profile completion tracking

### seller Dashboard
- Sales analytics
- Order management
- Inventory tracking
- Customer communication
- Performance metrics

### Inventory & Communication
- Real-time stock updates
- Bulk product management
- Customer messaging system
- Order notifications
- Feedback management

## Liability Protection

### Legal Framework
- Comprehensive terms of service
- Privacy policy
- User agreements
- Dispute resolution guidelines
- Data protection measures

### User Safety Measures
- Identity verification
- Background checks
- Secure messaging system
- Meeting guidelines
- Emergency contact system

### Platform Disclaimers
- Clear liability limitations
- User responsibility statements
- Transaction disclaimers
- Service limitations
- Risk acknowledgment forms

## Getting Started Guide

### Prerequisites
1. Install XAMPP from https://www.apachefriends.org/
2. Install Git from https://git-scm.com/
3. Install Composer from https://getcomposer.org/
4. Install VS Code or PHPStorm (recommended)

### Local Development Setup

1. **Install and Configure XAMPP**
   - Download and install XAMPP
   - Start Apache and MySQL services from XAMPP Control Panel
   - Verify services are running (green status indicators)

2. **Project Setup**
   ```bash
   # Navigate to XAMPP's htdocs directory
   cd C:\xampp\htdocs

   # Create project directory
   mkdir classified-ads
   cd classified-ads

   # Initialize Git repository
   git init

   # Initialize Composer
   composer init
   ```

3. **Database Setup**
   - Open browser and go to `http://localhost/phpmyadmin`
   - Create new database named `classified_ads`
   - Import the database schema (SQL file will be provided)
   - Configure database connection in `config/database.php`

4. **Project Structure**
   ```
   classified-ads/
   ├── config/
   │   ├── database.php
   │   └── config.php
   ├── public/
   │   ├── index.php
   │   ├── assets/
   │   │   ├── css/
   │   │   ├── js/
   │   │   └── images/
   │   └── uploads/
   ├── includes/
   │   ├── header.php
   │   ├── footer.php
   │   └── functions.php
   ├── admin/
   ├── seller/
   ├── realtor/
   ├── house_agent/
   ├── house_owner/
   └── composer.json
   ```

5. **Configure Virtual Host (Optional but Recommended)**
   - Open `C:\xampp\apache\conf\extra\httpd-vhosts.conf`
   - Add the following configuration:
   ```apache
   <VirtualHost *:80>
       DocumentRoot "C:/xampp/htdocs/classified-ads/public"
       ServerName classified.local
       <Directory "C:/xampp/htdocs/classified-ads/public">
           Options Indexes FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```
   - Add to hosts file (`C:\Windows\System32\drivers\etc\hosts`):
   ```
   127.0.0.1 classified.local
   ```

6. **Install Dependencies**
   ```bash
   composer require phpmailer/phpmailer
   composer require stripe/stripe-php
   composer require intervention/image
   ```

7. **Environment Configuration**
   - Create `.env` file in project root:
   ```
   DB_HOST=localhost
   DB_NAME=classified_ads
   DB_USER=root
   DB_PASS=
   APP_URL=http://classified.local
   APP_ENV=development
   ```

8. **Running the Website**
   - Start XAMPP services (Apache and MySQL)
   - Open browser and visit:
     - If using virtual host: `http://classified.local`
     - If not using virtual host: `http://localhost/classified-ads/public`

9. **Development Workflow**
   - Make changes to PHP files in the project directory
   - Changes are immediately reflected in the browser
   - Use browser developer tools for debugging
   - Check XAMPP error logs if issues occur

10. **Common Issues and Solutions**
    - If Apache won't start:
      - Check if ports 80 and 443 are free
      - Try changing ports in XAMPP Control Panel
    - If MySQL won't start:
      - Check if port 3306 is free
      - Verify MySQL service isn't running elsewhere
    - If virtual host doesn't work:
      - Ensure hosts file is edited with admin privileges
      - Restart Apache after configuration changes

11. **Testing the Setup**
    - Create a test file `public/test.php`:
    ```php
    <?php
    echo "Hello World!";
    phpinfo();
    ?>
    ```
    - Visit `http://classified.local/test.php` or `http://localhost/classified-ads/public/test.php`
    - If you see the PHP info page, your setup is working correctly

12. **Security Considerations**
    - Change default MySQL root password
    - Set up proper file permissions
    - Enable error reporting only in development
    - Use prepared statements for database queries
    - Implement proper input validation 