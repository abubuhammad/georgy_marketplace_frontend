import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedDashboardHeader } from '@/components/enhanced/EnhancedDashboardHeader';
import { 
  Briefcase,
  Users,
  TrendingUp,
  Calendar,
  Eye,
  Clock,
  UserCheck,
  Star,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  PieChart,
  Filter,
  Search
} from 'lucide-react';

const EmployerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [dashboardData, setDashboardData] = useState({
    activeJobs: 0,
    totalApplications: 0,
    scheduledInterviews: 0,
    hiredCandidates: 0,
    totalViews: 0,
    responseRate: 0,
    avgTimeToHire: 0,
    teamSize: 0
  });

  useEffect(() => {
    loadEmployerData();
  }, []);

  const loadEmployerData = async () => {
    // Mock data for development
    setDashboardData({
      activeJobs: 8,
      totalApplications: 156,
      scheduledInterviews: 12,
      hiredCandidates: 5,
      totalViews: 2340,
      responseRate: 78,
      avgTimeToHire: 21,
      teamSize: 23
    });
  };

  const jobPostings = [
    { 
      id: '1', 
      title: 'Senior Software Engineer', 
      department: 'Engineering', 
      status: 'active', 
      applications: 45, 
      views: 320,
      postedDate: '2024-01-10',
      deadline: '2024-02-10'
    },
    { 
      id: '2', 
      title: 'Product Manager', 
      department: 'Product', 
      status: 'active', 
      applications: 32, 
      views: 280,
      postedDate: '2024-01-12',
      deadline: '2024-02-12'
    },
    { 
      id: '3', 
      title: 'UX Designer', 
      department: 'Design', 
      status: 'interviewing', 
      applications: 28, 
      views: 195,
      postedDate: '2024-01-05',
      deadline: '2024-02-05'
    }
  ];

  const candidates = [
    { 
      name: 'Sarah Johnson', 
      position: 'Senior Software Engineer', 
      stage: 'interview_scheduled', 
      experience: '5+ years',
      rating: 4.8,
      appliedDate: '2024-01-14',
      interviewDate: '2024-01-18'
    },
    { 
      name: 'Michael Chen', 
      position: 'Product Manager', 
      stage: 'under_review', 
      experience: '7+ years',
      rating: 4.6,
      appliedDate: '2024-01-13',
      interviewDate: null
    },
    { 
      name: 'Emily Davis', 
      position: 'UX Designer', 
      stage: 'hired', 
      experience: '4+ years',
      rating: 4.9,
      appliedDate: '2024-01-08',
      startDate: '2024-02-01'
    }
  ];

  const upcomingInterviews = [
    { candidate: 'Sarah Johnson', position: 'Senior Software Engineer', date: '2024-01-18', time: '10:00 AM', type: 'Technical' },
    { candidate: 'David Wilson', position: 'Product Manager', date: '2024-01-18', time: '2:00 PM', type: 'Panel' },
    { candidate: 'Lisa Anderson', position: 'UX Designer', date: '2024-01-19', time: '11:00 AM', type: 'Portfolio Review' }
  ];

  const teamMembers = [
    { name: 'John Doe', department: 'Engineering', position: 'Team Lead', status: 'active', startDate: '2023-06-15' },
    { name: 'Jane Smith', department: 'Product', position: 'Senior PM', status: 'onboarding', startDate: '2024-01-15' },
    { name: 'Mike Johnson', department: 'Design', position: 'Senior Designer', status: 'active', startDate: '2023-09-20' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Employer Dashboard Header */}
      <EnhancedDashboardHeader
        title="Talent Command Center"
        subtitle={`Welcome, ${user?.firstName}! Build your dream team`}
        user={user}
        actions={[
          {
            label: 'Post New Job',
            icon: Briefcase,
            onClick: () => navigate('/jobs/post'),
            variant: 'default'
          },
          {
            label: 'Schedule Interview',
            icon: Calendar,
            onClick: () => navigate('/interviews/schedule')
          },
          {
            label: 'View Analytics',
            icon: PieChart,
            onClick: () => navigate('/employer/analytics')
          }
        ]}
        notifications={dashboardData.scheduledInterviews}
        messages={dashboardData.totalApplications}
        stats={[
          {
            label: 'Active Jobs',
            value: dashboardData.activeJobs,
            trend: 'up'
          },
          {
            label: 'Applications',
            value: dashboardData.totalApplications,
            trend: 'up'
          },
          {
            label: 'Team Size',
            value: dashboardData.teamSize,
            trend: 'neutral'
          }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Job Postings</p>
                  <p className="text-2xl font-bold">{dashboardData.activeJobs}</p>
                  <p className="text-xs text-blue-600">+2 this week</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold">{dashboardData.totalApplications}</p>
                  <p className="text-xs text-green-600">+15 new today</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled Interviews</p>
                  <p className="text-2xl font-bold">{dashboardData.scheduledInterviews}</p>
                  <p className="text-xs text-purple-600">This week</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Hires</p>
                  <p className="text-2xl font-bold">{dashboardData.hiredCandidates}</p>
                  <p className="text-xs text-orange-600">This quarter</p>
                </div>
                <UserCheck className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Job Postings */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Job Postings</CardTitle>
                  <CardDescription>Your latest job openings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobPostings.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Briefcase className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="font-medium">{job.title}</p>
                            <p className="text-sm text-gray-500">{job.department}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500 flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {job.views}
                              </span>
                              <span className="text-xs text-gray-500">
                                {job.applications} applications
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">Deadline: {job.deadline}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Interviews */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Interviews</CardTitle>
                  <CardDescription>Scheduled candidate interviews</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingInterviews.map((interview, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-6 h-6 text-blue-500" />
                          <div>
                            <p className="font-medium">{interview.candidate}</p>
                            <p className="text-sm text-gray-500">{interview.position}</p>
                            <p className="text-xs text-gray-500">{interview.type} Interview</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{interview.date}</p>
                          <p className="text-sm text-gray-500">{interview.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Job Posting Management</CardTitle>
                <CardDescription>Manage all your job listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobPostings.map((job) => (
                    <div key={job.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{job.title}</h3>
                          <p className="text-sm text-gray-500">{job.department} Department</p>
                        </div>
                        <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{job.applications}</p>
                          <p className="text-sm text-gray-500">Applications</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{job.views}</p>
                          <p className="text-sm text-gray-500">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{job.postedDate}</p>
                          <p className="text-sm text-gray-500">Posted</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{job.deadline}</p>
                          <p className="text-sm text-gray-500">Deadline</p>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">View Applications</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button size="sm">Manage</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <CardTitle>Candidate Pipeline</CardTitle>
                <CardDescription>Track candidates through the hiring process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidates.map((candidate, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{candidate.name}</h3>
                            <p className="text-sm text-gray-500">{candidate.position}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm text-gray-600">{candidate.rating}</span>
                              <span className="text-sm text-gray-500">• {candidate.experience}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={
                          candidate.stage === 'hired' ? 'default' :
                          candidate.stage === 'interview_scheduled' ? 'secondary' : 'outline'
                        }>
                          {candidate.stage.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Applied Date</p>
                          <p className="font-medium">{candidate.appliedDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            {candidate.stage === 'hired' ? 'Start Date' : 'Interview Date'}
                          </p>
                          <p className="font-medium">
                            {candidate.stage === 'hired' ? candidate.startDate : candidate.interviewDate || 'TBD'}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-1" />
                          Resume
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm">View Profile</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interviews">
            <Card>
              <CardHeader>
                <CardTitle>Interview Management</CardTitle>
                <CardDescription>Schedule and manage candidate interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingInterviews.map((interview, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{interview.candidate}</h3>
                          <p className="text-sm text-gray-500">{interview.position}</p>
                          <p className="text-sm text-blue-600">{interview.type} Interview</p>
                        </div>
                        <Badge variant="secondary">Scheduled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {interview.date}
                          </span>
                          <span className="text-sm text-gray-600 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {interview.time}
                          </span>
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">Reschedule</Button>
                          <Button variant="outline" size="sm">
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                          </Button>
                          <Button size="sm">Join Meeting</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Manage your current team members and onboarding</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{member.name}</h3>
                            <p className="text-sm text-gray-500">{member.position}</p>
                            <p className="text-sm text-gray-500">{member.department} Department</p>
                          </div>
                        </div>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">Start Date: {member.startDate}</span>
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                          <Button size="sm">View Profile</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recruitment Analytics</CardTitle>
                  <CardDescription>Hiring performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Recruitment analytics chart would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Time to Hire</span>
                      <span className="font-semibold">{dashboardData.avgTimeToHire} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Application Response Rate</span>
                      <span className="font-semibold">{dashboardData.responseRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Interview Success Rate</span>
                      <span className="font-semibold">65%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Team Size</span>
                      <span className="font-semibold">{dashboardData.teamSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Positions to Fill</span>
                      <span className="font-semibold">{dashboardData.activeJobs}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmployerDashboard;
