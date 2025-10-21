import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Send,
  Settings,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit3,
  Copy,
  Filter,
  Search,
  Download,
  RefreshCw,
  Zap,
  Target,
  Activity,
  BarChart3,
  TrendingUp,
  Volume2,
  Vibrate,
  Globe,
  Calendar,
  User,
  Package,
  MapPin
} from 'lucide-react';
import { DeliveryNotification } from '@/types/delivery';

interface NotificationTemplate {
  id: string;
  name: string;
  trigger: string;
  channels: NotificationChannel[];
  subject?: string;
  message: string;
  variables: string[];
  isActive: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timing?: {
    delay?: number; // minutes
    schedule?: string; // cron expression
  };
}

interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'whatsapp' | 'webhook';
  enabled: boolean;
  config?: Record<string, any>;
}

interface NotificationSettings {
  channels: {
    email: {
      enabled: boolean;
      provider: 'sendgrid' | 'amazon_ses' | 'mailgun' | 'custom';
      config: Record<string, any>;
    };
    sms: {
      enabled: boolean;
      provider: 'twilio' | 'amazon_sns' | 'termii' | 'custom';
      config: Record<string, any>;
    };
    push: {
      enabled: boolean;
      provider: 'firebase' | 'onesignal' | 'pusher' | 'custom';
      config: Record<string, any>;
    };
    whatsapp: {
      enabled: boolean;
      provider: 'twilio' | 'facebook' | 'custom';
      config: Record<string, any>;
    };
  };
  defaultSettings: {
    retryAttempts: number;
    retryDelay: number;
    timeout: number;
    rateLimit: number;
  };
  preferences: {
    quietHours: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
    grouping: boolean;
    deduplication: boolean;
  };
}

