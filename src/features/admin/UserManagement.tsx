import React, { useState, useEffect } from 'react';
import { 
  Users, Search, MoreHorizontal, Shield, Ban, 
  CheckCircle, XCircle, Eye, Edit, Trash2, RefreshCw, Loader2,
  Clock, AlertTriangle, UserCheck, UserX
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiClient, ApiResponse } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  isActive: boolean;
  isSuspended: boolean;
  isBanned: boolean;
  accountStatus?: string;
  accountStatusReason?: string;
  lastLoginAt?: string;
  createdAt: string;
  _count?: {
    orders: number;
  };
}

interface PendingAccount {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  accountStatus: string;
  emailVerified: boolean;
  createdAt: string;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<User | PendingAccount | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: ''
  });

  // Pending accounts stats
  const [pendingStats, setPendingStats] = useState({
    accounts: 0,
    properties: 0,
    jobs: 0,
    total: 0
  });

  useEffect(() => {
    loadAllData();
  }, [statusFilter, roleFilter, pagination.page]);

  const loadAllData = async () => {
    await Promise.all([
      loadUsers(),
      loadPendingAccounts(),
      loadModerationStats()
    ]);
  };

  const loadPendingAccounts = async () => {
    try {
      const response = await apiClient.get<any>('/admin/accounts/pending?limit=50');
      if (response?.success && response.data?.accounts) {
        setPendingAccounts(response.data.accounts);
      } else if (response?.data?.accounts) {
        setPendingAccounts(response.data.accounts);
      }
    } catch (err) {
      console.error('Error loading pending accounts:', err);
    }
  };

  const loadModerationStats = async () => {
    try {
      const response = await apiClient.get<any>('/admin/moderation/stats');
      if (response?.success && response.data?.pending) {
        setPendingStats(response.data.pending);
      } else if (response?.data?.pending) {
        setPendingStats(response.data.pending);
      }
    } catch (err) {
      console.error('Error loading moderation stats:', err);
    }
  };

  const loadUsers = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await apiClient.get<UsersResponse | ApiResponse<UsersResponse>>(`/admin/users?${params.toString()}`);
      
      // Handle both response formats: { users, pagination } or { success, data: { users, pagination } }
      let usersData: User[] = [];
      let paginationData = { total: 0, pages: 0 };
      
      if ('success' in response && response.data) {
        // Wrapped format: { success: true, data: { users, pagination } }
        usersData = response.data.users || [];
        paginationData = response.data.pagination || { total: 0, pages: 0 };
      } else if ('users' in response) {
        // Direct format: { users, pagination }
        usersData = response.users || [];
        paginationData = response.pagination || { total: 0, pages: 0 };
      } else {
        throw new Error('Invalid response format');
      }
      
      setUsers(usersData);
      setPagination(prev => ({
        ...prev,
        total: paginationData.total || 0,
        pages: paginationData.pages || 0
      }));
      console.log('✅ Loaded users from API:', usersData.length);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
      // Don't clear users on error - keep showing cached data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadUsers();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getUserStatus = (user: User): 'active' | 'inactive' | 'suspended' | 'banned' => {
    if (user.isBanned) return 'banned';
    if (user.isSuspended) return 'suspended';
    if (!user.isActive) return 'inactive';
    return 'active';
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = !searchTerm || 
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleApproveAccount = async (userId: string) => {
    setActionLoading(true);
    try {
      const response = await apiClient.post<any>(`/admin/accounts/${userId}/approve`, {});
      if (response?.success) {
        toast({
          title: 'Account Approved',
          description: 'User account has been approved successfully'
        });
        await loadAllData();
      } else {
        throw new Error(response?.error || 'Failed to approve account');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve account',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectAccount = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const response = await apiClient.post<any>(`/admin/accounts/${selectedUser.id}/reject`, {
        reason: actionReason
      });
      if (response?.success) {
        toast({
          title: 'Account Rejected',
          description: 'User account has been rejected'
        });
        setRejectDialogOpen(false);
        setSelectedUser(null);
        setActionReason('');
        await loadAllData();
      } else {
        throw new Error(response?.error || 'Failed to reject account');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject account',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendAccount = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const response = await apiClient.post<any>(`/admin/accounts/${selectedUser.id}/suspend`, {
        reason: actionReason
      });
      if (response?.success) {
        toast({
          title: 'Account Suspended',
          description: 'User account has been suspended'
        });
        setSuspendDialogOpen(false);
        setSelectedUser(null);
        setActionReason('');
        await loadAllData();
      } else {
        throw new Error(response?.error || 'Failed to suspend account');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to suspend account',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string, user?: User | PendingAccount) => {
    try {
      let endpoint = '';
      let body: Record<string, unknown> = {};

      switch (action) {
        case 'view':
          if (user) {
            setSelectedUser(user);
            setViewDetailsOpen(true);
          }
          return;
        case 'edit':
          if (user) {
            setSelectedUser(user);
            setEditForm({
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: ('phone' in user ? user.phone : '') || '',
              role: user.role
            });
            setEditUserOpen(true);
          }
          return;
        case 'approve':
          await handleApproveAccount(userId);
          return;
        case 'reject':
          if (user) {
            setSelectedUser(user);
            setRejectDialogOpen(true);
          }
          return;
        case 'suspend':
          if (user) {
            setSelectedUser(user);
            setSuspendDialogOpen(true);
          }
          return;
        case 'activate':
          endpoint = `/admin/users/${userId}/status`;
          body = { isActive: true, isSuspended: false };
          break;
        case 'ban':
          endpoint = `/admin/users/${userId}/status`;
          body = { isBanned: true };
          break;
        case 'unban':
          endpoint = `/admin/users/${userId}/status`;
          body = { isBanned: false };
          break;
        case 'delete':
          if (user) {
            setSelectedUser(user);
            setDeleteDialogOpen(true);
          }
          return;
        default:
          console.log(`Action ${action} not implemented yet`);
          return;
      }

      if (endpoint) {
        const response = await apiClient.put<ApiResponse<unknown>>(endpoint, body);
        if (response.success) {
          toast({
            title: 'Success',
            description: `User ${action} successful`
          });
          await loadAllData();
        } else {
          throw new Error(response.error || `Failed to ${action} user`);
        }
      }
    } catch (error: any) {
      console.error(`Error performing ${action}:`, error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${action} user`,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const response = await apiClient.delete<any>(`/admin/users/${selectedUser.id}`);
      if (response?.success) {
        toast({
          title: 'User Deleted',
          description: 'User has been deleted successfully'
        });
        setDeleteDialogOpen(false);
        setSelectedUser(null);
        await loadAllData();
      } else {
        throw new Error(response?.error || 'Failed to delete user');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const response = await apiClient.put<any>(`/admin/users/${selectedUser.id}`, editForm);
      if (response?.success) {
        toast({
          title: 'User Updated',
          description: 'User information has been updated'
        });
        setEditUserOpen(false);
        setSelectedUser(null);
        await loadAllData();
      } else {
        throw new Error(response?.error || 'Failed to update user');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (user: User) => {
    const status = getUserStatus(user);
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Suspended</Badge>;
      case 'banned':
        return <Badge variant="destructive">Banned</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      seller: 'bg-blue-100 text-blue-800',
      customer: 'bg-gray-100 text-gray-800',
      realtor: 'bg-green-100 text-green-800',
      employer: 'bg-orange-100 text-orange-800',
      employee: 'bg-yellow-100 text-yellow-800',
      delivery: 'bg-indigo-100 text-indigo-800',
      artisan: 'bg-pink-100 text-pink-800'
    };

    return (
      <Badge variant="secondary" className={roleColors[role] || 'bg-gray-100 text-gray-800'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  const getAccountStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'suspended':
        return <Badge className="bg-orange-100 text-orange-800">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage platform users, approvals, and permissions</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => loadAllData()}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <p className="text-red-800">{error}</p>
          <Button variant="outline" size="sm" onClick={() => loadAllData()}>
            Retry
          </Button>
        </div>
      )}

      {/* Pending Approvals Alert */}
      {pendingStats.total > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{pendingStats.total} items</strong> awaiting approval: {pendingStats.accounts} accounts, {pendingStats.properties} properties, {pendingStats.jobs} jobs
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{pagination.total || users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingAccounts.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{users.filter(u => u.isActive && !u.isSuspended).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified Users</p>
                <p className="text-2xl font-bold">{users.filter(u => u.emailVerified).length}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-red-600">{users.filter(u => u.isSuspended || u.isBanned).length}</p>
              </div>
              <Ban className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Approvals ({pendingAccounts.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            All Users
          </TabsTrigger>
        </TabsList>

        {/* Pending Approvals Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Account Approvals</CardTitle>
              <CardDescription>
                Review and approve new user accounts (except customers who are auto-approved)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingAccounts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No pending account approvals</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email Verified</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{account.firstName} {account.lastName}</p>
                            <p className="text-sm text-gray-500">{account.email}</p>
                            {account.phone && <p className="text-sm text-gray-400">{account.phone}</p>}
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(account.role)}</TableCell>
                        <TableCell>
                          {account.emailVerified ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(account.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUserAction(account.id, 'approve', account)}
                              disabled={actionLoading}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUserAction(account.id, 'reject', account)}
                              disabled={actionLoading}
                            >
                              <UserX className="h-4 w-4 mr-1" />
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

        {/* All Users Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Showing {filteredUsers.length} of {pagination.total || users.length} users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="realtor">Realtor</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="artisan">Artisan</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Users Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Account Status</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>
                                  {user.firstName?.[0]}{user.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.firstName} {user.lastName}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>
                            {user.accountStatus ? getAccountStatusBadge(user.accountStatus) : getStatusBadge(user)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {user.emailVerified ? (
                                <CheckCircle className="h-4 w-4 text-green-600" title="Email verified" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-400" title="Email not verified" />
                              )}
                              {user.identityVerified && (
                                <Shield className="h-4 w-4 text-blue-600" title="Identity verified" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {user.lastLoginAt 
                              ? new Date(user.lastLoginAt).toLocaleDateString() 
                              : 'Never'}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, 'view', user)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, 'edit', user)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.accountStatus === 'pending' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleUserAction(user.id, 'approve', user)}>
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Approve Account
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUserAction(user.id, 'reject', user)}>
                                      <UserX className="h-4 w-4 mr-2" />
                                      Reject Account
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                {!user.isSuspended && !user.isBanned ? (
                                  <DropdownMenuItem onClick={() => handleUserAction(user.id, 'suspend', user)}>
                                    <Ban className="h-4 w-4 mr-2" />
                                    Suspend User
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleUserAction(user.id, 'activate')}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activate User
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleUserAction(user.id, 'delete', user)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          {users.length === 0 
                            ? 'No users found in the database.'
                            : 'No users found matching your search criteria.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl">
                    {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="font-medium capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-gray-500">Account Status</p>
                  <p className="font-medium capitalize">{'accountStatus' in selectedUser ? selectedUser.accountStatus : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email Verified</p>
                  <p className="font-medium">{selectedUser.emailVerified ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Registered</p>
                  <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="realtor">Realtor</SelectItem>
                  <SelectItem value="employer">Employer</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="artisan">Artisan</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser} disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Account Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Account</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this account application
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <p className="text-sm text-gray-500 capitalize">{selectedUser.role}</p>
              </div>
              <div className="space-y-2">
                <Label>Rejection Reason</Label>
                <Textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRejectDialogOpen(false);
              setActionReason('');
            }}>Cancel</Button>
            <Button variant="destructive" onClick={handleRejectAccount} disabled={actionLoading}>
              {actionLoading ? 'Rejecting...' : 'Reject Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Account Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Account</DialogTitle>
            <DialogDescription>
              This will suspend the user and prevent them from accessing the platform
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <p className="text-sm text-gray-500 capitalize">{selectedUser.role}</p>
              </div>
              <div className="space-y-2">
                <Label>Suspension Reason</Label>
                <Textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enter reason for suspension..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSuspendDialogOpen(false);
              setActionReason('');
            }}>Cancel</Button>
            <Button variant="destructive" onClick={handleSuspendAccount} disabled={actionLoading}>
              {actionLoading ? 'Suspending...' : 'Suspend Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="font-medium text-red-800">{selectedUser.firstName} {selectedUser.lastName}</p>
              <p className="text-sm text-red-600">{selectedUser.email}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={actionLoading}>
              {actionLoading ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
