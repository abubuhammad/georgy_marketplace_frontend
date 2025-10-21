import { z } from 'zod';
import { JobPostingData, JobSearchFilters, ApplicationStatus } from '@/features/job/types';

// Validation schemas
export const JobPostingValidationSchema = z.object({
  title: z.string()
    .min(5, 'Job title must be at least 5 characters')
    .max(100, 'Job title must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-\(\)\.,]+$/, 'Job title contains invalid characters'),
  
  description: z.string()
    .min(100, 'Job description must be at least 100 characters')
    .max(5000, 'Job description must not exceed 5000 characters'),
  
  requirements: z.array(z.string().min(1, 'Requirement cannot be empty'))
    .min(1, 'At least one requirement is needed')
    .max(20, 'Maximum 20 requirements allowed'),
  
  responsibilities: z.array(z.string().min(1, 'Responsibility cannot be empty'))
    .min(1, 'At least one responsibility is needed')
    .max(20, 'Maximum 20 responsibilities allowed'),
  
  benefits: z.array(z.string().min(1, 'Benefit cannot be empty'))
    .max(15, 'Maximum 15 benefits allowed')
    .optional(),
  
  skills: z.array(z.string().min(1, 'Skill cannot be empty'))
    .min(1, 'At least one skill is required')
    .max(30, 'Maximum 30 skills allowed'),
  
  jobType: z.enum(['full_time', 'part_time', 'contract', 'freelance', 'internship', 'temporary'], {
    errorMap: () => ({ message: 'Please select a valid job type' })
  }),
  
  jobLevel: z.enum(['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive'], {
    errorMap: () => ({ message: 'Please select a valid job level' })
  }),
  
  category: z.string().min(1, 'Job category is required'),
  
  workLocation: z.enum(['remote', 'hybrid', 'onsite'], {
    errorMap: () => ({ message: 'Please select a valid work location type' })
  }),
  
  location: z.object({
    country: z.string().min(2, 'Country is required'),
    state: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    isRemote: z.boolean().default(false),
  }).refine((location) => {
    // If not remote, city is required
    if (!location.isRemote && (!location.city || location.city.trim() === '')) {
      return false;
    }
    return true;
  }, {
    message: 'City is required for non-remote positions',
    path: ['city']
  }),
  
  salary: z.object({
    min: z.number()
      .positive('Minimum salary must be positive')
      .max(10000000, 'Salary amount seems unrealistic'),
    max: z.number()
      .positive('Maximum salary must be positive')
      .max(10000000, 'Salary amount seems unrealistic'),
    currency: z.string().length(3, 'Currency must be 3 characters (e.g., USD)'),
    period: z.enum(['hourly', 'weekly', 'monthly', 'yearly']),
  }).optional().refine((salary) => {
    if (salary && salary.min >= salary.max) {
      return false;
    }
    return true;
  }, {
    message: 'Maximum salary must be greater than minimum salary',
    path: ['max']
  }),
  
  applicationDeadline: z.string()
    .optional()
    .refine((deadline) => {
      if (!deadline) return true;
      const date = new Date(deadline);
      const now = new Date();
      return date > now;
    }, {
      message: 'Application deadline must be in the future'
    }),
  
  startDate: z.string()
    .optional()
    .refine((startDate) => {
      if (!startDate) return true;
      const date = new Date(startDate);
      const now = new Date();
      return date >= now;
    }, {
      message: 'Start date cannot be in the past'
    }),
  
  isPremium: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

export const JobSearchValidationSchema = z.object({
  query: z.string().max(100, 'Search query too long').optional(),
  category: z.string().optional(),
  jobType: z.enum(['full_time', 'part_time', 'contract', 'freelance', 'internship', 'temporary']).optional(),
  jobLevel: z.enum(['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive']).optional(),
  workLocation: z.enum(['remote', 'hybrid', 'onsite']).optional(),
  location: z.string().max(100, 'Location filter too long').optional(),
  salaryMin: z.number().positive('Minimum salary must be positive').optional(),
  salaryMax: z.number().positive('Maximum salary must be positive').optional(),
  skills: z.array(z.string()).max(10, 'Maximum 10 skills for filtering').optional(),
  company: z.string().max(100, 'Company name too long').optional(),
  postedWithin: z.number().int().min(1).max(365, 'Posted within must be between 1 and 365 days').optional(),
  sortBy: z.enum(['date', 'salary', 'relevance', 'company']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1).max(100, 'Limit must be between 1 and 100').default(20),
}).refine((data) => {
  if (data.salaryMin && data.salaryMax && data.salaryMin >= data.salaryMax) {
    return false;
  }
  return true;
}, {
  message: 'Maximum salary must be greater than minimum salary',
  path: ['salaryMax']
});

export const ResumeUploadValidationSchema = z.object({
  file: z.instanceof(File).refine((file) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    return allowedTypes.includes(file.type);
  }, {
    message: 'File must be PDF, DOC, or DOCX format'
  }).refine((file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return file.size <= maxSize;
  }, {
    message: 'File size must be less than 5MB'
  }),
});

export const ResumeTextValidationSchema = z.object({
  resumeText: z.string()
    .min(50, 'Resume text must be at least 50 characters')
    .max(50000, 'Resume text must not exceed 50,000 characters')
    .refine((text) => {
      // Check for basic resume sections
      const requiredSections = ['experience', 'education', 'skill'];
      const lowerText = text.toLowerCase();
      return requiredSections.some(section => lowerText.includes(section));
    }, {
      message: 'Resume should include at least one of: experience, education, or skills section'
    }),
});

export const JobApplicationValidationSchema = z.object({
  coverLetter: z.string()
    .max(2000, 'Cover letter must not exceed 2000 characters')
    .optional(),
  
  expectedSalary: z.object({
    min: z.number().positive('Expected salary must be positive'),
    max: z.number().positive('Expected salary must be positive'),
    currency: z.string().length(3, 'Currency must be 3 characters'),
    period: z.enum(['hourly', 'weekly', 'monthly', 'yearly']),
  }).optional().refine((salary) => {
    if (salary && salary.min >= salary.max) {
      return false;
    }
    return true;
  }, {
    message: 'Maximum expected salary must be greater than minimum',
    path: ['max']
  }),
  
  availableFrom: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const availableDate = new Date(date);
      const now = new Date();
      const maxFutureDate = new Date();
      maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
      
      return availableDate >= now && availableDate <= maxFutureDate;
    }, {
      message: 'Available from date must be between now and one year from now'
    }),
});

