import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, ArrowRight, ArrowLeft, Gift, Star, 
  User, Settings, ShoppingBag, Heart, Camera, MapPin 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthContext } from '@/contexts/AuthContext';
import customerService from '@/services/customerService';
import { CustomerOnboarding as OnboardingType, OnboardingStep } from './types';

const CustomerOnboarding: React.FC = () => {
  const { user, updateUserProfile } = useAuthContext();
  const navigate = useNavigate();
  
  const [onboarding, setOnboarding] = useState<OnboardingType | null>(null);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  
  // Form states for different steps
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    bio: '',
    avatar: user?.avatar || '',
    city: '',
    state: ''
  });
  
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    promotions: true,
    newsletter: false,
    currency: 'NGN',
    language: 'en'
  });

  useEffect(() => {
    loadOnboardingData();
  }, [user]);

  const loadOnboardingData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [onboardingData, stepsData] = await Promise.all([
        customerService.getOnboardingProgress(user.id),
        customerService.getOnboardingSteps()
      ]);
      
      if (onboardingData) {
        setOnboarding(onboardingData);
        setCurrentStepIndex(onboardingData.currentStep || 0);
      } else {
        // Initialize onboarding for new user
        const newOnboarding: OnboardingType = {
          id: '',
          customerId: user.id,
          currentStep: 0,
          totalSteps: stepsData.length,
          completedSteps: [],
          skipppedSteps: [],
          startedAt: new Date().toISOString(),
          isCompleted: false,
          progress: 0
        };
        setOnboarding(newOnboarding);
      }
      
      setSteps(stepsData);
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeStep = async (stepId: string) => {
    if (!user || !onboarding) return;
    
    setCompleting(true);
    try {
      await customerService.updateOnboardingProgress(user.id, stepId);
      
      // Update local state
      const updatedCompletedSteps = [...onboarding.completedSteps, stepId];
      const progress = (updatedCompletedSteps.length / onboarding.totalSteps) * 100;
      
      setOnboarding(prev => prev ? {
        ...prev,
        completedSteps: updatedCompletedSteps,
        currentStep: prev.currentStep + 1,
        progress,
        isCompleted: progress >= 100,
        completedAt: progress >= 100 ? new Date().toISOString() : undefined
      } : null);
      
      // Award points for completion
      const step = steps.find(s => s.id === stepId);
      if (step?.rewards?.points) {
        await customerService.updateLoyaltyPoints(
          user.id, 
          step.rewards.points, 
          `Completed onboarding step: ${step.title}`
        );
      }
      
      // Move to next step
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        // Onboarding complete
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error completing step:', error);
    } finally {
      setCompleting(false);
    }
  };

  const skipStep = async (stepId: string) => {
    if (!user || !onboarding) return;
    
    const updatedSkippedSteps = [...onboarding.skipppedSteps, stepId];
    setOnboarding(prev => prev ? {
      ...prev,
      skipppedSteps: updatedSkippedSteps,
      currentStep: prev.currentStep + 1
    } : null);
    
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const renderProfileStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative inline-block">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profileData.avatar} />
            <AvatarFallback className="text-2xl">
              {profileData.firstName?.[0]}{profileData.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <Button
            size="sm"
            className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={profileData.firstName}
            onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
            placeholder="Enter your first name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={profileData.lastName}
            onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
            placeholder="Enter your last name"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={profileData.phone}
          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="Enter your phone number"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={profileData.city}
            onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
            placeholder="Enter your city"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Select value={profileData.state} onValueChange={(value) => setProfileData(prev => ({ ...prev, state: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lagos">Lagos</SelectItem>
              <SelectItem value="abuja">Abuja</SelectItem>
              <SelectItem value="kano">Kano</SelectItem>
              <SelectItem value="rivers">Rivers</SelectItem>
              <SelectItem value="oyo">Oyo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">Bio (Optional)</Label>
        <Textarea
          id="bio"
          value={profileData.bio}
          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Tell us a bit about yourself..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderPreferencesStep = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold mb-4">Notification Preferences</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-gray-600">Receive order updates and important news</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailNotifications: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pushNotifications">Push Notifications</Label>
              <p className="text-sm text-gray-600">Get instant updates in your browser</p>
            </div>
            <Switch
              id="pushNotifications"
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, pushNotifications: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="promotions">Promotions & Deals</Label>
              <p className="text-sm text-gray-600">Stay updated on special offers</p>
            </div>
            <Switch
              id="promotions"
              checked={preferences.promotions}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, promotions: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="newsletter">Weekly Newsletter</Label>
              <p className="text-sm text-gray-600">Curated products and marketplace updates</p>
            </div>
            <Switch
              id="newsletter"
              checked={preferences.newsletter}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, newsletter: checked }))}
            />
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-semibold mb-4">Display Preferences</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Preferred Currency</Label>
            <Select value={preferences.currency} onValueChange={(value) => setPreferences(prev => ({ ...prev, currency: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                <SelectItem value="USD">US Dollar ($)</SelectItem>
                <SelectItem value="EUR">Euro (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ha">Hausa</SelectItem>
                <SelectItem value="ig">Igbo</SelectItem>
                <SelectItem value="yo">Yoruba</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBrowseStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <ShoppingBag className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Explore Our Marketplace</h3>
        <p className="text-gray-600">
          Discover thousands of products from trusted sellers across Nigeria
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold mb-2">Electronics</h4>
            <p className="text-sm text-gray-600">Phones, laptops, gadgets</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 text-red-600" />
            </div>
            <h4 className="font-semibold mb-2">Fashion</h4>
            <p className="text-sm text-gray-600">Clothing, shoes, accessories</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold mb-2">Real Estate</h4>
            <p className="text-sm text-gray-600">Houses, apartments, land</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold mb-2">💡 Pro Tip</h4>
        <p className="text-sm text-gray-600">
          Add items to your wishlist while browsing to save them for later. 
          You'll get notified about price drops and special offers!
        </p>
      </div>
    </div>
  );

  const renderStepContent = (step: OnboardingStep) => {
    switch (step.id) {
      case 'profile':
        return renderProfileStep();
      case 'preferences':
        return renderPreferencesStep();
      case 'browse':
        return renderBrowseStep();
      default:
        return <div>Step content not implemented</div>;
    }
  };

  const canCompleteCurrentStep = () => {
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return false;
    
    switch (currentStep.id) {
      case 'profile':
        return profileData.firstName.trim() && profileData.lastName.trim();
      case 'preferences':
      case 'browse':
        return true;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your onboarding...</p>
        </div>
      </div>
    );
  }

  if (!onboarding || !steps.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load onboarding. Please try again.</p>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome to Georgy Marketplace!</h1>
              <p className="text-gray-600">Let's set up your account</p>
            </div>
            <Badge variant="outline">
              {currentStepIndex + 1} of {steps.length}
            </Badge>
          </div>
          
          {/* Progress bar */}
          <div className="mt-6">
            <Progress value={onboarding.progress} className="h-2" />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Progress: {Math.round(onboarding.progress)}%</span>
              <span>
                {onboarding.completedSteps.length} of {onboarding.totalSteps} steps completed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                {currentStep.id === 'profile' && <User className="w-5 h-5 text-primary" />}
                {currentStep.id === 'preferences' && <Settings className="w-5 h-5 text-primary" />}
                {currentStep.id === 'browse' && <ShoppingBag className="w-5 h-5 text-primary" />}
              </div>
              <div>
                <CardTitle>{currentStep.title}</CardTitle>
                <CardDescription>
                  {currentStep.description}
                  {currentStep.estimatedTime && (
                    <span className="ml-2 text-xs">• {currentStep.estimatedTime} min</span>
                  )}
                </CardDescription>
              </div>
            </div>
            
            {currentStep.rewards && (
              <div className="flex items-center space-x-2 mt-3">
                <Gift className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-600">
                  Earn {currentStep.rewards.points} points
                  {currentStep.rewards.badge && ` + ${currentStep.rewards.badge} badge`}
                </span>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            {renderStepContent(currentStep)}
            
            {/* Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <div>
                {currentStepIndex > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-3">
                {currentStep.isSkippable && (
                  <Button
                    variant="ghost"
                    onClick={() => skipStep(currentStep.id)}
                  >
                    Skip for now
                  </Button>
                )}
                
                <Button
                  onClick={() => completeStep(currentStep.id)}
                  disabled={!canCompleteCurrentStep() || completing}
                  className="min-w-[120px]"
                >
                  {completing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      {currentStepIndex === steps.length - 1 ? 'Finish' : 'Continue'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerOnboarding;
