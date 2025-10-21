import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase, 
  Send, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Plus, 
  Edit3,
  Eye,
  MapPin,
  DollarSign,
  Clock,
  Star,
  MessageCircle,
  Building,
  User,
  Award,
  BookOpen
} from 'lucide-react';
import { Employee, JobApplication, Interview, EmployeeAnalytics } from '@/features/job/types';
import { JobService } from '@/services/jobService';
import { useAuthContext } from '@/contexts/AuthContext';

interface EmployeeDashboardProps {
  employee: Employee;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ employee }) => {
  const { user } = useAuthContext();
  const [analytics, setAnalytics] = useState<EmployeeAnalytics>({
    totalApplications: 0,
    totalInterviews: 0,
    totalOffers: 0,
    responseRate: 0,
    interviewRate: 0,
    offerRate: 0,
    applicationsByStatus: {},
    applicationTrends: [],
    topCompanies: [],
  });
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [employee.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load analytics
      const analyticsData = await JobService.getEmployeeAnalytics(employee.id);
      setAnalytics(analyticsData);

      // Load applications
      const applicationsData = await JobService.getApplicationsByEmployee(employee.id);
      setApplications(applicationsData);

      // Load interviews
      const interviewsData = await JobService.getInterviewsByEmployee(employee.id);
      setInterviews(interviewsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-purple-100 text-purple-800';
      case 'interviewed': return 'bg-indigo-100 text-indigo-800';
      case 'offered': return 'bg-green-100 text-green-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full_time': return 'bg-green-100 text-green-800';
      case 'part_time': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'freelance': return 'bg-orange-100 text-orange-800';
      case 'internship': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProfileCompleteness = () => {
    let score = 0;
    const fields = [
      employee.title,
      employee.summary,
      employee.skills?.length > 0,
      employee.experience?.length > 0,
      employee.education?.length > 0,
      employee.documents?.length > 0,
      employee.portfolioUrl,
      employee.linkedinUrl
    ];
    
    fields.forEach(field => {
      if (field) score += 12.5; // 100 / 8 fields
    });
    
    return Math.round(score);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Employee Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {employee.user?.firstName} {employee.user?.lastName}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {employee.isVerified && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Verified Profile
            </Badge>
          )}
          {employee.isActivelyLooking && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Open to Work
            </Badge>
          )}
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Find Jobs
          </Button>
        </div>
      </div>

      {/* Profile Completeness */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Profile Completeness</p>
              <p className="text-xs text-gray-600">Complete your profile to get better job matches</p>
            </div>
            <div className="flex items-center space-x-2">
              <Progress value={getProfileCompleteness()} className="w-24" />
              <span className="text-sm font-medium">{getProfileCompleteness()}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              {applications.filter(a => a.status === 'pending').length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalInterviews}</div>
            <p className="text-xs text-muted-foreground">
              {interviews.filter(i => i.status === 'scheduled').length} scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Offers</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOffers}</div>
            <p className="text-xs text-muted-foreground">
              {applications.filter(a => a.status === 'offered').length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analytics.responseRate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Interview rate: {(analytics.interviewRate * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Applications</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Apply to Jobs
            </Button>
          </div>
          
          {applications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Send className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                <p className="text-gray-600 mb-4">Start applying to jobs that match your skills and interests.</p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Find Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {application.employer?.companyLogo ? (
                            <img 
                              src={application.employer.companyLogo} 
                              alt="Company"
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <Building className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold">{application.job?.title}</h3>
                            <Badge className={getStatusColor(application.status)}>
                              {application.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-1">{application.employer?.companyName}</p>
                          <div className="flex items-center text-sm text-gray-600 space-x-4 mb-2">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {application.job?.location?.city}, {application.job?.location?.state}
                            </div>
                            <Badge className={getJobTypeColor(application.job?.jobType || '')}>
                              {application.job?.jobType?.replace('_', ' ')}
                            </Badge>
                            <div className="flex items-center">
                              <Badge variant="outline">
                                {application.job?.workLocation}
                              </Badge>
                            </div>
                          </div>
                          {application.job?.salary && (
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span>
                                {formatCurrency(application.job.salary.min, application.job.salary.currency)} - {formatCurrency(application.job.salary.max, application.job.salary.currency)}
                              </span>
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            Applied {formatDate(application.appliedAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="interviews" className="space-y-4">
          <h2 className="text-xl font-semibold">My Interviews</h2>
          
          {interviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No interviews scheduled</h3>
                <p className="text-gray-600">Interviews will appear here when employers schedule them with you.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <Card key={interview.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {interview.job?.employer?.companyLogo ? (
                            <img 
                              src={interview.job.employer.companyLogo} 
                              alt="Company"
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <Building className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{interview.job?.title}</h3>
                            <Badge className={getStatusColor(interview.status)}>
                              {interview.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{interview.job?.employer?.companyName}</p>
                          <div className="flex items-center text-sm text-gray-600 space-x-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(interview.scheduledAt)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {interview.durationMinutes} minutes
                            </div>
                            <Badge variant="outline">
                              {interview.interviewType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Join Meeting
                        </Button>
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Profile Overview</h2>
            <Button>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Title</p>
                    <p>{employee.title || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Location</p>
                    <p>{employee.location?.city}, {employee.location?.state}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Work Preference</p>
                    <Badge variant="outline">{employee.workPreference}</Badge>
                  </div>
                  {employee.expectedSalary && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Expected Salary</p>
                      <p>
                        {formatCurrency(employee.expectedSalary.min, employee.expectedSalary.currency)} - {formatCurrency(employee.expectedSalary.max, employee.expectedSalary.currency)} per {employee.expectedSalary.period}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {employee.skills?.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rating</p>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>{employee.rating.toFixed(1)}</span>
                      <span className="text-sm text-gray-600 ml-1">
                        ({employee.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                {employee.experience?.length > 0 ? (
                  <div className="space-y-3">
                    {employee.experience.slice(0, 3).map((exp, index) => (
                      <div key={index}>
                        <p className="font-medium">{exp.jobTitle}</p>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(exp.startDate)} - {exp.isCurrentJob ? 'Present' : formatDate(exp.endDate!)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No experience added yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                {employee.education?.length > 0 ? (
                  <div className="space-y-3">
                    {employee.education.slice(0, 3).map((edu, index) => (
                      <div key={index}>
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(edu.startDate)} - {edu.isCurrentlyStudying ? 'Present' : formatDate(edu.endDate!)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No education added yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-semibold">Career Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(analytics.applicationsByStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Response Rate</span>
                    <span className="font-semibold">{(analytics.responseRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Interview Rate</span>
                    <span className="font-semibold">{(analytics.interviewRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Offer Rate</span>
                    <span className="font-semibold">{(analytics.offerRate * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
