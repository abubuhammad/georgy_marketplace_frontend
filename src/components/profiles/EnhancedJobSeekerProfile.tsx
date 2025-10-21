import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnhancedProfile } from '../enhanced/EnhancedProfile';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  FileText, Briefcase, Search, Upload, Download, Eye, 
  Clock, CheckCircle, XCircle, AlertCircle, Star,
  MapPin, Calendar, Building2, DollarSign, 
  Plus, Edit, Trash2, BookOpen, Award, TrendingUp
} from 'lucide-react';

interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
  location: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}

interface Resume {
  id: string;
  filename: string;
  uploadDate: string;
  isDefault: boolean;
  fileUrl: string;
}

interface JobPreferences {
  desiredRoles: string[];
  preferredLocations: string[];
  salaryExpectation: {
    min: number;
    max: number;
    currency: string;
  };
  jobTypes: string[];
  remoteWork: boolean;
  availableFrom: string;
}

interface ProfessionalProfile {
  title: string;
  summary: string;
  experience: string;
  skills: string[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  certifications: string[];
}

export const EnhancedJobSeekerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobPreferences, setJobPreferences] = useState<JobPreferences>({
    desiredRoles: [],
    preferredLocations: [],
    salaryExpectation: { min: 0, max: 0, currency: 'USD' },
    jobTypes: [],
    remoteWork: false,
    availableFrom: ''
  });
  
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfile>({
    title: '',
    summary: '',
    experience: '',
    skills: [],
    education: [],
    certifications: []
  });

  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    interviews: 0,
    profileViews: 0,
    resumeViews: 0
  });

  useEffect(() => {
    loadJobSeekerData();
  }, []);

  const loadJobSeekerData = async () => {
    try {
      setLoading(true);
      
      // Load job applications
      const applicationsResponse = await apiClient.get('/api/job-seeker/applications');
      if (applicationsResponse.data) {
        setApplications(applicationsResponse.data);
        
        // Calculate stats
        const totalApplications = applicationsResponse.data.length;
        const pendingApplications = applicationsResponse.data.filter((app: JobApplication) => 
          app.status === 'pending' || app.status === 'reviewing'
        ).length;
        const interviews = applicationsResponse.data.filter((app: JobApplication) => 
          app.status === 'interview'
        ).length;
        
        setStats(prev => ({
          ...prev,
          totalApplications,
          pendingApplications,
          interviews
        }));
      }
      
      // Load resumes
      const resumesResponse = await apiClient.get('/api/job-seeker/resumes');
      if (resumesResponse.data) {
        setResumes(resumesResponse.data);
      }
      
      // Load job preferences
      const preferencesResponse = await apiClient.get('/api/job-seeker/preferences');
      if (preferencesResponse.data) {
        setJobPreferences(preferencesResponse.data);
      }
      
      // Load professional profile
      const profileResponse = await apiClient.get('/api/job-seeker/professional-profile');
      if (profileResponse.data) {
        setProfessionalProfile(profileResponse.data);
      }
      
    } catch (error) {
      console.error('Error loading job seeker data:', error);
      toast.error('Failed to load job seeker data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'interview': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending': return Clock;
      case 'reviewing': return Eye;
      case 'interview': return Star;
      case 'accepted': return CheckCircle;
      case 'rejected': return XCircle;
      default: return AlertCircle;
    }
  };

  const handleResumeUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await apiClient.post('/api/job-seeker/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.success) {
        toast.success('Resume uploaded successfully!');
        loadJobSeekerData(); // Reload data
      } else {
        toast.error('Failed to upload resume');
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      toast.error('Failed to upload resume');
    }
  };

  const customActions = [
    {
      label: 'Upload Resume',
      icon: Upload,
      onClick: () => document.getElementById('resume-upload')?.click(),
      variant: 'default' as const
    },
    {
      label: 'Search Jobs',
      icon: Search,
      onClick: () => navigate('/jobs/search')
    },
    {
      label: 'My Applications',
      icon: Briefcase,
      onClick: () => navigate('/job-seeker/applications')
    }
  ];

  const roleSpecificContent = (
    <div className="space-y-6">
      {/* Professional Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Professional Profile
          </CardTitle>
          <CardDescription>
            Showcase your professional background and expertise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                value={professionalProfile.title}
                onChange={(e) => setProfessionalProfile(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
            
            <div>
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                value={professionalProfile.summary}
                onChange={(e) => setProfessionalProfile(prev => ({
                  ...prev,
                  summary: e.target.value
                }))}
                placeholder="Brief summary of your experience and goals..."
                rows={4}
              />
            </div>
            
            {professionalProfile.skills.length > 0 && (
              <div>
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {professionalProfile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resume Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Resume Management
            </CardTitle>
            <CardDescription>
              Upload and manage your resumes
            </CardDescription>
          </div>
          <Button onClick={() => document.getElementById('resume-upload')?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Resume
          </Button>
        </CardHeader>
        <CardContent>
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleResumeUpload(file);
              }
            }}
          />
          
          {resumes.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes uploaded</h3>
              <p className="text-gray-500 mb-4">Upload your first resume to start applying for jobs.</p>
              <Button onClick={() => document.getElementById('resume-upload')?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Resume
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div key={resume.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{resume.filename}</h4>
                      <p className="text-sm text-gray-500">
                        Uploaded {new Date(resume.uploadDate).toLocaleDateString()}
                        {resume.isDefault && <Badge variant="outline" className="ml-2">Default</Badge>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Recent Applications
            </CardTitle>
            <CardDescription>
              Track your job applications and their status
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/jobs/search')}>
            <Search className="w-4 h-4 mr-2" />
            Find Jobs
          </Button>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-500 mb-4">Start your job search and apply to positions that interest you.</p>
              <Button onClick={() => navigate('/jobs/search')}>
                <Search className="w-4 h-4 mr-2" />
                Browse Jobs
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.slice(0, 5).map((application) => {
                const StatusIcon = getStatusIcon(application.status);
                return (
                  <div key={application.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{application.jobTitle}</h3>
                          <Badge className={getStatusColor(application.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {application.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {application.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {application.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Applied {new Date(application.appliedDate).toLocaleDateString()}
                          </span>
                        </div>
                        {application.salary && (
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <DollarSign className="w-4 h-4" />
                            {application.salary.currency}{application.salary.min.toLocaleString()} - {application.salary.currency}{application.salary.max.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })}
              
              {applications.length > 5 && (
                <Button variant="outline" className="w-full" onClick={() => navigate('/job-seeker/applications')}>
                  View All Applications ({applications.length})
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
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+5 this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-500">
                {stats.totalApplications > 0 ? Math.round((stats.pendingApplications / stats.totalApplications) * 100) : 0}% of total
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.interviews}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+2 this week</span>
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
              <div className="p-2 bg-green-50 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Job Preferences
          </CardTitle>
          <CardDescription>
            Set your job search preferences to get better matches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {jobPreferences.desiredRoles.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Desired Roles</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {jobPreferences.desiredRoles.map((role, index) => (
                  <Badge key={index} variant="outline">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {jobPreferences.preferredLocations.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Preferred Locations</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {jobPreferences.preferredLocations.map((location, index) => (
                  <Badge key={index} variant="outline">
                    <MapPin className="w-3 h-3 mr-1" />
                    {location}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <Button variant="outline" onClick={() => navigate('/job-seeker/preferences')}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const additionalTabTriggers = (
    <>
      <TabsTrigger value="applications">Applications</TabsTrigger>
      <TabsTrigger value="resumes">Resumes</TabsTrigger>
      <TabsTrigger value="preferences">Job Preferences</TabsTrigger>
    </>
  );

  const additionalTabsContent = (
    <>
      <TabsContent value="applications" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Applications</CardTitle>
            <CardDescription>View and manage all your job applications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Detailed application management coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="resumes" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Resume Management</CardTitle>
            <CardDescription>Manage your uploaded resumes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Advanced resume management coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="preferences" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Search Preferences</CardTitle>
            <CardDescription>Configure your job search criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Job preference settings coming soon...
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );

  return (
    <EnhancedProfile
      role="job_seeker"
      customActions={customActions}
      roleSpecificContent={roleSpecificContent}
      additionalTabTriggers={additionalTabTriggers}
      additionalTabsContent={additionalTabsContent}
    />
  );
};