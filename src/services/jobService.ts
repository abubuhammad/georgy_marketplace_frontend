import { generateMockData, mockStorage } from '@/lib/mockData';
import { jobApiService } from './jobService-api';
import { 
  Employer,
  Employee,
  Job,
  JobApplication,
  Interview,
  JobOffer,
  EmployerRegistrationData,
  EmployeeRegistrationData,
  JobPostingData,
  JobSearchFilters,
  InterviewScheduleData,
  EmployerAnalytics,
  EmployeeAnalytics,
  ApplicationDocument,
  EmployeeDocument
} from '@/features/job/types';

export class JobService {
  // Employer Management
  static async registerEmployer(userId: string, data: EmployerRegistrationData): Promise<Employer> {
    try {
      // Try API first
      return await jobApiService.registerEmployer(userId, data);
    } catch (error) {
      console.warn('API unavailable, using mock data for employer registration');
      
      // Fallback to mock data
      const newEmployer = {
        id: `employer_${Date.now()}`,
        userId,
        companyName: data.companyName,
        companyDescription: data.companyDescription,
        companyWebsite: data.companyWebsite,
        companySize: data.companySize,
        industry: data.industry,
        location: data.location,
        establishedYear: data.establishedYear,
        isVerified: false,
        rating: 0,
        reviewCount: 0,
        totalJobs: 0,
        activeJobs: 0,
        totalHires: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store in mock storage (add employers array if not exists)
      if (!mockStorage.employers) mockStorage.employers = [];
      mockStorage.employers.push(newEmployer);
      
      console.log('Employer registered (mock):', newEmployer.companyName);
      return newEmployer;
    }
  }

  static async getEmployer(userId: string): Promise<Employer> {
    try {
      // Try API first
      return await jobApiService.getEmployer(userId);
    } catch (error) {
      console.warn('API unavailable, using mock data for employer lookup');
      
      // Fallback to mock data
      if (!mockStorage.employers) mockStorage.employers = [];
      const employer = mockStorage.employers.find(e => e.userId === userId);
      if (!employer) {
        throw new Error('Employer not found');
      }
      console.log('Retrieved employer (mock):', employer.companyName);
      return employer;
    }
  }

  static async updateEmployer(userId: string, updates: Partial<Employer>): Promise<Employer> {
    try {
      // Try API first
      return await jobApiService.updateEmployer(userId, updates);
    } catch (error) {
      console.warn('API unavailable, using mock data for employer update');
      
      // Fallback to mock data
      if (!mockStorage.employers) mockStorage.employers = [];
      const employerIndex = mockStorage.employers.findIndex(e => e.userId === userId);
      if (employerIndex === -1) {
        throw new Error('Employer not found');
      }

      mockStorage.employers[employerIndex] = {
        ...mockStorage.employers[employerIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      console.log('Updated employer (mock):', mockStorage.employers[employerIndex].companyName);
      return mockStorage.employers[employerIndex];
    }
  }

  // Employee Management  
  static async registerEmployee(userId: string, data: EmployeeRegistrationData): Promise<Employee> {
    try {
      // Try API first
      return await jobApiService.registerEmployee(userId, data);
    } catch (error) {
      console.warn('API unavailable, using mock data for employee registration');
      
      // Fallback to mock data
      const newEmployee = {
        id: `employee_${Date.now()}`,
        userId,
        title: data.title,
        summary: data.summary,
        experience: data.experience,
        skills: data.skills,
        education: data.education,
        certifications: data.certifications,
        portfolio: data.portfolio,
        expectedSalary: data.expectedSalary,
        availability: data.availability,
        preferredJobTypes: data.preferredJobTypes,
        preferredLocations: data.preferredLocations,
        isAvailable: true,
        isVerified: false,
        profileViews: 0,
        applicationsSent: 0,
        interviewsScheduled: 0,
        jobOffersReceived: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store in mock storage
      if (!mockStorage.employees) mockStorage.employees = [];
      mockStorage.employees.push(newEmployee);
      
      console.log('Employee registered (mock):', newEmployee.title);
      return newEmployee;
    }
  }

  static async getEmployee(userId: string): Promise<Employee> {
    try {
      // Try API first
      return await jobApiService.getEmployee(userId);
    } catch (error) {
      console.warn('API unavailable, using mock data for employee lookup');
      
      // Fallback to mock data
      if (!mockStorage.employees) mockStorage.employees = [];
      const employee = mockStorage.employees.find(e => e.userId === userId);
      if (!employee) {
        throw new Error('Employee not found');
      }
      console.log('Retrieved employee (mock):', employee.title);
      return employee;
    }
  }

  static async updateEmployee(userId: string, updates: Partial<Employee>): Promise<Employee> {
    try {
      // Try API first
      return await jobApiService.updateEmployee(userId, updates);
    } catch (error) {
      console.warn('API unavailable, using mock data for employee update');
      
      // Fallback to mock data
      if (!mockStorage.employees) mockStorage.employees = [];
      const employeeIndex = mockStorage.employees.findIndex(e => e.userId === userId);
      if (employeeIndex === -1) {
        throw new Error('Employee not found');
      }

      mockStorage.employees[employeeIndex] = {
        ...mockStorage.employees[employeeIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      console.log('Updated employee (mock):', mockStorage.employees[employeeIndex].title);
      return mockStorage.employees[employeeIndex];
    }
  }

  // Job Management
  static async createJob(employerId: string, data: JobPostingData): Promise<Job> {
    try {
      // Try API first
      return await jobApiService.createJob(employerId, data);
    } catch (error) {
      console.warn('API unavailable, using mock data for job creation');
      
      // Fallback to mock data
      const newJob = {
        ...generateMockData.job(),
        ...data,
        employerId,
      };

      mockStorage.jobs.push(newJob);
      console.log('Job created (mock):', newJob.title);
      return newJob;
    }
  }

  static async searchJobs(filters: JobSearchFilters): Promise<{ jobs: Job[]; total: number }> {
    try {
      // Try API first
      return await jobApiService.searchJobs(filters);
    } catch (error) {
      console.warn('API unavailable, using mock data for job search');
      
      // Fallback to mock data
      let filteredJobs = [...mockStorage.jobs];

      // Apply filters
      if (filters.query) {
        filteredJobs = filteredJobs.filter(job => 
          job.title.toLowerCase().includes(filters.query!.toLowerCase()) ||
          job.description.toLowerCase().includes(filters.query!.toLowerCase())
        );
      }

      if (filters.location) {
        filteredJobs = filteredJobs.filter(job => 
          job.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      if (filters.jobType) {
        filteredJobs = filteredJobs.filter(job => job.type === filters.jobType);
      }

      if (filters.category) {
        filteredJobs = filteredJobs.filter(job => job.category === filters.category);
      }

      if (filters.minSalary) {
        filteredJobs = filteredJobs.filter(job => 
          job.salary && job.salary.min >= filters.minSalary!
        );
      }

      // Apply pagination
      const offset = ((filters.page || 1) - 1) * (filters.limit || 10);
      const paginatedJobs = filteredJobs.slice(offset, offset + (filters.limit || 10));

      console.log(`Found ${filteredJobs.length} jobs matching filters (mock)`);
      return {
        jobs: paginatedJobs,
        total: filteredJobs.length
      };
    }
  }

  static async getJobById(jobId: string): Promise<Job> {
    try {
      // Try API first
      return await jobApiService.getJobById(jobId);
    } catch (error) {
      console.warn('API unavailable, using mock data for job lookup');
      
      // Fallback to mock data
      const job = mockStorage.jobs.find(j => j.id === jobId);
      if (!job) {
        throw new Error('Job not found');
      }
      console.log('Retrieved job (mock):', job.title);
      return job;
    }
  }

  static async getEmployerJobs(employerId: string): Promise<Job[]> {
    try {
      // Try API first
      return await jobApiService.getEmployerJobs(employerId);
    } catch (error) {
      console.warn('API unavailable, using mock data for employer jobs');
      
      // Fallback to mock data
      const jobs = mockStorage.jobs.filter(j => j.employerId === employerId);
      console.log(`Found ${jobs.length} jobs for employer (mock)`);
      return jobs;
    }
  }

  static async updateJob(jobId: string, updates: Partial<Job>): Promise<Job> {
    try {
      // Try API first
      return await jobApiService.updateJob(jobId, updates);
    } catch (error) {
      console.warn('API unavailable, using mock data for job update');
      
      // Fallback to mock data
      const jobIndex = mockStorage.jobs.findIndex(j => j.id === jobId);
      if (jobIndex === -1) {
        throw new Error('Job not found');
      }

      mockStorage.jobs[jobIndex] = {
        ...mockStorage.jobs[jobIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      console.log('Updated job (mock):', mockStorage.jobs[jobIndex].title);
      return mockStorage.jobs[jobIndex];
    }
  }

  static async deleteJob(jobId: string): Promise<void> {
    try {
      // Try API first
      await jobApiService.deleteJob(jobId);
    } catch (error) {
      console.warn('API unavailable, using mock data for job deletion');
      
      // Fallback to mock data
      const jobIndex = mockStorage.jobs.findIndex(j => j.id === jobId);
      if (jobIndex !== -1) {
        mockStorage.jobs.splice(jobIndex, 1);
        console.log('Job deleted (mock):', jobId);
      }
    }
  }

  // Application Management
  static async submitApplication(data: any): Promise<JobApplication> {
    try {
      // Try API first
      return await jobApiService.submitApplication(data);
    } catch (error) {
      console.warn('API unavailable, using mock data for application submission');
      
      // Fallback to mock data
      const newApplication = {
        id: `application_${Date.now()}`,
        jobId: data.jobId,
        employeeId: data.employeeId,
        coverLetter: data.coverLetter,
        resume: data.resume,
        status: 'submitted' as const,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store in mock storage
      if (!mockStorage.applications) mockStorage.applications = [];
      mockStorage.applications.push(newApplication);
      
      console.log('Application submitted for job (mock):', data.jobId);
      return newApplication;
    }
  }

  static async getApplications(filters: any): Promise<{ applications: JobApplication[]; total: number }> {
    try {
      // Try API first
      return await jobApiService.getApplications(filters);
    } catch (error) {
      console.warn('API unavailable, using mock data for applications');
      
      // Fallback to mock data
      if (!mockStorage.applications) mockStorage.applications = [];
      let filteredApplications = [...mockStorage.applications];

      // Apply basic filtering
      if (filters.employeeId) {
        filteredApplications = filteredApplications.filter(app => app.employeeId === filters.employeeId);
      }
      if (filters.jobId) {
        filteredApplications = filteredApplications.filter(app => app.jobId === filters.jobId);
      }
      if (filters.status) {
        filteredApplications = filteredApplications.filter(app => app.status === filters.status);
      }

      const offset = ((filters.page || 1) - 1) * (filters.limit || 10);
      const paginatedApplications = filteredApplications.slice(offset, offset + (filters.limit || 10));

      return {
        applications: paginatedApplications,
        total: filteredApplications.length
      };
    }
  }

  static async updateApplicationStatus(applicationId: string, status: string): Promise<JobApplication> {
    try {
      // Try API first
      return await jobApiService.updateApplicationStatus(applicationId, status);
    } catch (error) {
      console.warn('API unavailable, using mock data for application status update');
      
      // Fallback to mock data
      if (!mockStorage.applications) mockStorage.applications = [];
      const applicationIndex = mockStorage.applications.findIndex(app => app.id === applicationId);
      if (applicationIndex === -1) {
        throw new Error('Application not found');
      }

      mockStorage.applications[applicationIndex] = {
        ...mockStorage.applications[applicationIndex],
        status: status as any,
        updatedAt: new Date().toISOString(),
      };

      console.log('Updated application status (mock):', status);
      return mockStorage.applications[applicationIndex];
    }
  }

  // Interview Management
  static async scheduleInterview(data: InterviewScheduleData): Promise<Interview> {
    try {
      // Try API first
      return await jobApiService.scheduleInterview(data);
    } catch (error) {
      console.warn('API unavailable, using mock data for interview scheduling');
      
      // Fallback to mock data
      const newInterview = {
        id: `interview_${Date.now()}`,
        applicationId: data.applicationId,
        scheduledAt: data.scheduledAt,
        duration: data.duration || 60,
        type: data.type || 'video',
        location: data.location,
        notes: data.notes,
        status: 'scheduled' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!mockStorage.interviews) mockStorage.interviews = [];
      mockStorage.interviews.push(newInterview);
      
      console.log('Interview scheduled (mock):', newInterview.id);
      return newInterview;
    }
  }

  // Analytics
  static async getEmployerAnalytics(employerId: string): Promise<EmployerAnalytics> {
    try {
      // Try API first
      return await jobApiService.getEmployerAnalytics(employerId);
    } catch (error) {
      console.warn('API unavailable, using mock data for employer analytics');
      
      // Fallback to mock analytics
      const analytics = {
        totalJobs: 15,
        activeJobs: 8,
        totalApplications: 125,
        totalHires: 12,
        averageTimeToHire: 21,
        topSkills: ['JavaScript', 'React', 'Node.js'],
        applicationsByMonth: [
          { month: 'Jan', applications: 25 },
          { month: 'Feb', applications: 35 },
          { month: 'Mar', applications: 30 }
        ],
        sourceBreakdown: [
          { source: 'Direct', count: 45 },
          { source: 'LinkedIn', count: 35 },
          { source: 'Referral', count: 25 }
        ]
      };
      console.log('Retrieved employer analytics (mock)');
      return analytics;
    }
  }

  static async getEmployeeAnalytics(employeeId: string): Promise<EmployeeAnalytics> {
    try {
      // Try API first
      return await jobApiService.getEmployeeAnalytics(employeeId);
    } catch (error) {
      console.warn('API unavailable, using mock data for employee analytics');
      
      // Fallback to mock analytics
      const analytics = {
        profileViews: 45,
        applicationsSent: 12,
        interviewsScheduled: 5,
        jobOffersReceived: 2,
        responseRate: 45,
        averageResponseTime: 3,
        skillsInDemand: ['React', 'TypeScript', 'AWS'],
        applicationHistory: [
          { month: 'Jan', applications: 4, interviews: 2 },
          { month: 'Feb', applications: 5, interviews: 2 },
          { month: 'Mar', applications: 3, interviews: 1 }
        ]
      };
      console.log('Retrieved employee analytics (mock)');
      return analytics;
    }
  }

  // Additional methods that utilize API service
  static async getJobCategories(): Promise<any[]> {
    try {
      return await jobApiService.getJobCategories();
    } catch (error) {
      console.warn('API unavailable, using mock data for job categories');
      return [
        { id: '1', name: 'Technology', slug: 'technology', description: 'Software, IT, and tech roles', icon: '💻', isActive: true },
        { id: '2', name: 'Marketing', slug: 'marketing', description: 'Marketing and advertising roles', icon: '📈', isActive: true },
        { id: '3', name: 'Sales', slug: 'sales', description: 'Sales and business development', icon: '💼', isActive: true },
        { id: '4', name: 'Design', slug: 'design', description: 'UI/UX and graphic design', icon: '🎨', isActive: true },
        { id: '5', name: 'Finance', slug: 'finance', description: 'Accounting and finance roles', icon: '💰', isActive: true }
      ];
    }
  }

  static async searchEmployees(filters: any): Promise<{ employees: Employee[]; total: number }> {
    try {
      return await jobApiService.searchEmployees(filters);
    } catch (error) {
      console.warn('API unavailable, using mock data for employee search');
      
      if (!mockStorage.employees) mockStorage.employees = [];
      let filteredEmployees = [...mockStorage.employees];

      // Apply basic filtering
      if (filters.skills) {
        filteredEmployees = filteredEmployees.filter(emp => 
          filters.skills.some((skill: string) => 
            emp.skills.some(empSkill => empSkill.toLowerCase().includes(skill.toLowerCase()))
          )
        );
      }

      const offset = ((filters.page || 1) - 1) * (filters.limit || 10);
      const paginatedEmployees = filteredEmployees.slice(offset, offset + (filters.limit || 10));

      return {
        employees: paginatedEmployees,
        total: filteredEmployees.length
      };
    }
  }
}

export default JobService;
