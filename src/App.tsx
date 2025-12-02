import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { AppProvider } from '@/contexts/AppContext';
// import { RealTimeProvider } from '@/contexts/RealTimeContext';
import HomePage from '@/pages/HomePage';
import EnhancedHomePage from '@/pages/EnhancedHomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import NewCustomerDashboard from '@/pages/CustomerDashboard';
import EnhancedSellerDashboard from '@/pages/EnhancedSellerDashboard';
import RealtorDashboard from '@/pages/RealtorDashboard';
import HouseAgentDashboard from '@/pages/HouseAgentDashboard';
import HouseOwnerDashboard from '@/pages/HouseOwnerDashboard';
import EmployerDashboard from '@/pages/EmployerDashboard';
import JobSeekerDashboard from '@/pages/JobSeekerDashboard';
import ProductListPage from '@/pages/ProductListPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderSuccessPage from '@/pages/OrderSuccessPage';
import { 
  CustomerDashboard, 
  CustomerOnboarding, 
  CustomerEngagement, 
  CustomerSupport 
} from '@/features/customer';
import SearchPage from '@/pages/Search';
import ProfilePage from '@/pages/Profile';
import ProfileRouter from '@/components/ProfileRouter';
import NotFoundPage from '@/pages/NotFound';
import PropertyListingsPage from '@/pages/PropertyListingsPage';
import PropertyDetailPage from '@/pages/PropertyDetailPage';
import JobListingsPage from '@/pages/JobListingsPage';
import JobDetailPage from '@/pages/JobDetailPage';
import TrackingPage from '@/pages/TrackingPage';
import UnifiedMarketplace from '@/pages/UnifiedMarketplace';
import { PaymentDashboard } from '@/features/payment/PaymentDashboard';
import { RevenueShareConfig } from '@/features/payment/RevenueShareConfig';
import { SellerDashboard, ProductManagement, OrderManagement, SellerProfile } from '@/features/seller';
import SellerAnalytics from '@/features/seller/SellerAnalytics';
import { 
  LegalDocumentManager, 
  UserSafetyCenter, 
  DisputeResolution, 
  DataProtectionCenter, 
  LegalComplianceDashboard 
} from '@/features/legal';
import { 
  UserManagement as AdminUserManagement,
  CustomerManagement as AdminCustomerManagement,
  ContentModeration as AdminContentModeration,
  Analytics as AdminAnalytics,
  SellerManagement as AdminSellerManagement
} from '@/features/admin';
import { RealEstateDashboard, PropertyManagement } from '@/features/realtor';
import { DeliveryAgentRegistration } from '@/components/delivery/DeliveryAgentRegistration';
import { DeliveryAgencyDashboard } from '@/components/delivery/DeliveryAgencyDashboard';
import { DeliveryRegistrationSuccess } from '@/components/delivery/DeliveryRegistrationSuccess';
import { OrderConfirmation } from '@/components/orders/OrderConfirmation';
import { EnhancedCheckout } from '@/components/checkout/EnhancedCheckout';
import ArtisanConnect from '@/pages/ArtisanConnect';
import ArtisanConnectPage from '@/pages/ArtisanConnectPage';
import AdminDashboard from '@/pages/dashboards/AdminDashboard';
import AdminReports from '@/pages/AdminReports';
import AddProduct from '@/pages/AddProduct';
import EditProduct from '@/pages/EditProduct';
import AddProperty from '@/pages/AddProperty';
import PostJob from '@/pages/PostJob';
import ResumeUpload from '@/pages/ResumeUpload';
import DebugAuth from '@/components/DebugAuth';
import { Toaster } from '@/components/ui/toaster';
import RouterWrapper from '@/components/navigation/RouterWrapper';
import '@/assets/styles/global.css';

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        {/* <RealTimeProvider> */}
          <CartProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <RouterWrapper>
                <div className="App">
                  <Routes key={window.location.pathname + window.location.search}>
                <Route path="/" element={<EnhancedHomePage />} />
                <Route path="/marketplace" element={<UnifiedMarketplace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Auth routes for compatibility */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                
                {/* Role-specific Dashboards */}
                <Route path="/customer/dashboard" element={<NewCustomerDashboard />} />
                <Route path="/seller/dashboard" element={<EnhancedSellerDashboard />} />
                <Route path="/realtor/dashboard" element={<RealtorDashboard />} />
                <Route path="/house-agent/dashboard" element={<HouseAgentDashboard />} />
                <Route path="/house-owner/dashboard" element={<HouseOwnerDashboard />} />
                <Route path="/employer/dashboard" element={<EmployerDashboard />} />
                <Route path="/job-seeker/dashboard" element={<JobSeekerDashboard />} />
                
                {/* Admin Dashboard */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/users" element={<AdminUserManagement />} />
                <Route path="/admin/customers" element={<AdminCustomerManagement />} />
                <Route path="/admin/content-moderation" element={<AdminContentModeration />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/sellers" element={<AdminSellerManagement />} />
                
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/properties" element={<PropertyListingsPage />} />
                <Route path="/properties/:id" element={<PropertyDetailPage />} />
                <Route path="/jobs" element={<JobListingsPage />} />
                <Route path="/jobs/post" element={<PostJob />} />
                <Route path="/jobs/:id" element={<JobDetailPage />} />
                <Route path="/resume/upload" element={<ResumeUpload />} />
                <Route path="/track" element={<TrackingPage />} />
                <Route path="/track/:trackingNumber" element={<TrackingPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/enhanced-checkout" element={<EnhancedCheckout />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                
                {/* Delivery System Routes */}
                <Route path="/delivery/register" element={<DeliveryAgentRegistration />} />
                <Route path="/delivery/dashboard" element={<DeliveryAgencyDashboard />} />
                <Route path="/delivery/registration/success" element={<DeliveryRegistrationSuccess />} />
                <Route path="/dashboard" element={<CustomerDashboard />} />
                <Route path="/onboarding" element={<CustomerOnboarding />} />
                <Route path="/loyalty" element={<CustomerEngagement />} />
                <Route path="/support" element={<CustomerSupport />} />
                <Route path="/seller/products" element={<ProductManagement />} />
                <Route path="/seller/products/add" element={<AddProduct />} />
                <Route path="/seller/products/edit/:id" element={<EditProduct />} />
                <Route path="/seller/orders" element={<OrderManagement />} />
                <Route path="/properties/add" element={<AddProperty />} />
                <Route path="/seller/profile" element={<SellerProfile />} />
                <Route path="/seller/analytics" element={<SellerAnalytics />} />
                <Route path="/admin/payment-dashboard" element={<PaymentDashboard />} />
                <Route path="/admin/revenue-config" element={<RevenueShareConfig />} />
                <Route path="/admin/legal-documents" element={<LegalDocumentManager />} />
                <Route path="/admin/safety-center" element={<UserSafetyCenter />} />
                <Route path="/admin/disputes" element={<DisputeResolution />} />
                <Route path="/admin/data-protection" element={<DataProtectionCenter />} />
                <Route path="/admin/compliance" element={<LegalComplianceDashboard />} />
                <Route path="/realtor/dashboard" element={<RealEstateDashboard />} />
                <Route path="/realtor/properties" element={<PropertyManagement />} />
                <Route path="/artisan-connect" element={<ArtisanConnectPage />} />
                <Route path="/search" element={<SearchPage />} />
                {/* Universal profile router - redirects to appropriate profile based on user role */}
                <Route path="/profile" element={<ProfileRouter />} />
                
                {/* Role-specific profile routes */}
                <Route path="/customer/profile" element={<ProfileRouter />} />
                <Route path="/admin/profile" element={<ProfileRouter />} />
                <Route path="/artisan/profile" element={<ProfileRouter />} />
                
                {/* Legacy profile page (keeping for compatibility) */}
                <Route path="/profile/legacy" element={<ProfilePage />} />
                <Route path="/debug" element={<DebugAuth />} />
                <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                  <Toaster />
                </div>
              </RouterWrapper>
            </Router>
          </CartProvider>
        {/* </RealTimeProvider> */}
      </AuthProvider>
    </AppProvider>
  );
}

export default App;