interface NotificationLog {
  id: string;
  templateId: string;
  templateName: string;
  recipient: string;
  channels: string[];
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt: string;
  deliveredAt?: string;
  error?: string;
  deliveryId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface NotificationAnalytics {
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  responseTime: number;
  byChannel: Record<string, {
    sent: number;
    delivered: number;
    failed: number;
    rate: number;
  }>;
  byTemplate: Record<string, {
    sent: number;
    delivered: number;
    engagement: number;
  }>;
}

export const AdvancedNotificationSystem: React.FC = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testRecipient, setTestRecipient] = useState('');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    loadNotificationData();
  }, []);

  const loadNotificationData = async () => {
    try {
      setLoading(true);

      // Mock notification templates
      const mockTemplates: NotificationTemplate[] = [
        {
          id: 'template-001',
          name: 'Order Confirmation',
          trigger: 'order_created',
          channels: [
            { type: 'email', enabled: true },
            { type: 'sms', enabled: true },
            { type: 'push', enabled: true }
          ],
          subject: 'Order Confirmed - {{orderNumber}}',
          message: 'Hi {{customerName}}, your order {{orderNumber}} has been confirmed and will be delivered to {{deliveryAddress}}. Track your order: {{trackingLink}}',
          variables: ['customerName', 'orderNumber', 'deliveryAddress', 'trackingLink', 'estimatedDelivery'],
          isActive: true,
          priority: 'normal'
        },
        {
          id: 'template-002',
          name: 'Out for Delivery',
          trigger: 'out_for_delivery',
          channels: [
            { type: 'email', enabled: true },
            { type: 'sms', enabled: true },
            { type: 'push', enabled: true },
            { type: 'whatsapp', enabled: true }
          ],
          subject: 'Your order is out for delivery!',
          message: 'Good news {{customerName}}! Your order {{orderNumber}} is out for delivery with {{agentName}} ({{agentPhone}}). Expected delivery: {{estimatedTime}}. Live tracking: {{trackingLink}}',
          variables: ['customerName', 'orderNumber', 'agentName', 'agentPhone', 'estimatedTime', 'trackingLink'],
          isActive: true,
          priority: 'high'
        },
        {
          id: 'template-003',
          name: 'Delivery Completed',
          trigger: 'delivered',
          channels: [
            { type: 'email', enabled: true },
            { type: 'sms', enabled: true },
            { type: 'push', enabled: true },
            { type: 'whatsapp', enabled: true }
          ],
          subject: 'Order Delivered Successfully!',
          message: 'Hi {{customerName}}, your order {{orderNumber}} has been delivered successfully. Thank you for choosing us! Please rate your experience: {{ratingLink}}',
          variables: ['customerName', 'orderNumber', 'deliveredAt', 'agentName', 'ratingLink'],
          isActive: true,
          priority: 'normal'
        },
        {
          id: 'template-004',
          name: 'Delivery Failed',
          trigger: 'delivery_failed',
          channels: [
            { type: 'email', enabled: true },
            { type: 'sms', enabled: true },
            { type: 'push', enabled: true },
            { type: 'whatsapp', enabled: true }
          ],
          subject: 'Delivery Attempt Failed - {{orderNumber}}',
          message: 'Hi {{customerName}}, we attempted to deliver your order {{orderNumber}} but were unable to complete it. Reason: {{failureReason}}. We will retry tomorrow or contact us to reschedule: {{supportPhone}}',
          variables: ['customerName', 'orderNumber', 'failureReason', 'nextAttempt', 'supportPhone'],
          isActive: true,
          priority: 'urgent'
        }
      ];

      // Mock settings
      const mockSettings: NotificationSettings = {
        channels: {
          email: {
            enabled: true,
            provider: 'sendgrid',
            config: {
              apiKey: 'sg_***********',
              fromEmail: 'noreply@georgy.com',
              fromName: 'Georgy Marketplace'
            }
          },
          sms: {
            enabled: true,
            provider: 'termii',
            config: {
              apiKey: 'termii_***********',
              senderId: 'GEORGY',
              channel: 'generic'
            }
          },
          push: {
            enabled: true,
            provider: 'firebase',
            config: {
              serverKey: 'fcm_***********',
              projectId: 'georgy-marketplace'
            }
          },
          whatsapp: {
            enabled: true,
            provider: 'twilio',
            config: {
              accountSid: 'twilio_***********',
              authToken: 'twilio_***********',
              phoneNumberId: '+1234567890'
            }
          }
        },
        defaultSettings: {
          retryAttempts: 3,
          retryDelay: 5,
          timeout: 30,
          rateLimit: 1000
        },
        preferences: {
          quietHours: {
            enabled: true,
            startTime: '22:00',
            endTime: '08:00'
          },
          grouping: true,
          deduplication: true
        }
      };

      // Mock notification logs
      const mockLogs: NotificationLog[] = [
        {
          id: 'log-001',
          templateId: 'template-002',
          templateName: 'Out for Delivery',
          recipient: '+234-802-123-4567',
          channels: ['sms', 'push', 'whatsapp'],
          status: 'delivered',
          sentAt: new Date(Date.now() - 30*60000).toISOString(),
          deliveredAt: new Date(Date.now() - 28*60000).toISOString(),
          deliveryId: 'delivery-001',
          userId: 'user-001'
        },
        {
          id: 'log-002',
          templateId: 'template-003',
          templateName: 'Delivery Completed',
          recipient: 'john.doe@email.com',
          channels: ['email', 'push'],
          status: 'delivered',
          sentAt: new Date(Date.now() - 60*60000).toISOString(),
          deliveredAt: new Date(Date.now() - 58*60000).toISOString(),
          deliveryId: 'delivery-002',
          userId: 'user-002'
        }
      ];

      // Mock analytics
      const mockAnalytics: NotificationAnalytics = {
        totalSent: 2847,
        deliveryRate: 96.3,
        openRate: 78.4,
        clickRate: 23.7,
        bounceRate: 2.1,
        unsubscribeRate: 0.3,
        responseTime: 1.2,
        byChannel: {
          email: { sent: 1142, delivered: 1098, failed: 44, rate: 96.1 },
          sms: { sent: 987, delivered: 965, failed: 22, rate: 97.8 },
          push: { sent: 543, delivered: 521, failed: 22, rate: 95.9 },
          whatsapp: { sent: 175, delivered: 170, failed: 5, rate: 97.1 }
        },
        byTemplate: {
          'Order Confirmation': { sent: 892, delivered: 856, engagement: 45.2 },
          'Out for Delivery': { sent: 734, delivered: 712, engagement: 67.8 },
          'Delivery Completed': { sent: 651, delivered: 634, engagement: 32.1 },
          'Delivery Failed': { sent: 89, delivered: 87, engagement: 78.3 }
        }
      };

      setTemplates(mockTemplates);
      setSettings(mockSettings);
      setNotificationLogs(mockLogs);
      setAnalytics(mockAnalytics);

    } catch (error) {
      console.error('Error loading notification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!testRecipient || !testMessage) return;

    try {
      // Mock API call to send test notification
      console.log('Sending test notification:', {
        recipient: testRecipient,
        message: testMessage
      });

      // Show success message
      alert('Test notification sent successfully!');

    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('Failed to send test notification');
    }
  };

  const toggleTemplate = async (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isActive: !template.isActive }
        : template
    ));
  };

  const duplicateTemplate = (template: NotificationTemplate) => {
    const newTemplate: NotificationTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isActive: false
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'bounced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'push':
        return <Bell className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatRate = (rate: number) => `${rate.toFixed(1)}%`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading notification system...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notification System</h1>
          <p className="text-gray-600 mt-1">
            Advanced multi-channel notification management and analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="outline" onClick={loadNotificationData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-3xl font-bold">{analytics?.totalSent.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+15.2% this month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Send className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                <p className="text-3xl font-bold">{formatRate(analytics?.deliveryRate || 0)}</p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Above target</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-3xl font-bold">{formatRate(analytics?.openRate || 0)}</p>
                <div className="flex items-center mt-2">
                  <Eye className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600">+3.4% vs avg</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-3xl font-bold">{analytics?.responseTime.toFixed(1)}s</p>
                <div className="flex items-center mt-2">
                  <Zap className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-600">Excellent</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Notification Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Channel Settings</TabsTrigger>
          <TabsTrigger value="test">Test & Debug</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Templates List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Templates</CardTitle>
                  <CardDescription>{templates.length} templates configured</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-2 p-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedTemplate?.id === template.id 
                            ? 'bg-blue-50 border-blue-300' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-sm">{template.name}</h3>
                          <div className="flex items-center space-x-1">
                            <Badge className={getPriorityColor(template.priority)}>
                              {template.priority}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <input
                                type="checkbox"
                                checked={template.isActive}
                                onChange={() => toggleTemplate(template.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4"
                              />
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 mb-2">
                          Trigger: {template.trigger}
                        </p>

                        <div className="flex items-center space-x-1">
                          {template.channels.filter(c => c.enabled).map((channel) => (
                            <div key={channel.type} className="p-1 bg-gray-100 rounded">
                              {getChannelIcon(channel.type)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Template Details */}
            <div className="lg:col-span-2">
              {selectedTemplate ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{selectedTemplate.name}</CardTitle>
                        <CardDescription>Trigger: {selectedTemplate.trigger}</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => duplicateTemplate(selectedTemplate)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Channel Configuration */}
                    <div>
                      <h4 className="font-semibold mb-3">Active Channels</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedTemplate.channels.map((channel) => (
                          <div key={channel.type} className={`p-3 border rounded-lg ${
                            channel.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center space-x-2 mb-2">
                              {getChannelIcon(channel.type)}
                              <span className="font-medium capitalize">{channel.type}</span>
                              <Badge variant={channel.enabled ? "default" : "secondary"}>
                                {channel.enabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>
                            {channel.enabled && (
                              <p className="text-xs text-gray-600">
                                Ready to send notifications via {channel.type}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div>
                      <h4 className="font-semibold mb-3">Message Content</h4>
                      {selectedTemplate.subject && (
                        <div className="mb-3">
                          <label className="text-sm font-medium text-gray-600">Subject</label>
                          <div className="p-3 bg-gray-50 rounded-lg mt-1">
                            <p className="text-sm">{selectedTemplate.subject}</p>
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-600">Message</label>
                        <div className="p-3 bg-gray-50 rounded-lg mt-1">
                          <p className="text-sm">{selectedTemplate.message}</p>
                        </div>
                      </div>
                    </div>

                    {/* Variables */}
                    <div>
                      <h4 className="font-semibold mb-3">Available Variables</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplate.variables.map((variable) => (
                          <Badge key={variable} variant="outline">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    <div>
                      <h4 className="font-semibold mb-3">Preview</h4>
                      <div className="border rounded-lg p-4 bg-white">
                        <div className="border-b pb-3 mb-3">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Email Preview</span>
                          </div>
                        </div>
                        {selectedTemplate.subject && (
                          <p className="font-semibold mb-2">Order Confirmed - ORD-12345</p>
                        )}
                        <p className="text-sm text-gray-700">
                          Hi John Doe, your order ORD-12345 has been confirmed and will be delivered to 
                          123 Main Street, Lagos. Track your order: https://georgy.com/track/abc123
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No template selected</h3>
                    <p className="text-gray-600">
                      Select a notification template to view details and configuration
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Notification Logs</CardTitle>
                  <CardDescription>Recent notification delivery history</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold">{log.templateName}</h4>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(log.sentAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Recipient</p>
                        <p className="text-sm">{log.recipient}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Channels</p>
                        <div className="flex items-center space-x-1 mt-1">
                          {log.channels.map((channel) => (
                            <div key={channel} className="p-1 bg-gray-100 rounded">
                              {getChannelIcon(channel)}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Delivery Time</p>
                        <p className="text-sm">
                          {log.deliveredAt 
                            ? `${Math.round((new Date(log.deliveredAt).getTime() - new Date(log.sentAt).getTime()) / 1000)}s`
                            : 'Pending'
                          }
                        </p>
                      </div>
                    </div>

                    {log.error && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-700">{log.error}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Channel Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
                <CardDescription>Delivery rates by notification channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics?.byChannel || {}).map(([channel, data]) => (
                    <div key={channel} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getChannelIcon(channel)}
                        <div>
                          <p className="font-medium capitalize">{channel}</p>
                          <p className="text-sm text-gray-600">{data.sent} sent</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{formatRate(data.rate)}</p>
                        <p className="text-sm text-gray-600">
                          {data.delivered}/{data.sent}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Template Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Template Performance</CardTitle>
                <CardDescription>Engagement rates by template</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics?.byTemplate || {}).map(([template, data]) => (
                    <div key={template} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{template}</p>
                        <p className="text-sm text-gray-600">{data.sent} sent</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{formatRate(data.engagement)}</p>
                        <p className="text-sm text-gray-600">Engagement</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Trends */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Delivery Trends</CardTitle>
                <CardDescription>Notification delivery performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">Interactive delivery trends chart</p>
                    <p className="text-sm text-gray-500">
                      Shows delivery rates, open rates, and engagement over time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Channel Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Channel Configuration</CardTitle>
                <CardDescription>Configure notification channels and providers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(settings?.channels || {}).map(([channel, config]) => (
                    <div key={channel} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getChannelIcon(channel)}
                          <h4 className="font-semibold capitalize">{channel}</h4>
                        </div>
                        <Badge variant={config.enabled ? "default" : "secondary"}>
                          {config.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Provider</label>
                          <p className="text-sm capitalize">{config.provider}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Status</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Connected</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Global Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Global Settings</CardTitle>
                <CardDescription>System-wide notification preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Delivery Settings</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Retry Attempts</p>
                          <p className="text-xs text-gray-600">Number of retry attempts for failed notifications</p>
                        </div>
                        <span className="font-semibold">{settings?.defaultSettings.retryAttempts}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Retry Delay</p>
                          <p className="text-xs text-gray-600">Delay between retry attempts (minutes)</p>
                        </div>
                        <span className="font-semibold">{settings?.defaultSettings.retryDelay}m</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Rate Limit</p>
                          <p className="text-xs text-gray-600">Max notifications per hour</p>
                        </div>
                        <span className="font-semibold">{settings?.defaultSettings.rateLimit}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">User Preferences</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Quiet Hours</p>
                          <p className="text-xs text-gray-600">Prevent notifications during quiet hours</p>
                        </div>
                        <Badge variant={settings?.preferences.quietHours.enabled ? "default" : "secondary"}>
                          {settings?.preferences.quietHours.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Message Grouping</p>
                          <p className="text-xs text-gray-600">Group similar notifications</p>
                        </div>
                        <Badge variant={settings?.preferences.grouping ? "default" : "secondary"}>
                          {settings?.preferences.grouping ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Deduplication</p>
                          <p className="text-xs text-gray-600">Prevent duplicate notifications</p>
                        </div>
                        <Badge variant={settings?.preferences.deduplication ? "default" : "secondary"}>
                          {settings?.preferences.deduplication ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Notification */}
            <Card>
              <CardHeader>
                <CardTitle>Test Notification</CardTitle>
                <CardDescription>Send test notifications to verify setup</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Recipient</label>
                    <Input
                      placeholder="Enter email, phone number, or user ID"
                      value={testRecipient}
                      onChange={(e) => setTestRecipient(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Test Message</label>
                    <Textarea
                      placeholder="Enter your test message"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Channels</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="test-email" />
                        <label htmlFor="test-email" className="text-sm">Email</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="test-sms" />
                        <label htmlFor="test-sms" className="text-sm">SMS</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="test-push" />
                        <label htmlFor="test-push" className="text-sm">Push</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="test-whatsapp" />
                        <label htmlFor="test-whatsapp" className="text-sm">WhatsApp</label>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={sendTestNotification} className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Test Notification
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Notification system status and diagnostics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Email Service</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">SMS Service</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Push Service</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">WhatsApp Service</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-800">Queue Status</p>
                    </div>
                    <div className="text-sm text-blue-700">
                      <p>Pending: 0 notifications</p>
                      <p>Processing: 2 notifications</p>
                      <p>Average processing time: {analytics?.responseTime.toFixed(1)}s</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
