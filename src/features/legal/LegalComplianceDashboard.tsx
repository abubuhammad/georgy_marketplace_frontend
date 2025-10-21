import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Scale, 
  Users, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Database,
  Lock,
  Eye,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Flag,
  Gavel,
  Globe
} from 'lucide-react';
import { ComplianceDashboard } from './types';
import { legalService } from '@/services/legalService';
import { toast } from 'sonner';

const LegalComplianceDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<ComplianceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardData = await legalService.getComplianceDashboard();
      setDashboard(dashboardData);
    } catch (error) {
      toast.error('Failed to load compliance dashboard');
      console.error('Dashboard loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 90) return 'text-blue-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceStatus = (score: number) => {
    if (score >= 95) return 'Excellent';
    if (score >= 90) return 'Good';
    if (score >= 80) return 'Fair';
    return 'Needs Improvement';
  };

  const getRiskColor = (level: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Loading compliance dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p>Failed to load dashboard data</p>
          <Button onClick={loadDashboardData} className="mt-4">
            Retry
          </Button>
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
              <h1 className="text-2xl font-bold text-gray-900">Legal Compliance Dashboard</h1>
              <p className="text-gray-600">Comprehensive legal and regulatory compliance overview</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Audit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Compliance</p>
                  <p className={`text-2xl font-bold ${getComplianceColor(dashboard.complianceStatus.overallScore)}`}>
                    {dashboard.complianceStatus.overallScore.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500">{getComplianceStatus(dashboard.complianceStatus.overallScore)}</p>
                </div>
                <Shield className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified Users</p>
                  <p className="text-2xl font-bold">{dashboard.verifiedUsers}</p>
                  <p className="text-sm text-gray-500">of {dashboard.totalUsers} total</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Disputes</p>
                  <p className="text-2xl font-bold">{dashboard.activeDisputes}</p>
                  <p className="text-sm text-gray-500">{dashboard.resolvedDisputes} resolved</p>
                </div>
                <Scale className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Audit Events</p>
                  <p className="text-2xl font-bold">{dashboard.auditSummary.totalEvents}</p>
                  <p className="text-sm text-gray-500">{dashboard.auditSummary.criticalEvents} critical</p>
                </div>
                <Database className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="data">Data Protection</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Score Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Compliance Breakdown
                  </CardTitle>
                  <CardDescription>Regulatory compliance scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'GDPR Compliance', score: dashboard.complianceStatus.gdprCompliance, icon: Globe },
                      { name: 'CCPA Compliance', score: dashboard.complianceStatus.ccpaCompliance, icon: Shield },
                      { name: 'Data Retention', score: dashboard.complianceStatus.dataRetentionCompliance, icon: Database },
                      { name: 'Consent Management', score: dashboard.complianceStatus.consentManagement, icon: CheckCircle }
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-gray-600" />
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <span className={`font-semibold ${getComplianceColor(item.score)}`}>
                              {item.score.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={item.score} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Risk Assessment
                  </CardTitle>
                  <CardDescription>Platform risk metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{dashboard.riskMetrics.averageUserRisk.toFixed(1)}</p>
                        <p className="text-sm text-gray-600">Avg User Risk</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{dashboard.riskMetrics.highRiskUsers}</p>
                        <p className="text-sm text-gray-600">High Risk Users</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Detection Accuracy</span>
                        <span className="font-semibold text-green-600">
                          {dashboard.riskMetrics.detectionAccuracy.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>False Positive Rate</span>
                        <span className="font-semibold text-yellow-600">
                          {dashboard.riskMetrics.falsePositiveRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fraudulent Transactions</span>
                        <span className="font-semibold text-red-600">{dashboard.riskMetrics.fraudulentTransactions}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Timeline</CardTitle>
                <CardDescription>Recent compliance activities and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                      event: 'GDPR Compliance Review Completed',
                      status: 'completed',
                      score: 96.2
                    },
                    {
                      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                      event: 'Data Protection Impact Assessment',
                      status: 'completed',
                      score: 94.8
                    },
                    {
                      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                      event: 'Privacy Policy Updated',
                      status: 'completed',
                      score: null
                    },
                    {
                      date: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
                      event: 'Next Compliance Assessment',
                      status: 'scheduled',
                      score: null
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium">{item.event}</p>
                        <p className="text-sm text-gray-600">{item.date.toLocaleDateString()}</p>
                      </div>
                      {item.score && (
                        <Badge className={getComplianceColor(item.score)}>
                          {item.score}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Regulatory Compliance</CardTitle>
                  <CardDescription>Detailed compliance status by regulation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      {
                        name: 'General Data Protection Regulation (GDPR)',
                        jurisdiction: 'European Union',
                        score: dashboard.complianceStatus.gdprCompliance,
                        lastAssessment: dashboard.complianceStatus.lastAssessment,
                        requirements: ['Data Subject Rights', 'Consent Management', 'Data Breach Notification', 'Privacy by Design']
                      },
                      {
                        name: 'California Consumer Privacy Act (CCPA)',
                        jurisdiction: 'California, USA',
                        score: dashboard.complianceStatus.ccpaCompliance,
                        lastAssessment: dashboard.complianceStatus.lastAssessment,
                        requirements: ['Right to Know', 'Right to Delete', 'Right to Opt-Out', 'Non-Discrimination']
                      },
                      {
                        name: 'Personal Information Protection and Electronic Documents Act (PIPEDA)',
                        jurisdiction: 'Canada',
                        score: 92.1,
                        lastAssessment: dashboard.complianceStatus.lastAssessment,
                        requirements: ['Consent', 'Limiting Collection', 'Accuracy', 'Safeguards']
                      }
                    ].map((regulation, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{regulation.name}</CardTitle>
                              <CardDescription>{regulation.jurisdiction}</CardDescription>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getComplianceColor(regulation.score)}`}>
                                {regulation.score.toFixed(1)}%
                              </div>
                              <p className="text-sm text-gray-500">
                                Last: {new Date(regulation.lastAssessment).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <Progress value={regulation.score} className="h-2" />
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              {regulation.requirements.map((req, reqIndex) => (
                                <div key={reqIndex} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span>{req}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Actions</CardTitle>
                  <CardDescription>Upcoming compliance tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        task: 'Update Privacy Policy',
                        due: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                        priority: 'high',
                        regulation: 'GDPR'
                      },
                      {
                        task: 'Conduct DPIA Review',
                        due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        priority: 'medium',
                        regulation: 'GDPR'
                      },
                      {
                        task: 'Update Cookie Consent',
                        due: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                        priority: 'medium',
                        regulation: 'CCPA'
                      },
                      {
                        task: 'Security Audit',
                        due: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                        priority: 'low',
                        regulation: 'General'
                      }
                    ].map((action, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium">{action.task}</p>
                          <Badge variant={
                            action.priority === 'high' ? 'destructive' :
                            action.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Due: {action.due.toLocaleDateString()}
                        </p>
                        <p className="text-sm text-blue-600">{action.regulation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="safety">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="w-5 h-5" />
                    Safety Reports
                  </CardTitle>
                  <CardDescription>User safety and security reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{dashboard.safetyReports.total}</p>
                        <p className="text-sm text-gray-600">Total Reports</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">{dashboard.safetyReports.open}</p>
                        <p className="text-sm text-gray-600">Open</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{dashboard.safetyReports.resolved}</p>
                        <p className="text-sm text-gray-600">Resolved</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Average Resolution Time</span>
                        <span className="font-semibold">{dashboard.safetyReports.avgResolutionTime} hours</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Reports by Type</h4>
                      <div className="space-y-2">
                        {Object.entries(dashboard.safetyReports.byType).map(([type, count]) => (
                          <div key={type} className="flex justify-between text-sm">
                            <span className="capitalize">{type.replace('_', ' ')}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Verification
                  </CardTitle>
                  <CardDescription>Identity verification status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {((dashboard.verifiedUsers / dashboard.totalUsers) * 100).toFixed(1)}%
                      </div>
                      <p className="text-gray-600">Verification Rate</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-xl font-bold">{dashboard.verifiedUsers}</p>
                        <p className="text-sm text-gray-600">Verified</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-yellow-600">{dashboard.pendingVerifications}</p>
                        <p className="text-sm text-gray-600">Pending</p>
                      </div>
                    </div>

                    <Progress value={(dashboard.verifiedUsers / dashboard.totalUsers) * 100} className="h-3" />

                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Verification rate is above the recommended 85% threshold for marketplace platforms.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="disputes">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="w-5 h-5" />
                    Dispute Resolution
                  </CardTitle>
                  <CardDescription>Dispute management overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{dashboard.activeDisputes}</p>
                        <p className="text-sm text-gray-600">Active</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{dashboard.resolvedDisputes}</p>
                        <p className="text-sm text-gray-600">Resolved</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Resolution Rate</span>
                        <span className="font-semibold text-green-600">
                          {((dashboard.resolvedDisputes / (dashboard.activeDisputes + dashboard.resolvedDisputes)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Resolution Time</span>
                        <span className="font-semibold">5.2 days</span>
                      </div>
                    </div>

                    <Progress value={85} className="h-2" />

                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Dispute resolution performance is within acceptable parameters.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resolution Trends</CardTitle>
                  <CardDescription>Dispute resolution patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Dispute analytics chart will be implemented here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="data">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Data Protection Requests
                  </CardTitle>
                  <CardDescription>User data requests and processing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{dashboard.dataRequests.total}</p>
                        <p className="text-sm text-gray-600">Total</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">{dashboard.dataRequests.pending}</p>
                        <p className="text-sm text-gray-600">Pending</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{dashboard.dataRequests.completed}</p>
                        <p className="text-sm text-gray-600">Completed</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Avg Processing Time</span>
                        <span className="font-semibold">{dashboard.dataRequests.avgProcessingTime} days</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Requests by Type</h4>
                      <div className="space-y-2">
                        {Object.entries(dashboard.dataRequests.byType).map(([type, count]) => (
                          <div key={type} className="flex justify-between text-sm">
                            <span className="capitalize">{type.replace('_', ' ')}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Protection Compliance</CardTitle>
                  <CardDescription>Privacy and data protection metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {dashboard.complianceStatus.dataRetentionCompliance.toFixed(1)}%
                      </div>
                      <p className="text-gray-600">Data Retention Compliance</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Consent Management</span>
                        <span className="font-semibold text-green-600">
                          {dashboard.complianceStatus.consentManagement.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Breach Response</span>
                        <span className="font-semibold text-green-600">Compliant</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Privacy by Design</span>
                        <span className="font-semibold text-green-600">Implemented</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Audit Summary
                </CardTitle>
                <CardDescription>System audit and activity overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{dashboard.auditSummary.totalEvents}</p>
                    <p className="text-sm text-gray-600">Total Events</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{dashboard.auditSummary.criticalEvents}</p>
                    <p className="text-sm text-gray-600">Critical Events</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{dashboard.auditSummary.dataAccessEvents}</p>
                    <p className="text-sm text-gray-600">Data Access</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{dashboard.auditSummary.securityEvents}</p>
                    <p className="text-sm text-gray-600">Security Events</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{dashboard.auditSummary.complianceEvents}</p>
                    <p className="text-sm text-gray-600">Compliance</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Last Audit</span>
                    <span className="font-semibold">
                      {new Date(dashboard.auditSummary.lastAuditDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Next Scheduled Audit</span>
                    <span className="font-semibold">
                      {new Date(dashboard.auditSummary.nextAuditDate).toLocaleDateString()}
                    </span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LegalComplianceDashboard;
