import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  TestTube,
  Play,
  Square,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  Activity,
  Settings,
  Code,
  Database,
  Globe,
  CreditCard,
  DollarSign,
  Shield,
  FileText,
  Download,
  RefreshCw,
  Eye
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
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { paymentApiService } from '@/services/paymentService-api';

interface PaymentTestingProps {
  className?: string;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  category: 'unit' | 'integration' | 'e2e' | 'security' | 'performance';
  tests: TestCase[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun?: string;
  duration?: number;
  passRate?: number;
}

interface TestCase {
  id: string;
  name: string;
  description: string;
  type: 'positive' | 'negative' | 'edge_case';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
  assertions: TestAssertion[];
}

interface TestAssertion {
  id: string;
  description: string;
  expected: any;
  actual?: any;
  status: 'passed' | 'failed';
}

interface TestEnvironment {
  id: string;
  name: string;
  type: 'sandbox' | 'staging' | 'production';
  config: {
    baseUrl: string;
    apiKey: string;
    webhookUrl: string;
    enabled: boolean;
  };
  status: 'active' | 'inactive';
  lastHealthCheck?: string;
}

export function PaymentTesting({ className }: PaymentTestingProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('suites');
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [environments, setEnvironments] = useState<TestEnvironment[]>([]);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('sandbox');
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isRunAllDialogOpen, setIsRunAllDialogOpen] = useState(false);

