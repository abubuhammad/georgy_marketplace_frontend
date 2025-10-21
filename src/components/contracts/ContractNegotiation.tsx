import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Edit, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Download, 
  Upload,
  AlertTriangle,
  User,
  Building,
  Calendar,
  DollarSign,
  Briefcase,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';

interface ContractTerm {
  id: string;
  section: string;
  field: string;
  label: string;
  value: string | number;
  proposedValue?: string | number;
  type: 'text' | 'number' | 'currency' | 'date' | 'boolean' | 'select';
  options?: string[];
  required: boolean;
  negotiable: boolean;
  status: 'agreed' | 'proposed' | 'rejected' | 'pending';
  lastModifiedBy: 'employer' | 'employee';
  lastModifiedAt: string;
  comments?: string[];
}

interface ContractParty {
  id: string;
  name: string;
  email: string;
  role: 'employer' | 'employee';
  avatar?: string;
  organization?: string;
  title?: string;
}

interface ContractTemplate {
  id: string;
  name: string;
  type: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship';
  industry: string;
  terms: ContractTerm[];
}

interface JobContract {
  id: string;
  jobId: string;
  jobTitle: string;
  template: ContractTemplate;
  parties: ContractParty[];
  terms: ContractTerm[];
  status: 'draft' | 'negotiating' | 'pending_approval' | 'approved' | 'signed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  messages: Array<{
    id: string;
    senderId: string;
    content: string;
    type: 'message' | 'proposal' | 'counteroffer' | 'acceptance' | 'rejection';
    timestamp: string;
    termChanges?: string[];
  }>;
  versions: Array<{
    id: string;
    version: number;
    createdAt: string;
    createdBy: string;
    changes: string[];
  }>;
  legalReview?: {
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy: string;
    reviewedAt: string;
    notes: string;
  };
}

interface ContractNegotiationProps {
  contract: JobContract;
  currentUserId: string;
  userRole: 'employer' | 'employee' | 'legal';
  onUpdateContract: (updates: Partial<JobContract>) => void;
  onSendMessage: (message: string, termChanges?: string[]) => void;
  onAcceptTerms: () => void;
  onRejectContract: (reason: string) => void;
  onRequestLegalReview: () => void;
}

const CONTRACT_STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  negotiating: { label: 'Negotiating', color: 'bg-blue-100 text-blue-800', icon: MessageSquare },
  pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  signed: { label: 'Signed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle }
};

const TERM_STATUS_CONFIG = {
  agreed: { label: 'Agreed', color: 'bg-green-100 text-green-800' },
  proposed: { label: 'Proposed', color: 'bg-blue-100 text-blue-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' }
};

