import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Upload, FileText, MapPin, DollarSign, Home, Camera } from 'lucide-react';
import { PropertyFormData, PropertyType, ListingType } from '../types';

const propertyFormSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  propertyType: z.enum(['apartment', 'house', 'condo', 'townhouse', 'land', 'commercial', 'office', 'warehouse']),
  listingType: z.enum(['sale', 'rent', 'lease']),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('USD'),
  address: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    country: z.string().min(2, 'Country is required'),
    postalCode: z.string().optional(),
  }),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  squareFootage: z.number().min(0).optional(),
  lotSize: z.number().min(0).optional(),
  yearBuilt: z.number().min(1800).max(new Date().getFullYear() + 1).optional(),
  parkingSpaces: z.number().min(0).optional(),
  furnishingStatus: z.enum(['furnished', 'semi_furnished', 'unfurnished']).optional(),
  features: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  virtualTourUrl: z.string().url().optional().or(z.literal('')),
  images: z.array(z.instanceof(File)).optional(),
});

const propertyTypeOptions = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'office', label: 'Office' },
  { value: 'warehouse', label: 'Warehouse' },
];

const listingTypeOptions = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
  { value: 'lease', label: 'For Lease' },
];

const featureOptions = [
  'Swimming Pool', 'Gym', 'Garden', 'Balcony', 'Terrace', 'Fireplace',
  'Walk-in Closet', 'Hardwood Floors', 'Granite Countertops', 'Stainless Steel Appliances',
  'Central Air', 'Heating', 'Dishwasher', 'Washer/Dryer', 'Security System',
  'Elevator', 'Wheelchair Accessible', 'Pet Friendly', 'Furnished', 'Utilities Included'
];

const amenityOptions = [
  'Parking', 'Garage', 'Playground', 'Clubhouse', 'Business Center', 'Fitness Center',
  'Tennis Court', 'Basketball Court', 'Concierge', 'Doorman', 'Laundry Room',
  'Storage', 'Rooftop Access', 'BBQ Area', 'Guest Parking', 'Visitor Parking',
  'Electric Car Charging', 'Bike Storage', 'Package Service', 'Maintenance Service'
];

