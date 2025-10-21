import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Clock,
  Zap,
  Activity,
  UserCheck,
  Ban,
  Flag,
  MapPin,
  CreditCard,
  Smartphone,
  Globe,
  Database,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { paymentApiService } from '@/services/paymentService-api';

interface PaymentSecurityProps {
  className?: string;
}

interface SecurityRule {
  id: string;
  name: string;
  type: 'velocity' | 'geolocation' | 'device' | 'amount' | 'pattern' | 'blacklist';
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  conditions: Record<string, any>;
  actions: string[];
  description: string;
  triggeredCount: number;
  lastTriggered?: string;
}

interface FraudAlert {
  id: string;
  transactionId: string;
  ruleId: string;
  ruleName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'investigating' | 'resolved' | 'false_positive';
  description: string;
  evidence: Record<string, any>;
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
}

interface SecurityMetrics {
  totalTransactions: number;
  flaggedTransactions: number;
  fraudPrevented: number;
  falsePositives: number;
  riskScore: number;
  averageResponseTime: number;
  topRisks: Array<{
    type: string;
    count: number;
    amount: number;
  }>;
}

interface ComplianceStatus {
  pciCompliant: boolean;
  gdprCompliant: boolean;
  ndprCompliant: boolean;
  lastAudit: string;
  certificateExpiry: string;
  complianceScore: number;
  requiredActions: string[];
}

