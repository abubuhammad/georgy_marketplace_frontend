// Real Estate Module Exports - Phase 2 Implementation

// Types
export * from './types';

// Enhanced Phase 2 Components
export { default as RealEstateDashboard } from './RealEstateDashboard';
export { default as PropertyManagement } from './PropertyManagement';

// Original Components - Registration Forms
export { RealtorRegistrationForm } from './components/RealtorRegistrationForm';
export { HouseAgentRegistrationForm } from './components/HouseAgentRegistrationForm';
export { HouseOwnerRegistrationForm } from './components/HouseOwnerRegistrationForm';

// Original Components - Dashboards
export { RealtorDashboard } from './components/RealtorDashboard';
export { HouseAgentDashboard } from './components/HouseAgentDashboard';
export { HouseOwnerDashboard } from './components/HouseOwnerDashboard';

// Original Components - Property Management
export { PropertyListingForm } from './components/PropertyListingForm';
export { PropertySearch } from './components/PropertySearch';

// Services
export { RealEstateService } from '../../services/realEstateService';
export { default as RealEstateServiceEnhanced } from '../../services/realEstateServiceEnhanced';
