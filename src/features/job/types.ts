// Job Matching Platform Types

export type JobUserType = 'employer' | 'employee';
export type JobType = 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship' | 'temporary';
export type JobLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'executive';
export type JobCategory = 'technology' | 'finance' | 'healthcare' | 'education' | 'marketing' | 'sales' | 'design' | 'operations' | 'legal' | 'hr' | 'customer_service' | 'construction' | 'manufacturing' | 'retail' | 'hospitality' | 'transportation' | 'real_estate' | 'media' | 'government' | 'nonprofit' | 'other';
export type WorkLocation = 'remote' | 'hybrid' | 'onsite';
export type JobStatus = 'active' | 'paused' | 'filled' | 'expired' | 'draft';
export type ApplicationStatus = 'pending' | 'reviewing' | 'shortlisted' | 'interviewed' | 'offered' | 'hired' | 'rejected' | 'withdrawn';
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';
export type InterviewType = 'phone' | 'video' | 'in_person' | 'technical' | 'behavioral' | 'panel';
export type DocumentType = 'resume' | 'cover_letter' | 'portfolio' | 'certificate' | 'transcript' | 'reference' | 'other';
export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
export type SalaryPeriod = 'hourly' | 'weekly' | 'monthly' | 'yearly';

// Core User Types
export interface Employer {
  id: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  companyName: string;
  companyDescription: string;
  companyWebsite?: string;
  companySize: CompanySize;
  industry: string;
  location: JobLocation;
  companyLogo?: string;
  establishedYear?: number;
  isVerified: boolean;
  verifiedAt?: string;
  rating: number;
  reviewCount: number;
  totalJobs: number;
  activeJobs: number;
  totalHires: number;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  title: string;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  languages: Language[];
  location: JobLocation;
  expectedSalary?: SalaryRange;
  availableFrom?: string;
  workPreference: WorkLocation;
  isActivelyLooking: boolean;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  isVerified: boolean;
  verifiedAt?: string;
  rating: number;
  reviewCount: number;
  totalApplications: number;
  totalInterviews: number;
  documents: EmployeeDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate?: string;
  isCurrentJob: boolean;
  description: string;
  skills: string[];
  achievements: string[];
}

export interface Education {
  id: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  startDate: string;
  endDate?: string;
  isCurrentlyStudying: boolean;
  gpa?: number;
  description?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Language {
  id: string;
  language: string;
  proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: SalaryPeriod;
}

export interface JobLocation {
  country: string;
  state?: string;
  city?: string;
  address?: string;
  isRemote: boolean;
  latitude?: number;
  longitude?: number;
}

// Job-related Types
export interface Job {
  id: string;
  employerId: string;
  employer?: Employer;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  jobType: JobType;
  jobLevel: JobLevel;
  category: JobCategory;
  workLocation: WorkLocation;
  location: JobLocation;
  salary?: SalaryRange;
  applicationDeadline?: string;
  startDate?: string;
  status: JobStatus;
  isActive: boolean;
  isPremium: boolean;
  isFeatured: boolean;
  viewCount: number;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  job?: Job;
  employeeId: string;
  employee?: Employee;
  employerId: string;
  employer?: Employer;
  status: ApplicationStatus;
  coverLetter?: string;
  expectedSalary?: SalaryRange;
  availableFrom?: string;
  documents: ApplicationDocument[];
  notes?: string;
  rejectionReason?: string;
  appliedAt: string;
  updatedAt: string;
}

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  isPublic: boolean;
  uploadedAt: string;
}

export interface Interview {
  id: string;
  jobId: string;
  job?: Job;
  applicationId: string;
  application?: JobApplication;
  employeeId: string;
  employee?: Employee;
  employerId: string;
  employer?: Employer;
  scheduledAt: string;
  durationMinutes: number;
  interviewType: InterviewType;
  location?: string;
  meetingLink?: string;
  status: InterviewStatus;
  notes?: string;
  feedback?: string;
  rating?: number;
  nextSteps?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobOffer {
  id: string;
  jobId: string;
  job?: Job;
  applicationId: string;
  application?: JobApplication;
  employeeId: string;
  employee?: Employee;
  employerId: string;
  employer?: Employer;
  salary: SalaryRange;
  benefits: string[];
  startDate: string;
  terms: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  responseMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// Form Data Types
export interface EmployerRegistrationData {
  companyName: string;
  companyDescription: string;
  companyWebsite?: string;
  companySize: CompanySize;
  industry: string;
  location: JobLocation;
  establishedYear?: number;
  companyLogo?: File;
  documents: File[];
}

export interface EmployeeRegistrationData {
  title: string;
  summary: string;
  skills: string[];
  location: JobLocation;
  expectedSalary?: SalaryRange;
  workPreference: WorkLocation;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  resume: File;
  documents: File[];
}

export interface JobPostingData {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  jobType: JobType;
  jobLevel: JobLevel;
  category: JobCategory;
  workLocation: WorkLocation;
  location: JobLocation;
  salary?: SalaryRange;
  applicationDeadline?: string;
  startDate?: string;
  isPremium?: boolean;
  isFeatured?: boolean;
}

export interface JobSearchFilters {
  query?: string;
  category?: JobCategory;
  jobType?: JobType;
  jobLevel?: JobLevel;
  workLocation?: WorkLocation;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  company?: string;
  postedWithin?: number; // days
  sortBy?: 'date' | 'salary' | 'relevance' | 'company';
  sortOrder?: 'asc' | 'desc';
}

export interface InterviewScheduleData {
  jobId: string;
  applicationId: string;
  employeeId: string;
  scheduledAt: string;
  durationMinutes: number;
  interviewType: InterviewType;
  location?: string;
  meetingLink?: string;
  notes?: string;
}

// Analytics Types
export interface EmployerAnalytics {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalInterviews: number;
  totalHires: number;
  averageTimeToHire: number;
  applicationsByStatus: Record<ApplicationStatus, number>;
  topSkills: Array<{ skill: string; count: number }>;
  applicationTrends: Array<{ date: string; count: number }>;
}

export interface EmployeeAnalytics {
  totalApplications: number;
  totalInterviews: number;
  totalOffers: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  applicationsByStatus: Record<ApplicationStatus, number>;
  applicationTrends: Array<{ date: string; count: number }>;
  topCompanies: Array<{ company: string; count: number }>;
}
