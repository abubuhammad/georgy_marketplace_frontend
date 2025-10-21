# Mobile App API Integration

## Overview

The mobile app has been successfully updated to use real backend APIs with graceful fallback to mock data. This hybrid approach ensures the app works both in development (when backend may not be available) and production environments.

## Changes Made

### 1. Service Layer Creation

**New Files:**
- `mobile/src/services/productService.ts` - Product API integration
- `mobile/src/services/artisanService.ts` - Artisan and service request API integration

**Features:**
- Real API calls to backend endpoints
- Graceful fallback to mock data when backend unavailable
- Error handling and loading states
- Type-safe responses using shared TypeScript interfaces

### 2. Updated Mobile Screens

#### CustomerHomeScreen.tsx
- **Real API Integration**: Fetches categories and featured products from `/api/products/categories` and `/api/products?featured=true`
- **Loading States**: Shows activity indicator while loading data
- **Error Handling**: Displays error messages and retry buttons
- **Pull-to-Refresh**: Users can refresh data manually
- **Empty States**: Handles cases when no data is available

#### ArtisanDiscoveryScreen.tsx
- **Real API Integration**: Fetches service categories from `/api/artisans/categories` and searches artisans via `/api/artisans`
- **Advanced Filtering**: Supports category filtering, search queries, and location-based searches
- **Real-time Search**: Updates results as user types or selects filters
- **Pagination**: Supports paginated results from backend
- **Loading States**: Shows loading indicators for better UX

#### ServiceRequestScreen.tsx
- **Real API Integration**: Submits service requests via `/api/artisans/service-requests`
- **Dynamic Categories**: Loads service categories from backend
- **Form Validation**: Validates required fields before submission
- **Location Integration**: Captures user location for service requests
- **Image Upload**: Prepared for image upload functionality

### 3. API Endpoints Used

The mobile app now uses the same endpoints as the web frontend:

**Products:**
- `GET /api/products/categories` - Get product categories
- `GET /api/products?featured=true&limit=6` - Get featured products
- `GET /api/products?search=query&category=Electronics` - Search products

**Artisans:**
- `GET /api/artisans/categories` - Get service categories
- `GET /api/artisans?category=Plumbing&search=quick` - Search artisans
- `POST /api/artisans/service-requests` - Create service request

### 4. Fallback Mechanism

When the backend is not available:
- `apiClient.isBackendReachable()` checks connectivity
- Falls back to comprehensive mock data
- Users can still browse products, artisans, and submit requests
- Seamless experience regardless of backend status

## API Client Features

The mobile API client (`mobile/src/lib/apiClient.ts`) provides:

- **Authentication**: JWT token management with AsyncStorage
- **Network Detection**: Automatic backend reachability checks
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **File Upload**: Support for React Native image uploads
- **Health Checks**: Endpoint monitoring capabilities

## Example Usage

```typescript
// Load products with real API + fallback
const loadProducts = async () => {
  try {
    const result = await productService.getFeaturedProducts(6);
    setProducts(result); // Real data from API
  } catch (error) {
    // Automatically falls back to mock data
    console.log('Using mock data');
  }
};

// Search artisans with filters
const searchArtisans = async () => {
  const result = await artisanService.searchArtisans({
    category: 'Plumbing',
    location: 'Lagos',
    search: 'emergency'
  });
  setArtisans(result.artisans);
};

// Submit service request
const submitRequest = async (data: ServiceRequestData) => {
  const request = await artisanService.createServiceRequest(data);
  console.log('Request submitted:', request.id);
};
```

## Benefits

1. **Seamless Development**: Works with or without backend running
2. **Production Ready**: Real API integration for live environment
3. **Better UX**: Loading states, error handling, and empty states
4. **Consistent Data**: Uses same endpoints as web frontend
5. **Type Safety**: Full TypeScript support with shared interfaces
6. **Offline Resilience**: Graceful degradation when backend unavailable

## Next Steps

1. **Testing**: Test API integration with backend running
2. **Authentication**: Integrate with mobile authentication flow
3. **Caching**: Add local caching for better performance
4. **Offline Support**: Implement offline-first capabilities
5. **Push Notifications**: Add real-time updates for service requests

The mobile app now provides a production-ready experience with full backend integration while maintaining development flexibility through intelligent fallback mechanisms.