const furnishingOptions = [
  { value: 'furnished', label: 'Furnished' },
  { value: 'semi_furnished', label: 'Semi-Furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
];

interface PropertyListingFormProps {
  onSubmit: (data: PropertyFormData) => void;
  initialData?: Partial<PropertyFormData>;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

export const PropertyListingForm: React.FC<PropertyListingFormProps> = ({
  onSubmit,
  initialData,
  loading = false,
  mode = 'create',
}) => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(initialData?.features || []);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialData?.amenities || []);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      currency: 'USD',
      features: [],
      amenities: [],
      images: [],
      ...initialData,
    },
  });

  const propertyType = watch('propertyType');
  const listingType = watch('listingType');

  const handleFeatureChange = (feature: string, checked: boolean) => {
    let newFeatures;
    if (checked) {
      newFeatures = [...selectedFeatures, feature];
    } else {
      newFeatures = selectedFeatures.filter(f => f !== feature);
    }
    setSelectedFeatures(newFeatures);
    setValue('features', newFeatures);
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    let newAmenities;
    if (checked) {
      newAmenities = [...selectedAmenities, amenity];
    } else {
      newAmenities = selectedAmenities.filter(a => a !== amenity);
    }
    setSelectedAmenities(newAmenities);
    setValue('amenities', newAmenities);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newImages = [...uploadedImages, ...files];
    setUploadedImages(newImages);
    setValue('images', newImages);
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setValue('images', newImages);
  };

  const onFormSubmit = (data: PropertyFormData) => {
    onSubmit({
      ...data,
      features: selectedFeatures,
      amenities: selectedAmenities,
      images: uploadedImages,
    });
  };

  const resetForm = () => {
    reset();
    setSelectedFeatures([]);
    setSelectedAmenities([]);
    setUploadedImages([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Home className="mr-2 h-5 w-5" />
          {mode === 'create' ? 'Create Property Listing' : 'Edit Property Listing'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Fill in the details below to create a new property listing'
            : 'Update the property details below'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Property Title</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="Beautiful 3BR apartment in downtown..."
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select onValueChange={(value) => setValue('propertyType', value as PropertyType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.propertyType && (
                      <p className="text-sm text-red-600">{errors.propertyType.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Describe your property in detail..."
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="listingType">Listing Type</Label>
                    <Select onValueChange={(value) => setValue('listingType', value as ListingType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select listing type" />
                      </SelectTrigger>
                      <SelectContent>
                        {listingTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.listingType && (
                      <p className="text-sm text-red-600">{errors.listingType.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...register('price', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <p className="text-sm text-red-600">{errors.price.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select onValueChange={(value) => setValue('currency', value)} defaultValue="USD">
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="NGN">NGN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <Label className="text-base font-medium">Address</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address.street">Street Address</Label>
                    <Input
                      id="address.street"
                      {...register('address.street')}
                      placeholder="123 Main Street"
                    />
                    {errors.address?.street && (
                      <p className="text-sm text-red-600">{errors.address.street.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address.city">City</Label>
                      <Input
                        id="address.city"
                        {...register('address.city')}
                        placeholder="New York"
                      />
                      {errors.address?.city && (
                        <p className="text-sm text-red-600">{errors.address.city.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address.state">State</Label>
                      <Input
                        id="address.state"
                        {...register('address.state')}
                        placeholder="NY"
                      />
                      {errors.address?.state && (
                        <p className="text-sm text-red-600">{errors.address.state.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address.country">Country</Label>
                      <Input
                        id="address.country"
                        {...register('address.country')}
                        placeholder="USA"
                      />
                      {errors.address?.country && (
                        <p className="text-sm text-red-600">{errors.address.country.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address.postalCode">Postal Code</Label>
                      <Input
                        id="address.postalCode"
                        {...register('address.postalCode')}
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {/* Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    {...register('bedrooms', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    step="0.5"
                    {...register('bathrooms', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="squareFootage">Square Footage</Label>
                  <Input
                    id="squareFootage"
                    type="number"
                    min="0"
                    {...register('squareFootage', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lotSize">Lot Size (sq ft)</Label>
                  <Input
                    id="lotSize"
                    type="number"
                    min="0"
                    {...register('lotSize', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input
                    id="yearBuilt"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear() + 1}
                    {...register('yearBuilt', { valueAsNumber: true })}
                    placeholder="2020"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                  <Input
                    id="parkingSpaces"
                    type="number"
                    min="0"
                    {...register('parkingSpaces', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="furnishingStatus">Furnishing Status</Label>
                <Select onValueChange={(value) => setValue('furnishingStatus', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select furnishing status" />
                  </SelectTrigger>
                  <SelectContent>
                    {furnishingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="virtualTourUrl">Virtual Tour URL</Label>
                <Input
                  id="virtualTourUrl"
                  type="url"
                  {...register('virtualTourUrl')}
                  placeholder="https://example.com/virtual-tour"
                />
                {errors.virtualTourUrl && (
                  <p className="text-sm text-red-600">{errors.virtualTourUrl.message}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              {/* Features */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Features</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {featureOptions.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={`feature-${feature}`}
                          checked={selectedFeatures.includes(feature)}
                          onCheckedChange={(checked) =>
                            handleFeatureChange(feature, checked as boolean)
                          }
                        />
                        <Label htmlFor={`feature-${feature}`} className="text-sm">
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedFeatures.map((feature) => (
                        <Badge key={feature} variant="secondary">
                          {feature}
                          <button
                            type="button"
                            onClick={() => handleFeatureChange(feature, false)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-base font-medium">Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {amenityOptions.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={`amenity-${amenity}`}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={(checked) =>
                            handleAmenityChange(amenity, checked as boolean)
                          }
                        />
                        <Label htmlFor={`amenity-${amenity}`} className="text-sm">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedAmenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedAmenities.map((amenity) => (
                        <Badge key={amenity} variant="secondary">
                          {amenity}
                          <button
                            type="button"
                            onClick={() => handleAmenityChange(amenity, false)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Camera className="h-4 w-4" />
                  <Label className="text-base font-medium">Property Images</Label>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="images" className="cursor-pointer">
                        <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                          Upload images
                        </span>
                        <input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                    </div>
                  </div>
                </div>
                
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={resetForm}>
              Reset Form
            </Button>
            <div className="space-x-2">
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Publishing...' : mode === 'create' ? 'Publish Listing' : 'Update Listing'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
