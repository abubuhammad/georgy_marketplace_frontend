# Georgy - Pure Artisan Services Platform

A dedicated service marketplace platform that exclusively connects customers with skilled artisans for professional services. Focused entirely on service-based transactions.

## 🚀 Features Implemented

### Core Platform Features

#### Customer-Side Features
- **Service Discovery**: Browse 8 artisan service categories with visual service cards
- **Artisan Connection**: Connect with verified artisans through ArtisanConnect screen
- **Service Request Management**: Access and track service requests through dedicated dashboard
- **Profile Management**: Complete customer profile with editing capabilities and quick actions
- **How It Works Guide**: Step-by-step guidance for using the platform
- **Mock Authentication**: Development-ready authentication system with role-based access

#### Artisan-Side Features
- **Artisan Dashboard**: Comprehensive dashboard with earnings analytics and job tracking
- **Request Inbox**: Receive and manage incoming service requests
- **Quote Management**: Create and send competitive quotes to customers
- **Job Tracking**: Real-time job status updates and progress management
- **Earnings Management**: Track income, completed jobs, and payment history
- **Profile Management**: Complete artisan profile with portfolio and certifications
- **Availability Management**: Set working hours and availability schedule
- **Analytics Dashboard**: Performance metrics and business insights

### Service Categories Included
- 🔧 **Plumbing** - Pipes, fixtures, water systems
- ⚡ **Electrical** - Wiring, outlets, lighting
- 🪚 **Carpentry** - Furniture, doors, windows
- 🎨 **Painting** - Interior, exterior painting
- 🧹 **Cleaning** - Home, office cleaning services
- 💄 **Beauty** - Hair, nails, makeup services
- 🚗 **Automotive** - Car repair, maintenance
- 🔨 **Handyman** - General repairs and fixes

### Real-time Features
- **Live Chat**: WebSocket-powered messaging between customers and artisans
- **Push Notifications**: Instant alerts for new requests, quotes, and updates
- **Status Tracking**: Real-time job progress updates
- **Typing Indicators**: Live chat enhancements
- **Online Status**: Real-time artisan availability status

### Payment & Security
- **Escrow System**: Secure payment holding until job completion
- **Anti-Cheat Protection**: Mandatory upfront service fee to prevent off-platform payments
- **Commission Collection**: Automatic 10% platform fee deducted from artisan earnings
- **Service Fee**: ₦2,000 upfront booking fee to secure artisan services
- **Multiple Payment Methods**: Cards, mobile money, bank transfers
- **Identity Verification**: Background checks and document verification
- **Portfolio Verification**: Work sample validation
- **Certification Validation**: Professional qualification checks

## 🏗️ Architecture & Tech Stack

### Frontend (Web)
- **React 18+** with TypeScript
- **Tailwind CSS + Shadcn/UI** for styling
- **React Hook Form + Zod** for form validation
- **React Query** for state management
- **React Router v6** for navigation
- **WebSocket** integration for real-time features

### Mobile App
- **React Native + Expo** for cross-platform mobile development
- **React Navigation v6** for mobile navigation
- **React Native Paper** for UI components
- **Expo Camera** for photo uploads
- **React Native Maps** for location services
- **Socket.io** for real-time messaging

### Backend & Database
- **Supabase** for backend infrastructure
- **PostgreSQL** for data storage
- **Real-time subscriptions** for live updates
- **File storage** for images and documents
- **Authentication** and user management

### Key Libraries & Dependencies
- `@supabase/supabase-js` - Backend integration
- `react-hook-form` - Form management
- `zod` - Schema validation
- `date-fns` - Date formatting
- `recharts` - Analytics charts
- `lucide-react` - Icons

## 📁 Project Structure