export function PaymentSecurity({ className }: PaymentSecurityProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [securityRules, setSecurityRules] = useState<SecurityRule[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [selectedRule, setSelectedRule] = useState<SecurityRule | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

  // Rule form state
  const [ruleForm, setRuleForm] = useState({
    name: '',
    type: 'velocity' as const,
    enabled: true,
    severity: 'medium' as const,
    conditions: {},
    actions: [],
    description: ''
  });

  const RULE_TYPES = [
    { id: 'velocity', name: 'Velocity Check', desc: 'Monitor transaction frequency' },
    { id: 'geolocation', name: 'Geolocation', desc: 'Geographic risk analysis' },
    { id: 'device', name: 'Device Fingerprinting', desc: 'Device reputation scoring' },
    { id: 'amount', name: 'Amount Threshold', desc: 'High-value transaction alerts' },
    { id: 'pattern', name: 'Pattern Detection', desc: 'Behavioral pattern analysis' },
    { id: 'blacklist', name: 'Blacklist Check', desc: 'Known fraud indicators' }
  ];

  const RISK_ACTIONS = [
    'flag_transaction',
    'require_verification',
    'block_transaction',
    'alert_admin',
    'increase_monitoring',
    'request_documents'
  ];

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const [rulesData, alertsData, metricsData, complianceData] = await Promise.all([
        paymentApiService.getSecurityRules(),
        paymentApiService.getFraudAlerts(),
        paymentApiService.getSecurityMetrics(),
        paymentApiService.getComplianceStatus()
      ]);
      
      setSecurityRules(rulesData);
      setFraudAlerts(alertsData);
      setMetrics(metricsData);
      setCompliance(complianceData);
    } catch (error) {
      console.error('Failed to load security data:', error);
      // Fallback data
      setSecurityRules([
        {
          id: '1',
          name: 'High Velocity Transactions',
          type: 'velocity',
          enabled: true,
          severity: 'high',
          conditions: { max_transactions_per_hour: 10, time_window: 3600 },
          actions: ['flag_transaction', 'alert_admin'],
          description: 'Flag users making more than 10 transactions per hour',
          triggeredCount: 23,
          lastTriggered: '2024-01-15T14:30:00Z'
        },
        {
          id: '2',
          name: 'Geographic Risk Countries',
          type: 'geolocation',
          enabled: true,
          severity: 'medium',
          conditions: { high_risk_countries: ['XX', 'YY'], vpn_detection: true },
          actions: ['require_verification', 'increase_monitoring'],
          description: 'Enhanced verification for high-risk countries',
          triggeredCount: 45,
          lastTriggered: '2024-01-15T12:15:00Z'
        },
        {
          id: '3',
          name: 'Large Transaction Threshold',
          type: 'amount',
          enabled: true,
          severity: 'critical',
          conditions: { threshold_amount: 500000, currency: 'NGN' },
          actions: ['flag_transaction', 'require_verification', 'alert_admin'],
          description: 'Flag transactions above ₦500,000',
          triggeredCount: 12,
          lastTriggered: '2024-01-15T16:45:00Z'
        }
      ]);

      setFraudAlerts([
        {
          id: '1',
          transactionId: 'TXN-001',
          ruleId: '1',
          ruleName: 'High Velocity Transactions',
          severity: 'high',
          status: 'pending',
          description: 'User attempted 12 transactions in 45 minutes',
          evidence: {
            user_id: 'user-123',
            transaction_count: 12,
            time_window: '45 minutes',
            total_amount: 125000,
            ip_address: '192.168.1.100'
          },
          createdAt: '2024-01-15T14:30:00Z'
        },
        {
          id: '2',
          transactionId: 'TXN-002',
          ruleId: '3',
          ruleName: 'Large Transaction Threshold',
          severity: 'critical',
          status: 'investigating',
          description: 'Transaction of ₦750,000 flagged for review',
          evidence: {
            amount: 750000,
            currency: 'NGN',
            payment_method: 'bank_transfer',
            first_time_user: true
          },
          assignedTo: 'admin@georgy.com',
          createdAt: '2024-01-15T16:45:00Z'
        }
      ]);

      setMetrics({
        totalTransactions: 15640,
        flaggedTransactions: 234,
        fraudPrevented: 18,
        falsePositives: 12,
        riskScore: 2.3,
        averageResponseTime: 4.2,
        topRisks: [
          { type: 'velocity', count: 45, amount: 890000 },
          { type: 'geolocation', count: 23, amount: 560000 },
          { type: 'amount', count: 12, amount: 2400000 }
        ]
      });

      setCompliance({
        pciCompliant: true,
        gdprCompliant: true,
        ndprCompliant: false,
        lastAudit: '2024-01-01',
        certificateExpiry: '2024-12-31',
        complianceScore: 85,
        requiredActions: [
          'Complete NDPR registration',
          'Update data retention policy',
          'Schedule quarterly security review'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      setLoading(true);
      const newRule = await paymentApiService.createSecurityRule(ruleForm);
      setSecurityRules([...securityRules, newRule]);
      setIsRuleDialogOpen(false);
      resetRuleForm();
    } catch (error) {
      console.error('Failed to create security rule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRule = async () => {
    if (!selectedRule) return;

    try {
      setLoading(true);
      const updatedRule = await paymentApiService.updateSecurityRule(selectedRule.id, ruleForm);
      setSecurityRules(securityRules.map(r => r.id === selectedRule.id ? updatedRule : r));
      setIsRuleDialogOpen(false);
      setSelectedRule(null);
      resetRuleForm();
    } catch (error) {
      console.error('Failed to update security rule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      await paymentApiService.toggleSecurityRule(ruleId, enabled);
      setSecurityRules(securityRules.map(r => r.id === ruleId ? { ...r, enabled } : r));
    } catch (error) {
      console.error('Failed to toggle security rule:', error);
    }
  };

  const handleResolveAlert = async (alertId: string, status: string, notes?: string) => {
    try {
      setLoading(true);
      await paymentApiService.resolveSecurityAlert(alertId, { status, notes });
      setFraudAlerts(fraudAlerts.map(a => 
        a.id === alertId 
          ? { ...a, status: status as any, resolvedAt: new Date().toISOString() }
          : a
      ));
      setIsAlertDialogOpen(false);
      setSelectedAlert(null);
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetRuleForm = () => {
    setRuleForm({
      name: '',
      type: 'velocity',
      enabled: true,
      severity: 'medium',
      conditions: {},
      actions: [],
      description: ''
    });
  };

  const openEditRule = (rule: SecurityRule) => {
    setSelectedRule(rule);
    setRuleForm({
      name: rule.name,
      type: rule.type,
      enabled: rule.enabled,
      severity: rule.severity,
      conditions: rule.conditions,
      actions: rule.actions,
      description: rule.description
    });
    setIsRuleDialogOpen(true);
  };

  const getSeverityBadge = (severity: string) => {
    const configs = {
      low: { color: 'bg-blue-100 text-blue-800', icon: Shield },
      medium: { color: 'bg-yellow-100 text-yellow-800', icon: ShieldAlert },
      high: { color: 'bg-orange-100 text-orange-800', icon: ShieldAlert },
      critical: { color: 'bg-red-100 text-red-800', icon: ShieldAlert }
    };
    
    const config = configs[severity as keyof typeof configs];
    const Icon = config?.icon || Shield;
    
    return (
      <Badge variant="secondary" className={config?.color}>
        <Icon className="h-3 w-3 mr-1" />
        {severity}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      investigating: { color: 'bg-blue-100 text-blue-800', icon: Eye },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      false_positive: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };
    
    const config = configs[status as keyof typeof configs];
    const Icon = config?.icon || Clock;
    
    return (
      <Badge variant="secondary" className={config?.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getRiskScoreColor = (score: number) => {
    if (score < 2) return 'text-green-600';
    if (score < 4) return 'text-yellow-600';
    if (score < 7) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Payment Security & Fraud Prevention
          </CardTitle>
          <p className="text-sm text-gray-600">
            Advanced security monitoring, fraud detection, and compliance management
          </p>
        </CardHeader>
      </Card>

      {/* Security Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Risk Score</p>
                  <p className={`text-2xl font-bold ${getRiskScoreColor(metrics.riskScore)}`}>
                    {metrics.riskScore}/10
                  </p>
                </div>
                <Shield className={`h-8 w-8 ${getRiskScoreColor(metrics.riskScore)}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Flagged Transactions</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.flaggedTransactions}</p>
                  <p className="text-xs text-gray-500">
                    {((metrics.flaggedTransactions / metrics.totalTransactions) * 100).toFixed(2)}% of total
                  </p>
                </div>
                <Flag className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Fraud Prevented</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.fraudPrevented}</p>
                  <p className="text-xs text-gray-500">₦2.4M saved</p>
                </div>
                <ShieldCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Response Time</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.averageResponseTime}h</p>
                  <p className="text-xs text-gray-500">Average resolution</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="rules">Security Rules</TabsTrigger>
          <TabsTrigger value="alerts">Fraud Alerts</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Risk Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Top Security Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.topRisks.map((risk, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{risk.type}</p>
                        <p className="text-sm text-gray-600">{risk.count} incidents</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₦{(risk.amount / 1000).toLocaleString()}K</p>
                        <div className="w-20">
                          <Progress 
                            value={(risk.count / Math.max(...metrics.topRisks.map(r => r.count))) * 100} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fraudAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-start justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getSeverityBadge(alert.severity)}
                          {getStatusBadge(alert.status)}
                        </div>
                        <p className="text-sm font-medium">{alert.ruleName}</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{alert.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAlert(alert);
                          setIsAlertDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          {/* Rules Management */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Security Rules</h3>
            <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Shield className="h-4 w-4 mr-2" />
                  Create Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedRule ? 'Edit Security Rule' : 'Create Security Rule'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Rule Name</Label>
                      <Input
                        value={ruleForm.name}
                        onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                        placeholder="e.g., High Risk Country Check"
                      />
                    </div>
                    <div>
                      <Label>Rule Type</Label>
                      <Select 
                        value={ruleForm.type} 
                        onValueChange={(value: any) => setRuleForm({ ...ruleForm, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RULE_TYPES.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Severity Level</Label>
                      <Select 
                        value={ruleForm.severity} 
                        onValueChange={(value: any) => setRuleForm({ ...ruleForm, severity: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        checked={ruleForm.enabled}
                        onCheckedChange={(checked) => setRuleForm({ ...ruleForm, enabled: checked })}
                      />
                      <Label>Enabled</Label>
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Input
                      value={ruleForm.description}
                      onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                      placeholder="Describe what this rule detects..."
                    />
                  </div>

                  <div>
                    <Label>Actions to Take</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {RISK_ACTIONS.map(action => (
                        <div key={action} className="flex items-center space-x-2">
                          <Switch
                            checked={ruleForm.actions.includes(action)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setRuleForm({
                                  ...ruleForm,
                                  actions: [...ruleForm.actions, action]
                                });
                              } else {
                                setRuleForm({
                                  ...ruleForm,
                                  actions: ruleForm.actions.filter(a => a !== action)
                                });
                              }
                            }}
                          />
                          <Label className="text-sm">{action.replace('_', ' ')}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => {
                      setIsRuleDialogOpen(false);
                      setSelectedRule(null);
                      resetRuleForm();
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={selectedRule ? handleUpdateRule : handleCreateRule}>
                      {selectedRule ? 'Update Rule' : 'Create Rule'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {securityRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{rule.name}</h3>
                        {getSeverityBadge(rule.severity)}
                        <Badge variant="outline" className="text-xs">
                          {rule.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Triggered: {rule.triggeredCount} times</span>
                        {rule.lastTriggered && (
                          <span>Last: {new Date(rule.lastTriggered).toLocaleDateString()}</span>
                        )}
                        <span>Actions: {rule.actions.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditRule(rule)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Fraud Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alert</TableHead>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fraudAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{alert.ruleName}</p>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {alert.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {alert.transactionId}
                          </Badge>
                        </TableCell>
                        <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                        <TableCell>{getStatusBadge(alert.status)}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAlert(alert);
                              setIsAlertDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          {compliance && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Overall Compliance Score</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-green-600">
                          {compliance.complianceScore}%
                        </span>
                        <Progress value={compliance.complianceScore} className="w-20 h-2 mt-1" />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>PCI DSS Compliant</span>
                        {compliance.pciCompliant ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <span>GDPR Compliant</span>
                        {compliance.gdprCompliant ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <span>NDPR Compliant</span>
                        {compliance.ndprCompliant ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Last Audit:</span>
                        <span>{new Date(compliance.lastAudit).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Certificate Expires:</span>
                        <span>{new Date(compliance.certificateExpiry).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Required Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {compliance.requiredActions.map((action, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Alert Details Dialog */}
      {selectedAlert && (
        <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Fraud Alert Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Alert ID</Label>
                  <p className="font-mono">{selectedAlert.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Transaction ID</Label>
                  <p className="font-mono">{selectedAlert.transactionId}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Rule Triggered</Label>
                  <p>{selectedAlert.ruleName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Severity</Label>
                  <div className="mt-1">{getSeverityBadge(selectedAlert.severity)}</div>
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Description</Label>
                <p className="mt-1">{selectedAlert.description}</p>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Evidence</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded font-mono text-sm">
                  {JSON.stringify(selectedAlert.evidence, null, 2)}
                </div>
              </div>

              {selectedAlert.status === 'pending' && (
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleResolveAlert(selectedAlert.id, 'false_positive')}
                  >
                    Mark False Positive
                  </Button>
                  <Button
                    onClick={() => handleResolveAlert(selectedAlert.id, 'investigating')}
                  >
                    Start Investigation
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleResolveAlert(selectedAlert.id, 'resolved')}
                  >
                    Block Transaction
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default PaymentSecurity;
