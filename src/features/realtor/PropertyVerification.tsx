import React, { useState, useEffect } from 'react';
import { 
  Shield, CheckCircle, XCircle, Clock, Eye, FileText,
  Upload, Download, MessageSquare, AlertTriangle, Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PropertyVerificationRequest {
  id: string;
  property_id: string;
  property_title: string;
  property_address: string;
  owner_name: string;
  owner_type: 'realtor' | 'house_agent' | 'house_owner';
  status: 'pending' | 'under_review' | 'verified' | 'rejected' | 'requires_documents';
  submission_date: string;
  verification_date?: string;
  verifier_notes?: string;
  documents: Array<{
    type: 'title_deed' | 'survey_plan' | 'building_approval' | 'tax_clearance' | 'identity' | 'other';
    name: string;
    url: string;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
  }>;
  verification_score: number;
  priority: 'low' | 'medium' | 'high';
}

interface VerificationStats {
  totalRequests: number;
  pendingReview: number;
  verifiedToday: number;
  rejectedRequests: number;
  averageProcessingTime: string;
  verificationRate: number;
}

const PropertyVerification: React.FC = () => {
  const [requests, setRequests] = useState<PropertyVerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PropertyVerificationRequest | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState<VerificationStats>({
    totalRequests: 156,
    pendingReview: 23,
    verifiedToday: 12,
    rejectedRequests: 8,
    averageProcessingTime: '2.5 days',
    verificationRate: 87.2
  });

  useEffect(() => {
    loadVerificationRequests();
  }, []);

  const loadVerificationRequests = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      // Mock data for now
      const mockRequests: PropertyVerificationRequest[] = [
        {
          id: '1',
          property_id: 'prop_001',
          property_title: 'Luxury 4-Bedroom Villa in Lekki',
          property_address: '15 Admiralty Way, Lekki Phase 1, Lagos',
          owner_name: 'John Realtor',
          owner_type: 'realtor',
          status: 'pending',
          submission_date: '2024-01-20T10:30:00Z',
          documents: [
            {
              type: 'title_deed',
              name: 'Certificate_of_Occupancy.pdf',
              url: '/documents/co_001.pdf',
              status: 'pending'
            },
            {
              type: 'survey_plan',
              name: 'Survey_Plan_2024.pdf',
              url: '/documents/survey_001.pdf',
              status: 'pending'
            },
            {
              type: 'tax_clearance',
              name: 'Tax_Clearance_Certificate.pdf',
              url: '/documents/tax_001.pdf',
              status: 'pending'
            }
          ],
          verification_score: 0,
          priority: 'high'
        },
        {
          id: '2',
          property_id: 'prop_002',
          property_title: '3-Bedroom Apartment in Victoria Island',
          property_address: '25 Ozumba Mbadiwe Avenue, Victoria Island, Lagos',
          owner_name: 'Jane House Agent',
          owner_type: 'house_agent',
          status: 'verified',
          submission_date: '2024-01-18T14:20:00Z',
          verification_date: '2024-01-19T16:45:00Z',
          verifier_notes: 'All documents verified. Property meets all requirements.',
          documents: [
            {
              type: 'title_deed',
              name: 'Title_Document.pdf',
              url: '/documents/title_002.pdf',
              status: 'approved'
            },
            {
              type: 'building_approval',
              name: 'Building_Plan_Approval.pdf',
              url: '/documents/approval_002.pdf',
              status: 'approved'
            }
          ],
          verification_score: 95,
          priority: 'medium'
        },
        {
          id: '3',
          property_id: 'prop_003',
          property_title: '2-Bedroom Flat in Surulere',
          property_address: '10 Adeniran Ogunsanya Street, Surulere, Lagos',
          owner_name: 'Bob House Owner',
          owner_type: 'house_owner',
          status: 'requires_documents',
          submission_date: '2024-01-17T09:15:00Z',
          verifier_notes: 'Missing tax clearance certificate and survey plan.',
          documents: [
            {
              type: 'identity',
              name: 'National_ID.pdf',
              url: '/documents/id_003.pdf',
              status: 'approved'
            },
            {
              type: 'title_deed',
              name: 'Deed_of_Assignment.pdf',
              url: '/documents/deed_003.pdf',
              status: 'rejected',
              notes: 'Document appears to be incomplete'
            }
          ],
          verification_score: 40,
          priority: 'low'
        }
      ];

      setRequests(mockRequests);
    } catch (error) {
      console.error('Error loading verification requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    return statusFilter === 'all' || request.status === statusFilter;
  });

  const handleVerification = async (requestId: string, decision: 'verify' | 'reject' | 'request_documents', notes: string) => {
    try {
      const newStatus = 
        decision === 'verify' ? 'verified' :
        decision === 'reject' ? 'rejected' : 'requires_documents';

      setRequests(prev => prev.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              status: newStatus as any,
              verifier_notes: notes,
              verification_date: decision === 'verify' ? new Date().toISOString() : request.verification_date,
              verification_score: decision === 'verify' ? 95 : request.verification_score
            }
          : request
      ));
      
      setSelectedRequest(null);
      setVerificationNotes('');
    } catch (error) {
      console.error('Error processing verification:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'under_review':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Under Review</Badge>;
      case 'verified':
        return <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'requires_documents':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Needs Documents</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getOwnerTypeBadge = (ownerType: string) => {
    const typeColors = {
      realtor: 'bg-purple-100 text-purple-800',
      house_agent: 'bg-blue-100 text-blue-800',
      house_owner: 'bg-green-100 text-green-800'
    };

    return (
      <Badge variant="secondary" className={typeColors[ownerType as keyof typeof typeColors]}>
        {ownerType.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Property Verification</h1>
        <p className="text-gray-600 mt-2">Review and verify property listings and documentation</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{stats.totalRequests}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pendingReview}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified Today</p>
                <p className="text-2xl font-bold">{stats.verifiedToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejectedRequests}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                <p className="text-2xl font-bold">{stats.averageProcessingTime}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{stats.verificationRate}%</p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Requests */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Verification Requests</CardTitle>
              <CardDescription>Review property verification submissions</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="requires_documents">Needs Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{request.property_title}</p>
                        <p className="text-sm text-gray-600 truncate">{request.property_address}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{request.owner_name}</p>
                    </TableCell>
                    <TableCell>{getOwnerTypeBadge(request.owner_type)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-12 text-sm font-medium">
                          {request.verification_score}%
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${request.verification_score}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(request.submission_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No verification requests found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Details Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Property Verification Review</DialogTitle>
              <DialogDescription>
                {selectedRequest.property_title} - Submitted by {selectedRequest.owner_name}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Property Details</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Property Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Property Title</Label>
                        <p className="text-sm text-gray-600">{selectedRequest.property_title}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Property Address</Label>
                        <p className="text-sm text-gray-600">{selectedRequest.property_address}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Owner Name</Label>
                        <p className="text-sm text-gray-600">{selectedRequest.owner_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Owner Type</Label>
                        <div className="mt-1">{getOwnerTypeBadge(selectedRequest.owner_type)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Current Status</Label>
                        <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Priority</Label>
                        <div className="mt-1">{getPriorityBadge(selectedRequest.priority)}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Verification Score</Label>
                        <p className="text-sm text-gray-600">{selectedRequest.verification_score}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Submitted Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedRequest.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getDocumentStatusIcon(doc.status)}
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-gray-600 capitalize">
                                {doc.type.replace('_', ' ')}
                              </p>
                              {doc.notes && (
                                <p className="text-sm text-red-600 mt-1">{doc.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              doc.status === 'approved' ? 'default' :
                              doc.status === 'rejected' ? 'destructive' : 'secondary'
                            }>
                              {doc.status}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="verification" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Verification Decision</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="notes">Verification Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add notes about your verification decision..."
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        rows={4}
                      />
                    </div>

                    {selectedRequest.verifier_notes && (
                      <div>
                        <Label className="text-sm font-medium">Previous Notes</Label>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mt-1">
                          {selectedRequest.verifier_notes}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(null);
                          setVerificationNotes('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleVerification(selectedRequest.id, 'request_documents', verificationNotes)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Request Documents
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleVerification(selectedRequest.id, 'reject', verificationNotes)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleVerification(selectedRequest.id, 'verify', verificationNotes)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify Property
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PropertyVerification;
