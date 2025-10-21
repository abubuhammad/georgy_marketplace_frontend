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
  Send,
  Calendar,
  Eye,
  Clock,
  Star,
  User,
  FileText,
  BookOpen,
  TrendingUp,
  Heart,
  MapPin,
  Building,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Search
} from 'lucide-react';

const JobSeekerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [dashboardData, setDashboardData] = useState({
    appliedJobs: 0,
    savedJobs: 0,
    interviewsScheduled: 0,
    profileViews: 0,
    responseRate: 0,
    averageResponseTime: 0,
    skillsCompleted: 0,
    recommendedJobs: 0
  });

  useEffect(() => {
    loadJobSeekerData();
  }, []);

  const loadJobSeekerData = async () => {
    // Mock data for development
    setDashboardData({
      appliedJobs: 23,
      savedJobs: 15,
      interviewsScheduled: 4,
      profileViews: 89,
      responseRate: 68,
      averageResponseTime: 5,
      skillsCompleted: 7,
      recommendedJobs: 12
    });
  };

  const applications = [
    { 
      id: '1', 
      company: 'TechCorp Nigeria', 
      position: 'Frontend Developer', 
      status: 'interview_scheduled', 
      appliedDate: '2024-01-10',
      interviewDate: '2024-01-18',
      salary: '₦450,000/month',
      location: 'Lagos, Nigeria'
    },
    { 
      id: '2', 
      company: 'Fintech Solutions', 
      position: 'Full Stack Developer', 
      status: 'under_review', 
      appliedDate: '2024-01-12',
      interviewDate: null,
      salary: '₦380,000/month',
      location: 'Abuja, Nigeria'
    },
    { 
      id: '3', 
      company: 'StartupHub', 
      position: 'React Developer', 
      status: 'rejected', 
      appliedDate: '2024-01-08',
      interviewDate: null,
      salary: '₦320,000/month',
      location: 'Remote'
    }
  ];

  const savedJobs = [
    { id: '1', company: 'Google Nigeria', position: 'Software Engineer', salary: '₦850,000/month', location: 'Lagos', posted: '2024-01-15' },
    { id: '2', company: 'Microsoft Nigeria', position: 'Cloud Engineer', salary: '₦750,000/month', location: 'Lagos', posted: '2024-01-14' },
    { id: '3', company: 'Meta', position: 'Frontend Engineer', salary: '₦680,000/month', location: 'Remote', posted: '2024-01-13' }
  ];

  const upcomingInterviews = [
    { company: 'TechCorp Nigeria', position: 'Frontend Developer', date: '2024-01-18', time: '10:00 AM', type: 'Technical' },
    { company: 'InnovateLabs', position: 'React Developer', date: '2024-01-19', time: '2:00 PM', type: 'HR Screening' },
    { company: 'DevStudio', position: 'UI Developer', date: '2024-01-20', time: '11:00 AM', type: 'Final Interview' }
  ];

  const skillProgress = [
    { skill: 'React.js', level: 85, courses: 3, certificates: 2 },
    { skill: 'TypeScript', level: 70, courses: 2, certificates: 1 },
    { skill: 'Node.js', level: 60, courses: 2, certificates: 1 },
    { skill: 'AWS', level: 45, courses: 1, certificates: 0 }
  ];

  const recommendedJobs = [
    { company: 'Tech Innovators', position: 'Senior React Developer', match: 95, salary: '₦520,000/month', location: 'Lagos' },
    { company: 'Digital Solutions', position: 'Frontend Engineer', match: 88, salary: '₦450,000/month', location: 'Abuja' },
    { company: 'CodeCraft', position: 'Full Stack Developer', match: 82, salary: '₦400,000/month', location: 'Remote' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Job Seeker Dashboard Header */}
      <EnhancedDashboardHeader
        title="Career Command Center"
        subtitle={`Welcome back, ${user?.firstName}! Find your dream job`}
        user={user}
        actions={[
          {
            label: 'Browse Jobs',
            icon: Search,
            onClick: () => navigate('/jobs'),
            variant: 'default'
          },
          {
            label: 'Update Resume',
            icon: FileText,
            onClick: () => navigate('/resume/upload'),
          },
          {
            label: 'View Profile',
            icon: User,
            onClick: () => navigate('/profile')
          }
        ]}
        notifications={dashboardData.interviewsScheduled}
        messages={5}
        stats={[
          {
            label: 'Applications',
            value: dashboardData.appliedJobs,
            trend: 'up'
          },
          {
            label: 'Saved Jobs',
            value: dashboardData.savedJobs,
            trend: 'neutral'
          },
          {
            label: 'Profile Views',
            value: dashboardData.profileViews,
            trend: 'up'
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
                  <p className="text-sm font-medium text-gray-600">Applications Sent</p>
                  <p className="text-2xl font-bold">{dashboardData.appliedJobs}</p>
                  <p className="text-xs text-blue-600">+3 this week</p>
                </div>
                <Send className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saved Jobs</p>
                  <p className="text-2xl font-bold">{dashboardData.savedJobs}</p>
                  <p className="text-xs text-purple-600">+2 new matches</p>
                </div>
                <Heart className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Interviews Scheduled</p>
                  <p className="text-2xl font-bold">{dashboardData.interviewsScheduled}</p>
                  <p className="text-xs text-green-600">This week</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Views</p>
                  <p className="text-2xl font-bold">{dashboardData.profileViews}</p>
                  <p className="text-xs text-orange-600">+12 this month</p>
                </div>
                <Eye className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="profile">Profile & Skills</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Applications */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Your latest job applications and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.slice(0, 3).map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Building className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="font-medium">{app.position}</p>
                            <p className="text-sm text-gray-500">{app.company}</p>
                            <p className="text-xs text-gray-500 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {app.location}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            app.status === 'interview_scheduled' ? 'default' :
                            app.status === 'under_review' ? 'secondary' : 'destructive'
                          }>
                            {app.status.replace('_', ' ')}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{app.appliedDate}</p>
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
                  <CardDescription>Your scheduled interviews</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingInterviews.map((interview, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-6 h-6 text-blue-500" />
                          <div>
                            <p className="font-medium">{interview.position}</p>
                            <p className="text-sm text-gray-500">{interview.company}</p>
                            <p className="text-xs text-blue-600">{interview.type}</p>
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

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Application Tracking</CardTitle>
                <CardDescription>Monitor the status of all your job applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{app.position}</h3>
                          <p className="text-sm text-gray-500">{app.company}</p>
                        </div>
                        <Badge variant={
                          app.status === 'interview_scheduled' ? 'default' :
                          app.status === 'under_review' ? 'secondary' : 'destructive'
                        }>
                          {app.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <p className="font-bold">{app.salary}</p>
                          <p className="text-sm text-gray-500">Salary</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold">{app.location}</p>
                          <p className="text-sm text-gray-500">Location</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold">{app.appliedDate}</p>
                          <p className="text-sm text-gray-500">Applied</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold">{app.interviewDate || 'TBD'}</p>
                          <p className="text-sm text-gray-500">Interview</p>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">View Job</Button>
                        <Button variant="outline" size="sm">Company Info</Button>
                        <Button size="sm">Track Status</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle>Saved Job Opportunities</CardTitle>
                <CardDescription>Jobs you've bookmarked for later application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{job.position}</h3>
                          <p className="text-sm text-gray-500">{job.company}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </p>
                        </div>
                        <Badge variant="outline">Saved</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="font-semibold text-green-600">{job.salary}</span>
                          <span className="text-sm text-gray-500">Posted: {job.posted}</span>
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">Remove</Button>
                          <Button size="sm">Apply Now</Button>
                        </div>
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
                <CardDescription>Prepare and manage your upcoming interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingInterviews.map((interview, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{interview.position}</h3>
                          <p className="text-sm text-gray-500">{interview.company}</p>
                          <p className="text-sm text-blue-600">{interview.type} Interview</p>
                        </div>
                        <Badge variant="secondary">Upcoming</Badge>
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
                          <Button variant="outline" size="sm">Company Research</Button>
                          <Button variant="outline" size="sm">Prepare</Button>
                          <Button size="sm">Join Interview</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Management</CardTitle>
                  <CardDescription>Keep your profile updated to attract employers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{user?.firstName} {user?.lastName}</h3>
                        <p className="text-gray-500">Frontend Developer</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">Profile Score: 85%</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <Button variant="outline">Update Resume</Button>
                      <Button variant="outline">Edit Portfolio</Button>
                      <Button variant="outline">Add Skills</Button>
                      <Button variant="outline">Update Experience</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skill Development</CardTitle>
                  <CardDescription>Track your learning progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {skillProgress.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{skill.skill}</span>
                          <span className="text-sm text-gray-500">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{skill.courses} courses completed</span>
                          <span>{skill.certificates} certificates earned</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Job Recommendations</CardTitle>
                <CardDescription>Personalized job matches based on your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendedJobs.map((job, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{job.position}</h3>
                          <p className="text-sm text-gray-500">{job.company}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="default">{job.match}% match</Badge>
                          <p className="text-sm text-green-600 font-medium mt-1">{job.salary}</p>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Heart className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button size="sm">Apply Now</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
