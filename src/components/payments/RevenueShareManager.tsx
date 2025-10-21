import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  Users,
  DollarSign,
  Percent,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  PieChart,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RevenueShareScheme, FinancialReport } from '@/types/payment';
import { paymentApiService } from '@/services/paymentService-api';

interface RevenueShareManagerProps {
  sellerId?: string;
  className?: string;
}

interface RevenueShareStats {
  totalRevenue: number;
  platformShare: number;
  sellerShare: number;
  pendingPayouts: number;
  activeSchemes: number;
}

export function RevenueShareManager({ sellerId, className }: RevenueShareManagerProps) {
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<RevenueShareScheme[]>([]);
  const [stats, setStats] = useState<RevenueShareStats | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<RevenueShareScheme | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state for creating/editing schemes
  const [formData, setFormData] = useState({
    tier: 'default',
    rate: 2.5,
    sellerId: sellerId || '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    metadata: {}
  });

  // Load revenue share schemes and stats
  useEffect(() => {
    loadData();
  }, [sellerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schemesData, statsData] = await Promise.all([
        paymentApiService.getRevenueShares(sellerId),
        paymentApiService.getRevenueStats(sellerId)
      ]);
      setSchemes(schemesData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load revenue share data:', error);
      // Fallback data
      setSchemes([
        {
          id: '1',
          tier: 'default',
          rate: 2.5,
          effectiveFrom: '2024-01-01',
          createdBy: 'admin',
          metadata: {}
        },
        {
          id: '2',
          sellerId: 'seller-123',
          tier: 'premium',
          rate: 1.5,
          effectiveFrom: '2024-01-01',
          createdBy: 'admin',
          metadata: {}
        }
      ]);
      setStats({
        totalRevenue: 150000,
        platformShare: 3750,
        sellerShare: 146250,
        pendingPayouts: 25000,
        activeSchemes: 2
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScheme = async () => {
    try {
      setLoading(true);
      const newScheme = await paymentApiService.createRevenueShare(formData);
      setSchemes([...schemes, newScheme]);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create revenue share scheme:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateScheme = async () => {
    if (!selectedScheme) return;

    try {
      setLoading(true);
      const updatedScheme = await paymentApiService.updateRevenueShare(selectedScheme.id, formData);
      setSchemes(schemes.map(s => s.id === selectedScheme.id ? updatedScheme : s));
      setIsEditDialogOpen(false);
      setSelectedScheme(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update revenue share scheme:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScheme = async (schemeId: string) => {
    if (!confirm('Are you sure you want to delete this revenue share scheme?')) return;

    try {
      setLoading(true);
      await paymentApiService.deleteRevenueShare(schemeId);
      setSchemes(schemes.filter(s => s.id !== schemeId));
    } catch (error) {
      console.error('Failed to delete revenue share scheme:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tier: 'default',
      rate: 2.5,
      sellerId: sellerId || '',
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
      metadata: {}
    });
  };

  const openEditDialog = (scheme: RevenueShareScheme) => {
    setSelectedScheme(scheme);
    setFormData({
      tier: scheme.tier,
      rate: scheme.rate,
      sellerId: scheme.sellerId || '',
      effectiveFrom: scheme.effectiveFrom,
      effectiveTo: scheme.effectiveTo || '',
      metadata: scheme.metadata || {}
    });
    setIsEditDialogOpen(true);
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (scheme: RevenueShareScheme) => {
    const now = new Date();
    const effectiveFrom = new Date(scheme.effectiveFrom);
    const effectiveTo = scheme.effectiveTo ? new Date(scheme.effectiveTo) : null;

    if (now < effectiveFrom) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Scheduled</Badge>;
    } else if (effectiveTo && now > effectiveTo) {
      return <Badge variant="secondary" className="bg-red-100 text-red-800">Expired</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    }
  };

  const SchemeForm = ({ onSubmit, title, submitText }: { 
    onSubmit: () => void; 
    title: string; 
    submitText: string; 
  }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tier">Seller Tier</Label>
          <Select value={formData.tier} onValueChange={(value) => setFormData({ ...formData, tier: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="rate">Platform Fee Rate (%)</Label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.rate}
            onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
            placeholder="2.5"
          />
        </div>
      </div>

      {!sellerId && (
        <div>
          <Label htmlFor="sellerId">Seller ID (Optional)</Label>
          <Input
            value={formData.sellerId}
            onChange={(e) => setFormData({ ...formData, sellerId: e.target.value })}
            placeholder="Leave empty for default scheme"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="effectiveFrom">Effective From</Label>
          <Input
            type="date"
            value={formData.effectiveFrom}
            onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="effectiveTo">Effective To (Optional)</Label>
          <Input
            type="date"
            value={formData.effectiveTo}
            onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
          />
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Platform will take {formData.rate}% of each transaction. 
          Seller will receive {(100 - formData.rate).toFixed(1)}% after payment processing fees.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={loading}>
          {loading ? <Clock className="h-4 w-4 animate-spin mr-2" /> : null}
          {submitText}
        </Button>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold">₦{stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Platform Share</p>
                  <p className="text-xl font-bold">₦{stats.platformShare.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Seller Share</p>
                  <p className="text-xl font-bold">₦{stats.sellerShare.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending Payouts</p>
                  <p className="text-xl font-bold">₦{stats.pendingPayouts.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Schemes</p>
                  <p className="text-xl font-bold">{stats.activeSchemes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Share Schemes Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Revenue Share Schemes
            </CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Scheme
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Revenue Share Scheme</DialogTitle>
                </DialogHeader>
                <SchemeForm 
                  onSubmit={handleCreateScheme} 
                  title="Create Scheme" 
                  submitText="Create Scheme" 
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tier</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Effective Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schemes.map((scheme) => (
                  <TableRow key={scheme.id}>
                    <TableCell>
                      <Badge className={getTierBadgeColor(scheme.tier)}>
                        {scheme.tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{scheme.rate}%</TableCell>
                    <TableCell>
                      {scheme.sellerId ? (
                        <span className="text-sm text-gray-600">{scheme.sellerId}</span>
                      ) : (
                        <Badge variant="outline">Default</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(scheme.effectiveFrom).toLocaleDateString()}</div>
                        {scheme.effectiveTo && (
                          <div className="text-gray-500">
                            to {new Date(scheme.effectiveTo).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(scheme)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(scheme)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteScheme(scheme.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {schemes.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <Percent className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No revenue share schemes configured</p>
              <p className="text-sm">Create your first scheme to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Revenue Share Scheme</DialogTitle>
          </DialogHeader>
          <SchemeForm 
            onSubmit={handleUpdateScheme} 
            title="Edit Scheme" 
            submitText="Update Scheme" 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RevenueShareManager;
