import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SellerDashboard from '@/features/seller/SellerDashboard';
import AdminDashboard from '@/features/admin/AdminDashboard';
import DeliveryAgentDashboard from '@/features/delivery-agent/DeliveryAgentDashboard';
import RealtorDashboard from '@/features/realtor/RealtorDashboard';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const RoleDashboard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'SELLER':
      return <SellerDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'DELIVERY_AGENT':
      return <DeliveryAgentDashboard />;
    case 'REALTOR':
      return <RealtorDashboard />;
    case 'BUYER':
    case 'USER':
      // Regular users/buyers go to marketplace instead of dashboard
      return <Navigate to="/" replace />;
    default:
      // Unknown role, redirect to home
      return <Navigate to="/" replace />;
  }
};

export default RoleDashboard;