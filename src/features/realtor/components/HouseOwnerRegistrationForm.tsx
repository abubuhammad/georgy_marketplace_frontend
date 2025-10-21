import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Upload, FileText } from 'lucide-react';
import { RealtorRegistrationData } from '../types';

const houseOwnerRegistrationSchema = z.object({
  professionalType: z.literal('house_owner'),
  licenseNumber: z.string().optional(),
  agencyName: z.string().optional(),
  agencyAddress: z.string().optional(),
  yearsExperience: z.number().min(0).max(50),
  specializations: z.array(z.string()).min(1, 'Please select at least one property type'),
  documents: z.array(z.instanceof(File)).optional(),
});

const houseOwnerSpecializationOptions = [
  'Single Family Homes',
  'Multi-Family Properties',
  'Condominiums',
  'Townhouses',
  'Apartments',
  'Vacation Rentals',
  'Commercial Properties',
  'Land/Lots',
  'Mobile Homes',
  'Luxury Properties',
  'Fixer-Upper Properties',
  'Investment Properties',
];

interface HouseOwnerRegistrationFormProps {
  onSubmit: (data: RealtorRegistrationData) => void;
  loading?: boolean;
}

export const HouseOwnerRegistrationForm: React.FC<HouseOwnerRegistrationFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RealtorRegistrationData>({
    resolver: zodResolver(houseOwnerRegistrationSchema),
    defaultValues: {
      professionalType: 'house_owner',
      yearsExperience: 0,
      specializations: [],
      documents: [],
    },
  });

  const handleSpecializationChange = (specialization: string, checked: boolean) => {
    let newSpecializations;
    if (checked) {
      newSpecializations = [...selectedSpecializations, specialization];
    } else {
      newSpecializations = selectedSpecializations.filter(s => s !== specialization);
    }
    setSelectedSpecializations(newSpecializations);
    setValue('specializations', newSpecializations);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = [...uploadedFiles, ...files];
    setUploadedFiles(newFiles);
    setValue('documents', newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setValue('documents', newFiles);
  };

  const onFormSubmit = (data: RealtorRegistrationData) => {
    onSubmit({
      ...data,
      specializations: selectedSpecializations,
      documents: uploadedFiles,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Property Owner Registration</CardTitle>
        <CardDescription>
          Register as a property owner to list and manage your properties
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Years of Experience */}
          <div className="space-y-2">
            <Label htmlFor="yearsExperience">Years of Property Ownership Experience</Label>
            <Input
              id="yearsExperience"
              type="number"
              min="0"
              max="50"
              {...register('yearsExperience', { valueAsNumber: true })}
              placeholder="Enter years of property ownership experience"
            />
            <p className="text-sm text-gray-500">
              Include time as a property owner, landlord, or real estate investor
            </p>
            {errors.yearsExperience && (
              <p className="text-sm text-red-600">{errors.yearsExperience.message}</p>
            )}
          </div>

          {/* Property Types */}
          <div className="space-y-2">
            <Label>Property Types You Own/Manage *</Label>
            <p className="text-sm text-gray-600 mb-2">
              Select the types of properties you own or manage
            </p>
            <div className="grid grid-cols-2 gap-2">
              {houseOwnerSpecializationOptions.map((propertyType) => (
                <div key={propertyType} className="flex items-center space-x-2">
                  <Checkbox
                    id={propertyType}
                    checked={selectedSpecializations.includes(propertyType)}
                    onCheckedChange={(checked) =>
                      handleSpecializationChange(propertyType, checked as boolean)
                    }
                  />
                  <Label htmlFor={propertyType} className="text-sm">
                    {propertyType}
                  </Label>
                </div>
              ))}
            </div>
            {selectedSpecializations.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSpecializations.map((propertyType) => (
                  <Badge key={propertyType} variant="secondary">
                    {propertyType}
                    <button
                      type="button"
                      onClick={() => handleSpecializationChange(propertyType, false)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {errors.specializations && (
              <p className="text-sm text-red-600">{errors.specializations.message}</p>
            )}
          </div>

          {/* Document Upload */}
          <div className="space-y-2">
            <Label>Property Ownership Documents</Label>
            <p className="text-sm text-gray-600 mb-2">
              Upload property deeds, tax records, or other ownership verification documents
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="documents" className="cursor-pointer">
                    <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Upload files
                    </span>
                    <input
                      id="documents"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX, JPG, PNG up to 10MB each
                  </p>
                </div>
              </div>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <FileText size={16} className="text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Property Owner Benefits</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• List your properties for sale or rent</li>
              <li>• Manage inquiries and showings</li>
              <li>• Access market analytics and pricing tools</li>
              <li>• Connect with potential buyers and tenants</li>
              <li>• Track property performance and metrics</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Registering...' : 'Register as Property Owner'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