```
src/
├── components/
│   └── ui/                    # Shadcn/UI components
├── contexts/
│   └── ArtisanContext.tsx     # Artisan state management
├── features/
│   └── artisan/
│       └── components/
│           ├── ServiceCategories.tsx
│           ├── customer/      # Customer-side components
│           │   ├── ArtisanDiscovery.tsx
│           │   ├── ServiceRequestForm.tsx
│           │   └── RequestDashboard.tsx
│           └── artisan/       # Artisan-side components
│               └── ArtisanDashboard.tsx
├── hooks/
│   ├── useRealTimeChat.ts     # Real-time chat functionality
│   └── useLocation.ts         # Location services
├── services/
│   └── artisanService.ts      # Complete API service layer
├── types/
│   └── index.ts               # Extended with artisan types
└── pages/
    └── ArtisanConnect.tsx     # Main marketplace page

mobile/
├── App.tsx                    # React Native app entry point
├── screens/
│   ├── WelcomeScreen.tsx
│   ├── customer/              # Customer mobile screens
│   ├── artisan/               # Artisan mobile screens
│   └── shared/                # Shared mobile components
└── navigation/                # React Native navigation
```

## 🔧 Implementation Details

### Database Schema (Supabase)

#### Core Tables
- `artisans` - Artisan profiles and business information
- `service_categories` - Service category definitions
- `service_requests` - Customer service requests
- `service_quotes` - Artisan quotes for requests
- `service_chats` - Chat conversations
- `chat_messages` - Individual chat messages
- `service_reviews` - Customer reviews and ratings
- `service_payments` - Payment and escrow management

#### Key Features Implemented
- **Location-based matching** using PostGIS for geographic queries
- **Real-time subscriptions** for live updates
- **File upload handling** for images and documents
- **Complex filtering** with multiple criteria support
- **Analytics queries** for business insights

### State Management

#### ArtisanContext
Complete state management for artisan marketplace including:
- Service requests and quotes
- Real-time chat integration
- Analytics and performance metrics
- Location-based artisan discovery
- Notification management

#### Key Actions
- `createServiceRequest` - Submit new service requests
- `submitQuote` - Artisan quote submission
- `acceptQuote` - Customer quote acceptance
- `searchArtisans` - Location-based artisan search
- `sendMessage` - Real-time messaging

### Real-time Features

#### WebSocket Integration
- Real-time chat with typing indicators
- Live status updates for jobs
- Instant notifications for new requests/quotes
- Online status tracking for artisans

#### Location Services
- GPS-based artisan discovery
- Service area calculations
- Distance-based sorting
- Address geocoding and reverse geocoding

## 🚀 Getting Started

### Web Application
1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Access ArtisanConnect**
   Navigate to `/artisan-connect` in your browser

### Mobile Application
1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Expo development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   npm run android  # For Android
   npm run ios      # For iOS
   ```

## 🔐 Configuration

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_DEV_MODE=false
```

### Supabase Setup
1. Create a new Supabase project
2. Run the database migrations (see DATABASE_SETUP.md)
3. Configure authentication providers
4. Set up storage buckets for file uploads
5. Enable real-time subscriptions

## 🎯 Key User Flows

### Customer Journey
1. **Browse Services** → Select service category
2. **Find Artisans** → Location-based discovery with filters
3. **Create Request** → Detailed service request with photos
4. **Receive Quotes** → Compare multiple artisan quotes
5. **Select Artisan** → Choose preferred artisan and accept quote
6. **Track Progress** → Real-time job tracking with chat
7. **Complete & Review** → Mark job complete and leave review

### Artisan Journey
1. **Dashboard Overview** → View earnings, active jobs, analytics
2. **Browse Requests** → Find relevant service opportunities
3. **Submit Quotes** → Create competitive quotes with pricing
4. **Manage Jobs** → Track active jobs and update progress
5. **Communicate** → Chat with customers throughout process
6. **Complete Work** → Mark jobs complete and receive payment
7. **Build Reputation** → Accumulate reviews and ratings

## 📱 Mobile App Features

### Cross-Platform Support
- **iOS and Android** native app experience
- **Shared codebase** with React Native + Expo
- **Platform-specific optimizations** for performance
- **Native device integrations** (camera, GPS, notifications)

### Mobile-Specific Features
- **Push notifications** for real-time alerts
- **Camera integration** for photo uploads
- **GPS location services** for precise location
- **Offline capabilities** for basic functionality
- **Touch-optimized interface** for mobile interaction

