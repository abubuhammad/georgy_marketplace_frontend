# Enhanced Profile System

This directory contains the enhanced profile system that provides a unified and comprehensive profile management experience across all user roles in the application.

## Architecture

### Core Components

#### 1. EnhancedProfile (`EnhancedProfile.tsx`)
The foundational profile component that provides:
- Universal profile layout with enhanced header
- Tabbed interface for organizing profile sections
- Role-based action buttons and statistics
- Profile completion tracking
- Responsive design and animations
- Comprehensive form handling and validation

#### 2. EnhancedDashboardHeader (`EnhancedDashboardHeader.tsx`)
A sophisticated header component featuring:
- User information and avatar display
- Quick action buttons based on user role
- Real-time statistics and metrics
- Notification and message indicators
- Search functionality
- Responsive navigation

### Role-Specific Profiles

#### 1. EnhancedEmployerProfile (`../profiles/EnhancedEmployerProfile.tsx`)
Specialized for employers with:
- Company profile management
- Job posting overview and management
- Application tracking and statistics
- Hiring analytics and metrics
- Team management features

#### 2. EnhancedJobSeekerProfile (`../profiles/EnhancedJobSeekerProfile.tsx`)
Designed for job seekers featuring:
- Professional profile showcase
- Resume upload and management
- Job application tracking
- Job preferences configuration
- Career progress analytics

#### 3. EnhancedSellerProfile (`../profiles/EnhancedSellerProfile.tsx`)
Tailored for sellers including:
- Shop profile and branding
- Product inventory management
- Order tracking and fulfillment
- Sales analytics and reports
- Customer interaction tools

## Features

### Universal Features
- **Profile Completion Tracking**: Visual progress indicator showing profile completeness
- **Real-time Statistics**: Dynamic stats based on user activity and role
- **Notification System**: Integrated toast notifications for user feedback
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Dark Mode Support**: Consistent theming across all components

### Role-Based Features
- **Custom Actions**: Role-specific quick actions in the header
- **Specialized Statistics**: Metrics relevant to each user type
- **Contextual Navigation**: Role-appropriate navigation options
- **Workflow Integration**: Direct links to role-specific workflows

### Security Features
- **Two-Factor Authentication Management**: Enable/disable 2FA
- **Password Management**: Secure password change workflow
- **Login History**: Track account access and security events
- **Privacy Controls**: Granular privacy and notification settings

## Usage

### Basic Profile
```tsx
import { EnhancedProfile } from '@/components/enhanced/EnhancedProfile';

// Basic profile for any role
<EnhancedProfile 
  role="customer" 
/>
```

### Custom Profile with Additional Content
```tsx
import { EnhancedProfile } from '@/components/enhanced/EnhancedProfile';

const customActions = [
  {
    label: 'Custom Action',
    icon: Star,
    onClick: () => handleCustomAction(),
    variant: 'default' as const
  }
];

const roleSpecificContent = (
  <Card>
    <CardHeader>
      <CardTitle>Role-Specific Content</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Custom content here */}
    </CardContent>
  </Card>
);

<EnhancedProfile 
  role="custom_role"
  customActions={customActions}
  roleSpecificContent={roleSpecificContent}
  additionalTabs={<TabsTrigger value="custom">Custom Tab</TabsTrigger>}
/>
```

### Specialized Role Profiles
```tsx
import { EnhancedEmployerProfile } from '@/components/profiles/EnhancedEmployerProfile';
import { EnhancedJobSeekerProfile } from '@/components/profiles/EnhancedJobSeekerProfile';
import { EnhancedSellerProfile } from '@/components/profiles/EnhancedSellerProfile';

// Use specialized profiles for specific roles
<EnhancedEmployerProfile />
<EnhancedJobSeekerProfile />
<EnhancedSellerProfile />
```

## API Integration

The enhanced profile system integrates with backend APIs for:

### Profile Data Management
- `GET /api/profile` - Fetch user profile data
- `PUT /api/profile` - Update profile information
- `POST /api/profile/avatar` - Upload profile avatar

### Role-Specific APIs

#### Employer APIs
- `GET /api/employer/jobs` - Fetch job postings
- `GET /api/employer/applications` - Get job applications
- `GET /api/employer/company` - Company profile data

#### Job Seeker APIs
- `GET /api/job-seeker/applications` - Get job applications
- `GET /api/job-seeker/resumes` - Fetch uploaded resumes
- `POST /api/job-seeker/upload-resume` - Upload resume files

#### Seller APIs
- `GET /api/seller/products` - Get product listings
- `GET /api/seller/orders` - Fetch order history
- `GET /api/seller/stats` - Sales statistics

## Customization

### Adding New Role Support
1. Create role-specific profile component extending `EnhancedProfile`
2. Define role-specific data interfaces
3. Implement role-specific API calls
4. Add custom actions and statistics
5. Update `ProfileRouter.tsx` to include new role

### Extending Functionality
1. **Custom Tabs**: Add additional tabs using `additionalTabs` prop
2. **Custom Actions**: Define role-specific actions via `customActions`
3. **Statistics**: Implement role-relevant metrics in `getProfileStats()`
4. **Content Sections**: Add specialized content via `roleSpecificContent`

## File Structure
```
src/components/enhanced/
├── EnhancedProfile.tsx           # Core profile component
├── EnhancedDashboardHeader.tsx   # Enhanced header component
├── README.md                     # This documentation

src/components/profiles/
├── EnhancedEmployerProfile.tsx   # Employer-specific profile
├── EnhancedJobSeekerProfile.tsx  # Job seeker profile
├── EnhancedSellerProfile.tsx     # Seller profile

src/components/
└── ProfileRouter.tsx             # Profile routing logic
```

## Dependencies

### UI Components
- `@/components/ui/*` - Shadcn/ui components
- `lucide-react` - Icon library
- `framer-motion` - Animation library

### Hooks and Context
- `@/contexts/AuthContext` - Authentication state
- `@/hooks/useToast` - Notification system
- `@/lib/api-client` - API communication

## Future Enhancements

### Planned Features
- **Advanced Analytics Dashboard**: Detailed charts and metrics
- **Profile Templates**: Pre-configured profile layouts
- **Social Features**: Profile sharing and networking
- **Document Management**: Advanced file handling
- **Integration Marketplace**: Third-party service connections
- **AI-Powered Recommendations**: Smart profile optimization suggestions

### Performance Optimizations
- **Lazy Loading**: On-demand component loading
- **Data Caching**: Intelligent cache management
- **Virtual Scrolling**: Handle large data sets efficiently
- **Image Optimization**: Automatic image resizing and compression

## Contributing

When contributing to the enhanced profile system:
1. Follow the established component patterns
2. Maintain type safety with TypeScript
3. Implement proper error handling
4. Add comprehensive tests
5. Update documentation for new features
6. Ensure accessibility compliance

## Migration Guide

### From Legacy Profiles
1. Replace legacy profile imports with enhanced versions
2. Update route configurations in `ProfileRouter.tsx`
3. Migrate role-specific data structures
4. Test functionality across all user roles
5. Update API endpoints if necessary

The enhanced profile system provides a foundation for scalable, maintainable, and user-friendly profile management across the entire application ecosystem.