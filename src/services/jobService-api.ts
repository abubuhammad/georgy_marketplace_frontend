import { apiClient } from '@/lib/apiClient';
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

class JobApiService {
  // Employer Management
  async registerEmployer(userId: string, data: EmployerRegistrationData): Promise<Employer> {
    try {
      const response = await apiClient.post('/jobs/employers/register', { userId, ...data });
      return response.data.employer;
    } catch (error) {
      console.error('Error registering employer:', error);
      throw new Error('Failed to register employer');
    }
  }

  async getEmployer(userId: string): Promise<Employer> {
    try {
      const response = await apiClient.get(`/jobs/employers/profile/${userId}`);
      return response.data.employer;
    } catch (error) {
      console.error('Error getting employer:', error);
      throw new Error('Failed to get employer');
    }
  }

  async updateEmployer(userId: string, updates: Partial<Employer>): Promise<Employer> {
    try {
      const response = await apiClient.put(`/jobs/employers/profile/${userId}`, updates);
      return response.data.employer;
    } catch (error) {
      console.error('Error updating employer:', error);
      throw new Error('Failed to update employer');
    }
  }

  async getEmployerProfile(employerId: string): Promise<Employer> {
    try {
      const response = await apiClient.get(`/jobs/employers/${employerId}`);
      return response.data.employer;
    } catch (error) {
      console.error('Error getting employer profile:', error);
      throw new Error('Failed to get employer profile');
    }
  }

  // Employee Management
  async registerEmployee(userId: string, data: EmployeeRegistrationData): Promise<Employee> {
    try {
      const response = await apiClient.post('/jobs/employees/register', { userId, ...data });
      return response.data.employee;
    } catch (error) {
      console.error('Error registering employee:', error);
      throw new Error('Failed to register employee');
    }
  }

  async getEmployee(userId: string): Promise<Employee> {
    try {
      const response = await apiClient.get(`/jobs/employees/profile/${userId}`);
      return response.data.employee;
    } catch (error) {
      console.error('Error getting employee:', error);
      throw new Error('Failed to get employee');
    }
  }

  async updateEmployee(userId: string, updates: Partial<Employee>): Promise<Employee> {
    try {
      const response = await apiClient.put(`/jobs/employees/profile/${userId}`, updates);
      return response.data.employee;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw new Error('Failed to update employee');
    }
  }

  async searchEmployees(filters: any): Promise<{ employees: Employee[]; total: number }> {
    try {
      const response = await apiClient.get('/jobs/employees', { params: filters });
      return {
        employees: response.data.employees,
        total: response.data.total
      };
    } catch (error) {
      console.error('Error searching employees:', error);
      return { employees: [], total: 0 };
    }
  }

  async toggleEmployeeAvailability(userId: string): Promise<void> {
    try {
      await apiClient.put(`/jobs/employees/${userId}/toggle-availability`);
    } catch (error) {
      console.error('Error toggling employee availability:', error);
      throw new Error('Failed to toggle availability');
    }
  }

  // Job Management
  async createJob(employerId: string, data: JobPostingData): Promise<Job> {
    try {
      const response = await apiClient.post('/jobs', { employerId, ...data });
      return response.data.job;
    } catch (error) {
      console.error('Error creating job:', error);
      throw new Error('Failed to create job');
    }
  }

  async searchJobs(filters: JobSearchFilters): Promise<{ jobs: Job[]; total: number }> {
    try {
      const response = await apiClient.get('/jobs', { params: filters });
      return {
        jobs: response.data.jobs,
        total: response.data.total
      };
    } catch (error) {
      console.error('Error searching jobs:', error);
      return { jobs: [], total: 0 };
    }
  }

  async getJobById(jobId: string): Promise<Job> {
    try {
      const response = await apiClient.get(`/jobs/${jobId}`);
      return response.data.job;
    } catch (error) {
      console.error('Error getting job:', error);
      throw new Error('Failed to get job');
    }
  }

  async getEmployerJobs(employerId: string): Promise<Job[]> {
    try {
      const response = await apiClient.get(`/jobs/employers/${employerId}/jobs`);
      return response.data.jobs;
    } catch (error) {
      console.error('Error getting employer jobs:', error);
      return [];
    }
  }

