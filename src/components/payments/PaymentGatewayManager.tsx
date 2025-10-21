import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  CreditCard,
  Smartphone,
  Building,
  Banknote,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  Activity,
  Shield,
  Zap,
  Globe,
  Code,
  Database
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
import { Textarea } from '@/components/ui/textarea';
import { PaymentMethod } from '@/types/payment';
import { paymentApiService } from '@/services/paymentService-api';

interface PaymentGatewayManagerProps {
  className?: string;
}

interface PaymentGateway {
  id: string;
  name: string;
  provider: string;
  type: 'card' | 'bank_transfer' | 'mobile_money' | 'crypto' | 'wallet';
  status: 'active' | 'inactive' | 'maintenance';
  enabled: boolean;
  config: {
    apiKey?: string;
    secretKey?: string;
    publicKey?: string;
    sandboxMode: boolean;
    webhookUrl?: string;
    callbackUrl?: string;
  };
  fees: {
    percentage: number;
    fixed: number;
    cap?: number;
  };
  limits: {
    min: number;
    max: number;
    daily: number;
    monthly: number;
  };
  supportedCurrencies: string[];
  countries: string[];
  features: string[];
  metadata?: Record<string, any>;
}

interface WebhookEvent {
  id: string;
  gatewayId: string;
  eventType: string;
  status: 'pending' | 'processed' | 'failed' | 'retry';
  attempts: number;
  payload: Record<string, any>;
  response?: string;
  error?: string;
  createdAt: string;
  processedAt?: string;
}

interface GatewayStats {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalVolume: number;
  uptime: number;
  avgResponseTime: number;
  webhookDeliveryRate: number;
}

