import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { FormHeader } from '@/components/layout/FormHeader';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  X, 
  Plus, 
  MapPin, 
  Camera, 
  ImageIcon, 
  Package, 
  DollarSign, 
  FileText, 
  Star,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { listingService } from '@/services/listingService';

interface ListingFormData {
  title: string;
  category: string;
  price: string;
  condition: 'new' | 'used';
  description: string;
  location: string;
  contactPhone: string;
  images: File[];
}

const categories = [
  { id: 'electronics', name: 'Electronics', icon: Package },
  { id: 'fashion', name: 'Fashion & Beauty', icon: Star },
  { id: 'home', name: 'Home & Garden', icon: Plus },
  { id: 'vehicles', name: 'Vehicles & Transport', icon: MapPin },
  { id: 'property', name: 'Property & Real Estate', icon: Package },
  { id: 'services', name: 'Services', icon: FileText },
  { id: 'sports', name: 'Sports & Recreation', icon: Star },
  { id: 'books', name: 'Books & Education', icon: FileText }
];

const conditions = [
  { value: 'new', label: 'Brand New', description: 'Never used, in original packaging' },
  { value: 'like-new', label: 'Like New', description: 'Barely used, excellent condition' },
  { value: 'good', label: 'Good', description: 'Used but in good working condition' },
  { value: 'fair', label: 'Fair', description: 'Shows signs of wear but functional' }
];

