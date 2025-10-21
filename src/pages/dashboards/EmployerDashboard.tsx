import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserDropdown } from '@/components/ui/user-dropdown';
import {
  Briefcase,
  Users,
  Eye,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  ShoppingCart,
  FileText,
  MessageSquare,
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  Filter,
  Search,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const EmployerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { itemCount } = useCart();
  const [activeTab, setActiveTab] = useState('overview');

  const mockStats = {
    totalJobs: 23,
    activeJobs: 18,
    totalApplications: 387,
    newApplications: 12,
    shortlisted: 45,
    hired: 8,
    averageResponseTime: 2.5,
    completionRate: 85
  };

  const mockJobs = [
    {
      id: '1',
      title: 'Senior React Developer',
      department: 'Engineering',
      type: 'Full-time',
      location: 'Lagos, Nigeria',
      salary: '₦8,000,000 - ₦12,000,000',
      applications: 45,
      newApplications: 3,
      status: 'Active',
      datePosted: '2024-01-15',
      deadline: '2024-02-15',
      experience: '5+ years',
      remote: true
    },
    {
      id: '2',
      title: 'Product Manager',
      department: 'Product',
      type: 'Full-time',
      location: 'Abuja, Nigeria',
      salary: '₦6,000,000 - ₦10,000,000',
      applications: 67,
      newApplications: 8,
      status: 'Active',
      datePosted: '2024-01-12',
      deadline: '2024-02-12',
      experience: '3+ years',
      remote: false
    },
    {
      id: '3',
      title: 'Marketing Specialist',
      department: 'Marketing',
      type: 'Contract',
      location: 'Remote',
      salary: '₦3,000,000 - ₦5,000,000',
      applications: 89,
      newApplications: 1,
      status: 'Closed',
      datePosted: '2024-01-08',
      deadline: '2024-01-25',
      experience: '2+ years',
      remote: true
    }
  ];

  const mockApplications = [
    {
      id: '1',
      jobTitle: 'Senior React Developer',
      candidate: {
        name: 'John Adebayo',
        email: 'john.adebayo@email.com',
        phone: '+234-801-234-5678',
        location: 'Lagos, Nigeria',
        experience: '6 years',
        education: 'Computer Science, University of Lagos',
        skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
        avatar: '/api/placeholder/50/50'
      },
      status: 'New',
      appliedDate: '2024-01-18',
      resumeUrl: '/resumes/john-adebayo.pdf',
      coverLetter: 'I am excited to apply for the Senior React Developer position...',
      rating: null
    },
    {
      id: '2',
      jobTitle: 'Product Manager',
      candidate: {
        name: 'Sarah Okonkwo',
        email: 'sarah.okonkwo@email.com',
        phone: '+234-802-345-6789',
        location: 'Abuja, Nigeria',
        experience: '4 years',
        education: 'Business Administration, UNILAG',
        skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research'],
        avatar: '/api/placeholder/50/50'
      },
      status: 'Shortlisted',
      appliedDate: '2024-01-16',
      resumeUrl: '/resumes/sarah-okonkwo.pdf',
      coverLetter: 'With my background in product management and passion for technology...',
      rating: 4.5
    },
    {
      id: '3',
      jobTitle: 'Senior React Developer',
      candidate: {
        name: 'David Chen',
        email: 'david.chen@email.com',
        phone: '+234-803-456-7890',
        location: 'Port Harcourt, Nigeria',
        experience: '7 years',
        education: 'Software Engineering, University of Port Harcourt',
        skills: ['React', 'Next.js', 'GraphQL', 'AWS'],
        avatar: '/api/placeholder/50/50'
      },
      status: 'Interview Scheduled',
      appliedDate: '2024-01-14',
      resumeUrl: '/resumes/david-chen.pdf',
      coverLetter: 'I have been following your company\'s growth and would love to contribute...',
      rating: 4.8,
      interviewDate: '2024-01-22',
      interviewTime: '2:00 PM'
    }
  ];

  const mockInterviews = [
    {
      id: '1',
      jobTitle: 'Senior React Developer',
      candidate: 'David Chen',
      date: '2024-01-22',
      time: '2:00 PM',
      type: 'Technical Interview',
      interviewer: 'Tech Lead',
      status: 'Scheduled',
      meetingLink: 'https://meet.company.com/interview-123'
    },
    {
      id: '2',
      jobTitle: 'Product Manager',
      candidate: 'Sarah Okonkwo',
      date: '2024-01-23',
      time: '10:00 AM',
      type: 'Final Interview',
      interviewer: 'VP Product',
      status: 'Scheduled',
      meetingLink: 'https://meet.company.com/interview-456'
    }
  ];

  if (!user || !['employer', 'admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="text-center">
            <Briefcase className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You need employer privileges to access this dashboard</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-red-600 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">Georgy Marketplace Jobs</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/jobs/post')}>
                <Plus className="w-4 h-4 mr-1" />
                Post Job
              </Button>
              <Button variant="outline" size="sm" className="relative" onClick={() => navigate('/cart')}>
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                    {itemCount}
                  </Badge>
                )}
              </Button>
              <UserDropdown user={user} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
          <p className="text-gray-600">Manage job postings and track recruitment progress</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                      <p className="text-2xl font-bold">{mockStats.activeJobs}</p>
                      <p className="text-sm text-green-600">+3 this week</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">New Applications</p>
                      <p className="text-2xl font-bold">{mockStats.newApplications}</p>
                      <p className="text-sm text-green-600">Today</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                      <p className="text-2xl font-bold">{mockStats.shortlisted}</p>
                      <p className="text-sm text-blue-600">Candidates</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Hired</p>
                      <p className="text-2xl font-bold">{mockStats.hired}</p>
                      <p className="text-sm text-green-600">This month</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button className="h-20 flex flex-col items-center justify-center" onClick={() => navigate('/jobs/post')}>
                    <Plus className="w-6 h-6 mb-2" />
                    Post New Job
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Users className="w-6 h-6 mb-2" />
                    Review Applications
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Calendar className="w-6 h-6 mb-2" />
                    Schedule Interview
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Download className="w-6 h-6 mb-2" />
                    Export Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockApplications.slice(0, 3).map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={application.candidate.avatar}
                            alt={application.candidate.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <h3 className="font-medium text-sm">{application.candidate.name}</h3>
                            <p className="text-sm text-gray-600">{application.jobTitle}</p>
                            <p className="text-xs text-gray-500">{application.appliedDate}</p>
                          </div>
                        </div>
                        <Badge variant={application.status === 'New' ? 'destructive' : 'default'}>
                          {application.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Interviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockInterviews.map((interview) => (
                      <div key={interview.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-sm">{interview.candidate}</h3>
                          <p className="text-sm text-gray-600">{interview.jobTitle}</p>
                          <p className="text-xs text-gray-500">
                            {interview.date} at {interview.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="default">{interview.type}</Badge>
                          <p className="text-xs text-gray-500 mt-1">{interview.interviewer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Job Postings</h2>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button onClick={() => navigate('/jobs/post')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Post Job
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {mockJobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-semibold">{job.title}</h3>
                          <Badge variant={job.status === 'Active' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                          {job.remote && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Remote
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Briefcase className="w-4 h-4 mr-2" />
                            {job.department}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {job.location}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {job.salary}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {job.experience}
                          </div>
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span>Posted: {job.datePosted}</span>
                          <span>Deadline: {job.deadline}</span>
                          <span>Applications: {job.applications}</span>
                          {job.newApplications > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {job.newApplications} new
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Users className="w-4 h-4 mr-1" />
                          Applications ({job.applications})
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Job Applications</h2>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {mockApplications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={application.candidate.avatar}
                        alt={application.candidate.name}
                        className="w-16 h-16 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold">{application.candidate.name}</h3>
                            <p className="text-gray-600">{application.jobTitle}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-1" />
                                {application.candidate.email}
                              </div>
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                {application.candidate.phone}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {application.candidate.location}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={application.status === 'New' ? 'destructive' : 'default'}>
                              {application.status}
                            </Badge>
                            {application.rating && (
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                <span className="text-sm">{application.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center space-x-4 text-sm">
                            <span><strong>Experience:</strong> {application.candidate.experience}</span>
                            <span><strong>Education:</strong> {application.candidate.education}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-sm"><strong>Skills:</strong> </span>
                            {application.candidate.skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="mr-1 mb-1">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 text-sm">{application.coverLetter}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Applied: {application.appliedDate}</span>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <FileText className="w-4 h-4 mr-1" />
                              View Resume
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Message
                            </Button>
                            <Button variant="outline" size="sm">
                              <Calendar className="w-4 h-4 mr-1" />
                              Schedule Interview
                            </Button>
                            <Button size="sm">
                              <Star className="w-4 h-4 mr-1" />
                              Shortlist
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="interviews" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Interview Schedule</h2>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {mockInterviews.map((interview) => (
                    <div key={interview.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{interview.candidate}</h3>
                          <p className="text-gray-600">{interview.jobTitle}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {interview.date} at {interview.time}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {interview.interviewer}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="default">{interview.type}</Badge>
                          <Badge variant={interview.status === 'Scheduled' ? 'default' : 'secondary'}>
                            {interview.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Join Meeting
                        </Button>
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                        <Button variant="outline" size="sm">
                          Send Reminder
                        </Button>
                        <Button variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Recruitment Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Completion Rate</h3>
                  <p className="text-2xl font-bold">{mockStats.completionRate}%</p>
                  <p className="text-sm text-gray-600">Successful hires</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Avg. Response Time</h3>
                  <p className="text-2xl font-bold">{mockStats.averageResponseTime} days</p>
                  <p className="text-sm text-gray-600">To applications</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Application Rate</h3>
                  <p className="text-2xl font-bold">16.8</p>
                  <p className="text-sm text-gray-600">Applications per job</p>
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
