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
import { X, MapPin, DollarSign, Briefcase } from 'lucide-react';
import { JobPostingData, JobType, JobLevel, JobCategory, WorkLocation } from '../types';

const jobPostingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(100, 'Description must be at least 100 characters'),
  requirements: z.array(z.string()).min(1, 'Please add at least one requirement'),
  responsibilities: z.array(z.string()).min(1, 'Please add at least one responsibility'),
  benefits: z.array(z.string()).default([]),
  skills: z.array(z.string()).min(1, 'Please add at least one skill'),
  jobType: z.enum(['full_time', 'part_time', 'contract', 'freelance', 'internship', 'temporary']),
  jobLevel: z.enum(['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive']),
  category: z.enum(['technology', 'finance', 'healthcare', 'education', 'marketing', 'sales', 'design', 'operations', 'legal', 'hr', 'customer_service', 'construction', 'manufacturing', 'retail', 'hospitality', 'transportation', 'real_estate', 'media', 'government', 'nonprofit', 'other']),
  workLocation: z.enum(['remote', 'hybrid', 'onsite']),
  location: z.object({
    country: z.string().min(2, 'Country is required'),
    state: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    isRemote: z.boolean().default(false),
  }),
  salary: z.object({
    min: z.number().positive('Minimum salary must be positive'),
    max: z.number().positive('Maximum salary must be positive'),
    currency: z.string().default('USD'),
    period: z.enum(['hourly', 'weekly', 'monthly', 'yearly']).default('yearly'),
  }).optional(),
  applicationDeadline: z.string().optional(),
  startDate: z.string().optional(),
  isPremium: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

const jobTypeOptions = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' },
];

const jobLevelOptions = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'manager', label: 'Manager' },
  { value: 'director', label: 'Director' },
  { value: 'executive', label: 'Executive' },
];

const categoryOptions = [
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'design', label: 'Design' },
  { value: 'operations', label: 'Operations' },
  { value: 'legal', label: 'Legal' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'customer_service', label: 'Customer Service' },
  { value: 'construction', label: 'Construction' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'media', label: 'Media' },
  { value: 'government', label: 'Government' },
  { value: 'nonprofit', label: 'Non-Profit' },
  { value: 'other', label: 'Other' },
];

const workLocationOptions = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

