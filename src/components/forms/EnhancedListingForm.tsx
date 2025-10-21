import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  X,
  Star,
  Crown,
  Eye,
  Heart,
  DollarSign,
  AlertTriangle,
  Check,
  Camera,
  Video,
  FileText,
  MapPin,
  Phone,
  Mail,
  Shield,
  Zap,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface ListingFormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  condition: 'new' | 'used' | 'refurbished';
  price: number;
  originalPrice?: number;
  isNegotiable: boolean;
  brand: string;
  model: string;
  specifications: Record<string, string>;
  location: {
    city: string;
    state: string;
    address: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    preferredContact: 'phone' | 'email' | 'both';
  };
  images: File[];
  videos: File[];
  documents: File[];
  features: string[];
  tags: string[];
  isFeatured: boolean;
  featuredDuration: number;
  autoRelist: boolean;
  expiryDate: string;
}

interface ValidationRules {
  [key: string]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    maxFiles?: number;
    maxFileSize?: number; // in MB
    allowedTypes?: string[];
  };
}

interface EnhancedListingFormProps {
  onSubmit: (data: ListingFormData) => void;
  initialData?: Partial<ListingFormData>;
  isEditing?: boolean;
}

export const EnhancedListingForm: React.FC<EnhancedListingFormProps> = ({
  onSubmit,
  initialData = {},
  isEditing = false
}) => {
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    condition: 'new',
    price: 0,
    originalPrice: undefined,
    isNegotiable: false,
    brand: '',
    model: '',
    specifications: {},
    location: {
      city: '',
      state: '',
      address: ''
    },
    contactInfo: {
      phone: '',
      email: '',
      preferredContact: 'both'
    },
    images: [],
    videos: [],
    documents: [],
    features: [],
    tags: [],
    isFeatured: false,
    featuredDuration: 7,
    autoRelist: false,
    expiryDate: '',
    ...initialData
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [showFeaturedOptions, setShowFeaturedOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 5;
  const stepProgress = (currentStep / totalSteps) * 100;

  // Validation rules
  const validationRules: ValidationRules = {
    title: { required: true, minLength: 10, maxLength: 100 },
    description: { required: true, minLength: 50, maxLength: 2000 },
    category: { required: true },
    price: { required: true, min: 100 },
    'location.city': { required: true },
    'location.state': { required: true },
    'contactInfo.phone': { required: true, pattern: /^(\+234|0)[789]\d{9}$/ },
    'contactInfo.email': { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    images: { required: true, maxFiles: 10, maxFileSize: 5, allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] },
    videos: { maxFiles: 3, maxFileSize: 50, allowedTypes: ['video/mp4', 'video/webm'] },
    documents: { maxFiles: 5, maxFileSize: 10, allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'] }
  };

  // Mock data
  const categories = [
    { value: 'electronics', label: 'Electronics', subcategories: ['Phones', 'Laptops', 'TV & Audio', 'Gaming'] },
    { value: 'vehicles', label: 'Vehicles', subcategories: ['Cars', 'Motorcycles', 'Trucks', 'Parts'] },
    { value: 'fashion', label: 'Fashion', subcategories: ['Clothing', 'Shoes', 'Accessories', 'Bags'] },
    { value: 'real-estate', label: 'Real Estate', subcategories: ['Houses', 'Apartments', 'Land', 'Commercial'] }
  ];

  const nigerianStates = [
    'Lagos', 'Abuja', 'Kano', 'Rivers', 'Oyo', 'Delta', 'Kaduna', 'Anambra',
    'Enugu', 'Cross River', 'Edo', 'Imo', 'Plateau', 'Osun', 'Ondo'
  ];

  const featuredPricing = [
    { days: 3, price: 5000, discount: 0, popular: false },
    { days: 7, price: 10000, discount: 15, popular: true },
    { days: 14, price: 18000, discount: 20, popular: false },
    { days: 30, price: 35000, discount: 25, popular: false }
  ];

  const validateField = (name: string, value: any): string | null => {
    const rule = validationRules[name];
    if (!rule) return null;

    if (rule.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${name.split('.').pop()} is required`;
    }

    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `Minimum ${rule.minLength} characters required`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `Maximum ${rule.maxLength} characters allowed`;
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return `Invalid format`;
      }
    }

    if (typeof value === 'number') {
      if (rule.min && value < rule.min) {
        return `Minimum value is ${rule.min}`;
      }
      if (rule.max && value > rule.max) {
        return `Maximum value is ${rule.max}`;
      }
    }

    if (Array.isArray(value)) {
      if (rule.maxFiles && value.length > rule.maxFiles) {
        return `Maximum ${rule.maxFiles} files allowed`;
      }
    }

    return null;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        ['title', 'description', 'category'].forEach(field => {
          const error = validateField(field, (formData as any)[field]);
          if (error) newErrors[field] = error;
        });
        break;
      case 2:
        ['price', 'condition'].forEach(field => {
          const error = validateField(field, (formData as any)[field]);
          if (error) newErrors[field] = error;
        });
        break;
      case 3:
        ['location.city', 'location.state'].forEach(field => {
          const keys = field.split('.');
          const value = keys.reduce((obj, key) => obj?.[key], formData as any);
          const error = validateField(field, value);
          if (error) newErrors[field] = error;
        });
        break;
      case 4:
        ['contactInfo.phone', 'contactInfo.email'].forEach(field => {
          const keys = field.split('.');
          const value = keys.reduce((obj, key) => obj?.[key], formData as any);
          const error = validateField(field, value);
          if (error) newErrors[field] = error;
        });
        const imageError = validateField('images', formData.images);
        if (imageError) newErrors.images = imageError;
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (files: FileList | null, type: 'images' | 'videos' | 'documents') => {
    if (!files) return;

    const rule = validationRules[type];
    const fileArray = Array.from(files);

    // Validate file count
    if (rule?.maxFiles && fileArray.length > rule.maxFiles) {
      toast.error(`Maximum ${rule.maxFiles} ${type} allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    for (const file of fileArray) {
      if (rule?.allowedTypes && !rule.allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        continue;
      }

      if (rule?.maxFileSize && file.size > rule.maxFileSize * 1024 * 1024) {
        toast.error(`File too large: ${file.name} (max ${rule.maxFileSize}MB)`);
        continue;
      }

      validFiles.push(file);
    }

    if (type === 'images') {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...validFiles] }));
      
      // Generate previews
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImages(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    } else {
      setFormData(prev => ({ ...prev, [type]: [...prev[type], ...validFiles] }));
    }

    toast.success(`${validFiles.length} ${type} uploaded successfully`);
  };

  const removeFile = (index: number, type: 'images' | 'videos' | 'documents') => {
    if (type === 'images') {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
      setPreviewImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setFormData(prev => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index)
      }));
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast.error('Please fix the errors before continuing');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    // Final validation
    let allValid = true;
    for (let step = 1; step <= totalSteps; step++) {
      if (!validateStep(step)) {
        allValid = false;
        break;
      }
    }

    if (!allValid) {
      toast.error('Please complete all required fields');
      return;
    }

    onSubmit(formData);
  };

  const calculateFeaturedCost = () => {
    const selected = featuredPricing.find(p => p.days === formData.featuredDuration);
    if (!selected) return 0;
    
    const discount = selected.discount / 100;
    return selected.price * (1 - discount);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
              <p className="text-gray-600">Tell us about your item</p>
            </div>

            <div>
              <Label htmlFor="title">Listing Title *</Label>
              <Input
                id="title"
                placeholder="e.g., iPhone 14 Pro Max 256GB - Like New"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              <p className="text-sm text-gray-500 mt-1">
                {formData.title.length}/100 characters
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your item in detail. Include condition, features, reasons for selling, etc."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={errors.description ? 'border-red-500' : ''}
                rows={6}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/2000 characters (minimum 50)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value, subcategory: '' }))}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value }))}
                  disabled={!formData.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .find(cat => cat.value === formData.category)
                      ?.subcategories.map((sub) => (
                        <SelectItem key={sub} value={sub.toLowerCase()}>
                          {sub}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  placeholder="e.g., Apple, Samsung, Nike"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="e.g., iPhone 14 Pro Max, Galaxy S24"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Pricing & Condition</h2>
              <p className="text-gray-600">Set your price and item condition</p>
            </div>

            <div>
              <Label>Condition *</Label>
              <RadioGroup
                value={formData.condition}
                onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value as any }))}
                className="flex flex-col space-y-3 mt-2"
              >
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="new" id="new" />
                  <div className="flex-1">
                    <Label htmlFor="new" className="font-medium">New</Label>
                    <p className="text-sm text-gray-600">Brand new, unused item with original packaging</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="used" id="used" />
                  <div className="flex-1">
                    <Label htmlFor="used" className="font-medium">Used</Label>
                    <p className="text-sm text-gray-600">Previously owned, may show signs of wear</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="refurbished" id="refurbished" />
                  <div className="flex-1">
                    <Label htmlFor="refurbished" className="font-medium">Refurbished</Label>
                    <p className="text-sm text-gray-600">Restored to working condition</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Selling Price (₦) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={formData.price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <Label htmlFor="originalPrice">Original Price (₦)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  placeholder="Optional"
                  value={formData.originalPrice || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseInt(e.target.value) || undefined }))}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Helps buyers see the value
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="negotiable"
                checked={formData.isNegotiable}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isNegotiable: !!checked }))}
              />
              <Label htmlFor="negotiable">Price is negotiable</Label>
            </div>

            {formData.originalPrice && formData.originalPrice > formData.price && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    {Math.round((1 - formData.price / formData.originalPrice) * 100)}% discount
                  </span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  This will attract more buyers!
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Location</h2>
              <p className="text-gray-600">Where is your item located?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State *</Label>
                <Select
                  value={formData.location.state}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, state: value }
                  }))}
                >
                  <SelectTrigger className={errors['location.state'] ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {nigerianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors['location.state'] && <p className="text-red-500 text-sm mt-1">{errors['location.state']}</p>}
              </div>

              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g., Ikeja, Wuse, Gbagada"
                  value={formData.location.city}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, city: e.target.value }
                  }))}
                  className={errors['location.city'] ? 'border-red-500' : ''}
                />
                {errors['location.city'] && <p className="text-red-500 text-sm mt-1">{errors['location.city']}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Specific Address (Optional)</Label>
              <Textarea
                id="address"
                placeholder="Provide more specific location details (optional)"
                value={formData.location.address}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, address: e.target.value }
                }))}
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                This will help buyers find you. Your exact address won't be shown publicly.
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Location Tips</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Choose a popular area for better visibility</li>
                    <li>• Consider meeting spots near landmarks</li>
                    <li>• Your exact address won't be shown to buyers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Contact & Media</h2>
              <p className="text-gray-600">How should buyers contact you?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="+234 or 0 followed by 10 digits"
                  value={formData.contactInfo.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, phone: e.target.value }
                  }))}
                  className={errors['contactInfo.phone'] ? 'border-red-500' : ''}
                />
                {errors['contactInfo.phone'] && <p className="text-red-500 text-sm mt-1">{errors['contactInfo.phone']}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.contactInfo.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, email: e.target.value }
                  }))}
                  className={errors['contactInfo.email'] ? 'border-red-500' : ''}
                />
                {errors['contactInfo.email'] && <p className="text-red-500 text-sm mt-1">{errors['contactInfo.email']}</p>}
              </div>
            </div>

            <div>
              <Label>Preferred Contact Method</Label>
              <RadioGroup
                value={formData.contactInfo.preferredContact}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, preferredContact: value as any }
                }))}
                className="flex space-x-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone-pref" />
                  <Label htmlFor="phone-pref">Phone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email-pref" />
                  <Label htmlFor="email-pref">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both-pref" />
                  <Label htmlFor="both-pref">Both</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Image Upload */}
            <div>
              <Label>Photos * (Maximum 10 images, 5MB each)</Label>
              <div className="mt-2">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload photos</p>
                  <p className="text-sm text-gray-500">
                    JPG, PNG, WebP up to 5MB each
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files, 'images')}
                  className="hidden"
                />
                {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
              </div>

              {/* Image Previews */}
              {previewImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 rounded-full w-6 h-6 p-0"
                        onClick={() => removeFile(index, 'images')}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      {index === 0 && (
                        <Badge className="absolute bottom-1 left-1 text-xs">
                          Main
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div>
              <Label>Videos (Optional - Maximum 3 videos, 50MB each)</Label>
              <div className="mt-2">
                <Button
                  variant="outline"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Upload Videos
                </Button>
                <input
                  ref={videoInputRef}
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e.target.files, 'videos')}
                  className="hidden"
                />
              </div>
              {formData.videos.length > 0 && (
                <div className="mt-2 space-y-2">
                  {formData.videos.map((video, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{video.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index, 'videos')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Featured Listing Options</h2>
              <p className="text-gray-600">Boost your listing visibility</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({ ...prev, isFeatured: !!checked }));
                      setShowFeaturedOptions(!!checked);
                    }}
                  />
                  <Label htmlFor="featured" className="font-medium">
                    Make this listing featured
                  </Label>
                  <Crown className="w-5 h-5 text-yellow-500" />
                </div>
              </div>

              {formData.isFeatured && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {featuredPricing.map((pricing) => (
                      <Card
                        key={pricing.days}
                        className={`cursor-pointer transition-all ${
                          formData.featuredDuration === pricing.days
                            ? 'ring-2 ring-red-500 border-red-500'
                            : 'hover:shadow-md'
                        } ${pricing.popular ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, featuredDuration: pricing.days }))}
                      >
                        <CardContent className="p-4 text-center relative">
                          {pricing.popular && (
                            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                              Most Popular
                            </Badge>
                          )}
                          <h3 className="font-bold text-lg">{pricing.days} Days</h3>
                          <div className="mt-2">
                            {pricing.discount > 0 && (
                              <p className="text-sm text-gray-500 line-through">
                                ₦{pricing.price.toLocaleString()}
                              </p>
                            )}
                            <p className="text-xl font-bold text-red-600">
                              ₦{(pricing.price * (1 - pricing.discount / 100)).toLocaleString()}
                            </p>
                            {pricing.discount > 0 && (
                              <Badge variant="default" className="mt-1 bg-green-100 text-green-800">
                                {pricing.discount}% OFF
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Zap className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900">Featured Listing Benefits</p>
                        <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                          <li>• Appear at the top of search results</li>
                          <li>• Get highlighted with special badge</li>
                          <li>• Increase visibility by up to 10x</li>
                          <li>• Get more views and faster sales</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">
                      Total Featured Cost: ₦{calculateFeaturedCost().toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      For {formData.featuredDuration} days of featured placement
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoRelist"
                  checked={formData.autoRelist}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoRelist: !!checked }))}
                />
                <Label htmlFor="autoRelist">Auto-relist when expired</Label>
              </div>

              <div>
                <Label htmlFor="expiryDate">Listing Expiry Date (Optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave blank for no expiry (recommended)
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Listing Guidelines</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• All listings are reviewed before going live</li>
                    <li>• Prohibited items will be removed</li>
                    <li>• False information may result in account suspension</li>
                    <li>• Follow our community guidelines for best results</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-gray-500">{Math.round(stepProgress)}% Complete</span>
        </div>
        <Progress value={stepProgress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Previous
        </Button>

        <div className="flex space-x-2">
          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Next Step
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700">
              {isEditing ? 'Update Listing' : 'Publish Listing'}
              {formData.isFeatured && (
                <span className="ml-2">
                  (₦{calculateFeaturedCost().toLocaleString()})
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedListingForm;