  async updateJob(jobId: string, updates: Partial<Job>): Promise<Job> {
    try {
      const response = await apiClient.put(`/jobs/${jobId}`, updates);
      return response.data.job;
    } catch (error) {
      console.error('Error updating job:', error);
      throw new Error('Failed to update job');
    }
  }

  async deleteJob(jobId: string): Promise<void> {
    try {
      await apiClient.delete(`/jobs/${jobId}`);
    } catch (error) {
      console.error('Error deleting job:', error);
      throw new Error('Failed to delete job');
    }
  }

  async toggleJobStatus(jobId: string): Promise<Job> {
    try {
      const response = await apiClient.put(`/jobs/${jobId}/toggle-status`);
      return response.data.job;
    } catch (error) {
      console.error('Error toggling job status:', error);
      throw new Error('Failed to toggle job status');
    }
  }

  // Application Management
  async submitApplication(data: any): Promise<JobApplication> {
    try {
      const response = await apiClient.post('/jobs/applications', data);
      return response.data.application;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw new Error('Failed to submit application');
    }
  }

  async getApplications(filters: any): Promise<{ applications: JobApplication[]; total: number }> {
    try {
      const response = await apiClient.get('/jobs/applications', { params: filters });
      return {
        applications: response.data.applications,
        total: response.data.total
      };
    } catch (error) {
      console.error('Error getting applications:', error);
      return { applications: [], total: 0 };
    }
  }

  async getEmployeeApplications(employeeId: string): Promise<JobApplication[]> {
    try {
      const response = await apiClient.get(`/jobs/employees/${employeeId}/applications`);
      return response.data.applications;
    } catch (error) {
      console.error('Error getting employee applications:', error);
      return [];
    }
  }

  async getJobApplications(jobId: string): Promise<JobApplication[]> {
    try {
      const response = await apiClient.get(`/jobs/${jobId}/applications`);
      return response.data.applications;
    } catch (error) {
      console.error('Error getting job applications:', error);
      return [];
    }
  }

  async updateApplicationStatus(applicationId: string, status: string): Promise<JobApplication> {
    try {
      const response = await apiClient.put(`/jobs/applications/${applicationId}/status`, { status });
      return response.data.application;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw new Error('Failed to update application status');
    }
  }

  async getApplicationById(applicationId: string): Promise<JobApplication> {
    try {
      const response = await apiClient.get(`/jobs/applications/${applicationId}`);
      return response.data.application;
    } catch (error) {
      console.error('Error getting application:', error);
      throw new Error('Failed to get application');
    }
  }

  // Interview Management
  async scheduleInterview(data: InterviewScheduleData): Promise<Interview> {
    try {
      const response = await apiClient.post('/jobs/interviews', data);
      return response.data.interview;
    } catch (error) {
      console.error('Error scheduling interview:', error);
      throw new Error('Failed to schedule interview');
    }
  }

  async getInterviews(filters: any): Promise<{ interviews: Interview[]; total: number }> {
    try {
      const response = await apiClient.get('/jobs/interviews', { params: filters });
      return {
        interviews: response.data.interviews,
        total: response.data.total
      };
    } catch (error) {
      console.error('Error getting interviews:', error);
      return { interviews: [], total: 0 };
    }
  }

  async updateInterview(interviewId: string, updates: Partial<Interview>): Promise<Interview> {
    try {
      const response = await apiClient.put(`/jobs/interviews/${interviewId}`, updates);
      return response.data.interview;
    } catch (error) {
      console.error('Error updating interview:', error);
      throw new Error('Failed to update interview');
    }
  }

  async cancelInterview(interviewId: string): Promise<void> {
    try {
      await apiClient.delete(`/jobs/interviews/${interviewId}`);
    } catch (error) {
      console.error('Error canceling interview:', error);
      throw new Error('Failed to cancel interview');
    }
  }

  // Job Offer Management
  async createJobOffer(data: any): Promise<JobOffer> {
    try {
      const response = await apiClient.post('/jobs/offers', data);
      return response.data.offer;
    } catch (error) {
      console.error('Error creating job offer:', error);
      throw new Error('Failed to create job offer');
    }
  }

  async getJobOffers(filters: any): Promise<{ offers: JobOffer[]; total: number }> {
    try {
      const response = await apiClient.get('/jobs/offers', { params: filters });
      return {
        offers: response.data.offers,
        total: response.data.total
      };
    } catch (error) {
      console.error('Error getting job offers:', error);
      return { offers: [], total: 0 };
    }
  }