interface JobPostingFormProps {
  onSubmit: (data: JobPostingData) => void;
  initialData?: Partial<JobPostingData>;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

export const JobPostingForm: React.FC<JobPostingFormProps> = ({
  onSubmit,
  initialData,
  loading = false,
  mode = 'create',
}) => {
  const [requirements, setRequirements] = useState<string[]>(initialData?.requirements || []);
  const [responsibilities, setResponsibilities] = useState<string[]>(initialData?.responsibilities || []);
  const [benefits, setBenefits] = useState<string[]>(initialData?.benefits || []);
  const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
  const [newRequirement, setNewRequirement] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<JobPostingData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      requirements: [],
      responsibilities: [],
      benefits: [],
      skills: [],
      location: {
        country: 'USA',
        isRemote: false,
      },
      salary: {
        currency: 'USD',
        period: 'yearly',
      },
      isPremium: false,
      isFeatured: false,
      ...initialData,
    },
  });

  const workLocation = watch('workLocation');

  const addRequirement = () => {
    if (newRequirement.trim()) {
      const updated = [...requirements, newRequirement.trim()];
      setRequirements(updated);
      setValue('requirements', updated);
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    const updated = requirements.filter((_, i) => i !== index);
    setRequirements(updated);
    setValue('requirements', updated);
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      const updated = [...responsibilities, newResponsibility.trim()];
      setResponsibilities(updated);
      setValue('responsibilities', updated);
      setNewResponsibility('');
    }
  };

  const removeResponsibility = (index: number) => {
    const updated = responsibilities.filter((_, i) => i !== index);
    setResponsibilities(updated);
    setValue('responsibilities', updated);
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      const updated = [...benefits, newBenefit.trim()];
      setBenefits(updated);
      setValue('benefits', updated);
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    const updated = benefits.filter((_, i) => i !== index);
    setBenefits(updated);
    setValue('benefits', updated);
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const updated = [...skills, newSkill.trim()];
      setSkills(updated);
      setValue('skills', updated);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    const updated = skills.filter((_, i) => i !== index);
    setSkills(updated);
    setValue('skills', updated);
  };

  const onFormSubmit = (data: JobPostingData) => {
    onSubmit({
      ...data,
      requirements,
      responsibilities,
      benefits,
      skills,
    });
  };

  const resetForm = () => {
    reset();
    setRequirements([]);
    setResponsibilities([]);
    setBenefits([]);
    setSkills([]);
    setNewRequirement('');
    setNewResponsibility('');
    setNewBenefit('');
    setNewSkill('');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Briefcase className="mr-2 h-5 w-5" />
          {mode === 'create' ? 'Post New Job' : 'Edit Job Posting'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Fill in the details below to create a new job posting'
            : 'Update the job posting details below'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Senior Software Engineer"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Describe the role, company culture, and what makes this opportunity exciting..."
                    rows={6}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type</Label>
                    <Select onValueChange={(value) => setValue('jobType', value as JobType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.jobType && (
                      <p className="text-sm text-red-600">{errors.jobType.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobLevel">Job Level</Label>
                    <Select onValueChange={(value) => setValue('jobLevel', value as JobLevel)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job level" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobLevelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.jobLevel && (
                      <p className="text-sm text-red-600">{errors.jobLevel.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={(value) => setValue('category', value as JobCategory)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>
                </div>

                {/* Location & Work Type */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <Label className="text-base font-medium">Location & Work Type</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workLocation">Work Location</Label>
                    <Select onValueChange={(value) => setValue('workLocation', value as WorkLocation)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work location type" />
                      </SelectTrigger>
                      <SelectContent>
                        {workLocationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.workLocation && (
                      <p className="text-sm text-red-600">{errors.workLocation.message}</p>
                    )}
                  </div>

                  {workLocation !== 'remote' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location.country">Country</Label>
                        <Input
                          id="location.country"
                          {...register('location.country')}
                          placeholder="USA"
                        />
                        {errors.location?.country && (
                          <p className="text-sm text-red-600">{errors.location.country.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location.state">State</Label>
                        <Input
                          id="location.state"
                          {...register('location.state')}
                          placeholder="California"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location.city">City</Label>
                        <Input
                          id="location.city"
                          {...register('location.city')}
                          placeholder="San Francisco"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Salary */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4" />
                    <Label className="text-base font-medium">Salary (Optional)</Label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary.min">Minimum</Label>
                      <Input
                        id="salary.min"
                        type="number"
                        {...register('salary.min', { valueAsNumber: true })}
                        placeholder="80000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary.max">Maximum</Label>
                      <Input
                        id="salary.max"
                        type="number"
                        {...register('salary.max', { valueAsNumber: true })}
                        placeholder="120000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary.currency">Currency</Label>
                      <Select onValueChange={(value) => setValue('salary.currency', value)} defaultValue="USD">
                        <SelectTrigger>
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="NGN">NGN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary.period">Period</Label>
                      <Select onValueChange={(value) => setValue('salary.period', value as any)} defaultValue="yearly">
                        <SelectTrigger>
                          <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {/* Skills */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Required Skills</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill}>Add</Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.skills && (
                  <p className="text-sm text-red-600">{errors.skills.message}</p>
                )}
              </div>

              {/* Application Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicationDeadline">Application Deadline</Label>
                  <Input
                    id="applicationDeadline"
                    type="date"
                    {...register('applicationDeadline')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Expected Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register('startDate')}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-6">
              {/* Requirements */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Requirements</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a requirement..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  />
                  <Button type="button" onClick={addRequirement}>Add</Button>
                </div>
                {requirements.length > 0 && (
                  <div className="space-y-2">
                    {requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm flex-1">{requirement}</span>
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.requirements && (
                  <p className="text-sm text-red-600">{errors.requirements.message}</p>
                )}
              </div>

              {/* Responsibilities */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Responsibilities</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newResponsibility}
                    onChange={(e) => setNewResponsibility(e.target.value)}
                    placeholder="Add a responsibility..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                  />
                  <Button type="button" onClick={addResponsibility}>Add</Button>
                </div>
                {responsibilities.length > 0 && (
                  <div className="space-y-2">
                    {responsibilities.map((responsibility, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm flex-1">{responsibility}</span>
                        <button
                          type="button"
                          onClick={() => removeResponsibility(index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.responsibilities && (
                  <p className="text-sm text-red-600">{errors.responsibilities.message}</p>
                )}
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Benefits</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="Add a benefit..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  />
                  <Button type="button" onClick={addBenefit}>Add</Button>
                </div>
                {benefits.length > 0 && (
                  <div className="space-y-2">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm flex-1">{benefit}</span>
                        <button
                          type="button"
                          onClick={() => removeBenefit(index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Job Settings */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Job Settings</Label>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPremium"
                      checked={watch('isPremium')}
                      onCheckedChange={(checked) => setValue('isPremium', checked as boolean)}
                    />
                    <Label htmlFor="isPremium">Premium Job (Higher visibility)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFeatured"
                      checked={watch('isFeatured')}
                      onCheckedChange={(checked) => setValue('isFeatured', checked as boolean)}
                    />
                    <Label htmlFor="isFeatured">Featured Job (Top placement)</Label>
                  </div>
                </div>
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
                {loading ? 'Publishing...' : mode === 'create' ? 'Publish Job' : 'Update Job'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