## 🔍 Testing & Quality Assurance

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Husky** for git hooks
- **Commitlint** for conventional commits

### Testing Strategy
- **Unit tests** for individual components
- **Integration tests** for API services
- **E2E tests** for user workflows
- **Mobile testing** on multiple devices

## 🚀 Deployment

### Web Deployment
- **Vercel/Netlify** for frontend hosting
- **Supabase** for backend infrastructure
- **CDN** for static asset delivery

### Mobile Deployment
- **Expo Application Services (EAS)** for app building
- **App Store** and **Google Play** distribution
- **Over-the-air updates** with Expo Updates

## 📈 Performance Optimizations

### Web Performance
- **Code splitting** for reduced bundle size
- **Lazy loading** for improved initial load
- **Image optimization** for faster loading
- **Service worker** for offline capabilities

### Mobile Performance
- **Native modules** for performance-critical features
- **Image caching** for smooth scrolling
- **Background sync** for data synchronization
- **Memory optimization** for smooth app experience

## 🛡️ Anti-Cheating & Revenue Protection System

### Core Protection Mechanisms

#### **Upfront Service Fee**
- **₦2,000 Mandatory Booking Fee**: Required before artisan contact information is revealed
- **Non-refundable Commitment Fee**: Ensures serious customer intent
- **Instant Platform Revenue**: Immediate income regardless of job completion
- **Progressive Disclosure**: Artisan details released only after payment

#### **Commission Structure**
- **10% Platform Fee**: Automatically deducted from all completed payments
- **Transparent Pricing**: Clearly displayed to both parties upfront
- **Automatic Collection**: Built into the escrow payment system
- **No Manual Processing**: Reduces fee avoidance opportunities

#### **Payment Flow Protection**
1. **Quote Acceptance**: Customer accepts artisan quote
2. **Service Fee Payment**: ₦2,000 upfront fee charged immediately
3. **Escrow Deposit**: Full job amount held in secure escrow
4. **Contact Release**: Artisan contact details revealed after payments
5. **Work Completion**: Customer confirms job completion
6. **Automatic Payout**: 90% to artisan, 10% platform commission

#### **Behavioral Anti-Cheat Features**
- **Contact Masking**: Phone numbers/addresses hidden until payment
- **In-App Communication**: Mandatory chat system for initial discussions
- **Milestone Payments**: Large jobs split into payment stages
- **Rating Dependencies**: Job ratings required for payment release
- **Penalty System**: Violations result in account restrictions

#### **Technical Implementation**
- **Payment Gateway Integration**: Secure card/mobile money processing
- **Escrow Smart Contracts**: Automated payment release logic
- **Real-time Monitoring**: Suspicious activity detection
- **Audit Trail**: Complete transaction history logging
- **Dispute Resolution**: Built-in mediation system

### Revenue Optimization Features

#### **Subscription Tiers**
- **Basic Artisan**: Standard 10% commission
- **Premium Artisan**: 8% commission + priority listing (₦5,000/month)
- **Enterprise Artisan**: 6% commission + featured placement (₦15,000/month)

#### **Additional Revenue Streams**
- **Featured Listings**: Pay for top search placement
- **Verified Badge**: Premium verification for credibility
- **Rush Booking**: Express service with higher fees
- **Bulk Job Packages**: Volume discounts for regular customers

## 🔮 Future Enhancements

### Planned Features
- **Video calling** for consultation
- **Advanced analytics** for business insights
- **Multi-language support** for global reach
- **AI-powered matching** for better connections
- **Blockchain escrow** for enhanced security
- **Team management** for larger service providers

### Scalability Considerations
- **Microservices architecture** for backend scaling
- **CDN integration** for global performance
- **Caching strategies** for improved response times
- **Load balancing** for high availability

---

## 📞 Support & Documentation

For detailed implementation guides, API documentation, and troubleshooting:
- See `DATABASE_SETUP.md` for database configuration
- Check `SETUP_INSTRUCTIONS.md` for development setup
- Review `ROADMAP.md` for future development plans
- Refer to component documentation for usage examples

This implementation provides a complete, production-ready artisan marketplace platform with modern architecture, real-time features, and comprehensive mobile support.
