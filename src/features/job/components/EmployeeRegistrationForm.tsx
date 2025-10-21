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
import { X, Upload, FileText, User, Github, Linkedin, Globe } from 'lucide-react';
import { EmployeeRegistrationData, WorkLocation, JobLocation, SalaryRange, SalaryPeriod } from '../types';

const locationSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  isRemote: z.boolean().default(false),
});

const salaryRangeSchema = z.object({
  min: z.number().min(0, 'Minimum salary must be positive'),
  max: z.number().min(0, 'Maximum salary must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  period: z.enum(['hourly', 'weekly', 'monthly', 'yearly']),
}).refine(data => data.max >= data.min, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['max'],
});

const employeeRegistrationSchema = z.object({
  title: z.string().min(1, 'Professional title is required'),
  summary: z.string().min(100, 'Summary should be at least 100 characters'),
  skills: z.array(z.string()).min(1, 'Please select at least one skill'),
  location: locationSchema,
  expectedSalary: salaryRangeSchema.optional(),
  workPreference: z.enum(['remote', 'hybrid', 'onsite']),
  portfolioUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  resume: z.instanceof(File),
  documents: z.array(z.instanceof(File)).optional(),
});

const skillOptions = [
  // Technology
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java',
  'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'HTML/CSS', 'SQL',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'AWS', 'Azure', 'Google Cloud',
  'Docker', 'Kubernetes', 'Git', 'CI/CD', 'Testing', 'Agile', 'Scrum',
  
  // Design
  'UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Sketch', 'Prototyping',
  'User Research', 'Wireframing', 'Graphic Design', 'Brand Design',
  
  // Business
  'Project Management', 'Product Management', 'Business Analysis', 'Strategy',
  'Marketing', 'Sales', 'Customer Service', 'Data Analysis', 'Finance',
  'Accounting', 'HR', 'Operations', 'Supply Chain', 'Quality Assurance',
  
  // Other
  'Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Time Management',
  'Critical Thinking', 'Creativity', 'Adaptability', 'Research', 'Writing',
];

const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
  { value: 'NGN', label: 'NGN (₦)' },
  { value: 'GHS', label: 'GHS (₵)' },
  { value: 'KES', label: 'KES (Ksh)' },
  { value: 'ZAR', label: 'ZAR (R)' },
];

const workPreferenceOptions = [
  { value: 'remote', label: 'Remote Only' },
  { value: 'hybrid', label: 'Hybrid (Mix of remote and office)' },
  { value: 'onsite', label: 'On-site Only' },
];

interface EmployeeRegistrationFormProps {
  onSubmit: (data: EmployeeRegistrationData) => void;
  loading?: boolean;
}

export const EmployeeRegistrationForm: React.FC<EmployeeRegistrationFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [resume, setResume] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showSalaryFields, setShowSalaryFields] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EmployeeRegistrationData>({
    resolver: zodResolver(employeeRegistrationSchema),
    defaultValues: {
      workPreference: 'remote',
      location: {
        country: '',
        isRemote: false,
      },
      skills: [],
      documents: [],
    },
  });

  const handleSkillChange = (skill: string, checked: boolean) => {
    let newSkills;
    if (checked) {
      newSkills = [...selectedSkills, skill];
    } else {
      newSkills = selectedSkills.filter(s => s !== skill);
    }
    setSelectedSkills(newSkills);
    setValue('skills', newSkills);
  };

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResume(file);
      setValue('resume', file);
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

  const removeResume = () => {
    setResume(null);
    setValue('resume', null as any);
  };

  const onFormSubmit = (data: EmployeeRegistrationData) => {
    onSubmit({
      ...data,
      skills: selectedSkills,
      resume: resume!,
      documents: uploadedFiles,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Employee Registration
        </CardTitle>
        <CardDescription>
          Create your professional profile to start applying for jobs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Professional Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Professional Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Senior Software Engineer, Product Manager"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Professional Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Professional Summary *</Label>
            <Textarea
              id="summary"
              {...register('summary')}
              placeholder="Tell us about your experience, achievements, and career goals..."
              rows={4}
            />
            {errors.summary && (
              <p className="text-sm text-red-600">{errors.summary.message}</p>
            )}
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Skills *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-lg p-4">
              {skillOptions.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={skill}
                    checked={selectedSkills.includes(skill)}
                    onCheckedChange={(checked) =>
                      handleSkillChange(skill, checked as boolean)
                    }
                  />
                  <Label htmlFor={skill} className="text-sm">
                    {skill}
                  </Label>
                </div>
              ))}
            </div>
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSkills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleSkillChange(skill, false)}
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

          {/* Location */}
          <div className="space-y-4">
            <Label>Location Preferences *</Label>
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
            </div>
          </div>

          {/* Work Preference */}
          <div className="space-y-2">
            <Label htmlFor="workPreference">Work Preference *</Label>
            <Select
              onValueChange={(value) => setValue('workPreference', value as WorkLocation)}
              defaultValue="remote"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select work preference" />
              </SelectTrigger>
              <SelectContent>
                {workPreferenceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.workPreference && (
              <p className="text-sm text-red-600">{errors.workPreference.message}</p>
            )}
          </div>

          {/* Expected Salary */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showSalary"
                checked={showSalaryFields}
                onCheckedChange={(checked) => setShowSalaryFields(checked as boolean)}
              />
              <Label htmlFor="showSalary">Add expected salary range</Label>
            </div>
            {showSalaryFields && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Min Salary</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    {...register('expectedSalary.min', { valueAsNumber: true })}
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Max Salary</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    {...register('expectedSalary.max', { valueAsNumber: true })}
                    placeholder="80000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select onValueChange={(value) => setValue('expectedSalary.currency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <Select onValueChange={(value) => setValue('expectedSalary.period', value as SalaryPeriod)}>
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
            )}
            {errors.expectedSalary && (
              <p className="text-sm text-red-600">{errors.expectedSalary.message}</p>
            )}
          </div>

          {/* Portfolio Links */}
          <div className="space-y-4">
            <Label>Portfolio & Social Links</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="portfolioUrl" className="flex items-center gap-2">
                  <Globe size={16} />
                  Portfolio URL
                </Label>
                <Input
                  id="portfolioUrl"
                  {...register('portfolioUrl')}
                  placeholder="https://yourportfolio.com"
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl" className="flex items-center gap-2">
                  <Linkedin size={16} />
                  LinkedIn URL
                </Label>
                <Input
                  id="linkedinUrl"
                  {...register('linkedinUrl')}
                  placeholder="https://linkedin.com/in/yourprofile"
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="githubUrl" className="flex items-center gap-2">
                  <Github size={16} />
                  GitHub URL
                </Label>
                <Input
                  id="githubUrl"
                  {...register('githubUrl')}
                  placeholder="https://github.com/yourusername"
                  type="url"
                />
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <Label>Resume * (Required)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="resume" className="cursor-pointer">
                    <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Upload resume
                    </span>
                    <input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX up to 10MB
                  </p>
                </div>
              </div>
            </div>
            {resume && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <FileText size={16} className="text-gray-500" />
                  <span className="text-sm">{resume.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(resume.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeResume}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {errors.resume && (
              <p className="text-sm text-red-600">{errors.resume.message}</p>
            )}
          </div>

          {/* Additional Documents */}
          <div className="space-y-2">
            <Label>Additional Documents</Label>
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
                    Certificates, transcripts, cover letters, etc.
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
            {loading ? 'Creating Profile...' : 'Create Professional Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
