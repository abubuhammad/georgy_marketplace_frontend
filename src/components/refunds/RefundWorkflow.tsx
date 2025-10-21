import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  FileText, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Upload,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface RefundRequest {
  id: string;
  orderId: string;
  productName: string;
  amount: number;
  reason: string;
  reasonDetails: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'processed' | 'completed';
  requestedAt: string;
  updatedAt: string;
  requestedBy: {
    id: string;
    name: string;
    email: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
  };
  attachments: Array<{
    id: string;
    filename: string;
    url: string;
    type: string;
  }>;
  timeline: Array<{
    id: string;
    action: string;
    description: string;
    performedBy: string;
    performedAt: string;
    status: string;
  }>;
  adminNotes?: string;
  refundMethod?: 'original_payment' | 'bank_transfer' | 'store_credit';
  processingFee?: number;
}

interface RefundWorkflowProps {
  refundRequest: RefundRequest;
  userRole: 'customer' | 'seller' | 'admin';
  onUpdateRefund: (id: string, updates: Partial<RefundRequest>) => void;
  onBack: () => void;
}

const REFUND_REASONS = [
  { value: 'defective', label: 'Product is defective or damaged' },
  { value: 'not_as_described', label: 'Product not as described' },
  { value: 'wrong_item', label: 'Received wrong item' },
  { value: 'not_delivered', label: 'Product not delivered' },
  { value: 'changed_mind', label: 'Changed mind' },
  { value: 'duplicate_order', label: 'Duplicate order' },
  { value: 'seller_issue', label: 'Seller-related issue' },
  { value: 'other', label: 'Other reason' }
];

const STATUS_CONFIG = {
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-800', icon: FileText },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  processed: { label: 'Processing Refund', color: 'bg-purple-100 text-purple-800', icon: RefreshCw },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle }
};