  async updateOfferStatus(offerId: string, status: string): Promise<JobOffer> {
    try {
      const response = await apiClient.put(`/jobs/offers/${offerId}/status`, { status });
      return response.data.offer;
    } catch (error) {
      console.error('Error updating offer status:', error);
      throw new Error('Failed to update offer status');
    }
  }

  // Document Management
  async uploadDocument(employeeId: string, file: File, type: string): Promise<EmployeeDocument> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await apiClient.post(`/jobs/employees/${employeeId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Failed to upload document');
    }
  }

  async getEmployeeDocuments(employeeId: string): Promise<EmployeeDocument[]> {
    try {
      const response = await apiClient.get(`/jobs/employees/${employeeId}/documents`);
      return response.data.documents;
    } catch (error) {
      console.error('Error getting employee documents:', error);
      return [];
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    try {
      await apiClient.delete(`/jobs/documents/${documentId}`);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  }

  // Analytics
  async getEmployerAnalytics(employerId: string): Promise<EmployerAnalytics> {
    try {
      const response = await apiClient.get(`/jobs/employers/${employerId}/analytics`);
      return response.data.analytics;
    } catch (error) {
      console.error('Error getting employer analytics:', error);
      // Fallback to mock analytics
      return {
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        totalHires: 0,
        averageTimeToHire: 0,
        topSkills: [],
        applicationsByMonth: [],
        sourceBreakdown: []
      };
    }
  }

  async getEmployeeAnalytics(employeeId: string): Promise<EmployeeAnalytics> {
    try {
      const response = await apiClient.get(`/jobs/employees/${employeeId}/analytics`);
      return response.data.analytics;
    } catch (error) {
      console.error('Error getting employee analytics:', error);
      // Fallback to mock analytics
      return {
        profileViews: 0,
        applicationsSent: 0,
        interviewsScheduled: 0,
        jobOffersReceived: 0,
        responseRate: 0,
        averageResponseTime: 0,
        skillsInDemand: [],
        applicationHistory: []
      };
    }
  }

  async getPlatformAnalytics(): Promise<any> {
    try {
      const response = await apiClient.get('/jobs/analytics/platform');
      return response.data.analytics;
    } catch (error) {
      console.error('Error getting platform analytics:', error);
      return {
        totalJobs: 0,
        totalEmployers: 0,
        totalEmployees: 0,
        totalApplications: 0,
        avgTimeToHire: 0,
        popularCategories: [],
        growthStats: []
      };
    }
  }

  // Job Categories
  async getJobCategories(): Promise<any[]> {
    try {
      const response = await apiClient.get('/jobs/categories');
      return response.data.categories;
    } catch (error) {
      console.error('Error getting job categories:', error);
      // Fallback to hardcoded categories
      return [
        { id: '1', name: 'Technology', slug: 'technology', description: 'Software, IT, and tech roles', icon: '💻', isActive: true },
        { id: '2', name: 'Marketing', slug: 'marketing', description: 'Marketing and advertising roles', icon: '📈', isActive: true },
        { id: '3', name: 'Sales', slug: 'sales', description: 'Sales and business development', icon: '💼', isActive: true },
        { id: '4', name: 'Design', slug: 'design', description: 'UI/UX and graphic design', icon: '🎨', isActive: true },
        { id: '5', name: 'Finance', slug: 'finance', description: 'Accounting and finance roles', icon: '💰', isActive: true }
      ];
    }
  }

  // Saved Jobs
  async saveJob(employeeId: string, jobId: string): Promise<void> {
    try {
      await apiClient.post('/jobs/saved', { employeeId, jobId });
    } catch (error) {
      console.error('Error saving job:', error);
      throw new Error('Failed to save job');
    }
  }

  async unsaveJob(employeeId: string, jobId: string): Promise<void> {
    try {
      await apiClient.delete(`/jobs/saved/${employeeId}/${jobId}`);
    } catch (error) {
      console.error('Error unsaving job:', error);
      throw new Error('Failed to unsave job');
    }
  }

  async getSavedJobs(employeeId: string): Promise<Job[]> {
    try {
      const response = await apiClient.get(`/jobs/employees/${employeeId}/saved`);
      return response.data.jobs;
    } catch (error) {
      console.error('Error getting saved jobs:', error);
      return [];
    }
  }
}

export const jobApiService = new JobApiService();
export default jobApiService;
