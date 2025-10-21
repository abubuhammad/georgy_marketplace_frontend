import React from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { EnhancedProfile } from './enhanced/EnhancedProfile';
import { EnhancedSellerProfile } from './profiles/EnhancedSellerProfile';
import { EnhancedEmployerProfile } from './profiles/EnhancedEmployerProfile';
import { EnhancedJobSeekerProfile } from './profiles/EnhancedJobSeekerProfile';
import { EnhancedCustomerProfile } from './profiles/EnhancedCustomerProfile';
import { EnhancedAdminProfile } from './profiles/EnhancedAdminProfile';
import { EnhancedRealtorProfile } from './profiles/EnhancedRealtorProfile';
import { EnhancedHouseOwnerProfile } from './profiles/EnhancedHouseOwnerProfile';
import { EnhancedHouseAgentProfile } from './profiles/EnhancedHouseAgentProfile';
import SellerProfile from '@/features/seller/SellerProfile';
import CustomerProfile from '@/features/customer/CustomerProfile';
import AdminProfile from '@/features/admin/AdminProfile';
import ArtisanProfile from '@/features/artisan/ArtisanProfile';
import { User } from 'lucide-react';

const ProfileRouter: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuthContext();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Route to appropriate profile based on user role
  switch (user.role) {
    case 'seller':
      return <EnhancedSellerProfile />;
    case 'employer':
      return <EnhancedEmployerProfile />;
    case 'job_seeker':
      return <EnhancedJobSeekerProfile />;
    case 'customer':
      return <EnhancedCustomerProfile />;
    case 'admin':
      return <EnhancedAdminProfile />;
    case 'artisan':
      return <EnhancedProfile role="artisan" />;
    case 'realtor':
      return <EnhancedRealtorProfile />;
    case 'house_agent':
      return <EnhancedHouseAgentProfile />;
    case 'house_owner':
      return <EnhancedHouseOwnerProfile />;
    default:
      // Default to customer profile for unknown roles
      return <EnhancedProfile role="customer" />;
  }
};

export default ProfileRouter;
