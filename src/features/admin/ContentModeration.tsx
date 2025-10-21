import React, { useState, useEffect } from 'react';
import { 
  Flag, Search, Filter, MoreHorizontal, Eye, Check, X, 
  AlertTriangle, MessageSquare, Package, Home, Briefcase
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface ReportedContent {
  id: string;
  type: 'product' | 'property' | 'job' | 'message' | 'review';
  title: string;
  description: string;
  reported_by: string;
  reason: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  content_id: string;
  reporter_email: string;
}

const ContentModeration: React.FC = () => {
  const [reports, setReports] = useState<ReportedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<ReportedContent | null>(null);
  const [moderationNote, setModerationNote] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      // Mock data for now
      const mockReports: ReportedContent[] = [
        {
          id: '1',
          type: 'product',
          title: 'iPhone 13 Pro Max - Suspicious Listing',
          description: 'This product listing appears to be fraudulent with unrealistic pricing',
          reported_by: 'John Doe',
          reporter_email: 'john@example.com',
          reason: 'Fraudulent listing',
          status: 'pending',
          priority: 'high',
          created_at: '2024-01-20T10:30:00Z',
          content_id: 'prod_123'
        },
        {
          id: '2',
          type: 'property',
          title: 'Luxury Apartment - Fake Images',
          description: 'Property listing uses stolen images from another website',
          reported_by: 'Jane Smith',
          reporter_email: 'jane@example.com',
          reason: 'Stolen images',
          status: 'reviewing',
          priority: 'medium',
          created_at: '2024-01-19T14:20:00Z',
          content_id: 'prop_456'
        },
        {
          id: '3',
          type: 'message',
          title: 'Inappropriate Communication',
          description: 'User sent inappropriate messages to other users',
          reported_by: 'Bob Johnson',
          reporter_email: 'bob@example.com',
          reason: 'Inappropriate content',
          status: 'pending',
          priority: 'high',
          created_at: '2024-01-18T09:15:00Z',
          content_id: 'msg_789'
        }
      ];
      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleModeration = async (reportId: string, action: 'approve' | 'reject', note: string) => {
    try {
      // TODO: Implement actual API calls
      console.log(`Moderating report ${reportId}: ${action} with note: ${note}`);
      
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: action === 'approve' ? 'approved' : 'rejected' }
          : report
      ));
      
      setSelectedReport(null);
      setModerationNote('');
    } catch (error) {
      console.error(`Error moderating content:`, error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'reviewing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Reviewing</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="h-4 w-4" />;
      case 'property':
        return <Home className="h-4 w-4" />;
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Flag className="h-4 w-4" />;
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
        <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
        <p className="text-gray-600 mt-2">Review and moderate flagged content</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
              <Flag className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold">{reports.filter(r => r.status === 'pending').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold">{reports.filter(r => r.priority === 'high').length}</p>
              </div>
              <Flag className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                <p className="text-2xl font-bold">{reports.filter(r => r.status === 'approved' || r.status === 'rejected').length}</p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reported Content</CardTitle>
          <CardDescription>Review and moderate user-reported content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="property">Property</SelectItem>
                <SelectItem value="job">Job</SelectItem>
                <SelectItem value="message">Message</SelectItem>
                <SelectItem value="review">Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{report.title}</p>
                        <p className="text-sm text-gray-600 truncate">{report.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(report.type)}
                        <span className="capitalize">{report.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{report.reported_by}</p>
                        <p className="text-sm text-gray-600">{report.reporter_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{report.reason}</TableCell>
                    <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(report.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => {
                                e.preventDefault();
                                setSelectedReport(report);
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                Review Content
                              </DropdownMenuItem>
                            </DialogTrigger>
                          </Dialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No reports found matching your search criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Moderation Dialog */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Reported Content</DialogTitle>
              <DialogDescription>
                Reported by {selectedReport.reported_by} on {new Date(selectedReport.created_at).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Content Details</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Title:</strong> {selectedReport.title}</p>
                  <p><strong>Type:</strong> {selectedReport.type}</p>
                  <p><strong>Description:</strong> {selectedReport.description}</p>
                  <p><strong>Reason for Report:</strong> {selectedReport.reason}</p>
                  <div className="flex items-center gap-2">
                    <strong>Priority:</strong> {getPriorityBadge(selectedReport.priority)}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Moderation Notes</h4>
                <Textarea
                  placeholder="Add notes about your moderation decision..."
                  value={moderationNote}
                  onChange={(e) => setModerationNote(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedReport(null);
                    setModerationNote('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleModeration(selectedReport.id, 'reject', moderationNote)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject Content
                </Button>
                <Button
                  onClick={() => handleModeration(selectedReport.id, 'approve', moderationNote)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Content
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContentModeration;
