import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Upload, FileText } from 'lucide-react';
import { RealtorRegistrationData } from '../types';

const houseAgentRegistrationSchema = z.object({
  professionalType: z.literal('house_agent'),
  licenseNumber: z.string().min(1, 'License number is required for house agents'),
  agencyName: z.string().min(1, 'Agency name is required'),
  agencyAddress: z.string().min(1, 'Agency address is required'),
  yearsExperience: z.number().min(0).max(50),
  specializations: z.array(z.string()).min(1, 'Please select at least one specialization'),
  documents: z.array(z.instanceof(File)).optional(),
});

const houseAgentSpecializationOptions = [
  'Residential Sales',
  'Residential Rentals',
  'Property Management',
  'Tenant Relations',
  'First-time Buyers',
  'Investment Properties',
  'Apartment Complexes',
  'Condominiums',
  'Property Maintenance',
  'Lease Negotiations',
  'Property Inspections',
  'Market Analysis',
];

interface HouseAgentRegistrationFormProps {
  onSubmit: (data: RealtorRegistrationData) => void;
  loading?: boolean;
}

export const HouseAgentRegistrationForm: React.FC<HouseAgentRegistrationFormProps> = ({
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
    resolver: zodResolver(houseAgentRegistrationSchema),
    defaultValues: {
      professionalType: 'house_agent',
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
        <CardTitle>House Agent Registration</CardTitle>
        <CardDescription>
          Register as a house agent to start managing and listing properties
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* License Number */}
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">License Number *</Label>
            <Input
              id="licenseNumber"
              {...register('licenseNumber')}
              placeholder="Enter your real estate license number"
            />
            {errors.licenseNumber && (
              <p className="text-sm text-red-600">{errors.licenseNumber.message}</p>
            )}
          </div>

          {/* Agency Name */}
          <div className="space-y-2">
            <Label htmlFor="agencyName">Agency Name *</Label>
            <Input
              id="agencyName"
              {...register('agencyName')}
              placeholder="Enter your agency name"
            />
            {errors.agencyName && (
              <p className="text-sm text-red-600">{errors.agencyName.message}</p>
            )}
          </div>

          {/* Agency Address */}
          <div className="space-y-2">
            <Label htmlFor="agencyAddress">Agency Address *</Label>
            <Textarea
              id="agencyAddress"
              {...register('agencyAddress')}
              placeholder="Enter your agency address"
              rows={3}
            />
            {errors.agencyAddress && (
              <p className="text-sm text-red-600">{errors.agencyAddress.message}</p>
            )}
          </div>

          {/* Years of Experience */}
          <div className="space-y-2">
            <Label htmlFor="yearsExperience">Years of Experience</Label>
            <Input
              id="yearsExperience"
              type="number"
              min="0"
              max="50"
              {...register('yearsExperience', { valueAsNumber: true })}
              placeholder="Enter years of experience"
            />
            {errors.yearsExperience && (
              <p className="text-sm text-red-600">{errors.yearsExperience.message}</p>
            )}
          </div>

          {/* Specializations */}
          <div className="space-y-2">
            <Label>Specializations *</Label>
            <div className="grid grid-cols-2 gap-2">
              {houseAgentSpecializationOptions.map((specialization) => (
                <div key={specialization} className="flex items-center space-x-2">
                  <Checkbox
                    id={specialization}
                    checked={selectedSpecializations.includes(specialization)}
                    onCheckedChange={(checked) =>
                      handleSpecializationChange(specialization, checked as boolean)
                    }
                  />
                  <Label htmlFor={specialization} className="text-sm">
                    {specialization}
                  </Label>
                </div>
              ))}
            </div>
            {selectedSpecializations.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSpecializations.map((specialization) => (
                  <Badge key={specialization} variant="secondary">
                    {specialization}
                    <button
                      type="button"
                      onClick={() => handleSpecializationChange(specialization, false)}
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
            <Label>Supporting Documents</Label>
            <p className="text-sm text-gray-600 mb-2">
              Upload your license, certifications, and other relevant documents
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

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Registering...' : 'Register as House Agent'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