export function ContractNegotiation({
  contract,
  currentUserId,
  userRole,
  onUpdateContract,
  onSendMessage,
  onAcceptTerms,
  onRejectContract,
  onRequestLegalReview
}: ContractNegotiationProps) {
  const [editingTerm, setEditingTerm] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [proposedChanges, setProposedChanges] = useState<Record<string, any>>({});

  const currentUser = contract.parties.find(p => p.id === currentUserId);
  const otherParty = contract.parties.find(p => p.id !== currentUserId);

  const StatusIcon = CONTRACT_STATUS_CONFIG[contract.status].icon;

  const handleTermUpdate = (termId: string, newValue: string | number) => {
    const updatedTerms = contract.terms.map(term => {
      if (term.id === termId) {
        return {
          ...term,
          proposedValue: newValue,
          status: 'proposed' as const,
          lastModifiedBy: userRole as 'employer' | 'employee',
          lastModifiedAt: new Date().toISOString()
        };
      }
      return term;
    });

    onUpdateContract({
      terms: updatedTerms,
      status: 'negotiating',
      updatedAt: new Date().toISOString()
    });

    setProposedChanges(prev => ({
      ...prev,
      [termId]: newValue
    }));
  };

  const handleAcceptTerm = (termId: string) => {
    const updatedTerms = contract.terms.map(term => {
      if (term.id === termId && term.proposedValue !== undefined) {
        return {
          ...term,
          value: term.proposedValue,
          proposedValue: undefined,
          status: 'agreed' as const,
          lastModifiedBy: userRole as 'employer' | 'employee',
          lastModifiedAt: new Date().toISOString()
        };
      }
      return term;
    });

    onUpdateContract({
      terms: updatedTerms,
      updatedAt: new Date().toISOString()
    });
  };

  const handleRejectTerm = (termId: string) => {
    const updatedTerms = contract.terms.map(term => {
      if (term.id === termId) {
        return {
          ...term,
          proposedValue: undefined,
          status: 'rejected' as const,
          lastModifiedBy: userRole as 'employer' | 'employee',
          lastModifiedAt: new Date().toISOString()
        };
      }
      return term;
    });

    onUpdateContract({
      terms: updatedTerms,
      updatedAt: new Date().toISOString()
    });
  };

  const sendMessageWithChanges = () => {
    if (!newMessage.trim()) return;

    const changedTerms = Object.keys(proposedChanges);
    onSendMessage(newMessage, changedTerms);
    setNewMessage('');
    setProposedChanges({});
  };

  const allTermsAgreed = contract.terms.every(term => 
    term.status === 'agreed' || !term.required
  );

  const pendingTermsCount = contract.terms.filter(term => 
    term.status === 'proposed' || term.status === 'pending'
  ).length;

  const renderTermInput = (term: ContractTerm) => {
    const isEditing = editingTerm === term.id;
    const displayValue = term.proposedValue !== undefined ? term.proposedValue : term.value;

    if (!isEditing) {
      return (
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <span className={cn(
              "font-medium",
              term.proposedValue !== undefined && "line-through text-gray-500"
            )}>
              {term.type === 'currency' ? `₦${Number(term.value).toLocaleString()}` : String(term.value)}
            </span>
            {term.proposedValue !== undefined && (
              <span className="ml-2 text-blue-600 font-medium">
                → {term.type === 'currency' ? `₦${Number(term.proposedValue).toLocaleString()}` : String(term.proposedValue)}
              </span>
            )}
          </div>
          {term.negotiable && userRole !== 'legal' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingTerm(term.id)}
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
    }

    switch (term.type) {
      case 'currency':
      case 'number':
        return (
          <div className="flex gap-2">
            <Input
              type="number"
              defaultValue={displayValue}
              onBlur={(e) => {
                handleTermUpdate(term.id, Number(e.target.value));
                setEditingTerm(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTermUpdate(term.id, Number(e.currentTarget.value));
                  setEditingTerm(null);
                }
              }}
              autoFocus
            />
            <Button size="sm" onClick={() => setEditingTerm(null)}>✓</Button>
          </div>
        );
      case 'select':
        return (
          <Select
            defaultValue={String(displayValue)}
            onValueChange={(value) => {
              handleTermUpdate(term.id, value);
              setEditingTerm(null);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {term.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'date':
        return (
          <Input
            type="date"
            defaultValue={String(displayValue)}
            onBlur={(e) => {
              handleTermUpdate(term.id, e.target.value);
              setEditingTerm(null);
            }}
            autoFocus
          />
        );
      default:
        return (
          <div className="flex gap-2">
            <Input
              defaultValue={String(displayValue)}
              onBlur={(e) => {
                handleTermUpdate(term.id, e.target.value);
                setEditingTerm(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTermUpdate(term.id, e.currentTarget.value);
                  setEditingTerm(null);
                }
              }}
              autoFocus
            />
            <Button size="sm" onClick={() => setEditingTerm(null)}>✓</Button>
          </div>
        );
    }
  };

  const groupedTerms = contract.terms.reduce((acc, term) => {
    if (!acc[term.section]) {
      acc[term.section] = [];
    }
    acc[term.section].push(term);
    return acc;
  }, {} as Record<string, ContractTerm[]>);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Employment Contract - {contract.jobTitle}
              </CardTitle>
              <p className="text-gray-500 mt-1">Contract ID: {contract.id}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={cn("px-3 py-1", CONTRACT_STATUS_CONFIG[contract.status].color)}>
                <StatusIcon className="w-4 h-4 mr-1" />
                {CONTRACT_STATUS_CONFIG[contract.status].label}
              </Badge>
              {contract.legalReview && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Legal Review: {contract.legalReview.status}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Parties */}
            <div>
              <Label className="text-sm font-medium text-gray-600">Contract Parties</Label>
              <div className="mt-2 space-y-3">
                {contract.parties.map(party => (
                  <div key={party.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={party.avatar} />
                      <AvatarFallback>
                        {party.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{party.name}</p>
                      <p className="text-sm text-gray-500">
                        {party.role === 'employer' ? party.organization : party.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div>
              <Label className="text-sm font-medium text-gray-600">Negotiation Progress</Label>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Terms Agreed</span>
                  <span>{contract.terms.filter(t => t.status === 'agreed').length}/{contract.terms.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(contract.terms.filter(t => t.status === 'agreed').length / contract.terms.length) * 100}%` 
                    }}
                  />
                </div>
                {pendingTermsCount > 0 && (
                  <p className="text-sm text-orange-600">
                    {pendingTermsCount} terms pending review
                  </p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <Label className="text-sm font-medium text-gray-600">Timeline</Label>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span>{new Date(contract.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expires:</span>
                  <span className="text-orange-600">{new Date(contract.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contract Terms */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contract Terms</CardTitle>
            <p className="text-sm text-gray-600">
              Review and negotiate the employment terms below
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={Object.keys(groupedTerms)[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {Object.keys(groupedTerms).map(section => (
                  <TabsTrigger key={section} value={section} className="text-xs">
                    {section}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(groupedTerms).map(([section, terms]) => (
                <TabsContent key={section} value={section} className="space-y-4">
                  {terms.map(term => (
                    <div key={term.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">{term.label}</Label>
                          {term.required && <span className="text-red-500 text-xs">*</span>}
                          {!term.negotiable && (
                            <Badge variant="secondary" className="text-xs">Non-negotiable</Badge>
                          )}
                        </div>
                        <Badge className={cn("text-xs", TERM_STATUS_CONFIG[term.status].color)}>
                          {TERM_STATUS_CONFIG[term.status].label}
                        </Badge>
                      </div>

                      {renderTermInput(term)}

                      {term.proposedValue !== undefined && term.lastModifiedBy !== userRole && (
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptTerm(term.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectTerm(term.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {term.comments && term.comments.length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <p className="font-medium text-gray-600">Comments:</p>
                          {term.comments.map((comment, index) => (
                            <p key={index} className="text-gray-700">{comment}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Communication & Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {allTermsAgreed && userRole !== 'legal' && (
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={onAcceptTerms}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Contract
                </Button>
              )}

              {userRole !== 'legal' && (
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => setShowRejectionModal(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Contract
                </Button>
              )}

              {userRole === 'employer' && !contract.legalReview && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={onRequestLegalReview}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Request Legal Review
                </Button>
              )}

              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Negotiation Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Message History */}
              <div className="max-h-64 overflow-y-auto space-y-3">
                {contract.messages.map(message => {
                  const sender = contract.parties.find(p => p.id === message.senderId);
                  const isCurrentUser = message.senderId === currentUserId;
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2",
                        isCurrentUser ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isCurrentUser && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={sender?.avatar} />
                          <AvatarFallback className="text-xs">
                            {sender?.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-xs p-3 rounded-lg",
                          isCurrentUser 
                            ? "bg-red-600 text-white" 
                            : "bg-gray-100 text-gray-900"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.termChanges && message.termChanges.length > 0 && (
                          <div className="mt-2 text-xs opacity-80">
                            <p>Modified terms: {message.termChanges.join(', ')}</p>
                          </div>
                        )}
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {isCurrentUser && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={sender?.avatar} />
                          <AvatarFallback className="text-xs">
                            {sender?.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Type your message or explain your proposed changes..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={sendMessageWithChanges}
                  disabled={!newMessage.trim()}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contract Versions */}
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contract.versions.map(version => (
                  <div key={version.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">v{version.version}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(version.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-red-600">Reject Contract</CardTitle>
              <p className="text-sm text-gray-600">
                Please provide a reason for rejecting this contract
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Explain why you're rejecting this contract..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    onRejectContract(rejectionReason);
                    setShowRejectionModal(false);
                  }}
                  disabled={!rejectionReason.trim()}
                >
                  Reject Contract
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectionModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ContractNegotiation;
