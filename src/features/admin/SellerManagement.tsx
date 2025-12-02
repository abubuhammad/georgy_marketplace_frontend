import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, XCircle, Clock, AlertTriangle, Building2,
  Search, Filter, RefreshCw, DollarSign, Settings, Eye, Ban
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface Bank {
  id: number;
  name: string;
  code: string;
  slug: string;
}

interface Seller {
  id: string;
  businessName: string;
  businessDescription?: string;
  businessPhone?: string;
  businessAddress?: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  isVerified: boolean;
  paystackSubaccountCode?: string;
  bankAccountNumber?: string;
  bankCode?: string;
  bankName?: string;
  createdAt: string;
  approvedAt?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  _count?: {
    products: number;
  };
}

interface PlatformSettings {
  id: string;
  platformFeePercent: number;
  minPayoutAmount: number;
  payoutFrequency: string;
  updatedAt?: string;
}

interface SellerStats {
  total: number;
  pending: number;
  active: number;
  suspended: number;
  rejected: number;
}

const SellerManagement: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [pendingSellers, setPendingSellers] = useState<Seller[]>([]);
  const [stats, setStats] = useState<SellerStats>({ total: 0, pending: 0, active: 0, suspended: 0, rejected: 0 });
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Approval form state
  const [approvalForm, setApprovalForm] = useState({
    bankCode: '',
    bankAccountNumber: '',
    bankName: '',
    accountName: ''
  });
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    platformFeePercent: 10,
    minPayoutAmount: 1000,
    payoutFrequency: 'weekly'
  });

  useEffect(() => {
    loadData();
  }, [page, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSellers(),
        loadPendingSellers(),
        loadPlatformSettings(),
        loadBanks()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load seller data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSellers = async () => {
    try {
      const response = await apiClient.get<any>(`/admin/sellers?status=${statusFilter}&page=${page}&limit=20`);
      if (response?.success) {
        setSellers(response.data.sellers || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        
        // Calculate stats from all sellers response
        const allSellers = response.data.sellers || [];
        setStats({
          total: response.data.pagination?.total || allSellers.length,
          pending: allSellers.filter((s: Seller) => s.status === 'pending').length,
          active: allSellers.filter((s: Seller) => s.status === 'active').length,
          suspended: allSellers.filter((s: Seller) => s.status === 'suspended').length,
          rejected: allSellers.filter((s: Seller) => s.status === 'rejected').length
        });
      }
    } catch (error) {
      console.error('Error loading sellers:', error);
    }
  };

  const loadPendingSellers = async () => {
    try {
      const response = await apiClient.get<any>('/admin/sellers/pending');
      if (response?.success) {
        setPendingSellers(response.data.sellers || []);
      }
    } catch (error) {
      console.error('Error loading pending sellers:', error);
    }
  };

  const loadPlatformSettings = async () => {
    try {
      const response = await apiClient.get<any>('/admin/platform-settings');
      if (response?.success && response.data) {
        setPlatformSettings(response.data);
        setSettingsForm({
          platformFeePercent: response.data.platformFeePercent || 10,
          minPayoutAmount: response.data.minPayoutAmount || 1000,
          payoutFrequency: response.data.payoutFrequency || 'weekly'
        });
      }
    } catch (error) {
      console.error('Error loading platform settings:', error);
    }
  };

  const loadBanks = async () => {
    try {
      const response = await apiClient.get<any>('/admin/banks');
      if (response?.success && response.data) {
        setBanks(response.data);
      }
    } catch (error) {
      console.error('Error loading banks:', error);
    }
  };

  const verifyBankAccount = async () => {
    if (!approvalForm.bankCode || !approvalForm.bankAccountNumber) {
      toast({
        title: 'Error',
        description: 'Please select a bank and enter account number',
        variant: 'destructive'
      });
      return;
    }

    setVerifyingAccount(true);
    try {
      const response = await apiClient.post<any>('/admin/verify-bank', {
        bankCode: approvalForm.bankCode,
        accountNumber: approvalForm.bankAccountNumber
      });

      if (response?.success && response.data) {
        setApprovalForm(prev => ({
          ...prev,
          accountName: response.data.accountName
        }));
        toast({
          title: 'Account Verified',
          description: `Account name: ${response.data.accountName}`
        });
      } else {
        throw new Error('Failed to verify account');
      }
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Could not verify bank account',
        variant: 'destructive'
      });
    } finally {
      setVerifyingAccount(false);
    }
  };

  const handleApproveSeller = async () => {
    if (!selectedSeller) return;

    if (!approvalForm.bankCode || !approvalForm.bankAccountNumber) {
      toast({
        title: 'Error',
        description: 'Bank details are required for approval',
        variant: 'destructive'
      });
      return;
    }

    try {
      const selectedBank = banks.find(b => b.code === approvalForm.bankCode);
      const response = await apiClient.post<any>(`/admin/sellers/${selectedSeller.id}/approve`, {
        bankCode: approvalForm.bankCode,
        bankAccountNumber: approvalForm.bankAccountNumber,
        bankName: selectedBank?.name || approvalForm.bankName
      });

      if (response?.success) {
        toast({
          title: 'Seller Approved',
          description: `${selectedSeller.businessName} has been approved and subaccount created`
        });
        setApprovalDialogOpen(false);
        setSelectedSeller(null);
        setApprovalForm({ bankCode: '', bankAccountNumber: '', bankName: '', accountName: '' });
        loadData();
      } else {
        throw new Error(response?.error || 'Failed to approve seller');
      }
    } catch (error: any) {
      toast({
        title: 'Approval Failed',
        description: error.message || 'Could not approve seller',
        variant: 'destructive'
      });
    }
  };

  const handleRejectSeller = async () => {
    if (!selectedSeller) return;

    try {
      const response = await apiClient.post<any>(`/admin/sellers/${selectedSeller.id}/reject`, {
        reason: rejectReason
      });

      if (response?.success) {
        toast({
          title: 'Seller Rejected',
          description: `${selectedSeller.businessName} application has been rejected`
        });
        setRejectDialogOpen(false);
        setSelectedSeller(null);
        setRejectReason('');
        loadData();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Could not reject seller',
        variant: 'destructive'
      });
    }
  };

  const handleSuspendSeller = async () => {
    if (!selectedSeller) return;

    try {
      const response = await apiClient.post<any>(`/admin/sellers/${selectedSeller.id}/suspend`, {
        reason: suspendReason
      });

      if (response?.success) {
        toast({
          title: 'Seller Suspended',
          description: `${selectedSeller.businessName} has been suspended`
        });
        setSuspendDialogOpen(false);
        setSelectedSeller(null);
        setSuspendReason('');
        loadData();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Could not suspend seller',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const response = await apiClient.put<any>('/admin/platform-settings', settingsForm);

      if (response?.success) {
        toast({
          title: 'Settings Updated',
          description: 'Platform commission settings have been updated'
        });
        setSettingsDialogOpen(false);
        loadPlatformSettings();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Could not update settings',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      case 'rejected':
        return <Badge className="bg-gray-100 text-gray-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredSellers = sellers.filter(seller => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      seller.businessName.toLowerCase().includes(query) ||
      seller.user.email.toLowerCase().includes(query) ||
      seller.user.firstName.toLowerCase().includes(query) ||
      seller.user.lastName.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Management</h1>
          <p className="text-gray-600 mt-2">Manage seller approvals and platform commission settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setSettingsDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Commission Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sellers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
              </div>
              <Ban className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Commission</p>
                <p className="text-2xl font-bold">{platformSettings?.platformFeePercent || 10}%</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Sellers Alert */}
      {pendingSellers.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{pendingSellers.length} seller{pendingSellers.length > 1 ? 's' : ''}</strong> awaiting approval. 
            Review and approve to enable split payments.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingSellers.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            All Sellers
          </TabsTrigger>
        </TabsList>

        {/* Pending Sellers Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Seller Approvals</CardTitle>
              <CardDescription>
                Review seller applications and approve with bank details for Paystack split payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingSellers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No pending seller approvals</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingSellers.map((seller) => (
                      <TableRow key={seller.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{seller.businessName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{seller.user.firstName} {seller.user.lastName}</TableCell>
                        <TableCell>{seller.user.email}</TableCell>
                        <TableCell>{seller.businessPhone || seller.user.phone || '-'}</TableCell>
                        <TableCell>{new Date(seller.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedSeller(seller);
                                setApprovalDialogOpen(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedSeller(seller);
                                setRejectDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Sellers Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>All Sellers</CardTitle>
                  <CardDescription>Manage all seller accounts</CardDescription>
                </div>
                <div className="flex gap-4">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search sellers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Subaccount</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSellers.map((seller) => (
                    <TableRow key={seller.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{seller.businessName}</p>
                          <p className="text-sm text-gray-500">{seller.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{seller.user.firstName} {seller.user.lastName}</TableCell>
                      <TableCell>{getStatusBadge(seller.status)}</TableCell>
                      <TableCell>{seller._count?.products || 0}</TableCell>
                      <TableCell>
                        {seller.paystackSubaccountCode ? (
                          <Badge variant="outline" className="text-green-600">
                            {seller.paystackSubaccountCode.substring(0, 12)}...
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(seller.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {seller.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedSeller(seller);
                                setSuspendDialogOpen(true);
                              }}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          {seller.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedSeller(seller);
                                  setApprovalDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedSeller(seller);
                                  setRejectDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="py-2 px-4">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Seller</DialogTitle>
            <DialogDescription>
              Enter bank details to create Paystack subaccount for split payments
            </DialogDescription>
          </DialogHeader>
          
          {selectedSeller && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedSeller.businessName}</p>
                <p className="text-sm text-gray-600">{selectedSeller.user.email}</p>
              </div>

              <div className="space-y-2">
                <Label>Bank</Label>
                <Select
                  value={approvalForm.bankCode}
                  onValueChange={(value) => {
                    const bank = banks.find(b => b.code === value);
                    setApprovalForm(prev => ({
                      ...prev,
                      bankCode: value,
                      bankName: bank?.name || '',
                      accountName: ''
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {banks.map((bank) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Account Number</Label>
                <div className="flex gap-2">
                  <Input
                    value={approvalForm.bankAccountNumber}
                    onChange={(e) => setApprovalForm(prev => ({
                      ...prev,
                      bankAccountNumber: e.target.value,
                      accountName: ''
                    }))}
                    placeholder="Enter 10-digit account number"
                    maxLength={10}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={verifyBankAccount}
                    disabled={verifyingAccount || !approvalForm.bankCode || approvalForm.bankAccountNumber.length !== 10}
                  >
                    {verifyingAccount ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              </div>

              {approvalForm.accountName && (
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    Account Name: <strong>{approvalForm.accountName}</strong>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setApprovalDialogOpen(false);
              setApprovalForm({ bankCode: '', bankAccountNumber: '', bankName: '', accountName: '' });
            }}>
              Cancel
            </Button>
            <Button onClick={handleApproveSeller} disabled={!approvalForm.bankCode || !approvalForm.bankAccountNumber}>
              Approve & Create Subaccount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Seller Application</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this seller application
            </DialogDescription>
          </DialogHeader>
          
          {selectedSeller && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedSeller.businessName}</p>
                <p className="text-sm text-gray-600">{selectedSeller.user.email}</p>
              </div>

              <div className="space-y-2">
                <Label>Rejection Reason</Label>
                <Input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRejectDialogOpen(false);
              setRejectReason('');
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectSeller}>
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Seller</DialogTitle>
            <DialogDescription>
              This will suspend the seller and prevent them from receiving payments
            </DialogDescription>
          </DialogHeader>
          
          {selectedSeller && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedSeller.businessName}</p>
                <p className="text-sm text-gray-600">{selectedSeller.user.email}</p>
              </div>

              <div className="space-y-2">
                <Label>Suspension Reason</Label>
                <Input
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Enter reason for suspension"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSuspendDialogOpen(false);
              setSuspendReason('');
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspendSeller}>
              Suspend Seller
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Commission Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Platform Commission Settings</DialogTitle>
            <DialogDescription>
              Configure platform-wide commission rates for split payments
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Platform Commission (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settingsForm.platformFeePercent}
                onChange={(e) => setSettingsForm(prev => ({
                  ...prev,
                  platformFeePercent: parseFloat(e.target.value) || 0
                }))}
              />
              <p className="text-sm text-gray-500">
                Sellers will receive {100 - settingsForm.platformFeePercent}% of each transaction
              </p>
            </div>

            <div className="space-y-2">
              <Label>Minimum Payout Amount (NGN)</Label>
              <Input
                type="number"
                min="100"
                value={settingsForm.minPayoutAmount}
                onChange={(e) => setSettingsForm(prev => ({
                  ...prev,
                  minPayoutAmount: parseInt(e.target.value) || 100
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Payout Frequency</Label>
              <Select
                value={settingsForm.payoutFrequency}
                onValueChange={(value) => setSettingsForm(prev => ({
                  ...prev,
                  payoutFrequency: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Changes will be applied to all active seller subaccounts. Existing transactions are not affected.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSettings}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerManagement;
