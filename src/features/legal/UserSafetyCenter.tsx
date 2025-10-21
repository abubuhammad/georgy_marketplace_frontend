import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Eye,
  User,
  Phone,
  Mail,
  FileText,
  Camera,
  CreditCard,
  Building,
  Globe,
  Star,
  TrendingUp,
  Users,
  Flag,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { UserVerification, SafetyReport, RiskAssessment, SafetyMeasure } from './types';
import { legalService } from '@/services/legalService';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const UserSafetyCenter: React.FC = () => {
  const { user } = useAuthContext();
  const [verifications, setVerifications] = useState<UserVerification[]>([]);
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [safetyMeasures, setSafetyMeasures] = useState<SafetyMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showReportDialog, setShowReportDialog] = useState(false);

  const [newReport, setNewReport] = useState({
    reportType: 'fraud' as const,
    reportedUser: '',
    reportedProduct: '',
    description: '',
    evidence: [] as File[]
  });

  useEffect(() => {
    loadSafetyData();
  }, []);

  const loadSafetyData = async () => {
    try {
      setLoading(true);
      const [verificationsData, reportsData, assessmentsData, measuresData] = await Promise.all([
        legalService.getUserVerifications(),
        legalService.getSafetyReports(),
        legalService.getRiskAssessments(),
        legalService.getSafetyMeasures()
      ]);
      
      setVerifications(verificationsData);
      setSafetyReports(reportsData);
      setRiskAssessments(assessmentsData);
      setSafetyMeasures(measuresData);
    } catch (error) {
      toast.error('Failed to load safety data');
      console.error('Safety data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitVerification = async (type: string, files: File[]) => {
    try {
      const verification = await legalService.submitVerification({
        verificationType: type as any,
        userId: user!.id,
        documents: files
      });
      
      setVerifications(prev => [verification, ...prev]);
      toast.success('Verification submitted successfully');
    } catch (error) {
      toast.error('Failed to submit verification');
    }
  };

  const submitSafetyReport = async () => {
    try {
      const report = await legalService.submitSafetyReport({
        ...newReport,
        reportedBy: user!.id
      });
      
      setSafetyReports(prev => [report, ...prev]);
      setShowReportDialog(false);
      setNewReport({
        reportType: 'fraud',
        reportedUser: '',
        reportedProduct: '',
        description: '',
        evidence: []
      });
      toast.success('Safety report submitted successfully');
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  const getVerificationStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'under_review':
        return <Eye className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case 'verified':
        return 'bg-green-500';
      case 'high':
        return 'bg-blue-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'very_low':
        return 'text-green-600';
      case 'low':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-500';
      case 'very_high':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getVerificationTypeIcon = (type: string) => {
    const icons = {
      identity: User,
      phone: Phone,
      email: Mail,
      address: Globe,
      business: Building,
      bank_account: CreditCard
    };
    const Icon = icons[type as keyof typeof icons] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  const filteredReports = safetyReports.filter(report => {
    const matchesSearch = report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.reportType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const safetyStats = {
    totalVerifications: verifications.length,
    verifiedUsers: verifications.filter(v => v.status === 'verified').length,
    pendingVerifications: verifications.filter(v => v.status === 'pending').length,
    totalReports: safetyReports.length,
    openReports: safetyReports.filter(r => r.status === 'open').length,
    resolvedReports: safetyReports.filter(r => r.status === 'resolved').length,
    averageRiskScore: riskAssessments.reduce((sum, r) => sum + r.riskScore, 0) / riskAssessments.length,
    highRiskUsers: riskAssessments.filter(r => r.riskLevel === 'high' || r.riskLevel === 'very_high').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Loading safety center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Safety Center</h1>
              <p className="text-gray-600">Identity verification, safety reporting, and risk management</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Reports
              </Button>
              <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Flag className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Safety Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified Users</p>
                  <p className="text-2xl font-bold">{safetyStats.verifiedUsers}</p>
                  <p className="text-sm text-gray-500">of {safetyStats.totalVerifications} total</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Safety Reports</p>
                  <p className="text-2xl font-bold">{safetyStats.totalReports}</p>
                  <p className="text-sm text-gray-500">{safetyStats.openReports} open</p>
                </div>
                <Flag className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
                  <p className="text-2xl font-bold">{safetyStats.averageRiskScore.toFixed(1)}</p>
                  <p className="text-sm text-gray-500">Platform average</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Risk Users</p>
                  <p className="text-2xl font-bold">{safetyStats.highRiskUsers}</p>
                  <p className="text-sm text-gray-500">Require attention</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="verifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="verifications">Verifications</TabsTrigger>
            <TabsTrigger value="reports">Safety Reports</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            <TabsTrigger value="measures">Safety Measures</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="verifications">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>User Verifications</CardTitle>
                  <CardDescription>Identity and document verification status</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Trust Level</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {verifications.slice(0, 10).map((verification) => (
                        <TableRow key={verification.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getVerificationTypeIcon(verification.verificationType)}
                              <span className="capitalize">{verification.verificationType.replace('_', ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell>{verification.userId}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getVerificationStatusIcon(verification.status)}
                              <Badge variant={verification.status === 'verified' ? 'default' : 'secondary'}>
                                {verification.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getTrustLevelColor(verification.trustLevel)}`} />
                              <span className="capitalize">{verification.trustLevel}</span>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(verification.submittedAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {verification.status === 'pending' && (
                                <>
                                  <Button size="sm">Approve</Button>
                                  <Button size="sm" variant="outline">Reject</Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Verification Types</CardTitle>
                  <CardDescription>Available verification methods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: 'identity', name: 'Identity Verification', required: true, icon: User },
                      { type: 'phone', name: 'Phone Verification', required: true, icon: Phone },
                      { type: 'email', name: 'Email Verification', required: true, icon: Mail },
                      { type: 'address', name: 'Address Verification', required: false, icon: Globe },
                      { type: 'business', name: 'Business Verification', required: false, icon: Building },
                      { type: 'bank_account', name: 'Bank Account', required: false, icon: CreditCard }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isVerified = verifications.some(v => 
                        v.verificationType === item.type && v.status === 'verified'
                      );
                      
                      return (
                        <div key={item.type} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">
                                {item.required ? 'Required' : 'Optional'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isVerified ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Button size="sm">Verify</Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Safety Reports</CardTitle>
                <CardDescription>User-submitted safety and security reports</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reports</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Type</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.slice(0, 10).map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {report.reportType.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{report.reportedBy}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{report.reportedUser || report.reportedProduct || 'General'}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {report.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            report.priority === 'urgent' ? 'destructive' :
                            report.priority === 'high' ? 'default' :
                            'secondary'
                          }>
                            {report.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={report.status === 'resolved' ? 'default' : 'secondary'}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {report.status === 'open' && (
                              <Button size="sm">Investigate</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment Overview</CardTitle>
                  <CardDescription>User risk scoring and analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {riskAssessments.slice(0, 8).map((assessment) => (
                      <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{assessment.entityId}</p>
                          <p className="text-sm text-gray-500 capitalize">{assessment.entityType}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${getRiskLevelColor(assessment.riskLevel)}`}>
                            {assessment.riskScore}/100
                          </p>
                          <p className="text-sm text-gray-500 capitalize">
                            {assessment.riskLevel.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                  <CardDescription>Risk level breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { level: 'Very Low', count: 156, color: 'bg-green-500' },
                      { level: 'Low', count: 89, color: 'bg-green-400' },
                      { level: 'Medium', count: 45, color: 'bg-yellow-500' },
                      { level: 'High', count: 12, color: 'bg-red-500' },
                      { level: 'Very High', count: 3, color: 'bg-red-600' }
                    ].map((item) => (
                      <div key={item.level} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded ${item.color}`} />
                          <span>{item.level}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{item.count}</span>
                          <Progress value={(item.count / 305) * 100} className="w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="measures">
            <Card>
              <CardHeader>
                <CardTitle>Safety Measures</CardTitle>
                <CardDescription>Automated and manual safety measures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {safetyMeasures.map((measure) => (
                    <Card key={measure.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          {measure.name}
                        </CardTitle>
                        <CardDescription>{measure.category.replace('_', ' ')}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Type:</span>
                            <Badge variant={measure.type === 'automated' ? 'default' : 'outline'}>
                              {measure.type}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Status:</span>
                            <Badge variant={measure.isActive ? 'default' : 'secondary'}>
                              {measure.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Effectiveness:</span>
                            <span>{measure.effectiveness}%</span>
                          </div>
                          <Progress value={measure.effectiveness} className="h-2" />
                          <div className="pt-2">
                            <p className="text-sm text-gray-600">{measure.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Safety Trends</CardTitle>
                  <CardDescription>Safety metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Safety analytics chart will be implemented here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Incident Response</CardTitle>
                  <CardDescription>Response time and resolution metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Response Time</span>
                      <span className="font-semibold">2.4 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Resolution Time</span>
                      <span className="font-semibold">18.6 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Resolution Rate</span>
                      <span className="font-semibold">94.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>User Satisfaction</span>
                      <span className="font-semibold">4.7/5.0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Report Issue Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Safety Issue</DialogTitle>
            <DialogDescription>
              Report suspicious activity, fraud, or safety concerns
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select 
                value={newReport.reportType} 
                onValueChange={(value) => setNewReport(prev => ({ ...prev, reportType: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fraud">Fraud</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                  <SelectItem value="copyright">Copyright Violation</SelectItem>
                  <SelectItem value="trademark">Trademark Violation</SelectItem>
                  <SelectItem value="fake_product">Fake Product</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reportedUser">Reported User (Optional)</Label>
                <Input
                  id="reportedUser"
                  value={newReport.reportedUser}
                  onChange={(e) => setNewReport(prev => ({ ...prev, reportedUser: e.target.value }))}
                  placeholder="User ID or username"
                />
              </div>
              <div>
                <Label htmlFor="reportedProduct">Reported Product (Optional)</Label>
                <Input
                  id="reportedProduct"
                  value={newReport.reportedProduct}
                  onChange={(e) => setNewReport(prev => ({ ...prev, reportedProduct: e.target.value }))}
                  placeholder="Product ID"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newReport.description}
                onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the issue in detail..."
                rows={4}
              />
            </div>

            <div>
              <Label>Evidence (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Drag and drop files here or click to upload</p>
                <p className="text-sm text-gray-500">Screenshots, documents, or other evidence</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={submitSafetyReport} className="flex-1">
                Submit Report
              </Button>
              <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserSafetyCenter;
