import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  Share2,
  Calendar,
  Users,
  Eye,
  Phone,
  Mail,
  ArrowLeft,
  Star,
  CheckCircle,
  Briefcase,
  Award,
  Globe,
  Heart,
  Bookmark,
  Send
} from 'lucide-react';
import { Job, JobApplication } from '@/features/job/types';
import { JobService } from '@/services/jobService';
import { useAuthContext } from '@/contexts/AuthContext';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    expectedSalary: '',
    availableFrom: ''
  });

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const data = await JobService.getJobById(id!);
      setJob(data);
    } catch (error) {
      console.error('Error loading job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !job) return;

    try {
      await JobService.applyToJob({
        jobId: job.id,
        employeeId: user.id, // This should be the employee ID
        employerId: job.employerId,
        coverLetter: applicationData.coverLetter,
        expectedSalary: applicationData.expectedSalary ? {
          min: parseInt(applicationData.expectedSalary),
          max: parseInt(applicationData.expectedSalary),
          currency: 'USD',
          period: 'yearly'
        } : undefined,
        availableFrom: applicationData.availableFrom,
        documents: [],
        status: 'pending'
      });
      setShowApplicationDialog(false);
      setApplicationData({ coverLetter: '', expectedSalary: '', availableFrom: '' });
      // Show success message
    } catch (error) {
      console.error('Error applying to job:', error);
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

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full_time': return 'bg-green-100 text-green-800';
      case 'part_time': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'freelance': return 'bg-orange-100 text-orange-800';
      case 'internship': return 'bg-pink-100 text-pink-800';
      case 'temporary': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkLocationColor = (location: string) => {
    switch (location) {
      case 'remote': return 'bg-green-100 text-green-800';
      case 'hybrid': return 'bg-blue-100 text-blue-800';
      case 'onsite': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobLevelColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'junior': return 'bg-blue-100 text-blue-800';
      case 'mid': return 'bg-purple-100 text-purple-800';
      case 'senior': return 'bg-orange-100 text-orange-800';
      case 'lead': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-indigo-100 text-indigo-800';
      case 'director': return 'bg-pink-100 text-pink-800';
      case 'executive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading job...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Job Not Found</h1>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/jobs')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={() => navigate('/jobs')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    {job.employer?.companyLogo ? (
                      <img
                        src={job.employer.companyLogo}
                        alt={job.employer.companyName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <Building className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
                    <h2 className="text-xl text-gray-700 mb-2">{job.employer?.companyName}</h2>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>
                        {job.location.city}, {job.location.state}, {job.location.country}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={getJobTypeColor(job.jobType)}>
                  {job.jobType.replace('_', ' ')}
                </Badge>
                <Badge className={getWorkLocationColor(job.workLocation)}>
                  {job.workLocation}
                </Badge>
                <Badge className={getJobLevelColor(job.jobLevel)}>
                  {job.jobLevel}
                </Badge>
                <Badge variant="outline">
                  {job.category}
                </Badge>
                {job.isPremium && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Premium
                  </Badge>
                )}
                {job.isFeatured && (
                  <Badge className="bg-blue-100 text-blue-800">
                    Featured
                  </Badge>
                )}
              </div>

              {job.salary && (
                <div className="flex items-center text-2xl font-bold text-red-600 mb-4">
                  <DollarSign className="h-6 w-6" />
                  {formatCurrency(job.salary.min, job.salary.currency)} - {formatCurrency(job.salary.max, job.salary.currency)}
                  <span className="text-sm text-gray-500 ml-2 font-normal">
                    per {job.salary.period}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{job.viewCount} views</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{job.applicationCount} applications</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Posted {formatTimeAgo(job.createdAt)}</span>
                  </div>
                </div>
                
                {job.employer?.isVerified && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>Verified Company</span>
                  </div>
                )}
              </div>

              {job.applicationDeadline && (
                <div className="flex items-center text-sm text-orange-600 bg-orange-50 p-2 rounded">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Application deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Details */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {job.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {job.responsibilities && job.responsibilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Key Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {job.responsibilities.map((responsibility, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="requirements" className="space-y-4">
              {job.requirements && job.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {job.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benefits" className="space-y-4">
              {job.benefits && job.benefits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Benefits & Perks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {job.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <Award className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="company" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>About {job.employer?.companyName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      {job.employer?.companyDescription}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Company Size</p>
                        <p className="capitalize">{job.employer?.companySize}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Industry</p>
                        <p>{job.employer?.industry}</p>
                      </div>
                      {job.employer?.establishedYear && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Founded</p>
                          <p>{job.employer.establishedYear}</p>
                        </div>
                      )}
                      {job.employer?.companyWebsite && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Website</p>
                          <a 
                            href={job.employer.companyWebsite} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            <Globe className="h-4 w-4 mr-1" />
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Section */}
          <Card>
            <CardContent className="p-6">
              <Button 
                className="w-full mb-4"
                onClick={() => setShowApplicationDialog(true)}
              >
                <Send className="mr-2 h-4 w-4" />
                Apply Now
              </Button>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p>Be among the first to apply</p>
                <p>{job.applicationCount} people have applied</p>
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          {job.employer && (
            <Card>
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      {job.employer.companyLogo ? (
                        <img 
                          src={job.employer.companyLogo} 
                          alt="Company"
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <Building className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{job.employer.companyName}</h4>
                      <p className="text-sm text-gray-600">{job.employer.industry}</p>
                      {job.employer.isVerified && (
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm">Verified</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Building className="mr-2 h-4 w-4" />
                      View Company Page
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1">
                        <Phone className="mr-2 h-4 w-4" />
                        Call
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Job Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Job Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Applications</span>
                  <span className="font-semibold">{job.applicationCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Views</span>
                  <span className="font-semibold">{job.viewCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Posted</span>
                  <span className="font-semibold">{formatTimeAgo(job.createdAt)}</span>
                </div>
                {job.applicationDeadline && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Deadline</span>
                    <span className="font-semibold text-orange-600">
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApplication} className="space-y-4">
            <div>
              <Label htmlFor="cover-letter">Cover Letter</Label>
              <Textarea
                id="cover-letter"
                value={applicationData.coverLetter}
                onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                placeholder="Tell us why you're interested in this position..."
                rows={6}
                required
              />
            </div>
            <div>
              <Label htmlFor="expected-salary">Expected Salary (Annual)</Label>
              <Input
                id="expected-salary"
                type="number"
                value={applicationData.expectedSalary}
                onChange={(e) => setApplicationData(prev => ({ ...prev, expectedSalary: e.target.value }))}
                placeholder="100000"
              />
            </div>
            <div>
              <Label htmlFor="available-from">Available From</Label>
              <Input
                id="available-from"
                type="date"
                value={applicationData.availableFrom}
                onChange={(e) => setApplicationData(prev => ({ ...prev, availableFrom: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowApplicationDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Submit Application
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobDetailPage;
