import { isDevMode } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
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
    const { data: employer, error } = await supabase
      .from('employers')
      .insert([
        {
          user_id: userId,
          company_name: data.companyName,
          company_description: data.companyDescription,
          company_website: data.companyWebsite,
          company_size: data.companySize,
          industry: data.industry,
          location: data.location,
          established_year: data.establishedYear,
          is_verified: false,
          rating: 0,
          review_count: 0,
          total_jobs: 0,
          active_jobs: 0,
          total_hires: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Upload company logo if provided
    if (data.companyLogo) {
      await this.uploadCompanyLogo(employer.id, data.companyLogo);
    }

    // Upload documents if provided
    if (data.documents && data.documents.length > 0) {
      await this.uploadEmployerDocuments(employer.id, data.documents);
    }

    return employer;
  }

  static async getEmployerByUserId(userId: string): Promise<Employer | null> {
    const { data, error } = await supabase
      .from('employers')
      .select(`
        *,
        user:users (
          id,
          first_name,
          last_name,
          email,
          phone,
          avatar
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  static async updateEmployer(employerId: string, updates: Partial<Employer>): Promise<Employer> {
    const { data, error } = await supabase
      .from('employers')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', employerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async uploadCompanyLogo(employerId: string, file: File): Promise<string> {
    const fileName = `${employerId}/logo_${Date.now()}.${file.name.split('.').pop()}`;
    // Mock file upload - in real implementation, use cloud storage
    const mockData = { path: fileName };
    const error = null;

    if (error) throw error;

    const publicUrl = `https://via.placeholder.com/150x150?text=Company+Logo`;

    // Update employer with logo URL (mock implementation)
    if (!isDevMode) {
      await prisma.employer.update({
        where: { id: employerId },
        data: { companyLogo: publicUrl }
      });
    }

    return publicUrl;
  }

  static async uploadEmployerDocuments(employerId: string, documents: File[]): Promise<string[]> {
    const uploadPromises = documents.map(async (file) => {
      const fileName = `${employerId}/${Date.now()}_${file.name}`;
      // Mock implementation - would use Prisma/cloud storage
      console.log(`Uploading document: ${fileName}`);
      return `/uploads/${fileName}`;
    });

    return Promise.all(uploadPromises);
  }

  // Employee Management
  static async registerEmployee(userId: string, data: EmployeeRegistrationData): Promise<Employee> {
    const { data: employee, error } = await supabase
      .from('employees')
      .insert([
        {
          user_id: userId,
          title: data.title,
          summary: data.summary,
          skills: data.skills,
          location: data.location,
          expected_salary: data.expectedSalary,
          work_preference: data.workPreference,
          portfolio_url: data.portfolioUrl,
          linkedin_url: data.linkedinUrl,
          github_url: data.githubUrl,
          is_actively_looking: true,
          is_verified: false,
          rating: 0,
          review_count: 0,
          total_applications: 0,
          total_interviews: 0,
          experience: [],
          education: [],
          certifications: [],
          languages: [],
          documents: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Upload resume
    if (data.resume) {
      await this.uploadEmployeeDocument(employee.id, data.resume, 'resume');
    }

    // Upload additional documents
    if (data.documents && data.documents.length > 0) {
      await Promise.all(
        data.documents.map(doc => this.uploadEmployeeDocument(employee.id, doc, 'other'))
      );
    }

    return employee;
  }

  static async getEmployeeByUserId(userId: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        user:users (
          id,
          first_name,
          last_name,
          email,
          phone,
          avatar
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  static async updateEmployee(employeeId: string, updates: Partial<Employee>): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', employeeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async uploadEmployeeDocument(employeeId: string, file: File, documentType: string): Promise<EmployeeDocument> {
    const fileName = `${employeeId}/${documentType}_${Date.now()}_${file.name}`;
    // Mock implementation - would use Prisma/cloud storage
    console.log(`Uploading employee document: ${fileName}`);

    // Mock document record
    const documentRecord = {
      id: `doc-${Date.now()}`,
      employee_id: employeeId,
      document_type: documentType,
      file_name: file.name,
      file_url: `/uploads/${fileName}`,
      file_size: file.size,
      is_public: false,
      uploaded_at: new Date().toISOString(),
    };
    return documentRecord;
  }

  // Job Management
  static async createJob(employerId: string, data: JobPostingData): Promise<Job> {
    const { data: job, error } = await supabase
      .from('jobs')
      .insert([
        {
          employer_id: employerId,
          title: data.title,
          description: data.description,
          requirements: data.requirements,
          responsibilities: data.responsibilities,
          benefits: data.benefits,
          skills: data.skills,
          job_type: data.jobType,
          job_level: data.jobLevel,
          category: data.category,
          work_location: data.workLocation,
          location: data.location,
          salary: data.salary,
          application_deadline: data.applicationDeadline,
          start_date: data.startDate,
          status: 'active',
          is_active: true,
          is_premium: data.isPremium || false,
          is_featured: data.isFeatured || false,
          view_count: 0,
          application_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Update employer's job count
    // Mock implementation - would increment counter in database
    console.log(`Incrementing job count for employer: ${employerId}`);

    return job;
  }

  static async getJobs(filters?: JobSearchFilters): Promise<Job[]> {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        employer:employers (
          id,
          company_name,
          company_logo,
          company_size,
          industry,
          location,
          is_verified,
          rating,
          review_count
        )
      `)
      .eq('is_active', true);

    if (filters) {
      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.jobType) {
        query = query.eq('job_type', filters.jobType);
      }
      if (filters.jobLevel) {
        query = query.eq('job_level', filters.jobLevel);
      }
      if (filters.workLocation) {
        query = query.eq('work_location', filters.workLocation);
      }
      if (filters.location) {
        query = query.or(`location->>city.ilike.%${filters.location}%,location->>state.ilike.%${filters.location}%`);
      }
      if (filters.salaryMin && filters.salaryMax) {
        query = query.gte('salary->>min', filters.salaryMin).lte('salary->>max', filters.salaryMax);
      }
      if (filters.skills && filters.skills.length > 0) {
        query = query.contains('skills', filters.skills);
      }
      if (filters.company) {
        query = query.ilike('employer.company_name', `%${filters.company}%`);
      }
      if (filters.postedWithin) {
        const date = new Date();
        date.setDate(date.getDate() - filters.postedWithin);
        query = query.gte('created_at', date.toISOString());
      }
    }

    // Apply sorting
    if (filters?.sortBy) {
      const sortOrder = filters.sortOrder || 'desc';
      switch (filters.sortBy) {
        case 'date':
          query = query.order('created_at', { ascending: sortOrder === 'asc' });
          break;
        case 'salary':
          query = query.order('salary->>max', { ascending: sortOrder === 'asc' });
          break;
        case 'relevance':
          query = query.order('view_count', { ascending: sortOrder === 'asc' });
          break;
        case 'company':
          query = query.order('employer.company_name', { ascending: sortOrder === 'asc' });
          break;
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  static async getJobById(jobId: string): Promise<Job | null> {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        employer:employers (
          id,
          company_name,
          company_description,
          company_logo,
          company_size,
          industry,
          location,
          is_verified,
          rating,
          review_count,
          user:users (
            first_name,
            last_name,
            email,
            phone
          )
        )
      `)
      .eq('id', jobId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    // Increment view count
    await supabase
      .from('jobs')
      .update({ view_count: data.view_count + 1 })
      .eq('id', jobId);

    return data;
  }

  static async getJobsByEmployer(employerId: string): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', employerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateJob(jobId: string, updates: Partial<Job>): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteJob(jobId: string): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (error) throw error;
  }

  // Job Application Management
  static async applyToJob(data: Omit<JobApplication, 'id' | 'appliedAt' | 'updatedAt'>): Promise<JobApplication> {
    const { data: application, error } = await supabase
      .from('job_applications')
      .insert([
        {
          ...data,
          status: 'pending',
          applied_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Mock implementation - would increment counters in database
    console.log(`Incrementing application count for job: ${data.jobId}`);
    console.log(`Incrementing application count for employee: ${data.employeeId}`);

    return application;
  }

  static async getApplicationsByJob(jobId: string): Promise<JobApplication[]> {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        employee:employees (
          id,
          title,
          summary,
          skills,
          location,
          rating,
          user:users (
            first_name,
            last_name,
            email,
            phone,
            avatar
          )
        )
      `)
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getApplicationsByEmployee(employeeId: string): Promise<JobApplication[]> {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:jobs (
          id,
          title,
          job_type,
          work_location,
          location,
          salary,
          employer:employers (
            company_name,
            company_logo
          )
        )
      `)
      .eq('employee_id', employeeId)
      .order('applied_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateApplicationStatus(applicationId: string, status: string, notes?: string): Promise<JobApplication> {
    const { data, error } = await supabase
      .from('job_applications')
      .update({
        status,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Interview Management
  static async scheduleInterview(data: InterviewScheduleData): Promise<Interview> {
    const { data: interview, error } = await supabase
      .from('interviews')
      .insert([
        {
          job_id: data.jobId,
          application_id: data.applicationId,
          employee_id: data.employeeId,
          employer_id: data.employeeId, // This should be from the job
          scheduled_at: data.scheduledAt,
          duration_minutes: data.durationMinutes,
          interview_type: data.interviewType,
          location: data.location,
          meeting_link: data.meetingLink,
          notes: data.notes,
          status: 'scheduled',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return interview;
  }

  static async getInterviewsByEmployer(employerId: string): Promise<Interview[]> {
    const { data, error } = await supabase
      .from('interviews')
      .select(`
        *,
        job:jobs (
          id,
          title
        ),
        employee:employees (
          id,
          title,
          user:users (
            first_name,
            last_name,
            email,
            phone
          )
        )
      `)
      .eq('employer_id', employerId)
      .order('scheduled_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getInterviewsByEmployee(employeeId: string): Promise<Interview[]> {
    const { data, error } = await supabase
      .from('interviews')
      .select(`
        *,
        job:jobs (
          id,
          title,
          employer:employers (
            company_name,
            company_logo
          )
        )
      `)
      .eq('employee_id', employeeId)
      .order('scheduled_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async updateInterviewStatus(interviewId: string, status: string, feedback?: string, rating?: number): Promise<Interview> {
    const { data, error } = await supabase
      .from('interviews')
      .update({
        status,
        feedback,
        rating,
        updated_at: new Date().toISOString(),
      })
      .eq('id', interviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Analytics
  static async getEmployerAnalytics(employerId: string): Promise<EmployerAnalytics> {
    // Get job statistics
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('application_count, is_active')
      .eq('employer_id', employerId);

    if (jobsError) throw jobsError;

    // Get application statistics
    const { data: applications, error: applicationsError } = await supabase
      .from('job_applications')
      .select('status, applied_at')
      .eq('employer_id', employerId);

    if (applicationsError) throw applicationsError;

    // Get interview count
    const { count: totalInterviews, error: interviewsError } = await supabase
      .from('interviews')
      .select('*', { count: 'exact' })
      .eq('employer_id', employerId);

    if (interviewsError) throw interviewsError;

    // Calculate statistics
    const totalJobs = jobs?.length || 0;
    const activeJobs = jobs?.filter(j => j.is_active).length || 0;
    const totalApplications = applications?.length || 0;
    const totalHires = applications?.filter(a => a.status === 'hired').length || 0;

    // Calculate application status distribution
    const applicationsByStatus = applications?.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      totalInterviews: totalInterviews || 0,
      totalHires,
      averageTimeToHire: 0, // Calculate this based on hire data
      applicationsByStatus,
      topSkills: [], // Calculate from job requirements
      applicationTrends: [], // Calculate from application dates
    };
  }

  static async getEmployeeAnalytics(employeeId: string): Promise<EmployeeAnalytics> {
    // Get application statistics
    const { data: applications, error: applicationsError } = await supabase
      .from('job_applications')
      .select('status, applied_at')
      .eq('employee_id', employeeId);

    if (applicationsError) throw applicationsError;

    // Get interview count
    const { count: totalInterviews, error: interviewsError } = await supabase
      .from('interviews')
      .select('*', { count: 'exact' })
      .eq('employee_id', employeeId);

    if (interviewsError) throw interviewsError;

    // Calculate statistics
    const totalApplications = applications?.length || 0;
    const totalOffers = applications?.filter(a => a.status === 'offered').length || 0;
    const responseRate = totalApplications > 0 ? (applications?.filter(a => a.status !== 'pending').length || 0) / totalApplications : 0;
    const interviewRate = totalApplications > 0 ? (totalInterviews || 0) / totalApplications : 0;
    const offerRate = totalApplications > 0 ? totalOffers / totalApplications : 0;

    // Calculate application status distribution
    const applicationsByStatus = applications?.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      totalApplications,
      totalInterviews: totalInterviews || 0,
      totalOffers,
      responseRate,
      interviewRate,
      offerRate,
      applicationsByStatus,
      applicationTrends: [], // Calculate from application dates
      topCompanies: [], // Calculate from applications
    };
  }

  // Upload application documents
  static async uploadApplicationDocument(applicationId: string, file: File, documentType: string): Promise<ApplicationDocument> {
    const fileName = `${applicationId}/${documentType}_${Date.now()}_${file.name}`;
    // Mock implementation - would use Prisma/cloud storage
    console.log(`Uploading application document: ${fileName}`);

    // Mock document record
    const documentRecord = {
      id: `doc-${Date.now()}`,
      application_id: applicationId,
      document_type: documentType,
      file_name: file.name,
      file_url: `/uploads/${fileName}`,
      file_size: file.size,
      uploaded_at: new Date().toISOString(),
    };
    return documentRecord;
  }
}