export function PaymentGatewayManager({ className }: PaymentGatewayManagerProps) {
  const [loading, setLoading] = useState(false);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([]);
  const [stats, setStats] = useState<Record<string, GatewayStats>>({});
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [isGatewayDialogOpen, setIsGatewayDialogOpen] = useState(false);
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('gateways');

  // Gateway form state
  const [gatewayForm, setGatewayForm] = useState({
    name: '',
    provider: '',
    type: 'card' as const,
    enabled: true,
    config: {
      sandboxMode: true,
      webhookUrl: '',
      callbackUrl: ''
    },
    fees: {
      percentage: 1.5,
      fixed: 100,
      cap: 2000
    },
    limits: {
      min: 100,
      max: 5000000,
      daily: 50000000,
      monthly: 1000000000
    },
    supportedCurrencies: ['NGN'],
    countries: ['NG'],
    features: []
  });

  // Available payment providers
  const PROVIDERS = [
    { id: 'paystack', name: 'Paystack', types: ['card', 'bank_transfer', 'mobile_money'] },
    { id: 'flutterwave', name: 'Flutterwave', types: ['card', 'bank_transfer', 'mobile_money'] },
    { id: 'stripe', name: 'Stripe', types: ['card'] },
    { id: 'paypal', name: 'PayPal', types: ['wallet'] },
    { id: 'interswitch', name: 'Interswitch', types: ['card', 'bank_transfer'] },
    { id: 'remita', name: 'Remita', types: ['bank_transfer'] },
    { id: 'opay', name: 'OPay', types: ['mobile_money', 'bank_transfer'] }
  ];

  const FEATURES = [
    'recurring_payments',
    'partial_refunds',
    'webhooks',
    'hosted_checkout',
    'tokenization',
    'fraud_detection',
    '3ds_support',
    'split_payments',
    'bulk_payments',
    'virtual_accounts'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gatewaysData, webhooksData, statsData] = await Promise.all([
        paymentApiService.getPaymentGateways(),
        paymentApiService.getWebhookEvents(),
        paymentApiService.getGatewayStats()
      ]);
      setGateways(gatewaysData);
      setWebhooks(webhooksData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load gateway data:', error);
      // Fallback data
      setGateways([
        {
          id: '1',
          name: 'Paystack Production',
          provider: 'paystack',
          type: 'card',
          status: 'active',
          enabled: true,
          config: {
            sandboxMode: false,
            webhookUrl: 'https://api.georgy.com/webhooks/paystack',
            callbackUrl: 'https://georgy.com/payment/callback'
          },
          fees: { percentage: 1.5, fixed: 100, cap: 2000 },
          limits: { min: 100, max: 5000000, daily: 50000000, monthly: 1000000000 },
          supportedCurrencies: ['NGN', 'USD'],
          countries: ['NG', 'GH', 'ZA'],
          features: ['webhooks', 'hosted_checkout', 'tokenization', 'fraud_detection']
        },
        {
          id: '2',
          name: 'Flutterwave Sandbox',
          provider: 'flutterwave',
          type: 'mobile_money',
          status: 'active',
          enabled: false,
          config: {
            sandboxMode: true,
            webhookUrl: 'https://api.georgy.com/webhooks/flutterwave'
          },
          fees: { percentage: 1.4, fixed: 50 },
          limits: { min: 50, max: 2000000, daily: 20000000, monthly: 500000000 },
          supportedCurrencies: ['NGN', 'USD', 'GBP'],
          countries: ['NG', 'GH', 'KE', 'UG'],
          features: ['webhooks', 'split_payments', 'bulk_payments']
        }
      ]);
      setWebhooks([
        {
          id: '1',
          gatewayId: '1',
          eventType: 'charge.success',
          status: 'processed',
          attempts: 1,
          payload: { event: 'charge.success', data: { reference: 'PAY123', amount: 50000 } },
          response: '{"status": "success"}',
          createdAt: '2024-01-15T10:30:00Z',
          processedAt: '2024-01-15T10:30:01Z'
        },
        {
          id: '2',
          gatewayId: '1',
          eventType: 'charge.failed',
          status: 'retry',
          attempts: 3,
          payload: { event: 'charge.failed', data: { reference: 'PAY124' } },
          error: 'Connection timeout',
          createdAt: '2024-01-15T11:00:00Z'
        }
      ]);
      setStats({
        '1': {
          totalTransactions: 1250,
          successfulTransactions: 1180,
          failedTransactions: 70,
          totalVolume: 125000000,
          uptime: 99.8,
          avgResponseTime: 1.2,
          webhookDeliveryRate: 98.5
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGateway = async () => {
    try {
      setLoading(true);
      const newGateway = await paymentApiService.createPaymentGateway(gatewayForm);
      setGateways([...gateways, newGateway]);
      setIsGatewayDialogOpen(false);
      resetGatewayForm();
    } catch (error) {
      console.error('Failed to create gateway:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGateway = async () => {
    if (!selectedGateway) return;

    try {
      setLoading(true);
      const updatedGateway = await paymentApiService.updatePaymentGateway(selectedGateway.id, gatewayForm);
      setGateways(gateways.map(g => g.id === selectedGateway.id ? updatedGateway : g));
      setIsGatewayDialogOpen(false);
      setSelectedGateway(null);
      resetGatewayForm();
    } catch (error) {
      console.error('Failed to update gateway:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGateway = async (gatewayId: string, enabled: boolean) => {
    try {
      await paymentApiService.togglePaymentGateway(gatewayId, enabled);
      setGateways(gateways.map(g => g.id === gatewayId ? { ...g, enabled } : g));
    } catch (error) {
      console.error('Failed to toggle gateway:', error);
    }
  };

  const handleRetryWebhook = async (webhookId: string) => {
    try {
      setLoading(true);
      await paymentApiService.retryWebhook(webhookId);
      loadData(); // Reload data
    } catch (error) {
      console.error('Failed to retry webhook:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async (gatewayId: string) => {
    try {
      setLoading(true);
      await paymentApiService.testWebhook(gatewayId);
      alert('Test webhook sent successfully!');
    } catch (error) {
      console.error('Failed to test webhook:', error);
      alert('Failed to send test webhook');
    } finally {
      setLoading(false);
    }
  };

  const resetGatewayForm = () => {
    setGatewayForm({
      name: '',
      provider: '',
      type: 'card',
      enabled: true,
      config: {
        sandboxMode: true,
        webhookUrl: '',
        callbackUrl: ''
      },
      fees: {
        percentage: 1.5,
        fixed: 100,
        cap: 2000
      },
      limits: {
        min: 100,
        max: 5000000,
        daily: 50000000,
        monthly: 1000000000
      },
      supportedCurrencies: ['NGN'],
      countries: ['NG'],
      features: []
    });
  };

  const openEditGateway = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setGatewayForm({
      name: gateway.name,
      provider: gateway.provider,
      type: gateway.type,
      enabled: gateway.enabled,
      config: gateway.config,
      fees: gateway.fees,
      limits: gateway.limits,
      supportedCurrencies: gateway.supportedCurrencies,
      countries: gateway.countries,
      features: gateway.features
    });
    setIsGatewayDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-red-100 text-red-800', icon: XCircle },
      maintenance: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
    };
    
    const config = configs[status as keyof typeof configs];
    const Icon = config?.icon || Clock;
    
    return (
      <Badge variant="secondary" className={config?.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getWebhookStatusBadge = (status: string) => {
    const configs = {
      processed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      retry: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw }
    };
    
    const config = configs[status as keyof typeof configs];
    const Icon = config?.icon || Clock;
    
    return (
      <Badge variant="secondary" className={config?.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getProviderIcon = (provider: string) => {
    const icons = {
      paystack: CreditCard,
      flutterwave: Smartphone,
      stripe: CreditCard,
      paypal: Globe,
      interswitch: Building,
      remita: Banknote,
      opay: Smartphone
    };
    return icons[provider as keyof typeof icons] || CreditCard;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Payment Gateway Management
          </CardTitle>
          <p className="text-sm text-gray-600">
            Manage payment providers, webhook endpoints, and transaction monitoring
          </p>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook Events</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="space-y-4">
          {/* Gateways Actions */}
          <div className="flex justify-end">
            <Dialog open={isGatewayDialogOpen} onOpenChange={setIsGatewayDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Gateway
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedGateway ? 'Edit Gateway' : 'Add Payment Gateway'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Gateway Name</Label>
                      <Input
                        value={gatewayForm.name}
                        onChange={(e) => setGatewayForm({ ...gatewayForm, name: e.target.value })}
                        placeholder="e.g., Paystack Production"
                      />
                    </div>
                    <div>
                      <Label>Provider</Label>
                      <Select 
                        value={gatewayForm.provider} 
                        onValueChange={(value) => setGatewayForm({ ...gatewayForm, provider: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVIDERS.map(provider => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Payment Type</Label>
                      <Select 
                        value={gatewayForm.type} 
                        onValueChange={(value: any) => setGatewayForm({ ...gatewayForm, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="card">Credit/Debit Card</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                          <SelectItem value="crypto">Cryptocurrency</SelectItem>
                          <SelectItem value="wallet">Digital Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        checked={gatewayForm.enabled}
                        onCheckedChange={(checked) => setGatewayForm({ ...gatewayForm, enabled: checked })}
                      />
                      <Label>Enabled</Label>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">Configuration</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label className="text-xs">Webhook URL</Label>
                        <Input
                          value={gatewayForm.config.webhookUrl}
                          onChange={(e) => setGatewayForm({
                            ...gatewayForm,
                            config: { ...gatewayForm.config, webhookUrl: e.target.value }
                          })}
                          placeholder="https://api.your-site.com/webhooks"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Callback URL</Label>
                        <Input
                          value={gatewayForm.config.callbackUrl}
                          onChange={(e) => setGatewayForm({
                            ...gatewayForm,
                            config: { ...gatewayForm.config, callbackUrl: e.target.value }
                          })}
                          placeholder="https://your-site.com/payment/callback"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        checked={gatewayForm.config.sandboxMode}
                        onCheckedChange={(checked) => setGatewayForm({
                          ...gatewayForm,
                          config: { ...gatewayForm.config, sandboxMode: checked }
                        })}
                      />
                      <Label className="text-xs">Sandbox Mode</Label>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">Fees & Limits</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <Label className="text-xs">Percentage (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={gatewayForm.fees.percentage}
                          onChange={(e) => setGatewayForm({
                            ...gatewayForm,
                            fees: { ...gatewayForm.fees, percentage: parseFloat(e.target.value) }
                          })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Fixed Fee (₦)</Label>
                        <Input
                          type="number"
                          value={gatewayForm.fees.fixed}
                          onChange={(e) => setGatewayForm({
                            ...gatewayForm,
                            fees: { ...gatewayForm.fees, fixed: parseInt(e.target.value) }
                          })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Fee Cap (₦)</Label>
                        <Input
                          type="number"
                          value={gatewayForm.fees.cap || ''}
                          onChange={(e) => setGatewayForm({
                            ...gatewayForm,
                            fees: { ...gatewayForm.fees, cap: parseInt(e.target.value) || undefined }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Features</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {FEATURES.map(feature => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Switch
                            checked={gatewayForm.features.includes(feature)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setGatewayForm({
                                  ...gatewayForm,
                                  features: [...gatewayForm.features, feature]
                                });
                              } else {
                                setGatewayForm({
                                  ...gatewayForm,
                                  features: gatewayForm.features.filter(f => f !== feature)
                                });
                              }
                            }}
                          />
                          <Label className="text-xs">{feature.replace('_', ' ')}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => {
                      setIsGatewayDialogOpen(false);
                      setSelectedGateway(null);
                      resetGatewayForm();
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={selectedGateway ? handleUpdateGateway : handleCreateGateway}>
                      {selectedGateway ? 'Update Gateway' : 'Create Gateway'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Gateways List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {gateways.map((gateway) => {
              const ProviderIcon = getProviderIcon(gateway.provider);
              const gatewayStats = stats[gateway.id];
              
              return (
                <Card key={gateway.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ProviderIcon className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">{gateway.name}</h3>
                          <p className="text-sm text-gray-600">{gateway.provider}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(gateway.status)}
                        <Switch
                          checked={gateway.enabled}
                          onCheckedChange={(checked) => handleToggleGateway(gateway.id, checked)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Type:</span>
                        <Badge variant="outline">{gateway.type}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Fee:</span>
                        <span>{gateway.fees.percentage}% + ₦{gateway.fees.fixed}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Currencies:</span>
                        <span>{gateway.supportedCurrencies.join(', ')}</span>
                      </div>
                      
                      {gatewayStats && (
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">
                              {((gatewayStats.successfulTransactions / gatewayStats.totalTransactions) * 100).toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-600">Success Rate</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-blue-600">{gatewayStats.uptime}%</p>
                            <p className="text-xs text-gray-600">Uptime</p>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestWebhook(gateway.id)}
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Test
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditGateway(gateway)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Webhook Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhooks.map((webhook) => {
                      const gateway = gateways.find(g => g.id === webhook.gatewayId);
                      return (
                        <TableRow key={webhook.id}>
                          <TableCell>
                            <Badge variant="outline">{webhook.eventType}</Badge>
                          </TableCell>
                          <TableCell>{gateway?.name || 'Unknown'}</TableCell>
                          <TableCell>{getWebhookStatusBadge(webhook.status)}</TableCell>
                          <TableCell>{webhook.attempts}/3</TableCell>
                          <TableCell className="text-sm">
                            {new Date(webhook.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Show webhook details
                                  alert(JSON.stringify(webhook.payload, null, 2));
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {webhook.status === 'failed' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRetryWebhook(webhook.id)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <RefreshCw className="h-4 w-4" />
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(stats).map(([gatewayId, gatewayStats]) => {
              const gateway = gateways.find(g => g.id === gatewayId);
              if (!gateway) return null;

              return (
                <Card key={gatewayId}>
                  <CardHeader>
                    <CardTitle className="text-lg">{gateway.name} Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{gatewayStats.totalTransactions}</p>
                          <p className="text-sm text-gray-600">Total Transactions</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            ₦{(gatewayStats.totalVolume / 1000000).toFixed(1)}M
                          </p>
                          <p className="text-sm text-gray-600">Total Volume</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Success Rate</span>
                          <span>{((gatewayStats.successfulTransactions / gatewayStats.totalTransactions) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={(gatewayStats.successfulTransactions / gatewayStats.totalTransactions) * 100} 
                          className="h-2" 
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Uptime</span>
                          <span>{gatewayStats.uptime}%</span>
                        </div>
                        <Progress value={gatewayStats.uptime} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Avg Response Time</p>
                          <p className="font-medium">{gatewayStats.avgResponseTime}s</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Webhook Delivery</p>
                          <p className="font-medium">{gatewayStats.webhookDeliveryRate}%</p>
                        </div>
                      </div>
                    </div>
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

export default PaymentGatewayManager;