  // Test configuration
  const [testConfig, setTestConfig] = useState({
    parallel: true,
    timeout: 30000,
    retries: 2,
    verbose: false,
    generateReport: true
  });

  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = async () => {
    try {
      setLoading(true);
      
      // Load test suites and environments
      const testData = getTestSuites();
      const envData = getTestEnvironments();
      
      setTestSuites(testData);
      setEnvironments(envData);
    } catch (error) {
      console.error('Failed to load test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTestSuites = (): TestSuite[] => [
    {
      id: 'payment-flow',
      name: 'Payment Flow Tests',
      description: 'End-to-end payment processing tests',
      category: 'e2e',
      status: 'idle',
      tests: [
        {
          id: 'pf-001',
          name: 'Successful Card Payment',
          description: 'Test successful card payment flow',
          type: 'positive',
          status: 'pending',
          assertions: [
            { id: 'a1', description: 'Payment initializes successfully', expected: true, status: 'passed' },
            { id: 'a2', description: 'Payment status updates to completed', expected: 'completed', status: 'passed' },
            { id: 'a3', description: 'Webhook is triggered', expected: true, status: 'passed' }
          ]
        },
        {
          id: 'pf-002',
          name: 'Failed Payment Handling',
          description: 'Test payment failure scenarios',
          type: 'negative',
          status: 'pending',
          assertions: [
            { id: 'a1', description: 'Payment fails gracefully', expected: 'failed', status: 'passed' },
            { id: 'a2', description: 'Error message is displayed', expected: true, status: 'failed' }
          ]
        }
      ]
    },
    {
      id: 'revenue-sharing',
      name: 'Revenue Sharing Tests',
      description: 'Test revenue calculation and distribution',
      category: 'unit',
      status: 'idle',
      tests: [
        {
          id: 'rs-001',
          name: 'Platform Fee Calculation',
          description: 'Test platform fee calculation for different tiers',
          type: 'positive',
          status: 'pending',
          assertions: [
            { id: 'a1', description: 'Standard tier fee is 2.5%', expected: 0.025, status: 'passed' },
            { id: 'a2', description: 'Premium tier fee is 1.5%', expected: 0.015, status: 'passed' }
          ]
        },
        {
          id: 'rs-002',
          name: 'Tax Calculation',
          description: 'Test tax calculation for Nigerian transactions',
          type: 'positive',
          status: 'pending',
          assertions: [
            { id: 'a1', description: 'VAT is 7.5%', expected: 0.075, status: 'passed' },
            { id: 'a2', description: 'Service tax applied for high amounts', expected: true, status: 'passed' }
          ]
        }
      ]
    },
    {
      id: 'security-tests',
      name: 'Security Tests',
      description: 'Test fraud detection and security rules',
      category: 'security',
      status: 'idle',
      tests: [
        {
          id: 'st-001',
          name: 'Velocity Check',
          description: 'Test high-velocity transaction detection',
          type: 'negative',
          status: 'pending',
          assertions: [
            { id: 'a1', description: 'Multiple rapid transactions are flagged', expected: true, status: 'passed' },
            { id: 'a2', description: 'Alert is generated', expected: true, status: 'passed' }
          ]
        }
      ]
    },
    {
      id: 'webhook-tests',
      name: 'Webhook Tests',
      description: 'Test webhook delivery and processing',
      category: 'integration',
      status: 'idle',
      tests: [
        {
          id: 'wh-001',
          name: 'Webhook Delivery',
          description: 'Test webhook delivery to configured endpoint',
          type: 'positive',
          status: 'pending',
          assertions: [
            { id: 'a1', description: 'Webhook is delivered successfully', expected: true, status: 'passed' },
            { id: 'a2', description: 'Response status is 200', expected: 200, status: 'passed' }
          ]
        }
      ]
    }
  ];

  const getTestEnvironments = (): TestEnvironment[] => [
    {
      id: 'sandbox',
      name: 'Sandbox Environment',
      type: 'sandbox',
      config: {
        baseUrl: 'https://sandbox-api.georgy.com',
        apiKey: 'sk_test_...',
        webhookUrl: 'https://webhook-test.georgy.com',
        enabled: true
      },
      status: 'active',
      lastHealthCheck: new Date().toISOString()
    },
    {
      id: 'staging',
      name: 'Staging Environment',
      type: 'staging',
      config: {
        baseUrl: 'https://staging-api.georgy.com',
        apiKey: 'sk_staging_...',
        webhookUrl: 'https://webhook-staging.georgy.com',
        enabled: true
      },
      status: 'active'
    },
    {
      id: 'production',
      name: 'Production Environment',
      type: 'production',
      config: {
        baseUrl: 'https://api.georgy.com',
        apiKey: 'sk_live_...',
        webhookUrl: 'https://webhook.georgy.com',
        enabled: false
      },
      status: 'inactive'
    }
  ];

  const runTestSuite = async (suiteId: string) => {
    const suite = testSuites.find(s => s.id === suiteId);
    if (!suite) return;

    setRunningTests(prev => new Set([...prev, suiteId]));
    
    // Update suite status
    setTestSuites(suites => suites.map(s => 
      s.id === suiteId ? { ...s, status: 'running' } : s
    ));

    try {
      const startTime = Date.now();
      
      // Simulate running tests
      for (const test of suite.tests) {
        await runTestCase(suiteId, test.id);
        // Add small delay to simulate test execution
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const duration = Date.now() - startTime;
      const passedTests = suite.tests.filter(t => t.status === 'passed').length;
      const passRate = (passedTests / suite.tests.length) * 100;

      // Update suite with results
      setTestSuites(suites => suites.map(s => 
        s.id === suiteId 
          ? { 
              ...s, 
              status: 'completed', 
              duration,
              passRate,
              lastRun: new Date().toISOString()
            } 
          : s
      ));
    } catch (error) {
      console.error('Test suite failed:', error);
      setTestSuites(suites => suites.map(s => 
        s.id === suiteId ? { ...s, status: 'failed' } : s
      ));
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(suiteId);
        return newSet;
      });
    }
  };

  const runTestCase = async (suiteId: string, testId: string) => {
    // Update test status to running
    setTestSuites(suites => suites.map(s => 
      s.id === suiteId 
        ? {
            ...s,
            tests: s.tests.map(t => 
              t.id === testId ? { ...t, status: 'running' } : t
            )
          }
        : s
    ));

    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Randomly determine test result for demo
    const passed = Math.random() > 0.2; // 80% pass rate

    // Update test status
    setTestSuites(suites => suites.map(s => 
      s.id === suiteId 
        ? {
            ...s,
            tests: s.tests.map(t => 
              t.id === testId 
                ? { 
                    ...t, 
                    status: passed ? 'passed' : 'failed',
                    duration: Math.floor(Math.random() * 5000) + 1000,
                    error: passed ? undefined : 'Test assertion failed'
                  }
                : t
            )
          }
        : s
    ));
  };

  const runAllTests = async () => {
    setIsRunAllDialogOpen(false);
    
    for (const suite of testSuites) {
      if (!runningTests.has(suite.id)) {
        await runTestSuite(suite.id);
      }
    }
  };

  const generateTestReport = async () => {
    const report = {
      timestamp: new Date().toISOString(),
      environment: selectedEnvironment,
      summary: {
        totalSuites: testSuites.length,
        totalTests: testSuites.reduce((sum, s) => sum + s.tests.length, 0),
        passedTests: testSuites.reduce((sum, s) => 
          sum + s.tests.filter(t => t.status === 'passed').length, 0
        ),
        failedTests: testSuites.reduce((sum, s) => 
          sum + s.tests.filter(t => t.status === 'failed').length, 0
        )
      },
      suites: testSuites
    };

    // Create and download report
    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-test-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      idle: { color: 'bg-gray-100 text-gray-800', icon: Square },
      running: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      passed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      skipped: { color: 'bg-gray-100 text-gray-800', icon: Square }
    };
    
    const config = configs[status as keyof typeof configs];
    const Icon = config?.icon || Square;
    
    return (
      <Badge variant="secondary" className={config?.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      unit: TestTube,
      integration: Globe,
      e2e: Activity,
      security: Shield,
      performance: Zap
    };
    return icons[category as keyof typeof icons] || TestTube;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Payment System Testing Suite
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive testing and validation for payment flows
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {environments.map(env => (
                    <SelectItem key={env.id} value={env.id} disabled={!env.config.enabled}>
                      {env.name} ({env.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={isRunAllDialogOpen} onOpenChange={setIsRunAllDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    Run All Tests
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Run All Test Suites</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      This will run all test suites in the selected environment. 
                      This may take several minutes to complete.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={testConfig.parallel}
                          onCheckedChange={(checked) => 
                            setTestConfig({ ...testConfig, parallel: checked })
                          }
                        />
                        <Label className="text-sm">Run tests in parallel</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={testConfig.generateReport}
                          onCheckedChange={(checked) => 
                            setTestConfig({ ...testConfig, generateReport: checked })
                          }
                        />
                        <Label className="text-sm">Generate test report</Label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsRunAllDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={runAllTests}>
                        Start Testing
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={generateTestReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Test Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Test Suites</p>
                <p className="text-2xl font-bold">{testSuites.length}</p>
              </div>
              <TestTube className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold">
                  {testSuites.reduce((sum, s) => sum + s.tests.length, 0)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Passed Tests</p>
                <p className="text-2xl font-bold text-green-600">
                  {testSuites.reduce((sum, s) => 
                    sum + s.tests.filter(t => t.status === 'passed').length, 0
                  )}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed Tests</p>
                <p className="text-2xl font-bold text-red-600">
                  {testSuites.reduce((sum, s) => 
                    sum + s.tests.filter(t => t.status === 'failed').length, 0
                  )}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="integration">Integration Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="suites" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {testSuites.map((suite) => {
              const CategoryIcon = getCategoryIcon(suite.category);
              const isRunning = runningTests.has(suite.id);
              
              return (
                <Card key={suite.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CategoryIcon className="h-5 w-5 text-gray-600" />
                        <div>
                          <h3 className="font-medium">{suite.name}</h3>
                          <p className="text-sm text-gray-600">{suite.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(suite.status)}
                        <Badge variant="outline" className="text-xs">
                          {suite.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Suite Stats */}
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Tests</p>
                          <p className="font-medium">{suite.tests.length}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Pass Rate</p>
                          <p className="font-medium">
                            {suite.passRate ? `${suite.passRate.toFixed(1)}%` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Duration</p>
                          <p className="font-medium">
                            {suite.duration ? `${(suite.duration / 1000).toFixed(1)}s` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Last Run</p>
                          <p className="font-medium text-xs">
                            {suite.lastRun 
                              ? new Date(suite.lastRun).toLocaleDateString()
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Test Cases */}
                      <div className="space-y-2">
                        {suite.tests.map((test) => (
                          <div key={test.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{test.name}</span>
                                {getStatusBadge(test.status)}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{test.description}</p>
                            </div>
                            <div className="text-xs text-gray-500">
                              {test.duration && `${test.duration}ms`}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between items-center pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSuite(suite)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => runTestSuite(suite.id)}
                          disabled={isRunning}
                        >
                          {isRunning ? (
                            <Clock className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4 mr-1" />
                          )}
                          {isRunning ? 'Running...' : 'Run Suite'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="environments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {environments.map((env) => (
              <Card key={env.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{env.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{env.type} Environment</p>
                    </div>
                    <Badge variant={env.status === 'active' ? 'default' : 'secondary'}>
                      {env.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Base URL</p>
                        <p className="font-mono text-xs truncate">{env.config.baseUrl}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Webhook URL</p>
                        <p className="font-mono text-xs truncate">{env.config.webhookUrl}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enabled for Testing</span>
                      <Switch checked={env.config.enabled} />
                    </div>

                    {env.lastHealthCheck && (
                      <div className="text-xs text-gray-500">
                        Last health check: {new Date(env.lastHealthCheck).toLocaleString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Integration Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Sandbox Testing</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm mb-2">Use these test credentials for sandbox testing:</p>
                  <div className="space-y-2 font-mono text-xs">
                    <div><strong>API Key:</strong> sk_test_payment_georgy_marketplace</div>
                    <div><strong>Webhook Secret:</strong> whsec_test_webhook_secret_key</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Test Card Numbers</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Card Number</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Expected Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono">4084 0840 8408 4081</TableCell>
                        <TableCell>Visa</TableCell>
                        <TableCell>Success</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono">4000 0000 0000 0002</TableCell>
                        <TableCell>Visa</TableCell>
                        <TableCell>Declined</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono">4000 0000 0000 0119</TableCell>
                        <TableCell>Visa</TableCell>
                        <TableCell>Processing Error</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Webhook Testing</h3>
                <Alert>
                  <Globe className="h-4 w-4" />
                  <AlertDescription>
                    Use ngrok or a similar tool to expose your local webhook endpoint for testing:
                    <code className="block mt-2 p-2 bg-gray-100 rounded text-sm">
                      ngrok http 3000
                    </code>
                    Then update your webhook URL in the dashboard.
                  </AlertDescription>
                </Alert>
              </div>

              <div>
                <h3 className="font-medium mb-3">Test Automation Setup</h3>
                <div className="space-y-3">
                  <p className="text-sm">Install testing dependencies:</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    npm install --save-dev jest supertest playwright
                  </div>
                  
                  <p className="text-sm">Sample test configuration:</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
{`// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/services/payment/**/*.js',
    '!src/**/*.test.js'
  ]
};`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Details Dialog */}
      {selectedSuite && (
        <Dialog open={!!selectedSuite} onOpenChange={() => setSelectedSuite(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedSuite.name} - Test Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Category</Label>
                  <p className="capitalize">{selectedSuite.category}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedSuite.status)}</div>
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Description</Label>
                <p className="mt-1">{selectedSuite.description}</p>
              </div>

              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Test Cases</Label>
                <div className="space-y-3">
                  {selectedSuite.tests.map((test) => (
                    <Card key={test.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{test.name}</h4>
                            <p className="text-sm text-gray-600">{test.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(test.status)}
                            <Badge variant="outline" className="text-xs">
                              {test.type}
                            </Badge>
                          </div>
                        </div>

                        {test.assertions.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">Assertions:</Label>
                            {test.assertions.map((assertion) => (
                              <div key={assertion.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                                <span>{assertion.description}</span>
                                {getStatusBadge(assertion.status)}
                              </div>
                            ))}
                          </div>
                        )}

                        {test.error && (
                          <Alert className="mt-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              {test.error}
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default PaymentTesting;
