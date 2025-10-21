import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Lock, 
  Download, 
  Trash2, 
  Eye,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Settings,
  Globe,
  Search,
  Filter,
  Calendar,
  BarChart3,
  TrendingUp,
  Database,
  Key,
  Cookie
} from 'lucide-react';
import { DataRequest, PrivacySettings, ComplianceCheck, AuditLog, CookiePreferences } from './types';
import { legalService } from '@/services/legalService';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const DataProtectionCenter: React.FC = () => {
  const { user } = useAuthContext();
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const [newRequest, setNewRequest] = useState({
    requestType: 'access' as const,
    description: '',
    dataCategories: [] as string[]
  });

  useEffect(() => {
    loadDataProtectionData();
  }, []);

  const loadDataProtectionData = async () => {
    try {
      setLoading(true);
      const [requestsData, settingsData, checksData, logsData] = await Promise.all([
        legalService.getDataRequests(),
        legalService.getPrivacySettings(user!.id),
        legalService.getComplianceChecks(),
        legalService.getAuditLogs()
      ]);
      
      setDataRequests(requestsData);
      setPrivacySettings(settingsData);
      setComplianceChecks(checksData);
      setAuditLogs(logsData);
    } catch (error) {
      toast.error('Failed to load data protection information');
      console.error('Data protection loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitDataRequest = async () => {
    try {
      const request = await legalService.submitDataRequest({
        ...newRequest,
        userId: user!.id
      });
      
      setDataRequests(prev => [request, ...prev]);
      setShowRequestDialog(false);
      setNewRequest({
        requestType: 'access',
        description: '',
        dataCategories: []
      });
      toast.success('Data request submitted successfully');
    } catch (error) {
      toast.error('Failed to submit data request');
    }
  };

  const updatePrivacySettings = async (updates: Partial<PrivacySettings>) => {
    try {
      const updatedSettings = await legalService.updatePrivacySettings(user!.id, updates);
      setPrivacySettings(updatedSettings);
      toast.success('Privacy settings updated successfully');
    } catch (error) {
      toast.error('Failed to update privacy settings');
    }
  };

  const downloadData = async (requestId: string) => {
    try {
      const downloadUrl = await legalService.downloadUserData(requestId);
      window.open(downloadUrl, '_blank');
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download data');
    }
  };

  const deleteUserData = async (categories: string[]) => {
    try {
      await legalService.deleteUserData(user!.id, categories);
      toast.success('Data deletion request submitted');
    } catch (error) {
      toast.error('Failed to submit deletion request');
    }
  };

  const getRequestStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600 bg-green-100';
      case 'non_compliant':
        return 'text-red-600 bg-red-100';
      case 'review_required':
        return 'text-yellow-600 bg-yellow-100';
      case 'pending':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredRequests = dataRequests.filter(request => {
    const matchesSearch = request.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.requestType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || request.requestType === typeFilter;
    return matchesSearch && matchesType;
  });

  const dataProtectionStats = {
    totalRequests: dataRequests.length,
    pendingRequests: dataRequests.filter(r => r.status === 'pending').length,
    completedRequests: dataRequests.filter(r => r.status === 'completed').length,
    averageProcessingTime: 4.2, // days
    complianceScore: 94.5, // percentage
    totalAuditEvents: auditLogs.length,
    highRiskEvents: auditLogs.filter(log => log.riskLevel === 'high').length,
    gdprCompliance: 96.2 // percentage
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Loading data protection center...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Data Protection Center</h1>
              <p className="text-gray-600">Privacy compliance, data requests, and user rights management</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Compliance Report
              </Button>
              <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <FileText className="w-4 h-4 mr-2" />
                    New Data Request
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Data Protection Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">GDPR Compliance</p>
                  <p className="text-2xl font-bold">{dataProtectionStats.gdprCompliance}%</p>
                  <p className="text-sm text-gray-500">Overall score</p>
                </div>
                <Shield className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Data Requests</p>
                  <p className="text-2xl font-bold">{dataProtectionStats.totalRequests}</p>
                  <p className="text-sm text-gray-500">{dataProtectionStats.pendingRequests} pending</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
                  <p className="text-2xl font-bold">{dataProtectionStats.averageProcessingTime}</p>
                  <p className="text-sm text-gray-500">days</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Audit Events</p>
                  <p className="text-2xl font-bold">{dataProtectionStats.totalAuditEvents}</p>
                  <p className="text-sm text-gray-500">{dataProtectionStats.highRiskEvents} high risk</p>
                </div>
                <Database className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="requests">Data Requests</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Settings</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="cookies">Cookie Management</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Data Protection Requests</CardTitle>
                <CardDescription>User data access, portability, and deletion requests</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search requests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="access">Data Access</SelectItem>
                      <SelectItem value="portability">Data Portability</SelectItem>
                      <SelectItem value="deletion">Data Deletion</SelectItem>
                      <SelectItem value="rectification">Data Correction</SelectItem>
                      <SelectItem value="restriction">Processing Restriction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.slice(0, 10).map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono text-sm">{request.id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {request.requestType.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.userId}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRequestStatusIcon(request.status)}
                            <span className="capitalize">{request.status.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={new Date(request.deadline) < new Date() ? 'text-red-600 font-medium' : ''}>
                            {new Date(request.deadline).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {request.status === 'completed' && request.files && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => downloadData(request.id)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                            {request.status === 'pending' && (
                              <Button size="sm">Process</Button>
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

          <TabsContent value="privacy">
            {privacySettings && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Privacy</CardTitle>
                    <CardDescription>Control what information is visible to others</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Profile Visibility</Label>
                        <p className="text-sm text-gray-600">Who can see your profile</p>
                      </div>
                      <Select 
                        value={privacySettings.profileVisibility} 
                        onValueChange={(value) => updatePrivacySettings({ profileVisibility: value as any })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="limited">Limited</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Real Name</Label>
                        <p className="text-sm text-gray-600">Display your real name on profile</p>
                      </div>
                      <Switch
                        checked={privacySettings.showRealName}
                        onCheckedChange={(checked) => updatePrivacySettings({ showRealName: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Email</Label>
                        <p className="text-sm text-gray-600">Make email address visible</p>
                      </div>
                      <Switch
                        checked={privacySettings.showEmail}
                        onCheckedChange={(checked) => updatePrivacySettings({ showEmail: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Phone</Label>
                        <p className="text-sm text-gray-600">Display phone number</p>
                      </div>
                      <Switch
                        checked={privacySettings.showPhone}
                        onCheckedChange={(checked) => updatePrivacySettings({ showPhone: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Direct Messages</Label>
                        <p className="text-sm text-gray-600">Receive messages from other users</p>
                      </div>
                      <Switch
                        checked={privacySettings.allowDirectMessages}
                        onCheckedChange={(checked) => updatePrivacySettings({ allowDirectMessages: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Processing</CardTitle>
                    <CardDescription>Control how your data is used</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Marketing Communications</Label>
                        <p className="text-sm text-gray-600">Receive promotional emails and offers</p>
                      </div>
                      <Switch
                        checked={privacySettings.marketingOptIn}
                        onCheckedChange={(checked) => updatePrivacySettings({ marketingOptIn: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Analytics Tracking</Label>
                        <p className="text-sm text-gray-600">Help improve our services with usage data</p>
                      </div>
                      <Switch
                        checked={privacySettings.analyticsOptIn}
                        onCheckedChange={(checked) => updatePrivacySettings({ analyticsOptIn: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Reviews</Label>
                        <p className="text-sm text-gray-600">Let others review your products/services</p>
                      </div>
                      <Switch
                        checked={privacySettings.allowReviews}
                        onCheckedChange={(checked) => updatePrivacySettings({ allowReviews: checked })}
                      />
                    </div>

                    <div>
                      <Label>Data Retention Preference</Label>
                      <p className="text-sm text-gray-600 mb-2">How long should we keep your data</p>
                      <Select 
                        value={privacySettings.dataRetentionPreference} 
                        onValueChange={(value) => updatePrivacySettings({ dataRetentionPreference: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minimal">Minimal (Legal minimum)</SelectItem>
                          <SelectItem value="standard">Standard (Platform default)</SelectItem>
                          <SelectItem value="extended">Extended (For convenience)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="compliance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Status</CardTitle>
                  <CardDescription>Regulatory compliance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complianceChecks.slice(0, 8).map((check) => (
                      <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{check.checkType.toUpperCase()}</p>
                          <p className="text-sm text-gray-600 capitalize">{check.entityType}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getComplianceStatusColor(check.status)}>
                            {check.status.replace('_', ' ')}
                          </Badge>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(check.checkedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Score</CardTitle>
                  <CardDescription>Overall compliance rating</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {dataProtectionStats.complianceScore}%
                      </div>
                      <p className="text-gray-600">Overall Compliance Score</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { regulation: 'GDPR', score: 96 },
                        { regulation: 'CCPA', score: 94 },
                        { regulation: 'PIPEDA', score: 92 },
                        { regulation: 'LGPD', score: 95 }
                      ].map((item) => (
                        <div key={item.regulation}>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{item.regulation}</span>
                            <span className="text-sm">{item.score}%</span>
                          </div>
                          <Progress value={item.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Compliance Findings</CardTitle>
                <CardDescription>Recent compliance check results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceChecks.flatMap(check => check.findings).slice(0, 5).map((finding, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">{finding.category}</p>
                            <p className="text-sm">{finding.description}</p>
                            <p className="text-sm text-blue-600 mt-1">{finding.recommendation}</p>
                          </div>
                          <Badge variant={
                            finding.severity === 'critical' ? 'destructive' :
                            finding.severity === 'high' ? 'default' : 'secondary'
                          }>
                            {finding.severity}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>System activity and data access logs</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.slice(0, 10).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{log.userId || 'System'}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>
                          <span className="capitalize">{log.entityType}</span>
                          <span className="text-gray-500 ml-2 text-sm">{log.entityId}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskLevelColor(log.riskLevel)}>
                            {log.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cookies">
            {privacySettings && (
              <Card>
                <CardHeader>
                  <CardTitle>Cookie Preferences</CardTitle>
                  <CardDescription>Manage cookie settings and tracking preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <Label>Essential Cookies</Label>
                          <p className="text-sm text-gray-600">Required for basic functionality</p>
                        </div>
                        <Switch checked disabled />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <Label>Functional Cookies</Label>
                          <p className="text-sm text-gray-600">Enhanced features and personalization</p>
                        </div>
                        <Switch
                          checked={privacySettings.cookiePreferences.functional}
                          onCheckedChange={(checked) => 
                            updatePrivacySettings({
                              cookiePreferences: {
                                ...privacySettings.cookiePreferences,
                                functional: checked
                              }
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <Label>Analytics Cookies</Label>
                          <p className="text-sm text-gray-600">Help us understand usage patterns</p>
                        </div>
                        <Switch
                          checked={privacySettings.cookiePreferences.analytics}
                          onCheckedChange={(checked) => 
                            updatePrivacySettings({
                              cookiePreferences: {
                                ...privacySettings.cookiePreferences,
                                analytics: checked
                              }
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <Label>Marketing Cookies</Label>
                          <p className="text-sm text-gray-600">Personalized ads and content</p>
                        </div>
                        <Switch
                          checked={privacySettings.cookiePreferences.marketing}
                          onCheckedChange={(checked) => 
                            updatePrivacySettings({
                              cookiePreferences: {
                                ...privacySettings.cookiePreferences,
                                marketing: checked
                              }
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-4">Cookie Information</h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium">What are cookies?</p>
                          <p className="text-gray-600">
                            Small text files stored on your device to remember your preferences and improve your experience.
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Managing cookies</p>
                          <p className="text-gray-600">
                            You can change these settings at any time. Some features may not work properly if certain cookies are disabled.
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Last updated</p>
                          <p className="text-gray-600">
                            {new Date(privacySettings.cookiePreferences.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <Button variant="outline" className="w-full">
                          <FileText className="w-4 h-4 mr-2" />
                          View Cookie Policy
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Data Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Data Request</DialogTitle>
            <DialogDescription>
              Request access to, correction of, or deletion of your personal data
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="requestType">Request Type</Label>
              <Select 
                value={newRequest.requestType} 
                onValueChange={(value) => setNewRequest(prev => ({ ...prev, requestType: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="access">Data Access - View all data we have about you</SelectItem>
                  <SelectItem value="portability">Data Portability - Download your data</SelectItem>
                  <SelectItem value="deletion">Data Deletion - Delete specific data</SelectItem>
                  <SelectItem value="rectification">Data Correction - Fix incorrect information</SelectItem>
                  <SelectItem value="restriction">Processing Restriction - Limit how we use your data</SelectItem>
                  <SelectItem value="objection">Object to Processing - Opt out of specific uses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newRequest.description}
                onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide additional details about your request..."
                rows={3}
              />
            </div>

            <div>
              <Label>Data Categories (Optional)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['Profile Data', 'Transaction History', 'Communication Records', 'Analytics Data', 'Marketing Data', 'Support Tickets'].map((category) => (
                  <Label key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newRequest.dataCategories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewRequest(prev => ({
                            ...prev,
                            dataCategories: [...prev.dataCategories, category]
                          }));
                        } else {
                          setNewRequest(prev => ({
                            ...prev,
                            dataCategories: prev.dataCategories.filter(c => c !== category)
                          }));
                        }
                      }}
                    />
                    <span className="text-sm">{category}</span>
                  </Label>
                ))}
              </div>
            </div>

            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                For security purposes, we may need to verify your identity before processing certain requests. 
                You will receive updates on your request status via email.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 pt-4">
              <Button onClick={submitDataRequest} className="flex-1">
                Submit Request
              </Button>
              <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataProtectionCenter;
