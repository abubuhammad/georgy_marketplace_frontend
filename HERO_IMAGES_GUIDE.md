# Hero Images Management Guide

## Overview
The application now supports dynamic hero images that change based on the current marketplace section (marketplace, real estate, jobs). The system automatically detects the current route and displays the appropriate image and content.

## Image Locations
All hero images should be placed in the `public/images/` directory:

```
public/
  images/
    hero-marketplace.png    ✅ (Already added - your current image)
    hero-realestate.png     ❌ (You need to add this)
    hero-jobs.png          ❌ (You need to add this)
```

## How It Works

### 1. Configuration (src/config/heroImages.ts)
Each section has its own configuration including:
- Image path
- Title text (main + accent)
- Subtitle description
- Search placeholder text
- Feature bullets
- Color scheme (background gradients, accent colors)

### 2. Automatic Detection
The system automatically detects which section to show based on:
- URL pathname (e.g., `/realestate`, `/jobs`, `/products`)
- Platform context from your app
- Manual override via props

### 3. Dynamic Content
- **Images**: Changes based on section
- **Colors**: Teal/Coral for marketplace, Blue/Amber for real estate, Purple/Green for jobs
- **Text**: Different titles, subtitles, and button labels
- **Features**: Section-specific feature highlights

## Adding New Images

### Step 1: Add Your Images
1. Save your real estate hero image as `hero-realestate.png` in `public/images/`
2. Save your jobs hero image as `hero-jobs.png` in `public/images/`
3. Recommended size: 1920x1080px or similar aspect ratio

### Step 2: Test Different Sections
Navigate to different URLs to see the images change:
- **Marketplace**: `/` or `/products` → Shows `hero-marketplace.png`
- **Real Estate**: `/realestate` or `/properties` → Shows `hero-realestate.png`
- **Jobs**: `/jobs` or `/careers` → Shows `hero-jobs.png`

## Customizing Content

### Marketplace Section (Current)
```typescript
marketplace: {
  image: '/images/hero-marketplace.png',
  title: { main: 'Find It.', accent: 'Love It' },
  subtitle: 'Discover amazing products and connect with trusted sellers...',
  features: ['Trusted Sellers', 'Secure Delivery', 'Great Deals', 'Quality Products'],
  // Colors: Teal primary, Coral accent
}
```

### Real Estate Section
```typescript
realestate: {
  image: '/images/hero-realestate.png',
  title: { main: 'Find Your', accent: 'Dream Home' },
  subtitle: 'Discover premium properties and connect with certified real estate professionals...',
  features: ['Verified Properties', 'Expert Agents', 'Best Locations', 'Fair Prices'],
  // Colors: Blue primary, Amber accent
}
```

### Jobs Section
```typescript
jobs: {
  image: '/images/hero-jobs.png',
  title: { main: 'Find Your', accent: 'Dream Job' },
  subtitle: 'Connect with top employers and discover career opportunities...',
  features: ['Top Companies', 'Remote Work', 'Career Growth', 'Fair Salary'],
  // Colors: Purple primary, Green accent
}
```

## Manual Override
You can override the automatic detection by passing a `section` prop:

```tsx
<HeroSection
  section="realestate"  // Force real estate hero
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  onSearch={handleSearch}
/>
```

## Fallback Handling
- If an image fails to load, it falls back to the marketplace image
- If no image is found, displays a loading state or default gradient
- Smooth transitions between different images

## Color System
Each section has its own color palette:

### Marketplace
- Primary: Teal (teal-600, teal-700, etc.)
- Accent: Coral (coral-400, coral-500, etc.)
- Gradient: `from-teal-900/80 via-teal-800/60 to-transparent`

### Real Estate
- Primary: Blue (blue-600, blue-700, etc.)
- Accent: Amber (amber-400, amber-500, etc.)
- Gradient: `from-blue-900/80 via-blue-800/60 to-transparent`

### Jobs
- Primary: Purple (purple-600, purple-700, etc.)
- Accent: Green (green-400, green-500, etc.)
- Gradient: `from-purple-900/80 via-purple-800/60 to-transparent`

## Files Modified
- `src/config/heroImages.ts` - Configuration for all sections
- `src/utils/heroImageUtils.ts` - Utility functions
- `src/hooks/useHeroImage.ts` - React hook for image management
- `src/components/enhanced/HeroSection.tsx` - Updated component
- `src/pages/EnhancedHomePage.tsx` - Updated to use new system

## Next Steps
1. Add your real estate and jobs hero images to `public/images/` (as PNG files)
2. Test the application by navigating to different sections
3. Customize the text, colors, or features in `heroImages.ts` if needed
4. The system will automatically handle everything else!
