import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, MapPin, Calendar, Clock, AlertCircle, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useArtisan } from '@/contexts/ArtisanContext';
import { useLocation } from '@/hooks/useLocation';
import { ServiceRequestForm as ServiceRequestFormType, RequestUrgency } from '@/types';

const serviceRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  categoryId: z.string().min(1, 'Please select a service category'),
  location: z.object({
    address: z.string().min(5, 'Please provide a valid address'),
    city: z.string().min(2, 'Please provide city'),
    state: z.string().min(2, 'Please provide state'),
  }),
  urgency: z.enum(['low', 'normal', 'high', 'emergency']),
  budget: z.object({
    min: z.number().min(1000, 'Minimum budget should be at least ₦1,000'),
    max: z.number().min(1000, 'Maximum budget should be at least ₦1,000'),
  }).refine(data => data.max >= data.min, {
    message: "Maximum budget must be greater than or equal to minimum budget",
    path: ['max'],
  }),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  requirements: z.array(z.string()).default([]),
});

interface ServiceRequestFormProps {
  categoryId?: string;
  onSubmit: (data: ServiceRequestFormType) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const urgencyOptions = [
  { value: 'low', label: 'Low Priority', description: 'Can wait a few days', color: 'bg-green-100 text-green-800' },
  { value: 'normal', label: 'Normal', description: 'Within a week', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'Urgent', description: 'Within 24 hours', color: 'bg-orange-100 text-orange-800' },
  { value: 'emergency', label: 'Emergency', description: 'Immediate attention', color: 'bg-red-100 text-red-800' },
];

export default function ServiceRequestForm({
  categoryId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ServiceRequestFormProps) {
  const { serviceCategories, createServiceRequest } = useArtisan();
  const { coordinates, getCurrentLocation, formatAddress } = useLocation();
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const form = useForm<ServiceRequestFormType>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      categoryId: categoryId || '',
      urgency: 'normal',
      budget: { min: 5000, max: 20000 },
      requirements: [],
      location: { address: '', city: '', state: '' },
    },
  });

  const { handleSubmit, register, setValue, watch, formState: { errors } } = form;
  const watchedRequirements = watch('requirements');
  const watchedUrgency = watch('urgency');

  // Auto-fill location if coordinates are available
  useEffect(() => {
    if (coordinates) {
      setIsLoadingLocation(true);
      formatAddress(coordinates.latitude, coordinates.longitude)
        .then(address => {
          // Try to parse the address
          const parts = address.split(', ');
          setValue('location.address', address);
          if (parts.length >= 2) {
            setValue('location.city', parts[parts.length - 2] || '');
            setValue('location.state', parts[parts.length - 1] || '');
          }
        })
        .finally(() => setIsLoadingLocation(false));
    }
  }, [coordinates, formatAddress, setValue]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were rejected. Please ensure images are under 5MB.');
    }

    const newImages = [...uploadedImages, ...validFiles].slice(0, 5); // Max 5 images
    setUploadedImages(newImages);

    // Create preview URLs
    const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prevUrls => {
      // Revoke old URLs to prevent memory leaks
      prevUrls.forEach(url => URL.revokeObjectURL(url));
      return newPreviewUrls;
    });
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);

    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    // Revoke the removed URL
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(newPreviewUrls);
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !watchedRequirements.includes(newRequirement.trim())) {
      setValue('requirements', [...watchedRequirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    const newRequirements = watchedRequirements.filter((_, i) => i !== index);
    setValue('requirements', newRequirements);
  };

  const getCurrentLocationAndFill = async () => {
    setIsLoadingLocation(true);
    try {
      await getCurrentLocation();
    } catch (error) {
      console.error('Failed to get current location:', error);
      alert('Unable to get your current location. Please enter manually.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const onFormSubmit = async (data: ServiceRequestFormType) => {
    try {
      const formData = {
        ...data,
        images: uploadedImages,
      };
      
      await createServiceRequest(formData);
      onSubmit(formData);
    } catch (error) {
      console.error('Failed to create service request:', error);
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📝</span>
            <span>Create Service Request</span>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Selection */}
          <div>
            <Label htmlFor="categoryId">Service Category *</Label>
            <Select 
              value={watch('categoryId')} 
              onValueChange={(value) => setValue('categoryId', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a service category" />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} - {category.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-red-600 mt-1">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Request Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Fix leaking kitchen faucet"
              className="mt-1"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the problem in detail, what needs to be done, and any specific requirements..."
              rows={4}
              className="mt-1"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Location</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocationAndFill}
              disabled={isLoadingLocation}
              className="flex items-center space-x-2"
            >
              <MapPin className="h-4 w-4" />
              <span>{isLoadingLocation ? 'Getting location...' : 'Use Current Location'}</span>
            </Button>
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              {...register('location.address')}
              placeholder="Enter the full address where service is needed"
              rows={2}
              className="mt-1"
            />
            {errors.location?.address && (
              <p className="text-sm text-red-600 mt-1">{errors.location.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register('location.city')}
                placeholder="City"
                className="mt-1"
              />
              {errors.location?.city && (
                <p className="text-sm text-red-600 mt-1">{errors.location.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                {...register('location.state')}
                placeholder="State"
                className="mt-1"
              />
              {errors.location?.state && (
                <p className="text-sm text-red-600 mt-1">{errors.location.state.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Photos (Optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload photos or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 5MB each (max 5 photos)
                </p>
              </label>
            </div>

            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Urgency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Urgency Level</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={watchedUrgency}
            onValueChange={(value) => setValue('urgency', value as RequestUrgency)}
            className="space-y-3"
          >
            {urgencyOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{option.label}</span>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                    <Badge className={option.color}>
                      {option.label}
                    </Badge>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Budget */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budgetMin">Minimum Budget (₦) *</Label>
              <Input
                id="budgetMin"
                type="number"
                {...register('budget.min', { valueAsNumber: true })}
                placeholder="5,000"
                className="mt-1"
              />
              {errors.budget?.min && (
                <p className="text-sm text-red-600 mt-1">{errors.budget.min.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="budgetMax">Maximum Budget (₦) *</Label>
              <Input
                id="budgetMax"
                type="number"
                {...register('budget.max', { valueAsNumber: true })}
                placeholder="20,000"
                className="mt-1"
              />
              {errors.budget?.max && (
                <p className="text-sm text-red-600 mt-1">{errors.budget.max.message}</p>
              )}
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Setting a realistic budget helps attract qualified artisans and ensures quality work.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Preferred Schedule (Optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preferredDate">Preferred Date</Label>
              <Input
                id="preferredDate"
                type="date"
                {...register('preferredDate')}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="preferredTime">Preferred Time</Label>
              <Input
                id="preferredTime"
                type="time"
                {...register('preferredTime')}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Special Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Add a specific requirement..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
            />
            <Button type="button" onClick={addRequirement} disabled={!newRequirement.trim()}>
              Add
            </Button>
          </div>

          {watchedRequirements.length > 0 && (
            <div className="space-y-2">
              <Label>Requirements:</Label>
              <div className="flex flex-wrap gap-2">
                {watchedRequirements.map((requirement, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{requirement}</span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Creating Request...' : 'Create Request'}
        </Button>
      </div>
    </form>
  );
}
