import { UserRole } from '@/types';

/**
 * Get the appropriate dashboard route based on user role
 */
export const getDashboardRoute = (role: UserRole): string => {
  switch (role) {
    case 'customer':
      return '/customer/dashboard';
    case 'seller':
      return '/seller/dashboard';
    case 'realtor':
      return '/realtor/dashboard';
    case 'house_agent':
      return '/house-agent/dashboard';
    case 'house_owner':
      return '/house-owner/dashboard';
    case 'employer':
      return '/employer/dashboard';
    case 'job_seeker':
      return '/job-seeker/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'delivery':
      return '/delivery/dashboard';
    default:
      return '/dashboard'; // fallback
  }
};

/**
 * Get dashboard title based on user role
 */
export const getDashboardTitle = (role: UserRole): string => {
  switch (role) {
    case 'customer':
      return 'Customer Dashboard';
    case 'seller':
      return 'Seller Dashboard';
    case 'realtor':
      return 'Realtor Dashboard';
    case 'house_agent':
      return 'House Agent Dashboard';
    case 'house_owner':
      return 'House Owner Dashboard';
    case 'employer':
      return 'Employer Dashboard';
    case 'job_seeker':
      return 'Job Seeker Dashboard';
    case 'admin':
      return 'Admin Dashboard';
    case 'delivery':
      return 'Delivery Dashboard';
    default:
      return 'Dashboard';
  }
};