// Error handling utilities
export class JobValidationError extends Error {
  public field: string;
  public code: string;

  constructor(field: string, message: string, code = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'JobValidationError';
    this.field = field;
    this.code = code;
  }
}

export class JobPermissionError extends Error {
  public code: string;

  constructor(message: string, code = 'PERMISSION_DENIED') {
    super(message);
    this.name = 'JobPermissionError';
    this.code = code;
  }
}

export class JobNotFoundError extends Error {
  public code: string;

  constructor(message = 'Job not found', code = 'JOB_NOT_FOUND') {
    super(message);
    this.name = 'JobNotFoundError';
    this.code = code;
  }
}

// Validation utility functions
export const validateJobPosting = (data: JobPostingData) => {
  try {
    return JobPostingValidationSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new JobValidationError(
        firstError.path.join('.'),
        firstError.message,
        'VALIDATION_ERROR'
      );
    }
    throw error;
  }
};

export const validateJobSearch = (filters: JobSearchFilters) => {
  try {
    return JobSearchValidationSchema.parse(filters);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new JobValidationError(
        firstError.path.join('.'),
        firstError.message,
        'SEARCH_VALIDATION_ERROR'
      );
    }
    throw error;
  }
};

export const validateResumeFile = (file: File) => {
  try {
    return ResumeUploadValidationSchema.parse({ file });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new JobValidationError(
        'file',
        firstError.message,
        'FILE_VALIDATION_ERROR'
      );
    }
    throw error;
  }
};

export const validateResumeText = (resumeText: string) => {
  try {
    return ResumeTextValidationSchema.parse({ resumeText });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new JobValidationError(
        'resumeText',
        firstError.message,
        'RESUME_VALIDATION_ERROR'
      );
    }
    throw error;
  }
};

export const validateJobApplication = (data: any) => {
  try {
    return JobApplicationValidationSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new JobValidationError(
        firstError.path.join('.'),
        firstError.message,
        'APPLICATION_VALIDATION_ERROR'
      );
    }
    throw error;
  }
};

// Permission checking utilities
export const checkJobPostingPermission = (userRole: string) => {
  const allowedRoles = ['employer', 'admin'];
  if (!allowedRoles.includes(userRole)) {
    throw new JobPermissionError(
      'Only employers can post job listings',
      'INSUFFICIENT_PERMISSIONS'
    );
  }
};

export const checkJobApplicationPermission = (userRole: string) => {
  const allowedRoles = ['job_seeker', 'customer', 'admin'];
  if (!allowedRoles.includes(userRole)) {
    throw new JobPermissionError(
      'Only job seekers can apply for jobs',
      'INSUFFICIENT_PERMISSIONS'
    );
  }
};

export const checkResumeUploadPermission = (userRole: string) => {
  const allowedRoles = ['job_seeker', 'customer', 'admin'];
  if (!allowedRoles.includes(userRole)) {
    throw new JobPermissionError(
      'Only job seekers can upload resumes',
      'INSUFFICIENT_PERMISSIONS'
    );
  }
};

// Application status validation
export const validateApplicationStatus = (status: string): boolean => {
  const validStatuses: ApplicationStatus[] = [
    'pending', 'reviewing', 'shortlisted', 'interviewed', 
    'offered', 'hired', 'rejected', 'withdrawn'
  ];
  return validStatuses.includes(status as ApplicationStatus);
};

export const getApplicationStatusMessage = (status: ApplicationStatus): string => {
  const messages: Record<ApplicationStatus, string> = {
    'pending': 'Your application is being processed',
    'reviewing': 'Your application is under review',
    'shortlisted': 'Congratulations! You have been shortlisted',
    'interviewed': 'Interview completed, awaiting decision',
    'offered': 'Congratulations! You have received a job offer',
    'hired': 'Congratulations! You have been hired',
    'rejected': 'Unfortunately, your application was not successful',
    'withdrawn': 'Application has been withdrawn'
  };
  return messages[status] || 'Unknown status';
};

// Error message formatting
export const formatValidationError = (error: z.ZodError): string[] => {
  return error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
};

export const formatJobValidationError = (error: JobValidationError): string => {
  return `${error.field}: ${error.message}`;
};