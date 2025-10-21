import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, 
  Building, 
  Briefcase, 
  ArrowRight, 
  Star,
  TrendingUp,
  Users,
  Clock,
  Check,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';
import { EnhancedListingForm } from '@/components/forms/EnhancedListingForm';

interface ListingCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  route: string;
  requiresAuth: boolean;
  allowedRoles: string[];
  features: string[];
  pricing: string;
  timeToList: string;
}

const ListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { currentPlatform } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const listingCategories: ListingCategory[] = [
    {
      id: 'product',
      title: 'Sell Products',
      description: 'List physical products, electronics, fashion items, and more',
      icon: Package,
      color: 'text-blue-600',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-cyan-500',
      route: '/seller/products/add',
      requiresAuth: true,
      allowedRoles: ['seller', 'admin'],
      features: ['Product photos', 'Detailed specs', 'Inventory tracking', 'Shipping options'],
      pricing: 'Free to list',
      timeToList: '5-10 minutes'
    },
    {
      id: 'property',
      title: 'List Property',
      description: 'Rent or sell houses, apartments, land, and commercial spaces',
      icon: Building,
      color: 'text-green-600',
      gradientFrom: 'from-green-500',
      gradientTo: 'to-emerald-500',
      route: '/properties/add',
      requiresAuth: true,
      allowedRoles: ['realtor', 'house_agent', 'house_owner', 'admin'],
      features: ['Virtual tours', 'Floor plans', 'Neighborhood info', 'Price analytics'],
      pricing: 'From ₦5,000',
      timeToList: '10-15 minutes'
    },
    {
      id: 'job',
      title: 'Post Jobs',
      description: 'Find qualified candidates for your open positions',
      icon: Briefcase,
      color: 'text-purple-600',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-indigo-500',
      route: '/jobs/post',
      requiresAuth: true,
      allowedRoles: ['employer', 'admin'],
      features: ['Applicant screening', 'Interview scheduling', 'Skill assessment', 'Team collaboration'],
      pricing: 'From ₦10,000',
      timeToList: '5-8 minutes'
    }
  ];

  const handleCategorySelect = (category: ListingCategory) => {
    if (!user && category.requiresAuth) {
      navigate('/login?redirect=' + encodeURIComponent('/post-ad'));
      return;
    }

    if (user && category.allowedRoles.length > 0 && !category.allowedRoles.includes(user.role || '')) {
      // Show role upgrade prompt or redirect to appropriate route
      navigate(category.route);
      return;
    }

    if (category.id === 'product' && !user?.role?.includes('seller')) {
      // Generic product listing form
      setSelectedCategory(category.id);
      setShowForm(true);
    } else {
      // Navigate to specialized forms
      navigate(category.route);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      // Handle generic listing submission
      console.log('Listing data:', formData);
      // API call would go here
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating listing:', error);
    }
  };

  const getRecommendedCategory = () => {
    if (!user) return null;
    
    const roleMapping: Record<string, string> = {
      'seller': 'product',
      'realtor': 'property',
      'house_agent': 'property',
      'house_owner': 'property',
      'employer': 'job'
    };

    return roleMapping[user.role || ''] || 'product';
  };

  const recommendedCategory = getRecommendedCategory();

  if (showForm && selectedCategory) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setShowForm(false)}
              className="mb-4"
            >
              ← Back to Categories
            </Button>
            <h1 className="text-3xl font-bold mb-2">Create Your Listing</h1>
            <p className="text-gray-600">Fill out the form below to create your listing</p>
          </div>
          
          <EnhancedListingForm onSubmit={handleFormSubmit} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            What would you like to list?
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose the type of listing you want to create. We'll guide you through the process.
          </p>
          
          {/* Stats */}
          <div className="flex justify-center space-x-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">50K+</div>
              <div className="text-sm text-gray-600">Active Listings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">98%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24h</div>
              <div className="text-sm text-gray-600">Avg. Response Time</div>
            </div>
          </div>
        </motion.div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {listingCategories.map((category, index) => {
            const Icon = category.icon;
            const isRecommended = category.id === recommendedCategory;
            const canAccess = !category.requiresAuth || 
              (user && (category.allowedRoles.length === 0 || category.allowedRoles.includes(user.role || '')));

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative"
              >
                {isRecommended && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-3 -right-3 z-10"
                  >
                    <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Recommended
                    </Badge>
                  </motion.div>
                )}

                <Card className={`h-full cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                  isRecommended ? 'border-yellow-200 shadow-yellow-100' : 'border-gray-200 hover:border-primary/30'
                } ${!canAccess ? 'opacity-60' : ''}`}
                onClick={() => canAccess && handleCategorySelect(category)}>
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradientFrom} ${category.gradientTo} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl mb-2">{category.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {category.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Features */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-800">Features included:</h4>
                      <ul className="space-y-1">
                        {category.features.slice(0, 3).map((feature, i) => (
                          <li key={i} className="flex items-center text-sm text-gray-600">
                            <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pricing & Time */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {category.pricing}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {category.timeToList}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      {!canAccess && category.requiresAuth && !user ? (
                        <Button variant="outline" className="w-full" disabled>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Login Required
                        </Button>
                      ) : !canAccess ? (
                        <Button variant="outline" className="w-full" disabled>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Role Required
                        </Button>
                      ) : (
                        <Button 
                          className={`w-full group ${isRecommended ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' : ''}`}
                        >
                          Get Started
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Need Help Getting Started?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our team is here to help you create the perfect listing. Get personalized assistance or browse our guides.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/support')}>
              <Users className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline" onClick={() => navigate('/guides')}>
              📚 Browse Guides
            </Button>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default ListingPage;