// Environment-based configuration
const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';

// API Configuration
export const API_CONFIG = {
  // Backend API base URL
  BASE_URL: isDevelopment 
    ? import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
    : import.meta.env.VITE_API_BASE_URL || '/api',
  
  // Timeout for API requests
  TIMEOUT: 30000, // 30 seconds
  
  // WebSocket URL
  WS_URL: isDevelopment 
    ? import.meta.env.VITE_WS_URL || 'ws://localhost:5000'
    : import.meta.env.VITE_WS_URL || window.location.origin.replace('http', 'ws'),
    
  // Enable mock data when API is not available
  ENABLE_MOCK_DATA: isDevelopment
};

// Export for backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL;

// App Configuration
export const APP_CONFIG = {
  // App metadata
  NAME: 'Georgy Marketplace',
  VERSION: '1.0.0',
  DESCRIPTION: 'Comprehensive marketplace platform',
  
  // Feature flags
  FEATURES: {
    REAL_TIME_ANALYTICS: true,
    EXPORT_DATA: true,
    CHART_INTERACTIONS: true,
    MOBILE_RESPONSIVE: true,
    DARK_MODE: false, // Future feature
    NOTIFICATIONS: true,
    WEBHOOKS: true
  },
  
  // UI Configuration
  UI: {
    THEME: 'light',
    PRIMARY_COLOR: '#DC2626', // Deep red
    ACCENT_COLOR: '#B91C1C',  // Dark red
    SUCCESS_COLOR: '#10B981',
    WARNING_COLOR: '#F59E0B',
    ERROR_COLOR: '#EF4444',
    INFO_COLOR: '#3B82F6'
  },
  
  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  }
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  // Default timeframe for analytics
  DEFAULT_TIMEFRAME: '30d',
  
  // Chart configuration
  CHARTS: {
    ANIMATION_DURATION: 300,
    REFRESH_INTERVAL: 30000, // 30 seconds for real-time updates
    MAX_DATA_POINTS: 100
  },
  
  // Export formats
  EXPORT_FORMATS: ['csv', 'excel', 'pdf'],
  
  // Performance thresholds
  THRESHOLDS: {
    DELIVERY_RATE: {
      EXCELLENT: 95,
      GOOD: 90,
      WARNING: 80
    },
    ON_TIME_RATE: {
      EXCELLENT: 90,
      GOOD: 85,
      WARNING: 75
    },
    CUSTOMER_SATISFACTION: {
      EXCELLENT: 4.5,
      GOOD: 4.0,
      WARNING: 3.5
    },
    COST_EFFICIENCY: {
      EXCELLENT: 30, // % profit margin
      GOOD: 20,
      WARNING: 10
    }
  }
};

// Delivery Configuration
export const DELIVERY_CONFIG = {
  // Vehicle types
  VEHICLE_TYPES: [
    { value: 'BIKE', label: 'Bike', icon: '🏍️' },
    { value: 'CAR', label: 'Car', icon: '🚗' },
    { value: 'VAN', label: 'Van', icon: '🚐' },
    { value: 'TRUCK', label: 'Truck', icon: '🚛' }
  ],
  
  // Delivery status
  STATUS_TYPES: [
    { value: 'PENDING', label: 'Pending', color: '#F59E0B' },
    { value: 'CONFIRMED', label: 'Confirmed', color: '#3B82F6' },
    { value: 'PICKED_UP', label: 'Picked Up', color: '#8B5CF6' },
    { value: 'IN_TRANSIT', label: 'In Transit', color: '#06B6D4' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: '#F97316' },
    { value: 'DELIVERED', label: 'Delivered', color: '#10B981' },
    { value: 'FAILED', label: 'Failed', color: '#EF4444' },
    { value: 'CANCELLED', label: 'Cancelled', color: '#6B7280' }
  ],
  
  // Performance metrics
  METRICS: {
    SUCCESS_RATE_TARGET: 95,
    ON_TIME_RATE_TARGET: 85,
    AVERAGE_DELIVERY_TIME_TARGET: 120, // minutes
    CUSTOMER_SATISFACTION_TARGET: 4.5
  }
};

// Storage keys for local storage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  ANALYTICS_FILTERS: 'analytics_filters',
  DASHBOARD_CONFIG: 'dashboard_config',
  THEME_PREFERENCE: 'theme_preference'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to access this resource. Please log in.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An internal server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  EXPORT_FAILED: 'Failed to export data. Please try again.',
  CHART_LOAD_ERROR: 'Failed to load chart data.',
  REALTIME_CONNECTION_ERROR: 'Real-time connection lost. Attempting to reconnect...'
};

// Success messages
export const SUCCESS_MESSAGES = {
  DATA_EXPORTED: 'Data exported successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  FILTER_APPLIED: 'Filters applied successfully',
  REPORT_GENERATED: 'Report generated successfully'
};

// Development helpers
export const DEV_CONFIG = {
  ENABLE_LOGGING: isDevelopment,
  ENABLE_PERFORMANCE_MONITORING: isDevelopment,
  MOCK_API_DELAY: 1000, // ms
  LOG_LEVEL: isDevelopment ? 'debug' : 'error'
};

// Export environment check
export const isProduction = import.meta.env.PROD;
export const isDev = isDevelopment;

// Validate required environment variables in production
if (isProduction) {
  const requiredEnvVars = ['VITE_API_BASE_URL'];
  
  for (const envVar of requiredEnvVars) {
    if (!import.meta.env[envVar]) {
      console.error(`Missing required environment variable: ${envVar}`);
    }
  }
}

// Export all configurations as default
export default {
  API: API_CONFIG,
  APP: APP_CONFIG,
  ANALYTICS: ANALYTICS_CONFIG,
  DELIVERY: DELIVERY_CONFIG,
  STORAGE: STORAGE_KEYS,
  ERRORS: ERROR_MESSAGES,
  SUCCESS: SUCCESS_MESSAGES,
  DEV: DEV_CONFIG
};