const ListingPage: React.FC = () => {
  const { user, loading, login } = useAuthContext();
  const navigate = useNavigate();
  
  // Debug logging
  console.log('Post-ad page - User:', user);
  console.log('Post-ad page - Loading:', loading);
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    category: '',
    price: '',
    condition: 'new',
    description: '',
    location: '',
    contactPhone: '',
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const totalSteps = 3;

  const handleInputChange = (field: keyof ListingFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) errors.title = 'Title is required';
      if (!formData.category) errors.category = 'Category is required';
      if (!formData.price) errors.price = 'Price is required';
      if (!formData.condition) errors.condition = 'Condition is required';
    }

    if (step === 2) {
      if (!formData.description.trim()) errors.description = 'Description is required';
      if (!formData.location.trim()) errors.location = 'Location is required';
      if (!formData.contactPhone.trim()) errors.contactPhone = 'Phone number is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    const newImages = [...formData.images, ...files];
    setFormData(prev => ({ ...prev, images: newImages }));
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    setPreviewImages(newPreviews);
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to post a listing');
      return;
    }

    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the listing in the database
      const listingData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        condition: formData.condition,
        location: formData.location,
        contactPhone: formData.contactPhone,
        images: formData.images
      };

      const { listing, error } = await listingService.createListing(listingData, user.id);

      if (error) {
        toast.error(`Failed to post listing: ${error}`);
        return;
      }

      toast.success('Listing posted successfully! Your product is now live on the marketplace.');
      
      // Reset form
      setFormData({
        title: '',
        category: '',
        price: '',
        condition: 'new',
        description: '',
        location: '',
        contactPhone: '',
        images: []
      });
      setPreviewImages([]);
      setCurrentStep(1);
      
      // Optionally redirect to the listing or dashboard
      setTimeout(() => {
        navigate('/seller/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error posting listing:', error);
      toast.error('Error posting listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <FormHeader
          title="Post Your Ad"
          subtitle="Loading..."
          backUrl="/seller/dashboard"
          backLabel="Back to Dashboard"
        />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Card className="p-8">
            <div className="mb-6">
              <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
              <p className="text-gray-600">Checking your login status</p>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <FormHeader
          title="Post Your Ad"
          subtitle="Login Required"
          backUrl="/seller/dashboard"
          backLabel="Back to Dashboard"
        />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Card className="p-8">
            <div className="mb-6">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Login Required</h1>
              <p className="text-gray-600 mb-8">Please login to post a listing and start selling on Georgy Marketplace</p>
            </div>
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => window.location.href = '/login'}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Login to Continue
              </Button>
              
              {/* Development mode quick login */}
              <Button 
                variant="outline"
                size="lg" 
                className="w-full"
                onClick={async () => {
                  const result = await login({ email: 'seller@demo.com', password: 'password' });
                  if (result.user) {
                    toast.success('Logged in successfully!');
                    window.location.reload();
                  }
                }}
              >
                Demo Seller Login (Dev Mode)
              </Button>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <FormHeader
        title="Post Your Ad"
        subtitle="Create a listing to sell your item on Georgy Marketplace"
        backUrl="/seller/dashboard"
        backLabel="Back to Dashboard"
        actions={
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Step {currentStep} of {totalSteps}
          </Badge>
        }
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Section */}
        <div className="mb-8">
          
          {/* Progress Bar */}
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            <div className="flex justify-between mt-4 text-xs">
              <div className={`flex items-center gap-1 ${currentStep >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
                <Package className="w-3 h-3" />
                Basic Info
              </div>
              <div className={`flex items-center gap-1 ${currentStep >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
                <FileText className="w-3 h-3" />
                Description
              </div>
              <div className={`flex items-center gap-1 ${currentStep >= 3 ? 'text-red-600' : 'text-gray-400'}`}>
                <ImageIcon className="w-3 h-3" />
                Photos
              </div>
            </div>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={`step-${currentStep}`} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="step-1" disabled={currentStep < 1}>
                <Package className="w-4 h-4 mr-2" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="step-2" disabled={currentStep < 2}>
                <FileText className="w-4 h-4 mr-2" />
                Description
              </TabsTrigger>
              <TabsTrigger value="step-3" disabled={currentStep < 3}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Photos
              </TabsTrigger>
            </TabsList>

            {/* Step 1: Basic Information */}
            <TabsContent value="step-1" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Provide the essential details about your item
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Title *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter a descriptive title for your item"
                      className={validationErrors.title ? 'border-red-500' : ''}
                    />
                    {validationErrors.title && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.title}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger className={validationErrors.category ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              <div className="flex items-center gap-2">
                                <cat.icon className="w-4 h-4" />
                                {cat.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {validationErrors.category && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validationErrors.category}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (₦) *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          placeholder="0"
                          className={`pl-10 ${validationErrors.price ? 'border-red-500' : ''}`}
                          min="0"
                        />
                      </div>
                      {validationErrors.price && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validationErrors.price}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {conditions.map((condition) => (
                        <div 
                          key={condition.value}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            formData.condition === condition.value 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleInputChange('condition', condition.value)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${
                              formData.condition === condition.value ? 'bg-red-500' : 'bg-gray-300'
                            }`} />
                            <span className="font-medium">{condition.label}</span>
                          </div>
                          <p className="text-sm text-gray-600">{condition.description}</p>
                        </div>
                      ))}
                    </div>
                    {validationErrors.condition && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.condition}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 2: Description & Location */}
            <TabsContent value="step-2" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Description & Contact
                  </CardTitle>
                  <CardDescription>
                    Provide detailed information about your item and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your item in detail. Include specifications, condition details, reason for selling, etc."
                      rows={6}
                      className={validationErrors.description ? 'border-red-500' : ''}
                    />
                    {validationErrors.description && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 20 characters. Be specific to attract more buyers.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="e.g., Lagos, Nigeria"
                          className={`pl-10 ${validationErrors.location ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {validationErrors.location && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validationErrors.location}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <Input
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        placeholder="080xxxxxxxx"
                        className={validationErrors.contactPhone ? 'border-red-500' : ''}
                      />
                      {validationErrors.contactPhone && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validationErrors.contactPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Tips for a great listing</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Include all relevant details and specifications</li>
                          <li>• Mention any defects or issues honestly</li>
                          <li>• Explain why you're selling the item</li>
                          <li>• Be responsive to potential buyers</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 3: Photos */}
            <TabsContent value="step-3" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Photos
                  </CardTitle>
                  <CardDescription>
                    Add photos to showcase your item (up to 5 images)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <Badge className="absolute bottom-2 left-2 text-xs">
                            Main Photo
                          </Badge>
                        )}
                      </div>
                    ))}
                    
                    {formData.images.length < 5 && (
                      <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors h-32 flex flex-col items-center justify-center">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Camera className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-600">Add Photo</p>
                      </label>
                    )}
                  </div>

                  {formData.images.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        <div>
                          <p className="font-medium text-yellow-800">No photos added</p>
                          <p className="text-sm text-yellow-700">
                            Adding photos increases your chances of selling by up to 5x!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Photo Tips</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Take photos in good lighting</li>
                      <li>• Show the item from multiple angles</li>
                      <li>• Include close-ups of important details</li>
                      <li>• The first photo will be your main listing image</li>
                      <li>• Maximum file size: 5MB per image</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6">
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous Step
                </Button>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button type="button" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              
              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep}>
                  Next Step
                  <span className="ml-2">→</span>
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Publish Listing
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default ListingPage;