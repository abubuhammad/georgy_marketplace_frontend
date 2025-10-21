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
import { X, Upload, FileText, Building } from 'lucide-react';
import { EmployerRegistrationData, CompanySize, JobLocation } from '../types';

const locationSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  isRemote: z.boolean().default(false),
});

const employerRegistrationSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyDescription: z.string().min(50, 'Description should be at least 50 characters'),
  companyWebsite: z.string().url('Invalid URL').optional().or(z.literal('')),
  companySize: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']),
  industry: z.string().min(1, 'Industry is required'),
  location: locationSchema,
  establishedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  companyLogo: z.instanceof(File).optional(),
  documents: z.array(z.instanceof(File)).optional(),
});

const companySizeOptions = [
  { value: 'startup', label: 'Startup (1-10 employees)' },
  { value: 'small', label: 'Small (11-50 employees)' },
  { value: 'medium', label: 'Medium (51-200 employees)' },
  { value: 'large', label: 'Large (201-1000 employees)' },
  { value: 'enterprise', label: 'Enterprise (1000+ employees)' },
];

const industryOptions = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Marketing',
  'Sales', 'Design', 'Operations', 'Legal', 'HR', 'Customer Service',
  'Construction', 'Manufacturing', 'Retail', 'Hospitality',
  'Transportation', 'Real Estate', 'Media', 'Government', 'Nonprofit', 'Other'
];

interface EmployerRegistrationFormProps {
  onSubmit: (data: EmployerRegistrationData) => void;
  loading?: boolean;
}

export const EmployerRegistrationForm: React.FC<EmployerRegistrationFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EmployerRegistrationData>({
    resolver: zodResolver(employerRegistrationSchema),
    defaultValues: {
      companySize: 'startup',
      location: {
        country: '',
        isRemote: false,
      },
      documents: [],
    },
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCompanyLogo(file);
      setValue('companyLogo', file);
    }
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

  const removeLogo = () => {
    setCompanyLogo(null);
    setValue('companyLogo', undefined);
  };

  const onFormSubmit = (data: EmployerRegistrationData) => {
    onSubmit({
      ...data,
      companyLogo,
      documents: uploadedFiles,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Employer Registration
        </CardTitle>
        <CardDescription>
          Register your company to start posting jobs and finding talent
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              {...register('companyName')}
              placeholder="Enter your company name"
            />
            {errors.companyName && (
              <p className="text-sm text-red-600">{errors.companyName.message}</p>
            )}
          </div>

          {/* Company Description */}
          <div className="space-y-2">
            <Label htmlFor="companyDescription">Company Description *</Label>
            <Textarea
              id="companyDescription"
              {...register('companyDescription')}
              placeholder="Tell us about your company, mission, and values..."
              rows={4}
            />
            {errors.companyDescription && (
              <p className="text-sm text-red-600">{errors.companyDescription.message}</p>
            )}
          </div>

          {/* Company Website */}
          <div className="space-y-2">
            <Label htmlFor="companyWebsite">Company Website</Label>
            <Input
              id="companyWebsite"
              {...register('companyWebsite')}
              placeholder="https://yourcompany.com"
              type="url"
            />
            {errors.companyWebsite && (
              <p className="text-sm text-red-600">{errors.companyWebsite.message}</p>
            )}
          </div>

          {/* Company Size */}
          <div className="space-y-2">
            <Label htmlFor="companySize">Company Size *</Label>
            <Select
              onValueChange={(value) => setValue('companySize', value as CompanySize)}
              defaultValue="startup"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                {companySizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.companySize && (
              <p className="text-sm text-red-600">{errors.companySize.message}</p>
            )}
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <Select onValueChange={(value) => setValue('industry', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industryOptions.map((industry) => (
                  <SelectItem key={industry} value={industry.toLowerCase()}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industry && (
              <p className="text-sm text-red-600">{errors.industry.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-4">
            <Label>Company Location *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  {...register('location.country')}
                  placeholder="Enter country"
                />
                {errors.location?.country && (
                  <p className="text-sm text-red-600">{errors.location.country.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  {...register('location.state')}
                  placeholder="Enter state"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register('location.city')}
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="establishedYear">Established Year</Label>
                <Input
                  id="establishedYear"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  {...register('establishedYear', { valueAsNumber: true })}
                  placeholder="2020"
                />
              </div>
            </div>
          </div>

          {/* Company Logo */}
          <div className="space-y-2">
            <Label>Company Logo</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="companyLogo" className="cursor-pointer">
                    <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Upload logo
                    </span>
                    <input
                      id="companyLogo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, SVG up to 5MB
                  </p>
                </div>
              </div>
            </div>
            {companyLogo && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <FileText size={16} className="text-gray-500" />
                  <span className="text-sm">{companyLogo.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(companyLogo.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeLogo}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Supporting Documents */}
          <div className="space-y-2">
            <Label>Supporting Documents</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="documents" className="cursor-pointer">
                    <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Upload documents
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
                    Business registration, certificates, etc. (PDF, DOC, DOCX, JPG, PNG)
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
            {loading ? 'Registering...' : 'Register Company'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