export function RefundWorkflow({ refundRequest, userRole, onUpdateRefund, onBack }: RefundWorkflowProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [adminNotes, setAdminNotes] = useState(refundRequest.adminNotes || '');
  const [refundMethod, setRefundMethod] = useState(refundRequest.refundMethod || 'original_payment');
  const [attachments, setAttachments] = useState<File[]>([]);

  const StatusIcon = STATUS_CONFIG[refundRequest.status].icon;
  const canTakeAction = userRole === 'admin' || (userRole === 'seller' && refundRequest.status === 'pending');

  const handleStatusUpdate = async (newStatus: RefundRequest['status'], message?: string) => {
    setIsUpdating(true);
    try {
      const timeline = [
        ...refundRequest.timeline,
        {
          id: `timeline-${Date.now()}`,
          action: `Status changed to ${newStatus}`,
          description: message || `Refund status updated to ${newStatus}`,
          performedBy: userRole,
          performedAt: new Date().toISOString(),
          status: newStatus
        }
      ];

      onUpdateRefund(refundRequest.id, {
        status: newStatus,
        timeline,
        updatedAt: new Date().toISOString(),
        ...(message && { adminNotes: message })
      });
    } catch (error) {
      console.error('Failed to update refund status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddMessage = async () => {
    if (!newMessage.trim()) return;

    setIsUpdating(true);
    try {
      const timeline = [
        ...refundRequest.timeline,
        {
          id: `message-${Date.now()}`,
          action: 'Message added',
          description: newMessage,
          performedBy: userRole,
          performedAt: new Date().toISOString(),
          status: refundRequest.status
        }
      ];

      onUpdateRefund(refundRequest.id, {
        timeline,
        updatedAt: new Date().toISOString()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Failed to add message:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const calculateRefundAmount = () => {
    const processingFee = refundRequest.processingFee || 0;
    return refundRequest.amount - processingFee;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Refund Request #{refundRequest.id}</h1>
          <p className="text-gray-500">Order #{refundRequest.orderId}</p>
        </div>
        <div className="ml-auto">
          <Badge className={cn("px-3 py-1", STATUS_CONFIG[refundRequest.status].color)}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {STATUS_CONFIG[refundRequest.status].label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Refund Details */}
          <Card>
            <CardHeader>
              <CardTitle>Refund Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Product</Label>
                  <p className="font-medium">{refundRequest.productName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Amount</Label>
                  <p className="font-medium text-lg">${refundRequest.amount.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Reason</Label>
                  <p>{REFUND_REASONS.find(r => r.value === refundRequest.reason)?.label}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Requested Date</Label>
                  <p>{new Date(refundRequest.requestedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {refundRequest.reasonDetails && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Additional Details</Label>
                  <p className="mt-1 text-gray-800">{refundRequest.reasonDetails}</p>
                </div>
              )}

              {refundRequest.attachments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Attachments</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {refundRequest.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="text-sm truncate">{attachment.filename}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Refund Calculation */}
          {(refundRequest.status === 'approved' || refundRequest.status === 'processed') && (
            <Card>
              <CardHeader>
                <CardTitle>Refund Calculation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Original Amount:</span>
                  <span>${refundRequest.amount.toFixed(2)}</span>
                </div>
                {refundRequest.processingFee && (
                  <div className="flex justify-between text-red-600">
                    <span>Processing Fee:</span>
                    <span>-${refundRequest.processingFee.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Refund Amount:</span>
                  <span>${calculateRefundAmount().toFixed(2)}</span>
                </div>
                
                {userRole === 'admin' && refundRequest.status === 'approved' && (
                  <div className="pt-4">
                    <Label>Refund Method</Label>
                    <Select value={refundMethod} onValueChange={setRefundMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original_payment">Original Payment Method</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="store_credit">Store Credit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Admin Actions */}
          {canTakeAction && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {userRole === 'admin' ? 'Admin Actions' : 'Seller Response'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userRole === 'admin' && (
                  <div>
                    <Label>Admin Notes</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes about this refund request..."
                      className="mt-1"
                    />
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {refundRequest.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate('under_review', adminNotes)}
                        disabled={isUpdating}
                        variant="outline"
                      >
                        Start Review
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate('approved', adminNotes)}
                        disabled={isUpdating}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve Refund
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate('rejected', adminNotes)}
                        disabled={isUpdating}
                        variant="destructive"
                      >
                        Reject Refund
                      </Button>
                    </>
                  )}

                  {refundRequest.status === 'under_review' && userRole === 'admin' && (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate('approved', adminNotes)}
                        disabled={isUpdating}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve Refund
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate('rejected', adminNotes)}
                        disabled={isUpdating}
                        variant="destructive"
                      >
                        Reject Refund
                      </Button>
                    </>
                  )}

                  {refundRequest.status === 'approved' && userRole === 'admin' && (
                    <Button
                      onClick={() => handleStatusUpdate('processed', `Refund processing via ${refundMethod}`)}
                      disabled={isUpdating}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Process Refund
                    </Button>
                  )}

                  {refundRequest.status === 'processed' && userRole === 'admin' && (
                    <Button
                      onClick={() => handleStatusUpdate('completed', 'Refund completed successfully')}
                      disabled={isUpdating}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer & Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle>Parties Involved</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Customer</Label>
                <p className="font-medium">{refundRequest.requestedBy.name}</p>
                <p className="text-sm text-gray-500">{refundRequest.requestedBy.email}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-gray-600">Seller</Label>
                <p className="font-medium">{refundRequest.seller.name}</p>
                <p className="text-sm text-gray-500">{refundRequest.seller.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Add Message */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Add Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Add a message or update..."
                rows={3}
              />
              
              {userRole === 'customer' && (
                <div>
                  <Label>Additional Files</Label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                </div>
              )}

              <Button
                onClick={handleAddMessage}
                disabled={!newMessage.trim() || isUpdating}
                className="w-full"
              >
                Add Message
              </Button>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Refund Policy:</strong> Refunds are processed within 5-7 business days. 
              Processing fees may apply for certain payment methods.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {refundRequest.timeline.map((item, index) => (
              <div key={item.id} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    index === 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                  )}>
                    <div className="w-2 h-2 rounded-full bg-current" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{item.action}</p>
                    <time className="text-sm text-gray-500">
                      {new Date(item.performedAt).toLocaleString()}
                    </time>
                  </div>
                  <p className="text-gray-600 mt-1">{item.description}</p>
                  <p className="text-sm text-gray-500">by {item.performedBy}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RefundWorkflow;
