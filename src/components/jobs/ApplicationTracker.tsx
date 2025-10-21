import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  Eye, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Star,
  MessageSquare,
  Download,
  Calendar,
  Briefcase,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicant: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    location: string;
    experience: number;
    currentRole?: string;
  };
  appliedAt: string;
  status: 'applied' | 'screening' | 'interviewing' | 'assessment' | 'offer' | 'hired' | 'rejected';
  stage: string;
  score?: number;
  notes: Array<{
    id: string;
    content: string;
    createdBy: string;
    createdAt: string;
    type: 'note' | 'feedback' | 'decision';
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: 'resume' | 'cover_letter' | 'portfolio' | 'certificate' | 'other';
    url: string;
    uploadedAt: string;
  }>;
  interviews: Array<{
    id: string;
    type: 'phone' | 'video' | 'in_person' | 'technical';
    scheduledAt: string;
    interviewer: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
    feedback?: string;
    rating?: number;
  }>;
  assessments: Array<{
    id: string;
    name: string;
    type: 'technical' | 'personality' | 'skills' | 'cognitive';
    score?: number;
    maxScore: number;
    completedAt?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'expired';
  }>;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

interface JobStats {
  totalApplications: number;
  newApplications: number;
  inProgress: number;
  hired: number;
  rejected: number;
  averageTimeToHire: number;
  conversionRate: number;
}

interface ApplicationTrackerProps {
  applications: JobApplication[];
  stats: JobStats;
  onViewApplication: (id: string) => void;
  onUpdateStatus: (id: string, status: JobApplication['status'], stage: string) => void;
  onScheduleInterview: (applicationId: string) => void;
  onAddNote: (applicationId: string, note: string) => void;
  userRole: 'employer' | 'hr' | 'hiring_manager';
}

