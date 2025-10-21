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
  Scale, 
  FileText, 
  MessageSquare, 
  Upload, 
  Download,
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Gavel,
  Eye,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  User,
  Package,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Dispute, DisputeEvidence, DisputeMessage, DisputeResolution } from './types';
import { legalService } from '@/services/legalService';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const DisputeResolution: React.FC = () => {
  const { user } = useAuthContext();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);

  const [newDispute, setNewDispute] = useState({
    orderId: '',
    disputeType: 'product_not_received' as const,
    subject: '',
    description: '',
    amount: 0
  });

  const [newEvidence, setNewEvidence] = useState({
    title: '',
    description: '',
    evidenceType: 'photo' as const,
    files: [] as File[]
  });

  const [messageContent, setMessageContent] = useState('');

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const disputesData = await legalService.getDisputes();
      setDisputes(disputesData);
    } catch (error) {
      toast.error('Failed to load disputes');
      console.error('Disputes loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDispute = async () => {
    try {
      const dispute = await legalService.createDispute({
        ...newDispute,
        buyerId: user!.id,
        sellerId: 'seller-id', // Would be determined from order
        currency: 'NGN'
      });
      
      setDisputes(prev => [dispute, ...prev]);
      setShowCreateDialog(false);
      setNewDispute({
        orderId: '',
        disputeType: 'product_not_received',
        subject: '',
        description: '',
        amount: 0
      });
      toast.success('Dispute created successfully');
    } catch (error) {
      toast.error('Failed to create dispute');
    }
  };

  const submitEvidence = async (disputeId: string) => {
    try {
      const evidence = await legalService.submitEvidence(disputeId, {
        ...newEvidence,
        submittedBy: user!.id
      });
      
      setDisputes(prev => prev.map(dispute => 
        dispute.id === disputeId 
          ? { ...dispute, evidence: [...dispute.evidence, evidence] }
          : dispute
      ));
      setShowEvidenceDialog(false);
      setNewEvidence({
        title: '',
        description: '',
        evidenceType: 'photo',
        files: []
      });
      toast.success('Evidence submitted successfully');
    } catch (error) {
      toast.error('Failed to submit evidence');
    }
  };

  const sendMessage = async (disputeId: string) => {
    if (!messageContent.trim()) return;

    try {
      const message = await legalService.sendDisputeMessage(disputeId, {
        senderId: user!.id,
        senderType: 'buyer', // Would be determined from user role
        content: messageContent,
        isInternal: false
      });
      
      setDisputes(prev => prev.map(dispute => 
        dispute.id === disputeId 
          ? { ...dispute, messages: [...dispute.messages, message] }
          : dispute
      ));
      setMessageContent('');
      toast.success('Message sent successfully');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const resolveDispute = async (disputeId: string, resolution: any) => {
    try {
      await legalService.resolveDispute(disputeId, resolution);
      setDisputes(prev => prev.map(dispute => 
        dispute.id === disputeId 
          ? { ...dispute, status: 'resolved', resolution }
          : dispute
      ));
      toast.success('Dispute resolved successfully');
    } catch (error) {
      toast.error('Failed to resolve dispute');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in_mediation':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'escalated':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'closed':
        return <FileText className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getDisputeTypeLabel = (type: string) => {
    const labels = {
      product_not_received: 'Product Not Received',
      product_not_as_described: 'Product Not As Described',
      refund_request: 'Refund Request',
      payment_issue: 'Payment Issue',
      shipping_damage: 'Shipping Damage',
      other: 'Other'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.disputeNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || dispute.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const disputeStats = {
    totalDisputes: disputes.length,
    openDisputes: disputes.filter(d => d.status === 'open').length,
    inMediation: disputes.filter(d => d.status === 'in_mediation').length,
    resolvedDisputes: disputes.filter(d => d.status === 'resolved').length,
    averageResolutionTime: 5.2, // days
    resolutionRate: 94.2, // percentage
    totalDisputeAmount: disputes.reduce((sum, d) => sum + d.amount, 0),
    escalatedDisputes: disputes.filter(d => d.status === 'escalated').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Scale className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Loading dispute resolution center...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Dispute Resolution Center</h1>
              <p className="text-gray-600">Manage and resolve transaction disputes</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Reports
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Dispute
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dispute Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Disputes</p>
                  <p className="text-2xl font-bold">{disputeStats.totalDisputes}</p>
                  <p className="text-sm text-gray-500">{disputeStats.openDisputes} open</p>
                </div>
                <Scale className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                  <p className="text-2xl font-bold">{disputeStats.resolutionRate}%</p>
                  <p className="text-sm text-gray-500">{disputeStats.resolvedDisputes} resolved</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
                  <p className="text-2xl font-bold">{disputeStats.averageResolutionTime}</p>
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
                  <p className="text-sm font-medium text-gray-600">Dispute Amount</p>
                  <p className="text-2xl font-bold">₦{disputeStats.totalDisputeAmount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Total disputed</p>
                </div>
                <DollarSign className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="disputes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="disputes">All Disputes</TabsTrigger>
            <TabsTrigger value="mediation">In Mediation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          </TabsList>

          <TabsContent value="disputes">
            <Card>
              <CardHeader>
                <CardTitle>Dispute Management</CardTitle>
                <CardDescription>View and manage all dispute cases</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search disputes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_mediation">In Mediation</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Disputes Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dispute #</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Parties</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDisputes.slice(0, 10).map((dispute) => (
                      <TableRow key={dispute.id}>
                        <TableCell className="font-medium">{dispute.disputeNumber}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getDisputeTypeLabel(dispute.disputeType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>Buyer: {dispute.buyerId}</p>
                            <p>Seller: {dispute.sellerId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₦{dispute.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(dispute.priority)}>
                            {dispute.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(dispute.status)}
                            <span className="capitalize">{dispute.status.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(dispute.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedDispute(dispute)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {dispute.status === 'open' && (
                              <Button size="sm">Mediate</Button>
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

          <TabsContent value="mediation">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Mediations</CardTitle>
                  <CardDescription>Disputes currently in mediation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {disputes.filter(d => d.status === 'in_mediation').map((dispute) => (
                      <div key={dispute.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{dispute.disputeNumber}</h4>
                            <p className="text-sm text-gray-600">{dispute.subject}</p>
                          </div>
                          <Badge variant={getPriorityColor(dispute.priority)}>
                            {dispute.priority}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Amount: ₦{dispute.amount.toLocaleString()}</span>
                          <span>Deadline: {new Date(dispute.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">View Details</Button>
                          <Button size="sm">Continue Mediation</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mediation Guidelines</CardTitle>
                  <CardDescription>Process and best practices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium">Step 1: Evidence Review</h4>
                      <p className="text-sm text-gray-600">Review all submitted evidence from both parties</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium">Step 2: Communication</h4>
                      <p className="text-sm text-gray-600">Facilitate discussion between parties</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium">Step 3: Resolution</h4>
                      <p className="text-sm text-gray-600">Propose fair resolution based on evidence</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium">Step 4: Implementation</h4>
                      <p className="text-sm text-gray-600">Ensure resolution is properly executed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dispute Trends</CardTitle>
                  <CardDescription>Dispute patterns over time</CardDescription>
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

              <Card>
                <CardHeader>
                  <CardTitle>Resolution Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Response Time</span>
                      <span className="font-semibold">4.2 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>First Contact Resolution</span>
                      <span className="font-semibold">68%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Mediation Success Rate</span>
                      <span className="font-semibold">85%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>User Satisfaction</span>
                      <span className="font-semibold">4.3/5.0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Escalation Rate</span>
                      <span className="font-semibold">12%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Dispute Categories</CardTitle>
                <CardDescription>Breakdown by dispute type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { type: 'Product Not Received', count: 45, percentage: 35 },
                    { type: 'Not As Described', count: 32, percentage: 25 },
                    { type: 'Refund Request', count: 28, percentage: 22 },
                    { type: 'Payment Issue', count: 15, percentage: 12 },
                    { type: 'Shipping Damage', count: 8, percentage: 6 }
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <p className="text-2xl font-bold">{item.count}</p>
                      <p className="text-sm font-medium">{item.type}</p>
                      <Progress value={item.percentage} className="mt-2" />
                      <p className="text-xs text-gray-500 mt-1">{item.percentage}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guidelines">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dispute Resolution Process</CardTitle>
                  <CardDescription>Step-by-step resolution workflow</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      {
                        step: 1,
                        title: 'Dispute Filing',
                        description: 'User submits dispute with evidence and description',
                        duration: '0-1 day'
                      },
                      {
                        step: 2,
                        title: 'Initial Review',
                        description: 'Platform reviews submission and notifies parties',
                        duration: '1-2 days'
                      },
                      {
                        step: 3,
                        title: 'Evidence Collection',
                        description: 'Both parties submit supporting evidence',
                        duration: '3-5 days'
                      },
                      {
                        step: 4,
                        title: 'Mediation',
                        description: 'Neutral mediator facilitates resolution',
                        duration: '5-10 days'
                      },
                      {
                        step: 5,
                        title: 'Resolution',
                        description: 'Final decision implemented and funds released',
                        duration: '10-14 days'
                      }
                    ].map((phase) => (
                      <div key={phase.step} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {phase.step}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{phase.title}</h4>
                          <p className="text-sm text-gray-600">{phase.description}</p>
                          <p className="text-xs text-gray-500 mt-1">Timeline: {phase.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resolution Guidelines</CardTitle>
                  <CardDescription>Decision-making framework</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <Gavel className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Fair Resolution:</strong> All decisions must be based on evidence and platform policies, ensuring fair treatment for all parties involved.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">Evidence Standards</h4>
                        <ul className="text-sm text-gray-600 ml-4 mt-1 space-y-1">
                          <li>• Clear photographic evidence</li>
                          <li>• Tracking and shipping records</li>
                          <li>• Communication screenshots</li>
                          <li>• Transaction documentation</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium">Resolution Types</h4>
                        <ul className="text-sm text-gray-600 ml-4 mt-1 space-y-1">
                          <li>• Full refund to buyer</li>
                          <li>• Partial refund</li>
                          <li>• Product replacement</li>
                          <li>• Seller compensation</li>
                          <li>• No action required</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium">Appeal Process</h4>
                        <p className="text-sm text-gray-600">
                          Parties have 7 days to appeal a decision with new evidence or procedural concerns.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Dispute Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Dispute</DialogTitle>
            <DialogDescription>
              File a dispute for a transaction or order issue
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                value={newDispute.orderId}
                onChange={(e) => setNewDispute(prev => ({ ...prev, orderId: e.target.value }))}
                placeholder="Enter order ID"
              />
            </div>

            <div>
              <Label htmlFor="disputeType">Dispute Type</Label>
              <Select 
                value={newDispute.disputeType} 
                onValueChange={(value) => setNewDispute(prev => ({ ...prev, disputeType: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product_not_received">Product Not Received</SelectItem>
                  <SelectItem value="product_not_as_described">Product Not As Described</SelectItem>
                  <SelectItem value="refund_request">Refund Request</SelectItem>
                  <SelectItem value="payment_issue">Payment Issue</SelectItem>
                  <SelectItem value="shipping_damage">Shipping Damage</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={newDispute.subject}
                onChange={(e) => setNewDispute(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief description of the issue"
              />
            </div>

            <div>
              <Label htmlFor="amount">Dispute Amount</Label>
              <Input
                id="amount"
                type="number"
                value={newDispute.amount}
                onChange={(e) => setNewDispute(prev => ({ ...prev, amount: Number(e.target.value) }))}
                placeholder="Amount in NGN"
              />
            </div>

            <div>
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                value={newDispute.description}
                onChange={(e) => setNewDispute(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide detailed information about the issue..."
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={createDispute} className="flex-1">
                Create Dispute
              </Button>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dispute Details Modal would go here */}
    </div>
  );
};

export default DisputeResolution;
