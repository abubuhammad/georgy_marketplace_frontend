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
import { X, Upload, FileText } from 'lucide-react';
import { RealtorRegistrationData, RealEstateProfessionalType } from '../types';

const realtorRegistrationSchema = z.object({
  professionalType: z.enum(['realtor', 'house_agent', 'house_owner']),
  licenseNumber: z.string().optional(),
  agencyName: z.string().optional(),
  agencyAddress: z.string().optional(),
  yearsExperience: z.number().min(0).max(50),
  specializations: z.array(z.string()).min(1, 'Please select at least one specialization'),
  documents: z.array(z.instanceof(File)).optional(),
});

const specializationOptions = [
  'Residential Sales',
  'Commercial Sales',
  'Luxury Properties',
  'Investment Properties',
  'First-time Buyers',
  'Rental Properties',
  'Property Management',
  'Land Sales',
  'Foreclosures',
  'New Construction',
];

interface RealtorRegistrationFormProps {
  onSubmit: (data: RealtorRegistrationData) => void;
  loading?: boolean;
}

export const RealtorRegistrationForm: React.FC<RealtorRegistrationFormProps> = ({
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
    watch,
  } = useForm<RealtorRegistrationData>({
    resolver: zodResolver(realtorRegistrationSchema),
    defaultValues: {
      professionalType: 'realtor',
      yearsExperience: 0,
      specializations: [],
      documents: [],
    },
  });

  const professionalType = watch('professionalType');

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
        <CardTitle>Real Estate Professional Registration</CardTitle>
        <CardDescription>
          Register as a real estate professional to start listing properties
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Professional Type */}
          <div className="space-y-2">
            <Label htmlFor="professionalType">Professional Type</Label>
            <Select
              onValueChange={(value) => setValue('professionalType', value as RealEstateProfessionalType)}
              defaultValue="realtor"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select professional type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtor">Realtor</SelectItem>
                <SelectItem value="house_agent">House Agent</SelectItem>
                <SelectItem value="house_owner">House Owner</SelectItem>
              </SelectContent>
            </Select>
            {errors.professionalType && (
              <p className="text-sm text-red-600">{errors.professionalType.message}</p>
            )}
          </div>

          {/* License Number (for realtor and house_agent) */}
          {(professionalType === 'realtor' || professionalType === 'house_agent') && (
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                {...register('licenseNumber')}
                placeholder="Enter your license number"
              />
              {errors.licenseNumber && (
                <p className="text-sm text-red-600">{errors.licenseNumber.message}</p>
              )}
            </div>
          )}

          {/* Agency Name (for realtor and house_agent) */}
          {(professionalType === 'realtor' || professionalType === 'house_agent') && (
            <div className="space-y-2">
              <Label htmlFor="agencyName">Agency Name</Label>
              <Input
                id="agencyName"
                {...register('agencyName')}
                placeholder="Enter your agency name"
              />
              {errors.agencyName && (
                <p className="text-sm text-red-600">{errors.agencyName.message}</p>
              )}
            </div>
          )}

          {/* Agency Address (for realtor and house_agent) */}
          {(professionalType === 'realtor' || professionalType === 'house_agent') && (
            <div className="space-y-2">
              <Label htmlFor="agencyAddress">Agency Address</Label>
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
          )}

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
            <Label>Specializations</Label>
            <div className="grid grid-cols-2 gap-2">
              {specializationOptions.map((specialization) => (
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
            {loading ? 'Registering...' : 'Register as Real Estate Professional'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
