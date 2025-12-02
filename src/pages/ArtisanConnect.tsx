import React, { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { ArtisanProvider } from '@/contexts/ArtisanContext';
import { MainLayout } from '@/components/layout/MainLayout';
import ServiceCategories from '@/features/artisan/components/ServiceCategories';
import ArtisanDiscovery from '@/features/artisan/components/customer/ArtisanDiscovery';
import ServiceRequestForm from '@/features/artisan/components/customer/ServiceRequestForm';
import RequestDashboard from '@/features/artisan/components/customer/RequestDashboard';
import ArtisanDashboard from '@/features/artisan/components/artisan/ArtisanDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceCategory, Artisan } from '@/types';
import { Wrench, Search, MessageSquare, Star, Clock, Shield } from 'lucide-react';

type ViewState = 'categories' | 'discovery' | 'request-form' | 'dashboard';

export default function ArtisanConnect() {
  const { user } = useAuthContext();
  const [currentView, setCurrentView] = useState<ViewState>('categories');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);

  // Route based on user role
  if (user?.role === 'artisan') {
    return (
      <ArtisanProvider>
        <MainLayout>
          <div className="min-h-screen bg-gray-50">
            <ArtisanDashboard />
          </div>
        </MainLayout>
      </ArtisanProvider>
    );
  }

  const handleCategorySelect = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setCurrentView('discovery');
  };

  const handleArtisanSelect = (artisan: Artisan) => {
    setSelectedArtisan(artisan);
    setCurrentView('request-form');
  };

  const handleCreateRequest = () => {
    setCurrentView('dashboard');
  };

  const renderHeroSection = () => (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 rounded-full">
              <Wrench className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            ArtisanConnect
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-red-100">
            Connect with skilled artisans for all your service needs
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              size="lg" 
              className="bg-white text-red-600 hover:bg-red-50"
              onClick={() => setCurrentView('categories')}
            >
              Find Services
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
            >
              Become an Artisan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeatures = () => (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose ArtisanConnect?
          </h2>
          <p className="text-lg text-gray-600">
            The most trusted platform for connecting with skilled professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center border-none shadow-lg">
            <CardContent className="p-8">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Artisans</h3>
              <p className="text-gray-600">
                All artisans are background-checked and verified for your safety and peace of mind.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-none shadow-lg">
            <CardContent className="p-8">
              <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quick Response</h3>
              <p className="text-gray-600">
                Get quotes within minutes and book services that fit your schedule.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-none shadow-lg">
            <CardContent className="p-8">
              <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Guarantee</h3>
              <p className="text-gray-600">
                Escrow payment system ensures quality work completion before payment release.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderBreadcrumb = () => {
    const breadcrumbs = [];
    
    if (currentView === 'categories') {
      breadcrumbs.push({ label: 'Services', active: true });
    } else if (currentView === 'discovery') {
      breadcrumbs.push(
        { label: 'Services', onClick: () => setCurrentView('categories') },
        { label: selectedCategory?.name || 'Artisans', active: true }
      );
    } else if (currentView === 'request-form') {
      breadcrumbs.push(
        { label: 'Services', onClick: () => setCurrentView('categories') },
        { label: selectedCategory?.name || 'Artisans', onClick: () => setCurrentView('discovery') },
        { label: 'Create Request', active: true }
      );
    } else if (currentView === 'dashboard') {
      breadcrumbs.push({ label: 'My Requests', active: true });
    }

    return (
      <nav className="flex space-x-2 text-sm text-gray-500 mb-6">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span>/</span>}
            {crumb.active ? (
              <span className="text-gray-900 font-medium">{crumb.label}</span>
            ) : (
              <button 
                onClick={crumb.onClick}
                className="hover:text-red-600 transition-colors"
              >
                {crumb.label}
              </button>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  };

  return (
    <ArtisanProvider>
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Hero Section - Only show on categories view */}
          {currentView === 'categories' && renderHeroSection()}

        {/* Features Section - Only show on categories view */}
        {currentView === 'categories' && renderFeatures()}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-6">
            {renderBreadcrumb()}
            
            <div className="flex space-x-2">
              {user && (
                <Button
                  variant={currentView === 'dashboard' ? 'default' : 'outline'}
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>My Requests</span>
                </Button>
              )}
              
              {currentView !== 'categories' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentView('categories');
                    setSelectedCategory(null);
                    setSelectedArtisan(null);
                  }}
                >
                  Browse Services
                </Button>
              )}
            </div>
          </div>

          {/* Content based on current view */}
          {currentView === 'categories' && (
            <ServiceCategories
              onCategorySelect={handleCategorySelect}
              selectedCategory={selectedCategory}
            />
          )}

          {currentView === 'discovery' && (
            <ArtisanDiscovery
              onArtisanSelect={handleArtisanSelect}
              categoryId={selectedCategory?.id}
            />
          )}

          {currentView === 'request-form' && (
            <ServiceRequestForm
              categoryId={selectedCategory?.id}
              onSubmit={handleCreateRequest}
              onCancel={() => setCurrentView('discovery')}
            />
          )}

          {currentView === 'dashboard' && <RequestDashboard />}
        </div>

        {/* Quick Stats Footer - Only show on categories view */}
        {currentView === 'categories' && (
          <div className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-red-400 mb-2">50,000+</div>
                  <div className="text-gray-400">Verified Artisans</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-400 mb-2">1M+</div>
                  <div className="text-gray-400">Jobs Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-400 mb-2">4.8★</div>
                  <div className="text-gray-400">Average Rating</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-400 mb-2">24/7</div>
                  <div className="text-gray-400">Support Available</div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </MainLayout>
    </ArtisanProvider>
  );
}