const STATUS_CONFIG = {
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-800', icon: User },
  screening: { label: 'Screening', color: 'bg-yellow-100 text-yellow-800', icon: Search },
  interviewing: { label: 'Interviewing', color: 'bg-purple-100 text-purple-800', icon: MessageSquare },
  assessment: { label: 'Assessment', color: 'bg-orange-100 text-orange-800', icon: Briefcase },
  offer: { label: 'Offer', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  hired: { label: 'Hired', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle }
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', color: 'bg-orange-100 text-orange-700' },
  high: { label: 'High', color: 'bg-red-100 text-red-700' }
};

export function ApplicationTracker({
  applications,
  stats,
  onViewApplication,
  onUpdateStatus,
  onScheduleInterview,
  onAddNote,
  userRole
}: ApplicationTrackerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('appliedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const uniqueJobs = useMemo(() => {
    const jobs = new Map();
    applications.forEach(app => {
      if (!jobs.has(app.jobId)) {
        jobs.set(app.jobId, { id: app.jobId, title: app.jobTitle });
      }
    });
    return Array.from(jobs.values());
  }, [applications]);

  const filteredApplications = useMemo(() => {
    let filtered = applications.filter(app => {
      const matchesSearch = searchTerm === '' || 
        app.applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || app.priority === priorityFilter;
      const matchesJob = jobFilter === 'all' || app.jobId === jobFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesJob;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof JobApplication];
      let bValue = b[sortBy as keyof JobApplication];
      
      if (sortBy === 'appliedAt') {
        aValue = new Date(a.appliedAt).getTime();
        bValue = new Date(b.appliedAt).getTime();
      } else if (sortBy === 'score') {
        aValue = a.score || 0;
        bValue = b.score || 0;
      } else if (sortBy === 'applicant.name') {
        aValue = a.applicant.name;
        bValue = b.applicant.name;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [applications, searchTerm, statusFilter, priorityFilter, jobFilter, sortBy, sortOrder]);

  const getApplicationProgress = (application: JobApplication) => {
    const statusOrder = ['applied', 'screening', 'interviewing', 'assessment', 'offer', 'hired'];
    const currentIndex = statusOrder.indexOf(application.status);
    const totalSteps = statusOrder.length - 1; // Excluding 'hired' from progress
    return Math.min((currentIndex / totalSteps) * 100, 100);
  };

  const getUrgentApplications = () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    return applications.filter(app => 
      app.status === 'applied' && new Date(app.appliedAt) < threeDaysAgo
    );
  };

  const urgentApplications = getUrgentApplications();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Tracker</h1>
          <p className="text-gray-500">Monitor and manage job applications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold">{stats.totalApplications}</p>
                {stats.newApplications > 0 && (
                  <p className="text-xs text-green-600">+{stats.newApplications} new</p>
                )}
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hired</p>
                <p className="text-2xl font-bold">{stats.hired}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Time to Hire</p>
                <p className="text-2xl font-bold">{stats.averageTimeToHire}d</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">{stats.conversionRate}% conversion</span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Alerts */}
      {urgentApplications.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Urgent Review Required ({urgentApplications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-3">
              The following applications have been waiting for more than 3 days:
            </p>
            <div className="space-y-2">
              {urgentApplications.slice(0, 3).map((app) => (
                <div key={app.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <span className="font-medium">{app.applicant.name}</span>
                    <span className="text-gray-600 ml-2">applied for {app.jobTitle}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewApplication(app.id)}
                  >
                    Review
                  </Button>
                </div>
              ))}
              {urgentApplications.length > 3 && (
                <p className="text-sm text-orange-600">
                  ...and {urgentApplications.length - 3} more
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by applicant name, job title, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {uniqueJobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appliedAt">Application Date</SelectItem>
                  <SelectItem value="applicant.name">Applicant Name</SelectItem>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Applications ({filteredApplications.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Job</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => {
                      const StatusIcon = STATUS_CONFIG[application.status].icon;
                      const progress = getApplicationProgress(application);
                      
                      return (
                        <TableRow key={application.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={application.applicant.avatar} />
                                <AvatarFallback>
                                  {application.applicant.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{application.applicant.name}</p>
                                <p className="text-sm text-gray-500">{application.applicant.email}</p>
                                <p className="text-xs text-gray-400">
                                  {application.applicant.experience}y exp • {application.applicant.location}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{application.jobTitle}</p>
                              <p className="text-sm text-gray-500">#{application.jobId}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(application.appliedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("px-2 py-1", STATUS_CONFIG[application.status].color)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {STATUS_CONFIG[application.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="w-20">
                              <Progress value={progress} className="h-2" />
                              <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {application.score ? (
                                <>
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span className="text-sm">{application.score}/100</span>
                                </>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("px-2 py-1", PRIORITY_CONFIG[application.priority].color)}>
                              {PRIORITY_CONFIG[application.priority].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onViewApplication(application.id)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              {userRole === 'hiring_manager' && application.status === 'screening' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onScheduleInterview(application.id)}
                                >
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Interview
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {filteredApplications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No applications found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const statusApplications = filteredApplications.filter(app => app.status === status);
              
              return (
                <Card key={status}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {React.createElement(config.icon, { className: "h-4 w-4" })}
                        <span className="font-medium">{config.label}</span>
                      </div>
                      <Badge variant="outline">{statusApplications.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {statusApplications.map((application) => (
                      <Card 
                        key={application.id} 
                        className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => onViewApplication(application.id)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={application.applicant.avatar} />
                            <AvatarFallback className="text-xs">
                              {application.applicant.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm truncate">
                            {application.applicant.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{application.jobTitle}</p>
                        
                        <div className="flex items-center justify-between">
                          <Badge className={cn("text-xs", PRIORITY_CONFIG[application.priority].color)}>
                            {PRIORITY_CONFIG[application.priority].label}
                          </Badge>
                          {application.score && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs">{application.score}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2">
                          <Progress value={getApplicationProgress(application)} className="h-1" />
                        </div>
                      </Card>
                    ))}
                    
                    {statusApplications.length === 0 && (
                      <div className="text-center py-4 text-gray-400">
                        <p className="text-sm">No applications</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ApplicationTracker;
