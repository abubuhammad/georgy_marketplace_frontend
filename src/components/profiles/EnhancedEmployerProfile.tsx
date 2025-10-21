import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnhancedProfile } from '../enhanced/EnhancedProfile';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Building2, Users, Briefcase, MapPin, Globe, 
  Phone, Mail, Calendar, TrendingUp, Eye,
  Clock, CheckCircle, XCircle, AlertCircle,
  Plus, Edit, Trash2, BarChart3, MessageCircle
} from 'lucide-react';

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  status: 'active' | 'paused' | 'closed';
  applications: number;
  views: number;
  postedDate: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}

interface CompanyProfile {
  name: string;
  description: string;
  industry: string;
  size: string;
  website: string;
  headquarters: string;
  founded: string;
  logo?: string;
  benefits: string[];
  culture: string;
}

export const EnhancedEmployerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: '',
    description: '',
    industry: '',
    size: '',
    website: '',
    headquarters: '',
    founded: '',
    benefits: [],
    culture: ''
  });

  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    hiredCandidates: 0,
    profileViews: 0
  });

  useEffect(() => {
    loadEmployerData();
  }, []);

  const loadEmployerData = async () => {
    try {
      setLoading(true);
      
      // Load job postings
      const jobsResponse = await apiClient.get('/api/employer/jobs');
      if (jobsResponse.data) {
        setJobPostings(jobsResponse.data);
        
        // Calculate stats
        const totalJobs = jobsResponse.data.length;
        const activeJobs = jobsResponse.data.filter((job: JobPosting) => job.status === 'active').length;
        const totalApplications = jobsResponse.data.reduce((sum: number, job: JobPosting) => sum + job.applications, 0);
        
        setStats(prev => ({
          ...prev,
          totalJobs,
          activeJobs,
          totalApplications
        }));
      }
      
      // Load company profile
      const companyResponse = await apiClient.get('/api/employer/company');
      if (companyResponse.data) {
        setCompanyProfile(companyResponse.data);
      }
      
    } catch (error) {
      console.error('Error loading employer data:', error);
      toast.error('Failed to load employer data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: JobPosting['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: JobPosting['status']) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'paused': return AlertCircle;
      case 'closed': return XCircle;
      default: return Clock;
    }
  };

  const customActions = [
    {
      label: 'Post New Job',
      icon: Plus,
      onClick: () => navigate('/jobs/post'),
      variant: 'default' as const
    },
    {
      label: 'View Applications',
      icon: MessageCircle,
      onClick: () => navigate('/employer/applications')
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      onClick: () => navigate('/employer/analytics')
    }
  ];

  const roleSpecificContent = (
    <div className="space-y-6">
      {/* Company Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Information
          </CardTitle>
          <CardDescription>
            Manage your company profile and details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={companyProfile.logo} />
              <AvatarFallback className="text-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {companyProfile.name?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{companyProfile.name || 'Company Name'}</h3>
              <p className="text-gray-600">{companyProfile.industry || 'Industry not specified'}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {companyProfile.size || 'Size not specified'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {companyProfile.headquarters || 'Location not specified'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Founded {companyProfile.founded || 'N/A'}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit Company
            </Button>
          </div>
          
          {companyProfile.description && (
            <div>
              <h4 className="font-medium mb-2">About Company</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {companyProfile.description}
              </p>
            </div>
          )}
          
          {companyProfile.benefits.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Benefits & Perks</h4>
              <div className="flex flex-wrap gap-2">
                {companyProfile.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Postings Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Job Postings
            </CardTitle>
            <CardDescription>
              Manage your active job listings and view performance
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/jobs/post')}>
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : jobPostings.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings yet</h3>
              <p className="text-gray-500 mb-4">Start attracting top talent by posting your first job.</p>
              <Button onClick={() => navigate('/jobs/post')}>
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Job
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobPostings.slice(0, 5).map((job) => {
                const StatusIcon = getStatusIcon(job.status);
                return (
                  <div key={job.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{job.title}</h3>
                          <Badge className={getStatusColor(job.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span>{job.department}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>{job.type}</span>
                          <span>•</span>
                          <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {job.applications} applications
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {job.views} views
                          </span>
                          {job.salary && (
                            <span className="font-medium">
                              {job.salary.currency}{job.salary.min.toLocaleString()} - {job.salary.currency}{job.salary.max.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {jobPostings.length > 5 && (
                <Button variant="outline" className="w-full" onClick={() => navigate('/employer/jobs')}>
                  View All Jobs ({jobPostings.length})
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+2 this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">
                {stats.totalJobs > 0 ? Math.round((stats.activeJobs / stats.totalJobs) * 100) : 0}% of total
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+15 this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.profileViews}</p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+8% this month</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const additionalTabTriggers = (
    <>
      <TabsTrigger value="jobs">Job Management</TabsTrigger>
      <TabsTrigger value="company">Company Profile</TabsTrigger>
      <TabsTrigger value="applications">Applications</TabsTrigger>
    </>
  );

  const additionalTabsContent = (
    <>
      <TabsContent value="jobs" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Management</CardTitle>
            <CardDescription>Manage all your job postings in one place</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Job management content would go here */}
            <p className="text-center text-gray-500 py-8">
              Job management interface coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="company" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Profile Settings</CardTitle>
            <CardDescription>Update your company information and branding</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Company profile editing content would go here */}
            <p className="text-center text-gray-500 py-8">
              Company profile editor coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="applications" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Management</CardTitle>
            <CardDescription>Review and manage job applications</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Applications management content would go here */}
            <p className="text-center text-gray-500 py-8">
              Application management interface coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );

  return (
    <EnhancedProfile
      role="employer"
      customActions={customActions}
      roleSpecificContent={roleSpecificContent}
      additionalTabTriggers={additionalTabTriggers}
      additionalTabsContent={additionalTabsContent}
    />
  );
};